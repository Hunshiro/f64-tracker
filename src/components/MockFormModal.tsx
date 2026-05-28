import React, { useState } from 'react';
import { X, Save, ArrowLeft, ArrowRight, BookOpen, Layers, Award, ShieldAlert } from 'lucide-react';
import { ExamType, PlatformName, MockType, SectionData, SectionMetrics } from '../types';

interface MockFormModalProps {
  onClose: () => void;
  onSubmit: (attempt: any) => Promise<void>;
  userTargetExam: ExamType;
  userPrimaryPlatform: PlatformName;
}

type SubjectKeys = 'Mathematics' | 'Reasoning' | 'English' | 'GeneralKnowledge';

export default function MockFormModal({ onClose, onSubmit, userTargetExam, userPrimaryPlatform }: MockFormModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Overall Data State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [examType, setExamType] = useState<ExamType>(userTargetExam);
  const [platform, setPlatform] = useState<PlatformName>(userPrimaryPlatform);
  const [mockType, setMockType] = useState<MockType>('Full Length');
  const [mockNumber, setMockNumber] = useState('');
  const [score, setScore] = useState('');
  const [overallRank, setOverallRank] = useState('');
  const [percentile, setPercentile] = useState('');
  const [studyHours, setStudyHours] = useState('2');

  // Step 2: Sectional Data State
  const initialSectionState = (subject: SubjectKeys): SectionMetrics => ({
    totalMarks: 0,
    correctQuestions: 15,
    wrongQuestions: 5,
    unattemptedQuestions: 5,
    accuracy: 75,
    timeTaken: 15,
    weakTopics: [],
    confidenceRating: 3,
    performanceIndicator: 'Medium'
  });

  const [sections, setSections] = useState<Record<SubjectKeys, SectionMetrics>>({
    Mathematics: initialSectionState('Mathematics'),
    Reasoning: initialSectionState('Reasoning'),
    English: initialSectionState('English'),
    GeneralKnowledge: initialSectionState('GeneralKnowledge')
  });

  // Flat text state for weak topics input tags (comma-separated)
  const [weakTopicsRaw, setWeakTopicsRaw] = useState<Record<SubjectKeys, string>>({
    Mathematics: '',
    Reasoning: '',
    English: '',
    GeneralKnowledge: ''
  });

  const [activeSubjTab, setActiveSubjTab] = useState<SubjectKeys>('Mathematics');

  const updateSectionField = (subj: SubjectKeys, field: keyof SectionMetrics, value: any) => {
    setSections(prev => {
      const updatedSec = { ...prev[subj], [field]: value };
      
      // Auto-compute accuracy
      if (field === 'correctQuestions' || field === 'wrongQuestions') {
        const correct = field === 'correctQuestions' ? Number(value) : updatedSec.correctQuestions;
        const wrong = field === 'wrongQuestions' ? Number(value) : updatedSec.wrongQuestions;
        const total = correct + wrong;
        updatedSec.accuracy = total > 0 ? parseFloat(((correct / total) * 100).toFixed(1)) : 0;
      }

      // Auto-compute section marks: typical SSC scoring (+2 for correct, -0.5 for wrong)
      if (field === 'correctQuestions' || field === 'wrongQuestions') {
        const correct = field === 'correctQuestions' ? Number(value) : updatedSec.correctQuestions;
        const wrong = field === 'wrongQuestions' ? Number(value) : updatedSec.wrongQuestions;
        updatedSec.totalMarks = Math.max(0, parseFloat((correct * 2 - wrong * 0.5).toFixed(1)));
      }

      return { ...prev, [subj]: updatedSec };
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!mockNumber || !score || !percentile) {
        setError('Please fill out general mock descriptors (Name, Score, Percentile).');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const handlePrev = () => {
    setStep(1);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Compile section weak topics from flat inputs
    const compiledSections: any = {};
    const subjects: SubjectKeys[] = ['Mathematics', 'Reasoning', 'English', 'GeneralKnowledge'];
    
    subjects.forEach(sub => {
      const topicsText = weakTopicsRaw[sub];
      const parsedTopics = topicsText
        ? topicsText.split(',').map(t => t.trim()).filter(t => t.length > 0)
        : [];
      
      compiledSections[sub] = {
        ...sections[sub],
        weakTopics: parsedTopics
      };
    });

    const payload = {
      date,
      examType,
      platform,
      mockType,
      mockNumber,
      score: Number(score),
      overallRank: Number(overallRank) || 1200,
      percentile: Number(percentile) || 90.0,
      studyHours: Number(studyHours) || 2.0,
      sectionData: compiledSections
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit mock tracker details.');
    } finally {
      setLoading(false);
    }
  };

  const subNavItems = [
    { id: 'Mathematics', name: 'Quant', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { id: 'Reasoning', name: 'Reasoning', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
    { id: 'English', name: 'English', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { id: 'GeneralKnowledge', name: 'GK', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all overflow-y-auto animate-fade-in">
      
      {/* Modal Container */}
      <div 
        id="mock-form-modal-container"
        className="w-full max-w-2xl bg-white border border-slate-200 shadow-2xl rounded-3xl p-6 md:p-8 relative text-left my-8 shadow-2xl"
      >
        <button
          id="btn-close-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200/50 flex items-center justify-center cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header Indicator */}
        <div className="border-b border-slate-200 pb-4 mb-4">
          <h2 className="font-display font-bold text-xl text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="text-blue-600" size={20} />
            Add Completed Mock Record
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">Step {step} of 2 — {step === 1 ? 'General Performance metrics' : 'Sectional detail diagnostics'}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-650 border border-red-200 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          {/* STEP 1: GENERAL OVERALL STATS */}
          {step === 1 && (
            <div className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Date Attempted</label>
                  <input
                    id="form-date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 focus:bg-white rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Exam Type</label>
                  <select
                    id="form-exam-type"
                    value={examType}
                    onChange={(e: any) => setExamType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 focus:bg-white rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="SSC CGL" className="bg-white text-slate-800">SSC CGL</option>
                    <option value="CHSL" className="bg-white text-slate-800">CHSL</option>
                    <option value="MTS" className="bg-white text-slate-800">MTS</option>
                    <option value="CPO" className="bg-white text-slate-800">CPO</option>
                    <option value="Other" className="bg-white text-slate-800">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Testing Platform</label>
                  <select
                    id="form-platform"
                    value={platform}
                    onChange={(e: any) => setPlatform(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 focus:bg-white rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="F64 Academy" className="bg-white text-slate-800">F64 Academy</option>
                    <option value="Oliveboard" className="bg-white text-slate-800">Oliveboard</option>
                    <option value="Testbook" className="bg-white text-slate-800">Testbook</option>
                    <option value="PracticeMock" className="bg-white text-slate-800">PracticeMock</option>
                    <option value="RBE" className="bg-white text-slate-800">RBE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Mock Category</label>
                  <select
                    id="form-category"
                    value={mockType}
                    onChange={(e: any) => setMockType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 focus:bg-white rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="Full Length" className="bg-white text-slate-800">Full Length</option>
                    <option value="LIVE" className="bg-white text-slate-800">LIVE</option>
                    <option value="PYQ" className="bg-white text-slate-800">PYQ</option>
                    <option value="Sectional" className="bg-white text-slate-800">Sectional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Mock Number or Title</label>
                <input
                  id="form-mock-number"
                  type="text"
                  required
                  placeholder="e.g. Live Mock Test - 01 or Tier 1 Shift 3"
                  value={mockNumber}
                  onChange={(e) => setMockNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 focus:bg-white rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Total Score Marks</label>
                  <input
                    id="form-score"
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 142.5"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 focus:bg-white rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Overall Rank</label>
                  <input
                    id="form-rank"
                    type="number"
                    required
                    placeholder="e.g. 450"
                    value={overallRank}
                    onChange={(e) => setOverallRank(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 focus:bg-white rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Percentile %</label>
                  <input
                    id="form-percentile"
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 96.5"
                    value={percentile}
                    onChange={(e) => setPercentile(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 focus:bg-white rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Study Hours spent</label>
                  <input
                    id="form-study-hours"
                    type="number"
                    step="0.1"
                    required
                    value={studyHours}
                    onChange={(e) => setStudyHours(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-400 focus:bg-white rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  id="btn-next-step"
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition cursor-pointer shadow-md shadow-blue-500/10"
                >
                  Configure Subject Details
                  <ArrowRight size={16} />
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: SECTIONAL DATA */}
          {step === 2 && (
            <div className="space-y-4">
              
              {/* Subject Tabs */}
              <div className="flex border border-slate-200 gap-1 p-1 bg-slate-100 rounded-xl">
                {subNavItems.map((tab) => {
                  const isActive = activeSubjTab === tab.id;
                  return (
                    <button
                      id={`form-subject-tab-${tab.id}`}
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveSubjTab(tab.id)}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                        isActive 
                          ? 'bg-blue-600 text-white shadow' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.name}
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Fields */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-600 font-bold">{activeSubjTab} Configuration</span>
                  <div className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-bold">
                    Marks: {sections[activeSubjTab].totalMarks} / 50
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1 font-semibold">Correct Questions</label>
                    <input
                      id={`form-${activeSubjTab}-correct`}
                      type="number"
                      value={sections[activeSubjTab].correctQuestions}
                      onChange={(e) => updateSectionField(activeSubjTab, 'correctQuestions', Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 focus:border-blue-400 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1 font-semibold">Wrong Questions</label>
                    <input
                      id={`form-${activeSubjTab}-wrong`}
                      type="number"
                      value={sections[activeSubjTab].wrongQuestions}
                      onChange={(e) => updateSectionField(activeSubjTab, 'wrongQuestions', Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 focus:border-blue-400 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1 font-semibold">Unattempted Qs</label>
                    <input
                      id={`form-${activeSubjTab}-unattempted`}
                      type="number"
                      value={sections[activeSubjTab].unattemptedQuestions}
                      onChange={(e) => updateSectionField(activeSubjTab, 'unattemptedQuestions', Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 focus:border-blue-400 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1 font-semibold">Time Spent (Minutes)</label>
                    <input
                      id={`form-${activeSubjTab}-time`}
                      type="number"
                      value={sections[activeSubjTab].timeTaken}
                      onChange={(e) => updateSectionField(activeSubjTab, 'timeTaken', Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 focus:border-blue-400 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-500 mb-1 font-semibold">Confidence Level (1-5)</label>
                    <div className="flex items-center gap-3">
                      <input
                        id={`form-${activeSubjTab}-confidence`}
                        type="range"
                        min="1"
                        max="5"
                        value={sections[activeSubjTab].confidenceRating}
                        onChange={(e) => updateSectionField(activeSubjTab, 'confidenceRating', Number(e.target.value))}
                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-blue-600"
                      />
                      <span className="text-slate-800 font-bold font-mono text-xs">{sections[activeSubjTab].confidenceRating}/5</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1 font-semibold">Weak Topics (Comma-separated)</label>
                  <input
                    id={`form-${activeSubjTab}-weak-topics`}
                    type="text"
                    placeholder="e.g. Algebra, Trigonometry, Permutations"
                    value={weakTopicsRaw[activeSubjTab]}
                    onChange={(e) => setWeakTopicsRaw(prev => ({ ...prev, [activeSubjTab]: e.target.value }))}
                    className="w-full bg-white border border-slate-200 focus:border-blue-400 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none placeholder-slate-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Help us pinpoint exact mistake tags for AI recommendations.</span>
                </div>

              </div>

              {/* Back & Submit buttons */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-6">
                <button
                  id="btn-back-step"
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl text-sm font-semibold transition cursor-pointer hover:bg-slate-200"
                >
                  <ArrowLeft size={16} />
                  Overview
                </button>

                <p className="hidden md:block text-[10px] text-slate-400 italic max-w-xs text-center font-mono">
                  Make sure to configure correct counts for each tab before submitting!
                </p>

                <button
                  id="btn-save-mock-attempt"
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-blue-600 hover:opacity-95 text-white rounded-xl text-sm font-extrabold tracking-wide transition shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Save size={16} />
                  {loading ? 'Submitting Mock...' : 'Save Performance Data'}
                </button>
              </div>

            </div>
          )}

        </form>
      </div>
    </div>
  );
}
