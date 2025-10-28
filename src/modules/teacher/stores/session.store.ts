import { defineStore } from 'pinia'

import { createSocketClient } from '@/api/socketClient'
import { quizService } from '@/modules/teacher/services/quiz.service'
import type { TeacherSessionState } from '../interfaces'
import type { PuntuationEntry, UserPoolEntry } from '@/modules/common/interfaces'

export const useTeacherSessionStore = defineStore('teacherSession', {
  state: (): TeacherSessionState => ({
    quizzes: [],
    loadingQuizzes: false,
    quizzesError: null,
    currentRoomId: null,
    currentQuizId: null,
    userPool: [],
    puntuation: [],
    sessionError: null,
    socket: null,
    finishedData: null, // dades rebudes de classroom-finished
    status: 'idle',
  }),

  actions: {
    async loadQuizzes() {
      if (this.loadingQuizzes) return
      this.loadingQuizzes = true
      this.quizzesError = null
      try {
        this.quizzes = await quizService.list()
      } catch (error) {
        console.error('[TeacherSession] loadQuizzes', error)
        this.quizzesError = "No s'han pogut carregar els quizzes."
      } finally {
        this.loadingQuizzes = false
      }
    },

    async startSession(quizId: string) {
      this.sessionError = null
      try {
        const { roomId } = await quizService.startClassroom(quizId)
        this.currentRoomId = roomId
        this.currentQuizId = quizId
        this.ensureSocket()
        this.socket?.emit('join-control-room', { roomId })
        this.status = 'playing'
      } catch (error) {
        console.error('[TeacherSession] startSession', error)
        this.sessionError = "No s'ha pogut iniciar la sessió."
      }
    },

    ensureSocket() {
      if (this.socket) return
      const socket = createSocketClient({ namespace: 'teacher' })

      socket.on('connect_error', (err) => {
        console.error('[Teacher socket] connect_error', err)
        this.sessionError = "No s'ha pogut connectar amb el servidor."
      })

      socket.on('user-joined', ({ userPool }: { userPool: UserPoolEntry[] }) => {
        this.userPool = userPool
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
          console.log('Puntuation updated', puntuationSchema, userPool)
          this.puntuation = puntuationSchema
          this.userPool = userPool
        }
      )

      socket.on('classroom-finished', (data) => {
        this.status = 'finished'
        this.finishedData = data
      })

      this.socket = socket
    },

    startQuiz() {
      if (!this.socket || !this.currentRoomId) return
      this.socket.emit('start-quiz', { roomId: this.currentRoomId })
    },

    async resetSession() {
      try {
        if (!this.currentRoomId) return

        const { data } = await quizService.endClassroom(this.currentRoomId)

        if (data) {
          this.cleanSession()
          this.status = 'finished'
          this.finishedData = data
        }
      } catch (error) {
        throw new Error(`Error at finalizing game: ${error}`)
      }
    },

    cleanSession() {
      this.currentRoomId = null
      this.currentQuizId = null
      this.userPool = []
      this.puntuation = []
      this.sessionError = null
      if (this.socket) {
        this.socket.removeAllListeners()
        this.socket.disconnect()
        this.socket = null
      }
    },
  },
})
