import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  Flag, 
  BookOpen, 
  Zap,
  HelpCircle,
  BarChart2,
  Award,
  Calculator,
  Type,
  Lightbulb,
  Check,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Lock,
  FileText,
  Shuffle,
  Bookmark,
  BookmarkCheck,
  Volume2,
  VolumeX,
  Flame,
  Gauge,
  Eye,
  EyeOff,
  Play,
  Square,
  ShieldCheck
} from 'lucide-react';
import { Question, Subject, User } from '../types';
import { api } from '../services/api';
import { shuffleQuestionOptions, EXTENDED_QUESTIONS, generateFreshDrillQuestions } from '../utils/questionBank';
import {
  createDynamicQuestionVariant,
  shuffleQuestionOptionsFair,
  getStudentDailySeed,
  createMulberry32,
  getTodayWatString
} from '../utils/questionRandomizer';
import { gamification } from '../utils/gamification';
import { weeklyGoalsManager } from '../utils/weeklyGoalsManager';
import { achievementManager } from '../utils/achievementBadges';
import { aiVoice, VoiceFeedbackContent, getVoiceFeedbackContent } from '../utils/aiVoice';
import { getComprehensiveExplanation } from '../utils/questionExplanations';
import { topicProgressManager } from '../utils/topicProgress';
import { CBTCalculatorModal } from './CBTCalculatorModal';
import confetti from 'canvas-confetti';

interface PracticeViewProps {
  initialSubjectId?: string;
  initialTopic?: string;
  subjects: Subject[];
  user: User | null;
  onNavigate: (view: string, extra?: any) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  initialSubjectId,
  initialTopic,
  subjects,
  user,
  onNavigate
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(initialSubjectId || 'english');
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [allSubjectQuestions, setAllSubjectQuestions] = useState<Question[]>([]);
  const [sessionBatch, setSessionBatch] = useState<number>(1);
  const [seenQuestionIds, setSeenQuestionIds] = useState<Set<string>>(new Set());
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [revealedQuestions, setRevealedQuestions] = useState<Record<number, boolean>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [scoreCount, setScoreCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => gamification.getBookmarkedIds());
  const [voiceFeedback, setVoiceFeedback] = useState<VoiceFeedbackContent | null>(null);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);
  const [streakNotice, setStreakNotice] = useState<{
    newStreak: number;
    incremented?: boolean;
    sessionTotal?: number;
    dailyGoal?: {
      target: number;
      completed: number;
      percentage: number;
      isCompleted: boolean;
    };
    earnedXp?: number;
  } | null>(null);
  const [speechRate, setSpeechRateState] = useState<number>(() => aiVoice.getSpeechRate());
  const [speakingExplanationQIdx, setSpeakingExplanationQIdx] = useState<number | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);

  const handleSetSpeechRate = (rate: number) => {
    aiVoice.setSpeechRate(rate);
    setSpeechRateState(rate);
  };

  const handleToggleExplanationSpeech = (conciseSpeech: string, qIdx: number) => {
    if (speakingExplanationQIdx === qIdx && isVoiceSpeaking) {
      aiVoice.stop();
      setSpeakingExplanationQIdx(null);
    } else {
      setSpeakingExplanationQIdx(qIdx);
      aiVoice.speakConciseExplanation(conciseSpeech, () => {
        setSpeakingExplanationQIdx(null);
      });
    }
  };

  const handleToggleReveal = (idx: number) => {
    setRevealedQuestions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  useEffect(() => {
    const unsub = aiVoice.onSpeakingChange(setIsVoiceSpeaking);
    return () => {
      unsub();
      aiVoice.stop();
    };
  }, []);

  const handleToggleBookmark = async (qId: string) => {
    const res = gamification.toggleBookmark(qId);
    setBookmarkedIds(res.allIds);
    try {
      await api.toggleBookmarkQuestion(qId, res.isBookmarked);
    } catch {}
  };
  
  // Student-friendly usability toggles
  const [textSize, setTextSize] = useState<'normal' | 'large'>('normal');
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [calcInput, setCalcInput] = useState<string>('0');
  const [calcPrev, setCalcPrev] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [calcResetOnNext, setCalcResetOnNext] = useState<boolean>(false);

  const seenIdsRef = useRef<Set<string>>(seenQuestionIds);
  seenIdsRef.current = seenQuestionIds;

  // Load questions based on subject & topic with guaranteed zero-repeat deduplication and shuffled options
  const loadQuestions = useCallback(async (resetSeen = false) => {
    setLoading(true);
    try {
      const data = await api.getQuestions({
        subjectId: selectedSubjectId,
        topic: selectedTopic !== 'all' ? selectedTopic : undefined,
        difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
        limit: 100
      });

      // Strict deduplication by ID across server questions and extended bank
      const questionMap = new Map<string, Question>();
      (data.questions || []).forEach((q: Question) => {
        questionMap.set(q.id, q);
      });

      EXTENDED_QUESTIONS.filter(q => {
        if (q.subjectId !== selectedSubjectId) return false;
        if (selectedTopic !== 'all' && q.topic.toLowerCase() !== selectedTopic.toLowerCase()) return false;
        if (selectedDifficulty !== 'All' && q.difficulty && q.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) return false;
        return true;
      }).forEach(q => {
        if (!questionMap.has(q.id)) {
          questionMap.set(q.id, q);
        }
      });

      let uniqueBank = Array.from(questionMap.values());

      // If user selected a specific difficulty, filter to matching questions
      if (selectedDifficulty !== 'All') {
        const matchingDiff = uniqueBank.filter(q => q.difficulty?.toLowerCase() === selectedDifficulty.toLowerCase());
        if (matchingDiff.length > 0) {
          uniqueBank = matchingDiff;
        }
      }

      setAllSubjectQuestions(uniqueBank);

      const storageKey = `studynaija_seen_${selectedSubjectId}_${selectedDifficulty}`;
      let currentSeen: Set<string> = resetSeen ? new Set<string>() : new Set(seenIdsRef.current);

      if (!resetSeen && currentSeen.size === 0) {
        try {
          const cached = sessionStorage.getItem(storageKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) {
              currentSeen = new Set<string>(parsed.filter((x): x is string => typeof x === 'string'));
            }
          }
        } catch {}
      }

      if (resetSeen) {
        currentSeen = new Set<string>();
        setSeenQuestionIds(new Set());
        try {
          sessionStorage.removeItem(storageKey);
        } catch {}
        setSessionBatch(1);
      }

      // Filter candidate pool to questions that have NOT been seen yet
      let candidatePool = uniqueBank.filter(q => !currentSeen.has(q.id));

      // If unseen questions are fewer than 10, synthesize fresh unique questions with target difficulty
      if (candidatePool.length < 10) {
        const needed = 10 - candidatePool.length;
        const allKnownKeys = new Set<string>();
        questionMap.forEach((_, k) => allKnownKeys.add(k));
        currentSeen.forEach(k => allKnownKeys.add(k));
        const freshSynthesized = generateFreshDrillQuestions(
          selectedSubjectId,
          needed + 10,
          allKnownKeys,
          selectedDifficulty !== 'All' ? selectedDifficulty : undefined
        );
        freshSynthesized.forEach(q => {
          questionMap.set(q.id, q);
          uniqueBank.push(q);
        });
        candidatePool = [...candidatePool, ...freshSynthesized];
      }

      // Seeded candidate shuffle using candidate's unique daily PRNG
      const studentId = user?.id || (typeof localStorage !== 'undefined' ? localStorage.getItem('studynaija_student_id') : '') || 'guest_student';
      const todayWat = getTodayWatString();
      const dailySeed = getStudentDailySeed(studentId, todayWat);
      const prng = createMulberry32(dailySeed + sessionBatch * 997);

      const shuffledCandidates = [...candidatePool];
      for (let i = shuffledCandidates.length - 1; i > 0; i--) {
        const j = Math.floor(prng() * (i + 1));
        [shuffledCandidates[i], shuffledCandidates[j]] = [shuffledCandidates[j], shuffledCandidates[i]];
      }
      const chosenTen = shuffledCandidates.slice(0, 10);

      // CRITICAL ANTI-COPYING FAIR PLAY REQUIREMENT:
      // 1. "Randomise the question so nobody gets the same question any day so it avoids copying of answers"
      // 2. "and even if the question is the same make the answers different"
      const randomizedQuestions = chosenTen.map(q => {
        const variant = createDynamicQuestionVariant(q, prng);
        return shuffleQuestionOptionsFair(variant, prng);
      });

      // Track these questions as seen
      const updatedSeen = new Set(currentSeen);
      randomizedQuestions.forEach(q => updatedSeen.add(q.id));
      setSeenQuestionIds(updatedSeen);
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(Array.from(updatedSeen)));
      } catch {}

      setQuestions(randomizedQuestions);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setRevealedQuestions({});
      setFlaggedQuestions({});
      setScoreCount(0);
      setIsSubmitted(false);
      setVoiceFeedback(null);
      aiVoice.stop();
    } catch (err) {
      console.error('Failed to load drill questions', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSubjectId, selectedTopic, selectedDifficulty]);

  useEffect(() => {
    loadQuestions(false);
  }, [selectedSubjectId, selectedTopic, selectedDifficulty]);

  const handleNextBatch = () => {
    setSessionBatch(prev => prev + 1);
    loadQuestions(false);
  };

  const handleResetBank = () => {
    if (window.confirm('Reset question history for this subject to start fresh from the beginning?')) {
      loadQuestions(true);
    }
  };

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const currentSelected = selectedAnswers[currentIndex];
  const isRevealed = revealedQuestions[currentIndex];

  const isCalculationRelated = useMemo(() => {
    const subName = (selectedSubjectId || '').toLowerCase();
    const subObj = subjects.find(s => s.id === selectedSubjectId);
    const subTitle = (subObj?.name || '').toLowerCase();
    const qText = (currentQ?.question || '').toLowerCase();

    return (
      subName.includes('math') ||
      subName.includes('physics') ||
      subName.includes('chem') ||
      subName.includes('econ') ||
      subName.includes('account') ||
      subTitle.includes('math') ||
      subTitle.includes('physics') ||
      subTitle.includes('chem') ||
      subTitle.includes('econ') ||
      subTitle.includes('account') ||
      qText.includes('calculate') ||
      qText.includes('find') ||
      qText.includes('solve') ||
      qText.includes('=')
    );
  }, [selectedSubjectId, subjects, currentQ]);

  const [unansweredWarning, setUnansweredWarning] = useState<string | null>(null);

  // Results Breakdown: lists of exact numbers student got right and wrong
  const resultsBreakdown = useMemo(() => {
    const rightNumbers: { number: number; index: number; question: Question; userAns: string; correctAns: string }[] = [];
    const wrongNumbers: { number: number; index: number; question: Question; userAns?: string; correctAns: string }[] = [];
    const skippedNumbers: { number: number; index: number; question: Question; correctAns: string }[] = [];

    questions.forEach((q, idx) => {
      const qNum = idx + 1;
      const userAns = selectedAnswers[idx];
      if (!userAns) {
        skippedNumbers.push({ number: qNum, index: idx, question: q, correctAns: q.correctOption });
      } else if (userAns === q.correctOption) {
        rightNumbers.push({ number: qNum, index: idx, question: q, userAns, correctAns: q.correctOption });
      } else {
        wrongNumbers.push({ number: qNum, index: idx, question: q, userAns, correctAns: q.correctOption });
      }
    });

    return { rightNumbers, wrongNumbers, skippedNumbers };
  }, [questions, selectedAnswers]);

  const handleSelectOption = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (isSubmitted) return; // drill submitted, review mode active
    setUnansweredWarning(null);

    const newAnswers = { ...selectedAnswers, [currentIndex]: optionKey };
    setSelectedAnswers(newAnswers);
  };

  const handleSubmitPractice = () => {
    const answeredTotal = Object.keys(selectedAnswers).length;
    if (answeredTotal < totalQuestions) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredTotal} of ${totalQuestions} questions. Do you want to submit and view which numbers you got right and wrong?`
      );
      if (!confirmSubmit) return;
    }

    let correct = 0;
    questions.forEach((q, idx) => {
      const ans = selectedAnswers[idx];
      if (ans && ans === q.correctOption) {
        correct++;
      }
      if (ans && q.id) {
        api.submitPracticeAnswer(q.id, ans, ans === q.correctOption, q.correctOption).catch(() => {});
      }
    });

    setScoreCount(correct);
    setIsSubmitted(true);
    setCurrentIndex(0);

    const percentage = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;
    const fb = aiVoice.speakExamFeedback(percentage, user?.name);
    setVoiceFeedback(fb);

    // Increment practice session streak and update daily study questions progress
    const subTitle = subjects.find(s => s.id === selectedSubjectId)?.name || 'General CBT Drill';
    const sessionRes = gamification.recordPracticeSessionCompletion(totalQuestions, {
      subjectName: subTitle,
      scorePercent: percentage,
      testType: 'CBT Practice Test'
    });
    setStreakNotice(sessionRes);

    // Update weekly study goals progress for practice questions
    weeklyGoalsManager.addCompletedQuestions(totalQuestions, selectedSubjectId);

    // Record topic progress for syllabus tracking in SubjectsView
    if (selectedSubjectId) {
      const topicToRecord = selectedTopic !== 'all' ? selectedTopic : (questions[0]?.topic || 'General Practice');
      topicProgressManager.recordTopicPractice(selectedSubjectId, topicToRecord, totalQuestions, correct);
    }

    const earnedXp = Math.max(20, correct * 15);
    gamification.addXp(earnedXp, 'Completed CBT Practice Set');

    // Check and award student milestone achievement badges (e.g. 5-Day Streak, Top Scorer)
    achievementManager.checkAndAwardBadges(user, {
      questionsAnswered: totalQuestions,
      bestScore: percentage
    });

    if (correct >= 7) {
      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      } catch {}
    }
  };

  const handleNext = () => {
    if (!isSubmitted && !selectedAnswers[currentIndex]) {
      setUnansweredWarning(`Please answer Question #${currentIndex + 1} before moving to the next question. Skipping without answering is not permitted.`);
      return;
    }
    setUnansweredWarning(null);
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setUnansweredWarning(null);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleJumpTo = (targetIdx: number) => {
    if (isSubmitted) {
      setUnansweredWarning(null);
      setCurrentIndex(targetIdx);
      return;
    }

    if (targetIdx <= currentIndex) {
      setUnansweredWarning(null);
      setCurrentIndex(targetIdx);
      return;
    }
    // Check if any previous question up to targetIdx is unanswered
    for (let i = 0; i < targetIdx; i++) {
      if (!selectedAnswers[i]) {
        setUnansweredWarning(`Question #${i + 1} is unanswered. You must answer questions sequentially and cannot skip ahead.`);
        return;
      }
    }
    setUnansweredWarning(null);
    setCurrentIndex(targetIdx);
  };

  const toggleFlag = () => {
    setFlaggedQuestions(prev => ({
      ...prev,
      [currentIndex]: !prev[currentIndex]
    }));
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setRevealedQuestions({});
    setFlaggedQuestions({});
    setScoreCount(0);
    setIsSubmitted(false);
  };

  // Keyboard navigation for CBT practice (A, B, C, D, N, P, F, C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        handleSelectOption(key as 'A' | 'B' | 'C' | 'D');
      } else if (key === 'N' || key === 'ARROW_RIGHT') {
        handleNext();
      } else if (key === 'P' || key === 'ARROW_LEFT') {
        handlePrev();
      } else if (key === 'F') {
        toggleFlag();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Basic JAMB Onscreen Calculator Functions
  const handleCalcDigit = (digit: string) => {
    if (calcResetOnNext || calcInput === '0') {
      setCalcInput(digit);
      setCalcResetOnNext(false);
    } else {
      setCalcInput(prev => (prev.length < 12 ? prev + digit : prev));
    }
  };

  const handleCalcOp = (operator: string) => {
    const val = parseFloat(calcInput);
    setCalcPrev(val);
    setCalcOp(operator);
    setCalcResetOnNext(true);
  };

  const handleCalcEquals = () => {
    if (calcPrev === null || !calcOp) return;
    const currentVal = parseFloat(calcInput);
    let res = 0;
    switch (calcOp) {
      case '+': res = calcPrev + currentVal; break;
      case '-': res = calcPrev - currentVal; break;
      case '×': res = calcPrev * currentVal; break;
      case '÷': res = currentVal !== 0 ? calcPrev / currentVal : 0; break;
    }
    // Round to avoid float quirks
    const formatted = parseFloat(res.toFixed(6)).toString();
    setCalcInput(formatted);
    setCalcPrev(null);
    setCalcOp(null);
    setCalcResetOnNext(true);
  };

  const handleCalcSqrt = () => {
    const val = parseFloat(calcInput);
    if (val >= 0) {
      setCalcInput(parseFloat(Math.sqrt(val).toFixed(6)).toString());
      setCalcResetOnNext(true);
    }
  };

  const handleCalcPercent = () => {
    const val = parseFloat(calcInput);
    setCalcInput((val / 100).toString());
    setCalcResetOnNext(true);
  };

  const handleCalcClear = () => {
    setCalcInput('0');
    setCalcPrev(null);
    setCalcOp(null);
    setCalcResetOnNext(false);
  };

  const activeSubject = subjects.find(s => s.id === selectedSubjectId);
  const answeredCount = Object.keys(selectedAnswers).length;
  const isSessionFinished = answeredCount === totalQuestions && totalQuestions > 0;

  return (
    <div id="practice-view-container" className="space-y-6 pb-16">
      
      {/* Top Controls: Subject & Topic Switcher + Student-friendly Tools */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Subject Dropdown */}
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Subject</label>
            <select
              value={selectedSubjectId}
              onChange={e => {
                setSelectedSubjectId(e.target.value);
                setSelectedTopic('all');
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full cursor-pointer"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Topic Dropdown */}
          {activeSubject && (
            <div className="w-full sm:w-auto">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Topic</label>
              <select
                value={selectedTopic}
                onChange={e => setSelectedTopic(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full cursor-pointer"
              >
                <option value="all">All Topics (Comprehensive Mixed Drill)</option>
                {activeSubject.topics.map((t, idx) => (
                  <option key={idx} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Difficulty Level Selector (Easy, Medium, Hard) */}
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-emerald-500" />
              <span>Difficulty Level</span>
            </label>
            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 w-full sm:w-auto justify-between sm:justify-start">
              {[
                { id: 'All', label: 'All', activeColor: 'bg-slate-900 text-white' },
                { id: 'Easy', label: 'Easy', activeColor: 'bg-emerald-600 text-white' },
                { id: 'Medium', label: 'Medium', activeColor: 'bg-amber-500 text-white' },
                { id: 'Hard', label: 'Hard', activeColor: 'bg-rose-600 text-white' }
              ].map(diff => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => {
                    if (selectedDifficulty !== diff.id) {
                      setSelectedDifficulty(diff.id as any);
                      setSessionBatch(1);
                    }
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedDifficulty === diff.id
                      ? `${diff.activeColor} shadow-xs`
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                  title={`Study ${diff.label === 'All' ? 'mixed' : diff.label} difficulty questions`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Batch & Zero-Repeat Indicator */}
          <div className="hidden sm:flex items-center gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Practice Set</label>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-700 rounded-xl border border-slate-200">
                <Zap className="w-3 h-3 text-amber-500" />
                Set #{sessionBatch} (10 Qs)
              </span>
            </div>
            {selectedDifficulty !== 'All' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Challenge</label>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl border ${
                  selectedDifficulty === 'Easy'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : selectedDifficulty === 'Hard'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <Gauge className="w-3 h-3" />
                  {selectedDifficulty}
                </span>
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mode</label>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 rounded-xl border border-blue-200" title="Questions never repeat and answer options A,B,C,D are mixed randomly">
                <Shuffle className="w-3 h-3 text-blue-600" />
                Zero Repeats
              </span>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Integrity</label>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200" title="Every student receives uniquely randomized questions with scrambled answer keys each day to prevent copying">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Fair-Play Active
              </span>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Actions</label>
              <button
                onClick={handleResetBank}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                title="Reset question history for this subject"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Usability Toolbar: Calculator, Font Size, Set Status & Submission */}
        <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          
          {/* Onscreen Scientific Calculator Button */}
          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer bg-slate-900 text-white border-slate-900 hover:bg-slate-800 shadow-xs"
            title="Open Official Scientific Calculator (with 1-Minute Timer Pause)"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Scientific Calculator</span>
          </button>

          {/* Text Size Switcher */}
          <button
            onClick={() => setTextSize(textSize === 'normal' ? 'large' : 'normal')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 cursor-pointer ${
              textSize === 'large'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Toggle Large Font Size for easier reading"
          >
            <Type className="w-3.5 h-3.5" />
            <span>{textSize === 'large' ? 'A+' : 'A'}</span>
          </button>

          {/* Practice Set Status / Score Badge */}
          {isSubmitted ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <Award className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-black text-emerald-900">
                Score: {scoreCount} / {totalQuestions} ({Math.round((scoreCount / (totalQuestions || 1)) * 100)}%)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>{answeredCount} of {totalQuestions} Answered</span>
              </div>
              {answeredCount > 0 && (
                <button
                  onClick={handleSubmitPractice}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Submit Drill</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Onscreen JAMB Calculator Popup (Standard Nigerian CBT Simulator) */}
      {showCalculator && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-700 shadow-2xl max-w-xs ml-auto transition-all animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              JAMB On-screen Calculator
            </span>
            <button 
              onClick={() => setShowCalculator(false)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer px-1.5"
            >
              ✕
            </button>
          </div>

          {/* Display */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-right font-mono text-xl font-bold text-emerald-400 overflow-x-auto mb-3">
            {calcInput}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
            <button onClick={handleCalcClear} className="p-2.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-red-200">C</button>
            <button onClick={handleCalcSqrt} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200">√</button>
            <button onClick={handleCalcPercent} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200">%</button>
            <button onClick={() => handleCalcOp('÷')} className="p-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white">÷</button>

            <button onClick={() => handleCalcDigit('7')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white">7</button>
            <button onClick={() => handleCalcDigit('8')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white">8</button>
            <button onClick={() => handleCalcDigit('9')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white">9</button>
            <button onClick={() => handleCalcOp('×')} className="p-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white">×</button>

            <button onClick={() => handleCalcDigit('4')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white">4</button>
            <button onClick={() => handleCalcDigit('5')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white">5</button>
            <button onClick={() => handleCalcDigit('6')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white">6</button>
            <button onClick={() => handleCalcOp('-')} className="p-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white">-</button>

            <button onClick={() => handleCalcDigit('1')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white">1</button>
            <button onClick={() => handleCalcDigit('2')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white">2</button>
            <button onClick={() => handleCalcDigit('3')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white">3</button>
            <button onClick={() => handleCalcOp('+')} className="p-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white">+</button>

            <button onClick={() => handleCalcDigit('0')} className="col-span-2 p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white">0</button>
            <button onClick={() => handleCalcDigit('.')} className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white">.</button>
            <button onClick={handleCalcEquals} className="p-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black">=</button>
          </div>
        </div>
      )}

      {/* RESULTS & NUMBER BREAKDOWN CARD (Shown strictly AFTER user finishes and submits the drill) */}
      {isSubmitted && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 font-['Outfit']">
                  Set #{sessionBatch} Results Breakdown
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {scoreCount >= 8 
                    ? 'Superb performance! JAMB 300+ trajectory 🎯' 
                    : scoreCount >= 5 
                      ? 'Solid foundation! Review the wrong numbers below to close your knowledge gaps.' 
                      : 'Good practice effort. Study the step-by-step teacher solutions below.'}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Final Score</span>
              <span className="text-2xl font-black text-emerald-800 font-mono">
                {scoreCount} / {totalQuestions}
              </span>
              <span className="text-xs font-bold text-slate-600 block">
                ({Math.round((scoreCount / (totalQuestions || 1)) * 100)}% accuracy)
              </span>
            </div>
          </div>

          {/* Gamification Streak & Daily Goal Achievement Toast */}
          {streakNotice && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <Flame className="w-6 h-6 fill-amber-500 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-900 flex items-center gap-1">
                      <span>Daily Streak Advanced: {streakNotice.newStreak ?? 1} Days Active</span>
                      <span>🔥</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      +{streakNotice.earnedXp || 20} XP
                    </span>
                  </div>
                  {streakNotice.dailyGoal && (
                    <p className="text-xs text-slate-600 mt-0.5">
                      Daily Study Goal: <strong>{streakNotice.dailyGoal.completed ?? 0}</strong> of {streakNotice.dailyGoal.target ?? 20} target questions completed today!
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => onNavigate('dashboard')}
                className="text-xs font-bold text-amber-800 hover:text-amber-950 underline shrink-0 cursor-pointer"
              >
                View Dashboard Tracker →
              </button>
            </div>
          )}

          {/* AI Voice Audio Feedback Banner */}
          {voiceFeedback && (
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs ${
              voiceFeedback.category === 'great'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : voiceFeedback.category === 'average'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  voiceFeedback.category === 'great'
                    ? 'bg-emerald-600 text-white'
                    : voiceFeedback.category === 'average'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-600 text-white'
                }`}>
                  <Volume2 className={`w-5 h-5 ${isVoiceSpeaking ? 'animate-pulse text-amber-200' : ''}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-white/80 border border-current/20">
                      Naija AI Voice
                    </span>
                    {isVoiceSpeaking && (
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" /> Speaking...
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base mt-1">
                    {voiceFeedback.title}
                  </h4>
                  <p className="text-xs opacity-90 leading-relaxed max-w-xl mt-0.5">
                    "{voiceFeedback.message}"
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                {/* Speed toggle */}
                <div className="flex items-center gap-1 bg-white/80 p-0.5 rounded-xl border border-current/20 text-[10px] font-bold">
                  <span className="opacity-70 px-1">Speed:</span>
                  {([1.0, 1.25, 1.5] as const).map(rate => (
                    <button
                      key={rate}
                      onClick={() => handleSetSpeechRate(rate)}
                      className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                        speechRate === rate
                          ? 'bg-slate-900 text-white'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {rate}x{rate === 1.25 ? '⚡' : ''}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (isVoiceSpeaking) {
                      aiVoice.stop();
                    } else {
                      aiVoice.speak(voiceFeedback.message);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-current/20 bg-white/80 hover:bg-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isVoiceSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Stop Voice</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Hear Again</span>
                    </>
                  )}
                </button>

                {voiceFeedback.category === 'needs_help' && (
                  <button
                    onClick={() => onNavigate('ai-tutor', {
                      topic: selectedTopic !== 'all' ? selectedTopic : undefined,
                      subject: activeSubject?.name
                    })}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Try AI Tutor Now →</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Numbers You Got Right and Wrong */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Numbers Right Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Numbers You Got Right ({resultsBreakdown.rightNumbers.length})</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  +{resultsBreakdown.rightNumbers.length} Correct
                </span>
              </div>
              
              {resultsBreakdown.rightNumbers.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  None in this set. Don't worry, review the teacher solutions below to learn every concept!
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {resultsBreakdown.rightNumbers.map(item => (
                    <button
                      key={item.number}
                      onClick={() => setCurrentIndex(item.index)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                        currentIndex === item.index
                          ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-500/30'
                          : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100/60'
                      }`}
                      title={`Jump to Question #${item.number} Review`}
                    >
                      <span>Question #{item.number}</span>
                      <Check className="w-3 h-3 text-emerald-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Numbers Wrong Box */}
            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-red-900 font-black text-xs">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Numbers You Got Wrong ({resultsBreakdown.wrongNumbers.length})</span>
                </div>
                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                  {resultsBreakdown.wrongNumbers.length} Mistakes
                </span>
              </div>

              {resultsBreakdown.wrongNumbers.length === 0 ? (
                <p className="text-xs text-emerald-700 font-bold py-2">
                  None! Flawless 100% score in this batch! 🌟
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {resultsBreakdown.wrongNumbers.map(item => (
                    <button
                      key={item.number}
                      onClick={() => setCurrentIndex(item.index)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                        currentIndex === item.index
                          ? 'bg-red-600 text-white border-red-700 ring-2 ring-red-500/30'
                          : 'bg-white text-red-900 border-red-300 hover:bg-red-100/60'
                      }`}
                      title={`Jump to Question #${item.number} Solution`}
                    >
                      <span>Question #{item.number}</span>
                      <span className="text-[10px] opacity-80 font-normal">
                        ({item.userAns || 'None'} → {item.correctAns})
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Skipped / Unanswered Numbers Box (if any) */}
            {resultsBreakdown.skippedNumbers.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Unanswered Questions ({resultsBreakdown.skippedNumbers.length})</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {resultsBreakdown.skippedNumbers.map(item => (
                    <button
                      key={item.number}
                      onClick={() => setCurrentIndex(item.index)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-amber-900 border border-amber-300 hover:bg-amber-100/60 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Question #{item.number}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500">
              Click any question number above or use the navigator below to review questions with full teacher workings.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestart}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Drill</span>
              </button>
              <button
                onClick={handleNextBatch}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Next 10 Questions (Batch #{sessionBatch + 1})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION NAVIGATOR: Clearly numbered 1-10 strip so students see questions 1 to 10 directly */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-900 font-['Outfit']">
              10-QUESTION DRILL STRIP
            </span>
            <span className="text-[11px] text-slate-500">
              {isSubmitted 
                ? '(Review mode: Green = Correct, Red = Wrong)' 
                : '(Click any number 1 to 10 to jump directly)'}
            </span>
          </div>
          <div className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
            isSubmitted 
              ? 'text-emerald-800 bg-emerald-50 border-emerald-200' 
              : 'text-slate-700 bg-slate-100 border-slate-200'
          }`}>
            {isSubmitted 
              ? `${scoreCount} of 10 Correct` 
              : `${answeredCount} of 10 Answered`}
          </div>
        </div>

        {/* 1 to 10 Numbered Buttons */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {Array.from({ length: totalQuestions || 10 }).map((_, idx) => {
            const q = questions[idx];
            const isCurrent = idx === currentIndex;
            const isAnswered = q && selectedAnswers[idx] !== undefined;
            const isFlagged = flaggedQuestions[idx];
            const isCorrectForQ = q && selectedAnswers[idx] === q.correctOption;

            let btnStyle = 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300';
            let statusIcon = null;

            if (isSubmitted) {
              if (isCorrectForQ) {
                btnStyle = 'bg-emerald-600 text-white border-emerald-700 font-black shadow-xs';
                statusIcon = <Check className="w-2.5 h-2.5 inline ml-0.5" />;
              } else if (isAnswered) {
                btnStyle = 'bg-red-500 text-white border-red-600 font-black shadow-xs';
                statusIcon = <XCircle className="w-2.5 h-2.5 inline ml-0.5" />;
              } else {
                btnStyle = 'bg-slate-200 text-slate-600 border-slate-300 font-semibold';
              }
            } else if (isAnswered) {
              btnStyle = 'bg-slate-800 text-white border-slate-900 font-bold shadow-xs';
              statusIcon = <span className="text-[9px] font-mono text-slate-300 ml-0.5">({selectedAnswers[idx]})</span>;
            }

            if (isFlagged && !isSubmitted) {
              btnStyle = 'bg-amber-400 text-slate-950 border-amber-500 font-black';
            }

            if (isCurrent) {
              btnStyle += isSubmitted 
                ? ' ring-2 ring-emerald-500 ring-offset-2 scale-105'
                : ' ring-2 ring-blue-500 ring-offset-2 scale-105';
            }

            return (
              <button
                key={idx}
                disabled={!q}
                onClick={() => setCurrentIndex(idx)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-0.5 cursor-pointer ${btnStyle}`}
              >
                <span>{idx + 1}</span>
                {statusIcon}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading high-yield JAMB & WAEC CBT questions...</p>
        </div>
      ) : totalQuestions === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">No questions found for this selection</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try switching topics or selecting "All Topics" to access the full question archive.
          </p>
          <button
            onClick={() => { setSelectedTopic('all'); }}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Reset Topic Filter
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          
          {/* Question Top Bar: Progress & Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm font-black px-3 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <span className="text-xs text-slate-500 font-bold hidden sm:inline">
                {currentQ.subjectName} • {currentQ.topic}
              </span>
              {currentQ.year && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                  {currentQ.examType} {currentQ.year}
                </span>
              )}
              {currentQ.difficulty && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                  currentQ.difficulty === 'Easy'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : currentQ.difficulty === 'Hard'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {currentQ.difficulty}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isCalculationRelated && (
                <button
                  onClick={() => setIsCalculatorOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                  title="Open Official CBT Calculator for Calculation-Related Subject"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Calculator</span>
                </button>
              )}
              <button
                onClick={() => handleToggleBookmark(currentQ.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border cursor-pointer ${
                  bookmarkedIds.includes(currentQ.id)
                    ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="Bookmark this challenging question for later review in your Dashboard"
              >
                {bookmarkedIds.includes(currentQ.id) ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                    <span>Saved Question</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                    <span>Bookmark</span>
                  </>
                )}
              </button>

              <button
                onClick={toggleFlag}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border cursor-pointer ${
                  flaggedQuestions[currentIndex]
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                title="Flag question for review [F]"
              >
                <Flag className={`w-3.5 h-3.5 ${flaggedQuestions[currentIndex] ? 'fill-amber-500 text-amber-600' : ''}`} />
                <span>{flaggedQuestions[currentIndex] ? 'Flagged [F]' : 'Flag [F]'}</span>
              </button>
            </div>
          </div>

          {/* Visual Step Progress Bar & Question Step Navigator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Question {currentIndex + 1} of {totalQuestions}</span>
              <span>{Object.keys(selectedAnswers).length} answered</span>
            </div>
            
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>

            {/* Question Quick Jump Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {questions.map((_, qIdx) => {
                const isAns = Boolean(selectedAnswers[qIdx]);
                const isCurr = qIdx === currentIndex;
                const isLocked = !isSubmitted && qIdx > currentIndex && !selectedAnswers[qIdx - 1];
                const isCorrect = isSubmitted && selectedAnswers[qIdx] === questions[qIdx]?.correctOption;

                let pillStyle = 'bg-slate-100 text-slate-600 hover:bg-slate-200';
                let pillIcon = null;

                if (isSubmitted) {
                  if (isCorrect) {
                    pillStyle = 'bg-emerald-600 text-white shadow-xs';
                    pillIcon = <Check className="w-2.5 h-2.5 text-white stroke-[3]" />;
                  } else if (isAns) {
                    pillStyle = 'bg-red-500 text-white shadow-xs';
                    pillIcon = <XCircle className="w-2.5 h-2.5 text-white stroke-[3]" />;
                  } else {
                    pillStyle = 'bg-slate-200 text-slate-500';
                  }
                } else if (isCurr) {
                  pillStyle = 'bg-slate-900 text-white shadow-xs ring-2 ring-blue-500/40';
                } else if (isAns) {
                  pillStyle = 'bg-slate-800 text-white font-bold';
                  pillIcon = <span className="text-[9px] font-mono text-slate-300">({selectedAnswers[qIdx]})</span>;
                } else if (isLocked) {
                  pillStyle = 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed';
                  pillIcon = <Lock className="w-2.5 h-2.5 text-slate-400" />;
                }

                if (isCurr && isSubmitted) {
                  pillStyle += ' ring-2 ring-emerald-500 ring-offset-1';
                }

                return (
                  <button
                    key={qIdx}
                    type="button"
                    onClick={() => handleJumpTo(qIdx)}
                    className={`h-7 min-w-[28px] px-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${pillStyle}`}
                    title={
                      isSubmitted
                        ? `Question ${qIdx + 1}: ${isCorrect ? 'Correct' : isAns ? 'Incorrect' : 'Unanswered'}`
                        : isCurr
                          ? `Question ${qIdx + 1} (Current)`
                          : isAns
                            ? `Question ${qIdx + 1} (Answered: ${selectedAnswers[qIdx]})`
                            : isLocked
                              ? `Question ${qIdx + 1} (Locked - Answer preceding questions first)`
                              : `Question ${qIdx + 1}`
                    }
                  >
                    <span>{qIdx + 1}</span>
                    {pillIcon}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unanswered Navigation Alert */}
          {unansweredWarning && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="flex-1 font-semibold">{unansweredWarning}</div>
            </div>
          )}

          {/* Question Prompt */}
          <div className="space-y-4 pt-2">
            <h3 className={`font-bold text-slate-900 leading-relaxed font-sans ${
              textSize === 'large' ? 'text-lg sm:text-2xl' : 'text-base sm:text-xl'
            }`}>
              {currentQ.question}
            </h3>

            {/* Options A, B, C, D */}
            <div className="space-y-3 pt-2">
              {(['A', 'B', 'C', 'D'] as const).map(key => {
                const optionText = currentQ.options[key];
                const isSelected = currentSelected === key;
                const isCorrect = currentQ.correctOption === key;
                const isAnswerRevealed = isSubmitted || Boolean(revealedQuestions[currentIndex]);

                // Neutral by default
                let optionStyle = 'bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300';
                let badgeStyle = 'bg-slate-200 text-slate-700';

                if (isAnswerRevealed) {
                  // Reveal correctness when student clicks "Reveal Answer & Explanation" OR after submission
                  if (isCorrect) {
                    optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-2 ring-emerald-500/20';
                    badgeStyle = 'bg-emerald-600 text-white font-bold';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'bg-red-50 border-red-400 text-red-950 ring-2 ring-red-400/20';
                    badgeStyle = 'bg-red-600 text-white font-bold';
                  }
                } else if (isSelected) {
                  // Pre-submission: Crisp Blue selection indicator. NEVER green or indicating right/wrong!
                  optionStyle = 'bg-blue-50/90 border-blue-600 text-blue-950 font-semibold ring-2 ring-blue-500/25';
                  badgeStyle = 'bg-blue-600 text-white font-bold';
                }

                return (
                  <button
                    key={key}
                    onClick={() => handleSelectOption(key)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      isSubmitted ? 'cursor-default' : 'cursor-pointer'
                    } ${optionStyle}`}
                  >
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 transition-colors ${badgeStyle}`}>
                      {key}
                    </span>
                    <div className={`flex-1 pt-0.5 leading-relaxed ${
                      textSize === 'large' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
                    }`}>
                      {optionText}
                    </div>

                    {/* Result Badges: Revealed strictly AFTER submission or when student reveals answer */}
                    {isAnswerRevealed ? (
                      <div className="shrink-0 pt-0.5">
                        {isCorrect ? (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            <Check className="w-3.5 h-3.5" />
                            <span>Correct Answer</span>
                          </div>
                        ) : isSelected ? (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100/80 px-2 py-0.5 rounded-md">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Your Selection</span>
                          </div>
                        ) : null}
                      </div>
                    ) : isSelected ? (
                      <div className="shrink-0 pt-0.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          <span>Selected</span>
                        </div>
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student-Friendly Teacher Solution Box (Regardless of subject) */}
          {(() => {
            const isAnswerRevealed = isSubmitted || Boolean(revealedQuestions[currentIndex]);
            const structuredExp = getComprehensiveExplanation(currentQ);

            if (isAnswerRevealed) {
              return (
                <div className="p-4 sm:p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-4 animate-in fade-in duration-200">
                  {/* Question correctness banner & Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-emerald-200/60">
                    <div className="flex flex-wrap items-center gap-2">
                      {currentSelected === currentQ.correctOption ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-full text-xs font-bold shadow-2xs">
                          <Check className="w-3.5 h-3.5" />
                          <span>Question #{currentIndex + 1}: Correct! Spot on! 🎉</span>
                        </div>
                      ) : currentSelected ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold shadow-2xs">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Question #{currentIndex + 1}: Incorrect (You chose {currentSelected})</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 text-white rounded-full text-xs font-bold shadow-2xs">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Question #{currentIndex + 1}: Answer Revealed</span>
                        </div>
                      )}
                      <span className="px-2.5 py-1 bg-emerald-200 text-emerald-900 rounded-lg font-mono text-xs font-bold">
                        Correct Option: ({currentQ.correctOption})
                      </span>
                    </div>

                    {!isSubmitted && (
                      <button
                        onClick={() => handleToggleReveal(currentIndex)}
                        className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1 cursor-pointer bg-white/70 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide Answer</span>
                      </button>
                    )}
                  </div>

                  {/* Direct Answer Confirmation */}
                  <div className="text-xs font-bold text-emerald-950 bg-white/80 p-2.5 rounded-xl border border-emerald-200/60 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>{structuredExp.directAnswer}</span>
                  </div>

                  {/* Step-by-step teacher working */}
                  <div className="text-slate-800 space-y-1.5">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Teacher's Step-by-Step Breakdown ({currentQ.subjectName || 'Curriculum'}):</span>
                    </div>
                    <div className={`text-slate-800 leading-relaxed whitespace-pre-line bg-white/60 p-3.5 rounded-xl border border-emerald-100 ${
                      textSize === 'large' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
                    }`}>
                      {structuredExp.stepByStep}
                    </div>
                  </div>

                  {/* Distractor Analysis & Examiner Tip */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 space-y-1">
                      <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1 uppercase tracking-wider">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Distractor Analysis (Why Others Are Wrong):</span>
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        {structuredExp.distractorAnalysis}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-950 space-y-1">
                      <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1 uppercase tracking-wider">
                        <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                        <span>JAMB/WAEC CBT Examiner Tip:</span>
                      </div>
                      <p className="text-xs text-blue-900 leading-relaxed">
                        {structuredExp.examinerTip}
                      </p>
                    </div>
                  </div>

                  {/* AI Voice Explanation Player & Further Help Controls */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200/60">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleToggleExplanationSpeech(structuredExp.conciseSpokenSummary, currentIndex)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                          speakingExplanationQIdx === currentIndex && isVoiceSpeaking
                            ? 'bg-rose-600 text-white hover:bg-rose-700 ring-2 ring-rose-300'
                            : 'bg-emerald-700 text-white hover:bg-emerald-800'
                        }`}
                      >
                        {speakingExplanationQIdx === currentIndex && isVoiceSpeaking ? (
                          <>
                            <Square className="w-3.5 h-3.5 fill-current" />
                            <span>Stop Voice</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen to Naija AI Breakdown</span>
                          </>
                        )}
                      </button>

                      {/* Speech speed selector */}
                      <div className="flex items-center gap-1 bg-white/80 p-0.5 rounded-lg border border-emerald-200 text-[10px] font-bold">
                        <span className="text-slate-500 px-1">Speed:</span>
                        {([1.0, 1.25, 1.5] as const).map(rate => (
                          <button
                            key={rate}
                            onClick={() => handleSetSpeechRate(rate)}
                            className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                              speechRate === rate
                                ? 'bg-emerald-600 text-white'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {rate}x{rate === 1.25 ? '⚡' : ''}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('ai-tutor', {
                        topic: currentQ.topic,
                        subject: activeSubject?.name,
                        initialQuestion: `Can you explain Question #${currentIndex + 1} on ${currentQ.topic}: "${currentQ.question}"? The correct option is (${currentQ.correctOption}).`
                      })}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ask AI Tutor More →</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div className="p-4 bg-slate-50/90 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-700 text-xs">
                <div className="flex items-center gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>
                    To test your real exam readiness, answers are hidden while you practice. Complete the questions or reveal now to study teacher workings:
                  </span>
                </div>
                <button
                  onClick={() => handleToggleReveal(currentIndex)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Reveal Answer & Explanation</span>
                </button>
              </div>
            );
          })()}

          {/* Bottom Action Nav Bar: Prev, Keyboard Help, Next / Submit */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous [P]</span>
            </button>

            {/* Shortcuts tip */}
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400">
              <span>Shortcuts:</span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-slate-700">A</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-slate-700">B</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-slate-700">C</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-slate-700">D</kbd>
              <span>•</span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-slate-700">N</kbd>
              <span>Next</span>
              <span>•</span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-slate-700">F</kbd>
              <span>Flag</span>
            </div>

            <div className="flex items-center gap-2">
              {/* If in Review mode, allow jumping to next question or loading next set */}
              {isSubmitted ? (
                <>
                  {currentIndex < totalQuestions - 1 ? (
                    <button
                      onClick={handleNext}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <span>Next Question [N]</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleNextBatch}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Next 10 Questions (Batch #{sessionBatch + 1})</span>
                    </button>
                  )}
                </>
              ) : (
                /* Unsubmitted Practice Mode */
                <>
                  {currentIndex < totalQuestions - 1 ? (
                    <button
                      onClick={handleNext}
                      className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        selectedAnswers[currentIndex]
                          ? 'bg-slate-900 hover:bg-slate-800 text-white'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300'
                      }`}
                      title={!selectedAnswers[currentIndex] ? 'Select an answer to unlock Next Question' : 'Proceed to next question'}
                    >
                      <span>{!selectedAnswers[currentIndex] ? 'Answer Question to Continue' : 'Next Question [N]'}</span>
                      {!selectedAnswers[currentIndex] ? <Lock className="w-3.5 h-3.5 text-slate-500" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitPractice}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                    >
                      <Award className="w-4 h-4 text-amber-300" />
                      <span>Submit 10-Question Drill & View Results</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      )}

      <CBTCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
};
