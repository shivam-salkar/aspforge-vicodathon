'use client';

import { Candidate } from '@/types';
import { CheckCircle2, Calendar, Target, AlertCircle } from 'lucide-react';

interface StatCardsRowProps {
  candidate: Candidate;
}

export function StatCardsRow({ candidate }: StatCardsRowProps) {
  const { signals, missions } = candidate;

  // Authentic metrics directly from candidate signals and missions
  const completedMissionsCount = signals?.missionsCompleted ?? missions.filter((m) => m.passed).length;
  const firstTryCount = signals?.missionsFirstTry ?? missions.filter((m) => m.passed && m.attempts === 1).length;
  const commitDays = signals?.commitDays ?? 0;

  const skippedCount = missions.filter((m) => m.skipped).length;
  const multiAttemptCount = missions.filter((m) => m.passed && (m.attempts ?? 1) > 1).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Completed Missions */}
      <div className="glass-card p-5 border-emerald-500/10 hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400">Missions Completed</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-extrabold text-white">{completedMissionsCount}</h3>
          <span className="text-xs font-semibold text-gray-400">Missions</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">Logged in cohort dataset</p>
      </div>

      {/* 2. First-Try Passes */}
      <div className="glass-card p-5 border-blue-500/10 hover:border-blue-500/30 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400">First-Try Passes</span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-extrabold text-white">{firstTryCount}</h3>
          <span className="text-xs font-semibold text-blue-400">Passed Attempt 1</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">First-attempt completion count</p>
      </div>

      {/* 3. Commit Days Logged */}
      <div className="glass-card p-5 border-purple-500/10 hover:border-purple-500/30 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400">Commit Days</span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-extrabold text-white">{commitDays}</h3>
          <span className="text-xs font-semibold text-purple-400">Active Days</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">Recorded activity days</p>
      </div>

      {/* 4. Multi-Attempt / Skipped Missions */}
      <div className="glass-card p-5 border-amber-500/10 hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-400">Skipped & Retries</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-extrabold text-white">{skippedCount + multiAttemptCount}</h3>
          <span className="text-xs font-semibold text-amber-400">Tracked</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">
          {skippedCount} Skipped • {multiAttemptCount} Multi-Attempts
        </p>
      </div>
    </div>
  );
}
