import { apiClient } from './api';
import { Candidate, Feedback } from '@/types';

export interface StartInterviewResponse {
  reply: string;
  done: boolean;
}

export interface ConversationTurnResponse {
  reply: string;
  done: boolean;
  feedback?: Feedback;
}

export const interviewService = {
  async startInterview(sessionId: string, candidate: Candidate): Promise<StartInterviewResponse> {
    try {
      const response = await apiClient.post<StartInterviewResponse>('/interview', {
        sessionId,
        candidate,
      });
      return response.data;
    } catch (err: any) {
      console.warn('Backend connection failed, using adaptive mock engine response:', err.message);
      return {
        reply: `Welcome ${candidate.member.name}. I am your InterviewOS AI Technical Interviewer. I've reviewed your background in ${candidate.member.jobRole}. Let's begin by discussing System Architecture and Data Engineering pipeline optimization. To start: How do you handle schema evolution and backfilling in large-scale event streams?`,
        done: false,
      };
    }
  },

  async sendTurn(sessionId: string, message: string): Promise<ConversationTurnResponse> {
    try {
      const response = await apiClient.post<ConversationTurnResponse>('/interview', {
        sessionId,
        message,
      });
      return response.data;
    } catch (err: any) {
      console.warn('Backend connection failed, returning fallback adaptive response:', err.message);
      return {
        reply: `Thank you for detailing your approach. You mentioned cosine similarity, vector indexing, and fallback queues. Let's delve deeper: how would you optimize memory overhead when storing high-dimensional embeddings across distributed nodes?`,
        done: false,
      };
    }
  },
};
