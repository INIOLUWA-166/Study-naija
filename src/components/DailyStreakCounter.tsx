import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Calendar, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Trophy, 
  ShieldCheck, 
  Clock, 
  RotateCcw,
  Zap,
  BookOpen,
  Award,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  History
} from 'lucide-react';
import { User, StreakInfo, PracticeTestRecord } from '../types';
import { gamification } from '../utils/gamification';
import confetti from 'canvas-confetti';
import { triggerStreakMilestoneConfetti, isStreakMilestone, getStreakMilestoneTitle } from '../utils/confettiCelebration';

interface DailyStreakCounterProps {
  user: User | null;
  onNavigate: (view: string, extra?: any) => void;
}

export const DailyStreakCounter: React.FC<DailyStreakCounterProps> = ({
  user,
  onNavigate
}) => {
  const [streakInfo, setStreakInfo] = useState<StreakInfo>(() => gamification.getStreak(user));
  const [justIncremented, setJustIncremented] = useState(false);
  const [milestoneCelebration, setMilestoneCelebration] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  // Listen for streak updates from practice sessions and mock exams
  useEffect(() => {
    const handleStreakUpdate = (e: any) => {
      const updated = gamification.getStreak(user);
      setStreakInfo(updated);
      setJustIncremented(true);

      const isMilestone = e.detail?.isMilestone || isStreakMilestone(updated.streak);
      if (isMilestone) {
        const title = e.detail?.milestoneTitle || getStreakMilestoneTitle(updated.streak);
        setMilestoneCelebration(title);
        triggerStreakMilestoneConfetti(updated.streak);
      } else {
        try {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {}
      }

      const timer = setTimeout(() => {
        setJustIncremented(false);
        setMilestoneCelebration(null);
      }, 5000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('studynaija_streak_updated', handleStreakUpdate);
    return () => {
      window.removeEventListener('studynaija_streak_updated', handleStreakUpdate);
    };
  }, [user]);

  // Test trigger to simulate completing a practice test and incrementing streak
  const handleTestCompletePracticeTest = () => {
    gamification.recordPracticeSessionCompletion(10, {
      subjectName: 'Use of English (CBT Drill)',
      scorePercent: 90,
      testType: 'Practice Test'
    });
  };

  const hasCompletedToday = (streakInfo.todayTestsCount || 0) >= 1 || streakInfo.preservedToday;

  // Streak Milestones Calculation
  const milestones = [
    { days: 3, label: '3-Day Scholar', xp: 50 },
    { days: 7, label: '7-Day Flame Master', xp: 100 },
    { days: 14, label: '14-Day UTME Ace', xp: 250 },
    { days: 30, label: '30-Day Legend', xp: 500 }
  ];

  const nextMilestone = milestones.find(m => m.days > streakInfo.streak) || milestones[milestones.length - 1];
  const prevMilestoneDays = milestones.filter(m => m.days <= streakInfo.streak).slice(-1)[0]?.days || 0;
  const progressToNext = nextMilestone.days > prevMilestoneDays
    ? Math.min(100, Math.round(((streakInfo.streak - prevMilestoneDays) / (nextMilestone.days - prevMilestoneDays)) * 100))
    : 100;

  return (
    <section 
      id="daily-learning-streak-tracker" 
      aria-label="Daily Learning Streak Tracker"
      className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950/80 text-white border-2 border-amber-500/40 p-6 sm:p-7 shadow-[0_10px_35px_rgba(245,158,11,0.15)] space-y-6"
    >
      {/* Background Glows & Accent Matrix */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Top Banner: Milestone Celebration */}
      {milestoneCelebration && (
        <div className="relative z-10 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/30 via-yellow-500/30 to-orange-500/30 border-2 border-amber-400 text-amber-100 text-xs font-black shadow-[0_0_25px_rgba(245,158,11,0.4)] animate-bounce flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-300 shrink-0" />
            <span>🎉 MILESTONE UNLOCKED: {milestoneCelebration}</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
            Streak Bonus Active!
          </span>
        </div>
      )}

      {/* Main Header: Title, Streak Counter, Flame Reactor */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        
        {/* Left: Flame Reactor + Streak Stats */}
        <div className="flex items-start sm:items-center gap-4">
          
          {/* Flame Icon with Pulsing Halo */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl bg-gradient-to-br from-amber-500/25 via-orange-500/30 to-rose-500/25 border-2 border-amber-400/60 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)]">
            <div className="absolute inset-1 rounded-xl bg-slate-950/80 backdrop-blur-xs flex items-center justify-center overflow-hidden">
              <div className="absolute -bottom-2 w-12 h-12 bg-gradient-to-t from-orange-600 via-amber-500 to-yellow-300 rounded-full blur-md animate-pulse opacity-80" />
              <Flame className={`w-9 h-9 sm:w-11 sm:h-11 text-amber-400 fill-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.9)] relative z-10 ${
                justIncremented ? 'scale-125 animate-bounce text-yellow-300 fill-yellow-300' : 'animate-pulse'
              }`} />
            </div>
            <div className="absolute -inset-1 rounded-2xl border border-amber-400/30 animate-[spin_12s_linear_infinite] pointer-events-none" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-widest text-amber-400 font-black px-2.5 py-0.5 rounded-md bg-amber-950/90 border border-amber-500/40 flex items-center gap-1.5 shadow-xs">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>DAILY LEARNING STREAK TRACKER</span>
              </span>

              {justIncremented && (
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/60 px-2 py-0.5 rounded-full animate-pulse">
                  +1 Day Added! 🔥
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <h2 className="text-3xl sm:text-4xl font-black font-['Outfit'] tracking-tight text-white">
                {streakInfo.streak} <span className="text-amber-400 text-2xl sm:text-3xl">Days</span>
              </h2>
              <span className="text-xs sm:text-sm font-semibold text-slate-300">
                Consecutive Learning Streak
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Tracks how many consecutive days you have completed at least one CBT practice test or mock exam.
            </p>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('practice')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-xs transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:scale-102 flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-slate-950" />
            <span>Launch Practice Test</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
          </button>

          <button
            onClick={handleTestCompletePracticeTest}
            className="px-3 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 text-amber-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Simulate completing 1 practice test right now to test streak increment"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Complete Test (+1 Streak)</span>
          </button>
        </div>
      </div>

      {/* TODAY'S PRACTICE TEST STATUS CARD */}
      <div className={`relative z-10 p-4 rounded-2xl border transition-all ${
        hasCompletedToday
          ? 'bg-emerald-950/40 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
          : 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-start sm:items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              hasCompletedToday
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/50'
                : 'bg-amber-500/20 text-amber-400 border border-amber-400/50 animate-pulse'
            }`}>
              {hasCompletedToday ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Clock className="w-5 h-5 text-amber-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${
                  hasCompletedToday ? 'text-emerald-300' : 'text-amber-300'
                }`}>
                  {hasCompletedToday
                    ? `✓ Today's Practice Test: Completed (${streakInfo.todayTestsCount || 1} test${(streakInfo.todayTestsCount || 1) > 1 ? 's' : ''} taken today)`
                    : "⏳ Today's Practice Test: Pending"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300">
                  Requirement: ≥ 1 Test / Day
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-0.5">
                {hasCompletedToday
                  ? `Awesome consistency! Your streak is safely preserved for today. Longest recorded streak: ${streakInfo.longestStreak} days.`
                  : `You haven't completed a practice test today yet. Solve at least one past question set before 11:59 PM to keep your ${streakInfo.streak}-day streak alive!`}
              </p>
            </div>
          </div>

          {!hasCompletedToday && (
            <button
              onClick={() => onNavigate('practice')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md"
            >
              <span>Take Test Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 7-DAY PRACTICE TEST HISTORY CALENDAR MATRIX */}
      <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 shadow-inner space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider font-['Outfit']">
              Weekly Practice Test Activity Log
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span>
              Total Practice Tests Taken: <strong className="text-amber-400 font-bold">{streakInfo.totalSessionsCompleted}</strong>
            </span>
            <span>•</span>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <History className="w-3 h-3" />
              <span>{showLogs ? 'Hide Recent Tests' : 'View Test Details'}</span>
              {showLogs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* 7-Day Day Cards Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {streakInfo.history.map(day => {
            const hasTest = day.completed || (day.testsCompletedCount && day.testsCompletedCount > 0);
            return (
              <div
                key={day.date}
                className={`relative rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center transition-all border ${
                  hasTest
                    ? 'bg-gradient-to-b from-amber-500/25 to-orange-500/10 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : day.isToday
                      ? 'bg-slate-900 border-amber-400/80 ring-2 ring-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : day.isFuture
                        ? 'bg-slate-950/40 border-slate-850 opacity-50'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                }`}
              >
                {/* Day of Week */}
                <div className={`text-[10px] sm:text-xs font-bold font-mono uppercase ${
                  hasTest ? 'text-amber-300' : day.isToday ? 'text-amber-200' : 'text-slate-400'
                }`}>
                  {day.dayShort}
                </div>

                {/* Day Number */}
                <div className="text-sm sm:text-lg font-black font-mono my-1 text-white">
                  {day.dayNumber}
                </div>

                {/* Status Indicator Icon */}
                <div className="flex justify-center mt-1">
                  {hasTest ? (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-xs">
                      <Flame className="w-3 h-3 fill-slate-950 text-slate-950" />
                    </div>
                  ) : day.isToday ? (
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700" />
                  )}
                </div>

                {/* Tests Count Subtext */}
                <div className="mt-1 text-[9px] font-mono text-slate-400 hidden sm:block">
                  {hasTest 
                    ? `${day.testsCompletedCount || 1} Test${(day.testsCompletedCount || 1) > 1 ? 's' : ''}` 
                    : day.isToday 
                      ? 'Pending' 
                      : day.isFuture 
                        ? 'Upcoming' 
                        : 'No Test'}
                </div>

                {/* Today Badge */}
                {day.isToday && (
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-amber-500 text-[8px] font-black uppercase text-slate-950 tracking-widest">
                    Today
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Milestone Progress Bar */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Next Streak Milestone: <strong className="text-amber-300">{nextMilestone.label} ({nextMilestone.days} Days)</strong></span>
            </span>
            <span className="font-mono text-amber-400 font-bold text-[11px]">
              +{nextMilestone.xp} Bonus XP
            </span>
          </div>

          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 border border-amber-500/20">
            <div 
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ width: `${progressToNext}%` }}
            />
          </div>
        </div>

        {/* Expandable Recent Practice Tests Log */}
        {showLogs && (
          <div className="pt-3 border-t border-slate-800/80 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
              <span>Recent Completed Practice Tests Feeding Your Streak:</span>
              <span className="text-[10px] font-mono text-slate-400">Auto-synced</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {(streakInfo.recentTestLogs && streakInfo.recentTestLogs.length > 0) ? (
                streakInfo.recentTestLogs.map(log => (
                  <div 
                    key={log.id} 
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{log.subjectName}</span>
                          <span className="text-[10px] text-amber-400 font-mono">({log.testType})</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {log.questionsCount} questions solved • Score: <strong className="text-emerald-400">{log.scorePercent}%</strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono text-right">
                      {new Date(log.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  No practice test logs yet today. Take a quick drill to start your record!
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
