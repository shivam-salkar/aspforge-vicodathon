'use client';

import { useInterviewStore } from '@/stores/interviewStore';
import { Activity, CheckSquare, Square, Zap, SlidersHorizontal } from 'lucide-react';

export function LiveAssessmentPanel() {
  const { scores, contextMemory, activeSignals, difficulty, toggleMemoryItem } = useInterviewStore();

  const metrics = [
    { label: 'Technical Knowledge', value: scores.technical, color: 'from-blue-500 to-indigo-500' },
    { label: 'Reasoning & Logic', value: scores.reasoning, color: 'from-purple-500 to-pink-500' },
    { label: 'Communication', value: scores.communication, color: 'from-cyan-500 to-teal-500' },
    { label: 'Confidence & Depth', value: scores.confidence, color: 'from-emerald-500 to-green-500' },
  ];

  return (
    <div className="glass-card p-5 h-full flex flex-col justify-between border-white/10">
      <div className="space-y-6 overflow-y-auto pr-1">
        {/* Header */}
        <div className="pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="text-base font-extrabold text-white">Live Assessment</h3>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Real-time AI telemetry evaluation</p>
        </div>

        {/* 1. Animated Score Progress Bars */}
        <div className="space-y-3.5">
          {metrics.map((m) => (
            <div key={m.label} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-300">{m.label}</span>
                <span className="font-extrabold font-mono text-white">{m.value}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-900 overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-700 ease-out`}
                  style={{ width: `${m.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 2. Context Memory Checklist */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Context Memory
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              {contextMemory.filter((i) => i.referenced).length}/{contextMemory.length} Tracked
            </span>
          </div>

          <div className="space-y-2">
            {contextMemory.map((item, index) => (
              <button
                key={item.concept}
                onClick={() => toggleMemoryItem(index)}
                className="w-full flex items-center gap-2 text-left p-2 rounded-lg hover:bg-white/5 transition-colors text-xs"
              >
                {item.referenced ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-gray-500 shrink-0" />
                )}
                <span className={item.referenced ? 'text-gray-200 font-medium' : 'text-gray-500'}>
                  {item.concept}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Active Signals */}
        <div className="pt-4 border-t border-white/10">
          <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">Active Signals</span>
          <div className="flex flex-wrap gap-2">
            {activeSignals.map((sig) => (
              <span
                key={sig}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20"
              >
                {sig}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Footer Strip */}
      <div className="pt-4 border-t border-white/10 -mx-5 -mb-5 p-4 bg-white/5 flex items-center justify-between text-[11px] text-gray-400">
        <span className="flex items-center gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
          Persona: Evaluator
        </span>
        <span className="font-mono text-emerald-400 font-bold uppercase">{difficulty} Mode</span>
      </div>
    </div>
  );
}
