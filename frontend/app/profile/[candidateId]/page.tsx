'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Cpu,
  LogOut,
  AlertCircle,
  Play,
  Loader2,
} from 'lucide-react';
import { candidateService } from '@/services/candidateService';
import { useCandidateStore } from '@/stores/candidateStore';
import { useInterviewStore } from '@/stores/interviewStore';
import { interviewService } from '@/services/interviewService';
import { CandidateIdentityCard } from '@/components/profile/CandidateIdentityCard';
import { StatCardsRow } from '@/components/profile/StatCardsRow';
import { SkillProgressSection } from '@/components/profile/SkillProgressSection';
import { ProfileCharts } from '@/components/profile/ProfileCharts';
import { PastInterviewsSection } from '@/components/profile/PastInterviewsSection';

export default function ProfilePage({ params }: { params: Promise<{ candidateId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const candidateId = resolvedParams.candidateId;

  const { activeCandidate, setActiveCandidate } = useCandidateStore();
  const { initSession } = useInterviewStore();
  const [loading, setLoading] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await candidateService.getCandidateById(candidateId);
      setActiveCandidate(data);
      setLoading(false);
    }
    loadData();
  }, [candidateId, setActiveCandidate]);

  const handleStartInterview = async () => {
    if (!activeCandidate) return;
    setIsLaunching(true);
    const sessionId = `sess-${Date.now().toString(36)}`;

    try {
      const response = await interviewService.startInterview(sessionId, activeCandidate);
      initSession(sessionId, response.reply, response.topic);
    } catch (err) {
      console.error('[ProfileHeader] Failed to start interview:', err);
    }

    router.push(`/interview/${sessionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090A] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-gray-400">Loading Candidate Profile...</p>
      </div>
    );
  }

  if (!activeCandidate) {
    return (
      <div className="min-h-screen bg-[#08090A] text-gray-100 flex flex-col items-center justify-center p-6">
        <div className="glass-card p-8 max-w-md w-full text-center space-y-4 border-red-500/20">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Candidate Not Found</h2>
          <p className="text-xs text-gray-400">
            No candidate with ID &quot;<span className="font-mono text-white">{candidateId}</span>&quot; exists in candidates.json.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090A] text-gray-100 flex flex-col">
      {/* Top Navigation Header */}
      <header className="border-b border-white/10 glass-nav px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl bg-[#08090A]/85">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-blue-400 transition-colors">
                InterviewOS
              </span>
              <p className="text-[10px] text-gray-400 font-medium -mt-1">Candidate Intelligence Platform</p>
            </div>
          </Link>

          <div className="h-5 w-px bg-white/10 hidden sm:block" />

          {/* Back to Dashboard Button */}
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>

          {/* Breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 pl-2">
            <span>Candidates</span>
            <span className="text-gray-600">&gt;</span>
            <span className="font-semibold text-white truncate max-w-[150px]">{activeCandidate.member.name}</span>
          </div>
        </div>

        {/* Right: Primary Action & Exit */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={handleStartInterview}
            disabled={isLaunching}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isLaunching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Launching...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-white" />
                <span>Begin Interview</span>
              </>
            )}
          </button>

          <div className="h-5 w-px bg-white/10 hidden sm:block" />

          <Link
            href="/"
            title="Exit Profile"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
        {/* Subtle Ambient Glow Effect */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 blur-3xl rounded-full pointer-events-none -z-10" />

        {/* 1. Candidate Identity Card (includes Begin AI Interview button) */}
        <CandidateIdentityCard candidate={activeCandidate} />

        {/* 2. Past Interview History & Results Links */}
        <PastInterviewsSection
          candidateId={activeCandidate.member.id}
          candidateName={activeCandidate.member.name}
        />

        {/* 3. Key Stat Cards Row */}
        <StatCardsRow candidate={activeCandidate} />

        {/* 4. Missions & Curriculum Progress Section */}
        <SkillProgressSection candidate={activeCandidate} />

        {/* 5. Authentic Mission Analytics & Charts */}
        <ProfileCharts candidate={activeCandidate} />
      </main>
    </div>
  );
}
