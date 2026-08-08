'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, LogOut, Bot, User, Sparkles, Layers, ShieldAlert, Cpu } from 'lucide-react';
import { useInterviewStore } from '@/stores/interviewStore';
import { interviewService } from '@/services/interviewService';

export function ChatPanel() {
  const router = useRouter();
  const {
    sessionId,
    turns,
    turnCount,
    maxTurns,
    currentTopic,
    difficulty,
    statusText,
    isThinking,
    addTurn,
    setStatusText,
    setIsThinking,
    setIsCompleted,
    updateScores,
  } = useInterviewStore();

  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, isThinking, statusText]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isThinking) return;

    const userText = inputMessage;
    setInputMessage('');

    // Add candidate turn immediately
    addTurn({
      role: 'candidate',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setIsThinking(true);
    setStatusText('Analyzing response telemetry...');

    // Simulate AI step updates for realistic visual feedback
    setTimeout(() => setStatusText('Evaluating technical depth & vector indexing...'), 1200);
    setTimeout(() => setStatusText('Searching candidate context memory...'), 2400);

    try {
      const response = await interviewService.sendTurn(sessionId, userText);

      setTimeout(() => {
        setIsThinking(false);
        setStatusText('Interview Engine Active • Listening for candidate input...');

        addTurn({
          role: 'interviewer',
          content: response.reply,
          topic: currentTopic,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });

        // Dynamically adjust live scores slightly
        updateScores({
          technical: Math.min(96, Math.max(70, Math.floor(Math.random() * 15) + 82)),
          reasoning: Math.min(95, Math.max(75, Math.floor(Math.random() * 12) + 84)),
        });

        if (response.done || turnCount >= maxTurns) {
          setIsCompleted(true);
          router.push(`/results/${sessionId}`);
        }
      }, 3200);
    } catch {
      setIsThinking(false);
      setStatusText('Error processing turn. Please try again.');
    }
  };

  const handleEndInterview = () => {
    setIsCompleted(true);
    router.push(`/results/${sessionId}`);
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col justify-between border-white/10 relative overflow-hidden">
      {/* 1. Current Topic Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 bg-white/5 -mx-6 -mt-6 p-4 px-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-gray-400">Active Topic</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                {difficulty} Level
              </span>
            </div>
            <h2 className="text-sm font-bold text-white tracking-tight">{currentTopic}</h2>
          </div>
        </div>

        <button
          onClick={handleEndInterview}
          className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>End Interview</span>
        </button>
      </div>

      {/* 2. Conversation Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4">
        {turns.map((turn, index) => {
          const isAI = turn.role === 'interviewer';

          return (
            <div key={index} className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
              {/* Message Header */}
              <div className="flex items-center gap-2 mb-1.5 text-xs text-gray-400">
                {isAI ? (
                  <>
                    <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white">
                      <Bot className="w-3 h-3" />
                    </div>
                    <span className="font-bold text-white">InterviewOS Evaluator</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-500/20 text-blue-300 font-mono">
                      Scenario Q{Math.floor(index / 2) + 1}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-gray-300">Candidate (You)</span>
                    <div className="w-5 h-5 rounded-md bg-purple-600 flex items-center justify-center text-white">
                      <User className="w-3 h-3" />
                    </div>
                  </>
                )}
                <span className="text-[10px] text-gray-500">{turn.timestamp}</span>
              </div>

              {/* Message Content Bubble */}
              <div
                className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                  isAI
                    ? 'bg-gray-900/90 border border-white/10 text-gray-200 shadow-md'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/10'
                }`}
              >
                {turn.content}
              </div>
            </div>
          );
        })}

        {/* Dynamic AI Action / Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold animate-pulse">
            <Cpu className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>{statusText}</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 3. Input Controls */}
      <div className="pt-3 border-t border-white/10">
        <div className="relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your technical response here (e.g. explain architecture, tradeoffs, schemas)..."
            rows={3}
            disabled={isThinking}
            className="w-full glass-input p-3.5 pr-28 text-xs placeholder-gray-500 resize-none"
          />

          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isThinking}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
