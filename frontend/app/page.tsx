'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { Sparkles, ArrowRight, ShieldCheck, Layers, LogOut, Bot, User, Send } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [candidateIdInput, setCandidateIdInput] = useState('CAND-001');

  const handleVerifyCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateIdInput.trim()) return;
    const formatted = candidateIdInput.trim().toUpperCase();
    router.push(`/profile/${formatted}`);
  };

  return (
    <div className="min-h-screen bg-[#08090A] text-gray-100 flex flex-col relative overflow-hidden">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 pt-16 pb-24 w-full flex flex-col items-center text-center relative z-10">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold mb-6 shadow-lg shadow-blue-500/5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>AI Technical Interviewer • Next.js 15 Platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mb-6">
          The AI-based Interview Platform <br />
          <span className="text-gradient">by AB TALKS</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-gray-300 max-w-2xl font-normal leading-relaxed mb-10">
          ABTalks InterviewOS conducts adaptive technical interviews based on what you've actually learned —
          remembering your answers, probing your reasoning, and adjusting the conversation in real time.
        </p>

        {/* Hero Card: Candidate Verification Input */}
        <div className="w-full max-w-xl glass-card p-6 border-blue-500/25 shadow-2xl shadow-blue-600/10 mb-12">
          <div className="flex items-center gap-2 mb-3 text-left">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Candidate Verification</span>
          </div>

          <form onSubmit={handleVerifyCandidate} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={candidateIdInput}
                onChange={(e) => setCandidateIdInput(e.target.value)}
                placeholder="Enter Candidate ID (e.g. CAND-001)"
                className="w-full glass-input px-4 py-3 text-sm font-semibold uppercase tracking-wider"
              />
              <span className="absolute right-3 top-3 text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                VERIFIED
              </span>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shrink-0"
            >
              <span>Start Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-gray-400 mt-3 text-left">
            Try test candidate IDs: <button type="button" onClick={() => setCandidateIdInput('CAND-001')} className="text-blue-400 font-mono hover:underline font-bold">CAND-001</button> (Sarah Johnson), <button type="button" onClick={() => setCandidateIdInput('CAND-002')} className="text-blue-400 font-mono hover:underline font-bold">CAND-002</button> (Alex Turner), or <button type="button" onClick={() => setCandidateIdInput('CAND-003')} className="text-blue-400 font-mono hover:underline font-bold">CAND-003</button> (Emily Chen).
          </p>
        </div>

        {/* Sample Interview Console Preview Window (Exact design from user screenshot) */}
        <div className="w-full max-w-4xl mx-auto glass-card p-6 md:p-8 border-purple-500/30 bg-[#0B0C10]/95 shadow-2xl shadow-purple-900/20 rounded-3xl overflow-hidden text-left relative">
          {/* Top Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Console Header Bar */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono font-extrabold uppercase text-gray-400 tracking-wider">
                    ACTIVE FOCUS
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                    HARD LEVEL
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Day 12 — System Design & Prompt Engineering
                </h2>
              </div>
            </div>

            <button
              onClick={() => router.push('/profile/CAND-001')}
              className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>End Interview</span>
            </button>
          </div>

          {/* Conversation Chat Stream */}
          <div className="space-y-6 mb-6">
            {/* Q1 AI Question Turn */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white">
                  <Bot className="w-3 h-3" />
                </div>
                <span className="font-bold text-white">InterviewOS AI Engine (Groq + Breeth)</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-500/20 text-blue-300 font-mono font-bold">
                  Q1
                </span>
                <span className="text-[10px] text-gray-500 font-mono">01:08 PM</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#11131A] border border-white/10 text-gray-200 text-xs font-mono leading-relaxed shadow-inner">
                Welcome, Sarah Johnson! I'm your AI interviewer for today's technical assessment. Based on your cohort journey, let's start with a question about Production & Capstone. Can you explain what you understand about this topic and how you applied it during the program?
              </div>
            </div>

            {/* Candidate Answer Turn */}
            <div className="space-y-2 flex flex-col items-end">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="font-bold text-gray-300">Candidate (You)</span>
                <div className="w-5 h-5 rounded-md bg-purple-600 flex items-center justify-center text-white">
                  <User className="w-3 h-3" />
                </div>
                <span className="text-[10px] text-gray-500 font-mono">01:09 PM</span>
              </div>

              <div className="p-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-blue-600/20">
                Production is the way to deploy
              </div>
            </div>

            {/* Q2 AI Follow-up Question Turn */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white">
                  <Bot className="w-3 h-3" />
                </div>
                <span className="font-bold text-white">InterviewOS AI Engine (Groq + Breeth)</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-500/20 text-blue-300 font-mono font-bold">
                  Q2
                </span>
                <span className="text-[10px] text-gray-500 font-mono">01:09 PM</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#11131A] border border-white/10 text-gray-200 text-xs font-mono leading-relaxed shadow-inner">
                Thank you for your answer. Let's move on to the next topic. Regarding LLM Core, Prompting & Fine-Tuning: Can you explain the key concepts and how they were applied in your cohort work?
              </div>
            </div>
          </div>

          {/* Console Input Footer Box */}
          <div className="pt-4 border-t border-white/10">
            <div className="relative bg-[#11131A] rounded-2xl border border-white/10 p-4">
              <textarea
                placeholder="Type your technical response here (e.g. explain architecture, tradeoffs, schemas)..."
                rows={3}
                readOnly
                className="w-full bg-transparent text-xs text-gray-400 placeholder-gray-500 focus:outline-none resize-none"
              />

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => router.push('/profile/CAND-001')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-xs text-gray-500">
        <p>© 2026 InterviewOS by AB Talks. Enterprise AI Technical Interview Assistant.</p>
      </footer>
    </div>
  );
}
