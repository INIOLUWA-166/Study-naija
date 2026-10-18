import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Timer, 
  Flame, 
  Trophy, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Sparkles, 
  Volume2, 
  VolumeX,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, User } from '../types';
import { gamification, getRankFromXp } from '../utils/gamification';
import { aiVoice, VoiceFeedbackContent, getVoiceFeedbackContent } from '../utils/aiVoice';
import { shuffleQuestionOptions } from '../utils/questionBank';
import {
  createDynamicQuestionVariant,
  shuffleQuestionOptionsFair,
  getStudentDailySeed,
  createMulberry32,
  getTodayWatString
} from '../utils/questionRandomizer';
import { INITIAL_QUESTIONS } from '../mockData';

interface FlashChallengeModalProps {
  questions: Question[];
  isOpen: boolean;
  user?: User | null;
  onClose: () => void;
  onXpEarned: (newXp: number) => void;
}

export const FlashChallengeModal: React.FC<FlashChallengeModalProps> = ({
  questions,
  isOpen,
  user,
  onClose,
  onXpEarned
}) => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'ended'>('intro');
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceFeedback, setVoiceFeedback] = useState<VoiceFeedbackContent | null>(null);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);

  // Session-wide tracking of asked questions to strictly prevent repetition
  const [askedQuestionIds, setAskedQuestionIds] = useState<Set<string>>(() => {
    try {
      const saved = sessionStorage.getItem('flash_cbt_session_asked_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set<string>(parsed);
      }
    } catch {}
    return new Set<string>();
  });

  // Consolidate full bank from props and INITIAL_QUESTIONS so all subjects are available
  const fullBank = React.useMemo(() => {
    const map = new Map<string, Question>();
    (INITIAL_QUESTIONS || []).forEach(q => map.set(q.id, q));
    (questions || []).forEach(q => map.set(q.id, q));
    return Array.from(map.values());
  }, [questions]);

  const bestScore = gamification.getFlashBestScore();

  useEffect(() => {
    const unsub = aiVoice.onSpeakingChange(setIsVoiceSpeaking);
    return () => {
      unsub();
    };
  }, []);

  // Play a simple Web Audio synthesized chime or buzzer
  const playSound = (type: 'correct' | 'wrong' | 'combo' | 'gameover') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'correct') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'combo') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        osc.frequency.setValueAtTime(987.77, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const handleResetSessionHistory = () => {
    setAskedQuestionIds(new Set());
    try {
      sessionStorage.removeItem('flash_cbt_session_asked_ids');
    } catch {}
  };

  const startChallenge = () => {
    aiVoice.stop();
    setVoiceFeedback(null);

    // Filter candidate pool to questions not yet asked in this session
    let candidatePool = fullBank.filter(q => !askedQuestionIds.has(q.id));

    // If candidate pool has fewer than 20 questions (user has exhausted the bank), cycle clean
    let currentAsked = new Set(askedQuestionIds);
    if (candidatePool.length < 20) {
      currentAsked = new Set<string>();
      setAskedQuestionIds(currentAsked);
      try {
        sessionStorage.removeItem('flash_cbt_session_asked_ids');
      } catch {}
      candidatePool = [...fullBank];
    }

    const studentId = user?.id || (typeof localStorage !== 'undefined' ? localStorage.getItem('studynaija_student_id') : '') || 'flash_guest';
    const todayWat = getTodayWatString();
    const dailySeed = getStudentDailySeed(studentId, todayWat);
    const prng = createMulberry32(dailySeed + Date.now());

    // Fisher-Yates shuffle candidate questions using student daily seed
    const shuffledPool = [...candidatePool];
    for (let i = shuffledPool.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
    }

    // CRITICAL: Scramble options and generate dynamic variants
    // Prevents copying of answers so leaderboard rankings are 100% fair
    const randomizedQuestions = shuffledPool.map(q => {
      const variant = createDynamicQuestionVariant(q, prng);
      return shuffleQuestionOptionsFair(variant, prng);
    });

    // Record the first question as asked
    if (randomizedQuestions.length > 0) {
      currentAsked.add(randomizedQuestions[0].id);
      setAskedQuestionIds(new Set(currentAsked));
      try {
        sessionStorage.setItem('flash_cbt_session_asked_ids', JSON.stringify(Array.from(currentAsked)));
      } catch {}
    }

    setShuffledQuestions(randomizedQuestions);
    setCurrentIdx(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setAnsweredCount(0);
    setCorrectCount(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsNewRecord(false);
    setTimeLeft(60);
    setGameState('playing');
  };

  // Timer loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft <= 0) {
      endChallenge();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endChallenge();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const endChallenge = () => {
    setGameState('ended');
    playSound('gameover');

    const pct = answeredCount > 0 ? (correctCount / answeredCount) * 100 : 0;
    const fb = getVoiceFeedbackContent(pct, user?.name);
    setVoiceFeedback(fb);

    // Give 350ms breather so gameover sound finishes cleanly before speech starts
    setTimeout(() => {
      aiVoice.speak(fb.speechText);
    }, 350);

    // Calculate record
    const isHigh = gamification.saveFlashBestScore(score);
    setIsNewRecord(isHigh);

    // Award XP
    const earnedXp = Math.max(25, Math.round(score * 1.5));
    const { newXp } = gamification.addXp(earnedXp, 'Completed 60s Speed Flash Challenge');
    onXpEarned(newXp);

    // Confetti effect
    if (score > 40) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  };

  const currentQ = shuffledQuestions[currentIdx];

  const handleSelectOption = (optKey: string) => {
    if (isAnswerChecked || gameState !== 'playing' || !currentQ) return;

    setSelectedOption(optKey);
    setIsAnswerChecked(true);
    setAnsweredCount(prev => prev + 1);

    const isCorrect = optKey.toLowerCase() === currentQ.correctOption.toLowerCase();

    if (isCorrect) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      // Multiplier scoring based on streak
      let pointsToAdd = 10;
      if (newCombo >= 8) pointsToAdd = 35;
      else if (newCombo >= 5) pointsToAdd = 25;
      else if (newCombo >= 3) pointsToAdd = 18;

      setScore(prev => prev + pointsToAdd);
      setCorrectCount(prev => prev + 1);

      if (newCombo >= 3) playSound('combo');
      else playSound('correct');
    } else {
      setCombo(0);
      playSound('wrong');
    }

    // Fast-paced auto-advance after 450ms for high speed addictiveness
    setTimeout(() => {
      setSelectedOption(null);
      setIsAnswerChecked(false);
      setCurrentIdx(prev => {
        const nextIdx = prev + 1;
        const safeNext = nextIdx < shuffledQuestions.length ? nextIdx : 0;
        const nextQ = shuffledQuestions[safeNext];
        if (nextQ) {
          setAskedQuestionIds(prevAsked => {
            const updated = new Set(prevAsked);
            updated.add(nextQ.id);
            try {
              sessionStorage.setItem('flash_cbt_session_asked_ids', JSON.stringify(Array.from(updated)));
            } catch {}
            return updated;
          });
        }
        return safeNext;
      });
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-8 max-w-lg w-full text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[480px]">
        
        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-52 h-52 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-52 h-52 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Control Bar */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black border border-amber-500/40">
              <Zap className="w-4 h-4 fill-amber-400" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-wide font-['Outfit']">
                60-Second Flash Challenge
              </h2>
              <span className="text-[10px] text-slate-400">Rapid-fire Nigerian CBT speed test</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs cursor-pointer transition-colors"
              title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* GAME STATE: INTRO SCREEN */}
        {gameState === 'intro' && (
          <div className="my-auto text-center space-y-5 z-10 py-6">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black mx-auto shadow-lg shadow-amber-500/30 animate-bounce">
                <Flame className="w-10 h-10 fill-slate-950" />
              </div>
              <span className="absolute -top-1 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase">
                60s
              </span>
            </div>

            <div className="space-y-2 max-w-sm mx-auto">
              <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white">
                Beat the Clock! ⚡
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Answer as many JAMB & WAEC past questions as you can in 60 seconds. Build streaks for 
                <strong className="text-amber-400"> 2x, 3x, and 5x COMBO Multipliers</strong>!
              </p>
            </div>

            {/* High score and session no-repeat badge */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-slate-400">Personal Best:</span>
                <span className="font-black text-amber-300">{bestScore} Points</span>
              </div>

              {askedQuestionIds.size > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-[11px] text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{askedQuestionIds.size} unique questions completed • Zero repeats</span>
                  <button
                    onClick={handleResetSessionHistory}
                    className="ml-1 text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                    title="Reset session history"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>

            <div>
              <button
                id="start-flash-challenge-btn"
                onClick={startChallenge}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                START 60-SECOND RUSH 🚀
              </button>
            </div>
          </div>
        )}

        {/* GAME STATE: ACTIVE PLAYING */}
        {gameState === 'playing' && currentQ && (
          <div className="space-y-4 my-auto z-10 py-2">
            
            {/* Header Status: Timer, Score, and Combo Flame */}
            <div className="flex items-center justify-between bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60">
              
              {/* Countdown Timer with color transitions */}
              <div className="flex items-center gap-1.5">
                <Timer className={`w-4 h-4 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-amber-400'}`} />
                <span className={`text-base sm:text-lg font-mono font-black ${
                  timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'
                }`}>
                  {timeLeft}s
                </span>
              </div>

              {/* Combo Multiplier Flame */}
              {combo >= 2 ? (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40 text-xs font-black animate-bounce">
                  <Flame className="w-3.5 h-3.5 fill-orange-400" />
                  <span>{combo >= 8 ? '5x MEGA' : combo >= 5 ? '3x SUPER' : '2x COMBO'}</span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400">
                  Speed CBT
                </div>
              )}

              {/* Live Score */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400">PTS:</span>
                <span className="text-base font-mono font-black text-amber-300">
                  {score}
                </span>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                <span className="text-emerald-400">{currentQ.subjectName}</span>
                <span>{currentQ.examType}</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-snug">
                {currentQ.question}
              </p>
            </div>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(['A', 'B', 'C', 'D'] as const).map(optKey => {
                const optText = currentQ.options[optKey];
                if (!optText) return null;

                const isSelected = selectedOption === optKey;
                const isCorrect = currentQ.correctOption.toUpperCase() === optKey;

                let btnStyle = 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 border-slate-700';

                if (isAnswerChecked) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-600 text-white border-emerald-400 scale-[1.01]';
                  } else if (isSelected) {
                    btnStyle = 'bg-red-600 text-white border-red-400';
                  }
                }

                return (
                  <button
                    key={optKey}
                    onClick={() => handleSelectOption(optKey)}
                    disabled={isAnswerChecked}
                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-5 h-5 rounded-md bg-slate-900/60 flex items-center justify-center font-bold text-[11px] shrink-0">
                      {optKey}
                    </span>
                    <span className="truncate">{optText}</span>
                  </button>
                );
              })}
            </div>

          </div>
        )}

        {/* GAME STATE: ENDED / RESULT SCREEN */}
        {gameState === 'ended' && (
          <div className="my-auto text-center space-y-5 z-10 py-4">
            
            {/* Celebration Icon */}
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black mx-auto shadow-md">
                <Trophy className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white">
                {isNewRecord ? '🔥 NEW PERSONAL BEST!' : 'Time’s Up! Challenge Complete'}
              </h3>
              <p className="text-xs text-slate-400">
                You scored <strong className="text-amber-400 font-extrabold">{score} points</strong> in 60 seconds!
              </p>
            </div>

            {/* Stats Breakdown Grid */}
            <div className="grid grid-cols-3 gap-2 bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block">Correct</span>
                <span className="text-base font-mono font-black text-emerald-400">
                  {correctCount}/{answeredCount}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Max Streak</span>
                <span className="text-base font-mono font-black text-orange-400">
                  {maxCombo}x 🔥
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">XP Earned</span>
                <span className="text-base font-mono font-black text-purple-400">
                  +{Math.max(25, Math.round(score * 1.5))} XP
                </span>
              </div>
            </div>

            {/* AI Voice Feedback Banner */}
            {voiceFeedback && (
              <div className={`p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 ${
                voiceFeedback.category === 'great'
                  ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
                  : voiceFeedback.category === 'average'
                    ? 'bg-amber-950/70 border-amber-500/40 text-amber-200'
                    : 'bg-rose-950/70 border-rose-500/40 text-rose-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    voiceFeedback.category === 'great'
                      ? 'bg-emerald-600 text-white'
                      : voiceFeedback.category === 'average'
                        ? 'bg-amber-500 text-white'
                        : 'bg-rose-600 text-white'
                  }`}>
                    <Volume2 className={`w-5 h-5 ${isVoiceSpeaking ? 'animate-pulse text-amber-200' : ''}`} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-300">
                      Naija AI Voice
                    </div>
                    <div className="text-xs font-bold text-white">
                      {voiceFeedback.title}
                    </div>
                    <div className="text-[11px] opacity-85 line-clamp-1">
                      "{voiceFeedback.message}"
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (isVoiceSpeaking) {
                      aiVoice.stop();
                    } else {
                      aiVoice.speak(voiceFeedback.message);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {isVoiceSpeaking ? (
                    <>
                      <VolumeX className="w-3 h-3" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3" />
                      <span>Hear</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={startChallenge}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again (60s)</span>
              </button>

              <button
                onClick={() => {
                  aiVoice.stop();
                  setVoiceFeedback(null);
                  onClose();
                }}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
