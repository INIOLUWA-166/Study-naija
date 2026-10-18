import React, { useState, useEffect, useRef } from 'react';
import { 
  Timer, 
  CheckCircle2, 
  XCircle, 
  Flag, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  AlertTriangle, 
  Award, 
  BookOpen, 
  BarChart3, 
  Send,
  Eye,
  Sparkles,
  AlertCircle,
  Lock,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  FileText,
  Square,
  Play,
  Lightbulb,
  ShieldCheck,
  Zap,
  Calculator
} from 'lucide-react';
import { Subject, Question, ExamResult, User } from '../types';
import { api } from '../services/api';
import { shuffleQuestionOptions } from '../utils/questionBank';
import { createDynamicQuestionVariant, shuffleQuestionOptionsFair } from '../utils/questionRandomizer';
import { aiVoice, VoiceFeedbackContent } from '../utils/aiVoice';
import { gamification } from '../utils/gamification';
import { CBTCalculatorModal } from './CBTCalculatorModal';
import { ScientificCalculator } from './ScientificCalculator';
import { studentNotificationManager } from '../utils/studentNotificationManager';
import { weeklyGoalsManager } from '../utils/weeklyGoalsManager';
import { achievementManager } from '../utils/achievementBadges';
import { OfficialResultSlip } from './OfficialResultSlip';
import { getComprehensiveExplanation } from '../utils/questionExplanations';
import confetti from 'canvas-confetti';
import { triggerExamCompletionConfetti } from '../utils/confettiCelebration';

interface MockExamViewProps {
  subjects: Subject[];
  user: User | null;
  onNavigate: (view: string, extra?: any) => void;
  preferredSubject?: string;
}

export const MockExamView: React.FC<MockExamViewProps> = ({
  subjects,
  user,
  onNavigate,
  preferredSubject
}) => {
  // Phase: 'config' | 'in-progress' | 'result' | 'review'
  const [phase, setPhase] = useState<'config' | 'in-progress' | 'result' | 'review'>('config');
  const [examType, setExamType] = useState<'JAMB' | 'WAEC'>('JAMB');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(
    examType === 'JAMB' 
      ? ['english', 'mathematics', 'physics', 'chemistry']
      : ['english', 'mathematics', 'biology']
  );
  const [questionCountPerSubject, setQuestionCountPerSubject] = useState<number>(10);

  // Active Exam state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [activeSubjectTab, setActiveSubjectTab] = useState<string>('english');

  // Anti-Cheating & Exam Hall Integrity Guards
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [showTabWarningModal, setShowTabWarningModal] = useState<boolean>(false);
  const [showCopyBlockedToast, setShowCopyBlockedToast] = useState<boolean>(false);
  const [speedBonusTotal, setSpeedBonusTotal] = useState<number>(0);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Timer
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(120 * 60);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState<number>(120 * 60);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [calculatorMode, setCalculatorMode] = useState<'docked' | 'floating'>('docked');
  const timerRef = useRef<any>(null);

  // Subtle CBT Hall Mechanical Clock Tick Sound in Final 5 Minutes
  const [tickAudioEnabled, setTickAudioEnabled] = useState<boolean>(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play subtle mechanical exam clock tick (alternating subtle tick / tock)
  const playClockTick = (isTock: boolean = false) => {
    if (!tickAudioEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Bandpass filter to shape realistic mechanical clock click
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isTock ? 780 : 960, ctx.currentTime);
      filter.Q.setValueAtTime(3.2, ctx.currentTime);

      // Triangle oscillator gives a warm, crisp, non-fatiguing transient
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isTock ? 620 : 820, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.022);

      // Low gain (0.05 decaying to 0.0001) for a realistic, subtle examination atmosphere
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.022);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.025);
    } catch {
      // Ignore audio permission/context errors
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  // Result state
  const [examSessionId, setExamSessionId] = useState<string | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showSlip, setShowSlip] = useState<boolean>(true);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);
  const [voiceFeedback, setVoiceFeedback] = useState<VoiceFeedbackContent | null>(null);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => gamification.getBookmarkedIds());

  const handleToggleBookmark = async (qId: string) => {
    const res = gamification.toggleBookmark(qId);
    setBookmarkedIds(res.allIds);
    try {
      await api.toggleBookmarkQuestion(qId, res.isBookmarked);
    } catch {}
  };

  const [reviewFilter, setReviewFilter] = useState<'all' | 'missed' | 'correct'>('all');
  const [speechRate, setSpeechRateState] = useState<number>(() => aiVoice.getSpeechRate());
  const [speakingExplanationQId, setSpeakingExplanationQId] = useState<string | null>(null);

  const handleSetSpeechRate = (rate: number) => {
    aiVoice.setSpeechRate(rate);
    setSpeechRateState(rate);
  };

  const handleToggleExplanationSpeech = (conciseSpeech: string, qId: string) => {
    if (speakingExplanationQId === qId && isVoiceSpeaking) {
      aiVoice.stop();
      setSpeakingExplanationQId(null);
    } else {
      setSpeakingExplanationQId(qId);
      aiVoice.speakConciseExplanation(conciseSpeech, () => {
        setSpeakingExplanationQId(null);
      });
    }
  };

  useEffect(() => {
    const unsub = aiVoice.onSpeakingChange(setIsVoiceSpeaking);
    return () => {
      unsub();
      aiVoice.stop();
    };
  }, []);

  // Preset combinations for quick pick
  const handlePresetSelect = (combo: 'science' | 'commercial' | 'arts') => {
    if (combo === 'science') {
      setSelectedSubjectIds(['english', 'mathematics', 'physics', 'chemistry']);
    } else if (combo === 'commercial') {
      setSelectedSubjectIds(['english', 'mathematics', 'economics', 'government']);
    } else {
      setSelectedSubjectIds(['english', 'government', 'economics', 'biology']);
    }
  };

  const handleStartExam = async () => {
    if (selectedSubjectIds.length === 0) {
      alert('Please select at least one subject for your mock exam.');
      return;
    }

    try {
      // Retrieve questions seen in previous mock exams during this session to prevent repetition
      let sessionSeenMockIds: string[] = [];
      try {
        const stored = sessionStorage.getItem('studynaija_session_seen_mock_ids');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) sessionSeenMockIds = parsed;
        }
      } catch {}

      const data = await api.generateMockExam(examType, selectedSubjectIds, questionCountPerSubject, sessionSeenMockIds);
      if (data.examSessionId) {
        setExamSessionId(data.examSessionId);
      }
      // Strictly deduplicate questions by ID and ensure options are scrambled
      const seen = new Set<string>();
      const dedupedQuestions: Question[] = [];
      (data.questions || []).forEach((q: Question) => {
        if (!seen.has(q.id)) {
          seen.add(q.id);
          // If not already scrambled by server, scramble options and generate dynamic variant
          const varied = createDynamicQuestionVariant(q);
          dedupedQuestions.push(shuffleQuestionOptionsFair(varied));
        }
      });

      // Update session seen mock questions
      try {
        const updatedSeen = Array.from(new Set([...sessionSeenMockIds, ...dedupedQuestions.map(q => q.id)]));
        sessionStorage.setItem('studynaija_session_seen_mock_ids', JSON.stringify(updatedSeen));
      } catch {}

      setQuestions(dedupedQuestions);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setFlagged({});
      setActiveSubjectTab(selectedSubjectIds[0] || 'english');

      const durationSecs = (data.durationMinutes || (examType === 'JAMB' ? 120 : 90)) * 60;
      setTimeRemainingSeconds(durationSecs);
      setTotalTimeSeconds(durationSecs);
      setPhase('in-progress');
    } catch {
      alert('Could not start mock exam. Please retry.');
    }
  };

  // Timer interval
  useEffect(() => {
    if (phase === 'in-progress' && !isCalculatorOpen) {
      timerRef.current = setInterval(() => {
        setTimeRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitExam();
            return 0;
          }
          const nextVal = prev - 1;
          // Trigger subtle tick audio during the final 5 minutes of exam (300 seconds down to 1 second)
          if (nextVal <= 300 && nextVal > 0) {
            playClockTick(nextVal % 2 === 0);
          }
          return nextVal;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, tickAudioEnabled, isCalculatorOpen]);

  // Proctoring & Anti-Cheat: Tab Switch Detection & Clipboard Disabling
  useEffect(() => {
    if (phase !== 'in-progress') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('studynaija_active_exam_in_progress');
      }
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('studynaija_active_exam_in_progress', 'true');
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const next = prev + 1;
          setShowTabWarningModal(true);
          return next;
        });
      }
    };

    const handleWindowBlur = () => {
      setTabSwitchCount(prev => {
        const next = prev + 1;
        setShowTabWarningModal(true);
        return next;
      });
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      setShowCopyBlockedToast(true);
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      setShowCopyBlockedToast(true);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setShowCopyBlockedToast(true);
    };

    const handleKeyDownAntiCheat = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'C', 'u', 'U', 'a', 'A', 'p', 'P'].includes(e.key)) {
        if (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'u') {
          e.preventDefault();
          setShowCopyBlockedToast(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDownAntiCheat);

    return () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('studynaija_active_exam_in_progress');
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDownAntiCheat);
    };
  }, [phase]);

  // Reset per-question stopwatch when question changes
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, [currentQuestionIndex]);

  const handleSelectOption = (qId: string, opt: 'A' | 'B' | 'C' | 'D') => {
    const elapsed = Math.max(1, Math.round((Date.now() - questionStartTimeRef.current) / 1000));
    setAnswers(prev => ({ ...prev, [qId]: opt }));
    setUnansweredWarning(null);

    // Speed bonus calculation (< 35 seconds under JAMB clock)
    if (elapsed < 35 && elapsed >= 2.5) {
      setSpeedBonusTotal(prev => prev + 5);
    }
  };

  const handleSubmitExam = async () => {
    setShowSubmitConfirm(false);
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('studynaija_active_exam_in_progress');
    }

    const timeSpent = totalTimeSeconds - timeRemainingSeconds;
    const answerPayload = questions.map(q => ({
      questionId: q.id,
      selectedOption: answers[q.id] || null,
      correctOption: q.correctOption
    }));

    const isIntegrityViolated = tabSwitchCount >= 3;

    try {
      const result = await api.submitMockExam({
        examSessionId: examSessionId || undefined,
        examType,
        durationMinutes: Math.round(totalTimeSeconds / 60),
        timeSpentSeconds: timeSpent,
        answers: answerPayload,
        tabSwitchCount,
        integrityViolated: isIntegrityViolated,
        speedBonusPoints: speedBonusTotal
      });
      setExamResult(result);
      setPhase('result');
      const pct = result.scorePercentage ?? (result.totalQuestions > 0 ? (result.correctCount / result.totalQuestions) * 100 : 0);
      const fb = aiVoice.speakExamFeedback(pct, user?.name);
      setVoiceFeedback(fb);
      triggerExamCompletionConfetti(pct);

      // Record practice session completion and award XP + Achievement Badges
      gamification.recordPracticeSessionCompletion(result.totalQuestions, {
        subjectName: `${examType} Full Mock Exam`,
        scorePercent: pct,
        testType: 'Full Mock Exam'
      });
      weeklyGoalsManager.addCompletedQuestions(result.totalQuestions, undefined, true);
      gamification.addXp(Math.max(50, result.correctCount * 20), `Completed Official ${examType} Mock Exam`);
      achievementManager.checkAndAwardBadges(user, {
        questionsAnswered: result.totalQuestions,
        bestScore: pct
      }, [result]);

      // Automatically dispatch notification summary for student inbox
      studentNotificationManager.triggerMockExamScored(
        user,
        examType,
        pct,
        result.totalQuestions,
        result.correctCount
      );
    } catch (err) {
      alert('Failed to score exam. Please check your network connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [unansweredWarning, setUnansweredWarning] = useState<string | null>(null);
  const [jumpInput, setJumpInput] = useState('');

  const handleNextQuestion = () => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;
    if (!answers[currentQ.id]) {
      setUnansweredWarning(`Please answer Question #${currentQuestionIndex + 1} before proceeding to the next question. Skipping questions without answering is not allowed.`);
      return;
    }
    setUnansweredWarning(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleJumpToQuestion = (targetIdx: number) => {
    if (targetIdx <= currentQuestionIndex) {
      setUnansweredWarning(null);
      setCurrentQuestionIndex(targetIdx);
      return;
    }
    // Cannot skip ahead if any previous question is unanswered
    for (let i = 0; i < targetIdx; i++) {
      const q = questions[i];
      if (!answers[q.id]) {
        setUnansweredWarning(`Question #${i + 1} is unanswered. You must answer Question #${i + 1} before you can jump ahead to Question #${targetIdx + 1}.`);
        return;
      }
    }
    setUnansweredWarning(null);
    setCurrentQuestionIndex(targetIdx);
  };

  // 8-Key system keyboard listener during CBT in-progress
  useEffect(() => {
    if (phase !== 'in-progress') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in jump input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toUpperCase();
      const currentQ = questions[currentQuestionIndex];
      if (!currentQ) return;

      if (['A', 'B', 'C', 'D'].includes(key)) {
        handleSelectOption(currentQ.id, key as any);
      } else if (key === 'N') {
        handleNextQuestion();
      } else if (key === 'P') {
        setUnansweredWarning(null);
        if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex(prev => prev - 1);
        }
      } else if (key === 'R') {
        setFlagged(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
      } else if (key === 'S') {
        setShowSubmitConfirm(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, currentQuestionIndex, questions, answers]);

  // Keep active subject tab in sync with question index
  useEffect(() => {
    if (phase === 'in-progress' && questions[currentQuestionIndex]) {
      setActiveSubjectTab(questions[currentQuestionIndex].subjectId);
    }
  }, [currentQuestionIndex, phase, questions]);

  // -------------------------------------------------------------
  // VIEW 1: EXAM CONFIGURATION
  // -------------------------------------------------------------
  if (phase === 'config') {
    return (
      <div id="mock-exam-config-card" className="max-w-4xl mx-auto space-y-8 pb-16">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-emerald-500/20 shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Timer className="w-3.5 h-3.5" />
            <span>National CBT Simulation Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-['Outfit']">
            JAMB UTME & WAEC Mock Exam
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Configure your subject combination, practice with realistic countdown clocks, and experience the real 8-key keyboard shortcuts used by official examiners.
          </p>
        </div>

        {/* Configuration Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8">
          
          {/* 1. Exam Type Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Step 1: Choose Exam Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setExamType('JAMB');
                  setSelectedSubjectIds(['english', 'mathematics', 'physics', 'chemistry']);
                }}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                  examType === 'JAMB'
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-md ring-4 ring-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    JAMB UTME
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">4 Subjects Standard</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">University & Tertiary Entrance</h4>
                <p className="text-xs text-slate-500 mt-1">
                  120 minutes countdown • 400 points aggregate • 8-key CBT keyboard enabled
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setExamType('WAEC');
                  setSelectedSubjectIds(['english', 'mathematics', 'biology']);
                }}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                  examType === 'WAEC'
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-md ring-4 ring-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                    WAEC SSCE
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">Standard Objective</span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">Senior Secondary Certificate</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Official grading scale: A1, B2, B3, C4, C5, C6 to F9 breakdown
                </p>
              </button>
            </div>
          </div>

          {/* 2. Quick Subject Combinations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Step 2: Choose Subject Combination ({selectedSubjectIds.length} selected)
              </label>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Presets:</span>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('science')}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Science
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('commercial')}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Commercial
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('arts')}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Arts
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {subjects.map(sub => {
                const isSelected = selectedSubjectIds.includes(sub.id);
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        if (selectedSubjectIds.length > 1) {
                          setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== sub.id));
                        }
                      } else {
                        if (examType === 'JAMB' && selectedSubjectIds.length >= 4) {
                          alert('Official JAMB UTME permits exactly 4 subjects. Deselect one first.');
                          return;
                        }
                        setSelectedSubjectIds([...selectedSubjectIds, sub.id]);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold shadow-2xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{sub.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{sub.code}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                      isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && '✓'}
                    </div>
                  </button>
                );
              })}
            </div>
            {examType === 'JAMB' && (
              <p className="text-[11px] text-slate-400">
                Tip: Standard JAMB combination includes English Language + 3 course-specific subjects.
              </p>
            )}
          </div>

          {/* 3. Questions per Subject */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Step 3: Test Length & Duration
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {[
                { count: 10, label: 'Official 10-Question Drill (10 Qs/Sub • Standard)' },
                { count: 12, label: 'Full Question Bank (12 Qs/Sub • Intensive)' },
                { count: 5, label: 'Quick Sprint (5 Qs/Sub • 20 Mins)' }
              ].map(opt => (
                <button
                  key={opt.count}
                  type="button"
                  onClick={() => setQuestionCountPerSubject(opt.count)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    questionCountPerSubject === opt.count
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start CTA */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Exam includes: {selectedSubjectIds.length * questionCountPerSubject} questions total.
            </div>

            <button
              id="start-mock-btn"
              onClick={handleStartExam}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Timer className="w-4 h-4" />
              <span>Begin Official Mock Exam</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: EXAM IN PROGRESS (OFFICIAL CBT HALL)
  // -------------------------------------------------------------
  if (phase === 'in-progress') {
    const currentQ = questions[currentQuestionIndex];
    const totalQ = questions.length;
    const isFinalFiveMinutes = timeRemainingSeconds <= 5 * 60 && timeRemainingSeconds > 0;
    const isWarning = timeRemainingSeconds <= 10 * 60 && !isFinalFiveMinutes;

    const isCalculationRelated = (() => {
      if (!currentQ) return false;
      const subName = (currentQ.subjectName || currentQ.subjectId || '').toLowerCase();
      const qText = (currentQ.question || '').toLowerCase();
      return (
        subName.includes('math') ||
        subName.includes('physic') ||
        subName.includes('chem') ||
        subName.includes('econ') ||
        subName.includes('account') ||
        subName.includes('tech') ||
        qText.includes('calculate') ||
        qText.includes('find') ||
        qText.includes('solve') ||
        qText.includes('=') ||
        qText.includes('velocity') ||
        qText.includes('mass') ||
        qText.includes('force') ||
        qText.includes('acceleration') ||
        qText.includes('energy') ||
        qText.includes('current') ||
        qText.includes('resistance') ||
        qText.includes('voltage') ||
        qText.includes('m/s') ||
        qText.includes('kg') ||
        qText.includes('mol') ||
        qText.includes('ratio') ||
        qText.includes('percentage')
      );
    })();

    return (
      <div id="mock-exam-cbt-hall" className="space-y-4 pb-16">
        
        {/* CBT Top Terminal Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
              isFinalFiveMinutes 
                ? 'bg-red-500/30 text-red-400 border border-red-500/60 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              CBT
            </div>
            <div>
              <div className="text-xs font-bold text-slate-300">
                {examType} OFFICIAL CBT SIMULATION • CANDIDATE #{user?.name?.split(' ')[0] || 'STUDENT'}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                <span>Question {currentQuestionIndex + 1} of {totalQ} • {currentQ?.subjectName}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Exam Hall Lockdown • Anti-AI Protected
                </span>
                {tabSwitchCount > 0 && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${
                    tabSwitchCount >= 3 ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse' : 'bg-amber-500/20 text-amber-300 border-amber-500'
                  }`}>
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    <span>{tabSwitchCount}/3 Tab Strikes</span>
                  </span>
                )}
                {speedBonusTotal > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span>+{speedBonusTotal} Speed Pts</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Active Countdown Clock with High-Urgency Pulse & Subtle Tick in Final 5 Minutes */}
          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setIsCalculatorOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-md cursor-pointer border border-emerald-400/40"
              title="Open Official Scientific Calculator (Pauses Exam Timer for 1 Minute)"
            >
              <Calculator className="w-4 h-4 text-emerald-200" />
              <span>Scientific Calculator</span>
              <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/70 text-emerald-300">
                1m Pause
              </span>
            </button>
            {timeRemainingSeconds > 300 && (
              <button
                type="button"
                onClick={() => {
                  setTimeRemainingSeconds(299);
                  playClockTick(false);
                }}
                className="text-[10px] font-mono text-slate-400 hover:text-amber-300 underline transition-colors cursor-pointer hidden md:inline-block"
                title="Quickly jump timer to 4m 59s to test the urgent final 5-minute visual pulse and subtle clock tick sound"
              >
                Test Final 5m ⚡
              </button>
            )}

            <div
              id="cbt-exam-timer"
              className={`px-3.5 py-1.5 rounded-xl font-mono text-base sm:text-lg font-black tracking-wider flex items-center gap-2 transition-all select-none ${
                isFinalFiveMinutes 
                  ? 'bg-red-950/95 text-red-300 border-2 border-red-500 shadow-[0_0_28px_rgba(239,68,68,0.7)] ring-2 ring-red-500/60 animate-urgent-timer'
                  : isWarning 
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse'
                  : 'bg-slate-800 text-emerald-400 border border-slate-700'
              }`}
            >
              {isFinalFiveMinutes ? (
                <>
                  {/* Glowing Radar Beacon */}
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                  <Timer className="w-4 h-4 text-red-400 animate-pulse shrink-0" />
                  <span>{formatTime(timeRemainingSeconds)}</span>
                  <span className="text-[9px] font-mono font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-600 text-white animate-pulse shadow-xs shrink-0">
                    FINAL 5 MINS
                  </span>
                </>
              ) : isWarning ? (
                <>
                  <Timer className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{formatTime(timeRemainingSeconds)}</span>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 shrink-0">
                    10m LEFT
                  </span>
                </>
              ) : (
                <>
                  <Timer className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{formatTime(timeRemainingSeconds)}</span>
                </>
              )}
            </div>

            {/* Audio Tick Toggle for Final 5 Minutes */}
            {isFinalFiveMinutes && (
              <button
                type="button"
                onClick={() => setTickAudioEnabled(prev => !prev)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  tickAudioEnabled
                    ? 'bg-red-950/80 border-red-500/60 text-red-200 hover:bg-red-900/60 shadow-[0_0_12px_rgba(239,68,68,0.35)]'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title={tickAudioEnabled ? 'Subtle Exam Clock Tick is ON (Click to mute)' : 'Subtle Exam Clock Tick is MUTED (Click to enable)'}
              >
                {tickAudioEnabled ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-red-400 animate-pulse shrink-0" />
                    <span className="text-[10px] hidden sm:inline">Tick Sound: ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[10px] hidden sm:inline">Tick: Muted</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setShowSubmitConfirm(true)}
              className={`px-4 py-2 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isFinalFiveMinutes ? 'bg-red-600 hover:bg-red-500 ring-2 ring-red-400/50 animate-pulse' : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Exam [S]</span>
            </button>
          </div>
        </div>

        {/* Urgent Final 5 Minutes Alert Banner */}
        {isFinalFiveMinutes && (
          <div className="bg-gradient-to-r from-red-950 via-rose-950 to-red-950 border-2 border-red-500/90 text-red-100 px-4 py-2.5 rounded-2xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-[0_0_25px_rgba(239,68,68,0.4)] animate-pulse">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
              <span className="font-black text-red-400 uppercase tracking-wider font-mono">
                FINAL 5 MINUTES WARNING:
              </span>
              <span className="text-slate-200">
                Exam auto-submits when the timer reaches 00:00:00. Cross-check your answers and prepare your final submission!
              </span>
            </div>
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-black text-[11px] rounded-lg transition-colors shadow-sm shrink-0 ml-auto sm:ml-0 cursor-pointer"
            >
              Submit Now →
            </button>
          </div>
        )}

        {/* Subject Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {selectedSubjectIds.map(subId => {
            const sub = subjects.find(s => s.id === subId);
            const isActive = activeSubjectTab === subId;
            const subQuestions = questions.filter(q => q.subjectId === subId);
            const answeredCount = subQuestions.filter(q => answers[q.id]).length;

            return (
              <button
                key={subId}
                onClick={() => {
                  const firstIdx = questions.findIndex(q => q.subjectId === subId);
                  if (firstIdx !== -1) setCurrentQuestionIndex(firstIdx);
                  setActiveSubjectTab(subId);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{sub?.name || subId}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {answeredCount}/{subQuestions.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Exam Hall Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Question Area */}
          <div className={`${isCalculatorOpen && calculatorMode === 'docked' ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-8'} bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 transition-all duration-200`}>
            {currentQ && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <span className="text-xs font-black px-2.5 py-1 rounded bg-slate-100 text-slate-800">
                    {currentQ.subjectName} • Question {currentQuestionIndex + 1}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCalculatorOpen(true)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer border ${
                        isCalculationRelated
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500 border-emerald-500 ring-2 ring-emerald-400/30'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      }`}
                      title="Open Official Scientific Calculator (Pauses Exam Timer for 1 Minute)"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>{isCalculationRelated ? '🧮 Math/Physics Calculator' : 'Calculator'}</span>
                      <span className="text-[10px] opacity-80">(1m Pause)</span>
                    </button>

                    <button
                      onClick={() => setFlagged(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))}
                      className={`p-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border ${
                        flagged[currentQ.id]
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      <Flag className={`w-3.5 h-3.5 ${flagged[currentQ.id] ? 'fill-amber-500 text-amber-600' : ''}`} />
                      <span>{flagged[currentQ.id] ? 'Review Flagged [R]' : 'Flag [R]'}</span>
                    </button>
                  </div>
                </div>

                {/* Unanswered warning notice */}
                {unansweredWarning && (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-semibold">{unansweredWarning}</span>
                  </div>
                )}

                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed font-sans select-none" onContextMenu={e => e.preventDefault()}>
                  {currentQ.question}
                </h3>

                <div className="space-y-3 pt-2 select-none" onContextMenu={e => e.preventDefault()}>
                  {(['A', 'B', 'C', 'D'] as const).map(opt => {
                    const isSelected = answers[currentQ.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          handleSelectOption(currentQ.id, opt);
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer select-none ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-600 text-blue-950 font-semibold ring-2 ring-blue-500/25'
                            : 'bg-slate-50/70 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 transition-colors font-bold ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {opt}
                        </span>
                        <div className="flex-1 pt-0.5 text-xs sm:text-sm leading-relaxed">
                          {currentQ.options[opt]}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setUnansweredWarning(null);
                      setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
                    }}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous [P]</span>
                  </button>

                  <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
                    <span>Keyboard shortcuts: [A] [B] [C] [D] • [N] Next • [P] Prev • [R] Review</span>
                  </div>

                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === totalQ - 1}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      Boolean(answers[currentQ.id])
                        ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300'
                    }`}
                  >
                    <span>{Boolean(answers[currentQ.id]) ? 'Next [N]' : 'Answer Question First'}</span>
                    {Boolean(answers[currentQ.id]) ? <ArrowRight className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Docked Scientific Calculator (if open & docked) + Question Navigator */}
          <div className={`${isCalculatorOpen && calculatorMode === 'docked' ? 'lg:col-span-5 xl:col-span-4' : 'lg:col-span-4'} space-y-6`}>
            {/* Docked Scientific Calculator for Complex Math and Physics Questions */}
            {isCalculatorOpen && calculatorMode === 'docked' && (
              <div className="animate-fade-in shadow-xl rounded-3xl overflow-hidden">
                <ScientificCalculator
                  isOpen={isCalculatorOpen}
                  onClose={() => setIsCalculatorOpen(false)}
                  mode="docked"
                  onToggleMode={newMode => setCalculatorMode(newMode)}
                  isCalculationRelated={isCalculationRelated}
                  subjectName={currentQ?.subjectName || 'Mathematics & Physics'}
                />
              </div>
            )}

            {/* Question Grid Navigator (4 cols) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Question Navigator
                </h4>
                <div className="text-[11px] text-slate-500 font-mono">
                  {Object.keys(answers).length}/{totalQ} Answered
                </div>
              </div>

              {/* Jump by typing Question Number with strict answer check */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const qNum = parseInt(jumpInput.trim(), 10);
                  if (isNaN(qNum) || qNum < 1 || qNum > totalQ) {
                    setUnansweredWarning(`Please enter a valid question number between 1 and ${totalQ}.`);
                    return;
                  }
                  handleJumpToQuestion(qNum - 1);
                  setJumpInput('');
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="number"
                  min="1"
                  max={totalQ}
                  placeholder={`Type Q# (1-${totalQ})...`}
                  value={jumpInput}
                  onChange={e => setJumpInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Go
                </button>
              </form>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-1.5 text-[10px] text-slate-600 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-blue-600" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-amber-400" />
                  <span>Flagged</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300" />
                  <span>Unvisited</span>
                </div>
              </div>

              {/* Number grid */}
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-72 overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isAnswered = Boolean(answers[q.id]);
                  const isFlagged = Boolean(flagged[q.id]);
                  const isCurrent = idx === currentQuestionIndex;
                  const isAheadLocked = idx > currentQuestionIndex && (!answers[questions[idx - 1]?.id]);

                  let btnClass = 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 cursor-pointer';
                  if (isAnswered) {
                    btnClass = 'bg-blue-600 text-white border-blue-700 font-bold cursor-pointer';
                  }
                  if (isFlagged) {
                    btnClass = 'bg-amber-400 text-slate-900 border-amber-500 font-bold cursor-pointer';
                  }
                  if (isCurrent) {
                    btnClass += ' ring-2 ring-blue-500 ring-offset-1';
                  }
                  if (isAheadLocked) {
                    btnClass = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`h-9 rounded-lg border text-xs font-medium transition-all ${btnClass}`}
                      title={isAheadLocked ? `Answer Question #${idx} first` : `Jump to Question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Submit quick action */}
              <div className="pt-2">
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Submit Exam Paper
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-black text-slate-900 font-['Outfit']">
                Submit Your Exam?
              </h3>

              <div className="bg-slate-50 p-4 rounded-xl text-left text-xs space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>Total Questions:</span>
                  <span className="font-bold text-slate-800">{totalQ}</span>
                </div>
                <div className="flex justify-between">
                  <span>Answered Questions:</span>
                  <span className="font-bold text-emerald-600">{Object.keys(answers).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unanswered Questions:</span>
                  <span className="font-bold text-red-500">{totalQ - Object.keys(answers).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Time Left:</span>
                  <span className={`font-mono font-bold flex items-center gap-1.5 ${
                    isFinalFiveMinutes ? 'text-red-600 animate-pulse font-black' : 'text-slate-800'
                  }`}>
                    {isFinalFiveMinutes && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                    <span>{formatTime(timeRemainingSeconds)}</span>
                    {isFinalFiveMinutes && (
                      <span className="text-[10px] text-red-700 bg-red-100 px-1.5 py-0.5 rounded font-sans font-black uppercase">
                        Final 5m
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Are you sure you want to end this session? Your final score and step-by-step solution review will be calculated immediately.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100"
                >
                  Return to Exam
                </button>
                <button
                  onClick={handleSubmitExam}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  {submitting ? 'Scoring...' : 'Confirm Submit'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Anti-Copy Malpractice Toast */}
        {showCopyBlockedToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-amber-500/80 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-4">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-amber-300">Exam Hall Copy Protection Active</div>
              <div className="text-[11px] text-slate-300">Copying questions to external AI or search engines is prohibited during official CBT mock exams.</div>
            </div>
            <button 
              type="button"
              onClick={() => setShowCopyBlockedToast(false)}
              className="text-slate-400 hover:text-white text-xs ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Switch Malpractice Warning Modal */}
        {showTabWarningModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
            <div className={`bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border ${
              tabSwitchCount >= 3 ? 'border-rose-500 ring-4 ring-rose-500/20' : 'border-amber-500 ring-4 ring-amber-500/20'
            } shadow-2xl text-center space-y-4 animate-in zoom-in-95`}>
              <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg ${
                tabSwitchCount >= 3 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
              }`}>
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full ${
                  tabSwitchCount >= 3 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {tabSwitchCount >= 3 ? 'Integrity Limit Exceeded' : `Tab Switch Violation • Strike ${tabSwitchCount} of 3`}
                </span>
                <h3 className="text-xl font-black text-white font-['Outfit']">
                  {tabSwitchCount >= 3 ? 'Exam Flagged as Unranked' : 'Navigating Away Detected!'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {tabSwitchCount >= 3 
                    ? 'You have navigated away from the exam tab 3 times. Your score will still be calculated for learning, but this session is flagged as unranked and disqualified from monthly airtime prizes.'
                    : 'In official JAMB CBT centers, switching windows is strictly forbidden. The countdown timer has continued running. A 3rd strike will disqualify this exam from the competitive leaderboard.'}
                </p>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700 text-left text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Tab Switch Strikes:</span>
                  <span className={`font-mono font-bold ${tabSwitchCount >= 3 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {tabSwitchCount} / 3 Strikes
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Leaderboard Standing:</span>
                  <span className={`font-bold ${tabSwitchCount >= 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {tabSwitchCount >= 3 ? 'Disqualified (Unranked)' : 'Verified Hall Active'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTabWarningModal(false)}
                className={`w-full py-3.5 px-4 font-black text-sm rounded-xl transition-all cursor-pointer shadow-lg ${
                  tabSwitchCount >= 3
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                I Understand • Return to Exam
              </button>
            </div>
          </div>
        )}

        {/* Floating Scientific Calculator Modal */}
        {isCalculatorOpen && calculatorMode === 'floating' && (
          <ScientificCalculator
            isOpen={isCalculatorOpen}
            onClose={() => setIsCalculatorOpen(false)}
            mode="floating"
            onToggleMode={newMode => setCalculatorMode(newMode)}
            isCalculationRelated={isCalculationRelated}
            subjectName={currentQ?.subjectName || 'Mathematics & Physics'}
          />
        )}

        {/* Floating Quick Action Button when Calculator is closed */}
        {!isCalculatorOpen && (
          <button
            onClick={() => setIsCalculatorOpen(true)}
            className={`fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full font-black text-xs shadow-2xl flex items-center gap-2 border-2 transition-all transform hover:scale-105 cursor-pointer ${
              isCalculationRelated
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-300 ring-4 ring-emerald-500/25'
                : 'bg-slate-900 text-white border-slate-700 hover:bg-slate-800'
            }`}
            title="Open Scientific Calculator (Pauses Exam Timer for 1 Minute)"
          >
            <Calculator className="w-4 h-4 text-emerald-300" />
            <span>Scientific Calculator</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
              1m Pause
            </span>
          </button>
        )}

      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: FINAL SCORE REPORT & RESULTS
  // -------------------------------------------------------------
  if (phase === 'result' && examResult) {
    return (
      <div id="mock-exam-results" className="max-w-4xl mx-auto space-y-8 pb-16">
        
        {/* Score Card Header */}
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-emerald-500/30 shadow-2xl text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Award className="w-4 h-4" />
            <span>Official Score Report Verified</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black font-['Outfit']">
            {examResult.title}
          </h2>

          {/* Primary Aggregate Score */}
          <div className="py-2">
            {examType === 'JAMB' ? (
              <div className="space-y-1">
                <div className="text-5xl sm:text-7xl font-black text-emerald-400 font-['Outfit']">
                  {examResult.jambScore || Math.round((examResult.scorePercentage / 100) * 400)}
                  <span className="text-2xl text-slate-400 font-normal"> / 400</span>
                </div>
                <div className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
                  Aggregated JAMB UTME Score ({examResult.scorePercentage}% Accuracy)
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-5xl sm:text-7xl font-black text-emerald-400 font-['Outfit']">
                  Grade {examResult.waecGrade || 'B2'}
                </div>
                <div className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
                  Overall WAEC Distinction Rating ({examResult.scorePercentage}% Score)
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-4 border-t border-slate-800 text-center">
            <div>
              <div className="text-slate-400 text-xs">Total Questions</div>
              <div className="text-lg font-bold text-white mt-0.5">{examResult.totalQuestions}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">Correct Answers</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">{examResult.correctCount}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">Time Spent</div>
              <div className="text-lg font-bold text-white mt-0.5">
                {Math.round(examResult.timeSpentSeconds / 60)} mins
              </div>
            </div>
          </div>

          {/* Action CTAs: Review wrong answers vs Take another */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => setShowSlip(!showSlip)}
              className="w-full sm:w-auto px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>{showSlip ? 'Hide Official Result Slip' : 'View / Print Official Result Slip'}</span>
            </button>
            <button
              onClick={() => setPhase('review')}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Review Wrong Answers & Explanations</span>
            </button>
            <button
              onClick={() => {
                aiVoice.stop();
                setVoiceFeedback(null);
                setPhase('config');
              }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Take Another Mock</span>
            </button>
          </div>
        </div>

        {/* Official Verifiable Result Slip */}
        {showSlip && (
          <OfficialResultSlip
            examResult={examResult}
            user={user}
            examType={examType}
            subjects={subjects}
          />
        )}

        {/* AI Voice Audio Feedback Banner */}
        {voiceFeedback && (
          <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
            voiceFeedback.category === 'great'
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
              : voiceFeedback.category === 'average'
                ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                : 'bg-rose-50/90 border-rose-300 text-rose-950'
          }`}>
            <div className="flex items-start gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                voiceFeedback.category === 'great'
                  ? 'bg-emerald-600 text-white'
                  : voiceFeedback.category === 'average'
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-600 text-white'
              }`}>
                <Volume2 className={`w-6 h-6 ${isVoiceSpeaking ? 'animate-pulse text-amber-200' : ''}`} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-white/80 border border-current/20">
                    Naija AI Voice Feedback
                  </span>
                  {isVoiceSpeaking && (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" /> Speaking aloud...
                    </span>
                  )}
                </div>
                <h4 className="font-extrabold text-base sm:text-lg">
                  {voiceFeedback.title}
                </h4>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed max-w-xl">
                  "{voiceFeedback.message}"
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
              {/* Speech speed selector */}
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
                className="px-4 py-2 rounded-xl border border-current/20 bg-white/90 hover:bg-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isVoiceSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Hear Voice Again</span>
                  </>
                )}
              </button>

              {voiceFeedback.category === 'needs_help' && (
                <button
                  onClick={() => {
                    aiVoice.stop();
                    onNavigate('ai-tutor', {
                      subject: examResult.subjectScores[0]?.subjectName
                    });
                  }}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Ask AI Tutor for Help →</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Subject-by-Subject Score Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>Subject-by-Subject Performance Breakdown</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {examResult.subjectScores.map(sub => (
              <div
                key={sub.subjectId}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-800">{sub.subjectName}</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded ${
                    sub.scorePercentage >= 70
                      ? 'bg-emerald-100 text-emerald-800'
                      : sub.scorePercentage >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {sub.scorePercentage}%
                  </span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      sub.scorePercentage >= 70 ? 'bg-emerald-500' : sub.scorePercentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${sub.scorePercentage}%` }}
                  />
                </div>

                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>{sub.correct} of {sub.total} correct</span>
                  <span>{sub.scorePercentage >= 70 ? 'Strong Area' : 'Recommended for Revision'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 4: COMPREHENSIVE EXAM REVIEW & EXPLANATIONS
  // -------------------------------------------------------------
  if (phase === 'review' && examResult) {
    const wrongAnswers = examResult.answers.filter(a => !a.isCorrect);
    const correctAnswers = examResult.answers.filter(a => a.isCorrect);
    const filteredAnswers = reviewFilter === 'missed'
      ? wrongAnswers
      : reviewFilter === 'correct'
        ? correctAnswers
        : examResult.answers;

    return (
      <div id="mock-exam-review-mode" className="max-w-4xl mx-auto space-y-6 pb-16">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Full Diagnostic Curriculum Review</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">
              Exam Questions & Explanations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review every question with step-by-step teacher breakdowns regardless of the subject.
            </p>
          </div>

          <button
            onClick={() => setPhase('result')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
          >
            ← Back to Score Report
          </button>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setReviewFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              reviewFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Questions ({examResult.answers.length})
          </button>
          <button
            onClick={() => setReviewFilter('missed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              reviewFilter === 'missed'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-red-700 hover:bg-red-50'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Missed Questions ({wrongAnswers.length})</span>
          </button>
          <button
            onClick={() => setReviewFilter('correct')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              reviewFilter === 'correct'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Correct Questions ({correctAnswers.length})</span>
          </button>
        </div>

        {filteredAnswers.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-slate-900 text-lg">
              {reviewFilter === 'missed' ? 'Incredible! Zero Missed Questions!' : 'No questions in this filter.'}
            </h3>
            <p className="text-xs text-slate-500">
              {reviewFilter === 'missed'
                ? 'You scored 100% on this exam set with zero mistakes!'
                : 'Switch filters above to view the full question set.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnswers.map((ans, idx) => {
              const q = questions.find(item => item.id === ans.questionId);
              if (!q) return null;

              const structuredExp = getComprehensiveExplanation(q);
              const isSpeakingThis = speakingExplanationQId === q.id && isVoiceSpeaking;

              return (
                <div
                  key={ans.questionId}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-mono font-black text-slate-700">
                        #{idx + 1}
                      </span>
                      <span>{q.subjectName} • {q.topic}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {ans.isCorrect ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Correct (+1)</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg font-bold border border-red-200 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-red-500" />
                          <span>Your choice: {ans.selectedOption || 'None (Omitted)'}</span>
                        </span>
                      )}

                      <button
                        onClick={() => handleToggleBookmark(q.id)}
                        className={`p-1.5 px-2.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          bookmarkedIds.includes(q.id)
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                        title={bookmarkedIds.includes(q.id) ? 'Saved in Dashboard' : 'Save Question to Dashboard'}
                      >
                        {bookmarkedIds.includes(q.id) ? (
                          <>
                            <BookmarkCheck className="w-3.5 h-3.5 fill-current" />
                            <span className="font-bold">Saved</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-relaxed">
                    {q.question}
                  </h4>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(['A', 'B', 'C', 'D'] as const).map(opt => {
                      const isCorrect = q.correctOption === opt;
                      const isUserSelection = ans.selectedOption === opt;

                      let style = 'bg-slate-50 border-slate-200 text-slate-700';
                      if (isCorrect) {
                        style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
                      } else if (isUserSelection) {
                        style = 'bg-red-50 border-red-400 text-red-950 line-through';
                      }

                      return (
                        <div key={opt} className={`p-3 rounded-xl border flex items-start gap-2 ${style}`}>
                          <span className="font-bold uppercase font-mono">{opt}.</span>
                          <span className="flex-1">{q.options[opt]}</span>
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                          {isUserSelection && !isCorrect && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Comprehensive Explanation Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-3">
                    
                    {/* Direct Answer Confirmation */}
                    <div className="text-xs font-bold text-emerald-950 bg-white/90 p-2.5 rounded-xl border border-emerald-200/60 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <span>{structuredExp.directAnswer}</span>
                    </div>

                    {/* Step-by-Step Teacher Breakdown */}
                    <div className="space-y-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Teacher's Step-by-Step Breakdown ({q.subjectName || 'Syllabus'}):</span>
                      </div>
                      <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-white/70 p-3 rounded-xl border border-emerald-100">
                        {structuredExp.stepByStep}
                      </div>
                    </div>

                    {/* Distractor Analysis & Examiner Tip */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-1">
                        <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1 uppercase tracking-wider">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Distractor Analysis:</span>
                        </div>
                        <p className="text-xs text-amber-900 leading-relaxed">
                          {structuredExp.distractorAnalysis}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950 space-y-1">
                        <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1 uppercase tracking-wider">
                          <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
                          <span>JAMB/WAEC CBT Examiner Tip:</span>
                        </div>
                        <p className="text-xs text-blue-900 leading-relaxed">
                          {structuredExp.examinerTip}
                        </p>
                      </div>
                    </div>

                    {/* Spoken Audio & AI Tutor Follow-up */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200/60">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleToggleExplanationSpeech(structuredExp.conciseSpokenSummary, q.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                            isSpeakingThis
                              ? 'bg-rose-600 text-white hover:bg-rose-700 ring-2 ring-rose-300'
                              : 'bg-emerald-700 text-white hover:bg-emerald-800'
                          }`}
                        >
                          {isSpeakingThis ? (
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
                          topic: q.topic,
                          subject: q.subjectName,
                          initialQuestion: `Hi Naija AI, I need a detailed breakdown for this exam question on ${q.topic}: "${q.question}". The correct answer is (${q.correctOption}). Could you explain this step-by-step?`
                        })}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ask AI Tutor More →</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      <CBTCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
      </div>
    );
  }

  return null;
};
