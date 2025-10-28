import { httpClient } from '@/api/httpClient';

export interface SendAnswerPayload {
  qId: number;
  answer: string;
  userName: string;
}

export const classroomService = {
  async sendAnswer(roomId: string, payload: SendAnswerPayload) {
    const { data } = await httpClient.post(`/v1/classroom/${roomId}/answer`, payload);
    return data;
  },
};
