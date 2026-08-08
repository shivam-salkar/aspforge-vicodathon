'use client';

import Link from 'next/link';
import { Sparkles, UserCheck, Home, Play, Info, MessageSquare } from 'lucide-react';

export function Navbar() {
  const navItems = [
    { label: 'Home', href: '#home', icon: Home },
    { label: 'Demo', href: '#demo', icon: Play },
    { label: 'About', href: '#about', icon: Info },
    { label: 'Testimonies', href: '#testimonies', icon: MessageSquare },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', href);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-nav px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-105 group-hover:border-blue-500/30 transition-all flex items-center justify-center shadow-lg shadow-black/40">
            <img
              src="/logo.png"
              alt="AB TALKS Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-blue-300 transition-colors">InterviewOS</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                AB Talks
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">Enterprise AI Technical Interviewer</p>
          </div>
        </Link>

        {/* Center Navigation Capsule Links: Home -> Demo -> About -> Testimonies */}
        <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-inner shadow-black/40">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 group"
              >
                <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/profile/CAND-001"
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white rounded-xl border border-white/10 hover:border-white/20 transition-all bg-white/5 hover:bg-white/10"
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
