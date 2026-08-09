'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Bot, Cpu, Camera, Mic, VideoOff } from 'lucide-react';
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
    questionTimerSeconds,
    turns,
    recordedQuestions,
    addTurn,
    addRecordedQuestion,
    setStatusText,
    setIsThinking,
    setIsCompleted,
    updateScores,
  } = useInterviewStore();

  const [inputMessage, setInputMessage] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Request real camera permission on mount
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
          setIsCameraActive(true);
        } else {
          setCameraError('Camera API not supported in browser');
        }
      } catch (err: any) {
        console.warn('Webcam permission denied or error:', err);
        setCameraError('Camera permission denied');
        setIsCameraActive(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isThinking) return;

    const userText = inputMessage.trim();
    const timeSpent = Math.max(5, questionTimerSeconds);
    setInputMessage('');

    // Capture last interviewer turn text & topic
    const lastInterviewerTurn = turns.filter((t) => t.role === 'interviewer').pop();
    const lastQuestion = lastInterviewerTurn?.content || 'Technical Question';
    const activeTopic = lastInterviewerTurn?.topic || currentTopic;

    addTurn({
      role: 'candidate',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setIsThinking(true);
    setStatusText('Querying Breeth AI Memory & Groq LLM for evaluation...');

    try {
      const response = await interviewService.sendTurn(sessionId, userText, timeSpent);

      setIsThinking(false);
      setStatusText('Interview Engine Active • Listening for candidate input...');

      const score = response.score ?? (userText.length > 25 ? 8.0 : 4.0);
      const isRight = response.isRight ?? score > 5.0;

      // Add to recorded questions state
      addRecordedQuestion({
        questionNumber: recordedQuestions.length + 1,
        topic: activeTopic,
        question: lastQuestion,
        answer: userText,
        timeSpentSeconds: timeSpent,
        score,
        isRight,
      });

      addTurn({
        role: 'interviewer',
        content: response.reply,
        topic: response.topic || currentTopic,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      updateScores({
        technical: Math.min(98, Math.max(65, Math.floor(score * 10))),
        reasoning: Math.min(97, Math.max(70, Math.floor(score * 10))),
      });

      if (response.done || turnCount >= maxTurns) {
        setIsCompleted(true);
        router.push(`/results/${sessionId}`);
      }
    } catch (err: any) {
      console.error('[LiveActionCard] Turn processing error:', err);
      setIsThinking(false);
      setStatusText('Error processing turn. Please try again.');
    }
  };

  return (
    <div className="glass-card p-4 md:p-6 h-full flex flex-col justify-between border-white/10 relative overflow-hidden bg-[#0a0a0c]/80 shadow-2xl">
      
      {/* Video Call Section (AI Interviewer + Candidate Webcam) */}
      <div className="grid grid-cols-2 gap-4 mb-4 md:mb-6 shrink-0 h-44 md:h-56">
        {/* AI Avatar */}
        <div className="rounded-2xl bg-gray-950 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          <div
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
              isThinking
                ? 'bg-gradient-to-br from-blue-500 to-cyan-500 animate-pulse shadow-blue-500/50'
                : 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-900/50'
            }`}
          >
            <Bot className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>

          <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-wide">
            {isThinking ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                <span className="text-blue-300 uppercase">Evaluating</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-300 uppercase font-semibold">Listening</span>
              </>
            )}
          </div>
          <div className="absolute top-3 right-3 text-[10px] font-bold text-gray-500 bg-black/40 px-2.5 py-1 rounded-md border border-white/5">
            AI Interviewer
          </div>
        </div>

        {/* Candidate Webcam with Browser Camera Permission & Mirrored Feed */}
        <div className="rounded-2xl bg-gray-950 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          {/* Live Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
            style={{ transform: 'scaleX(-1)', WebkitTransform: 'scaleX(-1)' }}
          />

          {/* Camera Error / Fallback UI */}
          {!isCameraActive && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-3 text-center">
              <div className="w-10 h-10 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center mb-2">
                <VideoOff className="w-5 h-5 text-gray-500" />
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                {cameraError || 'Requesting camera access...'}
              </p>
            </div>
          )}

          {/* Status Badges */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-wide z-20">
            <div className={`w-1.5 h-1.5 rounded-full ${isCameraActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-white uppercase">{isCameraActive ? 'Live Cam' : 'Cam Off'}</span>
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
            placeholder="Type your detailed technical response here... (Press Ctrl+Enter or click Submit)"
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
