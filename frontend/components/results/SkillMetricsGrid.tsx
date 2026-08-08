'use client';

import { SkillMetric } from '@/types';
import { Activity } from 'lucide-react';

interface SkillMetricsGridProps {
  metrics: SkillMetric[];
}

export function SkillMetricsGrid({ metrics }: SkillMetricsGridProps) {
  return (
    <div className="glass-card p-6 border-white/10">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
        <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
          <Activity className="w-4 h-4" />
        </span>
        <h3 className="text-base font-extrabold text-white tracking-tight">Skill Metrics</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.name} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
            <span className="text-xs font-semibold text-gray-400 mb-2">{m.name}</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-white font-mono">{m.score}</span>
              <span className="text-[10px] font-bold text-emerald-400 font-mono">/100</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
