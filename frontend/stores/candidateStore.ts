import { create } from 'zustand';
import { Candidate, InterviewSetupOptions } from '@/types';

interface CandidateState {
  activeCandidate: Candidate | null;
  setupOptions: InterviewSetupOptions;
  setActiveCandidate: (candidate: Candidate | null) => void;
  setSetupOptions: (options: Partial<InterviewSetupOptions>) => void;
}

export const useCandidateStore = create<CandidateState>((set) => ({
  activeCandidate: null,
  setupOptions: {
    role: 'Senior Data Engineer',
    category: 'System Architecture & AI',
    difficulty: 'hard',
    duration: '30 mins',
    focusArea: 'System Design Focus',
  },
  setActiveCandidate: (candidate) => set({ activeCandidate: candidate }),
  setSetupOptions: (options) =>
    set((state) => ({
      setupOptions: { ...state.setupOptions, ...options },
    })),
}));
