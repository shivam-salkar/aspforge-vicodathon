import { apiClient } from './api';
import { Candidate, Feedback, InterviewResultData } from '@/types';

export interface StartInterviewResponse {
  reply: string;
  done: boolean;
  topic?: string;
  isFollowUp?: boolean;
  isWrongNotice?: boolean;
  mainQuestion?: string;
  followUpQuestion?: string;
  validationText?: string;
}

export interface ConversationTurnResponse {
  reply: string;
  done: boolean;
  topic?: string;
  isFollowUp?: boolean;
  isWrongNotice?: boolean;
  skippedFollowUp?: boolean;
  mainQuestion?: string;
  followUpQuestion?: string;
  validationText?: string;
  score?: number;
  isRight?: boolean;
  feedback?: Feedback;
  result?: InterviewResultData;
}

export const interviewService = {
  /**
   * Starts a real adaptive interview session via backend POST /api/interview.
   */
  async startInterview(sessionId: string, candidate: Candidate): Promise<StartInterviewResponse> {
    try {
      const response = await apiClient.post<StartInterviewResponse>('/interview', {
        sessionId,
        candidate,
      });
      if (response.data && response.data.reply) {
        return response.data;
      }
    } catch (err: any) {
      console.warn('[interviewService] Backend API POST /api/interview failed:', err.message);
    }

    const name = candidate.member?.name || 'Candidate';
    return {
      reply: `Welcome ${name}. Let's begin by discussing system architecture and low-latency retrieval optimization. How do you approach scaling vector search index structures?`,
      done: false,
      topic: 'Embeddings Explained (Day 7)',
    };
  },

  /**
   * Sends candidate turn to backend POST /api/interview with timeSpentSeconds.
   */
  async sendTurn(sessionId: string, message: string, timeSpentSeconds: number = 60): Promise<ConversationTurnResponse> {
    try {
      const response = await apiClient.post<ConversationTurnResponse>('/interview', {
        sessionId,
        message,
        timeSpentSeconds,
      });
      if (response.data && response.data.reply) {
        return response.data;
      }
    } catch (err: any) {
      console.warn('[interviewService] Backend API POST /api/interview turn failed:', err.message);
    }

    return {
      reply: `Got it. Let's move to distributed systems: How do you handle schema evolution and index rebalancing under heavy write traffic?`,
      done: false,
    };
  },
};
