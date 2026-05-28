import React from 'react';
import { 
  LayoutDashboard, 
  History, 
  BarChart3, 
  Trophy, 
  Activity, 
  BookOpen, 
  GitCompare, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  onLogout: () => void;
  userName: string;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  collapsed, 
  setCollapsed, 
  onLogout,
  userName 
}: SidebarProps) {
  
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', name: 'Mock History', icon: History },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'leaderboard', name: 'Leaderboard', icon: Trophy },
    { id: 'weak-topics', name: 'Weak Topics', icon: Activity },
    { id: 'study-tracker', name: 'Study Tracker', icon: BookOpen },
    { id: 'comparison', name: 'Platform Comparison', icon: GitCompare },
    { id: 'profile', name: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Dynamic backdrop shade over main content on mobile viewports */}
      {!collapsed && (
        <div 
          id="sidebar-backdrop-overlay"
          onClick={() => setCollapsed(true)} 
          className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      <aside 
        id="sidebar-container"
        className={`bg-white/95 backdrop-blur-xl flex flex-col transition-all duration-300 z-50 fixed lg:sticky lg:top-0 h-screen border-r border-slate-200 ${
          collapsed 
            ? 'w-64 -translate-x-full lg:translate-x-0 lg:w-20' 
            : 'w-64 translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between h-20">
          <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'lg:justify-center lg:w-full' : ''}`}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-display font-bold text-white text-lg shadow-lg shadow-blue-500/20 flex-shrink-0 animate-fade-in">
              F64
            </div>
            {/* Show brand label if not collapsed OR if currently displayed on mobile */}
            {(!collapsed || collapsed /* on mobile, we hide via translation, on lg we hide text with css */) && (
              <div className={`flex flex-col ${collapsed ? 'lg:hidden' : ''}`}>
                <span className="font-display font-bold tracking-tight text-slate-900 leading-5">F64 Academy</span>
                <span className="text-[10px] text-slate-500 font-mono tracking-wider font-bold uppercase transition">Mock Tracker</span>
              </div>
            )}
          </div>
          
          {/* Toggle Collapse Button for Large Screens */}
          <button 
            id="toggle-sidebar"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Close sliding menu button for mobile screens */}
          {!collapsed && (
            <button
              id="mobile-close-sidebar"
              onClick={() => setCollapsed(true)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                id={`nav-item-${item.id}`}
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  // Auto-collapse sidebar on narrow layouts when selection is made
                  if (window.innerWidth < 1024) {
                    setCollapsed(true);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-left border cursor-pointer relative ${
                  isActive 
                    ? 'bg-blue-50 border-blue-200 text-blue-600 font-semibold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent'
                }`}
              >
                {isActive && !collapsed ? (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 animate-ping absolute -left-1 hidden lg:block" />
                ) : null}
                
                <Icon 
                  size={18} 
                  className={`transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-900'}`} 
                />
                <span className={`font-sans text-sm tracking-wide ${collapsed ? 'lg:hidden' : ''}`}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer Profile Details / Logout */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className={`bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col ${collapsed ? 'lg:hidden' : ''}`}>
            <span className="text-[10px] text-blue-600 uppercase font-mono font-bold tracking-wider">Candidate</span>
            <span className="text-sm font-semibold text-slate-850 mt-0.5 truncate">{userName}</span>
          </div>

          <button
            id="btn-logout"
            onClick={onLogout}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition group text-left cursor-pointer ${
              collapsed ? 'lg:justify-center' : ''
            }`}
          >
            <LogOut size={18} className="group-hover:translate-x-0.5 transition duration-200" />
            <span className={`font-sans text-sm tracking-wide ${collapsed ? 'lg:hidden' : ''}`}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
