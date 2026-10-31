import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Filter,
  Check,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Download,
  Copy,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Printer,
  ShieldCheck,
  GraduationCap,
  Calendar,
  Layers,
  FileText,
  X,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Eye,
  Target,
  Clock,
  History,
  Trash2
} from 'lucide-react';
import { User, Question, ExamType, SubjectId } from '../types';
import { api } from '../services/api';
import { saveBookmarkToFirestore, removeBookmarkFromFirestore } from '../services/firebase';
import { EXTENDED_QUESTIONS } from '../utils/questionBank';
import { INITIAL_QUESTIONS, SECONDARY_SUBJECTS } from '../mockData';
import { ADDITIONAL_SUBJECT_QUESTIONS } from '../data/expandedSubjectsQuestions';
import { AUTHENTIC_JAMB_PAST_QUESTIONS } from '../data/pastJambQuestionsBank';
import { gamification } from '../utils/gamification';
import { aiVoice } from '../utils/aiVoice';
import { searchHistoryManager } from '../utils/searchHistoryManager';
import confetti from 'canvas-confetti';

interface PastQuestionHarvesterViewProps {
  user?: User | null;
  onNavigate?: (view: string, extra?: any) => void;
  onStartPractice?: (questions: Question[]) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const PastQuestionHarvesterView: React.FC<PastQuestionHarvesterViewProps> = ({
  user,
  onNavigate,
  onStartPractice,
  onClose,
  isModal = false
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<'ALL' | 'JAMB' | 'WAEC' | 'NECO'>('JAMB');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');

  // Search History State
  const [searchHistory, setSearchHistory] = useState<string[]>(() => searchHistoryManager.getHistory('past_questions'));
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleHistoryUpdate = () => {
      setSearchHistory(searchHistoryManager.getHistory('past_questions'));
    };
    window.addEventListener('studynaija_search_history_updated', handleHistoryUpdate);
    return () => window.removeEventListener('studynaija_search_history_updated', handleHistoryUpdate);
  }, []);

  // Record non-empty searches with debounce
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length >= 3) {
      const timer = setTimeout(() => {
        searchHistoryManager.addSearch(trimmed, 'past_questions');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const handleSelectSearchTerm = (term: string) => {
    setSearchQuery(term);
    searchHistoryManager.addSearch(term, 'past_questions');
    setIsSearchDropdownOpen(false);
  };

  const handleRemoveHistoryItem = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    searchHistoryManager.removeSearch(term, 'past_questions');
  };

  const handleClearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    searchHistoryManager.clearHistory('past_questions');
  };

  // Focus Mode State: When active, user sees ONLY the context of what they tap on
  const [focusedQuestionId, setFocusedQuestionId] = useState<string | null>(null);
  const [focusOnTapEnabled, setFocusOnTapEnabled] = useState<boolean>(true);

  // Interactive Question State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});
  const [globalShowSolutions, setGlobalShowSolutions] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => gamification.getBookmarkedIds());
  const [readingQuestionId, setReadingQuestionId] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Optional Secondary Tab for importing / pasting raw test questions
  const [activeMode, setActiveMode] = useState<'browse' | 'paste'>('browse');
  const [pasteText, setPasteText] = useState<string>('');
  const [isParsingText, setIsParsingText] = useState<boolean>(false);
  const [pasteFeedback, setPasteFeedback] = useState<string | null>(null);

  // Combine and deduplicate all questions across curated banks
  const allIndexedQuestions = useMemo(() => {
    const map = new Map<string, Question>();

    // 1. Core Authentic JAMB Past Questions
    AUTHENTIC_JAMB_PAST_QUESTIONS.forEach(q => map.set(q.id, q));

    // 2. Extended CBT Question Bank
    EXTENDED_QUESTIONS.forEach(q => {
      if (!map.has(q.id)) map.set(q.id, q);
    });

    // 3. Initial Questions
    INITIAL_QUESTIONS.forEach(q => {
      if (!map.has(q.id)) map.set(q.id, q);
    });

    // 4. Expanded Arts & Science Subjects
    ADDITIONAL_SUBJECT_QUESTIONS.forEach(q => {
      if (!map.has(q.id)) map.set(q.id, q);
    });

    return Array.from(map.values());
  }, []);

  // Compute available topics based on selected subject
  const availableTopics = useMemo(() => {
    if (selectedSubjectId === 'all') return [];
    const sub = SECONDARY_SUBJECTS.find(s => s.id === selectedSubjectId);
    if (sub && sub.topics) return sub.topics;

    const topics = new Set<string>();
    allIndexedQuestions
      .filter(q => q.subjectId === selectedSubjectId && q.topic)
      .forEach(q => topics.add(q.topic));
    return Array.from(topics);
  }, [selectedSubjectId, allIndexedQuestions]);

  // High-Yield Quick Discovery Search Chips
  const quickSearchTags = [
    { label: 'Quadratic Equations', query: 'quadratic' },
    { label: 'The Life Changer (Novel)', query: 'Life Changer' },
    { label: 'Concord & Grammar', query: 'concord' },
    { label: 'Electric Current & Ohm', query: 'circuit' },
    { label: 'Genetics & Blood Groups', query: 'genetics' },
    { label: 'Hydrocarbons & Alkanes', query: 'hydrocarbon' },
    { label: 'Elasticity of Demand', query: 'elasticity' },
    { label: '1999 Constitution', query: 'constitution' },
    { label: 'Definite Integrals', query: 'integral' },
    { label: 'Photosynthesis & Cells', query: 'photosynthesis' }
  ];

  // Filtered Questions according to active search bar and filters
  const filteredQuestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allIndexedQuestions.filter(q => {
      // 1. Exam Type filter
      if (selectedExamType !== 'ALL') {
        const qExam = (q.examType || 'JAMB').toUpperCase();
        if (qExam !== selectedExamType && qExam !== 'ALL') {
          return false;
        }
      }

      // 2. Subject filter
      if (selectedSubjectId !== 'all') {
        if (q.subjectId !== selectedSubjectId) {
          return false;
        }
      }

      // 3. Year filter
      if (selectedYear !== 'all') {
        if (String(q.year) !== selectedYear) {
          return false;
        }
      }

      // 4. Topic filter
      if (selectedTopic !== 'all') {
        if (!q.topic || q.topic.toLowerCase() !== selectedTopic.toLowerCase()) {
          return false;
        }
      }

      // 5. Difficulty filter
      if (selectedDifficulty !== 'all') {
        if (!q.difficulty || q.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) {
          return false;
        }
      }

      // 6. Search Query
      if (query) {
        const inQuestion = q.question.toLowerCase().includes(query);
        const inSubject = (q.subjectName || '').toLowerCase().includes(query);
        const inTopic = (q.topic || '').toLowerCase().includes(query);
        const inExplanation = (q.explanation || '').toLowerCase().includes(query);
        const inOptions = Object.values(q.options || {}).some(opt => String(opt || '').toLowerCase().includes(query));
        const inYear = String(q.year || '').includes(query);

        if (!inQuestion && !inSubject && !inTopic && !inExplanation && !inOptions && !inYear) {
          return false;
        }
      }

      return true;
    });
  }, [
    allIndexedQuestions,
    searchQuery,
    selectedExamType,
    selectedSubjectId,
    selectedYear,
    selectedTopic,
    selectedDifficulty
  ]);

  // Resolve currently focused question
  const focusedIndex = useMemo(() => {
    if (!focusedQuestionId) return -1;
    return filteredQuestions.findIndex(q => q.id === focusedQuestionId);
  }, [focusedQuestionId, filteredQuestions]);

  const focusedQuestion = useMemo(() => {
    if (focusedIndex === -1) {
      // If not in filtered list, try finding directly in allIndexedQuestions
      if (focusedQuestionId) {
        return allIndexedQuestions.find(q => q.id === focusedQuestionId) || null;
      }
      return null;
    }
    return filteredQuestions[focusedIndex];
  }, [focusedIndex, focusedQuestionId, filteredQuestions, allIndexedQuestions]);

  // Stepping through focused questions
  const handlePrevFocused = () => {
    if (focusedIndex > 0) {
      setFocusedQuestionId(filteredQuestions[focusedIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextFocused = () => {
    if (focusedIndex >= 0 && focusedIndex < filteredQuestions.length - 1) {
      setFocusedQuestionId(filteredQuestions[focusedIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExitFocus = () => {
    setFocusedQuestionId(null);
  };

  // Keyboard navigation when in Focused View
  useEffect(() => {
    if (!focusedQuestion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'Escape') {
        handleExitFocus();
      } else if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') {
        handlePrevFocused();
      } else if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') {
        handleNextFocused();
      } else if (['a', 'A'].includes(e.key)) {
        handleSelectOption(focusedQuestion.id, 'A');
      } else if (['b', 'B'].includes(e.key)) {
        handleSelectOption(focusedQuestion.id, 'B');
      } else if (['c', 'C'].includes(e.key)) {
        handleSelectOption(focusedQuestion.id, 'C');
      } else if (['d', 'D'].includes(e.key)) {
        handleSelectOption(focusedQuestion.id, 'D');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedQuestion, focusedIndex, filteredQuestions]);

  // Handle Option Click on Question Card
  const handleSelectOption = (qId: string, optKey: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optKey
    }));
    setExpandedExplanations(prev => ({
      ...prev,
      [qId]: true
    }));
  };

  // Toggle individual explanation
  const toggleExplanation = (qId: string) => {
    setExpandedExplanations(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Toggle all solutions
  const handleToggleGlobalSolutions = () => {
    const nextState = !globalShowSolutions;
    setGlobalShowSolutions(nextState);
    const updated: Record<string, boolean> = {};
    filteredQuestions.forEach(q => {
      updated[q.id] = nextState;
    });
    setExpandedExplanations(updated);
  };

  // Toggle Bookmark
  const handleToggleBookmark = (q: Question) => {
    const res = gamification.toggleBookmark(q.id);
    setBookmarkedIds(res.allIds);

    if (user?.id) {
      if (res.isBookmarked) {
        saveBookmarkToFirestore(user.id, q.id, q.subjectId, q.question).catch(() => {});
      } else {
        removeBookmarkFromFirestore(user.id, q.id).catch(() => {});
      }
    }
  };

  // Text-to-speech Audio Readout
  const handleReadAloud = (q: Question) => {
    if (readingQuestionId === q.id) {
      aiVoice.stop();
      setReadingQuestionId(null);
      return;
    }

    aiVoice.stop();
    setReadingQuestionId(q.id);
    const optionsText = `Option A: ${q.options.A}. Option B: ${q.options.B}. Option C: ${q.options.C}. Option D: ${q.options.D}.`;
    const fullText = `Question from ${q.examType || 'JAMB'} ${q.year || ''}, ${q.subjectName}. ${q.question}. ${optionsText}`;

    aiVoice.speak(fullText);

    setTimeout(() => {
      if (readingQuestionId === q.id) {
        setReadingQuestionId(null);
      }
    }, 15000);
  };

  // Copy single question to clipboard
  const handleCopyQuestion = (q: Question, idx: number) => {
    const text = `Question ${idx + 1} [${q.examType || 'JAMB'} ${q.year || ''} - ${q.subjectName}]:\n${q.question}\n\nA. ${q.options.A}\nB. ${q.options.B}\nC. ${q.options.C}\nD. ${q.options.D}\n\nCorrect Answer: (${q.correctOption})\nExplanation: ${q.explanation}\n\nShared from StudyNaija CBT Archive (https://studynaija.ng)`;

    navigator.clipboard.writeText(text);
    setCopyFeedback(q.id);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  // Launch Timed CBT Practice with filtered questions
  const handleLaunchPracticeWithFiltered = () => {
    if (filteredQuestions.length === 0) return;
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });

    if (onStartPractice) {
      onStartPractice(filteredQuestions.slice(0, 40));
    } else if (onNavigate) {
      onNavigate('practice', {
        customQuestions: filteredQuestions.slice(0, 40),
        subjectId: selectedSubjectId !== 'all' ? selectedSubjectId : filteredQuestions[0]?.subjectId
      });
    }
  };

  // Print / Export Revision Sheet
  const handlePrintSheet = () => {
    window.print();
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedExamType('JAMB');
    setSelectedSubjectId('all');
    setSelectedYear('all');
    setSelectedTopic('all');
    setSelectedDifficulty('all');
    setSelectedAnswers({});
    setFocusedQuestionId(null);
  };

  // Parse custom raw text
  const handleParseCustomText = async () => {
    if (!pasteText.trim() || pasteText.trim().length < 25) {
      setPasteFeedback('Please paste at least one complete past question with options (A, B, C, D).');
      return;
    }

    setIsParsingText(true);
    setPasteFeedback(null);
    try {
      const res = await api.harvestQuestionsFromText(pasteText.trim(), 'JAMB', selectedSubjectId !== 'all' ? selectedSubjectId : 'english');
      if (res.success && Array.isArray(res.questions) && res.questions.length > 0) {
        setPasteFeedback(`Extracted ${res.questions.length} questions successfully!`);
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
        if (onStartPractice) {
          onStartPractice(res.questions);
        }
      } else {
        setPasteFeedback(res.error || 'Could not parse multiple-choice questions. Ensure questions have options A, B, C, D.');
      }
    } catch (e: any) {
      setPasteFeedback(e.message || 'Failed to parse text.');
    } finally {
      setIsParsingText(false);
    }
  };

  const yearsList = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2012', '2010'];

  // =========================================================================
  // VIEW MODE A: FULL ISOLATED FOCUS MODE (SHOW ONLY WHAT THE USER TAPPED ON)
  // =========================================================================
  if (focusedQuestion) {
    const userChoice = selectedAnswers[focusedQuestion.id];
    const isExplanationOpen = expandedExplanations[focusedQuestion.id] || true; // In focus mode, solution is readily accessible
    const isSaved = bookmarkedIds.includes(focusedQuestion.id);
    const isReading = readingQuestionId === focusedQuestion.id;
    const currentIndexNum = focusedIndex >= 0 ? focusedIndex + 1 : 1;
    const totalCount = filteredQuestions.length > 0 ? filteredQuestions.length : allIndexedQuestions.length;

    return (
      <div id="past-question-isolated-focus-view" className="space-y-6 pb-24 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Floating Control Bar - Back & Steppers */}
        <div className="bg-slate-950 text-white rounded-3xl p-4 sm:p-5 border border-cyan-500/40 shadow-2xl flex flex-wrap items-center justify-between gap-3 sticky top-20 z-30 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={handleExitFocus}
              className="px-4 py-2 rounded-2xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
              title="Return to the full questions catalog [ESC]"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span>Back to All Questions</span>
              <span className="text-[10px] opacity-75 font-mono hidden sm:inline">[ESC]</span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-200">
                Focus Mode: <span className="text-cyan-400">Question {currentIndexNum}</span> of {totalCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevFocused}
              disabled={focusedIndex <= 0}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer transition border border-slate-800"
              title="Previous Question (Keyboard: Left Arrow or P)"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous [←]</span>
            </button>

            <button
              onClick={handleNextFocused}
              disabled={focusedIndex >= filteredQuestions.length - 1}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer transition border border-slate-800"
              title="Next Question (Keyboard: Right Arrow or N)"
            >
              <span className="hidden sm:inline">Next [→]</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Dedicated Question Stage (ONLY THIS QUESTION IS DISPLAYED) */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-cyan-400 shadow-2xl space-y-6 relative">
          
          {/* Question Metadata Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-xl font-mono font-black text-sm bg-slate-950 text-white shadow-xs">
                Question #{currentIndexNum}
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-black bg-cyan-100 text-cyan-950 border border-cyan-300">
                {focusedQuestion.examType || 'JAMB'} {focusedQuestion.year || ''}
              </span>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-800">
                {focusedQuestion.subjectName}
              </span>
              {focusedQuestion.topic && (
                <span className="text-xs text-slate-500 font-semibold px-2 py-0.5 rounded-lg bg-slate-50">
                  Topic: {focusedQuestion.topic}
                </span>
              )}
              {focusedQuestion.difficulty && (
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  focusedQuestion.difficulty === 'Easy'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : focusedQuestion.difficulty === 'Hard'
                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}>
                  {focusedQuestion.difficulty} Level
                </span>
              )}
            </div>

            {/* Audio, Bookmark, Copy Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleReadAloud(focusedQuestion)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isReading
                    ? 'bg-cyan-500 text-slate-950 border-cyan-600 animate-pulse font-black'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title="Read question out loud with AI voice"
              >
                {isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-700" />}
                <span>{isReading ? 'Stop Audio' : 'Listen'}</span>
              </button>

              <button
                onClick={() => handleToggleBookmark(focusedQuestion)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isSaved
                    ? 'bg-amber-50 text-amber-900 border-amber-400 shadow-2xs font-black'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title="Save bookmark to Firestore"
              >
                {isSaved ? (
                  <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" />
                ) : (
                  <Bookmark className="w-4 h-4 text-slate-600" />
                )}
                <span>{isSaved ? 'Saved' : 'Bookmark'}</span>
              </button>

              <button
                onClick={() => handleCopyQuestion(focusedQuestion, currentIndexNum - 1)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Copy question & solution to clipboard"
              >
                {copyFeedback === focusedQuestion.id ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-600" />
                )}
                <span>{copyFeedback === focusedQuestion.id ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Large Focused Question Text */}
          <div className="text-slate-950 font-bold text-lg sm:text-2xl leading-relaxed font-sans">
            {focusedQuestion.question}
          </div>

          {/* Interactive Multiple Choice Options Grid */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Select your answer to test yourself:
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['A', 'B', 'C', 'D'] as const).map(optKey => {
                const optText = focusedQuestion.options[optKey];
                if (!optText) return null;

                const isChosen = userChoice === optKey;
                const isCorrectAnswer = optKey === focusedQuestion.correctOption;
                
                let cardStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300';
                let badgeStyle = 'bg-slate-200 text-slate-700 font-bold';
                let iconIndicator = null;

                if (userChoice) {
                  if (isCorrectAnswer) {
                    cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500 shadow-md';
                    badgeStyle = 'bg-emerald-600 text-white font-black';
                    iconIndicator = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-auto" />;
                  } else if (isChosen) {
                    cardStyle = 'bg-red-50 border-red-400 text-red-950 font-medium ring-2 ring-red-400';
                    badgeStyle = 'bg-red-500 text-white font-black';
                    iconIndicator = <XCircle className="w-5 h-5 text-red-500 shrink-0 ml-auto" />;
                  } else {
                    cardStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={optKey}
                    onClick={() => handleSelectOption(focusedQuestion.id, optKey)}
                    className={`p-4 sm:p-5 rounded-2xl border-2 text-left text-sm sm:text-base leading-relaxed flex items-start gap-3.5 transition-all cursor-pointer ${cardStyle}`}
                  >
                    <span className={`w-8 h-8 rounded-xl font-mono text-sm flex items-center justify-center shrink-0 ${badgeStyle}`}>
                      {optKey}
                    </span>
                    <span className="pt-0.5 flex-1">{optText}</span>
                    {iconIndicator}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Selection Feedback Notice */}
          {userChoice && (
            <div className={`p-4 rounded-2xl text-sm flex items-center gap-3 ${
              userChoice === focusedQuestion.correctOption
                ? 'bg-emerald-50 border-2 border-emerald-300 text-emerald-950 font-bold shadow-xs'
                : 'bg-red-50 border-2 border-red-300 text-red-950 font-semibold shadow-xs'
            }`}>
              {userChoice === focusedQuestion.correctOption ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Correct! <strong>Option ({focusedQuestion.correctOption})</strong> is the accurate official answer. Excellent job!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>You picked ({userChoice}). The official verified answer is <strong>Option ({focusedQuestion.correctOption})</strong>. Study the teacher explanation below!</span>
                </>
              )}
            </div>
          )}

          {/* Step-by-Step Teacher Solution & Syllabus Breakdown */}
          {focusedQuestion.explanation && (
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 text-slate-100 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Official Examiner Working & Marking Scheme (Option {focusedQuestion.correctOption})</span>
                </div>
                <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                  {focusedQuestion.subjectName}
                </span>
              </div>
              
              <div className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans pt-1">
                {focusedQuestion.explanation}
              </div>
            </div>
          )}

          {/* Quick Footer Navigation for Focused Mode */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleExitFocus}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit Focus Mode & Return to Search List</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevFocused}
                disabled={focusedIndex <= 0}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNextFocused}
                disabled={focusedIndex >= filteredQuestions.length - 1}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    );
  }

  // =========================================================================
  // VIEW MODE B: FULL SEARCH & BROWSE CATALOG
  // =========================================================================
  return (
    <div id="past-jamb-questions-archive" className="space-y-6 pb-20">
      
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 border border-cyan-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>OFFICIAL PAST EXAMS ARCHIVE</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                🇳🇬 JAMB UTME & WAEC SSCE
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {allIndexedQuestions.length}+ Questions Indexed
              </span>
            </div>

            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white tracking-tight">
              Search & Browse Past JAMB Questions
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore authentic past questions with options, step-by-step teacher solutions, and syllabus references. <strong>Tap any question to focus on it exclusively</strong> (hiding all distractions), or practice directly!
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-lg sm:text-xl font-mono font-black text-cyan-300">{allIndexedQuestions.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CBT Past Questions</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-lg sm:text-xl font-mono font-black text-emerald-400">16</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subjects Available</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-lg sm:text-xl font-mono font-black text-amber-400">2010 – 2026</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exam Years</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-lg sm:text-xl font-mono font-black text-purple-400">100%</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Solutions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1 border border-slate-200">
          <button
            onClick={() => setActiveMode('browse')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeMode === 'browse'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4 text-cyan-400" />
            <span>Search & Browse Questions ({filteredQuestions.length})</span>
          </button>

          <button
            onClick={() => setActiveMode('paste')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeMode === 'paste'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Paste / Import Exam Paper Text</span>
          </button>
        </div>

        {activeMode === 'browse' && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Focus on Tap switch */}
            <button
              onClick={() => setFocusOnTapEnabled(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                focusOnTapEnabled
                  ? 'bg-cyan-50 border-cyan-400 text-cyan-900 font-extrabold ring-1 ring-cyan-400'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
              title="When active, tapping any question card immediately hides everything else and isolates the question in full focus view"
            >
              <Target className="w-3.5 h-3.5 text-cyan-600" />
              <span>Tap-to-Focus Mode: {focusOnTapEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={handleToggleGlobalSolutions}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {globalShowSolutions ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
                  <span>Hide Solutions</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                  <span>Reveal All Solutions</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrintSheet}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Sheet</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab Content: Browse & Search */}
      {activeMode === 'browse' && (
        <div className="space-y-6">
          
          {/* Main Search Input & Filter Dashboard */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
            
            {/* Primary Search Bar with Integrated Search History Dropdown */}
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchDropdownOpen(true)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    handleSelectSearchTerm(searchQuery.trim());
                  }
                }}
                placeholder="Search past JAMB questions by keyword, topic, or question text (e.g. 'allotrope', 'concord', 'quadratic', 'momentum', 'elasticity')..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 font-medium text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                  title="Clear search input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Search History Dropdown Menu */}
              {isSearchDropdownOpen && searchHistory.length > 0 && (
                <div 
                  className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-30 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseDown={e => e.preventDefault()} // prevent input blur before click fires
                >
                  <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Recent Search History</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleClearAllHistory}
                      className="text-[10px] text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear All</span>
                    </button>
                  </div>

                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
                    {searchHistory.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSearchTerm(item)}
                        className="group flex items-center justify-between px-3 py-2 rounded-xl hover:bg-cyan-50 text-slate-700 hover:text-cyan-950 text-xs font-semibold cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveHistoryItem(e, item)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition cursor-pointer shrink-0"
                          title="Remove from history"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1.5 px-3 border-t border-slate-100 text-right">
                    <button
                      type="button"
                      onClick={() => setIsSearchDropdownOpen(false)}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                    >
                      Close Dropdown
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Search History Chips (Persistent & Clickable) */}
            {searchHistory.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <History className="w-3 h-3 text-cyan-600" />
                    <span>Your Recent Searches:</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearAllHistory}
                    className="text-[10px] text-slate-400 hover:text-rose-600 transition font-bold"
                  >
                    Clear History
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {searchHistory.slice(0, 8).map((term, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-slate-700 hover:text-cyan-950 transition cursor-pointer group shadow-2xs"
                      onClick={() => handleSelectSearchTerm(term)}
                    >
                      <Clock className="w-3 h-3 text-slate-400 group-hover:text-cyan-600 shrink-0" />
                      <span className="max-w-[160px] truncate">{term}</span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveHistoryItem(e, term)}
                        className="ml-0.5 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-rose-600 transition"
                        title="Delete this search"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick 1-Click Search Discovery Chips */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Popular Searches & High-Yield Topics:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickSearchTags.map(tag => (
                  <button
                    key={tag.label}
                    onClick={() => handleSelectSearchTerm(tag.query)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      searchQuery.toLowerCase() === tag.query.toLowerCase()
                        ? 'bg-cyan-50 text-cyan-900 border-cyan-400 font-bold shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span>{tag.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Filters Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
              
              {/* Exam Body */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Exam Body
                </label>
                <select
                  value={selectedExamType}
                  onChange={e => setSelectedExamType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="ALL">All Exams (JAMB & WAEC)</option>
                  <option value="JAMB">JAMB UTME</option>
                  <option value="WAEC">WAEC SSCE</option>
                  <option value="NECO">NECO SSCE</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={e => {
                    setSelectedSubjectId(e.target.value);
                    setSelectedTopic('all');
                  }}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="all">All Subjects (Comprehensive)</option>
                  {SECONDARY_SUBJECTS.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Exam Year */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Exam Year
                </label>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="all">All Years (2010 – 2026)</option>
                  {yearsList.map(y => (
                    <option key={y} value={y}>
                      {y} Past Questions
                    </option>
                  ))}
                </select>
              </div>

              {/* Syllabus Topic */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Syllabus Topic
                </label>
                <select
                  value={selectedTopic}
                  onChange={e => setSelectedTopic(e.target.value)}
                  disabled={availableTopics.length === 0}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 cursor-pointer"
                >
                  <option value="all">
                    {availableTopics.length === 0 ? 'Select a Subject First' : 'All Topics'}
                  </option>
                  {availableTopics.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Difficulty Level
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={e => setSelectedDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="all">All Difficulties</option>
                  <option value="Easy">Easy (Foundation)</option>
                  <option value="Medium">Medium (Standard UTME)</option>
                  <option value="Hard">Hard (Distinction / 300+)</option>
                </select>
              </div>

            </div>

            {/* Filter Results Summary & Quick Reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900">
                  Showing {filteredQuestions.length} of {allIndexedQuestions.length} past questions
                </span>
                <span className="text-[11px] text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200 font-medium">
                  💡 Tip: Click any card to enter single-question Focus Mode
                </span>
                {(searchQuery || selectedSubjectId !== 'all' || selectedYear !== 'all' || selectedTopic !== 'all' || selectedDifficulty !== 'all' || selectedExamType !== 'JAMB') && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-cyan-600 hover:text-cyan-800 font-bold underline cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>

              {filteredQuestions.length > 0 && (
                <button
                  onClick={handleLaunchPracticeWithFiltered}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start CBT Practice With These {Math.min(filteredQuestions.length, 40)} Questions →</span>
                </button>
              )}
            </div>

          </div>

          {/* Question List Cards */}
          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
              <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-lg font-['Outfit']">
                  No Past Questions Match Your Search
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try searching with different terms like "quadratic", "cell", "concord", "law of demand", or select "All Subjects" and "All Years" to widen your search.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                Reset All Search Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => {
                const userChoice = selectedAnswers[q.id];
                const isExplanationOpen = expandedExplanations[q.id] || globalShowSolutions;
                const isSaved = bookmarkedIds.includes(q.id);
                const isReading = readingQuestionId === q.id;

                return (
                  <div
                    key={q.id}
                    className="group bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-lg transition-all space-y-4 relative"
                  >
                    {/* Top Metadata Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg font-mono font-black text-xs bg-slate-950 text-white">
                          #{idx + 1}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-cyan-50 text-cyan-900 border border-cyan-200">
                          {q.examType || 'JAMB'} {q.year || ''}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {q.subjectName}
                        </span>
                        {q.topic && (
                          <span className="text-xs text-slate-400 font-medium">
                            • {q.topic}
                          </span>
                        )}
                        {q.difficulty && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            q.difficulty === 'Easy'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : q.difficulty === 'Hard'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {q.difficulty}
                          </span>
                        )}
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        {/* Dedicated Focus Mode Button */}
                        <button
                          onClick={() => setFocusedQuestionId(q.id)}
                          className="px-3 py-1 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-300 text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Focus exclusively on this question (hide all other questions and distractions)"
                        >
                          <Target className="w-3.5 h-3.5 text-cyan-600" />
                          <span>Focus View</span>
                        </button>

                        <button
                          onClick={() => handleReadAloud(q)}
                          className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                            isReading
                              ? 'bg-cyan-500 text-slate-950 border-cyan-600 animate-pulse'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Listen to question readout"
                        >
                          {isReading ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleCopyQuestion(q, idx)}
                          className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs transition cursor-pointer"
                          title="Copy question text and solution"
                        >
                          {copyFeedback === q.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => handleToggleBookmark(q)}
                          className={`p-1.5 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1 ${
                            isSaved
                              ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                          title="Save this question to your Dashboard for later review"
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-600" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Question Text (Clicking enters focus mode if enabled) */}
                    <div
                      onClick={() => {
                        if (focusOnTapEnabled) setFocusedQuestionId(q.id);
                      }}
                      className="text-slate-900 font-semibold text-sm sm:text-base leading-relaxed cursor-pointer hover:text-cyan-900 transition-colors"
                      title={focusOnTapEnabled ? "Click to isolate this question in full focus view" : undefined}
                    >
                      {q.question}
                    </div>

                    {/* Interactive Multiple Choice Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {(['A', 'B', 'C', 'D'] as const).map(optKey => {
                        const optText = q.options[optKey];
                        if (!optText) return null;

                        const isChosen = userChoice === optKey;
                        const isCorrectAnswer = optKey === q.correctOption;
                        
                        let cardStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300';
                        let badgeStyle = 'bg-slate-200 text-slate-700 font-bold';
                        let iconIndicator = null;

                        if (userChoice) {
                          if (isCorrectAnswer) {
                            cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500';
                            badgeStyle = 'bg-emerald-600 text-white font-black';
                            iconIndicator = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-auto" />;
                          } else if (isChosen) {
                            cardStyle = 'bg-red-50 border-red-400 text-red-950 font-medium ring-1 ring-red-400';
                            badgeStyle = 'bg-red-500 text-white font-black';
                            iconIndicator = <XCircle className="w-4 h-4 text-red-500 shrink-0 ml-auto" />;
                          } else {
                            cardStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-70';
                          }
                        }

                        return (
                          <button
                            key={optKey}
                            onClick={() => handleSelectOption(q.id, optKey)}
                            className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm leading-relaxed flex items-start gap-3 transition-all cursor-pointer ${cardStyle}`}
                          >
                            <span className={`w-7 h-7 rounded-xl font-mono text-xs flex items-center justify-center shrink-0 ${badgeStyle}`}>
                              {optKey}
                            </span>
                            <span className="pt-0.5 flex-1">{optText}</span>
                            {iconIndicator}
                          </button>
                        );
                      })}
                    </div>

                    {/* User Selection Feedback Notice */}
                    {userChoice && (
                      <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                        userChoice === q.correctOption
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold'
                          : 'bg-red-50 border border-red-200 text-red-900 font-medium'
                      }`}>
                        {userChoice === q.correctOption ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Correct! Option ({q.correctOption}) is the accurate official answer.</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                            <span>You selected ({userChoice}). The official correct answer is <strong>Option ({q.correctOption})</strong>.</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Collapsible Detailed Teacher Explanation */}
                    <div className="pt-1 flex items-center justify-between">
                      <button
                        onClick={() => toggleExplanation(q.id)}
                        className="text-xs font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1.5 cursor-pointer py-1"
                      >
                        {isExplanationOpen ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            <span>Hide Teacher Solution</span>
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            <span>View Step-by-Step Teacher Solution</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setFocusedQuestionId(q.id)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Isolate & Focus →</span>
                      </button>
                    </div>

                    {isExplanationOpen && q.explanation && (
                      <div className="mt-2.5 p-4 rounded-2xl bg-slate-950 text-slate-200 border border-slate-800 space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Official Examiner Solution (Option {q.correctOption})</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                          {q.explanation}
                        </p>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Pagination / Practice Banner */}
          {filteredQuestions.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="font-black text-sm text-white">
                  Ready to test your speed under real CBT exam hall pressure?
                </div>
                <div className="text-xs text-slate-400">
                  Launch an 8-key timed drill with these {Math.min(filteredQuestions.length, 40)} questions to build exam speed.
                </div>
              </div>

              <button
                onClick={handleLaunchPracticeWithFiltered}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 text-slate-950 font-black text-xs rounded-2xl shadow-xl transition hover:scale-105 flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Launch CBT Practice Drill →</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* Tab Content: Paste / Import Custom Questions */}
      {activeMode === 'paste' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900 font-['Outfit']">
              Import & Parse Questions from Text / School Handout
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Have a WhatsApp past question list, PDF text, or school lesson paper? Paste the raw text below. StudyNaija will parse the questions, options (A-D), and correct answers into interactive CBT drills.
            </p>
          </div>

          <div className="space-y-3">
            <textarea
              rows={8}
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              placeholder="Paste raw questions here, for example:&#10;&#10;1. Which of the following is an allotrope of Carbon?&#10;A. Diamond&#10;B. Limestone&#10;C. Clay&#10;D. Quartz&#10;Answer: A"
              className="w-full p-4 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />

            {pasteFeedback && (
              <div className="p-3 rounded-xl bg-slate-100 text-xs font-semibold text-slate-800">
                {pasteFeedback}
              </div>
            )}

            <button
              onClick={handleParseCustomText}
              disabled={isParsingText}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>{isParsingText ? 'Parsing Questions...' : 'Convert Text into Practice Drill →'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
