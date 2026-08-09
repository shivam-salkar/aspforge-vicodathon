'use client';

import { useRef, useEffect } from 'react';
import { useInterviewStore } from '@/stores/interviewStore';
import BlurText from '@/components/ui/BlurText';
import { Clock, BookOpen, CheckCircle2, XCircle } from 'lucide-react';

export function QuestionCard() {
  const { turnCount, maxTurns, questionTimerSeconds, currentTopic, turns, transientFeedback } = useInterviewStore();
  const followUpRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Find all interviewer turns
  const interviewerTurns = turns.filter((t) => t.role === 'interviewer');
  const activeTurn = interviewerTurns[interviewerTurns.length - 1];

  // Identify if current active turn has a follow-up question
  const isFollowUpActive = Boolean(activeTurn?.isFollowUp && (activeTurn?.followUpQuestion || activeTurn?.content));

  // Main question text, follow-up question text & validation feedback text
  const mainQuestionText = activeTurn?.mainQuestion || (activeTurn?.isFollowUp ? interviewerTurns[interviewerTurns.length - 2]?.content : activeTurn?.content) || 'Waiting for question...';
  const followUpText = activeTurn?.followUpQuestion || (activeTurn?.isFollowUp ? activeTurn.content : '');
  const validationText = activeTurn?.validationText;
  const topicName = activeTurn?.topic || currentTopic || 'Completed Curriculum Topic';

  // Auto-scroll down smooth when follow-up or red feedback generates
  useEffect(() => {
    if ((isFollowUpActive || transientFeedback) && followUpRef.current) {
      const interval = setInterval(() => {
        followUpRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isFollowUpActive, followUpText, transientFeedback]);

  // Format per-question timer
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const cleanMainQuestion = mainQuestionText
    .replace(/^Topic:\s*[^|]+\|\s*Q\d+:\s*/i, '')
    .replace(/(?:Follow-up Question|Follow-up|Follow up Question|Follow up|Followup|Main Question|Question|Probe):/gi, '')
    .replace(/\[(?:Follow-up|Follow up|Question|Probe)\]/gi, '')
    .replace(/\((?:Follow-up|Follow up|Question|Probe)\)/gi, '')
    .replace(/\bFollow-up\b/gi, '')
    .replace(/\bFollow up\b/gi, '')
    .replace(/\bFollowup\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const cleanFollowUp = followUpText
    .replace(/^Topic:\s*[^|]+\|\s*Q\d+:\s*/i, '')
    .replace(/(?:Follow-up Question|Follow-up|Follow up Question|Follow up|Followup|Question|Probe):/gi, '')
    .replace(/\[(?:Follow-up|Follow up|Question|Probe)\]/gi, '')
    .replace(/\((?:Follow-up|Follow up|Question|Probe)\)/gi, '')
    .replace(/\bFollow-up\b/gi, '')
    .replace(/\bFollow up\b/gi, '')
    .replace(/\bFollowup\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

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

      {/* Scrollable Question Container */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 min-h-0">
        {/* Main AI Technical Question */}
        <div>
          <BlurText
            key={cleanMainQuestion}
            text={cleanMainQuestion}
            delay={120}
            animateBy="words"
            direction="top"
            className="text-lg md:text-2xl font-semibold text-white leading-relaxed tracking-tight"
          />
        </div>

        {/* Red Feedback Box for Incorrect Answer directly below main question on the SAME screen */}
        {transientFeedback?.type === 'wrong' && (
          <div ref={followUpRef} className="pt-2 animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 text-rose-400 font-bold bg-rose-950/60 border border-rose-500/40 px-4 py-3 rounded-xl text-sm sm:text-base w-fit shadow-lg shadow-rose-950/60 backdrop-blur-md">
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span className="tracking-tight">{transientFeedback.text}</span>
            </div>
          </div>
        )}

        {/* Follow-up Stage (Green Validation Text + Gradient Line with integrated follow-up text + Question) */}
        {isFollowUpActive && (
          <div ref={followUpRef} className="pt-2 space-y-5 animate-in fade-in duration-500">
            {/* 1. Green Validation Feedback Text ("Correct! Spot-on...", etc.) */}
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-500/30 px-4 py-2.5 rounded-xl text-sm sm:text-base w-fit shadow-lg shadow-emerald-950/50 backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="tracking-tight">{validationText || 'Correct! Spot-on technical answer.'}</span>
            </div>

            {/* 2. Gradient Separation Line with integrated "follow-up" text */}
            <div className="flex items-center gap-3 w-full py-1">
              <div className="h-px flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-transparent animate-line-expand origin-left" />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-950/50 shadow-sm shrink-0">
                follow-up
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-purple-500 via-blue-500 to-transparent animate-line-expand origin-right" />
            </div>

            {/* 3. Generated Follow-Up Question */}
            <div>
              <BlurText
                key={cleanFollowUp}
                text={cleanFollowUp}
                delay={120}
                animateBy="words"
                direction="top"
                className="text-lg md:text-2xl font-semibold text-white leading-relaxed tracking-tight"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
