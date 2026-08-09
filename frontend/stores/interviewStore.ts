import { create } from 'zustand';
import { ConversationTurn, LiveScores, ContextMemoryItem, RecordedQuestion } from '@/types';

interface InterviewState {
  sessionId: string;
  turns: ConversationTurn[];
  recordedQuestions: RecordedQuestion[];
  turnCount: number;
  maxTurns: number;
  currentTopic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  statusText: string;
  isThinking: boolean;
  isCompleted: boolean;
  elapsedSeconds: number;
  questionTimerSeconds: number;
  scores: LiveScores;
  contextMemory: ContextMemoryItem[];
  activeSignals: string[];
  
  // Actions
  initSession: (id: string, initialReply: string, topic?: string) => void;
  addTurn: (turn: ConversationTurn) => void;
  addRecordedQuestion: (recorded: RecordedQuestion) => void;
  setStatusText: (text: string) => void;
  setIsThinking: (thinking: boolean) => void;
  setIsCompleted: (completed: boolean) => void;
  updateScores: (newScores: Partial<LiveScores>) => void;
  toggleMemoryItem: (index: number) => void;
  tickTimer: () => void;
  resetSession: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  sessionId: '',
  turns: [],
  recordedQuestions: [],
  turnCount: 1,
  maxTurns: 8,
  currentTopic: '',
  difficulty: 'medium',
  statusText: 'Interview Engine Active • Listening for candidate input...',
  isThinking: false,
  isCompleted: false,
  elapsedSeconds: 0,
  questionTimerSeconds: 0,
  scores: {
    technical: 84,
    reasoning: 88,
    communication: 79,
    confidence: 85,
  },
  contextMemory: [
    { concept: 'ChromaDB Vector Store', referenced: true },
    { concept: 'Cosine Similarity Thresholds', referenced: true },
    { concept: 'High-Dimensional Embeddings', referenced: true },
    { concept: 'Distributed Rate Limiting', referenced: false },
    { concept: 'Dead Letter Queue (DLQ)', referenced: false },
  ],
  activeSignals: ['Depth: Increasing', 'Difficulty: Adaptive', 'Topic Drift: Minimal'],

  initSession: (id, initialReply, topic) =>
    set({
      sessionId: id,
      turns: [
        {
          role: 'interviewer',
          content: initialReply,
          topic: topic || 'Completed Curriculum Topic',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      currentTopic: topic || 'Completed Curriculum Topic',
      recordedQuestions: [],
      turnCount: 1,
      isCompleted: false,
      elapsedSeconds: 0,
      questionTimerSeconds: 0,
    }),

  addTurn: (turn) =>
    set((state) => ({
      turns: [...state.turns, turn],
      turnCount: turn.role === 'interviewer' ? state.turnCount + 1 : state.turnCount,
      currentTopic: turn.role === 'interviewer' && turn.topic ? turn.topic : state.currentTopic,
      questionTimerSeconds: turn.role === 'interviewer' ? 0 : state.questionTimerSeconds,
    })),

  addRecordedQuestion: (recorded) =>
    set((state) => ({
      recordedQuestions: [...state.recordedQuestions, recorded],
    })),

  setStatusText: (text) => set({ statusText: text }),
  setIsThinking: (thinking) => set({ isThinking: thinking }),
  setIsCompleted: (completed) => set({ isCompleted: completed }),

  updateScores: (newScores) =>
    set((state) => ({
      scores: { ...state.scores, ...newScores },
    })),

  toggleMemoryItem: (index) =>
    set((state) => {
      const updated = [...state.contextMemory];
      if (updated[index]) {
        updated[index] = { ...updated[index], referenced: !updated[index].referenced };
      }
      return { contextMemory: updated };
    }),

  tickTimer: () =>
    set((state) => ({
      elapsedSeconds: state.elapsedSeconds + 1,
      questionTimerSeconds: state.questionTimerSeconds + 1,
    })),

  resetSession: () =>
    set({
      sessionId: '',
      turns: [],
      recordedQuestions: [],
      turnCount: 1,
      isCompleted: false,
      elapsedSeconds: 0,
      questionTimerSeconds: 0,
    }),
}));
