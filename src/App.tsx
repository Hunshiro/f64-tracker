import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Sparkles, 
  Menu, 
  X, 
  Layers, 
  AlertCircle, 
  Grid, 
  Bell, 
  ChevronRight,
  LogOut,
  Flame,
  Award
} from 'lucide-react';
import { api, initSocket, disconnectSocket, getToken, clearToken } from './services/api';
import { UserProfile, UserStats, MockAttempt, LeaderboardUser, WeakTopicStat } from './types';

// App Views imports
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import DashboardView from './components/DashboardView';
import MockHistoryView from './components/MockHistoryView';
import AnalyticsView from './components/AnalyticsView';
import LeaderboardView from './components/LeaderboardView';
import WeakTopicsView from './components/WeakTopicsView';
import StudyTrackerView from './components/StudyTrackerView';
import PlatformComparisonView from './components/PlatformComparisonView';
import ProfileView from './components/ProfileView';
import MockFormModal from './components/MockFormModal';

interface NotificationToast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'alert';
}

export default function App() {
  const [token, setToken] = useState<string | null>(getToken());
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [mocks, setMocks] = useState<MockAttempt[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [weakTopics, setWeakTopics] = useState<WeakTopicStat[]>([]);
  
  // Tab selector state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'analytics' | 'leaderboard' | 'weak-topics' | 'study-tracker' | 'comparison' | 'profile'>('dashboard');
  
  // Header search and alerts system
  const [searchQuery, setSearchQuery] = useState('');
  const [liveNotifications, setLiveNotifications] = useState<Array<{ message: string; timestamp: string }>>([
    { message: 'Welcome to F64 Mock Analytics Center!', timestamp: new Date().toISOString() },
    { message: 'Academic WebSockets active. Live benchmarks loaded.', timestamp: new Date().toISOString() }
  ]);

  // Side controls
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return true;
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  // AI insights storage
  const [aiInsights, setAIInsights] = useState<{ insights: string[]; recommendations: Array<{ title: string; suggestion: string }> }>({
    insights: [
      'Welcome to F64 Academy Mock Tracker! Log mock runs to trigger customized, real-time AI chapter diagnostic reviews.',
      'Maintain an active weekly testing habit to identify reasoning gaps or quant formula bottleneck areas.'
    ],
    recommendations: [
      { title: 'Algebra Intervention', suggestion: 'Increase study tracker hours specifically on Mensuration & Factorization to recover accuracy margins.' }
    ]
  });

  // Toasts Lists for beautiful real-time push alerts
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  const addToast = (message: string, type: 'info' | 'success' | 'alert' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Profile data fetch
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [data, fetchedMocks, lb, wt] = await Promise.all([
        api.getProfile(),
        api.getMocks(),
        api.getLeaderboard(),
        api.getWeakTopics()
      ]);
      setUser(data.user);
      setStats(data.stats);
      setMocks(fetchedMocks || []);
      setLeaderboard(lb);
      setWeakTopics(wt);
    } catch (err: any) {
      addToast(err.message || 'Failed to refresh assessment indexes.', 'alert');
    } finally {
      setLoading(false);
    }
  };

  // AI recommendation puller
  const triggerAIInsights = async () => {
    setLoadingAI(true);
    try {
      const data = await api.getAIInsights();
      setAIInsights(data);
      addToast('Gemini-3.5-flash generated new actionable improvements.', 'success');
    } catch (err: any) {
      addToast('Could not fetch Gemini suggestions. Check API keys.', 'info');
    } finally {
      setLoadingAI(false);
    }
  };

  // Real-time Event Broadcaster registration
  useEffect(() => {
    if (!token) return;

    fetchDashboardData();

    // Setup Socket IO listener & binds
    const socket = initSocket((type, data) => {
      if (type === 'newMockLogged') {
        addToast(`✨ ${data.userName} logged Score of ${data.score} (${data.percentile}%) on ${data.mockNumber}!`, 'success');
        // Auto-refresh leaderboard
        api.getLeaderboard().then(setLeaderboard);
      } else if (type === 'userJoined') {
        addToast(`🌟 Candidate ${data.name} stepped into the Arena!`, 'info');
        api.getLeaderboard().then(setLeaderboard);
      } else if (type === 'announcement') {
        addToast(`📢 F64 Academy: ${data.message}`, 'info');
      }
    });

    return () => {
      disconnectSocket();
    };
  }, [token]);

  // Auth Success Routine
  const handleAuthSuccess = (newToken: string, authedUser: UserProfile) => {
    setToken(newToken);
    setUser(authedUser);
    addToast(`Onboarded as ${authedUser.name}. Good luck tracking CGL!`, 'success');
  };

  // Add mock callback
  const handleAddMock = async (newMock: any) => {
    try {
      await api.addMock(newMock);
      addToast('Mock score successfully cataloged and broadcasted!', 'success');
      // Fetch fresh stats
      await fetchDashboardData();
      // Retrigger AI recommendation values to process weak topics automatically
      triggerAIInsights();
    } catch (err: any) {
      addToast(err.message || 'Failed log entry.', 'alert');
      throw err;
    }
  };

  // Delete mock callback
  const handleDeleteMock = async (id: string) => {
    const ok = window.confirm('Are you sure you want to permanently remove this mock record? This will adjust your averagings.');
    if (!ok) return;

    try {
      await api.deleteMock(id);
      addToast('Mock assessment record deleted.', 'info');
      await fetchDashboardData();
    } catch (err: any) {
      addToast(err.message || 'Could not delete entry.', 'alert');
    }
  };

  // Update profile
  const handleUpdateProfile = async (updates: any) => {
    try {
      const data = await api.updateProfile(updates);
      setUser(data.user);
      addToast('Target preferences configured.', 'success');
      await fetchDashboardData();
    } catch (err: any) {
      addToast(err.message || 'Failed profile update.', 'alert');
      throw err;
    }
  };

  // Log Out handler
  const handleLogout = () => {
    clearToken();
    setToken(null);
    setUser(null);
    setStats(null);
    setMocks([]);
  };

  if (!token) {
    return (
      <AuthPage 
        onAuthSuccess={handleAuthSuccess} 
        apiCall={async (url, form) => {
          if (url === '/api/auth/login') return api.login(form);
          if (url === '/api/upload') return api.uploadImage(form.image);
          return api.register(form);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex relative overflow-x-hidden font-sans">
      
      {/* 1. TOAST NOTIFICATIONS SLIDER ACCENT CONTAINER */}
      <div id="alerts-toasts-shelf" className="fixed top-6 right-6 z-50 pointer-events-none space-y-3 w-80">
        {toasts.map((toast) => (
          <div
            id={`toast-${toast.id}`}
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl bg-white shadow-2xl border border-slate-200 transition-all duration-300 flex gap-3 transform translate-x-0 ${
              toast.type === 'success' 
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800' 
                : toast.type === 'alert' 
                  ? 'border-rose-200 bg-rose-50 text-rose-800' 
                  : 'border-blue-200 bg-blue-50 text-blue-800'
            }`}
          >
            <Bell size={18} className="flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed font-semibold">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* 2. SIDEBAR NAVIGATION */}
      {user && (
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab: any) => setActiveTab(tab)} 
          collapsed={isSidebarCollapsed} 
          setCollapsed={setIsSidebarCollapsed} 
          onLogout={handleLogout}
          userName={user.name}
        />
      )}

      {/* 3. CORE LAYOUT VIEWPORTS AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* TOP BAR / HEADER */}
        {user && stats && (
          <Header 
            user={user} 
            totalMocks={stats.totalMocks} 
            onOpenForm={() => setIsFormOpen(true)} 
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            liveNotifications={liveNotifications}
            clearNotifications={() => setLiveNotifications([])}
            setActiveTab={(tab: any) => setActiveTab(tab)}
            onLogout={handleLogout}
          />
        )}

        {/* VIEWPORTS MASTER ROUTER */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-24 overflow-y-auto">
          {loading && !stats ? (
            <div className="space-y-4 py-24 text-center">
              <div className="animate-pulse bg-slate-200 h-12 w-32 rounded-xl mx-auto"></div>
              <div className="animate-pulse bg-slate-200/50 h-48 w-full max-w-xl rounded-2xl mx-auto"></div>
              <p className="text-slate-500 font-mono text-xs">Assembling live candidate matrices...</p>
            </div>
          ) : !stats || !user ? (
            <div className="text-center py-24 space-y-4">
              <AlertCircle size={36} className="text-rose-400 mx-auto" />
              <p className="text-xs text-gray-500">Database failed to load your tracking file. Please log out and sign in again.</p>
              <button onClick={handleLogout} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-xs font-semibold">Sign Out</button>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView 
                  stats={stats} 
                  user={user} 
                  recentMocks={mocks} 
                  aiInsights={aiInsights} 
                  loadingAI={loadingAI} 
                  onRefreshAI={triggerAIInsights}
                  onOpenForm={() => setIsFormOpen(true)}
                />
              )}

              {activeTab === 'history' && (
                <MockHistoryView 
                  mocks={mocks} 
                  onDeleteMock={handleDeleteMock} 
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView 
                  mocks={mocks} 
                />
              )}

              {activeTab === 'leaderboard' && (
                <LeaderboardView 
                  leaderboard={leaderboard} 
                />
              )}

              {activeTab === 'weak-topics' && (
                <WeakTopicsView 
                  weakTopics={weakTopics} 
                />
              )}

              {activeTab === 'study-tracker' && (
                <StudyTrackerView />
              )}

              {activeTab === 'comparison' && (
                <PlatformComparisonView 
                  mocks={mocks} 
                />
              )}

              {activeTab === 'profile' && (
                <ProfileView 
                  user={user} 
                  achievements={stats.achievements} 
                  onUpdateProfile={handleUpdateProfile} 
                />
              )}
            </>
          )}
        </main>

      </div>

      {/* 4. MODAL: LOG NEW MOCK RUN SYSTEM */}
      {isFormOpen && user && (
        <MockFormModal 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={handleAddMock} 
          userTargetExam={user.targetExam}
          userPrimaryPlatform={user.primaryPlatform}
        />
      )}

    </div>
  );
}
