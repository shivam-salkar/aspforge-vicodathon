'use client';

import { Candidate } from '@/types';
import { Shield, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';

interface StatCardsRowProps {
  candidate: Candidate;
}

export function StatCardsRow({ candidate }: StatCardsRowProps) {
  const { signals, missions } = candidate;
  const completedMissions = missions.filter((m) => m.passed).length;
  const totalMissions = missions.length || 31;
  const gapsFound = missions.filter((m) => m.skipped || (m.attempts && m.attempts > 3)).length || 3;

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
          <h3 className="text-2xl font-extrabold text-white">Hard</h3>
          <span className="text-xs font-bold text-emerald-400 flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" /> +1 Tier
          </span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">Targeted for Senior Architecture</p>
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
          <h3 className="text-2xl font-extrabold text-white">94th</h3>
          <span className="text-xs font-bold text-purple-400">Percentile</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">Top tier in cohort benchmark</p>
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
          <h3 className="text-2xl font-extrabold text-white">{completedMissions}/{totalMissions}</h3>
          <span className="text-xs font-bold text-emerald-400">Curriculum</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">{signals.commitDays} Commit Days logged</p>
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
          <h3 className="text-2xl font-extrabold text-white">{gapsFound} Gaps</h3>
          <span className="text-xs font-bold text-amber-400">Identified</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">Priority for adaptive probing</p>
      </div>
    </div>
  );
}
