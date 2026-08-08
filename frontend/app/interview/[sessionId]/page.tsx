'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Cpu, Clock, UserCheck } from 'lucide-react';
import { useInterviewStore } from '@/stores/interviewStore';
import { useCandidateStore } from '@/stores/candidateStore';
import { candidateService } from '@/services/candidateService';
import { interviewService } from '@/services/interviewService';
import { TimelineSidebar } from '@/components/interview/TimelineSidebar';
import { ChatPanel } from '@/components/interview/ChatPanel';
import { LiveAssessmentPanel } from '@/components/interview/LiveAssessmentPanel';

export default function InterviewConsolePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;

  const { activeCandidate, setActiveCandidate } = useCandidateStore();
  const { turnCount, maxTurns, elapsedSeconds, tickTimer, initSession, turns } = useInterviewStore();
  const [isInitializing, setIsInitializing] = useState(false);

  // Running Timer
  useEffect(() => {
    const timer = setInterval(() => tickTimer(), 1000);
    return () => clearInterval(timer);
  }, [tickTimer]);

  // Ensure real API session initialization on mount
  useEffect(() => {
    async function initializeEngine() {
      if (turns.length === 0 && !isInitializing) {
        setIsInitializing(true);

        // Ensure active candidate profile exists
        let cand = activeCandidate;
        if (!cand) {
          cand = await candidateService.getCandidateById('CAND-001');
          setActiveCandidate(cand);
        }

        try {
          // Call backend POST /api/interview to initialize Groq + Breeth AI session
          const response = await interviewService.startInterview(sessionId, cand);
          initSession(sessionId, response.reply);
        } catch (err) {
          console.error('[InterviewConsole] Engine initialization error:', err);
          initSession(
            sessionId,
            `Welcome ${cand.member.name}. I am your InterviewOS AI Technical Interviewer. Let's begin by discussing System Architecture & Vector Search: How do you optimize query latency in high-dimensional indexes?`
          );
        } finally {
          setIsInitializing(false);
        }
      }
    }

    initializeEngine();
  }, [sessionId, activeCandidate, setActiveCandidate, initSession, turns.length, isInitializing]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isInitializing || turns.length === 0) {
    return (
      <div className="h-screen bg-[#08090A] flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6" />
        <h2 className="text-lg font-bold tracking-tight">Initializing InterviewOS AI Engine...</h2>
        <p className="text-xs text-gray-400 max-w-md mt-2 leading-relaxed">
          Ingesting candidate profile telemetry into Breeth AI memory store & querying Groq LLM for real personalized technical questions...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#08090A] text-gray-100 flex flex-col overflow-hidden">
      {/* Console Top Header */}
      <header className="glass-nav px-6 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
        {/* Brand & Status */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-sm text-white">InterviewOS</span>
          </Link>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            Live Interview Session
          </span>
        </div>

        {/* Candidate Info & Timer */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Candidate: <strong className="text-white font-bold">{activeCandidate?.member.name || 'Sarah Johnson'}</strong></span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-white">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
            <span>Q:</span>
            <strong className="text-blue-400 font-bold">{turnCount.toString().padStart(2, '0')} / {maxTurns.toString().padStart(2, '0')}</strong>
          </div>
        </div>
      </header>

      {/* 3-Column Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
        {/* Left Column: Timeline Sidebar (3 cols) */}
        <div className="lg:col-span-3 h-full min-h-0 hidden lg:block">
          <TimelineSidebar currentQuestion={turnCount} totalQuestions={maxTurns} />
        </div>

        {/* Center Column: Chat Panel (6 cols) */}
        <div className="lg:col-span-6 h-full min-h-0 flex flex-col">
          <ChatPanel />
        </div>

        {/* Right Column: Live Assessment Panel (3 cols) */}
        <div className="lg:col-span-3 h-full min-h-0 hidden lg:block">
          <LiveAssessmentPanel />
        </div>
      </div>
    </div>
  );
}
