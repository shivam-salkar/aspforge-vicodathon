'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Sparkles, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import BlurText from '@/components/ui/BlurText';
import { Candidate } from '@/types';

interface WelcomeOverlayProps {
  candidate: Candidate | null;
  onContinue: () => void;
}

export function WelcomeOverlay({ candidate, onContinue }: WelcomeOverlayProps) {
  const [animationCompleted, setAnimationCompleted] = useState(false);

  const welcomeMessage = useMemo(() => {
    if (!candidate) {
      return "Hello Candidate! Welcome to your AI Technical Evaluation. I have ingested your profile telemetry into Breeth AI memory store. I will now evaluate your architecture and engineering skills. Let's begin!";
    }

    const name = candidate.member?.name || 'Candidate';
    const candId = candidate.member?.id || 'CAND-001';
    const role = candidate.member?.jobRole || 'Senior Software Engineer';
    const exp = candidate.member?.yearsExperience ?? 5;
    const edu = candidate.member?.education || 'Computer Science';
    const completed = candidate.signals?.missionsCompleted ?? 24;

    const skippedMission = candidate.missions?.find((m) => m.skipped)?.title;
    const focusContext = skippedMission
      ? `I noticed you skipped "${skippedMission}", so we will focus heavily on trade-offs there.`
      : `You have completed ${completed} missions across distributed systems & scalable architectures.`;

    return `Hello ${name} (ID: ${candId})! Welcome to your AI Technical Evaluation. Based on your profile as a ${role} with ${exp} years of experience in ${edu}, ${focusContext} I will now evaluate your technical skills and production knowledge. Let's get started!`;
  }, [candidate]);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-2xl flex flex-col items-center justify-center p-6 md:p-12 text-center overflow-y-auto animate-in fade-in duration-500">
      <div className="max-w-3xl w-full flex flex-col items-center justify-center space-y-8 my-auto">
        {/* Top Branding Badge */}
        
        {/* AI Greeting Header */}
        <h1 className="text-2xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400 tracking-tight">
          Personalized Technical Evaluation
        </h1>

        {/* Slow BlurText Word-by-Word Animation directly on background */}
        <div className="w-full max-w-2xl min-h-[160px] flex items-center justify-center text-center px-4">
          <BlurText
            text={welcomeMessage}
            delay={100}
            animateBy="words"
            direction="top"
            stepDuration={0.4}
            onAnimationComplete={() => setAnimationCompleted(true)}
            className="text-xl md:text-3xl font-semibold text-white leading-relaxed tracking-tight justify-center"
          />
        </div>

        {/* Action Button to Continue to Main Interview */}
        <div className="pt-4 flex flex-col items-center gap-3">
          <button
            onClick={onContinue}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-base shadow-2xl shadow-blue-600/30 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
          >
            <span>Begin Technical Interview</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <span className="text-xs text-gray-500 font-medium">
            {animationCompleted ? 'Briefing complete • Click to start' : 'Ingesting Breeth AI telemetry & LLM state...'}
          </span>
        </div>
      </div>
    </div>
  );
}
