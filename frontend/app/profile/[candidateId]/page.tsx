'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Cpu,
  ShieldCheck,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';
import { candidateService } from '@/services/candidateService';
import { useCandidateStore } from '@/stores/candidateStore';
import { InterviewSetupPanel } from '@/components/profile/InterviewSetupPanel';
import { CandidateIdentityCard } from '@/components/profile/CandidateIdentityCard';
import { StatCardsRow } from '@/components/profile/StatCardsRow';
import { SkillProgressSection } from '@/components/profile/SkillProgressSection';
import { ProfileCharts } from '@/components/profile/ProfileCharts';

export default function ProfilePage({ params }: { params: Promise<{ candidateId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const candidateId = resolvedParams.candidateId;

  const { activeCandidate, setActiveCandidate } = useCandidateStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await candidateService.getCandidateById(candidateId);
      setActiveCandidate(data);
      setLoading(false);
    }
    loadData();
  }, [candidateId, setActiveCandidate]);

  if (loading || !activeCandidate) {
    return (
      <div className="min-h-screen bg-[#08090A] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-gray-400">Loading Candidate Telemetry & Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090A] text-gray-100 flex flex-col">
      {/* Sleek Top Navigation Header (Replacing Left Sidebar) */}
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

        {/* Right: Status & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:flex items-center gap-1.5 shadow-sm shadow-emerald-500/10">
            <ShieldCheck className="w-3.5 h-3.5" />
            Telemetry Ready
          </span>

          <div className="flex items-center gap-1.5 border-l border-white/10 pl-3 sm:pl-4">
            <button
              title="Notifications"
              className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              title="Settings"
              className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            <Link
              href="/"
              title="Exit Profile"
              className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Clean Full-Width Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative">
        {/* Subtle Ambient Glow Effect */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 blur-3xl rounded-full pointer-events-none -z-10" />

        {/* 1. Single Entry Point: Interview Setup Panel */}
        <InterviewSetupPanel />

        {/* 2. Candidate Identity Card */}
        <CandidateIdentityCard candidate={activeCandidate} />

        {/* 3. Key Stat Cards Row */}
        <StatCardsRow candidate={activeCandidate} />

        {/* 4. Skill Progress Section */}
        <SkillProgressSection candidate={activeCandidate} />

        {/* 5. Topic Distribution & Activity Charts */}
        <ProfileCharts candidate={activeCandidate} />
      </main>
    </div>
  );
}

