'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { resultService } from '@/services/resultService';
import { useCandidateStore } from '@/stores/candidateStore';
import { InterviewResult } from '@/types';
import { ScoreCard } from '@/components/results/ScoreCard';
import { AIVerdictCard } from '@/components/results/AIVerdictCard';
import { DomainPerformance } from '@/components/results/DomainPerformance';
import { SkillMetricsGrid } from '@/components/results/SkillMetricsGrid';
import { CheckCircle2, Clock, MessageSquare, Layers, ArrowLeft, RefreshCw } from 'lucide-react';

export default function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const { activeCandidate } = useCandidateStore();
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      setLoading(true);
      const data = await resultService.getSessionResult(
        sessionId,
        activeCandidate?.member.name || 'Sarah Johnson',
        activeCandidate?.member.jobRole || 'Senior Data Engineer'
      );
      setResult(data);
      setLoading(false);
    }
    loadResults();
  }, [sessionId, activeCandidate]);

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-[#08090A] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-gray-400">Synthesizing Final AI Evaluation & Score Metrics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090A] text-gray-100 flex flex-col relative overflow-hidden">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full space-y-8 relative z-10">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Interview Complete
              </span>
              <span className="text-xs text-gray-400 font-mono">Session ID: {sessionId}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-2">Candidate Evaluation Report</h1>
            <p className="text-xs text-gray-400">Evaluated and benchmarked in real-time by InterviewOS AI Engine.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/profile/${activeCandidate?.member.id || 'CAND-001'}`}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-blue-400" />
              <span>Back to Profile</span>
            </Link>
            <Link
              href={`/profile/${activeCandidate?.member.id || 'CAND-001'}`}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>New Interview</span>
            </Link>
          </div>
        </div>

        {/* 1. Main Score Card */}
        <ScoreCard
          score={result.score}
          tier={result.tier}
          percentile={result.percentile}
          candidateName={result.candidateName}
          jobRole={result.jobRole}
        />

        {/* 2. AI Verdict Card */}
        <AIVerdictCard summary={result.summary} strengths={result.strengths} gaps={result.gaps} />

        {/* 3. Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 border-white/10 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">Questions Answered</p>
              <p className="text-xl font-extrabold text-white font-mono">{result.quickStats.totalQuestions}</p>
            </div>
          </div>

          <div className="glass-card p-5 border-white/10 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">Total Time Taken</p>
              <p className="text-xl font-extrabold text-white font-mono">{result.quickStats.timeTaken}</p>
            </div>
          </div>

          <div className="glass-card p-5 border-white/10 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">Follow-ups Asked</p>
              <p className="text-xl font-extrabold text-white font-mono">{result.quickStats.followUps}</p>
            </div>
          </div>

          <div className="glass-card p-5 border-white/10 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold">Topics Covered</p>
              <p className="text-xl font-extrabold text-white font-mono">{result.quickStats.topicsCovered}</p>
            </div>
          </div>
        </div>

        {/* 4. Domain Performance & Skill Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DomainPerformance domains={result.domainPerformance} />
          <SkillMetricsGrid metrics={result.skillMetrics} />
        </div>
      </main>
    </div>
  );
}
