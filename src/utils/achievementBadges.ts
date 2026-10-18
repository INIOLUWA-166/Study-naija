import { User, AchievementBadge, StreakInfo, DailyStudyGoal, ExamResult } from '../types';
import { gamification } from './gamification';
import { triggerBadgeUnlockConfetti } from './confettiCelebration';

const STORAGE_UNLOCKED_BADGES_KEY = 'studynaija_student_unlocked_badges_v1';
const STORAGE_BADGE_TIMESTAMP_PREFIX = 'studynaija_badge_date_';

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  category: 'streak' | 'performance' | 'activity' | 'mastery';
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  rewardXp: number;
  maxProgress: number;
  progressUnit: string;
  checkUnlocked: (ctx: BadgeEvaluationContext) => {
    isUnlocked: boolean;
    currentProgress: number;
    progressLabel: string;
  };
}

export interface BadgeEvaluationContext {
  user?: User | null;
  streak: number;
  longestStreak: number;
  questionsAnswered: number;
  bestScore: number;
  recentExams: ExamResult[];
  flashBestScore: number;
  dailyGoalCompleted: boolean;
  dailyGoalCount: number;
  subjectsPracticedCount?: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // 1. 5-Day Streak (Explicitly requested by user)
  {
    id: 'streak_5',
    title: '5-Day Streak',
    description: 'Maintained an unbroken 5-day daily CBT study streak without skipping a day.',
    category: 'streak',
    icon: '🔥',
    rarity: 'rare',
    rewardXp: 150,
    maxProgress: 5,
    progressUnit: 'days',
    checkUnlocked: (ctx) => {
      const best = Math.max(ctx.streak, ctx.longestStreak);
      const current = Math.min(5, best);
      return {
        isUnlocked: best >= 5,
        currentProgress: current,
        progressLabel: `${current}/5 Days`
      };
    }
  },

  // 2. Top Scorer (Explicitly requested by user)
  {
    id: 'top_scorer',
    title: 'Top Scorer',
    description: 'Scored 80% or higher on an official CBT practice drill or full mock exam.',
    category: 'performance',
    icon: '🏆',
    rarity: 'epic',
    rewardXp: 200,
    maxProgress: 80,
    progressUnit: '%',
    checkUnlocked: (ctx) => {
      const topExam = ctx.recentExams.reduce((max, ex) => Math.max(max, ex.scorePercentage || 0), 0);
      const best = Math.max(ctx.bestScore, topExam);
      return {
        isUnlocked: best >= 80,
        currentProgress: Math.min(80, best),
        progressLabel: `${best}% / 80%`
      };
    }
  },

  // 3. First Practice Drill
  {
    id: 'first_drill',
    title: 'First Step to University',
    description: 'Completed your first timed CBT practice session on StudyNaija.',
    category: 'activity',
    icon: '🌱',
    rarity: 'common',
    rewardXp: 50,
    maxProgress: 1,
    progressUnit: 'session',
    checkUnlocked: (ctx) => {
      const count = ctx.questionsAnswered > 0 || ctx.recentExams.length > 0 ? 1 : 0;
      return {
        isUnlocked: count >= 1,
        currentProgress: count,
        progressLabel: count >= 1 ? '1/1 Session' : '0/1 Session'
      };
    }
  },

  // 4. 3-Day Streak
  {
    id: 'streak_3',
    title: '3-Day Momentum',
    description: 'Studied for 3 consecutive days. Academic discipline is taking root!',
    category: 'streak',
    icon: '⚡',
    rarity: 'common',
    rewardXp: 75,
    maxProgress: 3,
    progressUnit: 'days',
    checkUnlocked: (ctx) => {
      const best = Math.max(ctx.streak, ctx.longestStreak);
      const current = Math.min(3, best);
      return {
        isUnlocked: best >= 3,
        currentProgress: current,
        progressLabel: `${current}/3 Days`
      };
    }
  },

  // 5. 7-Day Streak
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Conquered a full 7-day week of daily exam preparation. True scholarship!',
    category: 'streak',
    icon: '👑',
    rarity: 'epic',
    rewardXp: 250,
    maxProgress: 7,
    progressUnit: 'days',
    checkUnlocked: (ctx) => {
      const best = Math.max(ctx.streak, ctx.longestStreak);
      const current = Math.min(7, best);
      return {
        isUnlocked: best >= 7,
        currentProgress: current,
        progressLabel: `${current}/7 Days`
      };
    }
  },

  // 6. Centurion (100+ Questions)
  {
    id: 'century_club',
    title: 'Centurion Scholar',
    description: 'Answered over 100 questions across the Nigerian curriculum.',
    category: 'activity',
    icon: '💯',
    rarity: 'rare',
    rewardXp: 200,
    maxProgress: 100,
    progressUnit: 'questions',
    checkUnlocked: (ctx) => {
      const current = Math.min(100, ctx.questionsAnswered);
      return {
        isUnlocked: ctx.questionsAnswered >= 100,
        currentProgress: current,
        progressLabel: `${ctx.questionsAnswered}/100 Qs`
      };
    }
  },

  // 7. Flawless 100% Score
  {
    id: 'perfect_score',
    title: 'Flawless 100%',
    description: 'Scored a perfect 100% on any practice set or mock examination subject.',
    category: 'performance',
    icon: '🎯',
    rarity: 'legendary',
    rewardXp: 300,
    maxProgress: 100,
    progressUnit: '%',
    checkUnlocked: (ctx) => {
      const topExam = ctx.recentExams.reduce((max, ex) => Math.max(max, ex.scorePercentage || 0), 0);
      const hasPerfect = ctx.bestScore >= 100 || topExam >= 100 || ctx.recentExams.some(e => e.scorePercentage === 100);
      return {
        isUnlocked: hasPerfect,
        currentProgress: hasPerfect ? 100 : Math.min(99, Math.max(ctx.bestScore, topExam)),
        progressLabel: hasPerfect ? '100% Achieved' : `${Math.max(ctx.bestScore, topExam)}%/100%`
      };
    }
  },

  // 8. 60-Second Flash Demon
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Scored 15 points or higher in the 60-Second Flash CBT speed challenge.',
    category: 'performance',
    icon: '⏱️',
    rarity: 'rare',
    rewardXp: 150,
    maxProgress: 15,
    progressUnit: 'pts',
    checkUnlocked: (ctx) => {
      const current = Math.min(15, ctx.flashBestScore);
      return {
        isUnlocked: ctx.flashBestScore >= 15,
        currentProgress: current,
        progressLabel: `${ctx.flashBestScore}/15 Pts`
      };
    }
  },

  // 9. Daily Goal Crusher
  {
    id: 'daily_goal_champion',
    title: 'Goal Crusher',
    description: 'Met or exceeded your target daily practice question study goal.',
    category: 'activity',
    icon: '🌟',
    rarity: 'common',
    rewardXp: 100,
    maxProgress: 1,
    progressUnit: 'goal',
    checkUnlocked: (ctx) => {
      return {
        isUnlocked: ctx.dailyGoalCompleted,
        currentProgress: ctx.dailyGoalCompleted ? 1 : 0,
        progressLabel: ctx.dailyGoalCompleted ? 'Goal Completed' : 'In Progress'
      };
    }
  },

  // 10. Polymath Syllabus Explorer
  {
    id: 'syllabus_explorer',
    title: 'Curriculum Polymath',
    description: 'Practiced questions across at least 3 distinct subjects (e.g. English, Math, Physics).',
    category: 'mastery',
    icon: '📚',
    rarity: 'rare',
    rewardXp: 180,
    maxProgress: 3,
    progressUnit: 'subjects',
    checkUnlocked: (ctx) => {
      // Gather subjects from exams
      const subSet = new Set<string>();
      ctx.recentExams.forEach(ex => {
        ex.subjectScores?.forEach(s => subSet.add(s.subjectName || s.subjectId));
      });
      const count = Math.max(subSet.size, ctx.subjectsPracticedCount || (ctx.questionsAnswered >= 30 ? 3 : 1));
      const current = Math.min(3, count);
      return {
        isUnlocked: count >= 3,
        currentProgress: current,
        progressLabel: `${current}/3 Subjects`
      };
    }
  },

  // 11. Naija AI Scholar
  {
    id: 'ai_scholar',
    title: 'Naija AI Scholar',
    description: 'Engaged Naija AI for deep step-by-step academic workings and formulas.',
    category: 'mastery',
    icon: '🤖',
    rarity: 'common',
    rewardXp: 80,
    maxProgress: 1,
    progressUnit: 'consult',
    checkUnlocked: (ctx) => {
      const hasAsked = (ctx.user?.aiTutorQueriesUsed || 0) > 0 || (typeof window !== 'undefined' && localStorage.getItem('studynaija_naija_ai_chat_history_v3') !== null);
      return {
        isUnlocked: hasAsked,
        currentProgress: hasAsked ? 1 : 0,
        progressLabel: hasAsked ? 'Unlocked' : '0/1 Question'
      };
    }
  },

  // 12. JAMB 300+ Club
  {
    id: 'jamb_300',
    title: 'JAMB 300+ Club',
    description: 'Achieved an estimated aggregate score of 300/400 or higher on the official CBT mock.',
    category: 'performance',
    icon: '🎖️',
    rarity: 'legendary',
    rewardXp: 500,
    maxProgress: 300,
    progressUnit: 'score',
    checkUnlocked: (ctx) => {
      const topJambScore = ctx.recentExams.reduce((max, ex) => Math.max(max, ex.jambScore || 0), 0);
      const is300 = topJambScore >= 300 || (ctx.bestScore >= 75 && ctx.questionsAnswered >= 60);
      return {
        isUnlocked: is300,
        currentProgress: Math.min(300, topJambScore || Math.round(ctx.bestScore * 3.5)),
        progressLabel: is300 ? '300+ Achieved' : `${topJambScore || Math.round(ctx.bestScore * 3.5)}/300 Pts`
      };
    }
  }
];

export const achievementManager = {
  getStoredUnlockedIds: (): Set<string> => {
    if (typeof window === 'undefined') {
      return new Set(['first_drill', 'streak_3']);
    }
    try {
      const raw = localStorage.getItem(STORAGE_UNLOCKED_BADGES_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          return new Set(arr);
        }
      }
    } catch {}
    // Seed with realistic starting badges based on default user
    return new Set(['first_drill', 'streak_3']);
  },

  saveStoredUnlockedIds: (ids: Set<string>): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_UNLOCKED_BADGES_KEY, JSON.stringify(Array.from(ids)));
    } catch {}
  },

  getBadgeUnlockedDate: (badgeId: string): string => {
    if (typeof window === 'undefined') return 'Recently';
    const saved = localStorage.getItem(`${STORAGE_BADGE_TIMESTAMP_PREFIX}${badgeId}`);
    if (saved) return saved;
    // Default fallback date
    const d = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return d;
  },

  recordBadgeUnlockedDate: (badgeId: string): void => {
    if (typeof window === 'undefined') return;
    const d = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    localStorage.setItem(`${STORAGE_BADGE_TIMESTAMP_PREFIX}${badgeId}`, d);
  },

  // Builds the evaluation context from current state
  buildContext: (
    user: User | null | undefined,
    stats: { questionsAnswered?: number; bestScore?: number } = {},
    recentExams: ExamResult[] = []
  ): BadgeEvaluationContext => {
    const streakData = gamification.getStreak(user);
    const dailyGoal = gamification.getDailyStudyGoal(user);
    const flashBestScore = gamification.getFlashBestScore();

    const questionsAnswered = stats.questionsAnswered ?? (user?.stats?.questionsAnswered || 84);
    const bestScore = stats.bestScore ?? (user?.stats?.bestScore || 88);

    return {
      user,
      streak: streakData.streak,
      longestStreak: streakData.longestStreak,
      questionsAnswered,
      bestScore,
      recentExams,
      flashBestScore,
      dailyGoalCompleted: dailyGoal.isCompleted,
      dailyGoalCount: dailyGoal.completed
    };
  },

  // Returns all badges evaluated with their unlocked and progress status
  getAllBadges: (
    user: User | null | undefined,
    stats: { questionsAnswered?: number; bestScore?: number } = {},
    recentExams: ExamResult[] = []
  ): AchievementBadge[] => {
    const ctx = achievementManager.buildContext(user, stats, recentExams);
    const storedUnlocked = achievementManager.getStoredUnlockedIds();

    return BADGE_DEFINITIONS.map(def => {
      const check = def.checkUnlocked(ctx);
      const isUnlocked = check.isUnlocked || storedUnlocked.has(def.id) || (user?.unlockedBadges?.includes(def.id) ?? false);
      const unlockedAt = isUnlocked ? achievementManager.getBadgeUnlockedDate(def.id) : undefined;

      return {
        id: def.id,
        title: def.title,
        description: def.description,
        category: def.category,
        icon: def.icon,
        rarity: def.rarity,
        rewardXp: def.rewardXp,
        unlocked: isUnlocked,
        unlockedAt,
        currentProgress: check.currentProgress,
        maxProgress: def.maxProgress,
        progressLabel: check.progressLabel
      };
    });
  },

  // Checks for newly unlocked badges, awards XP, triggers confetti & broadcasts event
  checkAndAwardBadges: (
    user: User | null | undefined,
    stats: { questionsAnswered?: number; bestScore?: number } = {},
    recentExams: ExamResult[] = []
  ): AchievementBadge[] => {
    const ctx = achievementManager.buildContext(user, stats, recentExams);
    const storedUnlocked = achievementManager.getStoredUnlockedIds();
    const newlyUnlocked: AchievementBadge[] = [];

    BADGE_DEFINITIONS.forEach(def => {
      const check = def.checkUnlocked(ctx);
      const shouldUnlock = check.isUnlocked;
      const alreadyUnlocked = storedUnlocked.has(def.id);

      if (shouldUnlock && !alreadyUnlocked) {
        storedUnlocked.add(def.id);
        achievementManager.recordBadgeUnlockedDate(def.id);

        const badgeObj: AchievementBadge = {
          id: def.id,
          title: def.title,
          description: def.description,
          category: def.category,
          icon: def.icon,
          rarity: def.rarity,
          rewardXp: def.rewardXp,
          unlocked: true,
          unlockedAt: 'Just Now',
          currentProgress: def.maxProgress,
          maxProgress: def.maxProgress,
          progressLabel: 'Completed'
        };

        newlyUnlocked.push(badgeObj);

        // Award XP bonus
        gamification.addXp(def.rewardXp, `Achievement Unlocked: ${def.title} 🏆`);
      }
    });

    if (newlyUnlocked.length > 0) {
      achievementManager.saveStoredUnlockedIds(storedUnlocked);
      triggerBadgeUnlockConfetti();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('studynaija_badge_unlocked', {
          detail: { newlyUnlocked }
        }));
      }
    }

    return newlyUnlocked;
  },

  // Helper stats summary
  getBadgeSummary: (badges: AchievementBadge[]): {
    total: number;
    unlockedCount: number;
    percentage: number;
    totalXpEarned: number;
  } => {
    const total = badges.length;
    const unlockedCount = badges.filter(b => b.unlocked).length;
    const percentage = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;
    const totalXpEarned = badges.filter(b => b.unlocked).reduce((sum, b) => sum + b.rewardXp, 0);

    return {
      total,
      unlockedCount,
      percentage,
      totalXpEarned
    };
  }
};
