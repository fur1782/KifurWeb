import { defineStore } from 'pinia'

import { createSocketClient } from '@/api/socketClient'
import type { Question } from '@/modules/student/interfaces'
import {
  classroomService,
  type SendAnswerPayload,
} from '@/modules/student/services/classroom.service'
import type { StudentSessionState } from '../interfaces/student-status.interface'
import type { PuntuationEntry, UserPoolEntry } from '@/modules/common/interfaces'

export const useStudentSessionStore = defineStore('studentSession', {
  state: (): StudentSessionState => ({
    socket: null,
    roomId: null,
    userName: null,
    status: 'idle',
    questions: [],
    currentIndex: 0,
    lastAnswerStatus: null,
    userPool: [],
    puntuation: [],
    error: null,
    answeredQuestions: [],
  }),

  getters: {
    currentQuestion(state): Question | null {
      return state.questions[state.currentIndex] ?? null
    },
  },

  actions: {
    ensureSocket() {
      if (this.socket) return
      const socket = createSocketClient({ namespace: 'student' })

      socket.on('connect_error', (err) => {
        console.error('[Student socket] connect_error', err)
        this.error = "No s'ha pogut connectar amb el servidor."
      })

      socket.on('quiz-started', ({ questions }: { questions: Question[] }) => {
        this.questions = questions
        this.currentIndex = 0
        this.status = 'playing'
        this.answeredQuestions = []
      })

      socket.on(
        'update-puntuation',
        ({
          puntuationSchema,
          userPool,
        }: {
          puntuationSchema: PuntuationEntry[]
          userPool: UserPoolEntry[]
        }) => {
          this.puntuation = puntuationSchema
          this.userPool = userPool
        }
      )

      // Nova gestió: classroom-finished
      socket.on('classroom-finished', () => {
        this.status = 'finished'
      })

      this.socket = socket
    },

    joinClassroom(roomId: string, userName: string) {
      this.ensureSocket()
      this.roomId = roomId
      this.userName = userName
      this.status = 'waiting'
      this.error = null
      this.socket?.emit('join-classroom', { roomId, userName })
    },

    async submitAnswer(answer: string) {
      const question = this.currentQuestion
      if (!question || !this.roomId || !this.userName) return
      try {
        const payload: SendAnswerPayload = {
          qId: question.qId,
          answer,
          userName: this.userName,
        }
        const { answer: status } = await classroomService.sendAnswer(this.roomId, payload)
        this.lastAnswerStatus = status
        if (!this.answeredQuestions.includes(question.qId.toString())) {
          this.answeredQuestions.push(question.qId.toString())
        }
        this.advanceQuestion()
      } catch (error) {
        console.error('[StudentSession] submitAnswer', error)
        this.error = "No s'ha pogut enviar la resposta."
      }
    },

    goToQuestion(index: number) {
      if (!this.questions.length) return
      const maxIndex = this.questions.length - 1
      const target = Math.min(Math.max(index, 0), maxIndex)
      const targetQuestion = this.questions[target]
      if (!targetQuestion) return
      if (
        target !== this.currentIndex &&
        this.answeredQuestions.includes(targetQuestion.qId.toString())
      ) {
        return
      }
      this.currentIndex = target
      if (this.status === 'completed' && target < maxIndex) {
        this.status = 'playing'
      }
    },

    advanceQuestion() {
      if (this.currentIndex + 1 < this.questions.length) {
        this.goToQuestion(this.currentIndex + 1)
      } else {
        this.status = 'completed'
      }
    },

    reset() {
      if (this.socket) {
        this.socket.removeAllListeners()
        this.socket.disconnect()
      }
      this.socket = null
      this.roomId = null
      this.userName = null
      this.status = 'idle'
      this.questions = []
      this.currentIndex = 0
      this.lastAnswerStatus = null
      this.userPool = []
      this.puntuation = []
      this.error = null
      this.answeredQuestions = []
    },
  },
})
