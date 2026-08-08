import { apiClient } from './api';
import { Candidate } from '@/types';

export const mockCandidates: Record<string, Candidate> = {
  'CAND-001': {
    member: {
      id: 'CAND-001',
      name: 'Sarah Johnson',
      jobRole: 'Senior Data Engineer',
      yearsExperience: 9,
      education: 'MS Computer Science',
      status: 'COMPLETED',
    },
    missions: [
      { day: 7, title: 'Embeddings Explained', passed: true, attempts: 1 },
      { day: 8, title: 'Vector Databases Overview', passed: true, attempts: 1 },
      { day: 10, title: 'Retrieval & Matching Engine', passed: true, attempts: 2 },
      { day: 12, title: 'Prompt Engineering Fundamentals', passed: true, attempts: 4 },
      { day: 16, title: 'Chatbot Backend & API Integration', passed: true, attempts: 1 },
      { day: 22, title: 'Multi-Agent Orchestration', passed: true, attempts: 2 },
      { day: 23, title: 'Model Context Protocol (MCP)', passed: true, attempts: 2 },
      { day: 28, title: 'Docker & Kubernetes Deployment', passed: true, attempts: 3 },
      { day: 31, title: 'Capstone Project & Final Demo', passed: true, attempts: 1 },
    ],
    signals: { commitDays: 28, missionsCompleted: 30, missionsFirstTry: 20 },
  },
  'CAND-002': {
    member: {
      id: 'CAND-002',
      name: 'Alex Turner',
      jobRole: 'Backend Software Engineer',
      yearsExperience: 5,
      education: 'B.Tech Computer Science',
      status: 'COMPLETED',
    },
    missions: [
      { day: 7, title: 'Embeddings Explained', passed: true, attempts: 3 },
      { day: 8, title: 'Vector Databases Overview', passed: true, attempts: 2 },
      { day: 10, title: 'Retrieval & Matching Engine', passed: true, attempts: 4 },
      { day: 12, title: 'Prompt Engineering Fundamentals', passed: true, attempts: 5 },
      { day: 16, title: 'Chatbot Backend & API Integration', passed: true, attempts: 1 },
    ],
    signals: { commitDays: 22, missionsCompleted: 29, missionsFirstTry: 10 },
  },
  'CAND-003': {
    member: {
      id: 'CAND-003',
      name: 'Emily Chen',
      jobRole: 'AI Engineer',
      yearsExperience: 6,
      education: 'MS Artificial Intelligence',
      status: 'COMPLETED',
    },
    missions: [
      { day: 7, title: 'Embeddings Explained', passed: true, attempts: 1 },
      { day: 8, title: 'Vector Databases Overview', passed: true, attempts: 1 },
      { day: 10, title: 'Retrieval & Matching Engine', passed: true, attempts: 1 },
      { day: 11, title: 'RAG End-to-End & LLM API Basics', passed: true, attempts: 1 },
      { day: 12, title: 'Prompt Engineering Fundamentals', passed: true, attempts: 1 },
    ],
    signals: { commitDays: 31, missionsCompleted: 31, missionsFirstTry: 30 },
  },
};

export const candidateService = {
  async getCandidateById(candidateId: string): Promise<Candidate> {
    const formattedId = candidateId.toUpperCase().trim();
    try {
      const response = await apiClient.get<Candidate>(`/candidates/${formattedId}`);
      return response.data;
    } catch {
      // Fallback to local mock if server is offline or ID not in DB
      if (mockCandidates[formattedId]) {
        return mockCandidates[formattedId];
      }
      // Generate default candidate for unknown IDs
      return {
        member: {
          id: formattedId,
          name: `Candidate ${formattedId}`,
          jobRole: 'Software Engineer',
          yearsExperience: 4,
          education: 'BS Computer Science',
          status: 'READY',
        },
        missions: [
          { day: 7, title: 'Embeddings Explained', passed: true, attempts: 1 },
          { day: 8, title: 'Vector Databases Overview', passed: true, attempts: 1 },
          { day: 12, title: 'Prompt Engineering', passed: true, attempts: 2 },
          { day: 16, title: 'API Integration', passed: true, attempts: 1 },
        ],
        signals: { commitDays: 20, missionsCompleted: 24, missionsFirstTry: 15 },
      };
    }
  },

  async getAllCandidates(): Promise<Candidate[]> {
    try {
      const response = await apiClient.get<Candidate[]>('/candidates');
      return response.data;
    } catch {
      return Object.values(mockCandidates);
    }
  },
};
