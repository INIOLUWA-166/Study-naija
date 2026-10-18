import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Play, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  FileQuestion,
  Filter,
  Check,
  TrendingUp,
  Award,
  Zap,
  RotateCcw,
  BarChart3,
  Bot,
  Brain,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Subject, User, SubjectTopicProgress } from '../types';
import { topicProgressManager } from '../utils/topicProgress';

interface SubjectsViewProps {
  subjects: Subject[];
  user: User | null;
  activeExamFilter: 'ALL' | 'JAMB' | 'WAEC';
  onStartPractice: (subjectId: string, topic?: string) => void;
  onStartMock: (subjectId: string) => void;
  onNavigate?: (view: string, extra?: any) => void;
}

type TopicFilterTab = 'all' | 'covered' | 'uncovered';

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  user,
  activeExamFilter,
  onStartPractice,
  onStartMock,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || 'english');
  const [topicFilter, setTopicFilter] = useState<TopicFilterTab>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Re-read progress whenever topic updates occur or component loads
  useEffect(() => {
    const handleUpdate = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    window.addEventListener('studynaija_topic_progress_updated', handleUpdate);
    return () => window.removeEventListener('studynaija_topic_progress_updated', handleUpdate);
  }, []);

  const filteredSubjects = subjects.filter(sub =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  // Calculate progress maps
  const allProgressMap = topicProgressManager.getAllSubjectsProgress(subjects, user);
  const currentSubjectProgress: SubjectTopicProgress = currentSubject
    ? topicProgressManager.getSubjectProgress(currentSubject, user)
    : {
        subjectId: '',
        subjectName: '',
        totalTopics: 1,
        coveredTopics: 0,
        progressPercentage: 0,
        questionsSolved: 0,
        correctAnswers: 0,
        topicStatuses: {}
      };

  const overallCurriculumStats = topicProgressManager.getCurriculumOverallStats(subjects, user);

  // Toggle manual topic completion
  const handleToggleTopic = (e: React.MouseEvent, topicName: string) => {
    e.stopPropagation();
    if (!currentSubject) return;
    topicProgressManager.toggleTopicCompletion(currentSubject.id, topicName);
    setRefreshTrigger(prev => prev + 1);
  };

  // Filter topics for the selected subject
  const currentTopics = (currentSubject?.topics || []).filter(topicName => {
    const status = currentSubjectProgress.topicStatuses[topicName];
    if (topicFilter === 'covered') {
      return status?.covered;
    }
    if (topicFilter === 'uncovered') {
      return !status?.covered;
    }
    return true;
  });

  return (
    <div id="subjects-view-container" className="space-y-8 pb-16">
      
      {/* Header & Overall Curriculum Coverage Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>National Syllabus & Subject Progress Tracker</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit'] tracking-tight">
              All Study Subjects & Topic Progress
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Track real-time topic completion across JAMB UTME & WAEC syllabuses. Monitor your topic coverage percentage, practice weak areas, and unlock complete subject mastery.
            </p>
          </div>

          {/* Search bar */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search subjects or key topics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* Global Syllabus Completion Milestone Meter */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white p-5 border border-emerald-500/30 relative overflow-hidden shadow-md">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase tracking-wider border border-emerald-500/40 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Overall Curriculum Mastery
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {overallCurriculumStats.coveredTopics} of {overallCurriculumStats.totalTopics} Syllabus Topics Covered
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white font-['Outfit']">
                {overallCurriculumStats.overallPercentage}% of Nigerian Secondary Curriculum Completed
              </h3>
              <p className="text-xs text-slate-300">
                Based on your practice drill history, mock exam submissions, and active revision checklists.
              </p>
            </div>

            {/* Visual Progress Bar & Big Percentage */}
            <div className="w-full md:w-72 shrink-0 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">National Target</span>
                <span className="text-emerald-400 font-extrabold text-sm">{overallCurriculumStats.overallPercentage}%</span>
              </div>
              <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                  style={{ width: `${Math.max(8, overallCurriculumStats.overallPercentage)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{overallCurriculumStats.totalQuestionsSolved} Questions Solved</span>
                <span className="text-emerald-300 font-semibold">{overallCurriculumStats.overallMastery}% Accuracy</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Subject Selector with Visual Progress Bars & Detailed Topic View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Subjects List WITH VISUAL PROGRESS BARS */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Core Subjects ({filteredSubjects.length})</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Topic Coverage %</span>
          </div>

          <div className="space-y-2.5">
            {filteredSubjects.map(sub => {
              const isSelected = sub.id === currentSubject?.id;
              const progress = allProgressMap[sub.id] || {
                progressPercentage: 0,
                coveredTopics: 0,
                totalTopics: sub.topics.length || 1,
                questionsSolved: 0
              };

              // Progress bar styling based on percentage
              const pct = progress.progressPercentage;
              let barGradient = 'from-slate-400 to-slate-500';
              let badgeColor = 'text-slate-600 bg-slate-100 border-slate-200';
              let badgeLabel = 'Not Started';

              if (pct >= 75) {
                barGradient = 'from-emerald-500 to-teal-400';
                badgeColor = 'text-emerald-800 bg-emerald-50 border-emerald-200';
                badgeLabel = 'Mastered';
              } else if (pct >= 40) {
                barGradient = 'from-amber-500 to-emerald-400';
                badgeColor = 'text-amber-800 bg-amber-50 border-amber-200';
                badgeLabel = 'In Progress';
              } else if (pct > 0) {
                barGradient = 'from-blue-500 to-indigo-400';
                badgeColor = 'text-blue-800 bg-blue-50 border-blue-200';
                badgeLabel = 'Started';
              }

              return (
                <button
                  key={sub.id}
                  id={`subject-select-btn-${sub.id}`}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-2 ring-emerald-500/25'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                  }`}
                >
                  {/* Subject Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                        isSelected 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                      }`}>
                        {sub.code}
                      </div>
                      <div>
                        <h3 className={`font-extrabold text-sm ${isSelected ? 'text-emerald-950 font-bold' : 'text-slate-900'}`}>
                          {sub.name}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>{sub.topics.length} Syllabus Topics</span>
                          <span>•</span>
                          <span>{sub.questionCount}+ Questions</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge & Chevron */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {badgeLabel}
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-emerald-600 translate-x-0.5' : 'text-slate-400'}`} />
                    </div>
                  </div>

                  {/* VISUAL PROGRESS BAR FOR THIS SUBJECT */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">
                        {progress.coveredTopics} of {progress.totalTopics} Topics Covered
                      </span>
                      <span className={`font-black ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {pct}%
                      </span>
                    </div>

                    {/* Progress track */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${barGradient} transition-all duration-500`}
                        style={{ width: `${Math.max(pct > 0 ? 5 : 0, pct)}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Subject Details & Topics Breakdown */}
        {currentSubject && (
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-7">
            
            {/* Subject Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100/80 text-emerald-900 font-extrabold text-xs mb-2">
                  <span>{currentSubject.code}</span>
                  <span>•</span>
                  <span>{activeExamFilter === 'ALL' ? 'JAMB & WAEC CBT' : activeExamFilter}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
                  {currentSubject.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {currentSubject.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => onStartPractice(currentSubject.id)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Practice Drill</span>
                </button>

                <button
                  onClick={() => onStartMock(currentSubject.id)}
                  className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>CBT Mock</span>
                </button>
              </div>
            </div>

            {/* SUBJECT VISUAL PROGRESS & MASTERY SPOTLIGHT CARD */}
            <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-50/60 via-slate-50 to-teal-50/40 border border-emerald-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      {currentSubject.name} Syllabus Progress
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Based on your practice questions & revision history
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-emerald-800 font-['Outfit']">
                    {currentSubjectProgress.progressPercentage}%
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {currentSubjectProgress.coveredTopics} of {currentSubjectProgress.totalTopics} Topics
                  </span>
                </div>
              </div>

              {/* Large Visual Progress Bar */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden p-0.5">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 transition-all duration-700 ease-out"
                    style={{ width: `${Math.max(6, currentSubjectProgress.progressPercentage)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{currentSubjectProgress.totalTopics - currentSubjectProgress.coveredTopics} topics remaining</span>
                  <span>{currentSubjectProgress.questionsSolved} practice questions answered</span>
                </div>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Covered Topics</div>
                  <div className="text-base font-black text-emerald-700 mt-0.5">
                    {currentSubjectProgress.coveredTopics}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Questions Solved</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">
                    {currentSubjectProgress.questionsSolved}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Readiness Level</div>
                  <div className="text-base font-black text-emerald-600 mt-0.5">
                    {currentSubjectProgress.progressPercentage >= 75 ? 'Distinction 🔥' : currentSubjectProgress.progressPercentage >= 40 ? 'Moderate ⚡' : 'Developing 🌱'}
                  </div>
                </div>
              </div>
            </div>

            {/* Topics Breakdown Section */}
            <div className="space-y-4">
              
              {/* Controls: Title & Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileQuestion className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-black text-sm text-slate-900 font-['Outfit']">
                    Topic Breakdown & Interactive Checklist
                  </h4>
                  <span className="text-xs text-slate-400 font-medium">
                    ({currentTopics.length})
                  </span>
                </div>

                {/* Filter Chips */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                  {(['all', 'covered', 'uncovered'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setTopicFilter(tab)}
                      className={`px-3 py-1 rounded-lg transition-all capitalize cursor-pointer text-xs ${
                        topicFilter === tab
                          ? 'bg-white text-slate-900 shadow-xs font-black'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {tab === 'all' ? 'All' : tab === 'covered' ? 'Covered' : 'Need Practice'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topics List with Interactive Status Indicators */}
              <div className="space-y-2.5">
                {currentTopics.map((topicName, index) => {
                  const statusInfo = currentSubjectProgress.topicStatuses[topicName];
                  const isCovered = statusInfo?.covered;
                  const isMastered = statusInfo?.status === 'mastered';
                  const questionsCount = statusInfo?.questionsAnswered || 0;

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                        isCovered
                          ? 'bg-emerald-50/30 border-emerald-200/80 hover:border-emerald-400'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Interactive Checkbox Button to toggle covered status */}
                        <button
                          onClick={e => handleToggleTopic(e, topicName)}
                          title={isCovered ? "Mark topic as needing practice" : "Mark topic as covered"}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer border ${
                            isCovered
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 border-slate-300 text-transparent hover:border-emerald-500'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                              {topicName}
                            </span>

                            {/* Status Pill */}
                            {isMastered ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Mastered ({statusInfo.masteryPercentage}%)
                              </span>
                            ) : isCovered ? (
                              <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold border border-teal-200">
                                Covered ({questionsCount} Qs)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                                Not Started
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 mt-1">
                            <span>Syllabus objective</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">JAMB/WAEC Past Questions</span>
                            {statusInfo?.lastPracticed && (
                              <>
                                <span>•</span>
                                <span className="text-slate-400">{statusInfo.lastPracticed}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons for this specific topic */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Ask AI Tutor */}
                        {onNavigate && (
                          <button
                            onClick={() => onNavigate('ai-tutor', {
                              topic: topicName,
                              subject: currentSubject.name
                            })}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="Ask Naija AI for step-by-step syllabus explanation"
                          >
                            <Bot className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="hidden sm:inline">Ask AI</span>
                          </button>
                        )}

                        {/* Practice Topic */}
                        <button
                          onClick={() => onStartPractice(currentSubject.id, topicName)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Practice</span>
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {currentTopics.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs font-bold">
                      {topicFilter === 'uncovered'
                        ? 'Awesome job! You have covered all syllabus topics for this subject!'
                        : 'No topics found for this filter.'}
                    </p>
                    <button
                      onClick={() => setTopicFilter('all')}
                      className="text-xs text-emerald-600 font-bold hover:underline"
                    >
                      View all topics
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Examiner Recommendation & AI Study Note */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50/50 border border-amber-300/80 text-amber-950 space-y-1.5">
              <div className="text-xs font-black flex items-center gap-1.5 text-amber-900 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Examiner Tip for {currentSubject.name}
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                Mastering at least 70% of topics in {currentSubject.name} historically correlates with scoring over 75+ in JAMB UTME and obtaining distinction (A1/B2) in WAEC SSCE. Use StudyNaija’s timed drills to build speed under exam pressure.
              </p>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
