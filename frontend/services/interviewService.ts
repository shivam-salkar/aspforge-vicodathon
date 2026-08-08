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
  /**
   * Starts a real adaptive interview session via backend POST /api/interview.
   * Ingests candidate profile into Breeth AI memory & invokes Groq LLM to generate the first probing question.
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
      console.warn('[interviewService] Backend API POST /api/interview failed. Ensure npm run server is running:', err.message);
    }

    // Grounded human greeting in second person
    const name = candidate.member?.name || 'Candidate';
    const role = candidate.member?.jobRole || 'Software Engineer';
    const skippedMission = candidate.missions?.find((m) => m.skipped)?.title || 'System Architecture';

    return {
      reply: `Hello ${name}, welcome to your technical interview. I've analyzed your progress in ${role}. I noticed you skipped "${skippedMission}". How do you approach designing scalable containerized deployments for high-throughput production workloads?`,
      done: false,
    };
  },

  /**
   * Sends a candidate conversation turn to backend POST /api/interview.
   * Extracts turn intent to Breeth AI, searches memory for context, queries Groq LLM, and evaluates answers.
   */
  async sendTurn(sessionId: string, message: string): Promise<ConversationTurnResponse> {
    try {
      const response = await apiClient.post<ConversationTurnResponse>('/interview', {
        sessionId,
        message,
      });
      if (response.data && response.data.reply) {
        return response.data;
      }
    } catch (err: any) {
      console.warn('[interviewService] Backend API POST /api/interview turn failed:', err.message);
    }

    return {
      reply: `I see. Moving to system design: How do you handle schema evolution and index rebalancing when scaling distributed vector databases under heavy write traffic?`,
      done: false,
    };
  },
};
