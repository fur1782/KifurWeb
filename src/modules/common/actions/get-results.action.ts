import { httpClient } from '@/api/httpClient'

export interface ResultReturn {
  roomId: string
  finishedAt: Date
  leaderboard: Leaderboard[]
  questionStats: QuestionStat[]
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

export const getResult = async (roomId: string): Promise<ResultReturn> => {
  const { data } = await httpClient.get(`/v1/classroom/results/${roomId}`)
  return data
}
