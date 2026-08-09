'use client';

import { useInterviewStore } from '@/stores/interviewStore';
import BlurText from '@/components/ui/BlurText';
import { Clock, BookOpen, HelpCircle } from 'lucide-react';

function parseQuestionContent(text: string) {
  let main = text;
  let followUp = '';

  if (text.includes('---FOLLOWUP---')) {
    const parts = text.split('---FOLLOWUP---');
    main = parts[0].trim();
    followUp = parts[1].trim().replace(/^Follow-up:\s*/i, '');
  } else if (text.includes('\n---\n')) {
    const parts = text.split('\n---\n');
    main = parts[0].trim();
    followUp = parts[1].trim().replace(/^Follow-up:\s*/i, '');
  } else {
    const lower = text.toLowerCase();
    if (lower.includes('latency') || lower.includes('performance') || lower.includes('speed')) {
      followUp = 'Explain latency impact?';
    } else if (lower.includes('vector') || lower.includes('embedding') || lower.includes('index')) {
      followUp = 'Why vector index?';
    } else if (lower.includes('scale') || lower.includes('throughput') || lower.includes('volume')) {
      followUp = 'What scale threshold?';
    } else if (lower.includes('agent') || lower.includes('mcp') || lower.includes('orchestration')) {
      followUp = 'How handle failures?';
    } else if (lower.includes('docker') || lower.includes('kubernetes') || lower.includes('container')) {
      followUp = 'Why containerize this?';
    } else if (lower.includes('cache') || lower.includes('memory') || lower.includes('redis')) {
      followUp = 'Cache invalidation strategy?';
    } else {
      followUp = 'Key trade-offs involved?';
    }
  }

  return { main, followUp };
}

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
  const { main: mainQuestion, followUp: followUpQuestion } = parseQuestionContent(cleanQuestionText);

  return (
    <div className="glass-card p-6 md:p-8 h-full flex flex-col border-white/10 relative overflow-hidden bg-gray-950/70 shadow-2xl">
      {/* Top Header Row: Question Counter + Per-Question Timer */}
      <div className="mb-4 pb-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
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
      <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/15 via-indigo-500/15 to-blue-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold tracking-tight shadow-md self-start shrink-0">
        <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <span>Topic: {topicName} • Q{turnCount}</span>
      </div>

      {/* Main AI Technical Question */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
        <BlurText
          key={mainQuestion}
          text={mainQuestion}
          delay={120}
          animateBy="words"
          direction="top"
          className="text-lg md:text-2xl font-semibold text-white leading-relaxed tracking-tight"
        />
      </div>

      {/* Partition Line */}
      <div className="my-5 border-t border-white/10 flex items-center gap-3 pt-3 shrink-0">
        <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-extrabold tracking-wider uppercase border border-purple-500/30">
          Follow-up Probe
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-purple-500/40 via-blue-500/30 to-transparent" />
      </div>

      {/* 2-3 Word Follow-up Question Box */}
      <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 shadow-lg shrink-0">
        <div className="flex items-center gap-2.5">
          <HelpCircle className="w-5 h-5 text-purple-400 shrink-0" />
          <span className="text-base md:text-xl font-bold text-purple-200 tracking-tight">
            {followUpQuestion}
          </span>
        </div>
      </div>
    </div>
  );
}
