'use client';

import { ExternalLink, Layers } from 'lucide-react';
import { Candidate, Mission } from '@/types';

interface SkillProgressSectionProps {
  candidate: Candidate;
}

interface SkillItem {
  name: string;
  progress: number;
  proficiency: 'Advanced' | 'Proficient' | 'Intermediate' | 'Beginner';
  category: string;
}

function calculateCategoryScore(missions: Mission[], dayRange: [number, number], defaultScore: number): number {
  const categoryMissions = missions.filter((m) => m.day >= dayRange[0] && m.day <= dayRange[1]);
  if (categoryMissions.length === 0) return defaultScore;

  let totalScore = 0;
  categoryMissions.forEach((m) => {
    if (m.skipped) {
      totalScore += 20; // Penalty for skipped topic
    } else if (m.passed) {
      if (m.attempts === 1) totalScore += 100;
      else if (m.attempts && m.attempts <= 3) totalScore += 75;
      else totalScore += 55; // Multiple attempts penalty
    } else {
      totalScore += 30; // Failed attempt
    }
  });

  return Math.round(totalScore / categoryMissions.length);
}

function getProficiencyLabel(score: number): 'Advanced' | 'Proficient' | 'Intermediate' | 'Beginner' {
  if (score >= 85) return 'Advanced';
  if (score >= 70) return 'Proficient';
  if (score >= 50) return 'Intermediate';
  return 'Beginner';
}

const getProficiencyBadgeStyle = (proficiency: string) => {
  switch (proficiency) {
    case 'Advanced':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'Proficient':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'Intermediate':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    default:
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }
};

export function SkillProgressSection({ candidate }: SkillProgressSectionProps) {
  const missions = candidate.missions || [];
  const firstTryRatio = candidate.signals?.missionsCompleted
    ? candidate.signals.missionsFirstTry / candidate.signals.missionsCompleted
    : 0.7;

  const baseLineScore = Math.round(firstTryRatio * 100);

  const skills: SkillItem[] = [
    {
      name: 'System Architecture & Data Pipelines',
      progress: calculateCategoryScore(missions, [1, 6], Math.min(95, baseLineScore + 10)),
      category: 'Infrastructure',
      proficiency: getProficiencyLabel(calculateCategoryScore(missions, [1, 6], Math.min(95, baseLineScore + 10))),
    },
    {
      name: 'Vector DBs & Cosine Retrieval (RAG)',
      progress: calculateCategoryScore(missions, [7, 10], baseLineScore),
      category: 'AI Search',
      proficiency: getProficiencyLabel(calculateCategoryScore(missions, [7, 10], baseLineScore)),
    },
    {
      name: 'Prompt Engineering & Structured Outputs',
      progress: calculateCategoryScore(missions, [11, 15], Math.max(40, baseLineScore - 5)),
      category: 'LLM Systems',
      proficiency: getProficiencyLabel(calculateCategoryScore(missions, [11, 15], Math.max(40, baseLineScore - 5))),
    },
    {
      name: 'Multi-Agent Orchestration & MCP',
      progress: calculateCategoryScore(missions, [21, 24], baseLineScore),
      category: 'Agents',
      proficiency: getProficiencyLabel(calculateCategoryScore(missions, [21, 24], baseLineScore)),
    },
    {
      name: 'Docker, K8s & Cloud Observability',
      progress: calculateCategoryScore(missions, [25, 31], Math.max(35, baseLineScore - 15)),
      category: 'DevOps',
      proficiency: getProficiencyLabel(calculateCategoryScore(missions, [25, 31], Math.max(35, baseLineScore - 15))),
    },
  ];

  return (
    <div className="glass-card p-6 border-white/10">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">Skill Progress Analysis</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Granular breakdown computed dynamically from {candidate.member.name}&apos;s cohort missions ({missions.length} tracked).
          </p>
        </div>

        <button className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors">
          <span>View Detailed Telemetry</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Skill Bars List */}
      <div className="space-y-5">
        {skills.map((skill) => (
          <div key={skill.name} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{skill.name}</span>
                <span className="text-[10px] text-gray-400 font-mono">({skill.category})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getProficiencyBadgeStyle(skill.proficiency)}`}>
                  {skill.proficiency}
                </span>
                <span className="font-extrabold text-white font-mono">{skill.progress}%</span>
              </div>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full h-2 rounded-full bg-gray-900 overflow-hidden border border-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 transition-all duration-700 ease-out"
                style={{ width: `${skill.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
