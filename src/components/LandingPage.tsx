import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ArrowUpRight, 
  ShieldCheck, 
  Target, 
  Keyboard, 
  RotateCcw, 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Clock, 
  HelpCircle, 
  Trophy, 
  BookOpen, 
  Layers, 
  Check, 
  CheckCircle2, 
  ChevronDown, 
  Award, 
  Star, 
  Quote, 
  ArrowRight, 
  Play, 
  Activity, 
  LineChart,
  Lock,
  ThumbsUp,
  UserCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';

interface LandingPageProps {
  onStartAuth: (mode: 'login' | 'register') => void;
  onExploreDemo: () => void;
}

// Simulated data for interactive dashboard widget
const MOCK_ANALYTICS_DATA = [
  { name: 'Mock 1', score: 112, avgScore: 104, accuracy: 78 },
  { name: 'Mock 2', score: 128, avgScore: 108, accuracy: 82 },
  { name: 'Mock 3', score: 135, avgScore: 112, accuracy: 85 },
  { name: 'Mock 4', score: 152, avgScore: 115, accuracy: 92 },
  { name: 'Mock 5', score: 148, avgScore: 118, accuracy: 89 },
  { name: 'Mock 6', score: 164, avgScore: 121, accuracy: 94 },
];

const FAQS_LIST = [
  {
    q: "How does the SSC CGL Rank Predictor calculate results?",
    a: "Our algorithm matches your mock assessment scores against historical cut-offs from the Staff Selection Commission (SSC) from 2021-2025, normalized across major practice platforms (F64 Academy, Testbook, Oliveboard). It accounts for varying difficulty levels, cohort sizes, and dynamic target requirements to deliver accurate predicted percentiles."
  },
  {
    q: "Can I import mock stats from Oliveboard or Testbook?",
    a: "Absolutely! F64 Academy tracker acts as your centralized command center. Simply select your primary mock source platform when logging your test score, accuracy rate, and subject-wise sectional analysis to unlock unified analytics."
  },
  {
    q: "How does the Typing Test mimic the actual SSC exam?",
    a: "The final typing review layout strictly mirrors the 2,000 key depressions formatting required in 15 minutes by the SSC CGL. We track dynamic speed in Words Per Minute (WPM) alongside accurate error verification protocols for both Hindi and English configurations."
  },
  {
    q: "What triggers personalized Gemini AI coaching insights?",
    a: "Once you log at least two detailed mock evaluations in the tracking database, our centralized server queries Gemini models using a dedicated, private API context. It evaluates sectional bottlenecks, error margins, and platform variances to output highly structured study interventions."
  }
];

export default function LandingPage({ onStartAuth, onExploreDemo }: LandingPageProps) {
  // Stats counter state simulation
  const [stats, setStats] = useState({ questions: 42000, mocks: 850, rate: 95 });
  
  // Custom interactive Predictor States
  const [scoreInput, setScoreInput] = useState<number>(145);
  const [predResult, setPredResult] = useState({ rank: '420 - 580', percentile: 99.12, label: 'Highest Tier (Excise ASO Qualified)' });

  // Custom live Typing simulator states
  const [typingLang, setTypingLang] = useState<'english' | 'hindi'>('english');
  const [typedText, setTypedText] = useState('');
  const [testTime, setTestTime] = useState(0);
  const [isTypingActive, setIsTypingActive] = useState(false);
  const [typingWPM, setTypingWPM] = useState(0);
  const [typingAccuracy, setTypingAccuracy] = useState(100);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // FAQ collapse state Array index tracker
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Particles position matching mouse spotlight
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const sampleSentences = {
    english: "The Staff Selection Commission is an Indian government organisation to recruit staff for various secretarial positions in Ministries.",
    hindi: "कर्मचारी चयन आयोग भारत सरकार के विभिन्न मंत्रालयों और विभागों प्रशासनिक पदों पर भर्ती के लिए योग्य उम्मीदवारों का चयन करता है।"
  };

  const targetSentence = sampleSentences[typingLang];

  // Mouse tracking glowing parallax effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Simulate counter increments gracefully on launch
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        if (prev.questions >= 50000) {
          clearInterval(interval);
          return { questions: 50000, mocks: 1000, rate: 98 };
        }
        return {
          questions: prev.questions + 400,
          mocks: prev.mocks + 8,
          rate: prev.rate < 98 ? prev.rate + 1 : 98
        };
      });
    }, 20);
    return () => clearInterval(interval);
  }, []);

  // Recalculate rank predictions live when score shifts
  useEffect(() => {
    if (scoreInput >= 180) {
      setPredResult({ rank: '1 - 15', percentile: 99.98, label: 'Double A.O. / Top Rank Assured' });
    } else if (scoreInput >= 165) {
      setPredResult({ rank: '35 - 120', percentile: 99.81, label: 'ASO Ministry of External Affairs Tier' });
    } else if (scoreInput >= 150) {
      setPredResult({ rank: '180 - 390', percentile: 99.45, label: 'Inspector Income Tax / Custom Officer' });
    } else if (scoreInput >= 135) {
      setPredResult({ rank: '750 - 1500', percentile: 98.15, label: 'Auditor & Accountant Positions' });
    } else if (scoreInput >= 115) {
      setPredResult({ rank: '4800 - 8700', percentile: 92.50, label: 'Tax Assistant & Postal Division Tier' });
    } else {
      setPredResult({ rank: '18500 - 24000', percentile: 81.30, label: 'Borderline Cut-Off / Critical Revision Needed' });
    }
  }, [scoreInput]);

  // Typing simulator logic
  const handleTypingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setTypedText(val);

    if (!isTypingActive && val.length > 0) {
      setIsTypingActive(true);
      setTestTime(0);
      typingTimerRef.current = setInterval(() => {
        setTestTime(prev => prev + 1);
      }, 1000);
    }

    // Verify WPM (Standard 5 characters = 1 word)
    const words = val.length / 5;
    const minutes = Math.max(testTime, 1) / 60;
    setTypingWPM(Math.round(words / minutes));

    // Accuracy calculator (compare chars)
    let correctChars = 0;
    const minLen = Math.min(val.length, targetSentence.length);
    for (let i = 0; i < minLen; i++) {
      if (val[i] === targetSentence[i]) {
        correctChars++;
      }
    }
    const acc = val.length > 0 ? Math.round((correctChars / val.length) * 100) : 100;
    setTypingAccuracy(acc);
  };

  const handleResetTyping = () => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setIsTypingActive(false);
    setTypedText('');
    setTestTime(0);
    setTypingWPM(0);
    setTypingAccuracy(100);
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden font-sans relative selection:bg-blue-600 selection:text-white" onMouseMove={handleMouseMove}>
      
      {/* Dynamic Animated Background Mesh */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none opacity-25 filter blur-3xl transition-all duration-300 z-0 bg-blue-300"
        style={{
          left: `${mousePos.x - 300}px`,
          top: `${mousePos.y - 300}px`,
        }}
      />
      <div className="absolute top-10 right-20 w-[450px] h-[450px] bg-indigo-300/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-[1200px] left-5 w-[380px] h-[380px] bg-cyan-300/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Modern Navigation Header Strip */}
      <nav id="landing-navbar" className="glass sticky top-0 z-50 w-full px-6 py-4 border-b border-slate-200/60 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-7">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-display font-black text-white text-base tracking-tighter shadow">
              F64
            </div>
            <span className="font-display font-extrabold text-base tracking-tight text-slate-950 uppercase">
              F64 Academy<span className="text-blue-600">.</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-5">
            <a href="#features-preview" className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition">Features</a>
            <a href="#interactive-charts" className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition">Analytics Preview</a>
            <a href="#rank-calculator" className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition">Rank Predictor</a>
            <a href="#typing-gym" className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition">Type Practice</a>
            <a href="#faq" className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition">FAQ</a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            id="nav-login-btn"
            onClick={() => onStartAuth('login')}
            className="px-4 py-2 text-xs font-bold text-slate-650 hover:text-blue-600 transition cursor-pointer"
          >
            Sign In
          </button>
          <button 
            id="nav-signup-btn"
            onClick={() => onStartAuth('register')}
            className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold leading-none tracking-tight shadow-sm hover:shadow transition active:scale-95 cursor-pointer"
          >
            Start Free
          </button>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <header className="relative w-full max-w-7xl mx-auto px-6 pt-12 pb-20 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 text-left">
        
        {/* Hero Left Content */}
        <div className="space-y-6 md:space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-150 rounded-full text-[10.5px] font-bold text-blue-700 uppercase tracking-wider shadow-2xs">
            <Sparkles size={11} className="text-blue-500 animate-spin" />
            Empowered with real-time analytics
          </div>

          <h1 className="font-display font-extrabold text-4xl md:text-5xl lg:text-5xl text-slate-900 tracking-tight leading-tight">
            Crack SSC CGL with <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Data, Mock Analytics
            </span><br />
            & Smart Practice.
          </h1>

          <p className="text-slate-505 text-sm md:text-base leading-relaxed max-w-lg font-sans font-medium">
            Track scores across Testbook, Oliveboard, & PracticeMock. Utilize predictive AI evaluation metrics, test English/Hindi typing, and conquer critical subject gaps instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1.5">
            <button 
              id="hero-start-free"
              onClick={() => onStartAuth('register')}
              className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold tracking-wide shadow-md hover:shadow-lg transition transform active:scale-97 cursor-pointer flex items-center justify-center gap-2"
            >
              Start Free Training <ArrowRight size={16} />
            </button>
            
            <button 
              id="hero-explore-demo"
              onClick={onExploreDemo}
              className="px-7 py-3.5 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-3xs"
            >
              Explore Instant Demo <Play size={10} className="fill-slate-600" />
            </button>
          </div>

          {/* Bullet trust tags */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/80 max-w-md">
            <div>
              <p className="text-xs font-bold text-slate-800">Unified Tracker</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Testbook / OB import ready</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">WPM Verified</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Real exam simulation</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Precision Rank</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">Competitive percentile metrics</p>
            </div>
          </div>
        </div>

        {/* Hero Right Visual: Static Mock Preview */}
        <div className="relative flex justify-center lg:justify-end">
          
          {/* Glass Card Dashboard Preview Wrapper */}
          <div className="w-full max-w-lg bg-white/80 rounded-3xl p-5 border border-slate-200 shadow-2xl glass relative transform hover:scale-[1.01] transition-transform duration-300 flex flex-col gap-4">
            
            {/* Header element overlay */}
            <div className="flex items-center justify-between border-b border-indigo-50/50 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 block animate-pulse"></span>
                <p className="text-xs font-mono font-bold text-slate-800">Unified Mock Analytics Suite</p>
              </div>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">SSC CGL Tier 1</span>
            </div>

            {/* Quick stats grid inside dashboard visual */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-center space-y-1">
                <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Latest Score</p>
                <p className="text-lg font-bold text-blue-600">164.5<span className="text-xs text-slate-400">/200</span></p>
                <p className="text-[9px] text-emerald-600 font-semibold leading-none">▲ 9.2% progress</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-center space-y-1">
                <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Avg Accuracy</p>
                <p className="text-lg font-bold text-slate-800">92.4%</p>
                <p className="text-[9px] text-blue-500 font-semibold leading-none">Top 1.5% ranker</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-center space-y-1">
                <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Predicted Percentile</p>
                <p className="text-lg font-bold text-indigo-700">99.12%</p>
                <p className="text-[9px] text-indigo-500 font-semibold leading-none">Rank predict: #420</p>
              </div>
            </div>

            {/* Simulated Recharts display inside visual mockup */}
            <div className="h-44 bg-slate-50 rounded-2xl border border-slate-200/80 p-3.5 flex flex-col justify-between">
              <p className="text-[11px] font-bold text-slate-800 mb-2 font-display flex items-center justify-between">
                <span>Accuracy Trend Graph</span>
                <span className="text-[9px] text-slate-450 font-mono">Last 6 iterations</span>
              </p>
              <div className="flex-1 w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_ANALYTICS_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 10 }} />
                    <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Floating micro indicators */}
            <div className="absolute -bottom-4 -left-4 bg-slate-900 text-white rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 border border-slate-850 animate-bounce max-w-[210px]">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-base leading-none">🏆</div>
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400 font-semibold uppercase leading-none">F64 Target Leaderboard</p>
                <p className="text-xs font-bold truncate">Prabhanshu T. • #2 Active</p>
              </div>
            </div>

          </div>

        </div>

      </header>

      {/* 2. Trusted Statistics Section */}
      <section className="bg-white border-y border-slate-200/80 w-full py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center items-center">
          
          <div className="space-y-2">
            <p className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tight">
              {stats.questions.toLocaleString()}+
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">PYQ Practice questions</p>
          </div>

          <div className="space-y-2">
            <p className="text-3xl md:text-4xl font-display font-black text-blue-600 tracking-tight">
              {stats.mocks.toLocaleString()}+
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Mock tests logged</p>
          </div>

          <div className="space-y-2">
            <p className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tight">
              {stats.rate}%
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">CGL Satisfaction Index</p>
          </div>

          <div className="space-y-2">
            <p className="text-3xl md:text-4xl font-display font-black text-indigo-650 tracking-tight">
              24/7
            </p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">Daily study routines active</p>
          </div>

        </div>
      </section>

      {/* 3. Feature Showcase */}
      <section id="features-preview" className="max-w-7xl mx-auto px-6 py-20 text-center space-y-12">
        <div className="space-y-3 max-w-xl mx-auto">
          <span className="text-[10.5px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-150">Professional Utilities</span>
          <h2 className="font-display font-heavy text-3xl md:text-4xl text-slate-900 tracking-tight">SSC Preparation Reimagined</h2>
          <p className="text-slate-500 text-xs">A comprehensive layout of analytical and competitive tools crafted strictly for serious qualifiers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Card 1: Mock Tracker */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-left space-y-4 hover:shadow-xl transition transform hover:scale-101 duration-300">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-150 flex items-center justify-center">
              <Activity size={20} className="text-blue-600" />
            </div>
            <h3 className="font-display font-bold text-slate-950 text-base">Unified Score Indexing</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-sans font-medium">
              Log score card entries, accuracy percentiles, platforms (Oliveboard, RBE, Testbook) to maintain consistent growth trends.
            </p>
          </div>

          {/* Card 2: Rank Predictor */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-left space-y-4 hover:shadow-xl transition transform hover:scale-101 duration-300">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-150 flex items-center justify-center">
              <Trophy size={20} className="text-indigo-600" />
            </div>
            <h3 className="font-display font-bold text-slate-950 text-base">Historical Rank Predictor</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-sans font-medium">
              Obtain instantaneous percentile projections corresponding to past years' commission trends. Learn your ranking instantly.
            </p>
          </div>

          {/* Card 3: SSC Typing Test */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-left space-y-4 hover:shadow-xl transition transform hover:scale-101 duration-300">
            <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-150 flex items-center justify-center">
              <Keyboard size={20} className="text-cyan-600" />
            </div>
            <h3 className="font-display font-bold text-slate-950 text-base">Hindi / English Typing Gym</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-sans font-medium">
              Simulate standard 15-minute 2,000 depression evaluation with live Words Per Minute (WPM) accuracy auditing.
            </p>
          </div>

          {/* Card 4: Analytics Dashboard */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-left space-y-4 hover:shadow-xl transition transform hover:scale-101 duration-300">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-150 flex items-center justify-center">
              <BarChart3 size={20} className="text-emerald-600" />
            </div>
            <h3 className="font-display font-bold text-slate-950 text-base">Weak Areas Insights</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-sans font-medium">
              Identify precision bottlenecks in Quantitative, General Intelligence, English Comprehension, and General Studies modules.
            </p>
          </div>

          {/* Card 5: PYQ Prep Library */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-left space-y-4 hover:shadow-xl transition transform hover:scale-101 duration-300">
            <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-150 flex items-center justify-center">
              <BookOpen size={20} className="text-rose-600" />
            </div>
            <h3 className="font-display font-bold text-slate-950 text-base">Interactive PYQ Arena</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-sans font-medium">
              Practice verified historical assessment papers spanning past commission timelines to construct real exam familiarity.
            </p>
          </div>

          {/* Card 6: Dynamic AI recommendations */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 text-left space-y-4 hover:shadow-xl transition transform hover:scale-101 duration-300">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-150 flex items-center justify-center">
              <Brain size={20} className="text-amber-600" />
            </div>
            <h3 className="font-display font-bold text-slate-950 text-base">Gemini Intelligent Coaching</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-sans font-medium">
              Receive smart, automated study interventions tailored to diagnostic points on active mock profiles.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Interactive Analytics Preview (using recharts) */}
      <section id="interactive-charts" className="bg-slate-100 border-y border-slate-200/80 py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-5 text-left">
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-150 px-3 py-1 rounded-full uppercase">Analytics Dashboard Mock</span>
            <h2 className="font-display font-black text-3xl text-slate-900 tracking-tight leading-tight">Compare Across Multiple Exam Providers</h2>
            <p className="text-slate-505 text-xs font-sans font-medium leading-relaxed">
              Consolidate performances. Whether running test sets on Oliveboard, Testbook, F64 Academy or other custom layouts, our systems stitch your historical accuracy levels to trace a composite improvement.
            </p>
            <div className="space-y-3 pt-3">
              <p className="flex items-center gap-2.5 text-xs text-slate-805 font-bold"><CheckCircle2 size={15} className="text-emerald-500" /> Live accuracy trendline rendering</p>
              <p className="flex items-center gap-2.5 text-xs text-slate-805 font-bold"><CheckCircle2 size={15} className="text-emerald-500" /> Average score comparison indices</p>
              <p className="flex items-center gap-2.5 text-xs text-slate-805 font-bold"><CheckCircle2 size={15} className="text-emerald-500" /> Subject-wise comparative bars</p>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 text-left">
              <div>
                <p className="text-xs font-bold text-slate-900">Student Benchmark comparisons</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Mock results vs Cohort averages</p>
              </div>
              <span className="px-2.5 py-1 text-[10px] uppercase font-mono font-bold text-indigo-600 bg-indigo-50 rounded border border-indigo-150">Active Tracker Live</span>
            </div>

            {/* Interactive chart visual rendering */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_ANALYTICS_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                  <Bar dataKey="score" fill="#3b82f6" name="Your Score" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgScore" fill="#818cf8" name="Group average" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </section>

      {/* 5. How It Works (Timeline) */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center space-y-12">
        <div className="space-y-3 max-w-md mx-auto">
          <span className="text-[10.5px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-150">Timeline</span>
          <h2 className="font-display font-heavy text-3xl md:text-4xl text-slate-900 tracking-tight">Structured Path to Selection</h2>
          <p className="text-slate-500 text-xs">Transform raw preparation steps into highly targeted, metrics-assured milestones.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          
          <div className="space-y-3 text-center md:text-left bg-white border border-slate-200 rounded-3xl p-6 hover:border-blue-400 transition transform hover:-translate-y-1 duration-300">
            <span className="text-2xl font-black font-display text-blue-500/25 block leading-none">01</span>
            <p className="font-bold text-sm text-slate-900">Conduct Mock</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">Take any mock test set on Testbook, Oliveboard, or F64 library.</p>
          </div>

          <div className="space-y-3 text-center md:text-left bg-white border border-slate-200 rounded-3xl p-6 hover:border-blue-400 transition transform hover:-translate-y-1 duration-300">
            <span className="text-2xl font-black font-display text-blue-500/25 block leading-none">02</span>
            <p className="font-bold text-sm text-slate-900">Log score card</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">Track score, error details, and platform identifiers in your profile.</p>
          </div>

          <div className="space-y-3 text-center md:text-left bg-white border border-slate-200 rounded-3xl p-6 hover:border-blue-400 transition transform hover:-translate-y-1 duration-300">
            <span className="text-2xl font-black font-display text-blue-500/25 block leading-none">03</span>
            <p className="font-bold text-sm text-slate-900">Analyze Bottlenecks</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">Let analytics visually map weak reasoning, quants, or comprehensions.</p>
          </div>

          <div className="space-y-3 text-center md:text-left bg-white border border-slate-200 rounded-3xl p-6 hover:border-blue-400 transition transform hover:-translate-y-1 duration-300">
            <span className="text-2xl font-black font-display text-blue-500/25 block leading-none">04</span>
            <p className="font-bold text-sm text-slate-900">Trigger AI Coach</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">Unlock high-relevance study pointers generated server-side with Gemini API.</p>
          </div>

          <div className="space-y-3 text-center md:text-left bg-white border border-slate-200 rounded-3xl p-6 hover:border-blue-400 transition transform hover:-translate-y-1 duration-300">
            <span className="text-2xl font-black font-display text-blue-500/25 block leading-none">05</span>
            <p className="font-bold text-sm text-slate-900">Predict Final Rank</p>
            <p className="text-slate-500 text-[11px] leading-relaxed">Visualize your competitive placement against previous cut-offs.</p>
          </div>

        </div>
      </section>

      {/* 6. Rank Predictor Showcase (Interactive widget) */}
      <section id="rank-calculator" className="bg-slate-900 text-white py-20 border-y border-slate-800 relative overflow-hidden">
        
        {/* visual glowing backdrop element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[130px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 text-left">
          
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-2 bg-blue-500/10 border border-blue-500/35 rounded-lg py-1 text-[10px] font-mono text-blue-400 tracking-wider">
              <Trophy size={12} /> INTERACTIVE SIMULATION
            </div>
            
            <h2 className="font-display font-black text-3xl md:text-4xl leading-tight">
              Predict Expected SSC CGL Rank
            </h2>
            <p className="text-[12.5px] text-slate-400 leading-relaxed font-sans">
              Enter a simulated Mock score to live calculate predicted competitive percentile and estimated Staff Selection rank bracket based on previous dynamic trends.
            </p>

            <div className="space-y-2.5 pt-2">
              <p className="text-xs text-slate-300 flex items-center gap-1.5"><Check size={14} className="text-blue-500" /> Grounded on actual cutoffs (2021-2025)</p>
              <p className="text-xs text-slate-300 flex items-center gap-1.5"><Check size={14} className="text-blue-500" /> Interactive sliding inputs</p>
              <p className="text-xs text-slate-300 flex items-center gap-1.5"><Check size={14} className="text-blue-500" /> Multi-criteria candidate classification tags</p>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-850 p-5 md:p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">Enter Simulated Raw Mock Score</label>
                <span className="text-lg font-mono font-bold text-blue-400">{scoreInput} / 200</span>
              </div>
              <input 
                id="landing-predictor-slider"
                type="range"
                min="60"
                max="200"
                value={scoreInput}
                onChange={(e) => setScoreInput(Number(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Min: 60</span>
                <span>Cut-off Zone: ~115</span>
                <span>ASO Target: ~150</span>
                <span>Max: 200</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-slate-550 uppercase font-bold tracking-wider">Expected Rank Range</p>
                  <p className="text-xl md:text-2xl font-mono font-extrabold text-white animate-pulse">#{predResult.rank}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-slate-550 uppercase font-bold tracking-wider">Estimated Percentile</p>
                  <p className="text-xl md:text-2xl font-mono font-extrabold text-emerald-450 text-emerald-400">{predResult.percentile}%</p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 flex items-center justify-between gap-2.5">
                <p className="text-[10.5px] font-bold text-blue-400 truncate tracking-wide">{predResult.label}</p>
                <button
                  id="predictor-cta-lock"
                  onClick={() => onStartAuth('register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10.5px] px-3.5 py-1.5 font-bold transition flex items-center gap-1 cursor-pointer leading-none flex-shrink-0"
                >
                  <Lock size={10} /> Secure This
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Typing Test Showcase (Practice simulator) */}
      <section id="typing-gym" className="max-w-7xl mx-auto px-6 py-20 text-center space-y-12">
        <div className="space-y-3 max-w-xl mx-auto">
          <span className="text-[10.5px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-150">Simulation Hub</span>
          <h2 className="font-display font-heavy text-3xl md:text-4xl text-slate-900 tracking-tight">Interactive SSC Typing Gym</h2>
          <p className="text-slate-500 text-xs">Test speeds under target expectations. Type the sample text below directly on screen to compute. Supports language toggling.</p>
        </div>

        <div className="w-full max-w-4xl mx-auto bg-white border border-slate-202 rounded-3xl p-5 md:p-8 shadow-xl flex flex-col gap-6 text-left">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <button 
                id="typing-toggle-en"
                onClick={() => { setTypingLang('english'); handleResetTyping(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  typingLang === 'english' ? 'bg-blue-600 text-white shadow-3xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                English Layout
              </button>
              <button 
                id="typing-toggle-hi"
                onClick={() => { setTypingLang('hindi'); handleResetTyping(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  typingLang === 'hindi' ? 'bg-blue-600 text-white shadow-3xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Hindi Font
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-slate-600">
                WPM: <span className="font-bold text-blue-600 text-sm">{typingWPM}</span>
              </div>
              <div className="text-slate-600">
                Accuracy: <span className="font-bold text-emerald-600 text-sm">{typingAccuracy}%</span>
              </div>
              <div className="text-slate-600">
                Duration: <span className="font-bold text-slate-800 text-sm">{testTime}s</span>
              </div>
            </div>
          </div>

          {/* Core Visual Sentence reference area */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm leading-relaxed text-slate-700 select-none font-sans font-medium relative">
            <span className="absolute -top-2.5 left-3 px-2 bg-slate-900 rounded-full text-[9px] font-mono text-white tracking-widest font-bold">SAMPLE TEXT CHANGER REGISTER</span>
            {targetSentence}
          </div>

          {/* Active typed keyboard text area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="font-bold text-slate-700">Type Text Here</label>
              <span>Characters: {typedText.length} / {targetSentence.length}</span>
            </div>

            <textarea
              id="landing-typing-textarea"
              rows={4}
              value={typedText}
              onChange={handleTypingChange}
              placeholder={typingLang === 'english' ? "Start typing the target sentence above..." : "यहाँ टाइप करना प्रारंभ करें..."}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 p-4 rounded-xl text-sm text-slate-800 focus:outline-none placeholder-slate-400 font-sans"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] text-slate-400 font-medium">Standard targets: ASO = 35 WPM (10,500 key depressions / hr equivalent)</p>
            <button
              id="reset-typing-btn"
              onClick={handleResetTyping}
              className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-250 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold leading-none cursor-pointer border border-slate-150 transition"
            >
              <RotateCcw size={12} className="text-slate-500" /> Start Over
            </button>
          </div>

        </div>
      </section>

      {/* 8. Success Journey Section */}
      <section className="bg-white border-y border-slate-200/80 py-20">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          
          <div className="space-y-3 max-w-md mx-auto">
            <span className="text-[10.5px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-150">Aspirant Journey</span>
            <h2 className="font-display font-heavy text-3xl text-slate-900 tracking-tight">The Growth Pathway stages</h2>
            <p className="text-slate-500 text-xs">How serious aspirants systematically climb from baseline results to direct central selections.</p>
          </div>

          {/* Horizontal scroll container for stages */}
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 pr-1 snap-x scroll-smooth">
            
            <div className="min-w-[280px] flex-1 bg-slate-50 border border-slate-200 rounded-3xl p-6 text-left space-y-3.5 snap-start">
              <span className="text-[10.5px] font-mono font-bold text-red-650 bg-red-50 text-red-600 rounded px-2 py-0.5 leading-none">STAGE 1</span>
              <h3 className="font-display font-bold text-slate-900 text-base">Beginner Baseline</h3>
              <p className="text-[11px] font-mono text-slate-500">Typical raw: 80 - 100 / 200</p>
              <p className="text-slate-505 text-[11px] leading-relaxed">Struggling with concept validation. Identifying basic quant formulas and grammar foundations.</p>
            </div>

            <div className="min-w-[280px] flex-1 bg-slate-50 border border-slate-205 rounded-3xl p-6 text-left space-y-3.5 snap-start">
              <span className="text-[10.5px] font-mono font-bold text-orange-650 bg-orange-50 text-orange-600 rounded px-2 py-0.5 leading-none">STAGE 2</span>
              <h3 className="font-display font-bold text-slate-900 text-base">Average Aspirant</h3>
              <p className="text-[11px] font-mono text-slate-500">Typical raw: 105 - 125 / 200</p>
              <p className="text-slate-505 text-[11px] leading-relaxed">Conceptual understanding holds. High mistake margins caused by geometry and calendar traps.</p>
            </div>

            <div className="min-w-[280px] flex-1 bg-slate-50 border border-slate-205 rounded-3xl p-6 text-left space-y-3.5 snap-start">
              <span className="text-[10.5px] font-mono font-bold text-yellow-650 bg-yellow-50 text-yellow-600 rounded px-2 py-0.5 leading-none">STAGE 3</span>
              <h3 className="font-display font-bold text-slate-900 text-base">Consistent Achiever</h3>
              <p className="text-[11px] font-mono text-slate-500">Typical raw: 130 - 145 / 200</p>
              <p className="text-slate-505 text-[11px] leading-relaxed">Understands speed balance. Consistently indexing sectional strengths on diverse mock systems.</p>
            </div>

            <div className="min-w-[280px] flex-1 bg-slate-50 border border-slate-205 rounded-3xl p-6 text-left space-y-3.5 snap-start">
              <span className="text-[10.5px] font-mono font-bold text-blue-650 bg-blue-50 text-blue-600 rounded px-2 py-0.5 leading-none">STAGE 4</span>
              <h3 className="font-display font-bold text-slate-900 text-base">Top 1000 Contender</h3>
              <p className="text-[11px] font-mono text-slate-500">Typical raw: 150 - 165 / 200</p>
              <p className="text-slate-505 text-[11px] leading-relaxed">Optimized accuracy exceeding 90%. Eligible for top tier executive selection options safely.</p>
            </div>

            <div className="min-w-[280px] flex-1 bg-gradient-to-br from-blue-600 to-indigo-650 border border-blue-500 text-white rounded-3xl p-6 text-left space-y-3.5 snap-start shadow-md">
              <span className="text-[10.5px] font-mono font-bold text-white bg-white/20 rounded px-2 py-0.5 leading-none">STAGE 5</span>
              <h3 className="font-display font-bold text-white text-base">Final Ministry Selection</h3>
              <p className="text-[11px] font-mono text-blue-200">Typical raw: 170+ / 200</p>
              <p className="text-blue-105 text-[11px] leading-relaxed text-blue-100">Qualified officer. Secured positions in MEA ASO, Income Tax or Central Excise squads.</p>
            </div>

          </div>

        </div>
      </section>

      {/* 9. Testimonials Section (Vertical cards marquee style animation) */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center space-y-12">
        <div className="space-y-3 max-w-md mx-auto">
          <span className="text-[10.5px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-150">Aspirant Voice</span>
          <h2 className="font-display font-heavy text-3xl text-slate-900 tracking-tight">Endorsed by Top Qualifiers</h2>
          <p className="text-slate-500 text-xs">Discover how unified tracking powered active student qualifications across India.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white border border-slate-200 p-6 rounded-3xl text-left flex flex-col justify-between gap-5 shadow-2xs hover:shadow-lg transition">
            <Quote size={20} className="text-blue-500" />
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              "F64 Academy analytics trackers helped me consolidate my diverse scores across Testbook and Oliveboard. The weak chapters heatmap isolated my algebra bottlenecks within 3 weeks!"
            </p>
            <div className="flex items-center gap-3 border-t border-slate-100 pt-3 flex-shrink-0">
              <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">AS</span>
              <div className="space-y-0.5">
                <p className="text-xs font-bold">Anish Sharma</p>
                <p className="text-[10px] text-zinc-400">Assistant Section Officer, MEA (Rank 112)</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl text-left flex flex-col justify-between gap-5 shadow-2xs hover:shadow-lg transition">
            <Quote size={20} className="text-blue-500" />
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              "The typing gym mimics the SSC keyboard layout with precision. Getting to practice WPM targets right within my tracker dashboard ensured my speed never lagged on real judgment day."
            </p>
            <div className="flex items-center gap-3 border-t border-slate-100 pt-3 flex-shrink-0">
              <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">PT</span>
              <div className="space-y-0.5">
                <p className="text-xs font-bold">Pooja Trivedi</p>
                <p className="text-[10px] text-zinc-400">Tax Assistant, Central Excise (WPM 41)</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl text-left flex flex-col justify-between gap-5 shadow-2xs hover:shadow-lg transition">
            <Quote size={20} className="text-blue-500" />
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              "The Gemini powered insights were shockingly intuitive. It pointed out that my mock percentages on PracticeMock failed due to geometry traps and suggested direct daily hours adjustment."
            </p>
            <div className="flex items-center gap-3 border-t border-slate-100 pt-3 flex-shrink-0">
              <span className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">VS</span>
              <div className="space-y-0.5">
                <p className="text-xs font-bold">Vikram Singh</p>
                <p className="text-[10px] text-zinc-400">Sub-Inspector, Income Tax Division</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 10. Frequently Asked Questions (F64 Accordion) */}
      <section id="faq" className="bg-white border-t border-slate-200/80 py-20">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          
          <div className="space-y-3 text-center">
            <span className="text-[10.5px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-150">HAVE QUESTIONS?</span>
            <h2 className="font-display font-heavy text-3xl text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-500 text-xs text-center">Clear answers on tracking data structures, typing review layouts and server insights.</p>
          </div>

          <div className="space-y-3">
            {FAQS_LIST.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index} 
                  className="border border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition overflow-hidden text-left"
                >
                  <button
                    id={`faq-trigger-${index}`}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full h-full px-5 py-4 flex items-center justify-between text-xs font-bold text-slate-850 hover:text-blue-600 transition cursor-pointer text-left leading-relaxed"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-505 font-sans leading-relaxed border-t border-slate-100 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 11. Conversion Focused CTA Section */}
      <section className="bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950 text-white w-full py-20 relative overflow-hidden text-left">
        
        {/* Abstract design vector blobs */}
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-cyan-400/10 rounded-full blur-[110px]" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-blue-500/15 rounded-full blur-[100px]" />

        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-10 relative z-10">
          <div className="space-y-4 max-w-xl">
            <h3 className="font-display font-black text-3xl md:text-4xl text-white tracking-tight leading-tight">Ready to Master SSC CGL?</h3>
            <p className="text-blue-150 text-slate-300 text-xs md:text-sm font-sans font-medium max-w-lg leading-relaxed">
              Join thousands of qualified qualifiers scaling their scores through dynamic diagnostics and peer live tracking indexes today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 flex-shrink-0">
            <button
              id="cta-join-now"
              onClick={() => onStartAuth('register')}
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold shadow-md cursor-pointer active:scale-95 transition"
            >
              Start Free Registration
            </button>
            <button
              id="cta-sign-in"
              onClick={() => onStartAuth('login')}
              className="px-6 py-3 bg-transparent border border-white hover:border-slate-300 hover:bg-white/5 text-white rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition"
            >
              Sign In to Your Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Humble Elegant Footer Area */}
      <footer className="bg-white border-t border-slate-200 py-10 text-center text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-display font-extrabold text-white text-xs">F64</div>
            <p className="font-display font-medium text-slate-900 text-xs">F64 ACADEMY ANALYTICS SYSTEM</p>
          </div>
          <p className="text-[10px] text-zinc-400">© 2026 F64 Academy. Built meticulously with React & High-Contrast Adaptive layouts.</p>
        </div>
      </footer>

    </div>
  );
}
