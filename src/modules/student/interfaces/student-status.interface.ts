import type { Socket } from 'socket.io-client'
import type { Question } from '@/modules/student/interfaces'
import type { PuntuationEntry, SessionStatus, UserPoolEntry } from '@/modules/common/interfaces'

export interface StudentSessionState {
  socket: Socket | null
  roomId: string | null
  userName: string | null
  status: SessionStatus
  questions: Question[]
  currentIndex: number
  lastAnswerStatus: 'correct' | 'incorrect' | null
  userPool: UserPoolEntry[]
  puntuation: PuntuationEntry[]
  error: string | null
  answeredQuestions: string[]
}
