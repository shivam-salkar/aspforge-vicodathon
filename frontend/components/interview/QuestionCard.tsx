'use client';

import { useInterviewStore } from '@/stores/interviewStore';
import BlurText from '@/components/ui/BlurText';
import { Clock, BookOpen } from 'lucide-react';

export function QuestionCard() {
  const { turnCount, maxTurns, questionTimerSeconds, currentTopic, turns } = useInterviewStore();

  // Find the last interviewer turn to display as active question & topic
  const activeTurn = turns.filter((t) => t.role === 'interviewer').pop();
  const rawQuestion = activeTurn?.content || 'Waiting for question...';
  const topicName = activeTurn?.topic || currentTopic || 'Completed Curriculum Topic';

  // Format per-question timer
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Strip any legacy Topic: tags if present in string
  const cleanQuestionText = rawQuestion.replace(/^Topic:\s*[^|]+\|\s*Q\d+:\s*/i, '').trim();

  return (
    <div className="glass-card p-6 md:p-8 h-full flex flex-col border-white/10 relative overflow-hidden bg-gray-950/70 shadow-2xl">
      {/* Top Header Row: Question Counter + Per-Question Timer */}
      <div className="mb-4 pb-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-gray-300 text-xs font-bold uppercase tracking-widest">
              Question {turnCount} <span className="text-gray-600">/ {maxTurns}</span>
            </h3>
          </div>
          <div className="h-2 w-48 sm:w-64 bg-gray-900 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, (turnCount / maxTurns) * 100))}%` }}
            />
          </div>
        </div>

        {/* Per-Question Live Timer Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-mono font-bold text-blue-400 self-start sm:self-auto shadow-sm shadow-blue-500/10">
          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Question Timer: {formatTimer(questionTimerSeconds)}</span>
        </div>
      </div>

      {/* Top Topic & Q.no Header Badge */}
      <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-blue-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-tight shadow-md self-start">
        <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <span>Topic: {topicName} • Q{turnCount}</span>
      </div>

      {/* Pure AI Question Text (No topic/Q.no in conversational speech body) */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <BlurText
          key={cleanQuestionText}
          text={cleanQuestionText}
          delay={120}
          animateBy="words"
          direction="top"
          className="text-lg md:text-2xl font-semibold text-white leading-relaxed tracking-tight"
        />
      </div>
    </div>
  );
}
