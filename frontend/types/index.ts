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

export interface InterviewSetupOptions {
  role: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: string;
  focusArea: string;
}

export interface ConversationTurn {
  role: 'interviewer' | 'candidate';
  content: string;
  topic?: string;
  timestamp: string;
}

export interface LiveScores {
  technical: number;
  reasoning: number;
  communication: number;
  confidence: number;
}

export interface ContextMemoryItem {
  concept: string;
  referenced: boolean;
}

export interface InterviewSession {
  sessionId: string;
  candidate: Candidate;
  turns: ConversationTurn[];
  turnCount: number;
  currentTopic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  statusText: string;
  isThinking: boolean;
  done: boolean;
  scores: LiveScores;
  contextMemory: ContextMemoryItem[];
  activeSignals: string[];
}

export interface DomainPerformance {
  domain: string;
  score: number;
}

export interface SkillMetric {
  name: string;
  score: number;
}

export interface Feedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

export interface InterviewResult {
  sessionId: string;
  candidateName: string;
  jobRole: string;
  score: number;
  tier: string;
  percentile: string;
  summary: string;
  strengths: string[];
  gaps: string[];
  quickStats: {
    totalQuestions: number;
    timeTaken: string;
    followUps: number;
    topicsCovered: number;
  };
  domainPerformance: DomainPerformance[];
  skillMetrics: SkillMetric[];
}
