'use client';

import Link from 'next/link';
import { Cpu, Sparkles, UserCheck } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 glass-nav px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">InterviewOS</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                AB Talks
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Enterprise AI Technical Interviewer</p>
          </div>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link href="/" className="hover:text-blue-400 transition-colors">Platform</Link>
          <Link href="/" className="hover:text-blue-400 transition-colors">Solutions</Link>
          <Link href="/" className="hover:text-blue-400 transition-colors">Developers</Link>
          <Link href="/" className="hover:text-blue-400 transition-colors">Pricing</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/profile/CAND-001"
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white rounded-xl border border-white/10 hover:border-white/20 transition-all bg-white/5"
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Sign In</span>
          </Link>

          <Link
            href="/profile/CAND-001"
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Get Started</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
