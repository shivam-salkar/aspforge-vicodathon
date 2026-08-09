'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Bot, Cpu, Camera, Mic, VideoOff, Sparkles, User, RefreshCw } from 'lucide-react';
import { useInterviewStore } from '@/stores/interviewStore';
import { interviewService } from '@/services/interviewService';

export function LiveActionCard() {
  const router = useRouter();
  const {
    sessionId,
    turnCount,
    maxTurns,
    currentTopic,
    statusText,
    isThinking,
    isCompleted,
    questionTimerSeconds,
    turns,
    recordedQuestions,
    addTurn,
    addRecordedQuestion,
    setStatusText,
    setIsThinking,
    setIsCompleted,
    setTransientFeedback,
    updateScores,
  } = useInterviewStore();

  const [inputMessage, setInputMessage] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const setupWebcam = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
        setCameraError(null);
      } else {
        setCameraError('Camera API not supported');
        setCameraActive(false);
      }
    } catch (err: any) {
      console.warn('[LiveActionCard] Webcam error:', err?.message || err);
      setCameraError('Camera permission denied or camera in use');
      setCameraActive(false);
    }
  };

  useEffect(() => {
    setupWebcam();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isThinking || isCompleted) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setIsThinking(true);
    setStatusText('Evaluating technical depth & reasoning...');

    const lastQuestion = turns.filter((t) => t.role === 'interviewer').pop()?.content || 'Technical Question';
    const activeTopic = currentTopic || 'Curriculum Focus';
    const timeSpent = Math.max(5, questionTimerSeconds);

    addTurn({
      role: 'candidate',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    try {
      const response = await interviewService.sendTurn(sessionId, userText, timeSpent);
      setIsThinking(false);
      setStatusText('Listening for candidate input...');

      const score = response.score ?? (userText.length > 25 ? 8.0 : 4.0);
      const isRight = response.isRight ?? score > 5.0;

      addRecordedQuestion({
        questionNumber: recordedQuestions.length + 1,
        topic: activeTopic,
        question: lastQuestion,
        mainQuestion: response.mainQuestion || lastQuestion,
        answer: userText,
        timeSpentSeconds: timeSpent,
        score,
        isRight,
      });

      updateScores({
        technical: Math.min(98, Math.max(65, Math.floor(score * 10))),
        reasoning: Math.min(97, Math.max(70, Math.floor(score * 10))),
      });

      // If answer was wrong, show Red Box on CURRENT Question Screen for 2.8s reading delay, then clear BEFORE next question
      if (!isRight && (response.skippedFollowUp || response.isWrongNotice)) {
        setTransientFeedback({
          text: response.validationText || 'Not very accurate — missing core architectural trade-offs.',
          type: 'wrong',
        });
        setStatusText('Evaluation generated • Reviewing feedback...');
        setIsThinking(true);

        await new Promise((resolve) => setTimeout(resolve, 2800));

        setTransientFeedback(null);
        setIsThinking(false);
        setStatusText('Listening for candidate input...');
      }

      addTurn({
        role: 'interviewer',
        content: response.reply,
        topic: response.topic || currentTopic,
        isFollowUp: response.isFollowUp,
        isWrongNotice: response.isWrongNotice,
        mainQuestion: response.mainQuestion,
        followUpQuestion: response.followUpQuestion,
        validationText: response.isFollowUp ? response.validationText : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      if (response.done || (recordedQuestions.length >= 6 && !response.isFollowUp)) {
        setIsCompleted(true);
        setStatusText('Interview Completed • Compiling Candidate Results...');
        setTimeout(() => {
          router.push(`/results/${sessionId}`);
        }, 2400);
      }
    } catch (err: any) {
      console.error('[LiveActionCard] Turn processing error:', err);
      setIsThinking(false);
      setStatusText('Error processing turn. Please try again.');
    }
  };

  const lastInterviewerTurn = turns.filter((t) => t.role === 'interviewer').pop();
  const isFollowUpActive = Boolean(lastInterviewerTurn?.isFollowUp);

  return (
    <div className="glass-card p-4 md:p-6 h-full flex flex-col justify-between border-white/10 relative overflow-hidden bg-[#0a0a0c]/80 shadow-2xl">
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-500 border-r-purple-500 rounded-full animate-spin" />
            <Sparkles className="w-8 h-8 text-cyan-400 absolute animate-pulse" />
          </div>
          <div className="text-center space-y-2 max-w-md px-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Compiling Candidate Results & AI Analysis...</h2>
            <p className="text-sm text-gray-400 font-mono">Synthesizing performance score out of 60 points across 6 completed topics...</p>
          </div>
        </div>
      )}

      {/* Video Call Section (AI Interviewer + Candidate Webcam) */}
      <div className="grid grid-cols-2 gap-4 mb-4 md:mb-6 shrink-0 h-44 md:h-56">
        {/* AI Avatar */}
        <div className="rounded-2xl bg-gray-950 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          <div
            className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 p-1 flex items-center justify-center shadow-lg transition-transform duration-500 ${
              isThinking ? 'scale-110 animate-pulse' : ''
            }`}
          >
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center relative overflow-hidden">
              <Bot className="w-10 h-10 md:w-12 md:h-12 text-blue-400" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-purple-500/20" />
            </div>
          </div>

          <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-wide">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white uppercase">AI Interviewer</span>
          </div>

          <div className="absolute top-3 right-3 text-[10px] font-bold text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-500/30">
            Groq Llama 3.3 70B
          </div>
        </div>

        {/* Candidate Video Feed */}
        <div className="rounded-2xl bg-gray-950 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform -scale-x-100 ${!cameraActive ? 'hidden' : 'block'}`}
          />

          {/* Camera Error / Interactive Fallback UI */}
          {!cameraActive && (
            <div className="absolute inset-0 bg-gray-950/95 flex flex-col items-center justify-center p-3 text-center z-10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 p-0.5 mb-2 shadow-lg animate-pulse">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 font-medium max-w-[180px] mb-2">
                {cameraError || 'Camera inactive'}
              </p>
              <button
                type="button"
                onClick={setupWebcam}
                className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" /> Enable Webcam
              </button>
            </div>
          )}

          {/* Status Badges */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-wide z-20">
            <div className={`w-1.5 h-1.5 rounded-full ${cameraActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-white uppercase">{cameraActive ? 'Live Cam' : 'Cam Off'}</span>
          </div>

          <div className="absolute top-3 right-3 text-[10px] font-bold text-gray-500 bg-black/40 px-2.5 py-1 rounded-md border border-white/5 z-20">
            Candidate
          </div>

          <div className="absolute bottom-3 right-3 p-1.5 rounded-full bg-black/60 border border-white/10 z-20">
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* AI Processing Banner (if active) */}
      {isThinking && (
        <div className="mb-3 flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold animate-pulse shrink-0">
          <Cpu className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>{statusText}</span>
        </div>
      )}

      {/* Giant Text Area for User Answer (Fills remaining height) */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        <div className="flex-1 relative flex flex-col">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              isFollowUpActive
                ? "Type short response in 2-3 words (e.g., 'HNSW index')... (Press Ctrl+Enter or click Submit)"
                : "Type your detailed technical response here... (Press Ctrl+Enter or click Submit)"
            }
            disabled={isThinking}
            className="w-full flex-1 bg-gray-950/70 border border-white/10 focus:border-blue-500/50 p-5 md:p-6 pr-4 pb-16 text-lg md:text-xl font-medium text-white placeholder-gray-500 placeholder:text-base resize-none rounded-2xl transition-all outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-sans shadow-inner"
          />

          <div className="absolute right-4 bottom-4 flex items-center gap-3 z-10">
            <span className="text-[10px] font-medium text-gray-500 hidden sm:inline-block">
              {inputMessage.length} chars
            </span>

            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isThinking}
              id="submit-answer-btn"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-40 shadow-lg shadow-blue-900/30 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Submit Answer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
