import React, { useState } from 'react';
import { 
  Bell, 
  Flame, 
  Layers, 
  Plus, 
  Search, 
  Menu,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  totalMocks: number;
  onOpenForm: () => void;
  onToggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  liveNotifications: Array<{ message: string; timestamp: string }>;
  clearNotifications: () => void;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Header({
  user,
  totalMocks,
  onOpenForm,
  onToggleSidebar,
  searchQuery,
  setSearchQuery,
  liveNotifications,
  clearNotifications,
  setActiveTab,
  onLogout
}: HeaderProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header 
      id="main-app-header"
      className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-20 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 w-full animate-fade-in"
    >
      {/* Mobile menu toggle & greeting */}
      <div className="flex items-center gap-4">
        <button 
          id="mobile-sidebar-toggle"
          onClick={onToggleSidebar}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 border border-slate-250 text-slate-500 hover:text-slate-800 transition cursor-pointer"
        >
          <Menu size={20} />
        </button>
 
        <div className="hidden sm:flex flex-col">
          <h1 className="font-display font-bold text-xl text-slate-900 tracking-tight">
            Welcome back, <span className="text-blue-600">{user.name}</span>! 👋
          </h1>
          <p className="text-xs text-slate-500 font-sans tracking-wide">Your percentile is up since yesterday.</p>
        </div>
      </div>
 
      {/* Global search */}
      <div className="hidden md:flex items-center max-w-md w-72 bg-slate-100 border border-slate-200 rounded-full px-4 py-2 focus-within:border-blue-400 focus-within:bg-white transition duration-200">
        <Search size={16} className="text-slate-400 mr-2" />
        <input
          id="search-input-header"
          type="text"
          placeholder="Search mocks, platforms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full"
        />
      </div>
 
      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Streak counts (Geometric design) */}
        <div 
          id="streak-widget"
          title="Daily Streak System" 
          className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1.5 md:px-4 md:py-2 text-slate-700 font-mono text-xs font-bold cursor-default"
        >
          <div className="w-5 h-5 bg-orange-500/10 rounded flex items-center justify-center text-orange-500 text-xs">🔥</div>
          <span className="hidden xs:inline">{user.streakCount} Day Streak</span>
          <span className="xs:hidden">{user.streakCount}d</span>
        </div>
 
        {/* Total mocks */}
        <div 
          id="total-mocks-widget"
          title="Total completed mocks" 
          className="hidden space-x-1 xs:flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-4 py-2 text-slate-700 font-mono text-xs font-bold cursor-default"
        >
          <Layers size={14} className="text-blue-500" />
          <span>{totalMocks} Attempted</span>
        </div>
 
        {/* Notification system */}
        <div className="relative">
          <button
            id="notifications-bell"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer relative"
          >
            <Bell size={18} />
            {liveNotifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                {liveNotifications.length}
              </span>
            )}
          </button>
 
          {/* Dropdown */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 z-50 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="text-xs font-bold text-slate-900 tracking-wide font-display">Live Notifications</span>
                {liveNotifications.length > 0 && (
                  <button 
                    onClick={clearNotifications}
                    className="text-[10px] text-blue-600 hover:underline cursor-pointer font-bold"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {liveNotifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No new updates or alerts.</p>
                ) : (
                  liveNotifications.map((notif, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <p className="text-slate-700 font-sans leading-relaxed">{notif.message}</p>
                      <span className="text-[9px] text-slate-400 font-mono tracking-wider">
                        {new Date(notif.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
 
        {/* Action Button: Submit Mock */}
        <button
          id="btn-trigger-mock-submission"
          onClick={onOpenForm}
          className="flex items-center gap-1.5 px-4 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 hover:opacity-95 text-white rounded-lg text-sm font-semibold tracking-wide shadow-lg shadow-blue-500/20 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Log New Mock</span>
        </button>
 
        {/* User profile dropdown container */}
        <div className="relative border-l border-slate-200 pl-3">
          <button
            id="nav-profile-menu-trigger"
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotifDropdown(false); // Close notifications if open
            }}
            className="flex items-center gap-1.5 focus:outline-none rounded-full p-1 hover:bg-slate-50 transition cursor-pointer"
          >
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=105&fit=crop'}
              alt={user.name}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 border border-slate-200 object-cover object-top"
            />
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* User Profile Dropdown Menu */}
          {showProfileDropdown && (
            <div 
              id="nav-profile-dropdown"
              className="absolute right-0 mt-2 w-56 bg-white border border-slate-205 shadow-2xl rounded-2xl p-2.5 z-50 text-left animate-fade-in"
            >
              {/* Profile details header area */}
              <div className="px-3 py-2 border-b border-slate-100 mb-2">
                <p className="text-xs font-bold text-slate-900 truncate leading-none mb-1.5">{user.name}</p>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-mono text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-150 leading-none">{user.targetExam || 'SSC CGL'}</span>
                  <span className="text-[9px] text-slate-400 truncate leading-none">Candidate</span>
                </div>
              </div>

              {/* Action options */}
              <div className="space-y-1">
                <button
                  id="dropdown-item-profile"
                  onClick={() => {
                    setActiveTab('profile');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-705 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition text-left cursor-pointer"
                >
                  <span className="text-sm leading-none">👤</span>
                  <span>View Profile & Security</span>
                </button>

                <button
                  id="dropdown-item-tracker"
                  onClick={() => {
                    setActiveTab('study-tracker');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-705 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition text-left cursor-pointer"
                >
                  <span className="text-sm leading-none">📅</span>
                  <span>Daily Study Tracker</span>
                </button>

                <button
                  id="dropdown-item-leaderboard"
                  onClick={() => {
                    setActiveTab('leaderboard');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-705 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition text-left cursor-pointer"
                >
                  <span className="text-sm leading-none">🏆</span>
                  <span>Competitive Leaderboard</span>
                </button>

                {/* Separator line */}
                <div className="border-t border-slate-100 my-1"></div>

                <button
                  id="dropdown-item-logout"
                  onClick={() => {
                    setShowProfileDropdown(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition text-left cursor-pointer"
                >
                  <span className="text-sm leading-none">🚪</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
 
      </div>
    </header>
  );
}
