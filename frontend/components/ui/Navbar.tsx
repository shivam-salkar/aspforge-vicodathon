'use client';

import Link from 'next/link';
import { Home, Play, Info, MessageSquare } from 'lucide-react';

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
    <header className="sticky top-0 z-50 glass-nav px-6 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="AB TALKS Logo"
            className="w-10 h-10 sm:w-11 sm:h-11 object-contain group-hover:scale-105 transition-transform"
          />
          <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white group-hover:text-blue-300 transition-colors">
            InterviewOS
          </span>
        </Link>

        {/* Center Navigation Capsule Links: Home -> Demo -> About -> Testimonies */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl shadow-inner shadow-black/40 md:absolute md:left-1/2 md:-translate-x-1/2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200 group"
              >
                <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

