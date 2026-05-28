import React, { useState, useEffect } from 'react';
import { BookOpen, Watch, Play, Pause, RotateCcw, Target, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { StudyGoal } from '../types';

export default function StudyTrackerView() {
  // Pomodoro Live States
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<'study' | 'break'>('study');
  const [timerAlert, setTimerAlert] = useState<string | null>(null);

  // Goals lists
  const [goals, setGoals] = useState<StudyGoal[]>([
    { subject: 'Mathematics', targetHours: 15, completedHours: 8.5, timeLeftDays: 3 },
    { subject: 'Reasoning', targetHours: 10, completedHours: 6.0, timeLeftDays: 4 },
    { subject: 'English', targetHours: 12, completedHours: 9.2, timeLeftDays: 2 },
    { subject: 'GeneralKnowledge', targetHours: 20, completedHours: 7.5, timeLeftDays: 5 }
  ]);

  // Tasks Priorities State
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Analyze Mensurement wrong questions on Oliveboard Mock 2', completed: false, priority: 'High' },
    { id: 2, text: 'Compile 50 PYQs on Inequalities & Algebra formulas', completed: true, priority: 'High' },
    { id: 3, text: 'Complete English Reading Comprehension quiz on Testbook', completed: false, priority: 'Medium' },
    { id: 4, text: 'Read current affairs summary sheets of F64 Academy', completed: false, priority: 'Medium' }
  ]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Trigger mode switch
            if (pomodoroMode === 'study') {
              setPomodoroMode('break');
              setMinutes(5);
              setTimerAlert('🎉 Study session completed! Rest break of 5 minutes active.');
            } else {
              setPomodoroMode('study');
              setMinutes(25);
              setTimerAlert('💪 Break completed! Back to mock study focus rules.');
            }
            setIsTimerActive(false);
          } else {
            setMinutes(m => m - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(s => s - 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, seconds, minutes, pomodoroMode]);

  // Auto-clear alert notification after 8 seconds
  useEffect(() => {
    if (timerAlert) {
      const timeout = setTimeout(() => {
        setTimerAlert(null);
      }, 8000);
      return () => clearTimeout(timeout);
    }
  }, [timerAlert]);

  const toggleTimer = () => setIsTimerActive(!isTimerActive);
  
  const resetTimer = () => {
    setIsTimerActive(false);
    setMinutes(pomodoroMode === 'study' ? 25 : 5);
    setSeconds(0);
  };

  const handleTaskToggle = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in font-sans">
      
      {/* Overview Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900 font-bold">Daily Study Tracker Panel</h3>
          <p className="text-slate-500 text-xs mt-0.5">Coordinate pomodoro review timings and subject-wise chapter goals</p>
        </div>
        <div className="px-3.5 py-1 text-xs font-semibold rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center gap-1.5 self-start md:self-auto">
          <Watch size={14} className="animate-spin" />
          Pomodoro Assistant Enabled
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Bento: Pomodoro Live Stopwatch */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
              {pomodoroMode === 'study' ? '🔒 Study Focus Run' : '☕ Relax Break'}
            </span>
            <p className="text-slate-500 text-xs mt-2">Maintain dynamic performance focus intervals</p>
          </div>

          {/* Clock Display */}
          <div className="relative w-44 h-44 rounded-full border-4 border-slate-100 flex items-center justify-center shadow-inner bg-slate-50">
            <div className="text-4xl font-mono font-extrabold text-slate-800 tracking-widest leading-none">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              id="pomodoro-toggle"
              onClick={toggleTimer}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition cursor-pointer ${
                isTimerActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
              } shadow-md`}
            >
              {isTimerActive ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
            <button
              id="pomodoro-reset"
              onClick={resetTimer}
              className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-205 text-slate-550 hover:text-slate-800 border border-slate-250 flex items-center justify-center transition cursor-pointer"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {timerAlert && (
            <div className="w-full p-3 rounded-xl bg-blue-50 border border-blue-250 text-blue-850 text-[11px] font-semibold flex items-start gap-2 relative animate-fade-in">
              <span className="flex-1 text-left leading-relaxed">{timerAlert}</span>
              <button 
                id="btn-close-timer-alert"
                onClick={() => setTimerAlert(null)}
                className="hover:text-blue-950 font-bold font-sans text-xs cursor-pointer px-1 text-blue-500 hover:scale-105 transition"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Center Bento: Goals limits progress */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-3xl p-6 md:p-8 space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="text-sm font-semibold text-slate-850 tracking-wide font-display font-bold">Target revision hour limits</h4>
            <span className="text-[10px] font-mono text-slate-400">Weekly scaling targets</span>
          </div>

          <div className="space-y-4">
            {goals.map((goal) => {
              const pct = Math.min(100, Math.round((goal.completedHours / goal.targetHours) * 100));
              return (
                <div key={goal.subject} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-150">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800">{goal.subject}</span>
                    <span className="text-slate-550 font-mono font-semibold">{goal.completedHours}h completed of {goal.targetHours}h</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-0.5">
                    <span>{pct}% core target completed</span>
                    <span className="text-blue-600 font-bold">{goal.timeLeftDays} days remaining</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. Task Priorities list panel */}
      <section className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 md:p-8 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h4 className="text-sm font-semibold text-slate-850 tracking-wide font-display font-bold">Priority checklist actions and tasks</h4>
          <span className="text-xs text-slate-400 font-mono">Log mock reviews</span>
        </div>

        <div className="space-y-2.5 font-sans">
          {tasks.map((task) => (
            <div 
              key={task.id}
              onClick={() => handleTaskToggle(task.id)}
              className="p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/75 border border-slate-200/80 flex items-center justify-between cursor-pointer transition gap-4"
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                  task.completed ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white text-transparent'
                }`}>
                  <CheckCircle2 size={12} className="stroke-current" />
                </div>
                <span className={`text-xs text-left leading-relaxed font-medium ${task.completed ? 'line-through text-slate-400 font-normal' : 'text-slate-700'}`}>
                  {task.text}
                </span>
              </div>

              <div className="flex-shrink-0 font-mono">
                <span className={`text-[9.5px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                  task.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                }`}>
                  {task.priority} Priority
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
