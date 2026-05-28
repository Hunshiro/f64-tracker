import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ComposedChart
} from 'recharts';
import { Sparkles, Calendar, BookOpen, Clock, Activity, Award } from 'lucide-react';
import { MockAttempt } from '../types';

interface AnalyticsViewProps {
  mocks: MockAttempt[];
}

export default function AnalyticsView({ mocks }: AnalyticsViewProps) {
  
  if (mocks.length === 0) {
    return (
      <div className="text-center py-24 bg-white border border-slate-200 rounded-3xl space-y-4 animate-fade-in shadow-sm">
        <Activity size={48} className="text-blue-500 mx-auto animate-pulse" />
        <h3 className="font-display font-bold text-lg text-slate-800">No analytics compiled yet</h3>
        <p className="text-slate-500 text-xs max-w-sm mx-auto">Log mock performance scores through the submission panel to generate comparative trending reports.</p>
      </div>
    );
  }

  // Reverse list to show oldest to newest date chronologically in charts
  const chronologicalData = [...mocks].sort((a, b) => a.date.localeCompare(b.date));

  // Platform performance stats pre-aggregator
  const platformAverages = chronologicalData.reduce((acc: Record<string, { totalScore: number; count: number; totalPercentile: number }>, curr) => {
    if (!acc[curr.platform]) {
      acc[curr.platform] = { totalScore: 0, count: 0, totalPercentile: 0 };
    }
    acc[curr.platform].totalScore += curr.score;
    acc[curr.platform].totalPercentile += curr.percentile;
    acc[curr.platform].count += 1;
    return acc;
  }, {});

  const barChartPlatformData = Object.entries(platformAverages).map(([platform, metrics]) => ({
    name: platform,
    'Avg Score': parseFloat((metrics.totalScore / metrics.count).toFixed(1)),
    'Avg Percentile': parseFloat((metrics.totalPercentile / metrics.count).toFixed(1)),
  }));

  // Recharts custom Tooltip styled cleanly
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur shadow-lg p-3 rounded-xl border border-slate-200 text-xs font-mono space-y-1 text-slate-800">
          <p className="text-slate-400 mb-1">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} style={{ color: item.color }} className="font-semibold">
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
      
      {/* 1. Upper Header Summary */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900 font-bold">Advanced examination analytics</h3>
          <p className="text-slate-500 text-xs mt-0.5">Visualize chronologies of scoring growth, testing timelines, and platforms benchmarks</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold rounded-lg flex items-center gap-1">
            <Clock size={12} />
            {chronologicalData.length} records analyzed
          </span>
          <span className="px-3 py-1 bg-emerald-50 border border-emerald-205 text-emerald-600 text-xs font-semibold rounded-lg flex items-center gap-1">
            <Award size={12} />
            Standard Tier 1 SSC Scaling
          </span>
        </div>
      </div>

      {/* Bento Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        
        {/* Chart 1: Score Progression Area Chart */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h4 className="text-sm font-semibold text-slate-800 tracking-wide font-bold">A SCORE PROGRESSION TIMELINE</h4>
            <span className="text-[10px] text-blue-600 font-mono font-bold">200 Marks maximum</span>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chronologicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[60, 200]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" name="Raw Score" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Percentile Growth Line Chart */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h4 className="text-sm font-semibold text-slate-800 tracking-wide font-bold">B PERCENTILE STABILITY TIMEPATH</h4>
            <span className="text-[10px] text-emerald-600 font-mono font-bold">Goal scale: &ge; 95.0%</span>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chronologicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[50, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="percentile" stroke="#059669" strokeWidth={2.5} activeDot={{ r: 6 }} name="Percentile" unit="%" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Review study hours vs Score correlation */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h4 className="text-sm font-semibold text-slate-800 tracking-wide font-bold">C STUDY HOURS VS SCORE CORRELATION</h4>
            <span className="text-[10px] text-amber-600 font-mono font-bold">Dual scaling indicator</span>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chronologicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={10} tickLine={false} label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: '#64748b', style: { fontSize: 9 } }} />
                <YAxis yAxisId="right" orientation="right" stroke="#d97706" fontSize={10} tickLine={false} label={{ value: 'Review Hrs', angle: 90, position: 'insideRight', fill: '#d97706', style: { fontSize: 9 } }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar yAxisId="right" dataKey="studyHours" fill="#fbbf24" fillOpacity={0.12} stroke="#d97706" strokeWidth={1} name="Hours Spent" unit="h" />
                <Line yAxisId="left" type="monotone" dataKey="score" stroke="#0891b2" strokeWidth={2.5} name="Raw Score" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Platform Performance Averages */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 md:p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h4 className="text-sm font-semibold text-slate-800 tracking-wide font-bold">D BENCHMARK COMPARISONS BY PLATFORM</h4>
            <span className="text-[10px] text-teal-600 font-mono font-bold">Comparative performance specs</span>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartPlatformData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 10, pt: 10 }} />
                <Bar dataKey="Avg Score" fill="#2563eb" radius={[4, 4, 0, 0]} name="Avg Score" />
                <Bar dataKey="Avg Percentile" fill="#0891b2" radius={[4, 4, 0, 0]} name="Avg Percentile" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
