import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { GitCompare, Award, TrendingUp, Sparkles, Layers } from 'lucide-react';
import { MockAttempt } from '../types';

interface PlatformComparisonViewProps {
  mocks: MockAttempt[];
}

export default function PlatformComparisonView({ mocks }: PlatformComparisonViewProps) {
  
  if (mocks.length === 0) {
    return (
      <div className="text-center py-24 bg-white border border-slate-200 rounded-3xl space-y-4 animate-fade-in shadow-sm">
        <GitCompare size={48} className="text-blue-500 mx-auto animate-pulse" />
        <h3 className="font-display font-bold text-lg text-slate-850">No platform comparisons yet</h3>
        <p className="text-slate-505 text-xs max-w-sm mx-auto">Log mock attempts across different engines like Oliveboard and Testbook to start benchmarking indices.</p>
      </div>
    );
  }

  // Pre-aggregate platform stats
  const platformStats: Record<string, { totalScore: number; totalPercentile: number; count: number; totalAccuracy: number }> = {};
  
  const platformsList = ['Oliveboard', 'Testbook', 'PracticeMock', 'RBE', 'F64 Academy'];
  
  // Seed entries with some zeros to keep it uniform
  platformsList.forEach(p => {
    platformStats[p] = { totalScore: 0, totalPercentile: 0, count: 0, totalAccuracy: 0 };
  });

  mocks.forEach(mock => {
    const p = mock.platform;
    if (platformStats[p]) {
      platformStats[p].totalScore += mock.score;
      platformStats[p].totalPercentile += mock.percentile;
      platformStats[p].totalAccuracy += mock.accuracy;
      platformStats[p].count += 1;
    }
  });

  // Convert to chart format
  const chartData = Object.entries(platformStats)
    .filter(([_, stats]) => stats.count > 0)
    .map(([platform, stats]) => ({
      name: platform,
      Score: parseFloat((stats.totalScore / stats.count).toFixed(1)),
      Percentile: parseFloat((stats.totalPercentile / stats.count).toFixed(1)),
      Accuracy: parseFloat((stats.totalAccuracy / stats.count).toFixed(1)),
      AttemptsCount: stats.count
    }));

  // Determine Best Performing Platform & Weakest based on average score
  const sortedByPerformance = [...chartData].sort((a,b) => b.Score - a.Score);
  const bestPlatform = sortedByPerformance[0] || null;
  const weakestPlatform = sortedByPerformance[sortedByPerformance.length - 1] || null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur shadow-lg p-3 rounded-xl border border-slate-200 text-xs font-mono space-y-1 text-slate-800">
          <p className="text-slate-505 mb-1 font-semibold">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} style={{ color: item.color }}>
              {item.name}: {item.value} {item.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in font-sans">
      
      {/* 1. Header summaries */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900 font-bold">Platform comparisons and analytics</h3>
          <p className="text-slate-500 text-xs mt-0.5">Automated benchmark matrices comparing Oliveboard, Testbook, PracticeMock, RBE and F64 Academy</p>
        </div>
        <span className="px-3.5 py-1 text-xs font-semibold rounded-xl bg-blue-50 border border-blue-205 text-blue-600 flex items-center gap-1.5 self-start md:self-auto">
          <GitCompare size={14} />
          Comparative Analysis Mode Active
        </span>
      </div>

      {/* 2. Top Best vs Weakest summary indicators */}
      {bestPlatform && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Best platform card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 relative group overflow-hidden transition-all duration-300 hover:shadow-md bg-gradient-to-br from-emerald-500/5 via-emerald-50/10 to-transparent border-emerald-250">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  🏆 TOP PLAYGROUND PLATFORM
                </span>
                <h4 className="text-2xl font-display font-extrabold text-slate-850 mt-1">{bestPlatform.name}</h4>
                <p className="text-xs text-slate-500 max-w-sm pt-1">You score highest here on average, showing great alignment under dry-run patterns of this platform.</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                A
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-slate-100 text-center font-mono text-xs">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-sans">Avg Score</span>
                <strong className="text-slate-850 text-base font-extrabold">{bestPlatform.Score}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-sans font-bold">Percentile</span>
                <strong className="text-emerald-600 text-base font-extrabold">{bestPlatform.Percentile}%</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-sans">Attempts</span>
                <strong className="text-slate-850 text-base font-extrabold">{bestPlatform.AttemptsCount} mocks</strong>
              </div>
            </div>
          </div>

          {/* Weakest platform card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 relative group overflow-hidden transition-all duration-300 hover:shadow-md bg-gradient-to-br from-rose-500/5 via-rose-50/10 to-transparent border-rose-250">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 px-3 py-1 rounded-full bg-rose-50 border border-rose-200">
                  🚨 BOTTLENECK PLATFORM
                </span>
                <h4 className="text-2xl font-display font-extrabold text-slate-850 mt-1">{weakestPlatform?.name}</h4>
                <p className="text-xs text-slate-500 max-w-sm pt-1">This platform shows lowest average score ratios. Requires concept adjustments or speed improvements.</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold">
                C
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-slate-100 text-center font-mono text-xs">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-sans">Avg Score</span>
                <strong className="text-slate-850 text-base font-extrabold">{weakestPlatform?.Score}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-sans font-bold">Percentile</span>
                <strong className="text-rose-600 text-base font-extrabold">{weakestPlatform?.Percentile}%</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-sans font-bold">Attempts</span>
                <strong className="text-slate-850 text-base font-extrabold">{weakestPlatform?.AttemptsCount} mocks</strong>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Recharts Platform Comparison Chart */}
      <section className="bg-white border border-slate-200 shadow-sm rounded-3xl p-5 md:p-6 space-y-4">
        <h4 className="text-sm font-semibold text-slate-800 tracking-wide uppercase border-b border-slate-100 pb-2 font-display font-bold">Comparative averages by engine</h4>
        <div className="w-full h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 10, pt: 10 }} />
              <Bar dataKey="Score" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Score" />
              <Bar dataKey="Percentile" fill="#059669" radius={[4, 4, 0, 0]} name="Avg Percentile" />
              <Bar dataKey="Accuracy" fill="#d97706" radius={[4, 4, 0, 0]} name="Avg Accuracy" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

    </div>
  );
}
