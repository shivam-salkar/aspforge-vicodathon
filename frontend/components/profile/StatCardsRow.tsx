'use client';

import { Candidate } from '@/types';
import { Shield, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';

interface StatCardsRowProps {
  candidate: Candidate;
}

export function StatCardsRow({ candidate }: StatCardsRowProps) {
  const { signals, missions, member } = candidate;

  // 1. Completed missions count out of 31 cohort days
  const completedMissionsCount = signals?.missionsCompleted || missions.filter((m) => m.passed).length || 0;
  const commitDays = signals?.commitDays || 0;
  const firstTryCount = signals?.missionsFirstTry || 0;

  // 2. Identify actual gaps: skipped topics + failed missions + missions requiring >3 attempts
  const gapsFound = missions.filter((m) => m.skipped || !m.passed || (m.attempts && m.attempts > 3)).length;

  // 3. Dynamic percentile calculation based on first-try performance and commit consistency
  const percentile = Math.min(99, Math.max(45, Math.round((firstTryCount / 31) * 75 + (commitDays / 31) * 25)));

  // 4. Interview readiness tier assessment
  const readinessTier =
    member.yearsExperience >= 8 || firstTryCount >= 25
      ? 'Senior Architecture'
      : member.yearsExperience >= 4 || firstTryCount >= 15
      ? 'Mid-Level Systems'
      : 'Foundational AI';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Interview Readiness */}
      <div className="glass-card p-5 glass-card-hover border-blue-500/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400">Interview Readiness</span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <Shield className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-extrabold text-white">{readinessTier.split(' ')[0]}</h3>
          <span className="text-xs font-bold text-emerald-400 flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" /> +1 Tier
          </span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">{readinessTier}</p>
      </div>

      {/* 2. Technical Strength */}
      <div className="glass-card p-5 glass-card-hover border-purple-500/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400">Technical Strength</span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-extrabold text-white">{percentile}th</h3>
          <span className="text-xs font-bold text-purple-400">Percentile</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">{firstTryCount} First-Try Passes</p>
      </div>

      {/* 3. Completed Topics */}
      <div className="glass-card p-5 glass-card-hover border-emerald-500/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400">Completed Topics</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-extrabold text-white">{completedMissionsCount}/31</h3>
          <span className="text-xs font-bold text-emerald-400">Curriculum</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">{commitDays} Commit Days logged</p>
      </div>

      {/* 4. Areas to Explore */}
      <div className="glass-card p-5 glass-card-hover border-amber-500/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400">Areas to Explore</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-extrabold text-white">{gapsFound} {gapsFound === 1 ? 'Gap' : 'Gaps'}</h3>
          <span className="text-xs font-bold text-amber-400">Identified</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">Priority for adaptive probing</p>
      </div>
    </div>
  );
}
