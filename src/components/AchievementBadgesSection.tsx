import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  Trophy, 
  Flame, 
  Target, 
  BookOpen, 
  ChevronRight, 
  Zap, 
  Share2, 
  X,
  Shield,
  Star,
  Check
} from 'lucide-react';
import { User, AchievementBadge, ExamResult } from '../types';
import { achievementManager } from '../utils/achievementBadges';

interface AchievementBadgesSectionProps {
  user: User | null;
  stats?: { questionsAnswered?: number; bestScore?: number };
  recentExams?: ExamResult[];
  onNavigate?: (view: string, extra?: any) => void;
  onOpenProfile?: () => void;
}

type CategoryFilter = 'ALL' | 'streak' | 'performance' | 'activity' | 'mastery' | 'UNLOCKED';

export const AchievementBadgesSection: React.FC<AchievementBadgesSectionProps> = ({
  user,
  stats,
  recentExams = [],
  onNavigate,
  onOpenProfile
}) => {
  const [badges, setBadges] = useState<AchievementBadge[]>(() => {
    return achievementManager.getAllBadges(user, stats, recentExams);
  });

  const [selectedFilter, setSelectedFilter] = useState<CategoryFilter>('ALL');
  const [activeBadgeModal, setActiveBadgeModal] = useState<AchievementBadge | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  // Refresh badges on mount and check for any newly earned badges
  useEffect(() => {
    const updated = achievementManager.getAllBadges(user, stats, recentExams);
    setBadges(updated);

    // Automatically check and award any newly unlocked badges
    achievementManager.checkAndAwardBadges(user, stats, recentExams);

    const handleBadgeUnlocked = () => {
      setBadges(achievementManager.getAllBadges(user, stats, recentExams));
    };

    const handleStreakOrXp = () => {
      achievementManager.checkAndAwardBadges(user, stats, recentExams);
      setBadges(achievementManager.getAllBadges(user, stats, recentExams));
    };

    window.addEventListener('studynaija_badge_unlocked', handleBadgeUnlocked);
    window.addEventListener('studynaija_streak_updated', handleStreakOrXp);
    window.addEventListener('studynaija_xp_updated', handleStreakOrXp);

    return () => {
      window.removeEventListener('studynaija_badge_unlocked', handleBadgeUnlocked);
      window.removeEventListener('studynaija_streak_updated', handleStreakOrXp);
      window.removeEventListener('studynaija_xp_updated', handleStreakOrXp);
    };
  }, [user, stats?.questionsAnswered, stats?.bestScore, recentExams?.length]);

  const summary = achievementManager.getBadgeSummary(badges);

  // Filtered badges
  const filteredBadges = badges.filter(b => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'UNLOCKED') return b.unlocked;
    return b.category === selectedFilter;
  });

  const handleShareBadge = (badge: AchievementBadge) => {
    const studentName = user?.name || 'Candidate';
    const text = `🇳🇬 Academic Milestone Achieved! I just unlocked the "${badge.title}" ${badge.icon} badge on StudyNaija! 🎯 Practice past questions and timed CBT mock exams with me at https://studynaija.ng`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getRarityBadgeStyle = (rarity: AchievementBadge['rarity'], unlocked: boolean) => {
    if (!unlocked) {
      return 'bg-slate-800 text-slate-400 border-slate-700';
    }
    switch (rarity) {
      case 'legendary':
        return 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
      case 'epic':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
      case 'rare':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]';
      case 'common':
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
    }
  };

  const getCardBorder = (rarity: AchievementBadge['rarity'], unlocked: boolean) => {
    if (!unlocked) {
      return 'border-slate-800/80 bg-slate-950/40 opacity-75 hover:opacity-100 hover:border-slate-700';
    }
    switch (rarity) {
      case 'legendary':
        return 'border-amber-500/50 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 shadow-[0_8px_25px_rgba(245,158,11,0.12)] hover:border-amber-400';
      case 'epic':
        return 'border-purple-500/50 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/30 shadow-[0_8px_25px_rgba(168,85,247,0.12)] hover:border-purple-400';
      case 'rare':
        return 'border-cyan-500/50 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30 shadow-[0_8px_25px_rgba(6,182,212,0.12)] hover:border-cyan-400';
      case 'common':
      default:
        return 'border-emerald-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 shadow-[0_8px_20px_rgba(16,185,129,0.08)] hover:border-emerald-400';
    }
  };

  return (
    <div id="achievement-badges-section" className="space-y-6">
      
      {/* SECTION HEADER & SUMMARY STATS BANNER */}
      <div className="bg-slate-950/90 rounded-3xl p-6 sm:p-7 border border-cyan-500/30 shadow-[0_10px_35px_rgba(6,182,212,0.12)] relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>OFFICIAL HONOURS & MILESTONES</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                {summary.unlockedCount} / {summary.total} UNLOCKED
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] tracking-tight flex items-center gap-2">
              <span>Achievement Badges & Citations</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
              Earn prestigious badges and bonus XP for study discipline, unbroken practice streaks, high CBT mock scores, and syllabus mastery.
            </p>
          </div>

          {/* Quick Profile View Button */}
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Shield className="w-4 h-4 fill-slate-950" />
              <span>View Profile & Showcase Reel →</span>
            </button>
          )}
        </div>

        {/* Overall Completion Progress Bar & Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 relative z-10">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-cyan-500/20 space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Badges Unlocked</div>
            <div className="text-xl sm:text-2xl font-black font-['Outfit'] text-white">
              {summary.unlockedCount} <span className="text-xs font-mono text-slate-400">/ {summary.total}</span>
            </div>
            <div className="text-[10px] text-cyan-400 font-bold">{summary.percentage}% Complete</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-500/20 space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Honours XP Earned</div>
            <div className="text-xl sm:text-2xl font-black font-['Outfit'] text-amber-400">
              +{summary.totalXpEarned.toLocaleString()} <span className="text-xs font-mono text-amber-300">XP</span>
            </div>
            <div className="text-[10px] text-slate-400">Boosts Academic Rank</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-purple-500/20 space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Featured Badges</div>
            <div className="text-xl sm:text-2xl font-black font-['Outfit'] text-purple-300 flex items-center gap-1.5">
              <span>{badges.filter(b => b.unlocked && (b.id === 'streak_5' || b.id === 'top_scorer')).length}</span>
              <span className="text-xs text-purple-400 font-mono">/ 2 Prime</span>
            </div>
            <div className="text-[10px] text-slate-400">5-Day Streak & Top Scorer</div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/20 space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Next Objective</div>
            <div className="text-xs font-extrabold text-emerald-300 line-clamp-1 pt-1">
              {badges.find(b => !b.unlocked)?.title || 'All Badges Mastered!'}
            </div>
            <div className="text-[10px] text-slate-400">
              {badges.find(b => !b.unlocked) ? `+${badges.find(b => !b.unlocked)?.rewardXp} XP reward` : 'Hall of Fame'}
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1 relative z-10">
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-cyan-500/20">
            <div 
              className="bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              style={{ width: `${summary.percentage}%` }}
            />
          </div>
        </div>

      </div>

      {/* FILTER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: 'ALL', label: `All Badges (${badges.length})` },
          { id: 'UNLOCKED', label: `Unlocked Only (${summary.unlockedCount})` },
          { id: 'streak', label: 'Daily Streaks 🔥' },
          { id: 'performance', label: 'Top Scores & CBT 🏆' },
          { id: 'activity', label: 'Drills & Goals 🎯' },
          { id: 'mastery', label: 'Syllabus & AI 📚' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id as CategoryFilter)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
              selectedFilter === tab.id
                ? 'bg-slate-900 text-cyan-300 border border-cyan-500/50 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* BADGES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map(badge => {
          const isUnlocked = badge.unlocked;

          return (
            <div
              key={badge.id}
              onClick={() => setActiveBadgeModal(badge)}
              className={`rounded-3xl p-5 border transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between ${getCardBorder(
                badge.rarity,
                isUnlocked
              )}`}
            >
              <div>
                {/* Card Top: Icon & Rarity Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="relative">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 shadow-md ${
                        isUnlocked
                          ? 'bg-slate-900 border border-current/30 shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                          : 'bg-slate-900/60 border border-slate-800 text-slate-500'
                      }`}
                    >
                      <span>{badge.icon}</span>
                    </div>
                    {isUnlocked ? (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black border-2 border-slate-950">
                        ✓
                      </span>
                    ) : (
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center border-2 border-slate-950">
                        <Lock className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[9px] font-mono font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRarityBadgeStyle(
                        badge.rarity,
                        isUnlocked
                      )}`}
                    >
                      {badge.rarity}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.2 rounded">
                      +{badge.rewardXp} XP
                    </span>
                  </div>
                </div>

                {/* Badge Title & Description */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h3
                      className={`font-black text-base font-['Outfit'] tracking-tight ${
                        isUnlocked ? 'text-white group-hover:text-cyan-300' : 'text-slate-400'
                      }`}
                    >
                      {badge.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Bottom: Progress or Unlocked Timestamp */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                {isUnlocked ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Unlocked {badge.unlockedAt || 'Recently'}</span>
                    </span>
                    <span className="text-cyan-400 font-mono text-[10px] group-hover:underline">
                      View Citation →
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Progress:</span>
                      <span className="font-bold text-slate-300">{badge.progressLabel}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-600 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(((badge.currentProgress || 0) / (badge.maxProgress || 1)) * 100)
                          )}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* DETAILED BADGE CITATION & SHARE MODAL */}
      {/* ========================================================================= */}
      {activeBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-md w-full overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)] text-white space-y-0">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-6 border-b border-slate-800 flex items-start justify-between relative">
              <div className="space-y-1">
                <span
                  className={`text-[9px] font-mono font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRarityBadgeStyle(
                    activeBadgeModal.rarity,
                    activeBadgeModal.unlocked
                  )}`}
                >
                  {activeBadgeModal.rarity} Honour
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white">
                  {activeBadgeModal.title}
                </h3>
              </div>

              <button
                onClick={() => setActiveBadgeModal(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-center">
              
              {/* Badge Emblem Display */}
              <div className="relative inline-block mx-auto">
                <div
                  className={`w-24 h-24 rounded-3xl mx-auto flex items-center justify-center text-5xl shadow-2xl border-2 ${
                    activeBadgeModal.unlocked
                      ? 'bg-slate-950 border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.25)]'
                      : 'bg-slate-950/80 border-slate-800 text-slate-500'
                  }`}
                >
                  <span>{activeBadgeModal.icon}</span>
                </div>
                {activeBadgeModal.unlocked && (
                  <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black border-2 border-slate-900 flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3 h-3" />
                    UNLOCKED
                  </span>
                )}
              </div>

              {/* Description & Requirement */}
              <div className="space-y-2">
                <p className="text-sm text-slate-200 leading-relaxed font-medium">
                  {activeBadgeModal.description}
                </p>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-400">Milestone Reward:</span>
                  <span className="font-mono font-black text-amber-400">+{activeBadgeModal.rewardXp} Academic XP</span>
                </div>
              </div>

              {/* Progress or Unlock Status */}
              {activeBadgeModal.unlocked ? (
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 font-semibold space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-200">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Official StudyNaija Academic Citation</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Conferred upon <strong>{user?.name || 'Scholar'}</strong> on {activeBadgeModal.unlockedAt || 'this session'}.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2 text-left">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Current Progress:</span>
                    <span className="font-bold text-cyan-300 font-mono">{activeBadgeModal.progressLabel}</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(((activeBadgeModal.currentProgress || 0) / (activeBadgeModal.maxProgress || 1)) * 100)
                        )}%`
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Complete practice sets and maintain your daily streak to achieve this badge!
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                {activeBadgeModal.unlocked ? (
                  <button
                    onClick={() => handleShareBadge(activeBadgeModal)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{copiedShare ? 'Copied to Clipboard!' : 'Share to WhatsApp Status'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveBadgeModal(null);
                      if (onNavigate) onNavigate('practice');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Practice Now to Unlock</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveBadgeModal(null)}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs transition-colors cursor-pointer border border-slate-700"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
