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
          <span className="text-sm font-bold text-gray-300">Missions Completed</span>
          <span
            className="material-symbols-outlined text-[#c4b5fd] select-none leading-none"
            style={{ fontSize: '48px' }}
          >
            task_alt
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">{completedMissionsCount}</h3>
          <span className="text-sm font-bold text-gray-400">Missions</span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-gray-400 mt-1.5">Logged in cohort dataset</p>
      </div>

      {/* 2. First-Try Passes */}
      <div className="glass-card p-5 border-blue-500/10 hover:border-blue-500/30 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-300">First-Try Passes</span>
          <span
            className="material-symbols-outlined text-[#c4b5fd] select-none leading-none"
            style={{ fontSize: '48px' }}
          >
            verified
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">{firstTryCount}</h3>
          <span className="text-sm font-bold text-blue-400">Passed Attempt 1</span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-gray-400 mt-1.5">First-attempt completion count</p>
      </div>

      {/* 3. Commit Days Logged */}
      <div className="glass-card p-5 border-purple-500/10 hover:border-purple-500/30 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-300">Commit Days</span>
          <span
            className="material-symbols-outlined text-[#c4b5fd] select-none leading-none"
            style={{ fontSize: '48px' }}
          >
            calendar_today
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">{commitDays}</h3>
          <span className="text-sm font-bold text-purple-400">Active Days</span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-gray-400 mt-1.5">Recorded activity days</p>
      </div>

      {/* 4. Multi-Attempt / Skipped Missions */}
      <div className="glass-card p-5 border-amber-500/10 hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-gray-300">Skipped & Retries</span>
          <span
            className="material-symbols-outlined text-[#c4b5fd] select-none leading-none"
            style={{ fontSize: '48px' }}
          >
            warning
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">{skippedCount + multiAttemptCount}</h3>
          <span className="text-sm font-bold text-amber-400">Tracked</span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-gray-400 mt-1.5">
          {skippedCount} Skipped • {multiAttemptCount} Multi-Attempts
        </p>
      </div>
    </div>
  );
}
