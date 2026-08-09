import { apiClient } from './api';
import { InterviewResultData, RecordedQuestion, TopicTimeAnalysis } from '@/types';
import { useInterviewStore } from '@/stores/interviewStore';

export const resultService = {
  async getSessionResult(
    sessionId: string,
    candidateName: string = 'Sarah Johnson',
    jobRole: string = 'Senior Data Engineer',
    candidateId: string = 'CAND-001'
  ): Promise<InterviewResultData> {
    // 1. Try fetching real recorded result from backend GET /api/interview/:sessionId/results
    try {
      const response = await apiClient.get<InterviewResultData>(`/interview/${sessionId}/results`);
      if (response.data && response.data.questions && response.data.questions.length > 0) {
        return response.data;
      }
    } catch (err) {
      console.warn('[resultService] Backend GET /api/interview/:sessionId/results fallback to client state.');
    }

    // 2. Try fetching from interviewStore state
    const storeState = useInterviewStore.getState();
    const recorded = storeState.recordedQuestions || [];

    if (recorded.length > 0) {
      const totalQuestions = recorded.length;
      const rightCount = recorded.filter((q) => q.isRight).length;
      const wrongCount = recorded.filter((q) => !q.isRight).length;
      const totalTimeSeconds = recorded.reduce((acc, q) => acc + q.timeSpentSeconds, 0);

      const overallScore = Number((recorded.reduce((acc, q) => acc + q.score, 0) / totalQuestions).toFixed(1));
      const overallPercentage = Math.round(overallScore * 10);

      const topicMap = new Map<string, { topic: string; dayNumber?: number; questionCount: number; totalScore: number; totalTimeSeconds: number }>();
      recorded.forEach((q) => {
        const existing = topicMap.get(q.topic) || { topic: q.topic, dayNumber: q.dayNumber, questionCount: 0, totalScore: 0, totalTimeSeconds: 0 };
        existing.questionCount += 1;
        existing.totalScore += q.score;
        existing.totalTimeSeconds += q.timeSpentSeconds;
        topicMap.set(q.topic, existing);
      });

      const topicTimeAnalysis: TopicTimeAnalysis[] = Array.from(topicMap.values()).map((t) => ({
        topic: t.topic,
        dayNumber: t.dayNumber,
        questionCount: t.questionCount,
        avgScore: Number((t.totalScore / t.questionCount).toFixed(1)),
        totalTimeSeconds: t.totalTimeSeconds,
      }));

      const totalEarnedScore = Number(recorded.reduce((acc, q) => acc + q.score, 0).toFixed(1));
      const totalMaxScore = totalQuestions * 10;

      return {
        sessionId,
        candidateId,
        candidateName,
        jobRole,
        overallScore,
        overallPercentage: totalMaxScore > 0 ? Math.round((totalEarnedScore / totalMaxScore) * 100) : 0,
        totalMaxScore,
        totalEarnedScore,
        totalQuestions,
        rightCount,
        wrongCount,
        totalTimeSeconds,
        questions: recorded,
        topicTimeAnalysis,
        summary: `${candidateName} completed a ${totalQuestions}-question technical interview focusing on completed curriculum topics.`,
        strengths: topicTimeAnalysis.filter((t) => t.avgScore > 6.0).map((t) => t.topic),
        gaps: topicTimeAnalysis.filter((t) => t.avgScore <= 6.0).map((t) => t.topic),
      };
    }

    // 3. Fallback for 0 recorded questions (user exited without answering)
    return {
      sessionId,
      candidateId,
      candidateName,
      jobRole,
      overallScore: 0,
      overallPercentage: 0,
      totalMaxScore: 0,
      totalEarnedScore: 0,
      totalQuestions: 0,
      rightCount: 0,
      wrongCount: 0,
      totalTimeSeconds: 0,
      questions: [],
      topicTimeAnalysis: [],
      summary: `${candidateName} exited the interview session before answering any questions.`,
      strengths: [],
      gaps: [],
    };
  },
};
