'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, UserCheck, LogOut } from 'lucide-react';
import { useInterviewStore } from '@/stores/interviewStore';
import { useCandidateStore } from '@/stores/candidateStore';
import { candidateService } from '@/services/candidateService';
import { interviewService } from '@/services/interviewService';
import { QuestionCard } from '@/components/interview/QuestionCard';
import { LiveActionCard } from '@/components/interview/LiveActionCard';
import { WelcomeOverlay } from '@/components/interview/WelcomeOverlay';
import Image from 'next/image';

export default function InterviewConsolePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.sessionId;
  const router = useRouter();

  const { activeCandidate, setActiveCandidate } = useCandidateStore();
  const { turnCount, maxTurns, elapsedSeconds, tickTimer, initSession, turns, setIsCompleted } = useInterviewStore();
  const [isInitializing, setIsInitializing] = useState(false);
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(true);

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

  const handleEndInterview = () => {
    setIsCompleted(true);
    router.push(`/results/${sessionId}`);
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
    <div className="h-screen bg-[#08090A] text-gray-100 flex flex-col overflow-hidden relative">
      {/* Blurred Translucent Overlay for Initial Welcome Briefing */}
      {showWelcomeOverlay && (
        <WelcomeOverlay
          candidate={activeCandidate}
          onContinue={() => setShowWelcomeOverlay(false)}
        />
      )}

      {/* Console Top Header */}
      <header className="glass-nav px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/50 z-10 relative">
        {/* Brand & Status */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/abtalks_logo.png" 
              alt="ABTalks Logo" 
              width={96} 
              height={96}
              className="object-contain rounded-md" 
            />
            <span className="font-extrabold text-sm text-white tracking-widest hidden sm:block">
              AI INTERVIEWER
            </span>
          </Link>
        </div>

        {/* Candidate Info, Timer, & Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-gray-300 bg-gray-900/80 px-3 py-1.5 rounded-full border border-white/5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Candidate: <strong className="text-white font-bold ml-1">{activeCandidate?.member.name || 'Sarah Johnson'}</strong></span>
            <span className="text-gray-500 ml-1">({activeCandidate?.member?.id || 'CAND-001'})</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/20 border border-blue-500/20 text-sm font-mono font-bold text-blue-400">
            <Clock className="w-4 h-4" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

          {/* Action Buttons */}
          <button
            onClick={handleEndInterview}
            className="px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Exit</span>
          </button>
        </div>
      </header>

      {/* 2-Card Main Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 p-4 lg:p-8 min-h-0 overflow-hidden bg-[url('/bg-grid.svg')] bg-cover bg-center">
        {/* Left Column: Question Card */}
        <div className="h-full min-h-0 flex flex-col">
          <QuestionCard />
        </div>

        {/* Right Column: Live Action Card */}
        <div className="h-full min-h-0 flex flex-col">
          <LiveActionCard />
        </div>
      </div>
    </div>
  );
}
