'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Terminal, Activity, Layers, Bot, User, Zap, TrendingUp } from 'lucide-react';

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

        {/* Sample Interview Console Window (Matching exact design spec screenshot) */}
        <div className="w-full max-w-4xl mx-auto glass-card p-6 md:p-8 border-purple-500/30 bg-[#0B0C10]/95 shadow-2xl shadow-purple-900/20 rounded-3xl overflow-hidden text-left mb-16 relative">
          {/* Subtle ambient purple glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

          {/* Console Header Bar */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block -ml-4.5" />
              <span className="font-bold text-red-500 tracking-widest text-[11px] uppercase">
                LIVE INTERVIEW
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-gray-400 font-semibold tracking-wider">
                DAY 10 - RETRIEVAL
              </span>
              <span className="px-2 py-0.5 rounded border border-red-500/40 bg-red-500/10 text-red-400 font-extrabold uppercase">
                HARD
              </span>
            </div>
          </div>

          {/* Console Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Chat Conversation (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* AI Avatar & Question */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-purple-300 font-mono">
                    ABTalks InterviewOS
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#14161D] border border-white/10 text-gray-200 text-xs font-mono leading-relaxed shadow-inner">
                  Let's discuss the RAG system you built. I noticed in your curriculum you utilized ChromaDB. If the retrieval step starts returning irrelevant context, causing hallucinations, how would you diagnose and fix the embedding pipeline?
                </div>
              </div>

              {/* Candidate Avatar & Answer */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs font-bold text-gray-400 font-mono">
                    Candidate
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-gray-800 text-gray-300 flex items-center justify-center border border-white/10">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#14161D] border border-white/10 text-gray-300 text-xs font-mono leading-relaxed shadow-inner">
                  I'd first check the embedding model to ensure it's still aligned with the domain data. Then, I'd evaluate the chunking strategy—perhaps the chunks are too small, losing semantic context, or too large, diluting the signal.
                </div>
              </div>

              {/* AI Action Indicator */}
              <div className="flex items-center gap-2 pt-3 text-[11px] font-mono text-purple-400/90 animate-pulse">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                <span>Analyzing response... Checking curriculum context...</span>
              </div>
            </div>

            {/* Right Column: Evaluation Metrics (5 Cols) */}
            <div className="lg:col-span-5 space-y-3.5 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-6">
              <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-3">
                Evaluation Metrics
              </h3>

              {/* Topic Shift */}
              <div className="p-3.5 rounded-xl bg-[#14161D] border border-white/10">
                <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                  <span>Topic Shift</span>
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <p className="text-xs font-mono font-bold text-white mt-1">
                  Retrieval Pipeline
                </p>
              </div>

              {/* Difficulty Adjustment */}
              <div className="p-3.5 rounded-xl bg-[#14161D] border border-white/10">
                <p className="text-[11px] text-gray-400 font-mono">
                  Difficulty Adjustment
                </p>
                <p className="text-xs font-mono font-bold text-purple-400 mt-1">
                  Medium → Hard
                </p>
              </div>

              {/* Confidence Score */}
              <div className="p-4 rounded-xl bg-[#14161D] border border-white/10">
                <p className="text-[11px] text-gray-400 font-mono">
                  Confidence Score
                </p>
                <p className="text-2xl font-black font-mono text-white mt-1">
                  78%
                </p>
                <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden mt-2">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[78%]" />
                </div>
              </div>

              {/* Memory Context */}
              <div className="pt-2">
                <p className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Memory Context
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-gray-800/90 border border-white/10 text-gray-200 text-[10px] font-mono font-semibold">
                    ChromaDB
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-gray-800/90 border border-white/10 text-gray-200 text-[10px] font-mono font-semibold">
                    Hybrid search
                  </span>
                </div>
              </div>
            </div>
          </div>
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
