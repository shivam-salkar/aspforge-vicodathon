'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import {
  PieChart as PieIcon,
  BarChart2,
  CheckCircle2,
  RefreshCw,
  SkipForward,
  XCircle,
} from 'lucide-react';
import { Candidate } from '@/types';

interface ProfileChartsProps {
  candidate: Candidate;
}

export function ProfileCharts({ candidate }: ProfileChartsProps) {
  const { missions } = candidate;

  // 1. Authentic Mission Outcome Distribution
  const firstTry = missions.filter((m) => m.passed && m.attempts === 1).length;
  const multiAttempts = missions.filter((m) => m.passed && (m.attempts ?? 1) > 1).length;
  const skipped = missions.filter((m) => m.skipped).length;
  const failed = missions.filter((m) => m.passed === false && !m.skipped).length;

  const allOutcomes = [
    { name: 'First-Try Pass', value: firstTry, color: '#10b981', icon: CheckCircle2 },
    { name: 'Multi-Attempt Pass', value: multiAttempts, color: '#3b82f6', icon: RefreshCw },
    { name: 'Skipped Mission', value: skipped, color: '#f59e0b', icon: SkipForward },
    { name: 'Failed Mission', value: failed, color: '#ef4444', icon: XCircle },
  ];

  const outcomeDistribution = allOutcomes.filter((item) => item.value > 0);
  const totalMissions = missions.length;

  // 2. Authentic Attempts Per Mission Bar Chart
  const attemptsData = missions.map((m) => ({
    dayLabel: `Day ${m.day}`,
    title: m.title,
    attempts: m.skipped ? 0 : m.attempts || 1,
    status: m.skipped ? 'Skipped' : m.passed ? 'Passed' : 'Failed',
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Mission Outcome Distribution Donut Chart */}
      <div className="glass-card p-6 border-white/10 flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <PieIcon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Mission Outcome Distribution</h3>
        </div>

        <div className="relative h-56 w-full flex items-center justify-center">
          {outcomeDistribution.length === 0 ? (
            <p className="text-xs text-gray-400">No mission telemetry available.</p>
          ) : (
            <>
              {/* Symbol in place of center text */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                  <PieIcon className="w-7 h-7 text-indigo-400" />
                </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outcomeDistribution}
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {outcomeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111216', borderColor: '#374151', borderRadius: '12px' }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        {/* Legend / Factor breakdown with clean symbol icons & card alignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 border-t border-white/10">
          {allOutcomes.map((item) => {
            const IconComponent = item.icon;
            const percentage = totalMissions > 0 ? Math.round((item.value / totalMissions) * 100) : 0;
            return (
              <div
                key={item.name}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${item.color}18`,
                      border: `1px solid ${item.color}30`,
                    }}
                  >
                    <IconComponent className="w-3.5 h-3.5" style={{ color: item.color }} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-200 truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span
                    className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-md"
                    style={{
                      backgroundColor: `${item.color}20`,
                      color: item.color,
                      border: `1px solid ${item.color}40`,
                    }}
                  >
                    {item.value}
                  </span>
                  {totalMissions > 0 && (
                    <span className="text-[11px] font-mono text-gray-400 min-w-[32px] text-right">
                      {percentage}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Attempts Per Mission Bar Chart */}
      <div className="glass-card p-6 border-white/10 flex flex-col justify-between">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Attempts per Mission</h3>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attemptsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="dayLabel" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111216', borderColor: '#374151', borderRadius: '12px' }}
                itemStyle={{ color: '#ffffff' }}
                formatter={(value: any, name: any, item: any) => [`${value} attempt(s) (${item.payload.status})`, item.payload.title]}
              />
              <Bar dataKey="attempts" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-medium">Total Missions Evaluated</span>
          <span className="font-bold text-blue-400 font-mono text-sm">{missions.length} Missions</span>
        </div>
      </div>
    </div>
  );
}
