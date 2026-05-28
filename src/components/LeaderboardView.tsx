import React, { useState } from 'react';
import { Trophy, Flame, Search, Medal, Layers, Sparkles, User, Users } from 'lucide-react';
import { LeaderboardUser } from '../types';

interface LeaderboardViewProps {
  leaderboard: LeaderboardUser[];
}

export default function LeaderboardView({ leaderboard }: LeaderboardViewProps) {
  const [filter, setFilter] = useState<'global' | 'streak' | 'accuracy'>('global');
  const [search, setSearch] = useState('');

  // Sorter / Filter logics
  let orderedLeaderboard = [...leaderboard];
  
  if (filter === 'streak') {
    orderedLeaderboard.sort((a,b) => b.dailyStreak - a.dailyStreak);
  } else if (filter === 'accuracy') {
    orderedLeaderboard.sort((a,b) => b.accuracy - a.accuracy);
  } else {
    // global sorting by avgScore
    orderedLeaderboard.sort((a,b) => b.avgScore - a.avgScore);
  }

  // Apply search query
  const searchedList = orderedLeaderboard.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  // Recalculate incremental rank numbers according to sorting choice
  const rankedList = searchedList.map((user, idx) => ({
    ...user,
    displayRank: idx + 1
  }));

  // Top 3 Podium Winners extract
  const podiumTop3 = rankedList.slice(0, 3);
  const coreCompetitorsList = rankedList.slice(3);

  const getPodiumClass = (rank: number) => {
    switch(rank) {
      case 1: return 'from-yellow-500/10 via-yellow-100/5 to-transparent border-yellow-300 shadow-sm bg-yellow-50/30';
      case 2: return 'from-slate-400/10 via-slate-100/5 to-transparent border-slate-300 shadow-sm bg-slate-50/30';
      case 3: return 'from-amber-600/10 via-amber-100/5 to-transparent border-amber-300 shadow-sm bg-amber-50/30';
      default: return 'from-slate-50 to-transparent';
    }
  };

  const getPodiumBadgeColor = (rank: number) => {
    switch(rank) {
      case 1: return 'text-yellow-700 bg-yellow-105 border-yellow-200';
      case 2: return 'text-slate-700 bg-slate-105 border-slate-200';
      case 3: return 'text-amber-700 bg-amber-105 border-amber-200';
      default: return 'text-slate-400';
    }
  };

  const getPodiumCrown = (rank: number) => {
    switch(rank) {
      case 1: return '🥇 1st Rank';
      case 2: return '🥈 2nd Rank';
      case 3: return '🥉 3rd Rank';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in font-sans">
      
      {/* 1. Header Summaries */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900 font-bold">Active candidate leaderboards</h3>
          <p className="text-slate-500 text-xs mt-0.5">Real-time candidate comparisons based on aggregated mocks scores</p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            id="lb-filter-global"
            onClick={() => setFilter('global')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filter === 'global' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            Global Arena
          </button>
          <button
            id="lb-filter-streak"
            onClick={() => setFilter('streak')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filter === 'streak' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            Daily Streakers
          </button>
          <button
            id="lb-filter-accuracy"
            onClick={() => setFilter('accuracy')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
              filter === 'accuracy' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            Precision Masters
          </button>
        </div>
      </div>

      {/* 2. Top Podium Card Layout */}
      {podiumTop3.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {podiumTop3.map((winner) => (
            <div
              id={`podium-card-${winner.displayRank}`}
              key={winner.userId}
              className={`bg-white border bg-gradient-to-b ${getPodiumClass(winner.displayRank)} ${winner.isCurrentUser ? 'border-blue-600 ring-2 ring-blue-500/10' : 'border-slate-200'} rounded-2xl p-6 relative overflow-hidden flex flex-col items-center text-center shadow-sm transition-all duration-300 hover:-translate-y-1`}
            >
              <div className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${getPodiumBadgeColor(winner.displayRank)} border border-slate-200 mb-4`}>
                {getPodiumCrown(winner.displayRank)}
              </div>

              {/* Profile Image with Ring glows */}
              <div className="relative mb-3">
                <img
                  src={winner.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'}
                  alt={winner.name}
                  className="w-16 h-16 rounded-full border-2 border-slate-100 p-0.5 object-cover"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full border border-white flex items-center justify-center text-[10px] font-bold text-white">
                  {winner.displayRank}
                </span>
              </div>

              <h4 className="font-display font-bold text-slate-850 text-base tracking-tight flex items-center gap-1.5 truncate max-w-full">
                {winner.name}
                {winner.isCurrentUser && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-600 uppercase font-mono font-bold">you</span>
                )}
              </h4>
              <span className="text-[10px] text-blue-600 font-mono mt-1 font-bold tracking-wide uppercase">{winner.achievementBadge || 'Academy Scholar'}</span>

              <div className="grid grid-cols-3 gap-2 w-full mt-6 pt-6 border-t border-slate-100 text-center font-mono text-xs">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-sans font-semibold">Avg score</span>
                  <strong className="text-slate-800 text-sm font-extrabold">{winner.avgScore}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-sans font-semibold">Percentile</span>
                  <strong className="text-blue-600 text-sm font-extrabold">{winner.avgPercentile}%</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-sans font-semibold">Streak</span>
                  <strong className="text-amber-600 text-sm flex items-center justify-center gap-0.5 font-extrabold">
                    <Flame size={12} className="fill-current text-amber-500" />
                    {winner.dailyStreak}d
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 3. Core Competitor list arena */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 mb-2 flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600">Competitive Core entries</h4>
          <div className="relative w-48 font-sans">
            <Search size={12} className="text-slate-450 absolute left-2.5 top-3 text-slate-400" />
            <input
              id="lb-search-field"
              type="text"
              placeholder="Search competitors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-blue-400 rounded-lg text-[11px] text-slate-800 focus:outline-none placeholder-slate-400"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100 font-sans">
          {coreCompetitorsList.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-505">No other competitors in list.</p>
          ) : (
            coreCompetitorsList.map((competitor) => (
              <div 
                key={competitor.userId}
                className={`flex items-center justify-between p-4 px-6 hover:bg-slate-50 transition ${competitor.isCurrentUser ? 'bg-blue-50/60 hover:bg-blue-50/80 font-bold' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Dynamic Index Rank */}
                  <span className="w-6 text-sm font-mono font-bold text-slate-400 text-center">
                    {competitor.displayRank}
                  </span>

                  {/* Avatar & Title indicators */}
                  <img
                    src={competitor.avatar || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'}
                    alt={competitor.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />

                  <div className="space-y-0.5">
                    <h5 className="text-slate-800 text-sm font-semibold tracking-tight flex items-center gap-2">
                      {competitor.name}
                      {competitor.isCurrentUser && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 border border-blue-200 text-blue-600 uppercase font-mono font-extrabold scale-90">you</span>
                      )}
                    </h5>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono uppercase tracking-wide">
                      <span>Mocks: {competitor.totalMocks}</span>
                      <span>•</span>
                      <span>Accuracy: {competitor.accuracy}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 font-mono text-sm">
                  <div className="text-right">
                    <span className="text-[9px] font-sans font-bold text-slate-400 uppercase block mb-0.5">Avg Score</span>
                    <strong className="text-slate-800 font-extrabold">{competitor.avgScore}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-sans font-bold text-blue-600 uppercase block mb-0.5">Percentile</span>
                    <strong className="text-blue-600 font-extrabold">{competitor.avgPercentile}%</strong>
                  </div>
                  <div className="text-right hidden xs:block">
                    <span className="text-[9px] font-sans font-bold text-amber-500 uppercase block mb-0.5">Streak</span>
                    <strong className="text-amber-600 flex items-center gap-0.5 justify-end font-extrabold">
                      <Flame size={12} className="fill-amber-500 text-amber-500" />
                      {competitor.dailyStreak}d
                    </strong>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
