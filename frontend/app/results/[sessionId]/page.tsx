'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { resultService } from '@/services/resultService';
import { useCandidateStore } from '@/stores/candidateStore';
import { InterviewResultData } from '@/types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  ArrowLeft,
  RefreshCw,
  Award,
  BarChart2,
  FileText,
  UserCheck,
} from 'lucide-react';

export default function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const { activeCandidate } = useCandidateStore();
  const [result, setResult] = useState<InterviewResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      setLoading(true);
      const data = await resultService.getSessionResult(
        sessionId,
        activeCandidate?.member.name || 'Sarah Johnson',
        activeCandidate?.member.jobRole || 'Senior Data Engineer',
        activeCandidate?.member.id || 'CAND-001'
      );
      setResult(data);
      setLoading(false);
    }
    loadResults();
  }, [sessionId, activeCandidate]);

  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-[#08090A] flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-gray-400">Compiling Authentic Interview Evaluation Report...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090A] text-gray-100 flex flex-col relative overflow-hidden">
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-8 py-10 w-full space-y-8 relative z-10">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Interview Completed
              </span>
              <span className="text-xs text-gray-400 font-mono">Session ID: {sessionId}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Candidate Evaluation Report
            </h1>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>
                Candidate: <strong className="text-white font-bold">{result.candidateName}</strong> ({result.candidateId})
              </span>
              <span>•</span>
              <span>{result.jobRole}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/profile/${result.candidateId || 'CAND-001'}`}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-blue-400" />
              <span>Back to Profile</span>
            </Link>
            <Link
              href={`/profile/${result.candidateId || 'CAND-001'}`}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Start New Interview</span>
            </Link>
          </div>
        </div>

        {/* 1. Overall Score & Authentic Stats Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Overall Score Card */}
          <div className="glass-card p-6 md:p-8 border-white/10 lg:col-span-2 bg-gradient-to-br from-blue-950/40 via-gray-950 to-purple-950/30 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Overall Score</span>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-5xl md:text-6xl font-black text-white tracking-tight font-mono">
                    {result.overallScore}
                  </span>
                  <span className="text-xl font-bold text-gray-500 font-mono">/ 10</span>
                  <span className="ml-2 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {result.overallPercentage}%
                  </span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Award className="w-8 h-8" />
              </div>
            </div>

            {/* Score Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5 font-medium">
                <span>Performance Score</span>
                <span className="font-mono font-bold text-white">{result.overallScore} / 10.0</span>
              </div>
              <div className="h-3 w-full bg-gray-900 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-1000"
                  style={{ width: `${Math.min(100, Math.max(0, result.overallPercentage))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right vs Wrong Questions Stat Card */}
          <div className="glass-card p-6 border-white/10 bg-gray-950/70 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Answer Outcomes</span>
              <BarChart2 className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Right Answers</span>
                </div>
                <span className="text-xl font-black text-emerald-300 font-mono">{result.rightCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="flex items-center gap-2.5 text-rose-400 font-bold text-sm">
                  <XCircle className="w-4 h-4" />
                  <span>Wrong / Weak</span>
                </div>
                <span className="text-xl font-black text-rose-300 font-mono">{result.wrongCount}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs text-gray-400">
              <span>Threshold: Score &gt; 5.0</span>
              <span className="font-bold text-white font-mono">{result.totalQuestions} Questions</span>
            </div>
          </div>

          {/* Time & Duration Stat Card */}
          <div className="glass-card p-6 border-white/10 bg-gray-950/70 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time Summary</span>
              <Clock className="w-5 h-5 text-purple-400" />
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Total Duration</p>
                <p className="text-3xl font-black text-white font-mono">{formatSeconds(result.totalTimeSeconds)}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Avg Time per Question</p>
                <p className="text-lg font-bold text-purple-300 font-mono">
                  {result.totalQuestions > 0
                    ? formatSeconds(Math.round(result.totalTimeSeconds / result.totalQuestions))
                    : '0s'}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs text-gray-400">
              <span>Topics Covered</span>
              <span className="font-bold text-white font-mono">{result.topicTimeAnalysis.length} Topics</span>
            </div>
          </div>
        </div>

        {/* 2. Topic-wise & Question-wise Time Analysis */}
        <div className="glass-card p-6 md:p-8 border-white/10 bg-gray-950/70 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Topic-wise Time & Score Analysis</h2>
              <p className="text-xs text-gray-400">
                Breakdown of candidate time spent and average score per completed curriculum topic.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.topicTimeAnalysis.map((topicItem, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400 shrink-0" />
                    <h4 className="text-xs font-bold text-white truncate max-w-[200px]" title={topicItem.topic}>
                      {topicItem.topic}
                    </h4>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                      topicItem.avgScore > 5
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {topicItem.avgScore} / 10
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-gray-900/80 border border-white/5">
                    <span className="text-gray-400 block text-[10px]">Questions</span>
                    <span className="font-bold text-white font-mono">{topicItem.questionCount}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-gray-900/80 border border-white/5">
                    <span className="text-gray-400 block text-[10px]">Total Time</span>
                    <span className="font-bold text-purple-300 font-mono">{formatSeconds(topicItem.totalTimeSeconds)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Detailed List of Asked Questions & Candidate Responses */}
        <div className="glass-card p-6 md:p-8 border-white/10 bg-gray-950/70 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Recorded Questions & Responses</h2>
                <p className="text-xs text-gray-400">
                  Full list of technical questions asked, candidate answers, individual scores (0-10), and right/wrong classifications.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-gray-400 font-mono">{result.questions.length} Items</span>
          </div>

          <div className="space-y-6">
            {result.questions.map((q, idx) => (
              <div
                key={idx}
                className={`p-5 md:p-6 rounded-2xl border transition-all ${
                  q.isRight
                    ? 'bg-emerald-950/10 border-emerald-500/20 hover:border-emerald-500/40'
                    : 'bg-rose-950/10 border-rose-500/20 hover:border-rose-500/40'
                }`}
              >
                {/* Header Row: Question Number, Topic, Score Badge, & Right/Wrong Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-400 font-bold font-mono text-xs flex items-center justify-center border border-blue-500/20">
                      Q{q.questionNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="text-xs font-bold text-purple-300">{q.topic}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Time Spent Badge */}
                    <span className="px-3 py-1 rounded-xl bg-gray-900 border border-white/10 text-xs font-mono font-medium text-gray-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{formatSeconds(q.timeSpentSeconds)}</span>
                    </span>

                    {/* Score (0-10) */}
                    <span className="px-3 py-1 rounded-xl bg-gray-900 border border-white/10 text-xs font-mono font-bold text-white">
                      Score: <strong className={q.isRight ? 'text-emerald-400' : 'text-rose-400'}>{q.score}</strong> / 10
                    </span>

                    {/* Right / Wrong Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                        q.isRight
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {q.isRight ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>RIGHT</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>WRONG</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <div className="mb-4">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest block mb-1">
                    Interviewer Question
                  </span>
                  <p className="text-sm md:text-base font-semibold text-white leading-relaxed">
                    {q.question}
                  </p>
                </div>

                {/* Candidate Response */}
                <div className="p-4 rounded-xl bg-gray-900/80 border border-white/5">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                    Candidate Response
                  </span>
                  <p className="text-xs md:text-sm text-gray-200 leading-relaxed font-mono whitespace-pre-wrap">
                    "{q.answer}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
