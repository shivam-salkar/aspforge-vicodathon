'use client';

import { useState, useEffect } from 'react';
import { TypewriterText } from './TypewriterText';
import { Layers, Bot, User, Send, LogOut, Terminal, Play } from 'lucide-react';

const demoScript = [
  {
    role: 'ai',
    qNum: 'Q1',
    time: '01:08 PM',
    text: "Welcome, Sarah Johnson! I'm your AI interviewer for today's technical assessment. Based on your cohort journey, let's start with a question about Production & Capstone. Can you explain what you understand about this topic and how you applied it during the program?",
  },
  {
    role: 'candidate',
    time: '01:09 PM',
    text: 'Production is the way to deploy',
  },
  {
    role: 'ai',
    qNum: 'Q2',
    time: '01:09 PM',
    text: "Thank you for your answer. Let's move on to the next topic. Regarding LLM Core, Prompting & Fine-Tuning: Can you explain the key concepts and how they were applied in your cohort work?",
  },
];

export function ConsoleDemoWindow() {
  const [step, setStep] = useState(0);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Heading */}
      <div className="flex flex-col items-center gap-2 mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold">
          <Terminal className="w-3.5 h-3.5 text-purple-400" />
          <span>VISUAL DEMONSTRATION</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Interview Console Demo
        </h2>
        <p className="text-xs text-gray-400 max-w-md">
          A live visual simulation of the adaptive technical conversation engine in action.
        </p>
      </div>

      {/* Demo Card Window */}
      <div className="w-full glass-card p-5 sm:p-6 border-purple-500/30 bg-[#0B0C10]/95 shadow-2xl shadow-purple-900/25 rounded-2xl text-left relative overflow-hidden pointer-events-none select-none">
        {/* Ambient Purple Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] font-mono font-extrabold uppercase text-gray-400 tracking-wider">
                  ACTIVE FOCUS
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                  HARD LEVEL
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Day 12 — System Design & Prompt Engineering
              </h3>
            </div>
          </div>

          <div className="px-3 py-1 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-[11px] font-semibold flex items-center gap-1.5 opacity-70 shrink-0">
            <LogOut className="w-3 h-3" />
            <span>End Interview</span>
          </div>
        </div>

        {/* Dynamic Chat Messages Stream */}
        <div className="space-y-5 mb-5 min-h-[320px]">
          {/* Q1 AI Turn */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-4 h-4 rounded-md bg-blue-600 flex items-center justify-center text-white">
                <Bot className="w-2.5 h-2.5" />
              </div>
              <span className="font-bold text-white text-[11px]">InterviewOS AI Engine (Groq + Breeth)</span>
              <span className="px-1.5 py-0.2 rounded text-[8px] bg-blue-500/20 text-blue-300 font-mono font-bold">
                Q1
              </span>
              <span className="text-[9px] text-gray-500 font-mono">01:08 PM</span>
            </div>

            <div className="p-4 rounded-xl bg-[#11131A] border border-white/10 text-gray-200 text-xs font-mono leading-relaxed shadow-inner">
              <TypewriterText
                text={demoScript[0].text}
                speed={20}
                onComplete={() => {
                  if (step === 0) setStep(1);
                }}
              />
            </div>
          </div>

          {/* Candidate Answer Turn (Appears when step >= 1) */}
          {step >= 1 && (
            <div className="space-y-1.5 flex flex-col items-end animate-fadeIn">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="font-bold text-gray-300 text-[11px]">Candidate (You)</span>
                <div className="w-4 h-4 rounded-md bg-purple-600 flex items-center justify-center text-white">
                  <User className="w-2.5 h-2.5" />
                </div>
                <span className="text-[9px] text-gray-500 font-mono">01:09 PM</span>
              </div>

              <div className="p-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-md shadow-blue-600/20">
                <TypewriterText
                  text={demoScript[1].text}
                  speed={40}
                  onComplete={() => {
                    if (step === 1) setStep(2);
                  }}
                />
              </div>
            </div>
          )}

          {/* Q2 AI Follow-up Turn (Appears when step >= 2) */}
          {step >= 2 && (
            <div className="space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-4 h-4 rounded-md bg-blue-600 flex items-center justify-center text-white">
                  <Bot className="w-2.5 h-2.5" />
                </div>
                <span className="font-bold text-white text-[11px]">InterviewOS AI Engine (Groq + Breeth)</span>
                <span className="px-1.5 py-0.2 rounded text-[8px] bg-blue-500/20 text-blue-300 font-mono font-bold">
                  Q2
                </span>
                <span className="text-[9px] text-gray-500 font-mono">01:09 PM</span>
              </div>

              <div className="p-4 rounded-xl bg-[#11131A] border border-white/10 text-gray-200 text-xs font-mono leading-relaxed shadow-inner">
                <TypewriterText
                  text={demoScript[2].text}
                  speed={20}
                  onComplete={() => {
                    // Loop back after 4s
                    setTimeout(() => setStep(0), 4000);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Input Bar Footer (Visual non-editable preview) */}
        <div className="pt-3 border-t border-white/10">
          <div className="bg-[#11131A] rounded-xl border border-white/10 p-3 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-mono truncate">
              Type your technical response here (e.g. explain architecture, tradeoffs)...
            </span>

            <div className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold opacity-60 flex items-center gap-1.5 shrink-0">
              <span>Send</span>
              <Send className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
