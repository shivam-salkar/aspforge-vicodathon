'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Terminal, Activity, Layers, Play } from 'lucide-react';

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
          <span className="text-gradient">by AB Talks</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-gray-300 max-w-2xl font-normal leading-relaxed mb-10">
          InterviewOS conducts adaptive technical interviews based on what the candidate has actually learned —
          remembering their answers, probing their reasoning, and adjusting the conversation in real time.
        </p>

        {/* Hero Card: Candidate Verification Input */}
        <div className="w-full max-w-xl glass-card p-6 border-blue-500/25 shadow-2xl shadow-blue-600/10 mb-20">
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

        {/* Live Product Preview Section */}
        <div className="w-full text-left">
          <div className="flex items-center gap-2 mb-6 justify-center sm:justify-start">
            <Terminal className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-extrabold text-white tracking-tight">Live Product Preview</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Interactive AI OS
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Snippet: Live Interview */}
            <div className="glass-card p-6 border-white/10 glass-card-hover space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300">
                    Day 12
                  </span>
                  <span className="text-xs font-bold text-white">System Architecture & Prompt Engineering</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/20 uppercase">
                  Hard Level
                </span>
              </div>

              {/* AI Question */}
              <div className="p-4 rounded-xl bg-gray-900/80 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>InterviewOS AI Question</span>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">
                  "How do you design a zero-downtime schema evolution strategy for vector databases handling 100M+ high-dimensional embeddings?"
                </p>
              </div>

              {/* Sample Candidate Answer */}
              <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Sample Candidate Answer</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed italic">
                  "We use dual-indexing in ChromaDB with asynchronous background re-embedding worker pools and fallback retrieval gates..."
                </p>
              </div>
            </div>

            {/* Right Snippet: Evaluation Metrics */}
            <div className="glass-card p-6 border-white/10 glass-card-hover space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Evaluation Metrics Stream
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">LIVE TELEMETRY</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-gray-300 font-medium">Topic-Shift Indicator</span>
                    <span className="font-bold text-emerald-400">Aligned (Minimal Drift)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-gray-300 font-medium">Difficulty Adjustment</span>
                    <span className="font-bold text-purple-400">Adaptive Upgrade to Senior</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-gray-300 font-medium">Confidence Score</span>
                    <span className="font-extrabold font-mono text-white">94 / 100</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <span>AI Memory Integration</span>
                <span className="font-mono text-blue-400">Breeth Engine Connected</span>
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
