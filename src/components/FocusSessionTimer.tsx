import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Coffee, 
  Brain, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Flame, 
  Trophy, 
  BookOpen, 
  CheckCircle2, 
  Bot, 
  Timer,
  Clock,
  Layers,
  Settings,
  ChevronDown
} from 'lucide-react';
import { User } from '../types';
import { gamification } from '../utils/gamification';
import confetti from 'canvas-confetti';

interface FocusSessionTimerProps {
  user: User | null;
  onNavigate: (view: string, extra?: any) => void;
  onOpenAITutor?: (topic?: string, subjectName?: string) => void;
}

type SessionMode = 'pomodoro' | 'deep' | 'sprint';
type SessionPhase = 'focus' | 'break';

const PRESETS: Record<SessionMode, { name: string; focusMin: number; breakMin: number; desc: string }> = {
  pomodoro: { name: '25 / 5 Classic', focusMin: 25, breakMin: 5, desc: 'Standard Pomodoro technique for maximum retention' },
  deep: { name: '50 / 10 Deep Work', focusMin: 50, breakMin: 10, desc: 'Extended focus block for complex calculations & essays' },
  sprint: { name: '15 / 3 Fast Sprint', focusMin: 15, breakMin: 3, desc: 'Quick revision sprint before exams' },
};

const SUBJECT_OPTIONS = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Government',
  'Economics',
  'Literature in English',
  'Commerce',
  'CRS / IRS',
  'General JAMB / WAEC'
];

const STUDY_TIPS = [
  "💡 Turn off social media notifications to stay in deep flow.",
  "⚡ Active recall + Pomodoro boosts memory retention by over 40%.",
  "🎯 Focus on 1 specific concept or 10 past questions per session.",
  "💧 Drink a glass of water during your 5-minute recovery break.",
  "🧠 Write down key formulas on paper without looking during study."
];

// Self-contained Web Audio chimes
const playChime = (type: 'focus_done' | 'break_done') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    if (type === 'focus_done') {
      // Triumphant 3-note chime (C5 -> E5 -> G5)
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.6);
      });
    } else {
      // Gentle 2-note bell (G4 -> C5)
      const freqs = [392.00, 523.25];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = f;
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 0.5);
      });
    }
  } catch {
    // Audio Context not permitted or unsupported
  }
};

export const FocusSessionTimer: React.FC<FocusSessionTimerProps> = ({
  user,
  onNavigate,
  onOpenAITutor
}) => {
  const [mode, setMode] = useState<SessionMode>('pomodoro');
  const [phase, setPhase] = useState<SessionPhase>('focus');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(PRESETS.pomodoro.focusMin * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // Persistence metrics for today
  const todayKey = new Date().toISOString().split('T')[0];
  const [completedSessions, setCompletedSessions] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`studynaija_focus_count_${todayKey}`);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [totalFocusMinutes, setTotalFocusMinutes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`studynaija_focus_mins_${todayKey}`);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [tipIndex, setTipIndex] = useState(0);
  const timerRef = useRef<any>(null);

  // Rotate tips periodically
  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % STUDY_TIPS.length);
    }, 12000);
    return () => clearInterval(tipTimer);
  }, []);

  // Sync mode changes with initial countdown
  const switchMode = (newMode: SessionMode) => {
    setMode(newMode);
    setPhase('focus');
    setIsActive(false);
    setSecondsRemaining(PRESETS[newMode].focusMin * 60);
    setShowSettings(false);
  };

  // Main countdown ticker
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phase, mode]);

  // Handler when timer reaches 0
  const handlePhaseComplete = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsActive(false);

    if (phase === 'focus') {
      // Finished a focus block!
      const currentConfig = PRESETS[mode];
      const newCount = completedSessions + 1;
      const newMins = totalFocusMinutes + currentConfig.focusMin;

      setCompletedSessions(newCount);
      setTotalFocusMinutes(newMins);
      try {
        localStorage.setItem(`studynaija_focus_count_${todayKey}`, newCount.toString());
        localStorage.setItem(`studynaija_focus_mins_${todayKey}`, newMins.toString());
      } catch {}

      // Award +25 Academic Merit XP
      gamification.addXp(25, `Completed ${currentConfig.focusMin}-Min Pomodoro Focus Session (${selectedSubject}) 🍅`);

      if (soundEnabled) {
        playChime('focus_done');
      }

      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      // Switch to break phase
      setPhase('break');
      setSecondsRemaining(currentConfig.breakMin * 60);
    } else {
      // Finished a break!
      if (soundEnabled) {
        playChime('break_done');
      }
      setPhase('focus');
      setSecondsRemaining(PRESETS[mode].focusMin * 60);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    const cfg = PRESETS[mode];
    setSecondsRemaining((phase === 'focus' ? cfg.focusMin : cfg.breakMin) * 60);
  };

  const skipPhase = () => {
    setIsActive(false);
    const cfg = PRESETS[mode];
    if (phase === 'focus') {
      setPhase('break');
      setSecondsRemaining(cfg.breakMin * 60);
    } else {
      setPhase('focus');
      setSecondsRemaining(cfg.focusMin * 60);
    }
  };

  // Calculations for visual progress ring & format
  const currentTotalSeconds = (phase === 'focus' ? PRESETS[mode].focusMin : PRESETS[mode].breakMin) * 60;
  const progressPercent = Math.min(100, Math.max(0, ((currentTotalSeconds - secondsRemaining) / currentTotalSeconds) * 100));
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div id="focus-session-timer-section" className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white border border-purple-500/30 p-6 sm:p-7 shadow-[0_10px_35px_rgba(168,85,247,0.12)]">
      {/* Ambient background glows */}
      <div className="absolute -top-16 -right-16 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="relative z-10 space-y-6">
        
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shadow-lg transition-colors ${
              phase === 'focus' 
                ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-purple-400/40 text-purple-300' 
                : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-400/40 text-emerald-300'
            }`}>
              {phase === 'focus' ? (
                <Brain className={`w-6 h-6 ${isActive ? 'animate-pulse text-purple-400' : ''}`} />
              ) : (
                <Coffee className={`w-6 h-6 ${isActive ? 'animate-bounce text-emerald-400' : ''}`} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-mono tracking-widest font-bold px-2 py-0.5 rounded border ${
                  phase === 'focus' 
                    ? 'bg-purple-950/80 border-purple-500/30 text-purple-300' 
                    : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
                }`}>
                  {phase === 'focus' ? 'POMODORO DEEP WORK' : 'RECOVERY BREAK'}
                </span>
                {isActive && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight text-white flex items-center gap-2 mt-0.5">
                <span>Focus Session Timer</span>
                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700">
                  {PRESETS[mode].name}
                </span>
              </h2>
            </div>
          </div>

          {/* Controls: Audio Toggle & Mode Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                soundEnabled 
                  ? 'bg-purple-950/60 border-purple-500/40 text-purple-300 hover:bg-purple-900/60' 
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-700/60'
              }`}
              title={soundEnabled ? 'Chimes enabled' : 'Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-purple-500/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-purple-400" />
              <span>Session Mode</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Settings Drawer */}
        {showSettings && (
          <div className="p-4 rounded-2xl bg-slate-900/95 border border-purple-500/40 shadow-inner space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="text-xs font-semibold text-purple-300">
              Select Study Technique Protocol:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {(Object.keys(PRESETS) as SessionMode[]).map((key) => {
                const item = PRESETS[key];
                const isSelected = mode === key;
                return (
                  <button
                    key={key}
                    onClick={() => switchMode(key)}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-purple-950 to-indigo-950 border-purple-400 text-white shadow-md ring-1 ring-purple-400'
                        : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs">{item.name}</span>
                      {isSelected && <span className="text-[10px] text-purple-300 font-mono font-bold">Active</span>}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-snug">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Timer Display & Interaction Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Digital Clock Dial & Main Play Controls */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-950/70 border border-slate-800/90 shadow-inner space-y-5">
            
            {/* Subject Selector Bar */}
            <div className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 font-semibold flex items-center gap-1.5 shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Subject:</span>
              </span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-transparent text-xs font-bold text-purple-300 focus:outline-none cursor-pointer w-full text-right"
              >
                {SUBJECT_OPTIONS.map(sub => (
                  <option key={sub} value={sub} className="bg-slate-900 text-white">
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Giant Countdown Clock Display */}
            <div className="relative flex flex-col items-center justify-center my-2">
              {/* Outer Ring Pulse */}
              {isActive && (
                <div className={`absolute -inset-4 rounded-full blur-xl opacity-25 animate-pulse ${
                  phase === 'focus' ? 'bg-purple-500' : 'bg-emerald-500'
                }`} />
              )}

              <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                {formattedTime}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  phase === 'focus'
                    ? 'bg-purple-500/20 border-purple-400/40 text-purple-300'
                    : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                }`}>
                  {phase === 'focus' ? '🧠 Study Block Active' : '☕ Rest & Re-charge Break'}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ({Math.round(progressPercent)}% elapsed)
                </span>
              </div>
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  phase === 'focus'
                    ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Play, Pause, Reset, Skip Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2 w-full">
              <button
                onClick={resetTimer}
                className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer shadow-sm"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={toggleTimer}
                className={`px-8 py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-102 ${
                  isActive
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                    : phase === 'focus'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" />
                    <span>Pause Session</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>{secondsRemaining === currentTotalSeconds ? `Start ${phase === 'focus' ? 'Deep Work' : 'Break'}` : 'Resume Session'}</span>
                  </>
                )}
              </button>

              <button
                onClick={skipPhase}
                className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer shadow-sm"
                title="Skip to next phase"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Right Column: Deep Work Stats, Quick Practice Launcher & Tip Ticker */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Daily Focus Stats Metric Card */}
            <div className="p-5 rounded-3xl bg-slate-950/60 border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                <span className="font-mono text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Today's Deep Work</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  +25 XP per session
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-2xl font-black font-mono text-white">
                    {completedSessions}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    🍅 Completed Blocks
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-2xl font-black font-mono text-purple-300">
                    {totalFocusMinutes}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    ⏱️ Focus Minutes
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  {completedSessions >= 4
                    ? "🔥 Excellent stamina! You've achieved elite daily Pomodoro volume."
                    : `Complete ${Math.max(1, 4 - completedSessions)} more session${4 - completedSessions !== 1 ? 's' : ''} to reach the 4-block master target.`}
                </span>
              </div>
            </div>

            {/* Quick Practice & AI Tutor Shortcuts */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/40 to-slate-950 border border-purple-500/30 space-y-3">
              <div className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Deep Work Study Accelerators</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => onNavigate('practice', { subjectName: selectedSubject })}
                  className="p-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/70 border border-purple-500/40 text-purple-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Practice {selectedSubject}</span>
                </button>

                {onOpenAITutor && (
                  <button
                    onClick={() => onOpenAITutor('Pomodoro Deep Study Review', selectedSubject)}
                    className="p-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ask AI Tutor</span>
                  </button>
                )}
              </div>
            </div>

            {/* Nigerian Student Study Tip Ticker */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 flex items-center gap-2.5">
              <span className="text-base shrink-0">📌</span>
              <p className="italic text-[11px] leading-relaxed transition-opacity duration-300">
                {STUDY_TIPS[tipIndex]}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
