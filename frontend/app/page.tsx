'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { ConsoleDemoWindow } from '@/components/ui/ConsoleDemoWindow';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

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
        <div className="w-full max-w-xl glass-card p-6 border-blue-500/25 shadow-2xl shadow-blue-600/10 mb-16">
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

        {/* Visual Animated Interview Console Demo Window */}
        <ConsoleDemoWindow />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-xs text-gray-500">
        <p>© 2026 InterviewOS by AB Talks. Enterprise AI Technical Interview Assistant.</p>
      </footer>
    </div>
  );
}
