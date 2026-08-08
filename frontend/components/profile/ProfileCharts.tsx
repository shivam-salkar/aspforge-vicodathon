'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { PieChart as PieIcon, BarChart2 } from 'lucide-react';

const topicDistribution = [
  { name: 'Data Engineering', value: 35, color: '#3b82f6' },
  { name: 'System Architecture', value: 25, color: '#8b5cf6' },
  { name: 'RAG & Vector DBs', value: 20, color: '#06b6d4' },
  { name: 'LLM Orchestration', value: 20, color: '#10b981' },
];

const activityTrend = [
  { day: 'Mon', commits: 4 },
  { day: 'Tue', commits: 7 },
  { day: 'Wed', commits: 5 },
  { day: 'Thu', commits: 9 },
  { day: 'Fri', commits: 12 },
  { day: 'Sat', commits: 8 },
  { day: 'Sun', commits: 6 },
];

export function ProfileCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Topic Distribution Donut Chart */}
      <div className="glass-card p-6 border-white/10 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
          <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
            <PieIcon className="w-4 h-4" />
          </span>
          <h3 className="text-base font-bold text-white tracking-tight">Topic Distribution</h3>
        </div>

        <div className="h-56 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={topicDistribution}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {topicDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#111216', borderColor: '#374151', borderRadius: '12px' }}
                itemStyle={{ color: '#ffffff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/10">
          {topicDistribution.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-gray-400 truncate">{item.name}</span>
              <span className="font-bold text-white font-mono ml-auto">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Trend Bar Chart */}
      <div className="glass-card p-6 border-white/10 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
          <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <BarChart2 className="w-4 h-4" />
          </span>
          <h3 className="text-base font-bold text-white tracking-tight">Recent Activity Trend</h3>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111216', borderColor: '#374151', borderRadius: '12px' }}
                itemStyle={{ color: '#ffffff' }}
              />
              <Bar dataKey="commits" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-gray-400">7-Day Engagement Index</span>
          <span className="font-bold text-emerald-400 font-mono">High Activity (28 Commit Days)</span>
        </div>
      </div>
    </div>
  );
}
