'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Brain,
  MessageSquare,
  FileText,
  HelpCircle,
  Bell,
  Settings,
  ShieldCheck,
  Calendar,
  Cpu,
  LogOut,
} from 'lucide-react';
import { candidateService } from '@/services/candidateService';
import { useCandidateStore } from '@/stores/candidateStore';
import { Candidate } from '@/types';
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
    <div className="min-h-screen bg-[#08090A] text-gray-100 flex">
      {/* 1. Left Application Sidebar */}
      <aside className="w-64 border-r border-white/10 glass-nav p-5 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">InterviewOS</span>
              <p className="text-[10px] text-gray-400 font-medium">Candidate Platform</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold text-gray-400">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-colors">
              <LayoutDashboard className="w-4 h-4 text-gray-400" />
              <span>Overview</span>
            </Link>
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-colors">
              <Users className="w-4 h-4 text-gray-400" />
              <span>Candidates</span>
            </Link>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
              <Brain className="w-4 h-4 text-blue-400" />
              <span>Intelligence</span>
            </div>
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-colors">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span>Interviews</span>
            </Link>
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 hover:text-white transition-colors">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Feedback Reports</span>
            </Link>
          </nav>

          <div className="mt-8 pt-6 border-t border-white/10 space-y-1 text-xs font-semibold text-gray-400">
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
              <span>Documentation</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 hover:text-white transition-colors">
              <HelpCircle className="w-4 h-4" />
              <span>Support</span>
            </a>
          </div>
        </div>

        {/* Active Candidate & Schedule Session Anchor */}
        <div className="space-y-4 pt-6 border-t border-white/10">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
              {activeCandidate.member.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{activeCandidate.member.name}</p>
              <p className="text-[10px] text-gray-400 font-mono truncate">{activeCandidate.member.id}</p>
            </div>
          </div>

          <button className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Schedule Session</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="border-b border-white/10 glass-nav px-8 py-4 flex items-center justify-between sticky top-0 z-40">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Candidate</span>
            <span className="text-gray-600">&gt;</span>
            <span className="font-bold text-white">Intelligence Report</span>
          </div>

          {/* Right Header Status & Icons */}
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Analysis Complete
            </span>

            <div className="flex items-center gap-2 border-l border-white/10 pl-4">
              <button className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <Settings className="w-4 h-4" />
              </button>
              <Link href="/" className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Profile Content Body */}
        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* 1. Single Entry Point: Interview Setup Panel */}
          <InterviewSetupPanel />

          {/* 2. Candidate Identity Card */}
          <CandidateIdentityCard candidate={activeCandidate} />

          {/* 3. Stat Cards Row */}
          <StatCardsRow candidate={activeCandidate} />

          {/* 4. Skill Progress Section */}
          <SkillProgressSection candidate={activeCandidate} />

          {/* 5. Topic Distribution & Activity Charts */}
          <ProfileCharts candidate={activeCandidate} />

        </main>
      </div>
    </div>
  );
}
