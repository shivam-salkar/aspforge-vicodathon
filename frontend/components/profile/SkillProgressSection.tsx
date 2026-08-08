'use client';

import { ExternalLink, Layers, Award } from 'lucide-react';

interface SkillItem {
  name: string;
  progress: number;
  proficiency: 'Advanced' | 'Proficient' | 'Intermediate' | 'Beginner';
  category: string;
}

const skills: SkillItem[] = [
  { name: 'System Architecture & Data Pipelines', progress: 92, proficiency: 'Advanced', category: 'Infrastructure' },
  { name: 'Vector DBs & Cosine Retrieval (RAG)', progress: 86, proficiency: 'Advanced', category: 'AI Search' },
  { name: 'Prompt Engineering & Structured Outputs', progress: 78, proficiency: 'Proficient', category: 'LLM Systems' },
  { name: 'Multi-Agent Orchestration & MCP', progress: 74, proficiency: 'Proficient', category: 'Agents' },
  { name: 'Docker, K8s & Cloud Observability', progress: 65, proficiency: 'Intermediate', category: 'DevOps' },
];

const getProficiencyBadgeStyle = (proficiency: string) => {
  switch (proficiency) {
    case 'Advanced':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'Proficient':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'Intermediate':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    default:
      return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

export function SkillProgressSection() {
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
          <p className="text-xs text-gray-400 mt-1">Granular breakdown based on candidate telemetry and curriculum missions.</p>
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
