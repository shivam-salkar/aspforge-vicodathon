'use client';

import { Candidate } from '@/types';
import { CheckCircle2, Award, Briefcase, GraduationCap, Hash } from 'lucide-react';

interface CandidateIdentityCardProps {
  candidate: Candidate;
}

export function CandidateIdentityCard({ candidate }: CandidateIdentityCardProps) {
  const m = candidate.member;

  return (
    <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
        {/* Avatar */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-1 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full rounded-[14px] bg-gray-900 flex items-center justify-center font-extrabold text-2xl text-blue-400">
              {m.name.split(' ').map((n) => n[0]).join('')}
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-gray-950 p-1 rounded-full shadow-md">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Candidate Details */}
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight">{m.name}</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </span>
          </div>

          <p className="text-sm font-semibold text-gray-300 flex items-center justify-center sm:justify-start gap-1.5 mb-3">
            <Briefcase className="w-4 h-4 text-blue-400" />
            {m.jobRole}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              {m.yearsExperience} Years Exp
            </span>
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
              {m.education}
            </span>
            <span className="flex items-center gap-1 font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
              <Hash className="w-3 h-3 text-blue-400" />
              {m.id}
            </span>
          </div>
        </div>
      </div>

      {/* Cohort Status Badge */}
      <div className="flex flex-col items-center md:items-end border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Cohort Status</span>
        <span className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
          {m.status} • Active Candidate
        </span>
      </div>
    </div>
  );
}
