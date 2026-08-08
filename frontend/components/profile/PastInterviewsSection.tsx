'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { candidateService } from '@/services/candidateService';
import { InterviewResultData } from '@/types';
import { Calendar, Clock, CheckCircle2, XCircle, ExternalLink, Award, FileText } from 'lucide-react';

interface PastInterviewsSectionProps {
  candidateId: string;
  candidateName: string;
}

export function PastInterviewsSection({ candidateId, candidateName }: PastInterviewsSectionProps) {
  const [interviews, setInterviews] = useState<InterviewResultData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInterviews() {
      setLoading(true);
      const history = await candidateService.getCandidateInterviews(candidateId);
      setInterviews(history);
      setLoading(false);
    }
    loadInterviews();
  }, [candidateId]);

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Aug 8, 2026 • 11:30 PM';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="glass-card p-6 md:p-8 border-white/10 bg-gray-950/70 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-400 font-semibold">Loading past interview history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 md:p-8 border-white/10 bg-gray-950/70 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Interview History & Evaluation Results</h2>
            <p className="text-xs text-gray-400">
              Recorded past interviews for {candidateName}. Click any entry to view full question responses & scores.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/5 border border-white/10 text-purple-300 self-start sm:self-auto">
          {interviews.length} {interviews.length === 1 ? 'Interview Recorded' : 'Interviews Recorded'}
        </span>
      </div>

      {interviews.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-3">
          <FileText className="w-8 h-8 text-gray-600 mx-auto" />
          <p className="text-xs text-gray-400 font-semibold">No past interviews recorded yet for this candidate.</p>
          <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
            Click &quot;Begin AI Interview&quot; above to launch a personalized technical evaluation session.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {interviews.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              {/* Left Column: Date, Time, Session ID & Questions Count */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-white tracking-tight">
                    {formatDate(item.createdAt)}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">({item.sessionId})</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 bg-gray-900 px-2.5 py-1 rounded-lg border border-white/5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {formatSeconds(item.totalTimeSeconds)}
                  </span>

                  <span className="flex items-center gap-1.5 bg-gray-900 px-2.5 py-1 rounded-lg border border-white/5 font-mono">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    {item.totalQuestions} Questions
                  </span>

                  <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-mono font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {item.rightCount} Right
                  </span>

                  <span className="flex items-center gap-1 bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-lg border border-rose-500/20 font-mono font-bold">
                    <XCircle className="w-3.5 h-3.5" />
                    {item.wrongCount} Wrong
                  </span>
                </div>
              </div>

              {/* Right Column: Score Badge & Redirect CTA Button */}
              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-white/10">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Overall Score</span>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-2xl font-black text-white">{item.overallScore}</span>
                    <span className="text-xs text-gray-500">/ 10</span>
                    <span className="ml-1 text-xs font-bold text-blue-400">({item.overallPercentage}%)</span>
                  </div>
                </div>

                <Link
                  href={`/results/${item.sessionId}`}
                  className="px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold flex items-center gap-2 transition-all shadow-md group-hover:scale-105"
                >
                  <span>View Results</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
