'use client';

import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface AIVerdictCardProps {
  summary: string;
  strengths: string[];
  gaps: string[];
}

export function AIVerdictCard({ summary, strengths, gaps }: AIVerdictCardProps) {
  return (
    <div className="glass-card p-6 border-purple-500/20 bg-gradient-to-r from-purple-950/20 to-blue-950/10">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
        <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
          <Sparkles className="w-4 h-4" />
        </span>
        <h3 className="text-base font-extrabold text-white tracking-tight">AI Interview Verdict</h3>
      </div>

      {/* Quote Block */}
      <blockquote className="text-sm font-medium text-gray-200 leading-relaxed italic border-l-2 border-purple-500 pl-4 py-1 mb-6">
        "{summary}"
      </blockquote>

      {/* Strengths & Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            Key Technical Strengths
          </span>
          <div className="flex flex-wrap gap-2">
            {strengths.map((s) => (
              <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <AlertCircle className="w-4 h-4" />
            Areas for Refinement
          </span>
          <div className="flex flex-wrap gap-2">
            {gaps.map((g) => (
              <span key={g} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
