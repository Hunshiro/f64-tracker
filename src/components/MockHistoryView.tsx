import React, { useState } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Eye, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Sparkles,
  BookOpen,
  X
} from 'lucide-react';
import { MockAttempt, ExamType, PlatformName, MockType } from '../types';

interface MockHistoryViewProps {
  mocks: MockAttempt[];
  onDeleteMock: (id: string) => Promise<void>;
}

export default function MockHistoryView({ mocks, onDeleteMock }: MockHistoryViewProps) {
  // Search and Filter States
  const [search, setSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedExam, setSelectedExam] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [scoreRange, setScoreRange] = useState<number>(0); // 0 = all, others check minimum

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Detailed Modal Selection
  const [selectedMock, setSelectedMock] = useState<MockAttempt | null>(null);

  // Filter Logic
  const filteredMocks = mocks.filter(mock => {
    const matchesSearch = mock.mockNumber.toLowerCase().includes(search.toLowerCase()) || 
                          mock.platform.toLowerCase().includes(search.toLowerCase());
    
    const matchesPlatform = selectedPlatform === 'All' || mock.platform === selectedPlatform;
    const matchesExam = selectedExam === 'All' || mock.examType === selectedExam;
    const matchesCategory = selectedCategory === 'All' || mock.mockType === selectedCategory;
    const matchesScore = scoreRange === 0 || mock.score >= scoreRange;

    return matchesSearch && matchesPlatform && matchesExam && matchesCategory && matchesScore;
  });

  // Pagination bounds
  const totalPages = Math.max(1, Math.ceil(filteredMocks.length / itemsPerPage));
  const paginatedMocks = filteredMocks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Export CSV Helper
  const exportCSV = () => {
    const header = 'Date,Exam,Platform,Category,Title,Score,Percentile,Accuracy,Study Hours\r\n';
    const rows = filteredMocks.map(m => 
      `"${m.date}","${m.examType}","${m.platform}","${m.mockType}","${m.mockNumber}",${m.score},${m.percentile},${m.accuracy},${m.studyHours}`
    ).join('\r\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'f64_academy_mock_attempts_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Brief PDF (Print-Friendly Report)
  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const reportHtml = `
      <html>
        <head>
          <title>F64 Academy Performance Assessment Report</title>
          <style>
            body { font-family: 'Plus Jakarta Sans', sans-serif; background: #fafafa; color: #111; padding: 40px; }
            h1 { text-align: center; color: #2563eb; }
            h3 { border-bottom: 2px solid #ddd; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { text-align: left; padding: 10px; border-bottom: 1px solid #ddd; }
            th { background: #f3f4f6; }
            .badge { background: #e5e7eb; padding: 2px 8px; border-radius: 9px; font-size: 11px; }
          </style>
        </head>
        <body>
          <h1>F64 Academy Exam Tracker Performance Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>Total Mocks Analyzed: ${filteredMocks.length}</p>
          <h3>Summary List</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Exam</th>
                <th>Platform</th>
                <th>Category</th>
                <th>Mock Title</th>
                <th>Score</th>
                <th>Percentile</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              ${filteredMocks.map(m => `
                <tr>
                  <td>${m.date}</td>
                  <td>${m.examType}</td>
                  <td>${m.platform}</td>
                  <td><span class="badge">${m.mockType}</span></td>
                  <td>${m.mockNumber}</td>
                  <td><strong>${m.score}</strong></td>
                  <td>${m.percentile}%</td>
                  <td>${m.accuracy}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(reportHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const platforms = ['All', 'F64 Academy', 'Oliveboard', 'Testbook', 'PracticeMock', 'RBE'];
  const categories = ['All', 'Full Length', 'LIVE', 'PYQ', 'Sectional'];
  const exams = ['All', 'SSC CGL', 'CHSL', 'MTS', 'CPO', 'Other'];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in font-sans">
      
      {/* 1. Filtering & Search Header Card */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-display font-medium text-lg text-slate-900 font-bold">Mock History Repository</h3>
            <p className="text-slate-500 text-xs mt-0.5">Filter, search, audit and export detailed examination scores</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-export-csv"
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-4 h-10 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-705 rounded-lg text-xs font-semibold tracking-wide transition active:scale-95 cursor-pointer"
            >
              <Download size={14} />
              CSV
            </button>
            <button
              id="btn-export-pdf"
              onClick={exportPDF}
              className="flex items-center gap-1.5 px-4 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold tracking-wide transition shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
            >
              <Sparkles size={14} />
              Print Report
            </button>
          </div>
        </div>

        {/* Filters Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 pt-1">
          {/* Search Table */}
          <div className="relative">
            <Search size={14} className="text-slate-400 absolute left-3 top-3.5" />
            <input
              id="history-search-bar"
              type="text"
              placeholder="Search table..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-200 focus:border-blue-400 focus:bg-white rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Platform Filter */}
          <div>
            <select
              id="filter-platform"
              value={selectedPlatform}
              onChange={(e) => { setSelectedPlatform(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 focus:border-blue-400 focus:bg-white rounded-lg text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option disabled className="text-slate-400">Platform</option>
              {platforms.map(p => <option key={p} value={p} className="bg-white">{p === 'All' ? 'All Platforms' : p}</option>)}
            </select>
          </div>

          {/* Exam Filter */}
          <div>
            <select
              id="filter-exam"
              value={selectedExam}
              onChange={(e) => { setSelectedExam(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 focus:border-blue-400 focus:bg-white rounded-lg text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option disabled className="text-slate-400">Exam Type</option>
              {exams.map(ex => <option key={ex} value={ex} className="bg-white">{ex === 'All' ? 'All Exams' : ex}</option>)}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              id="filter-category"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 focus:border-blue-400 focus:bg-white rounded-lg text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option disabled className="text-slate-400">Category</option>
              {categories.map(c => <option key={c} value={c} className="bg-white">{c === 'All' ? 'All Categories' : c}</option>)}
            </select>
          </div>

          {/* Minimum Score Filter */}
          <div>
            <select
              id="filter-score"
              value={scoreRange}
              onChange={(e) => { setScoreRange(Number(e.target.value)); setCurrentPage(1); }}
              className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 focus:border-blue-400 focus:bg-white rounded-lg text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="0" className="bg-white">All Score Ranges</option>
              <option value="120" className="bg-white">Score &ge; 120</option>
              <option value="140" className="bg-white">Score &ge; 140</option>
              <option value="155" className="bg-white">Score &ge; 155 (Elite Target)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Database History Table */}
      <div className="bg-white border border-slate-200/95 shadow-sm rounded-2xl overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-mono tracking-wider text-slate-500">
                <th className="p-4 pl-6">Mock Title</th>
                <th className="p-4">Platform</th>
                <th className="p-4 text-center">Exam</th>
                <th className="p-4 text-center">Score Marks</th>
                <th className="p-4 text-center">Rank</th>
                <th className="p-4 text-center">Percentile %</th>
                <th className="p-4 text-center">Accuracy %</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMocks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-slate-400">No mock attempts match selected filtration matrices.</td>
                </tr>
              ) : (
                paginatedMocks.map((mock) => (
                  <tr key={mock.id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="p-4 pl-6">
                      <div className="flex flex-col">
                        <span className="font-display font-semibold text-slate-900 text-sm">{mock.mockNumber}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">{mock.mockType} Category • {mock.date}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 text-[10px] rounded bg-slate-100 border border-slate-200 text-slate-705 font-mono">
                        {mock.platform}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xs font-semibold text-slate-605 font-mono">{mock.examType}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-extrabold text-slate-900 font-mono">{mock.score}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xs text-slate-500 font-mono">#{mock.overallRank}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-bold text-blue-600 font-mono">{mock.percentile}%</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-semibold text-emerald-600 font-mono">{mock.accuracy}%</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          id={`history-audit-btn-${mock.id}`}
                          onClick={() => setSelectedMock(mock)}
                          className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/80 hover:border-blue-400 text-slate-600 hover:text-blue-600 flex items-center justify-center transition cursor-pointer"
                          title="View Section Analysis"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          id={`history-delete-btn-${mock.id}`}
                          onClick={() => onDeleteMock(mock.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 flex items-center justify-center transition cursor-pointer"
                          title="Remove Entry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono bg-slate-50/50">
            <span>Showing {(currentPage-1)*itemsPerPage + 1} - {Math.min(currentPage*itemsPerPage, filteredMocks.length)} of {filteredMocks.length} mock files</span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 transition disabled:opacity-35 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-3">Pg {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 transition disabled:opacity-35 cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Detailed section diagnostic analytics breakdown MODAL */}
      {selectedMock && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            id={`mock-diagnostic-detail-${selectedMock.id}`}
            className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 md:p-8 relative text-left my-8 shadow-2xl transition"
          >
            <button
              onClick={() => setSelectedMock(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition hover:bg-slate-200"
            >
              <X size={15} />
            </button>

            {/* Title block */}
            <div className="border-b border-slate-100 pb-4 mb-4 flex gap-4 items-start">
              <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex flex-col items-center justify-center font-mono">
                <span className="text-xs font-bold text-blue-600 uppercase">{selectedMock.examType}</span>
              </div>
              <div className="space-y-0.5">
                <h3 className="font-display font-semibold text-lg text-slate-900">{selectedMock.mockNumber}</h3>
                <p className="text-xs text-slate-500">Assessed by {selectedMock.platform} • Logged on {selectedMock.date}</p>
              </div>
            </div>

            {/* Quick Overall stats summary */}
            <div className="grid grid-cols-4 gap-2 text-center p-3.5 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Final Score</span>
                <strong className="text-slate-905 font-bold text-base leading-none">{selectedMock.score} / 200</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Percentile</span>
                <strong className="text-blue-600 text-base leading-none">{selectedMock.percentile}%</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Accuracy</span>
                <strong className="text-emerald-600 text-base leading-none">{selectedMock.accuracy}%</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Study Hours</span>
                <strong className="text-slate-700 text-base leading-none">{selectedMock.studyHours}h</strong>
              </div>
            </div>

            {/* Sections Diagnoses accordion style panels */}
            <div className="space-y-4 mt-6">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 pb-1 border-b border-slate-150">Four-Tier Subject Breakdowns</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['Mathematics', 'Reasoning', 'English', 'GeneralKnowledge'] as const).map(subj => {
                  const sec = selectedMock.sectionData[subj] || {
                    totalMarks: 0,
                    correctQuestions: 0,
                    wrongQuestions: 0,
                    unattemptedQuestions: 0,
                    accuracy: 0,
                    timeTaken: 15,
                    weakTopics: [],
                    confidenceRating: 3,
                    performanceIndicator: 'Medium'
                  };

                  let indicatorBg = 'bg-blue-50 text-blue-600 border-blue-105';
                  if (sec.performanceIndicator === 'Strong') indicatorBg = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                  if (sec.performanceIndicator === 'Weak') indicatorBg = 'bg-rose-50 text-rose-600 border-rose-100';

                  return (
                    <div key={subj} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-800 text-sm">{subj}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${indicatorBg}`}>
                          {sec.performanceIndicator}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 font-mono text-center text-[10px]">
                        <div className="bg-white p-1.5 rounded-lg border border-slate-200/60">
                          <span className="text-emerald-600 block font-bold">{sec.correctQuestions} R</span>
                          <span className="text-slate-400 text-[9px] uppercase font-bold">Correct</span>
                        </div>
                        <div className="bg-white p-1.5 rounded-lg border border-slate-200/60">
                          <span className="text-rose-500 block font-bold">{sec.wrongQuestions} W</span>
                          <span className="text-slate-400 text-[9px] uppercase font-bold">Wrong</span>
                        </div>
                        <div className="bg-white p-1.5 rounded-lg border border-slate-200/60">
                          <span className="text-slate-600 block font-bold">{sec.unattemptedQuestions} U</span>
                          <span className="text-slate-400 text-[9px] uppercase font-bold">Blank</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-xs font-sans text-slate-500 pt-1">
                        <span>Accuracy: <strong className="text-slate-800 font-bold">{sec.accuracy}%</strong></span>
                        <span>Confidence: <strong className="text-slate-800 font-bold">{sec.confidenceRating}/5</strong></span>
                        <span>Time: <strong className="text-slate-800 font-bold">{sec.timeTaken}m</strong></span>
                      </div>

                      {sec.weakTopics && sec.weakTopics.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 space-y-1">
                          <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">Flagged weak areas</span>
                          <div className="flex flex-wrap gap-1">
                            {sec.weakTopics.map(wt => (
                              <span key={wt} className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-semibold">{wt}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Coaching Tips inside this specific mock */}
            {selectedMock.insights && selectedMock.insights.length > 0 && (
              <div className="pt-5 mt-5 border-t border-slate-105 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                  <Sparkles size={12} />
                  Coaching Insights for this test run
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 list-disc pl-4 leading-relaxed font-sans">
                  {selectedMock.insights.map((ins, idx) => (
                    <li key={idx}>{ins}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-4 mt-4 border-t border-slate-105">
              <button
                onClick={() => setSelectedMock(null)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Close breakdown inspection
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
