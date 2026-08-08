import { InterviewResult } from '@/types';

export const resultService = {
  async getSessionResult(sessionId: string, candidateName: string = 'Sarah Johnson', jobRole: string = 'Senior Data Engineer'): Promise<InterviewResult> {
    return {
      sessionId,
      candidateName,
      jobRole,
      score: 82,
      tier: 'Strong Performance',
      percentile: 'Top 15% of candidates for this role',
      summary:
        'The candidate demonstrated a solid grasp of core concepts, particularly in architectural design and problem-solving. While communication was clear, some deeper technical explanations lacked nuance. Overall, a highly capable performance indicating readiness for the role.',
      strengths: ['System Design & Scalability', 'Vector DB & RAG Pipelines', 'Logical Problem Solving'],
      gaps: ['Async Memory Overhead', 'Edge Case Failure Recovery'],
      quickStats: {
        totalQuestions: 8,
        timeTaken: '24m 30s',
        followUps: 3,
        topicsCovered: 5,
      },
      domainPerformance: [
        { domain: 'Frontend Development', score: 78 },
        { domain: 'Backend Systems', score: 88 },
        { domain: 'AI Engineering', score: 92 },
        { domain: 'DevOps & Cloud', score: 70 },
      ],
      skillMetrics: [
        { name: 'Technical Knowledge', score: 85 },
        { name: 'Reasoning', score: 88 },
        { name: 'Communication', score: 79 },
        { name: 'Architecture', score: 90 },
        { name: 'Problem Solving', score: 86 },
        { name: 'Confidence', score: 82 },
      ],
    };
  },
};
