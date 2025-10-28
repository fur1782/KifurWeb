export interface QuizDetail {
  id: string
  questions: Questions[]
}

interface Questions {
  question: string
  type: string
  options: string[]
  try_limit: number
}
