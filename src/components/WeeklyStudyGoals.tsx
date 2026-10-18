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
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Check,
  ChevronRight,
  Calculator,
  Compass,
  Award,
  Layers,
  BarChart2
} from 'lucide-react';
import { User, WeeklyStudyGoal, WeeklyStudyGoalsState } from '../types';
import { weeklyGoalsManager } from '../utils/weeklyGoalsManager';
import confetti from 'canvas-confetti';

interface WeeklyStudyGoalsProps {
  user: User | null;
  onNavigate: (view: string, extra?: any) => void;
  openAddModalInitially?: boolean;
}

export const WeeklyStudyGoals: React.FC<WeeklyStudyGoalsProps> = ({
  user,
  onNavigate,
  openAddModalInitially = false
}) => {
  const [state, setState] = useState<WeeklyStudyGoalsState>(() => weeklyGoalsManager.getState(user));
  const [activeFilter, setActiveFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  
  // Modal & Edit States
  const [isAddModalOpen, setIsAddModalOpen] = useState(openAddModalInitially);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingTargetValue, setEditingTargetValue] = useState<string>('50');
  const [justCrushedGoalTitle, setJustCrushedGoalTitle] = useState<string | null>(null);

  // New Goal Form State
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<'subject' | 'all' | 'mock-exam'>('subject');
  const [newGoalSubject, setNewGoalSubject] = useState('mathematics');
  const [newGoalTarget, setNewGoalTarget] = useState(40);
  const [newGoalColor, setNewGoalColor] = useState<'cyan' | 'emerald' | 'amber' | 'purple' | 'blue' | 'rose'>('emerald');

  // Real-time listener for weekly goal updates
  useEffect(() => {
    const handleUpdate = () => {
      setState(weeklyGoalsManager.getState(user));
    };

    const handleOpenModal = () => {
      setIsAddModalOpen(true);
    };

    const handleCrushed = (e: any) => {
      setState(weeklyGoalsManager.getState(user));
      const goals = e.detail?.newlyCrushedGoals;
      if (Array.isArray(goals) && goals.length > 0) {
        setJustCrushedGoalTitle(goals[0].title);
        try {
          confetti({
            particleCount: 90,
            spread: 85,
            origin: { y: 0.6 }
          });
        } catch {}
      }
    };

    window.addEventListener('studynaija_weekly_goals_updated', handleUpdate);
    window.addEventListener('studynaija_open_set_weekly_goal', handleOpenModal);
    window.addEventListener('studynaija_weekly_goal_crushed', handleCrushed);
    return () => {
      window.removeEventListener('studynaija_weekly_goals_updated', handleUpdate);
      window.removeEventListener('studynaija_open_set_weekly_goal', handleOpenModal);
      window.removeEventListener('studynaija_weekly_goal_crushed', handleCrushed);
    };
  }, [user]);

  // Edit target handlers
  const handleOpenEditTarget = (goal: WeeklyStudyGoal) => {
    setEditingGoalId(goal.id);
    setEditingTargetValue(goal.targetQuestions.toString());
  };

  const handleSaveEditTarget = (goalId: string) => {
    const parsed = parseInt(editingTargetValue, 10);
    if (!isNaN(parsed) && parsed >= 5 && parsed <= 500) {
      const updatedState = weeklyGoalsManager.setGoalTarget(goalId, parsed);
      setState(updatedState);
      setEditingGoalId(null);
    }
  };

  const handleQuickAdjust = (goalId: string, delta: number) => {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;
    const newTarget = Math.max(5, Math.min(500, goal.targetQuestions + delta));
    const updatedState = weeklyGoalsManager.setGoalTarget(goalId, newTarget);
    setState(updatedState);
  };

  // Quick manual increment for offline study
  const handleQuickLog = (goalId: string, amount: number) => {
    const updated = weeklyGoalsManager.quickIncrementGoal(goalId, amount);
    setState(updated);
  };

  // Delete goal
  const handleDeleteGoal = (goalId: string) => {
    const updated = weeklyGoalsManager.deleteGoal(goalId);
    setState(updated);
  };

  // Apply strategy preset
  const handleApplyPreset = (preset: 'starter' | 'scholar' | 'intensive') => {
    const updated = weeklyGoalsManager.applyPresetStrategy(preset);
    setState(updated);
  };

  // Reset week
  const handleResetWeek = () => {
    const updated = weeklyGoalsManager.resetWeekProgress();
    setState(updated);
  };

  // Add new goal submit
  const handleCreateNewGoal = (e: React.FormEvent) => {
    e.preventDefault();

    let title = newGoalTitle.trim();
    let subjectName: string | undefined = undefined;

    const SUBJECT_MAP: Record<string, string> = {
      mathematics: 'Mathematics',
      english: 'English Language',
      physics: 'Physics',
      chemistry: 'Chemistry',
      biology: 'Biology',
      economics: 'Economics',
      government: 'Government',
      literature: 'Literature in English',
      commerce: 'Commerce',
      accounting: 'Financial Accounting',
      crs: 'Christian Religious Studies',
      irs: 'Islamic Studies',
      agric: 'Agricultural Science',
      geography: 'Geography',
      civic: 'Civic Education'
    };

    if (newGoalCategory === 'subject') {
      subjectName = SUBJECT_MAP[newGoalSubject] || newGoalSubject;
      if (!title) {
        title = `${subjectName} Practice Drills`;
      }
    } else if (newGoalCategory === 'mock-exam') {
      if (!title) title = 'Full CBT Mock Exam Sprint';
    } else {
      if (!title) title = 'Comprehensive Study Volume';
    }

    const updated = weeklyGoalsManager.addGoal({
      title,
      category: newGoalCategory,
      subjectId: newGoalCategory === 'subject' ? newGoalSubject : undefined,
      subjectName,
      targetQuestions: newGoalTarget,
      colorTheme: newGoalColor,
      icon: newGoalCategory === 'subject' ? (newGoalSubject === 'mathematics' ? 'calculator' : 'book') : 'target'
    });

    setState(updated);
    setIsAddModalOpen(false);
    setNewGoalTitle('');
    setNewGoalTarget(40);
  };

  // Filter goals
  const filteredGoals = state.goals.filter(goal => {
    if (activeFilter === 'in-progress') return !goal.isCompleted;
    if (activeFilter === 'completed') return goal.isCompleted;
    return true;
  });

  const completedCount = state.goals.filter(g => g.isCompleted).length;

  return (
    <div id="weekly-study-goals-section" className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. FUTURISTIC HERO BANNER FOR WEEKLY STUDY GOALS */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-cyan-500/30 p-6 sm:p-7 shadow-[0_10px_35px_rgba(6,182,212,0.14)]">
        {/* Glow & Cybernetic Accents */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10 space-y-5">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-emerald-500/20 to-indigo-500/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0">
                <Target className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40">
                    WEEKLY SPRINT // TARGET MATRIX
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{state.weekStart} – {state.weekEnd}</span>
                    <span>·</span>
                    <span className="text-cyan-300 font-mono font-bold tabular-nums">
                      {state.daysRemaining} {state.daysRemaining === 1 ? 'day' : 'days'} left
                    </span>
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight text-white mt-1">
                  Weekly Study Goals & Practice Targets 🎯
                </h2>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102"
              >
                <Plus className="w-4 h-4" />
                <span>Set New Goal</span>
              </button>

              <button
                onClick={handleResetWeek}
                title="Reset this week's progress counters"
                className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-700/60 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subtitle / Philosophy */}
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Consistent weekly question volume is proven to build deep exam retrieval speed. Set custom question benchmarks across your core JAMB and WAEC subjects, track your progress bars live, and crush your admission targets.
          </p>

          {/* Weekly Summary Progress Card */}
          <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-cyan-500/20 backdrop-blur-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 uppercase font-mono tracking-wider text-[11px] font-bold">
                  Aggregate Weekly Progress:
                </span>
                <span className="text-white font-mono font-black text-sm tabular-nums">
                  {state.totalCompleted} / {state.totalTarget} Questions
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-300 text-[11px]">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{completedCount} of {state.goals.length} Goals Crushed</span>
                </span>
                <span>·</span>
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                  <span>{state.allGoalsCrushed ? 'All Goals Mastered (+250 XP)' : `+${completedCount * 75} Bonus XP Earned`}</span>
                </span>
              </div>
            </div>

            {/* Giant Dual-Gradient Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden p-0.5 border border-cyan-500/30">
                <div 
                  className="bg-gradient-to-r from-cyan-500 via-emerald-400 to-teal-300 h-full rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                  style={{ width: `${state.overallPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>0 Questions</span>
                <span className="text-cyan-300 font-black tabular-nums">{state.overallPercentage}% Achieved</span>
                <span>{state.totalTarget} Target Goal</span>
              </div>
            </div>
          </div>

          {/* Quick Strategy Preset Switcher Strip */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Presets:</span>
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleApplyPreset('starter')}
                className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold transition-all cursor-pointer"
              >
                Starter (60 Qs/wk)
              </button>
              <button
                onClick={() => handleApplyPreset('scholar')}
                className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-semibold transition-all cursor-pointer"
              >
                Scholar (130 Qs/wk)
              </button>
              <button
                onClick={() => handleApplyPreset('intensive')}
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
              >
                🔥 JAMB 300+ Sprint (250 Qs/wk)
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Just Crushed Toast / Announcement */}
      {justCrushedGoalTitle && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-emerald-400/40 text-emerald-100 flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
              🏆
            </div>
            <div>
              <h4 className="text-sm font-black font-['Outfit'] text-white">
                Goal Mastered: {justCrushedGoalTitle}!
              </h4>
              <p className="text-xs text-emerald-200">
                Congratulations! You crushed this weekly target. Your consistency is securing your exam readiness!
              </p>
            </div>
          </div>
          <button
            onClick={() => setJustCrushedGoalTitle(null)}
            className="text-xs font-bold px-3 py-1 bg-emerald-600/40 hover:bg-emerald-600/60 rounded-lg text-white border border-emerald-400/30"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FILTER TABS & ACTIVE GOALS GRID */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Goals ({state.goals.length})
          </button>
          <button
            onClick={() => setActiveFilter('in-progress')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFilter === 'in-progress'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Progress ({state.goals.filter(g => !g.isCompleted).length})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeFilter === 'completed'
                ? 'bg-white text-emerald-800 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Crushed ({completedCount})
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
          <span>Target Controls Active</span>
          <span aria-hidden="true">·</span>
          <span>Click any target number to adjust questions</span>
        </div>
      </div>

      {/* Grid of Individual Goal Cards with Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredGoals.map((goal) => {
          const isEditing = editingGoalId === goal.id;
          const questionsLeft = Math.max(0, goal.targetQuestions - goal.completedQuestions);
          const isCrushed = goal.isCompleted;

          // Style themes for progress bars & accents
          const THEME_STYLES: Record<string, {
            border: string;
            progressGradient: string;
            badgeBg: string;
            badgeText: string;
            glow: string;
          }> = {
            cyan: {
              border: 'border-cyan-200 hover:border-cyan-400',
              progressGradient: 'from-cyan-500 to-teal-400',
              badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
              badgeText: 'text-cyan-700',
              glow: 'shadow-[0_0_12px_rgba(6,182,212,0.4)]'
            },
            emerald: {
              border: 'border-emerald-200 hover:border-emerald-400',
              progressGradient: 'from-emerald-500 to-teal-400',
              badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
              badgeText: 'text-emerald-700',
              glow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]'
            },
            amber: {
              border: 'border-amber-200 hover:border-amber-400',
              progressGradient: 'from-amber-500 to-orange-400',
              badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
              badgeText: 'text-amber-700',
              glow: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]'
            },
            purple: {
              border: 'border-purple-200 hover:border-purple-400',
              progressGradient: 'from-purple-500 to-indigo-400',
              badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
              badgeText: 'text-purple-700',
              glow: 'shadow-[0_0_12px_rgba(168,85,247,0.4)]'
            },
            blue: {
              border: 'border-blue-200 hover:border-blue-400',
              progressGradient: 'from-blue-500 to-indigo-400',
              badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
              badgeText: 'text-blue-700',
              glow: 'shadow-[0_0_12px_rgba(59,130,246,0.4)]'
            },
            rose: {
              border: 'border-rose-200 hover:border-rose-400',
              progressGradient: 'from-rose-500 to-pink-400',
              badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
              badgeText: 'text-rose-700',
              glow: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]'
            }
          };

          const theme = THEME_STYLES[goal.colorTheme] || THEME_STYLES.cyan;

          return (
            <div
              key={goal.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-200 shadow-xs space-y-4 flex flex-col justify-between ${
                isCrushed
                  ? 'border-emerald-300 bg-gradient-to-b from-white to-emerald-50/30 ring-1 ring-emerald-400/20'
                  : theme.border
              }`}
            >
              <div className="space-y-3">
                {/* Top Row: Category tag, icons, edit & delete */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{goal.subjectName || (goal.category === 'mock-exam' ? 'Mock Exam' : 'Practice Drill')}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono font-medium text-[11px]">Weekly Objective</span>
                      {goal.rewardXp && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-600 font-bold">+{goal.rewardXp} XP</span>
                        </>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-base text-slate-900 font-['Outfit'] flex items-center gap-2">
                      {goal.icon === 'calculator' && <Calculator className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {goal.icon === 'book' && <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />}
                      {goal.icon === 'zap' && <Zap className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />}
                      {goal.icon === 'target' && <Target className="w-4 h-4 text-cyan-600 shrink-0" />}
                      <span>{goal.title}</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditTarget(goal)}
                      title="Edit target questions"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {state.goals.length > 1 && (
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        title="Remove goal"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Numbers / Interactive Target Row */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900 font-mono tabular-nums tracking-tight">
                      {goal.completedQuestions}
                    </span>
                    <span className="text-slate-400 text-xs font-semibold">/</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="5"
                          max="500"
                          value={editingTargetValue}
                          onChange={e => setEditingTargetValue(e.target.value)}
                          className="w-16 px-1.5 py-0.5 text-sm font-mono font-bold border border-slate-300 rounded-md focus:border-slate-800 outline-none"
                        />
                        <button
                          onClick={() => handleSaveEditTarget(goal.id)}
                          className="px-2 py-0.5 bg-slate-900 text-white rounded text-xs font-bold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenEditTarget(goal)}
                        title="Click to edit target"
                        className="text-base font-bold text-slate-600 font-mono hover:text-slate-900 hover:underline cursor-pointer tabular-nums"
                      >
                        {goal.targetQuestions} questions
                      </button>
                    )}
                  </div>

                  {/* Percentage & Completion Chip */}
                  {isCrushed ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>CRUSHED 100%</span>
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg tabular-nums">
                      {goal.percentage}%
                    </span>
                  )}
                </div>

                {/* INDIVIDUAL PROGRESS BAR FOR THIS GOAL */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${theme.progressGradient} ${theme.glow}`}
                      style={{ width: `${goal.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {isCrushed ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          Target exceeded by {goal.completedQuestions - goal.targetQuestions} questions!
                        </span>
                      ) : (
                        <span>{questionsLeft} questions remaining</span>
                      )}
                    </span>

                    <span className="text-slate-400">
                      {goal.percentage >= 70 ? 'Almost there' : (goal.percentage >= 40 ? 'Steady pace' : 'Keep practicing')}
                    </span>
                  </div>
                </div>

                {/* Inline Target Micro-Adjusters */}
                <div className="flex items-center justify-between gap-1 pt-1 text-xs">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <span>Adjust Target:</span>
                    <button
                      onClick={() => handleQuickAdjust(goal.id, -5)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono font-bold cursor-pointer transition-colors"
                      title="Decrease target by 5"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => handleQuickAdjust(goal.id, 5)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono font-bold cursor-pointer transition-colors"
                      title="Increase target by 5"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleQuickAdjust(goal.id, 10)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-mono font-bold cursor-pointer transition-colors"
                      title="Increase target by 10"
                    >
                      +10
                    </button>
                  </div>

                  {/* Manual Quick-Log for Offline Past Questions */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <span className="hidden sm:inline">Log Offline:</span>
                    <button
                      onClick={() => handleQuickLog(goal.id, 1)}
                      className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-mono font-bold cursor-pointer border border-emerald-200"
                      title="Log 1 offline solved question"
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleQuickLog(goal.id, 5)}
                      className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-mono font-bold cursor-pointer border border-emerald-200"
                      title="Log 5 offline solved questions"
                    >
                      +5
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Card Action: Launch Direct Practice for this Goal */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onNavigate('practice', { subjectId: goal.subjectId })}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Practice {goal.subjectName || 'Now'} →</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: SET NEW WEEKLY GOAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                  <Target className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-['Outfit']">
                    Set a New Weekly Study Goal
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define question benchmarks for this week ({state.weekStart} – {state.weekEnd})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewGoal} className="space-y-4 text-xs">
              
              {/* Category Select */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Goal Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'subject', label: 'Subject Drill' },
                    { id: 'all', label: 'Total Volume' },
                    { id: 'mock-exam', label: 'Mock Exam' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewGoalCategory(cat.id as any)}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        newGoalCategory === cat.id
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Dropdown (if subject category) */}
              {newGoalCategory === 'subject' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Subject</label>
                  <select
                    value={newGoalSubject}
                    onChange={e => setNewGoalSubject(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-slate-800 bg-white"
                  >
                    <option value="mathematics">📐 Mathematics</option>
                    <option value="english">📖 English Language</option>
                    <option value="physics">⚡ Physics</option>
                    <option value="chemistry">🧪 Chemistry</option>
                    <option value="biology">🧬 Biology</option>
                    <option value="economics">📊 Economics</option>
                    <option value="government">🏛️ Government</option>
                    <option value="literature">📚 Literature in English</option>
                    <option value="commerce">💼 Commerce</option>
                    <option value="accounting">🪙 Financial Accounting</option>
                    <option value="crs">✝️ Christian Religious Studies (CRS)</option>
                    <option value="irs">☪️ Islamic Religious Studies (IRS)</option>
                    <option value="agric">🌱 Agricultural Science</option>
                    <option value="geography">🌍 Geography</option>
                    <option value="civic">🛡️ Civic Education</option>
                  </select>
                </div>
              )}

              {/* Goal Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Goal Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 50 Physics Calculations or Chemistry Titration Mastery"
                  value={newGoalTitle}
                  onChange={e => setNewGoalTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none focus:border-slate-800"
                />
              </div>

              {/* Target Questions Slider & Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Target Practice Questions</label>
                  <span className="font-mono font-black text-sm text-cyan-700 tabular-nums">
                    {newGoalTarget} Questions
                  </span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={newGoalTarget}
                  onChange={e => setNewGoalTarget(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-600 cursor-pointer"
                />

                <div className="flex items-center gap-1.5 flex-wrap">
                  {[20, 30, 40, 50, 75, 100].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setNewGoalTarget(val)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                        newGoalTarget === val
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {val} Qs
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Card Theme</label>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500' },
                    { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-500' },
                    { id: 'purple', label: 'Purple', bg: 'bg-purple-500' },
                    { id: 'amber', label: 'Amber', bg: 'bg-amber-500' },
                    { id: 'rose', label: 'Rose', bg: 'bg-rose-500' }
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setNewGoalColor(c.id as any)}
                      className={`w-7 h-7 rounded-full ${c.bg} cursor-pointer transition-transform ${
                        newGoalColor === c.id ? 'ring-2 ring-slate-900 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-black rounded-xl shadow-md cursor-pointer transition-all hover:scale-102"
                >
                  Activate Goal (+{Math.round(newGoalTarget * 1.2)} XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
