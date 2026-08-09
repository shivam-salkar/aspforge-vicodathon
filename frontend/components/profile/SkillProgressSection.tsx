'use client';

import { useState } from 'react';
import { Layers, CheckCircle2, Clock, AlertTriangle, XCircle, Filter } from 'lucide-react';
import { Candidate, Mission } from '@/types';

interface SkillProgressSectionProps {
  candidate: Candidate;
}

type FilterTab = 'all' | 'first-try' | 'retries' | 'skipped';

export function SkillProgressSection({ candidate }: SkillProgressSectionProps) {
  const missions: Mission[] = candidate.missions || [];
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filteredMissions = missions.filter((m) => {
    if (activeTab === 'first-try') return m.passed && m.attempts === 1;
    if (activeTab === 'retries') return m.passed && (m.attempts ?? 1) > 1;
    if (activeTab === 'skipped') return m.skipped || m.passed === false;
    return true;
  });

  const firstTryCount = missions.filter((m) => m.passed && m.attempts === 1).length;
  const retriesCount = missions.filter((m) => m.passed && (m.attempts ?? 1) > 1).length;
  const skippedCount = missions.filter((m) => m.skipped || m.passed === false).length;

  return (
    <div className="glass-card p-6 border-white/10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              className="material-symbols-outlined text-[#c4b5fd] select-none leading-none"
              style={{ fontSize: '48px' }}
            >
              layers
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Missions & Curriculum Progress</h3>
          </div>
          <p className="text-sm font-medium text-gray-300 mt-1">
            Exact cohort mission records for {candidate.member.name} ({missions.length} logged missions).
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-900/90 p-1.5 rounded-xl border border-white/10 self-start sm:self-auto text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({missions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('first-try')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'first-try' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            1st Try ({firstTryCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('retries')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'retries' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Retried ({retriesCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('skipped')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'skipped' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Skipped ({skippedCount})
          </button>
        </div>
      </div>

      {/* Missions Grid */}
      {filteredMissions.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-sm font-medium">
          No missions match the selected status filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredMissions.map((mission, idx) => {
            const isFirstTry = mission.passed && mission.attempts === 1;
            const isRetry = mission.passed && (mission.attempts ?? 1) > 1;
            const isSkipped = mission.skipped;
            const isFailed = mission.passed === false && !mission.skipped;

            return (
              <div
                key={`${mission.day}-${idx}`}
                className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 font-mono text-sm font-bold shrink-0">
                    Day {mission.day}
                  </span>
                  <p className="text-sm sm:text-base font-bold text-white truncate" title={mission.title}>
                    {mission.title}
                  </p>
                </div>

                <div className="shrink-0">
                  {isFirstTry && (
                    <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      1st Try
                    </span>
                  )}
                  {isRetry && (
                    <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {mission.attempts} Attempts
                    </span>
                  )}
                  {isSkipped && (
                    <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Skipped
                    </span>
                  )}
                  {isFailed && (
                    <span className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" />
                      Failed ({mission.attempts} {mission.attempts === 1 ? 'attempt' : 'attempts'})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
