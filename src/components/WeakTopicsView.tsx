import React from 'react';
import { ShieldAlert, BookOpen, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';
import { WeakTopicStat } from '../types';

interface WeakTopicsViewProps {
  weakTopics: WeakTopicStat[];
}

export default function WeakTopicsView({ weakTopics }: WeakTopicsViewProps) {
  
  if (weakTopics.length === 0) {
    return (
      <div className="text-center py-24 bg-white border border-slate-200 rounded-3xl space-y-4 animate-fade-in shadow-sm">
        <ShieldAlert size={48} className="text-rose-500 mx-auto animate-pulse" />
        <h3 className="font-display font-bold text-lg text-slate-800">No weak topics logged yet</h3>
        <p className="text-slate-400 text-xs max-w-sm mx-auto">Submit mock assessments containing specific chapter failures to configure mistake frequency matrices.</p>
      </div>
    );
  }

  // Group by subjects
  const grouped = weakTopics.reduce((acc: Record<string, WeakTopicStat[]>, curr) => {
    if (!acc[curr.subject]) {
      acc[curr.subject] = [];
    }
    acc[curr.subject].push(curr);
    return acc;
  }, {});

  const getSubjectColor = (subj: string) => {
    switch(subj) {
      case 'Mathematics': return 'text-rose-700 border-rose-200 bg-rose-50';
      case 'Reasoning': return 'text-violet-700 border-violet-200 bg-violet-50';
      case 'English': return 'text-indigo-700 border-indigo-200 bg-indigo-50';
      case 'GeneralKnowledge': return 'text-emerald-700 border-emerald-200 bg-emerald-50';
      default: return 'text-slate-700 border-slate-200 bg-slate-50';
    }
  };

  const getClassColor = (cls: string) => {
    if (cls === 'Weak') return 'bg-rose-50 text-rose-600 border-rose-150';
    if (cls === 'Strong') return 'bg-emerald-50 text-emerald-600 border-emerald-150';
    return 'bg-amber-50 text-amber-600 border-amber-150';
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in font-sans">
      
      {/* Overview Block */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900">Weak Topic Analytical Engine</h3>
          <p className="text-slate-500 text-xs mt-0.5">Automated mistake frequency matrix grouping chapter-wise logical discrepancies</p>
        </div>
        <span className="px-3.5 py-1 text-xs font-semibold rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center gap-1.5 self-start md:self-auto">
          <ShieldAlert size={14} className="animate-pulse" />
          {weakTopics.length} Bottleneck Areas Logged
        </span>
      </div>

      {/* Heatmap Area Grid */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-800 tracking-wide uppercase border-b border-slate-100 pb-2 font-display font-bold">Mistake Frequency Heatmap Grid</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {weakTopics.slice(0, 4).map((stat, idx) => (
            <div 
              id={`weak-heatmap-grid-${idx}`}
              key={idx} 
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-350 transition shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-slate-500">{stat.subject}</span>
                <span className="text-xs bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full font-bold font-mono">
                  {stat.frequency} Mistakes
                </span>
              </div>
              <h5 className="font-display text-slate-900 text-base font-extrabold truncate max-w-full">{stat.topic}</h5>
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>Accuracy margin</span>
                  <span className="font-bold text-rose-600">{stat.accuracy}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${stat.accuracy}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grouped Lists details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {Object.entries(grouped).map(([subj, items]) => (
          <div key={subj} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className={`p-3 rounded-2xl border flex justify-between items-center ${getSubjectColor(subj)}`}>
              <span className="text-xs uppercase font-mono font-bold tracking-wider">{subj} Diagnostics</span>
              <span className="text-xs font-bold leading-none font-mono">
                {items.length} Flagged Topics
              </span>
            </div>

            <div className="space-y-3">
              {items.map((item, idy) => (
                <div key={idy} className="p-3.5 bg-slate-50 border border-slate-200/50 hover:border-slate-300 rounded-xl flex items-center justify-between transition gap-4">
                  <div className="space-y-1 min-w-0">
                    <h5 className="text-sm font-semibold text-slate-800 truncate max-w-sm">{item.topic}</h5>
                    <div className="flex gap-2">
                      <span className={`text-[9px] px-2 py-0.2 rounded-full font-bold uppercase border ${getClassColor(item.classification)}`}>
                        {item.classification} Risk
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">Mistakes: {item.mistakesCount} times</span>
                    </div>
                  </div>

                  <div className="text-right text-xs font-mono font-bold">
                    <span className="text-slate-400 block text-[9px] uppercase font-sans font-bold">Accuracy</span>
                    <span className={`${item.accuracy < 60 ? 'text-rose-600' : 'text-emerald-400'}`}>{item.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
