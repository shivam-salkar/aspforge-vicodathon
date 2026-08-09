'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Candidate } from '@/types';
import { Award, Briefcase, GraduationCap, Hash, UserCheck, Play, Loader2 } from 'lucide-react';
import { useInterviewStore } from '@/stores/interviewStore';
import { interviewService } from '@/services/interviewService';

interface CandidateIdentityCardProps {
  candidate: Candidate;
}

export function CandidateIdentityCard({ candidate }: CandidateIdentityCardProps) {
  const m = candidate.member;
  const router = useRouter();
  const { initSession } = useInterviewStore();
  const [isLaunching, setIsLaunching] = useState(false);

  const handleStartInterview = async () => {
    if (!candidate) return;
    setIsLaunching(true);
    const sessionId = `sess-${Date.now().toString(36)}`;

    try {
      const response = await interviewService.startInterview(sessionId, candidate);
      initSession(sessionId, response.reply);
    } catch (err) {
      console.error('[CandidateIdentityCard] Failed to start interview:', err);
    }

    router.push(`/interview/${sessionId}`);
  };

  return (
    <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
        {/* Avatar - Big Google Material Symbol Icon with no background */}
        <div className="relative shrink-0 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-[#c4b5fd] select-none leading-none"
            style={{ fontSize: '110px' }}
          >
            account_circle
          </span>
        </div>

        {/* Candidate Details */}
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight">{m.name}</h1>
          </div>

          <p className="text-sm font-semibold text-gray-300 flex items-center justify-center sm:justify-start gap-1.5 mb-3">
            <Briefcase className="w-4 h-4 text-blue-400" />
            {m.jobRole}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              {m.yearsExperience} Years Exp
            </span>
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
              {m.education}
            </span>
            <span className="flex items-center gap-1 font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
              <Hash className="w-3 h-3 text-blue-400" />
              {m.id}
            </span>
          </div>
        </div>
      </div>

      {/* Cohort Status Badge & Begin Interview Action */}
      <div className="flex flex-col sm:flex-row md:flex-col items-center md:items-end border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 gap-3 shrink-0">
        <div className="text-center md:text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Cohort Status</span>
          <span className="px-3.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold inline-flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            {m.status}
          </span>
        </div>

        {/* Begin Interview CTA Button */}
        <button
          type="button"
          onClick={handleStartInterview}
          disabled={isLaunching}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {isLaunching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Launching...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current text-white" />
              <span>Begin AI Interview</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
