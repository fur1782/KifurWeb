import type { Socket } from 'socket.io-client'
import type { QuizSummary } from '@/modules/teacher/interfaces'
import type { UserPoolEntry, PuntuationEntry, SessionStatus } from '@/modules/common/interfaces'

export interface TeacherSessionState {
  quizzes: QuizSummary[]
  loadingQuizzes: boolean
  quizzesError: string | null
  currentRoomId: string | null
  currentQuizId: string | null
  userPool: UserPoolEntry[]
  puntuation: PuntuationEntry[]
  sessionError: string | null
  socket: Socket | null
  finishedData: any | null
  status: SessionStatus
}
