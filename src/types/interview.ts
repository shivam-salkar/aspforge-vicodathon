/**
 * InterviewOS — Core type definitions for the adaptive interview engine.
 */

// ─── Candidate & Curriculum Data ─────────────────────────────────────────────

export interface Mission {
  day: number;
  title: string;
  passed?: boolean;
  skipped?: boolean;
  attempts?: number;
}

export interface CandidateSignals {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
}

export interface CandidateMember {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
}

export interface Candidate {
  member: CandidateMember;
  missions: Mission[];
  signals: CandidateSignals;
}

export interface CurriculumModule {
  n: number;
  title: string;
  days: number[];
}

export interface CurriculumDay {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
}

export interface Curriculum {
  cohort: string;
  modules: CurriculumModule[];
  days: CurriculumDay[];
}

// ─── Session State ───────────────────────────────────────────────────────────

export interface ConversationTurn {
  role: 'interviewer' | 'candidate';
  content: string;
  topic?: string;
  timestamp: string;
}

export interface InterviewSession {
  sessionId: string;
  candidate: Candidate;
  turns: ConversationTurn[];
  turnCount: number;
  topicsCovered: Set<string>;
  currentTopic: string;
  weakAreas: string[];
  strongAreas: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
}

// ─── API Request / Response Contract ─────────────────────────────────────────

export interface InterviewApiRequest {
  sessionId: string;
  candidate?: Candidate;
  message?: string;
}

export interface Feedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

export interface InterviewApiResponse {
  reply: string;
  done: boolean;
  feedback?: Feedback;
}
