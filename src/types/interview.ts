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
  timeSpentSeconds?: number;
}

export interface RecordedQuestion {
  questionNumber: number;
  topic: string;
  dayNumber?: number;
  question: string;
  answer: string;
  timeSpentSeconds: number;
  score: number; // 0-10 scale
  isRight: boolean; // score > 5
}

export interface TopicTimeAnalysis {
  topic: string;
  dayNumber?: number;
  questionCount: number;
  avgScore: number;
  totalTimeSeconds: number;
}

export interface InterviewResultData {
  sessionId: string;
  candidateId: string;
  candidateName: string;
  jobRole: string;
  createdAt?: string;
  overallScore: number; // 0-10 scale
  overallPercentage: number;
  totalQuestions: number;
  rightCount: number;
  wrongCount: number;
  totalTimeSeconds: number;
  questions: RecordedQuestion[];
  topicTimeAnalysis: TopicTimeAnalysis[];
  summary?: string;
  strengths?: string[];
  gaps?: string[];
  next?: string[];
}

export interface InterviewSession {
  sessionId: string;
  candidate: Candidate;
  turns: ConversationTurn[];
  recordedQuestions: RecordedQuestion[];
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
  timeSpentSeconds?: number;
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
  topic?: string;
  score?: number;
  isRight?: boolean;
  feedback?: Feedback;
  result?: InterviewResultData;
}
