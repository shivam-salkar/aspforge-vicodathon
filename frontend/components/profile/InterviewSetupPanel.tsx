'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Sparkles, Sliders, ShieldCheck, Clock } from 'lucide-react';
import { useCandidateStore } from '@/stores/candidateStore';
import { useInterviewStore } from '@/stores/interviewStore';
import { interviewService } from '@/services/interviewService';

export function InterviewSetupPanel() {
  const router = useRouter();
  const { activeCandidate, setupOptions, setSetupOptions } = useCandidateStore();
  const { initSession } = useInterviewStore();
  const [isLaunching, setIsLaunching] = useState(false);

  const handleStartInterview = async () => {
    if (!activeCandidate) return;
    setIsLaunching(true);
    const sessionId = `sess-${Date.now().toString(36)}`;
    
    // Initialize interview with backend API
    const response = await interviewService.startInterview(sessionId, activeCandidate);
    initSession(sessionId, response.reply);
    
    // Redirect directly to live console
    router.push(`/interview/${sessionId}`);
  };

  return (
    <div className="glass-card p-6 border-blue-500/20 bg-gradient-to-r from-blue-950/20 via-purple-950/10 to-gray-900/40 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <Sliders className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Interview Setup</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Single Entrypoint
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Configure your target technical parameters and launch the live console immediately.</p>
        </div>

        {/* Recommended Focus Area Badge */}
        <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2 self-start sm:self-auto">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <div className="text-left">
            <p className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">AI Recommended Focus</p>
            <p className="text-xs font-semibold text-white">{setupOptions.focusArea}</p>
          </div>
        </div>
      </div>

      {/* Form Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Role Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Target Role</label>
          <select
            value={setupOptions.role}
            onChange={(e) => setSetupOptions({ role: e.target.value })}
            className="w-full glass-input px-3.5 py-2.5 text-xs font-semibold bg-gray-900/80 cursor-pointer"
          >
            <option value="Senior Data Engineer">Senior Data Engineer</option>
            <option value="Backend Software Engineer">Backend Software Engineer</option>
            <option value="AI / ML Engineer">AI / ML Engineer</option>
            <option value="Full Stack Architect">Full Stack Architect</option>
          </select>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Focus Category</label>
          <select
            value={setupOptions.category}
            onChange={(e) => setSetupOptions({ category: e.target.value })}
            className="w-full glass-input px-3.5 py-2.5 text-xs font-semibold bg-gray-900/80 cursor-pointer"
          >
            <option value="System Architecture & AI">System Architecture & AI</option>
            <option value="Vector DB & Retrieval">Vector DB & Retrieval</option>
            <option value="Prompt Engineering">Prompt Engineering</option>
            <option value="Multi-Agent Orchestration">Multi-Agent Orchestration</option>
          </select>
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Adaptive Difficulty</label>
          <select
            value={setupOptions.difficulty}
            onChange={(e) => setSetupOptions({ difficulty: e.target.value as any })}
            className="w-full glass-input px-3.5 py-2.5 text-xs font-semibold bg-gray-900/80 cursor-pointer"
          >
            <option value="easy">Easy — Foundations</option>
            <option value="medium">Medium — Intermediate</option>
            <option value="hard">Hard — Senior Level</option>
          </select>
        </div>

        {/* Duration Selection */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Estimated Duration</label>
          <div className="relative">
            <select
              value={setupOptions.duration}
              onChange={(e) => setSetupOptions({ duration: e.target.value })}
              className="w-full glass-input px-3.5 py-2.5 text-xs font-semibold bg-gray-900/80 cursor-pointer pr-8"
            >
              <option value="20 mins">20 Mins (Quick Assessment)</option>
              <option value="30 mins">30 Mins (Standard)</option>
              <option value="45 mins">45 Mins (Comprehensive)</option>
            </select>
            <Clock className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex justify-end">
        <button
          onClick={handleStartInterview}
          disabled={isLaunching}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          {isLaunching ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Preparing Interview Environment...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-white" />
              <span>Start Interview Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
