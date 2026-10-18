import { WeeklyStudyGoal, WeeklyStudyGoalsState, User } from '../types';
import { gamification } from './gamification';

const STORAGE_WEEKLY_GOALS_KEY = 'studynaija_weekly_goals_v1';
const STORAGE_WEEKLY_GOALS_WEEK_KEY = 'studynaija_weekly_goals_week_v1';

// Helper to calculate current Monday-based week key and date strings
export function getCurrentWeekInfo(): {
  weekKey: string;
  weekStart: string;
  weekEnd: string;
  daysRemaining: number;
} {
  const now = new Date();
  // Get day of week: Sunday is 0, Monday is 1, ..., Saturday is 6
  const dayOfWeek = now.getDay();
  // Monday distance: if Sunday (0), distance is 6; otherwise dayOfWeek - 1
  const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Compute ISO-like week key: YYYY-MM-DD of Monday
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, '0');
  const dd = String(monday.getDate()).padStart(2, '0');
  const weekKey = `${yyyy}-${mm}-${dd}`;

  // Formatted date labels
  const startFormat = monday.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  const endFormat = sunday.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });

  // Days remaining in current week (inclusive of today)
  const daysRemaining = 7 - distanceToMonday;

  return {
    weekKey,
    weekStart: `Mon, ${startFormat}`,
    weekEnd: `Sun, ${endFormat}`,
    daysRemaining
  };
}

// Default standard goals for Nigerian students preparing for JAMB UTME / WAEC
export const DEFAULT_WEEKLY_GOALS: WeeklyStudyGoal[] = [
  {
    id: 'goal-weekly-total',
    title: 'Overall Weekly Practice Volume',
    category: 'all',
    targetQuestions: 120,
    completedQuestions: 38,
    percentage: 32,
    isCompleted: false,
    colorTheme: 'cyan',
    icon: 'target',
    rewardXp: 150
  },
  {
    id: 'goal-weekly-math',
    title: 'Mathematics & Calculation Drills',
    category: 'subject',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    targetQuestions: 35,
    completedQuestions: 14,
    percentage: 40,
    isCompleted: false,
    colorTheme: 'emerald',
    icon: 'calculator',
    rewardXp: 75
  },
  {
    id: 'goal-weekly-english',
    title: 'English Language Lexis & Concord',
    category: 'subject',
    subjectId: 'english',
    subjectName: 'English Language',
    targetQuestions: 40,
    completedQuestions: 18,
    percentage: 45,
    isCompleted: false,
    colorTheme: 'purple',
    icon: 'book',
    rewardXp: 75
  },
  {
    id: 'goal-weekly-physics',
    title: 'Physics & Science Mechanics',
    category: 'subject',
    subjectId: 'physics',
    subjectName: 'Physics',
    targetQuestions: 25,
    completedQuestions: 6,
    percentage: 24,
    isCompleted: false,
    colorTheme: 'amber',
    icon: 'zap',
    rewardXp: 50
  }
];

export const weeklyGoalsManager = {
  // Retrieve the full weekly goals state
  getState: (user?: User | null): WeeklyStudyGoalsState => {
    const weekInfo = getCurrentWeekInfo();

    if (typeof window === 'undefined') {
      return {
        ...weekInfo,
        goals: DEFAULT_WEEKLY_GOALS,
        totalTarget: 220,
        totalCompleted: 76,
        overallPercentage: 35,
        allGoalsCrushed: false
      };
    }

    try {
      const storedWeek = localStorage.getItem(STORAGE_WEEKLY_GOALS_WEEK_KEY);
      const rawGoals = localStorage.getItem(STORAGE_WEEKLY_GOALS_KEY);

      let goals: WeeklyStudyGoal[] = rawGoals ? JSON.parse(rawGoals) : [];

      if (!Array.isArray(goals) || goals.length === 0) {
        goals = DEFAULT_WEEKLY_GOALS.map(g => ({ ...g }));
        localStorage.setItem(STORAGE_WEEKLY_GOALS_KEY, JSON.stringify(goals));
        localStorage.setItem(STORAGE_WEEKLY_GOALS_WEEK_KEY, weekInfo.weekKey);
      } else if (storedWeek !== weekInfo.weekKey) {
        // Week rolled over: retain student's configured goals & targets, but reset progress counter for the fresh week!
        goals = goals.map(g => ({
          ...g,
          completedQuestions: 0,
          percentage: 0,
          isCompleted: false,
          rewardClaimed: false
        }));
        localStorage.setItem(STORAGE_WEEKLY_GOALS_KEY, JSON.stringify(goals));
        localStorage.setItem(STORAGE_WEEKLY_GOALS_WEEK_KEY, weekInfo.weekKey);
      }

      // Recalculate percentages and completion
      goals = goals.map(g => {
        const percentage = Math.min(100, Math.round((g.completedQuestions / Math.max(1, g.targetQuestions)) * 100));
        return {
          ...g,
          percentage,
          isCompleted: g.completedQuestions >= g.targetQuestions
        };
      });

      const totalTarget = goals.reduce((sum, g) => sum + g.targetQuestions, 0);
      const totalCompleted = goals.reduce((sum, g) => sum + g.completedQuestions, 0);
      const overallPercentage = totalTarget > 0 ? Math.min(100, Math.round((totalCompleted / totalTarget) * 100)) : 0;
      const allGoalsCrushed = goals.length > 0 && goals.every(g => g.isCompleted);

      return {
        ...weekInfo,
        goals,
        totalTarget,
        totalCompleted,
        overallPercentage,
        allGoalsCrushed
      };
    } catch {
      return {
        ...weekInfo,
        goals: DEFAULT_WEEKLY_GOALS,
        totalTarget: 220,
        totalCompleted: 76,
        overallPercentage: 35,
        allGoalsCrushed: false
      };
    }
  },

  // Save updated goals and broadcast change event
  saveGoals: (goals: WeeklyStudyGoal[]) => {
    if (typeof window === 'undefined') return;
    try {
      const weekInfo = getCurrentWeekInfo();
      localStorage.setItem(STORAGE_WEEKLY_GOALS_KEY, JSON.stringify(goals));
      localStorage.setItem(STORAGE_WEEKLY_GOALS_WEEK_KEY, weekInfo.weekKey);
      window.dispatchEvent(new CustomEvent('studynaija_weekly_goals_updated', {
        detail: { goals }
      }));
    } catch (e) {
      console.error('Failed to save weekly goals:', e);
    }
  },

  // Update target questions for a specific goal
  setGoalTarget: (goalId: string, newTarget: number): WeeklyStudyGoalsState => {
    const state = weeklyGoalsManager.getState();
    const validTarget = Math.max(5, Math.min(500, Math.round(newTarget)));

    const updatedGoals = state.goals.map(g => {
      if (g.id === goalId) {
        const percentage = Math.min(100, Math.round((g.completedQuestions / validTarget) * 100));
        return {
          ...g,
          targetQuestions: validTarget,
          percentage,
          isCompleted: g.completedQuestions >= validTarget
        };
      }
      return g;
    });

    weeklyGoalsManager.saveGoals(updatedGoals);
    return weeklyGoalsManager.getState();
  },

  // Record completed questions from practice, mock exams, or offline sessions
  addCompletedQuestions: (
    count: number,
    subjectId?: string,
    isMockExam: boolean = false
  ): { newlyCrushedGoals: WeeklyStudyGoal[]; earnedBonusXp: number } => {
    const state = weeklyGoalsManager.getState();
    const increment = Math.max(1, Math.round(count));
    const newlyCrushedGoals: WeeklyStudyGoal[] = [];
    let earnedBonusXp = 0;

    const normalizedSubject = (subjectId || '').toLowerCase().trim();

    const updatedGoals = state.goals.map(goal => {
      let shouldIncrement = false;

      // 1. Overall volume goal always increments on any practice question
      if (goal.category === 'all') {
        shouldIncrement = true;
      }
      // 2. Subject-specific goal increments if subject matches
      else if (goal.category === 'subject') {
        const goalSubject = (goal.subjectId || goal.subjectName || '').toLowerCase().trim();
        if (normalizedSubject && (goalSubject.includes(normalizedSubject) || normalizedSubject.includes(goalSubject))) {
          shouldIncrement = true;
        }
      }
      // 3. Mock exam goal
      else if (goal.category === 'mock-exam' && isMockExam) {
        shouldIncrement = true;
      }

      if (!shouldIncrement) return goal;

      const prevCompleted = goal.completedQuestions;
      const newCompleted = prevCompleted + increment;
      const wasCompleted = prevCompleted >= goal.targetQuestions;
      const isNowCompleted = newCompleted >= goal.targetQuestions;

      const percentage = Math.min(100, Math.round((newCompleted / Math.max(1, goal.targetQuestions)) * 100));

      const updatedGoal: WeeklyStudyGoal = {
        ...goal,
        completedQuestions: newCompleted,
        percentage,
        isCompleted: isNowCompleted
      };

      if (isNowCompleted && !wasCompleted) {
        newlyCrushedGoals.push(updatedGoal);
        earnedBonusXp += updatedGoal.rewardXp || 50;
      }

      return updatedGoal;
    });

    weeklyGoalsManager.saveGoals(updatedGoals);

    if (earnedBonusXp > 0) {
      gamification.addXp(earnedBonusXp, `Crushed Weekly Study Goal! 🏆`);
    }

    if (newlyCrushedGoals.length > 0) {
      window.dispatchEvent(new CustomEvent('studynaija_weekly_goal_crushed', {
        detail: { newlyCrushedGoals, earnedBonusXp }
      }));
    }

    return { newlyCrushedGoals, earnedBonusXp };
  },

  // Manual quick increment for offline past questions practice
  quickIncrementGoal: (goalId: string, amount: number = 5): WeeklyStudyGoalsState => {
    const state = weeklyGoalsManager.getState();
    const inc = Math.max(1, amount);
    let newlyCrushed: WeeklyStudyGoal | null = null;

    const updatedGoals = state.goals.map(g => {
      if (g.id === goalId) {
        const prevCompleted = g.completedQuestions;
        const newCompleted = prevCompleted + inc;
        const wasCompleted = prevCompleted >= g.targetQuestions;
        const isNowCompleted = newCompleted >= g.targetQuestions;
        const percentage = Math.min(100, Math.round((newCompleted / Math.max(1, g.targetQuestions)) * 100));

        const updated: WeeklyStudyGoal = {
          ...g,
          completedQuestions: newCompleted,
          percentage,
          isCompleted: isNowCompleted
        };

        if (isNowCompleted && !wasCompleted) {
          newlyCrushed = updated;
        }

        return updated;
      }
      return g;
    });

    weeklyGoalsManager.saveGoals(updatedGoals);

    if (newlyCrushed) {
      const xp = (newlyCrushed as WeeklyStudyGoal).rewardXp || 50;
      gamification.addXp(xp, `Crushed Weekly Goal: ${(newlyCrushed as WeeklyStudyGoal).title} 🎯`);
      window.dispatchEvent(new CustomEvent('studynaija_weekly_goal_crushed', {
        detail: { newlyCrushedGoals: [newlyCrushed], earnedBonusXp: xp }
      }));
    }

    return weeklyGoalsManager.getState();
  },

  // Add a new custom goal created by the student
  addGoal: (goalData: {
    title: string;
    category: 'all' | 'subject' | 'mock-exam' | 'accuracy';
    subjectId?: string;
    subjectName?: string;
    targetQuestions: number;
    colorTheme?: 'cyan' | 'emerald' | 'amber' | 'purple' | 'blue' | 'rose';
    icon?: string;
    rewardXp?: number;
  }): WeeklyStudyGoalsState => {
    const state = weeklyGoalsManager.getState();
    const id = `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const targetQuestions = Math.max(5, Math.min(500, Math.round(goalData.targetQuestions)));

    const newGoal: WeeklyStudyGoal = {
      id,
      title: goalData.title.trim() || 'Weekly Target',
      category: goalData.category,
      subjectId: goalData.subjectId,
      subjectName: goalData.subjectName,
      targetQuestions,
      completedQuestions: 0,
      percentage: 0,
      isCompleted: false,
      colorTheme: goalData.colorTheme || 'cyan',
      icon: goalData.icon || 'target',
      rewardXp: goalData.rewardXp || Math.round(targetQuestions * 1.2)
    };

    const updatedGoals = [...state.goals, newGoal];
    weeklyGoalsManager.saveGoals(updatedGoals);
    return weeklyGoalsManager.getState();
  },

  // Delete a goal
  deleteGoal: (goalId: string): WeeklyStudyGoalsState => {
    const state = weeklyGoalsManager.getState();
    const updatedGoals = state.goals.filter(g => g.id !== goalId);
    weeklyGoalsManager.saveGoals(updatedGoals);
    return weeklyGoalsManager.getState();
  },

  // Reset progress for current week
  resetWeekProgress: (): WeeklyStudyGoalsState => {
    const state = weeklyGoalsManager.getState();
    const updatedGoals = state.goals.map(g => ({
      ...g,
      completedQuestions: 0,
      percentage: 0,
      isCompleted: false,
      rewardClaimed: false
    }));
    weeklyGoalsManager.saveGoals(updatedGoals);
    return weeklyGoalsManager.getState();
  },

  // Apply one of 3 structured strategy presets
  applyPresetStrategy: (preset: 'starter' | 'scholar' | 'intensive'): WeeklyStudyGoalsState => {
    let targets: { total: number; math: number; english: number; physics: number };

    if (preset === 'starter') {
      // Casual / Starter scholar: 60 Qs/week
      targets = { total: 60, math: 20, english: 20, physics: 15 };
    } else if (preset === 'intensive') {
      // High-intensity 300+ JAMB Aspirant: 250 Qs/week
      targets = { total: 250, math: 70, english: 80, physics: 50 };
    } else {
      // Balanced serious scholar: 130 Qs/week
      targets = { total: 130, math: 35, english: 45, physics: 25 };
    }

    const state = weeklyGoalsManager.getState();
    const updatedGoals = state.goals.map(g => {
      let newTarget = g.targetQuestions;
      if (g.category === 'all') newTarget = targets.total;
      else if (g.subjectId === 'mathematics') newTarget = targets.math;
      else if (g.subjectId === 'english') newTarget = targets.english;
      else if (g.subjectId === 'physics') newTarget = targets.physics;

      const percentage = Math.min(100, Math.round((g.completedQuestions / newTarget) * 100));
      return {
        ...g,
        targetQuestions: newTarget,
        percentage,
        isCompleted: g.completedQuestions >= newTarget
      };
    });

    weeklyGoalsManager.saveGoals(updatedGoals);
    return weeklyGoalsManager.getState();
  }
};
