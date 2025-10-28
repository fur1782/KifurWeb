import { quizService } from '@/modules/teacher/services/quiz.service';
import type { QuizSummary } from '@/modules/teacher/types';

export const getQuizDataAction = async (): Promise<QuizSummary[]> => {
  return quizService.list();
};
