import { httpClient } from '@/api/httpClient'
import type { QuizDetail, QuizSummary } from '../interfaces'

export interface ClassFinished {
  roomId: string
  finishedAt: Date
  leaderboard: Leaderboard[]
  questionStats: QuestionStat[]
  state: string
}

export interface Leaderboard {
  userId: string
  username: string
  puntuation: number
}

export interface QuestionStat {
  qId: number
  value: number
  correct: number
  incorrect: number
}

export const quizService = {
  async list(): Promise<QuizSummary[]> {
    const { data } = await httpClient.get<QuizSummary[]>('/v1/quizzes/list')
    return data
  },

  async getQuestions(id: string): Promise<QuizDetail> {
    const { data } = await httpClient.get(`/v1/quizzes/${id}/questions`)
    return {
      id,
      questions: data,
    } as QuizDetail
  },

  async startClassroom(quizId: string): Promise<{ roomId: string }> {
    const { data } = await httpClient.get<{ roomId: string }>(`/v1/classroom/start/${quizId}`)
    return data
  },

  async endClassroom(roomId: string): Promise<ClassFinished> {
    const { data } = await httpClient.post<ClassFinished>(`/v1/classroom/${roomId}/end`)
    return data
  },
}
