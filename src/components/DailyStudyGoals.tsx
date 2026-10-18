import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Sliders, 
  Trophy, 
  Flame, 
  BookOpen, 
  RefreshCw,
  Clock,
  Compass
} from 'lucide-react';
import { User, DailyStudyGoal } from '../types';
import { gamification } from '../utils/gamification';
import confetti from 'canvas-confetti';

interface DailyStudyGoalsProps {
  user: User | null;
  onNavigate: (view: string, extra?: any) => void;
}

export const DailyStudyGoals: React.FC<DailyStudyGoalsProps> = ({
  user,
  onNavigate
}) => {
  const [goal, setGoal] = useState<DailyStudyGoal>(() => gamification.getDailyStudyGoal(user));
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [customInput, setCustomInput] = useState(goal.target.toString());
  const [justAchieved, setJustAchieved] = useState(false);

  // Listen for real-time daily goal updates dispatched by practice/exams
  useEffect(() => {
    const handleGoalUpdate = (e: any) => {
      if (e.detail?.goal) {
        setGoal(e.detail.goal);
        if (e.detail.newlyAchieved) {
          setJustAchieved(true);
          try {
            confetti({
              particleCount: 80,
              spread: 80,
              origin: { y: 0.6 }
            });
          } catch {}
        }
      } else {
        setGoal(gamification.getDailyStudyGoal(user));
      }
    };

    window.addEventListener('studynaija_daily_goal_updated', handleGoalUpdate);
    return () => {
      window.removeEventListener('studynaija_daily_goal_updated', handleGoalUpdate);
    };
  }, [user]);

  const handleSelectPreset = (preset: number) => {
    const updated = gamification.setDailyGoalTarget(preset);
    setGoal(updated);
    setCustomInput(preset.toString());
    setIsEditingTarget(false);
  };

  const handleSaveCustomTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customInput, 10);
    if (!isNaN(val) && val >= 5 && val <= 100) {
      const updated = gamification.setDailyGoalTarget(val);
      setGoal(updated);
      setIsEditingTarget(false);
    }
  };

  const questionsRemaining = Math.max(0, goal.target - goal.completed);
  const isCrushed = goal.completed >= goal.target;

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white border border-cyan-500/30 p-6 sm:p-7 shadow-[0_10px_35px_rgba(6,182,212,0.12)]">
      {/* Futuristic Background Circuit & Glow Accents */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="relative z-10 space-y-5">
        
        {/* Top Header: Title, Live Telemetry Badge, & Settings Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Target className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                  DAILY DISCIPLINE // TARGET TRACKER
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight text-white flex items-center gap-2 mt-0.5">
                <span>Daily Study Goals</span>
                {isCrushed && (
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Goal Achieved</span>
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Quick Target Settings Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingTarget(!isEditingTarget)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-cyan-500/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Change your daily questions target"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target: {goal.target} Qs</span>
            </button>
          </div>
        </div>

        {/* Target Editor Drawer */}
        {isEditingTarget && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-inner space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-cyan-300">Select Daily Target (Questions/Day):</span>
              <span className="text-[11px] text-slate-400">Aim for consistency every day</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[10, 15, 20, 30, 50].map(preset => (
                <button
                  key={preset}
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    goal.target === preset
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {preset} Questions
                </button>
              ))}

              {/* Custom input form */}
              <form onSubmit={handleSaveCustomTarget} className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  className="w-16 px-2.5 py-1.5 bg-slate-950 border border-cyan-500/40 rounded-xl text-xs text-white font-mono text-center focus:outline-none focus:border-cyan-400"
                  placeholder="Custom"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Set
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Core Progress Bar Section */}
        <div className="space-y-3 p-5 rounded-2xl bg-slate-950/60 border border-slate-800/90 shadow-inner">
          
          {/* Metrics Row: Completed / Target & Percentage */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                {goal.completed}
              </span>
              <span className="text-sm font-semibold text-slate-400">
                / {goal.target} Questions Done Today
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-400/30 text-cyan-300 font-mono text-sm font-black flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                <span>{goal.percentage}% Complete</span>
              </div>
            </div>
          </div>

          {/* Futuristic Glowing Progress Bar */}
          <div className="relative w-full bg-slate-900/90 h-5 sm:h-6 rounded-2xl overflow-hidden p-1 border border-cyan-500/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
            {/* Animated progress fill */}
            <div
              className={`h-full rounded-xl transition-all duration-700 relative ${
                isCrushed
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              }`}
              style={{ width: `${Math.min(100, Math.max(goal.completed > 0 ? 5 : 0, goal.percentage))}%` }}
            >
              {/* Shimmer line */}
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>

            {/* Futuristic Telemetry Tick Marks (25%, 50%, 75%) */}
            <div className="absolute inset-0 flex justify-between px-3 pointer-events-none items-center">
              <div className="w-px h-2 bg-slate-700" style={{ left: '25%' }} />
              <div className="w-px h-2.5 bg-slate-600" style={{ left: '50%' }} />
              <div className="w-px h-2 bg-slate-700" style={{ left: '75%' }} />
            </div>
          </div>

          {/* Motivational Status Readout & Rewards */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
            <div className="flex items-center gap-2 text-slate-300">
              {isCrushed ? (
                <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                  <span>Daily Target Crushed! You've claimed <strong>+50 Bonus Academic XP</strong>!</span>
                </span>
              ) : questionsRemaining > 0 ? (
                <span className="text-cyan-300 font-medium flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  <span>Only <strong>{questionsRemaining} more question{questionsRemaining !== 1 ? 's' : ''}</strong> to hit today's study target!</span>
                </span>
              ) : (
                <span className="text-slate-400">Answer questions in practice or mock exams to complete your daily protocol.</span>
              )}
            </div>

            {/* Quick Action to Practice */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('practice')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 fill-slate-950" />
                <span>{isCrushed ? 'Practice More Questions' : 'Start Practice Drill'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Milestone Badges Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] ${
            goal.completed >= Math.round(goal.target * 0.25)
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}>
            <span className="font-mono font-bold">25%</span>
            <span className="truncate">Warm-up Drill</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] ${
            goal.completed >= Math.round(goal.target * 0.5)
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}>
            <span className="font-mono font-bold">50%</span>
            <span className="truncate">Halfway Mark</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] ${
            goal.completed >= Math.round(goal.target * 0.75)
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}>
            <span className="font-mono font-bold">75%</span>
            <span className="truncate">Final Lap</span>
          </div>

          <div className={`p-2.5 rounded-xl border flex items-center gap-2 text-[11px] ${
            isCrushed
              ? 'bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border-cyan-400/50 text-cyan-300 font-bold'
              : 'bg-slate-900/60 border-slate-800 text-slate-500'
          }`}>
            <span className="font-mono font-bold">100%</span>
            <span className="truncate">Mission Master 🎯</span>
          </div>
        </div>

      </div>
    </div>
  );
};
