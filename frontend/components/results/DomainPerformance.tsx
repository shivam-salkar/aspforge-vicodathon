'use client';

import { DomainPerformance as DomainType } from '@/types';
import { Layers } from 'lucide-react';

interface DomainPerformanceProps {
  domains: DomainType[];
}

export function DomainPerformance({ domains }: DomainPerformanceProps) {
  return (
    <div className="glass-card p-6 border-white/10">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/10">
        <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
          <Layers className="w-4 h-4" />
        </span>
        <h3 className="text-base font-extrabold text-white tracking-tight">Domain Performance Breakdown</h3>
      </div>

      <div className="space-y-5">
        {domains.map((d) => (
          <div key={d.domain} className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-white">{d.domain}</span>
              <span className="font-extrabold font-mono text-blue-400">{d.score}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-gray-900 overflow-hidden border border-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 transition-all duration-700"
                style={{ width: `${d.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
