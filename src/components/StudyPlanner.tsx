import React, { useState, useEffect } from 'react';
import { 
  Target, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Sliders, 
  Flame, 
  Plus, 
  Minus, 
  Award,
  RefreshCw,
  Sparkles,
  Check
} from 'lucide-react';
import { User, Subject } from '../types';
import { INITIAL_SUBJECTS } from '../mockData';
import confetti from 'canvas-confetti';

interface SubjectGoal {
  subjectId: string;
  subjectName: string;
  icon?: string;
  color?: string;
  target: number;
  completed: number;
}

interface StudyPlannerProps {
  user: User | null;
  subjects?: Subject[];
  onNavigate: (view: string, extra?: any) => void;
}

const STORAGE_SUBJECT_GOALS_KEY = 'studynaija_subject_goals_v1';
const STORAGE_SUBJECT_COMPLETED_KEY = 'studynaija_subject_completed_v1';

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  user,
  subjects = INITIAL_SUBJECTS,
  onNavigate
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [activeDate, setActiveDate] = useState(todayStr);

  // Load or initialize subject goals from localStorage
  const [subjectGoals, setSubjectGoals] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SUBJECT_GOALS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    // Default goals per subject
    const defaults: Record<string, number> = {};
    subjects.forEach(sub => {
      defaults[sub.id] = 10; // Default 10 questions per subject daily goal
    });
    return defaults;
  });

  // Load or initialize completed question counts per subject for today
  const [subjectCompleted, setSubjectCompleted] = useState<Record<string, Record<string, number>>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SUBJECT_COMPLETED_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {};
  });

  // Save targets when changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SUBJECT_GOALS_KEY, JSON.stringify(subjectGoals));
    } catch {}
  }, [subjectGoals]);

  // Save completed counts when changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SUBJECT_COMPLETED_KEY, JSON.stringify(subjectCompleted));
    } catch {}
  }, [subjectCompleted]);

  // Listen for practice updates to auto-increment subject completion
  useEffect(() => {
    const handlePracticeCompleted = (e: any) => {
      const detail = e.detail;
      if (detail && detail.subjectId) {
        const subId = detail.subjectId;
        const count = detail.questionsCount || 1;
        
        setSubjectCompleted(prev => {
          const todayMap = { ...(prev[todayStr] || {}) };
          todayMap[subId] = (todayMap[subId] || 0) + count;
          return {
            ...prev,
            [todayStr]: todayMap
          };
        });
      }
    };

    window.addEventListener('studynaija_practice_completed', handlePracticeCompleted);
    return () => {
      window.removeEventListener('studynaija_practice_completed', handlePracticeCompleted);
    };
  }, [todayStr]);

  const todayCompletedMap = subjectCompleted[todayStr] || {};

  // Calculate totals
  const totalTarget = subjects.reduce((sum, sub) => sum + (subjectGoals[sub.id] || 10), 0);
  const totalCompleted = subjects.reduce((sum, sub) => sum + (todayCompletedMap[sub.id] || 0), 0);
  const overallPercentage = totalTarget > 0 ? Math.min(100, Math.round((totalCompleted / totalTarget) * 100)) : 0;

  const handleUpdateTarget = (subId: string, newTarget: number) => {
    const clamped = Math.max(0, Math.min(50, newTarget));
    setSubjectGoals(prev => ({
      ...prev,
      [subId]: clamped
    }));
  };

  const handleAddProgress = (subId: string, amount: number = 5) => {
    setSubjectCompleted(prev => {
      const todayMap = { ...(prev[todayStr] || {}) };
      const current = todayMap[subId] || 0;
      const updatedCount = Math.max(0, current + amount);
      todayMap[subId] = updatedCount;

      const newMap = {
        ...prev,
        [todayStr]: todayMap
      };

      // Check if newly reached target
      const target = subjectGoals[subId] || 10;
      if (current < target && updatedCount >= target) {
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch {}
      }

      return newMap;
    });
  };

  return (
    <div className="space-y-6">
      {/* Planner Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white border border-cyan-500/30 p-6 sm:p-8 shadow-[0_10px_35px_rgba(6,182,212,0.15)]">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold px-2.5 py-1 rounded-lg bg-cyan-950/90 border border-cyan-500/30 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>STUDY PLANNER // DAILY PER-SUBJECT GOALS</span>
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight text-white">
              Per-Subject Study Goals & Progress
            </h2>
            <p className="text-slate-300 text-sm max-w-xl">
              Set customized daily question goals for each JAMB & WAEC subject. Complete practice sessions to automatically fill progress bars and stay on top of your exam syllabus.
            </p>
          </div>

          {/* Overall Progress Widget */}
          <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-5 min-w-[260px] shadow-xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="text-cyan-300">Overall Daily Progress</span>
              <span className="font-mono text-emerald-400">{overallPercentage}% Done</span>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black font-mono text-white">
                {totalCompleted} <span className="text-sm font-normal text-slate-400">/ {totalTarget} Qs</span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {subjects.filter(sub => (todayCompletedMap[sub.id] || 0) >= (subjectGoals[sub.id] || 10)).length} / {subjects.length} Subjects Crushed
              </div>
            </div>
            {/* Main Progress Bar */}
            <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden p-0.5 border border-cyan-500/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-700 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subject Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map(subject => {
          const target = subjectGoals[subject.id] || 10;
          const completed = todayCompletedMap[subject.id] || 0;
          const percentage = target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 0;
          const isCompleted = completed >= target;

          return (
            <div
              key={subject.id}
              className={`rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden bg-slate-900/80 backdrop-blur-md shadow-lg ${
                isCompleted
                  ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20'
                  : 'border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              {/* Subject Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-md ${
                      isCompleted ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300' : 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                    }`}>
                      {subject.icon || '📚'}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base font-['Outfit'] line-clamp-1">
                        {subject.name}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">
                        {(subject as any).category || (subject.educationLevel ? subject.educationLevel.toUpperCase() : 'JAMB / WAEC')}
                      </span>
                    </div>
                  </div>

                  {isCompleted && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1 shadow-sm shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Done</span>
                    </span>
                  )}
                </div>

                {/* Progress Details */}
                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">Daily Goal Progress:</span>
                    <span className="font-mono font-bold text-cyan-400">{completed} / {target} Qs ({percentage}%)</span>
                  </div>

                  {/* Subject Progress Bar */}
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Target Adjuster & Actions */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {/* Target Step Buttons */}
                <div className="flex items-center gap-1 bg-slate-950 rounded-xl p-1 border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono px-2">Target:</span>
                  <button
                    onClick={() => handleUpdateTarget(subject.id, target - 5)}
                    className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                    title="Decrease target"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-mono font-bold text-white">
                    {target}
                  </span>
                  <button
                    onClick={() => handleUpdateTarget(subject.id, target + 5)}
                    className="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                    title="Increase target"
                  >
                    +
                  </button>
                </div>

                {/* Practice Now Button */}
                <button
                  onClick={() => onNavigate('practice', { subjectId: subject.id })}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all cursor-pointer"
                >
                  <span>Practice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
