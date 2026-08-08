'use client';

import { Award, TrendingUp, CheckCircle, Share2, Download } from 'lucide-react';

interface ScoreCardProps {
  score: number;
  tier: string;
  percentile: string;
  candidateName: string;
  jobRole: string;
}

export function ScoreCard({ score, tier, percentile, candidateName, jobRole }: ScoreCardProps) {
  return (
    <div className="glass-card p-8 border-blue-500/20 bg-gradient-to-br from-blue-950/30 via-purple-950/20 to-gray-900/60 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative">
        {/* Left Score Badge & Callout */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-1 shadow-2xl shadow-blue-500/30 flex items-center justify-center">
              <div className="w-full h-full rounded-[22px] bg-gray-950 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-white font-mono">{score}</span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">/ 100</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {tier}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{candidateName}</h1>
            <p className="text-xs font-semibold text-gray-400">{jobRole}</p>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-purple-300 font-medium">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>{percentile}</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-2 transition-all">
            <Share2 className="w-4 h-4 text-blue-400" />
            <span>Share Report</span>
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all">
            <Download className="w-4 h-4 text-cyan-300" />
            <span>Download Report PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
