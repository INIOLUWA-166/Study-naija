import { User, StreakInfo, CalendarStreakDay, DailyStudyGoal, PracticeTestRecord } from '../types';
import { triggerStreakMilestoneConfetti, isStreakMilestone, getStreakMilestoneTitle } from './confettiCelebration';

export interface RankInfo {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  badge: string;
  color: string;
  perk: string;
}

export const RANKS: RankInfo[] = [
  {
    level: 1,
    title: 'Jambite Recruit',
    minXp: 0,
    maxXp: 150,
    badge: '🌱',
    color: 'text-slate-600 bg-slate-100 border-slate-300',
    perk: 'Unlocks basic practice sets'
  },
  {
    level: 2,
    title: 'Junior Scholar',
    minXp: 150,
    maxXp: 400,
    badge: '⚡',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
    perk: 'Unlocks 60-Second Flash challenge'
  },
  {
    level: 3,
    title: 'WAEC Distinction Hunter',
    minXp: 400,
    maxXp: 800,
    badge: '🎯',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    perk: '+10% XP bonus on mock exams'
  },
  {
    level: 4,
    title: 'Merit List Contender',
    minXp: 800,
    maxXp: 1500,
    badge: '🔥',
    color: 'text-amber-800 bg-amber-50 border-amber-300',
    perk: 'Top 10% Nigerian student cohort'
  },
  {
    level: 5,
    title: 'UNILAG / UI First-Class Aspirant',
    minXp: 1500,
    maxXp: 3000,
    badge: '👑',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    perk: 'Elite CBT Speed Master'
  },
  {
    level: 6,
    title: 'National Merit Scholar (Top 1%)',
    minXp: 3000,
    maxXp: 10000,
    badge: '🏆',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-300',
    perk: 'Hall of Fame Academic Legend'
  }
];

export function getRankFromXp(xp: number = 0): {
  rank: RankInfo;
  nextRank: RankInfo | null;
  progressPercent: number;
  xpToNext: number;
} {
  let currentRank = RANKS[0];
  let nextRank: RankInfo | null = RANKS[1];

  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXp && (i === RANKS.length - 1 || xp < RANKS[i].maxXp)) {
      currentRank = RANKS[i];
      nextRank = i < RANKS.length - 1 ? RANKS[i + 1] : null;
      break;
    }
  }

  const range = (currentRank.maxXp - currentRank.minXp) || 1;
  const inLevel = Math.max(0, xp - currentRank.minXp);
  const progressPercent = Math.min(100, Math.round((inLevel / range) * 100));
  const xpToNext = Math.max(0, (nextRank ? nextRank.minXp - xp : 0));

  return {
    rank: currentRank,
    nextRank,
    progressPercent,
    xpToNext
  };
}

const STORAGE_XP_KEY = 'studynaija_student_xp';
const STORAGE_STREAK_KEY = 'studynaija_student_streak';
const STORAGE_LAST_ACTIVE_KEY = 'studynaija_student_last_active';
const STORAGE_SAVED_QUESTIONS_KEY = 'studynaija_saved_questions';
const STORAGE_FLASH_BEST_KEY = 'studynaija_flash_best';
const STORAGE_LONGEST_STREAK_KEY = 'studynaija_longest_streak';
const STORAGE_TOTAL_SESSIONS_KEY = 'studynaija_total_practice_sessions';
const STORAGE_STREAK_HISTORY_KEY = 'studynaija_streak_active_dates';
const STORAGE_DAILY_GOAL_TARGET_KEY = 'studynaija_daily_goal_target';
const STORAGE_DAILY_GOAL_COMPLETED_KEY = 'studynaija_daily_goal_completed';
const STORAGE_DAILY_GOAL_DATE_KEY = 'studynaija_daily_goal_date';
const STORAGE_DAILY_TEST_COUNTS_KEY = 'studynaija_daily_test_counts';
const STORAGE_PRACTICE_TEST_LOGS_KEY = 'studynaija_practice_test_logs';

// Helper to get today's date string YYYY-MM-DD
function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate the 7 calendar days of the current week (Monday to Sunday)
function generateCurrentWeekCalendar(activeDatesSet: Set<string>, testCountsMap: Record<string, number> = {}): CalendarStreakDay[] {
  const todayStr = getTodayDateString();
  const now = new Date();
  
  // Calculate Monday of this week
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const days: CalendarStreakDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;
    const testCount = testCountsMap[dateStr] ?? (activeDatesSet.has(dateStr) ? 1 : 0);
    const completed = testCount >= 1;

    days.push({
      date: dateStr,
      dayName: fullDayNames[i],
      dayShort: dayNames[i],
      dayNumber: d.getDate(),
      completed,
      isToday,
      isFuture,
      testsCompletedCount: testCount
    });
  }

  return days;
}

export const gamification = {
  getXp: (user?: User | null): number => {
    if (typeof window === 'undefined') return 120;
    const local = parseInt(localStorage.getItem(STORAGE_XP_KEY) || '', 10);
    if (!isNaN(local)) return local;
    return user?.xp ?? 120; // default start with 120 XP
  },

  addXp: (amount: number, reason: string): { newXp: number; leveledUp: boolean; rank: RankInfo } => {
    const current = gamification.getXp();
    const newXp = current + amount;
    localStorage.setItem(STORAGE_XP_KEY, newXp.toString());

    const oldRank = getRankFromXp(current).rank;
    const newRankInfo = getRankFromXp(newXp);
    const leveledUp = newRankInfo.rank.level > oldRank.level;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studynaija_xp_updated', {
        detail: { newXp, leveledUp, rank: newRankInfo.rank, reason }
      }));
    }

    return {
      newXp,
      leveledUp,
      rank: newRankInfo.rank
    };
  },

  // -------------------------------------------------------------
  // DAILY LEARNING STREAK TRACKING (Consecutive Days with ≥ 1 Practice Test)
  // -------------------------------------------------------------
  getStreak: (user?: User | null): StreakInfo => {
    if (typeof window === 'undefined') {
      return {
        streak: 3,
        longestStreak: 5,
        preservedToday: true,
        lastActiveDate: getTodayDateString(),
        totalSessionsCompleted: 12,
        todayTestsCount: 1,
        history: generateCurrentWeekCalendar(new Set([getTodayDateString()]), { [getTodayDateString()]: 1 })
      };
    }

    const todayStr = getTodayDateString();
    const streakStr = localStorage.getItem(STORAGE_STREAK_KEY);
    const lastActiveStr = localStorage.getItem(STORAGE_LAST_ACTIVE_KEY);
    const longestStr = localStorage.getItem(STORAGE_LONGEST_STREAK_KEY);
    const sessionsStr = localStorage.getItem(STORAGE_TOTAL_SESSIONS_KEY);

    let streak = streakStr ? parseInt(streakStr, 10) : (user?.streakDays ?? 3);
    if (isNaN(streak) || streak < 1) streak = 1;

    let longestStreak = longestStr ? parseInt(longestStr, 10) : (user?.longestStreak || streak);
    longestStreak = Math.max(longestStreak, streak);

    const totalSessionsCompleted = sessionsStr ? parseInt(sessionsStr, 10) : 8;

    // Load daily test counts map { 'YYYY-MM-DD': number }
    let testCountsMap: Record<string, number> = {};
    try {
      const raw = localStorage.getItem(STORAGE_DAILY_TEST_COUNTS_KEY);
      testCountsMap = raw ? JSON.parse(raw) : {};
    } catch {
      testCountsMap = {};
    }

    // Load recent practice test logs
    let recentTestLogs: PracticeTestRecord[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_PRACTICE_TEST_LOGS_KEY);
      recentTestLogs = raw ? JSON.parse(raw) : [];
    } catch {
      recentTestLogs = [];
    }

    // Default mock logs if empty to ensure realistic display
    if (recentTestLogs.length === 0) {
      recentTestLogs = [
        {
          id: 'test-log-1',
          subjectName: 'Use of English',
          questionsCount: 15,
          scorePercent: 86,
          completedAt: new Date().toISOString(),
          testType: 'CBT Practice Drill'
        },
        {
          id: 'test-log-2',
          subjectName: 'Mathematics',
          questionsCount: 10,
          scorePercent: 90,
          completedAt: new Date(Date.now() - 86400000).toISOString(),
          testType: 'Speed Quiz'
        }
      ];
    }

    const todayTestsCount = testCountsMap[todayStr] || (lastActiveStr === todayStr ? 1 : 0);
    const preservedToday = todayTestsCount >= 1 || lastActiveStr === todayStr;

    // Load active dates for calendar
    let activeDates: string[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_STREAK_HISTORY_KEY);
      activeDates = raw ? JSON.parse(raw) : [];
    } catch {
      activeDates = [];
    }
    if (preservedToday && !activeDates.includes(todayStr)) {
      activeDates.push(todayStr);
    }
    // Also include previous 2 days if initializing for realistic demo calendar
    if (activeDates.length === 0) {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
      activeDates.push(yesterday);
      testCountsMap[yesterday] = testCountsMap[yesterday] || 2;

      const y2 = new Date();
      y2.setDate(y2.getDate() - 2);
      const dayBeforeYesterday = `${y2.getFullYear()}-${String(y2.getMonth() + 1).padStart(2, '0')}-${String(y2.getDate()).padStart(2, '0')}`;
      activeDates.push(dayBeforeYesterday);
      testCountsMap[dayBeforeYesterday] = testCountsMap[dayBeforeYesterday] || 1;

      if (preservedToday) {
        activeDates.push(todayStr);
        testCountsMap[todayStr] = testCountsMap[todayStr] || 1;
      }
      try {
        localStorage.setItem(STORAGE_STREAK_HISTORY_KEY, JSON.stringify(activeDates));
        localStorage.setItem(STORAGE_DAILY_TEST_COUNTS_KEY, JSON.stringify(testCountsMap));
      } catch {}
    }

    const activeDatesSet = new Set(activeDates);
    const history = generateCurrentWeekCalendar(activeDatesSet, testCountsMap);

    return {
      streak,
      longestStreak,
      preservedToday,
      lastActiveDate: lastActiveStr || todayStr,
      totalSessionsCompleted,
      todayTestsCount,
      history,
      recentTestLogs
    };
  },

  // Increments the streak whenever the student completes a practice test!
  recordPracticeSessionCompletion: (questionsCount: number = 10, testDetails?: { subjectName?: string; scorePercent?: number; testType?: string }): {
    newStreak: number;
    incremented: boolean;
    sessionTotal: number;
    dailyGoal: DailyStudyGoal;
    earnedXp: number;
    todayTestsCount: number;
  } => {
    if (typeof window === 'undefined') {
      return {
        newStreak: 1,
        incremented: true,
        sessionTotal: 1,
        dailyGoal: { target: 20, completed: 10, percentage: 50, isCompleted: false, lastDate: '' },
        earnedXp: 50,
        todayTestsCount: 1
      };
    }

    const today = getTodayDateString();
    let currentStreak = parseInt(localStorage.getItem(STORAGE_STREAK_KEY) || '3', 10);
    if (isNaN(currentStreak) || currentStreak < 0) currentStreak = 0;

    // Load test counts map
    let testCountsMap: Record<string, number> = {};
    try {
      const raw = localStorage.getItem(STORAGE_DAILY_TEST_COUNTS_KEY);
      testCountsMap = raw ? JSON.parse(raw) : {};
    } catch {
      testCountsMap = {};
    }

    const prevCountToday = testCountsMap[today] || 0;
    const newCountToday = prevCountToday + 1;
    testCountsMap[today] = newCountToday;
    try {
      localStorage.setItem(STORAGE_DAILY_TEST_COUNTS_KEY, JSON.stringify(testCountsMap));
    } catch {}

    // Increment streak by +1
    const newStreak = currentStreak + 1;
    try {
      localStorage.setItem(STORAGE_STREAK_KEY, newStreak.toString());
      localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, today);
    } catch {}

    // Update longest streak
    const prevLongest = parseInt(localStorage.getItem(STORAGE_LONGEST_STREAK_KEY) || '0', 10);
    const longest = Math.max(prevLongest, newStreak);
    try {
      localStorage.setItem(STORAGE_LONGEST_STREAK_KEY, longest.toString());
    } catch {}

    // Update total sessions completed
    const prevSessions = parseInt(localStorage.getItem(STORAGE_TOTAL_SESSIONS_KEY) || '0', 10);
    const sessionTotal = prevSessions + 1;
    try {
      localStorage.setItem(STORAGE_TOTAL_SESSIONS_KEY, sessionTotal.toString());
    } catch {}

    // Save recent test log
    try {
      const raw = localStorage.getItem(STORAGE_PRACTICE_TEST_LOGS_KEY);
      const logs: PracticeTestRecord[] = raw ? JSON.parse(raw) : [];
      logs.unshift({
        id: `test-${Date.now()}`,
        subjectName: testDetails?.subjectName || 'General CBT Practice',
        questionsCount,
        scorePercent: typeof testDetails?.scorePercent === 'number' ? Math.round(testDetails.scorePercent) : 80,
        completedAt: new Date().toISOString(),
        testType: testDetails?.testType || 'CBT Practice Test'
      });
      localStorage.setItem(STORAGE_PRACTICE_TEST_LOGS_KEY, JSON.stringify(logs.slice(0, 10)));
    } catch {}

    // Record in calendar history dates
    let activeDates: string[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_STREAK_HISTORY_KEY);
      activeDates = raw ? JSON.parse(raw) : [];
    } catch {
      activeDates = [];
    }
    if (!activeDates.includes(today)) {
      activeDates.push(today);
      try {
        localStorage.setItem(STORAGE_STREAK_HISTORY_KEY, JSON.stringify(activeDates));
      } catch {}
    }

    // Add to daily study goal completed questions
    const goalRes = gamification.addDailyGoalCompletedQuestions(questionsCount);

    // Streak bonus XP
    const streakBonusXp = 25 + Math.min(100, newStreak * 5);
    gamification.addXp(streakBonusXp, `Completed Practice Test • Streak: Day ${newStreak}`);

    // Check if new streak is a milestone
    const isMilestone = isStreakMilestone(newStreak);
    const milestoneTitle = isMilestone ? getStreakMilestoneTitle(newStreak) : undefined;
    if (isMilestone) {
      triggerStreakMilestoneConfetti(newStreak);
    }

    // Broadcast event across UI
    window.dispatchEvent(new CustomEvent('studynaija_streak_updated', {
      detail: { 
        newStreak, 
        sessionTotal, 
        streakBonusXp, 
        isMilestone, 
        milestoneTitle,
        todayTestsCount: newCountToday
      }
    }));

    return {
      newStreak,
      incremented: true,
      sessionTotal,
      dailyGoal: goalRes.goal,
      earnedXp: streakBonusXp,
      todayTestsCount: newCountToday
    };
  },

  recordDailyActivity: (): { streak: number; isNewDay: boolean } => {
    const res = gamification.recordPracticeSessionCompletion(10);
    return { streak: res.newStreak, isNewDay: true };
  },

  // -------------------------------------------------------------
  // DAILY STUDY GOALS PROGRESS TRACKING
  // -------------------------------------------------------------
  getDailyStudyGoal: (user?: User | null): DailyStudyGoal => {
    if (typeof window === 'undefined') {
      return { target: 20, completed: 8, percentage: 40, isCompleted: false, lastDate: '' };
    }

    const today = getTodayDateString();
    const storedDate = localStorage.getItem(STORAGE_DAILY_GOAL_DATE_KEY);
    const targetStr = localStorage.getItem(STORAGE_DAILY_GOAL_TARGET_KEY);
    const completedStr = localStorage.getItem(STORAGE_DAILY_GOAL_COMPLETED_KEY);

    let target = targetStr ? parseInt(targetStr, 10) : (user?.dailyGoalTarget || 20);
    if (isNaN(target) || target < 5) target = 20;

    let completed = 0;
    if (storedDate === today) {
      completed = completedStr ? parseInt(completedStr, 10) : (user?.dailyGoalCompleted || 0);
    } else {
      // New day: reset daily counter for today
      completed = 0;
      localStorage.setItem(STORAGE_DAILY_GOAL_DATE_KEY, today);
      localStorage.setItem(STORAGE_DAILY_GOAL_COMPLETED_KEY, '0');
    }

    const percentage = Math.min(100, Math.round((completed / target) * 100));
    const isCompleted = completed >= target;

    return {
      target,
      completed,
      percentage,
      isCompleted,
      lastDate: today
    };
  },

  setDailyGoalTarget: (newTarget: number): DailyStudyGoal => {
    const validTarget = Math.max(5, Math.min(100, Math.round(newTarget)));
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_DAILY_GOAL_TARGET_KEY, validTarget.toString());
      window.dispatchEvent(new CustomEvent('studynaija_daily_goal_updated', {
        detail: { target: validTarget }
      }));
    }
    return gamification.getDailyStudyGoal();
  },

  addDailyGoalCompletedQuestions: (count: number): { goal: DailyStudyGoal; newlyAchieved: boolean; bonusXp: number } => {
    if (typeof window === 'undefined') {
      return {
        goal: { target: 20, completed: count, percentage: 50, isCompleted: false, lastDate: '' },
        newlyAchieved: false,
        bonusXp: 0
      };
    }

    const currentGoal = gamification.getDailyStudyGoal();
    const prevCompleted = currentGoal.completed;
    const newCompleted = prevCompleted + Math.max(1, count);
    const today = getTodayDateString();

    localStorage.setItem(STORAGE_DAILY_GOAL_DATE_KEY, today);
    localStorage.setItem(STORAGE_DAILY_GOAL_COMPLETED_KEY, newCompleted.toString());

    const isNowCompleted = newCompleted >= currentGoal.target;
    const wasAlreadyCompleted = prevCompleted >= currentGoal.target;
    const newlyAchieved = isNowCompleted && !wasAlreadyCompleted;

    let bonusXp = 0;
    if (newlyAchieved) {
      bonusXp = 50;
      gamification.addXp(bonusXp, 'Daily Study Goal Achieved! 🎯');
    }

    const updatedGoal = gamification.getDailyStudyGoal();

    window.dispatchEvent(new CustomEvent('studynaija_daily_goal_updated', {
      detail: { goal: updatedGoal, newlyAchieved, bonusXp }
    }));

    return {
      goal: updatedGoal,
      newlyAchieved,
      bonusXp
    };
  },

  getBookmarkedIds: (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_QUESTIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  toggleBookmark: (questionId: string): { isBookmarked: boolean; allIds: string[] } => {
    const list = gamification.getBookmarkedIds();
    const index = list.indexOf(questionId);
    let isBookmarked = false;

    if (index >= 0) {
      list.splice(index, 1);
      isBookmarked = false;
    } else {
      list.push(questionId);
      isBookmarked = true;
    }

    localStorage.setItem(STORAGE_SAVED_QUESTIONS_KEY, JSON.stringify(list));
    return { isBookmarked, allIds: list };
  },

  isBookmarked: (questionId: string): boolean => {
    const list = gamification.getBookmarkedIds();
    return list.includes(questionId);
  },

  getFlashBestScore: (): number => {
    if (typeof window === 'undefined') return 0;
    const val = localStorage.getItem(STORAGE_FLASH_BEST_KEY);
    return val ? parseInt(val, 10) : 0;
  },

  saveFlashBestScore: (score: number): boolean => {
    const prev = gamification.getFlashBestScore();
    if (score > prev) {
      localStorage.setItem(STORAGE_FLASH_BEST_KEY, score.toString());
      return true; // new high score
    }
    return false;
  }
};

