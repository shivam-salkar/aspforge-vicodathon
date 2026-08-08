'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { candidateService } from '@/services/candidateService';
import { Navbar } from '@/components/ui/Navbar';
import { ConsoleDemoWindow } from '@/components/ui/ConsoleDemoWindow';
import { ParticleText } from '@/components/ui/ParticleText';
import GradientWaves from '@/components/ui/GradientWaves';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  FolderGit2,
  Award,
  GraduationCap,
  Code2,
  Trophy,
  MessageSquare,
  Quote,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(['0', '0', '1']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    const char = value.slice(-1).toUpperCase();
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    if (char && index < 2) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().toUpperCase();
    const digitsOnly = pasted.replace(/^CAND-?/, '').replace(/[^A-Z0-9]/g, '');
    if (digitsOnly.length > 0) {
      const chars = digitsOnly.slice(0, 3).split('');
      const newOtp = [...otp];
      chars.forEach((c, idx) => {
        if (idx < 3) newOtp[idx] = c;
      });
      setOtp(newOtp);
      const focusIndex = Math.min(chars.length, 2);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [shakeInput, setShakeInput] = useState(false);

  useEffect(() => {
    if (errorToast) {
      const timer = setTimeout(() => setErrorToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorToast]);

  const triggerShake = () => {
    setShakeInput(true);
    setTimeout(() => setShakeInput(false), 600);
  };

  const handleVerifyCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('').trim().toUpperCase();
    if (code.length < 3) {
      setErrorToast('Please enter a complete 3-digit candidate code.');
      triggerShake();
      return;
    }
    const formatted = `CAND-${code.padStart(3, '0')}`;
    setIsVerifying(true);
    setErrorToast(null);

    const exists = await candidateService.verifyCandidateExists(formatted);
    setIsVerifying(false);

    if (!exists) {
      setErrorToast(`Candidate ID "${formatted}" does not exist in dataset!`);
      triggerShake();
      return;
    }

    router.push(`/profile/${formatted}`);
  };

  return (
    <div className="relative min-h-screen bg-[#08090A] text-white selection:bg-purple-500 selection:text-white">
      {/* ERROR TOAST NOTIFICATION */}
      {errorToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 backdrop-blur-xl shadow-2xl shadow-red-950/50 animate-in fade-in slide-in-from-top-4 duration-300 max-w-md">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div className="flex-1 text-xs font-semibold">
            <span className="block font-bold text-red-300 mb-0.5">Verification Error</span>
            <span>{errorToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorToast(null)}
            className="p-1 text-red-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FIXED BACKGROUND: Stays pinned to the viewport during scroll */}
      <div className="fixed inset-0 z-0 pointer-events-none w-full h-full overflow-hidden opacity-90">
        <GradientWaves amplitude={2.5} brightness={1.0} crestColor="#FFFFFF" detail="medium" fogDepth={15} grain={true} grainIntensity={0.05} height={5.5} horizonColor="#5227FF" mouseInteraction={false} opacity={1.0} parallaxStrength={0.5} speed={0.4} swell={35} tilt={1.11} turbulence={20} waveColor="#FF9FFC" waveRatio={0.9} waveScale={0.6} zoom={1.0}/>
      </div>

      {/* SCROLLABLE FOREGROUND CONTENT */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main id="home" className="flex-1 max-w-7xl mx-auto px-6 pt-12 pb-24 w-full flex flex-col items-center text-center relative z-10 space-y-16">
        {/* Top Header Block */}
        <div className="flex flex-col items-center text-center max-w-4xl w-full">
          

          {/* Particle Animated Headline */}
          <div className="w-full max-w-3xl flex flex-col items-center mb-6">
            <div className="w-full h-32 sm:h-44 md:h-52 relative flex items-center justify-center">
              <ParticleText
                text="InterviewOS"
                color="#ffffff"
                highlightColor="#8b5cf6"
                particleSize={2.5}
                density={3}
                scatter={160}
                gatherDuration={1500}
                stagger={300}
                pointerRepel={50}
                repelRadius={140}
                idleDrift={0.8}
                trigger="mount"
                fontSize="clamp(3.5rem, 11vw, 7rem)"
                fontWeight={900}
                glow
              />
            </div>
            <div className="flex items-center justify-center gap-3 -mt-2 sm:-mt-4">
              <span className="text-xl sm:text-3xl font-extrabold text-gray-300 tracking-tight">by</span>
              <img
                src="/abtalks_logo.png"
                alt="ABTalks"
                className="h-8 sm:h-12 w-auto object-contain filter drop-shadow"
              />
            </div>
          </div>

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl font-normal leading-relaxed mb-10">
            ABTalks InterviewOS conducts adaptive technical interviews based on what you've actually learned —
            remembering your answers, probing your reasoning, and adjusting the conversation in real time.
          </p>

          {/* Hero Card: Candidate Verification Input */}
          <div className="w-full max-w-xl glass-card p-6 border-blue-500/25 shadow-2xl shadow-blue-600/10">
            <div className="flex items-center gap-2 mb-3 text-left">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Candidate Verification</span>
            </div>

            <form onSubmit={handleVerifyCandidate} className="flex flex-col sm:flex-row items-center gap-3">
              <div className={`flex items-center gap-2 glass-input px-4 py-2.5 rounded-xl border w-full sm:w-auto flex-1 transition-all ${shakeInput ? 'border-red-500/80 bg-red-500/10 ring-2 ring-red-500/30 animate-pulse' : 'border-white/10'}`}>
                <span className="font-mono font-black text-blue-400 text-base tracking-wider select-none shrink-0">
                  CAND-
                </span>
                <div className="flex items-center gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className={`w-10 h-10 text-center text-lg font-mono font-bold uppercase bg-white/5 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all ${shakeInput ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/30' : 'border-white/15 focus:border-blue-500 focus:ring-blue-500/30'}`}
                    />
                  ))}
                </div>
                <span className="ml-auto text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10 hidden sm:inline-block">
                  VERIFIED
                </span>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Start Interview</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            
          </div>
        </div>

        {/* Visual Animated Interview Console Demo Window */}
        <div id="demo" className="w-full scroll-mt-24">
          <ConsoleDemoWindow />
        </div>

        {/* 1. ABTalks Metrics Stats Bar */}
        <div className="w-full glass-card p-6 border-white/10 bg-[#0F1015]/80">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="flex items-center justify-center gap-4 py-2 md:py-0">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-white font-mono">10,000+</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">MEMBERS</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 py-2 md:py-0 md:pl-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-white font-mono">500+</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">PROJECTS</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 py-2 md:py-0 md:pl-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-white font-mono">100+</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">HIRING PARTNERS</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. "How ABTalks works" Section */}
        <div id="about" className="w-full space-y-10 text-center scroll-mt-24">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How ABTalks works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Step 1 */}
            <div className="glass-card p-8 border-white/10 glass-card-hover bg-[#10121A]/90 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">1. Learn Daily</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">
                Choose your track and build practical skills through focused challenges and live sessions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-8 border-white/10 glass-card-hover bg-[#10121A]/90 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">2. Build & Showcase</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">
                Ship real work, publish your progress, and turn consistent effort into a visible portfolio.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-8 border-white/10 glass-card-hover bg-[#10121A]/90 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">3. Get Hired</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">
                Stand out through proof of work and become discoverable to recruiters in the ABTalks network.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Community Banner */}
        <div className="w-full glass-card p-6 md:p-8 border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-indigo-950/20 to-gray-900/40 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Join our community for instant updates
              </h3>
              <p className="text-xs text-gray-300 mt-0.5">
                Meet builders, get event alerts, and stay accountable.
              </p>
            </div>
          </div>

          <button className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all hover:scale-105 shrink-0 shadow-lg shadow-purple-600/25">
            Join now
            <a href="https://abtalks.in/"></a>
          </button>
        </div>

        {/* 4. "What our builders say" Testimonials Section */}
        <div id="testimonies" className="w-full space-y-10 text-center scroll-mt-24">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              What our builders say
            </h2>
            <p className="text-xs text-gray-400">
              Real stories from students and professionals who finished the 60-Day Claude Challenge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Testimonial 1 */}
            <div className="glass-card p-6 border-white/10 bg-[#10121A]/80 space-y-4 relative flex flex-col justify-between">
              <div>
                <Quote className="w-6 h-6 text-purple-400 opacity-60 mb-2" />
                <p className="text-xs text-gray-300 leading-relaxed font-normal italic">
                  "I wasn't looking for another certificate. I was looking for a new way of thinking. With over 20 years in IT leadership, stepping into Generative AI made me feel like a beginner again, and honestly that was the best part. The challenge may have ended, but my AI journey has just begun."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                  V
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Vivek</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                    IT LEADER • 20+ YEARS OF INDUSTRY EXPERIENCE
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="glass-card p-6 border-white/10 bg-[#10121A]/80 space-y-4 relative flex flex-col justify-between">
              <div>
                <Quote className="w-6 h-6 text-purple-400 opacity-60 mb-2" />
                <p className="text-xs text-gray-300 leading-relaxed font-normal italic">
                  "60 days ago, I used AI mainly for everyday questions. Today I use it to build complete projects, craft professional resumes, automate workflows, and solve real-world problems. It completely changed the way I think about and use AI."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
                  L
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Lakshay</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                    STUDENT & BUILDER
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="glass-card p-6 border-white/10 bg-[#10121A]/80 space-y-4 relative flex flex-col justify-between">
              <div>
                <Quote className="w-6 h-6 text-purple-400 opacity-60 mb-2" />
                <p className="text-xs text-gray-300 leading-relaxed font-normal italic">
                  "I joined with curiosity, but also with doubts about whether I could stay consistent for all 60 days. To my surprise, I did it. This wasn't just a 60-day challenge. It was a journey that taught me consistency can turn uncertainty into achievement."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                  R
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Rida Khan</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                    AI ENTHUSIAST
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial 4 */}
            <div className="glass-card p-6 border-white/10 bg-[#10121A]/80 space-y-4 relative flex flex-col justify-between">
              <div>
                <Quote className="w-6 h-6 text-purple-400 opacity-60 mb-2" />
                <p className="text-xs text-gray-300 leading-relaxed font-normal italic">
                  "From exploring AI concepts to building production-ready projects, every challenge strengthened my technical skills and encouraged me to think like an engineer. Today AI isn't just something I learn. It's a tool I use to solve meaningful problems."
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-xs">
                  D
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Devpal Singh Anand</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                    SOFTWARE ENGINEER
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Extended Footer matching spec */}
      <footer className="border-t border-white/10 py-10 px-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p className="text-center sm:text-left flex items-center gap-2">
          <img src="/abtalks_logo.png" alt="AB TALKS Logo" className="w-5 h-5 object-contain" />
          <span><strong className="text-gray-300 font-bold">ABTalks InterviewOS</strong> © 2026 ABTalks InterviewOS. The pro-grade technical interview platform.</span>
        </p>

        <div className="flex items-center gap-6 text-gray-400 font-medium">
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Status</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>
      </div>
    </div>
  );
}
