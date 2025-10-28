export interface Question {
  qId: number
  question: string
  type: 'multiple-answer' | 'text' | 'boolean'
  options?: string[]
  try_limit?: number
}
