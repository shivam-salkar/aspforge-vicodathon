'use client';

import { useInterviewStore } from '@/stores/interviewStore';
import BlurText from '@/components/ui/BlurText';

export function QuestionCard() {
  const { turnCount, maxTurns, currentTopic, difficulty, turns } = useInterviewStore();
  
  // Find the last interviewer turn to display as active question, if available
  const activeQuestion = turns.filter(t => t.role === 'interviewer').pop()?.content || "Waiting for question...";

  return (
    <div className="glass-card p-6 md:p-10 h-full flex flex-col border-white/10 relative overflow-hidden bg-gray-950/60 shadow-2xl">
      {/* Question Progress */}
      <div className="mb-8">
        <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-3">
          Question {turnCount} <span className="text-gray-600">/ {maxTurns}</span>
        </h3>
        <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700 ease-out" 
            style={{ width: `${Math.min(100, Math.max(0, (turnCount / maxTurns) * 100))}%` }}
          />
        </div>
      </div>
      
      {/* Active Question Text with BlurText Character / Word Animation */}
      <div className="flex-1 overflow-y-auto mt-2 pr-4">
        <BlurText
          key={activeQuestion}
          text={activeQuestion}
          delay={200}
          animateBy="words"
          direction="top"
          className="text-xl md:text-3xl font-semibold text-white leading-relaxed tracking-tight"
        />
      </div>
    </div>
  );
}
