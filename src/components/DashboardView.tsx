import React from 'react';
import { 
  Plus, 
  Flame, 
  Compass, 
  Target, 
  TrendingUp, 
  Award, 
  Zap, 
  BookOpen, 
  BrainCircuit,
  PieChart,
  Grid,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserStats, UserProfile, MockAttempt } from '../types';

interface DashboardViewProps {
  stats: UserStats;
  user: UserProfile;
  recentMocks: MockAttempt[];
  aiInsights: { insights: string[]; recommendations: Array<{ title: string; suggestion: string }> };
  loadingAI: boolean;
  onRefreshAI: () => void;
  onOpenForm: () => void;
}

export default function DashboardView({
  stats,
  user,
  recentMocks,
  aiInsights,
  loadingAI,
  onRefreshAI,
  onOpenForm
}: DashboardViewProps) {
  
  // Quick calculation variables
  const mathAccuracy = recentMocks.length > 0 
    ? Math.round(recentMocks.reduce((s, m) => s + (m.sectionData.Mathematics?.accuracy || 0), 0) / recentMocks.length) 
    : 75;
  const reasoningAccuracy = recentMocks.length > 0 
    ? Math.round(recentMocks.reduce((s, m) => s + (m.sectionData.Reasoning?.accuracy || 0), 0) / recentMocks.length) 
    : 85;
  const englishAccuracy = recentMocks.length > 0 
    ? Math.round(recentMocks.reduce((s, m) => s + (m.sectionData.English?.accuracy || 0), 0) / recentMocks.length) 
    : 80;
  const gkAccuracy = recentMocks.length > 0 
    ? Math.round(recentMocks.reduce((s, m) => s + (m.sectionData.GeneralKnowledge?.accuracy || 0), 0) / recentMocks.length) 
    : 55;

  const getAccuracyColor = (pct: number) => {
    if (pct >= 85) return 'text-emerald-400 stroke-emerald-500';
    if (pct >= 70) return 'text-violet-400 stroke-violet-500';
    return 'text-rose-400 stroke-rose-500';
  };

  const getAccuracyBg = (pct: number) => {
    if (pct >= 85) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (pct >= 70) return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  const heroStats = [
    { label: 'Total Attempts', value: stats.totalMocks, trend: '+2 this week', icon: TrendingUp, color: 'from-blue-500/5 to-indigo-500/5 border-blue-500/20 text-blue-600' },
    { label: 'Average Score', value: `${stats.avgScore}`, trend: '150 Benchmark', icon: Zap, color: 'from-orange-500/5 to-amber-500/5 border-amber-500/20 text-orange-650' },
    { label: 'Highest score', value: `${stats.highestScore}`, trend: 'Milestone Peak', icon: Award, color: 'from-purple-500/5 to-indigo-500/5 border-indigo-500/20 text-purple-600' },
    { label: 'Avg Percentile %', value: `${stats.avgPercentile}%`, trend: 'Target: 95%', icon: Target, color: 'from-cyan-500/5 to-teal-500/5 border-cyan-500/20 text-cyan-600' },
    { label: 'Current Rank Position', value: `#${stats.currentRank}`, trend: 'Active Leaderboard', icon: Award, color: 'from-fuchsia-500/5 to-pink-500/5 border-fuchsia-500/20 text-fuchsia-600' },
    { label: 'Accuracy Rating %', value: `${stats.avgAccuracy}%`, trend: 'Target: 85%', icon: CheckCircle2, color: 'from-emerald-500/5 to-teal-500/5 border-emerald-500/20 text-emerald-600' },
    { label: 'Total Study Hours', value: `${stats.totalStudyHours} hrs`, trend: 'Mock review focus', icon: BookOpen, color: 'from-emerald-500/5 to-teal-500/5 border-emerald-500/20 text-teal-600' },
    { label: 'Strongest Core', value: stats.strongestSubject, trend: 'Top Accuracy Ratio', icon: Compass, color: 'from-violet-500/5 to-teal-500/5 border-violet-500/20 text-violet-600' },
    { label: 'Weakest Bottleneck', value: stats.weakestSubject, trend: 'Needs Intervention', icon: AlertCircle, color: 'from-rose-500/5 to-pink-500/5 border-rose-500/20 text-rose-600' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in font-sans">
      
      {/* 1. Hero Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {heroStats.map((item, idx) => {
          const Icon = item.icon;
          const isHighlighted = item.label.includes('Rank') || item.label.includes('Percentile');
          return (
            <div
              id={`stat-card-${idx}`}
              key={idx}
              className={`p-6 border relative group overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-1 ${
                isHighlighted 
                  ? 'ring-1 ring-blue-500/20 shadow-md shadow-blue-500/5 bg-blue-50 border-blue-200/80 rounded-2xl' 
                  : 'bg-white border-slate-200/90 rounded-2xl hover:border-blue-400 shadow-sm'
              }`}
            >
              {/* Card glowing visual hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition duration-1000 ease-out" />
              <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-blue-500/5 blur-2xl rounded-full" />
              
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className={`text-xs font-semibold tracking-wider uppercase ${isHighlighted ? 'text-blue-700' : 'text-slate-400'}`}>{item.label}</p>
                  <h3 className={`text-3xl font-display font-extrabold tracking-tight leading-none ${isHighlighted ? 'text-blue-900' : 'text-slate-900'}`}>
                    {item.value}
                  </h3>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                  isHighlighted ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className={`mt-4 pt-4 border-t flex items-center justify-between text-[11px] font-mono ${isHighlighted ? 'border-blue-200/50' : 'border-slate-100'}`}>
                <span className={isHighlighted ? 'text-blue-600' : 'text-slate-500'}>{item.trend}</span>
                <span className="text-blue-600 font-semibold group-hover:underline">Insights →</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* 2. Main Bento Layout: Sections Analysis & AI Platform Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Side: Circular Sections Breakdown */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 shadow-sm rounded-2xl p-6 md:p-8 space-y-6 animate-fade-in">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">Section-Wise Diagnostic Metrics</h3>
              <p className="text-slate-500 text-xs mt-0.5">Aggregated metrics detailing target areas of SSC CGL</p>
            </div>
            <span className="px-3 py-1 text-[10px] uppercase font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-full">
              4 Sections Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            
            {/* Subject 1: Maths */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center gap-4 hover:border-slate-300 transition">
              {/* Progress Circle visual */}
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="32" cy="32" r="28" className="stroke-slate-200 fill-none" strokeWidth="4" />
                  <circle cx="32" cy="32" r="28" className={`fill-none ${getAccuracyColor(mathAccuracy)}`} strokeWidth="4" strokeDasharray="175" strokeDashoffset={175 - (175 * mathAccuracy) / 100} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm text-slate-850">{mathAccuracy}%</div>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-slate-850 text-sm">Mathematics</h4>
                <div className="flex gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getAccuracyBg(mathAccuracy)}`}>
                    {mathAccuracy >= 80 ? 'Strong' : mathAccuracy >= 65 ? 'Medium' : 'Weak'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Quant core</span>
                </div>
              </div>
            </div>

            {/* Subject 2: Reasoning */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center gap-4 hover:border-slate-300 transition">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="32" cy="32" r="28" className="stroke-slate-200 fill-none" strokeWidth="4" />
                  <circle cx="32" cy="32" r="28" className={`fill-none ${getAccuracyColor(reasoningAccuracy)}`} strokeWidth="4" strokeDasharray="175" strokeDashoffset={175 - (175 * reasoningAccuracy) / 100} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm text-slate-855">{reasoningAccuracy}%</div>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-slate-855 text-sm">Reasoning Analysis</h4>
                <div className="flex gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getAccuracyBg(reasoningAccuracy)}`}>
                    {reasoningAccuracy >= 80 ? 'Strong' : reasoningAccuracy >= 65 ? 'Medium' : 'Weak'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Logical Reflex</span>
                </div>
              </div>
            </div>

            {/* Subject 3: English */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center gap-4 hover:border-slate-300 transition">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="32" cy="32" r="28" className="stroke-slate-200 fill-none" strokeWidth="4" />
                  <circle cx="32" cy="32" r="28" className={`fill-none ${getAccuracyColor(englishAccuracy)}`} strokeWidth="4" strokeDasharray="175" strokeDashoffset={175 - (175 * englishAccuracy) / 100} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm text-slate-855">{englishAccuracy}%</div>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-slate-850 text-sm">English Comprehension</h4>
                <div className="flex gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getAccuracyBg(englishAccuracy)}`}>
                    {englishAccuracy >= 80 ? 'Strong' : englishAccuracy >= 65 ? 'Medium' : 'Weak'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Verbal core</span>
                </div>
              </div>
            </div>

            {/* Subject 4: GK */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center gap-4 hover:border-slate-300 transition">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="32" cy="32" r="28" className="stroke-slate-200 fill-none" strokeWidth="4" />
                  <circle cx="32" cy="32" r="28" className={`fill-none ${getAccuracyColor(gkAccuracy)}`} strokeWidth="4" strokeDasharray="175" strokeDashoffset={175 - (175 * gkAccuracy) / 100} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm text-slate-855">{gkAccuracy}%</div>
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-slate-850 text-sm">General Knowledge</h4>
                <div className="flex gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${getAccuracyBg(gkAccuracy)}`}>
                    {gkAccuracy >= 80 ? 'Strong' : gkAccuracy >= 65 ? 'Medium' : 'Weak'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Static & Dynamic</span>
                </div>
              </div>
            </div>

          </div>

          {/* Daily Goals Progress Bar Widget */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-105 bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Target size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Daily Study Target Dashboard</h4>
                  <p className="text-[10px] text-slate-500">Hours invested in testing and review</p>
                </div>
              </div>
              <span className="text-xs text-blue-600 font-bold font-mono">4.5 hrs / {user.dailyStudyGoal} hrs</span>
            </div>
            
            {/* Visual indicator bar */}
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.2)] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((4.5 / user.dailyStudyGoal) * 100))}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
              <span>{Math.min(100, Math.round((4.5 / user.dailyStudyGoal) * 100))}% daily target logged</span>
              <button onClick={onOpenForm} className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-bold">Log More Hours (+)</button>
            </div>
          </div>

        </div>

        {/* Right Side: AI-Powered Insights */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 md:p-8 flex flex-col space-y-6">
          <div className="flex justify-between items-center border-b border-blue-100 pb-4">
            <div className="flex items-center gap-2">
              <BrainCircuit className="text-blue-650" size={20} />
              <h3 className="font-display font-semibold text-lg text-slate-900">AI Smart Insights</h3>
            </div>
            <button
              id="btn-retrigger-insights"
              onClick={onRefreshAI}
              disabled={loadingAI}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold font-mono flex items-center gap-1 active:scale-95 transition disabled:opacity-50 cursor-pointer"
            >
              {loadingAI ? 'Scanning...' : 'Re-Analyze'}
            </button>
          </div>

          {/* Insights Cards */}
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[360px] pr-1">
            {loadingAI ? (
              <div className="space-y-4 py-8">
                <div className="animate-pulse bg-slate-200 h-16 rounded-xl w-full"></div>
                <div className="animate-pulse bg-slate-200 h-24 rounded-xl w-full"></div>
                <p className="text-center text-xs text-slate-500 font-mono animate-pulse">Gemini-3.5-flash scanning mock indexes...</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {aiInsights.insights.map((ins, idx) => (
                    <div key={idx} className="p-3 bg-white border border-blue-100/50 hover:border-blue-200 rounded-xl flex gap-3 text-xs leading-relaxed transition-all shadow-sm">
                      <span className="text-blue-500 text-lg mt-0.5">•</span>
                      <p className="text-slate-700">{ins}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-200/60 space-y-3">
                  <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-blue-700">Priority coaching actions</h4>
                  {aiInsights.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3.5 bg-white border border-blue-100 rounded-xl space-y-1 hover:border-blue-200 transition shadow-sm">
                      <span className="text-[10px] font-bold text-blue-600 font-mono uppercase tracking-wide">{rec.title}</span>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans">{rec.suggestion}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* 3. Recent 3 Mock Log list panel */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900">Recent Mock Attempts</h3>
            <p className="text-slate-500 text-xs mt-0.5">Quick summaries of your last 3 compiled mock tests</p>
          </div>
          <button onClick={onOpenForm} className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1 pr-1.5 cursor-pointer">Submit Another Mock</button>
        </div>

        <div className="space-y-3">
          {recentMocks.length === 0 ? (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <p className="text-sm">No mocks logged yet.</p>
              <button 
                onClick={onOpenForm}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Log First Mock
              </button>
            </div>
          ) : (
            recentMocks.slice(0, 3).map((mock) => (
              <div 
                key={mock.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/80 hover:border-blue-400 rounded-2xl gap-4 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex flex-col items-center justify-center font-mono">
                    <span className="text-[10px] font-bold leading-none">{mock.examType}</span>
                    <span className="text-[8px] uppercase tracking-wider scale-90 font-bold mt-0.5 opacity-60">{mock.platform.split(' ')[0]}</span>
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-slate-900 text-sm">{mock.mockNumber}</h4>
                    <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                      <span>Date: {mock.date}</span>
                      <span>•</span>
                      <span className="text-blue-600 font-semibold">{mock.mockType} Category</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 md:flex items-center gap-4 md:gap-8 font-mono text-center md:text-right">
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 block mb-0.5">Score</span>
                    <span className="text-sm font-extrabold text-slate-900">{mock.score}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 block mb-0.5">Rank</span>
                    <span className="text-sm font-semibold text-slate-600">#{mock.overallRank}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 block mb-0.5">Percentile</span>
                    <span className="text-sm font-extrabold text-blue-600">{mock.percentile}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-400 block mb-0.5">Accuracy</span>
                    <span className="text-sm font-semibold text-emerald-600">{mock.accuracy}%</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}
// Helper to clamp accuracy calculations
function parseSecPercent(sec: any) {
  if (!sec) return 70;
  return Math.round(sec.accuracy || 70);
}
