'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { PieChart as PieIcon, BarChart2 } from 'lucide-react';
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

  const outcomeDistribution = [
    { name: 'First-Try Pass', value: firstTry, color: '#10b981' },
    { name: 'Multi-Attempt Pass', value: multiAttempts, color: '#3b82f6' },
    { name: 'Skipped Mission', value: skipped, color: '#f59e0b' },
    { name: 'Failed Mission', value: failed, color: '#ef4444' },
  ].filter((item) => item.value > 0);

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
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
          <span
            className="material-symbols-outlined text-[#c4b5fd] select-none leading-none"
            style={{ fontSize: '48px' }}
          >
            pie_chart
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Mission Outcome Distribution</h3>
        </div>

        <div className="h-56 w-full flex items-center justify-center">
          {outcomeDistribution.length === 0 ? (
            <p className="text-sm text-gray-400">No mission telemetry available.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomeDistribution}
                  innerRadius={55}
                  outerRadius={80}
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
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
          {outcomeDistribution.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-sm font-semibold">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-gray-300 truncate">{item.name}</span>
              <span className="font-extrabold text-white font-mono ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Attempts Per Mission Bar Chart */}
      <div className="glass-card p-6 border-white/10 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
          <span
            className="material-symbols-outlined text-[#c4b5fd] select-none leading-none"
            style={{ fontSize: '48px' }}
          >
            bar_chart
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Attempts per Mission</h3>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attemptsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="dayLabel" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111216', borderColor: '#374151', borderRadius: '12px' }}
                itemStyle={{ color: '#ffffff' }}
                formatter={(value: any, name: any, item: any) => [`${value} attempt(s) (${item.payload.status})`, item.payload.title]}
              />
              <Bar dataKey="attempts" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-sm">
          <span className="text-gray-300 font-medium">Total Missions Evaluated</span>
          <span className="font-extrabold text-blue-400 font-mono text-sm sm:text-base">{missions.length} Missions</span>
        </div>
      </div>
    </div>
  );
}
