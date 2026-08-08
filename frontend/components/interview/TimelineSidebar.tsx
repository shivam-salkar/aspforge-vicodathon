'use client';

import { CheckCircle2, Circle, Clock, ChevronRight } from 'lucide-react';

interface TimelineStep {
  day: string;
  title: string;
  status: 'complete' | 'current' | 'upcoming';
}

const timelineSteps: TimelineStep[] = [
  { day: 'Day 07', title: 'Introduction & Candidate Telemetry', status: 'complete' },
  { day: 'Day 08', title: 'System Architecture & Data Pipelines', status: 'complete' },
  { day: 'Day 12', title: 'Prompt Engineering & Vector DBs', status: 'current' },
  { day: 'Day 16', title: 'API Integration & Streaming', status: 'upcoming' },
  { day: 'Day 22', title: 'Behavioral & Multi-Agent Tradeoffs', status: 'upcoming' },
  { day: 'Final', title: 'Interview Evaluation Wrap-up', status: 'upcoming' },
];

interface TimelineSidebarProps {
  currentQuestion: number;
  totalQuestions: number;
}

export function TimelineSidebar({ currentQuestion, totalQuestions }: TimelineSidebarProps) {
  return (
    <div className="glass-card p-5 h-full flex flex-col justify-between border-white/10">
      <div>
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-white/10">
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">AI-Adaptive Track</span>
          <h3 className="text-base font-extrabold text-white mt-0.5">Interview Timeline</h3>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-gray-400">Progress</span>
            <span className="font-extrabold font-mono text-blue-400">{currentQuestion} / {totalQuestions} Questions</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-gray-900 overflow-hidden mt-2 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {timelineSteps.map((step) => {
            const isComplete = step.status === 'complete';
            const isCurrent = step.status === 'current';

            return (
              <div
                key={step.title}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-blue-500/10 border-blue-500/30 shadow-md shadow-blue-500/10'
                    : isComplete
                    ? 'bg-white/5 border-white/5 opacity-80'
                    : 'bg-transparent border-transparent opacity-40'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 text-blue-400 animate-pulse shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-500 shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-gray-400">{step.day}</span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-500/20 text-blue-400 uppercase">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-white font-bold' : 'text-gray-300'}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-white/10 text-[11px] text-gray-400 flex items-center justify-between">
        <span>Curriculum Version</span>
        <span className="font-mono text-gray-300">v1.1 Adaptive</span>
      </div>
    </div>
  );
}
