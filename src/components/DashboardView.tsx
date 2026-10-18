import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Award, 
  HelpCircle, 
  AlertCircle, 
  Timer, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  Calendar, 
  Smartphone, 
  ShieldCheck,
  ShieldAlert,
  Bookmark,
  BookmarkCheck,
  Flame,
  Trophy,
  Search,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  FileQuestion,
  User as UserIcon,
  Sun,
  Moon
} from 'lucide-react';
import { User, ExamResult, Question, AchievementBadge, WeeklyStudyGoal, WeeklyStudyGoalsState } from '../types';
import { api } from '../services/api';
import { gamification, getRankFromXp } from '../utils/gamification';
import { achievementManager } from '../utils/achievementBadges';
import { weeklyGoalsManager } from '../utils/weeklyGoalsManager';
import { EXTENDED_QUESTIONS } from '../utils/questionBank';
import { DailyStudyGoals } from './DailyStudyGoals';
import { WeeklyStudyGoals } from './WeeklyStudyGoals';
import { StudyPlanner } from './StudyPlanner';
import { FocusSessionTimer } from './FocusSessionTimer';
import { DailyStreakCounter } from './DailyStreakCounter';
import { StudentLeaderboard } from './StudentLeaderboard';
import { AchievementBadgesSection } from './AchievementBadgesSection';
import { ScoreMilestonesWidget } from './ScoreMilestonesWidget';
import { StoryBooksLobbySection } from './StoryBooksLobbySection';

interface DashboardViewProps {
  user: User | null;
  onNavigate: (view: string, extra?: any) => void;
  onOpenAuth: () => void;
  onOpenFlashChallenge?: () => void;
  onOpenAITutor?: (topic?: string, subjectName?: string) => void;
  onOpenProfile?: () => void;
  onOpenGoogleWorkspace?: () => void;
  initialTab?: 'overview' | 'weekly-goals' | 'saved-questions' | 'leaderboard' | 'badges';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onNavigate,
  onOpenAuth,
  onOpenFlashChallenge,
  onOpenAITutor,
  onOpenProfile,
  onOpenGoogleWorkspace,
  initialTab = 'overview'
}) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'weekly-goals' | 'study-planner' | 'saved-questions' | 'leaderboard' | 'badges'>(
    initialTab || 'overview'
  );
  const [weeklyGoalsState, setWeeklyGoalsState] = useState<WeeklyStudyGoalsState>(() => weeklyGoalsManager.getState(user));

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Keep weekly goals in sync across updates and practice sessions
  useEffect(() => {
    const handleGoalsUpdate = () => {
      setWeeklyGoalsState(weeklyGoalsManager.getState(user));
    };
    window.addEventListener('studynaija_weekly_goals_updated', handleGoalsUpdate);
    window.addEventListener('studynaija_weekly_goal_crushed', handleGoalsUpdate);
    return () => {
      window.removeEventListener('studynaija_weekly_goals_updated', handleGoalsUpdate);
      window.removeEventListener('studynaija_weekly_goal_crushed', handleGoalsUpdate);
    };
  }, [user]);

  // Bookmarked questions state
  const [savedQuestions, setSavedQuestions] = useState<Question[]>([]);
  const [savedSubjectFilter, setSavedSubjectFilter] = useState<string>('ALL');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Gamification & Badges state
  const [userXp, setUserXp] = useState<number>(() => gamification.getXp(user));
  const [streakInfo, setStreakInfo] = useState(() => gamification.getStreak(user));
  const [flashBestScore, setFlashBestScore] = useState<number>(() => gamification.getFlashBestScore());
  const [badges, setBadges] = useState<AchievementBadge[]>(() => {
    return achievementManager.getAllBadges(user);
  });

  const rankData = getRankFromXp(userXp);

  const fetchSavedQuestions = async () => {
    try {
      const res = await api.getBookmarkedQuestions();
      if (res && Array.isArray(res.bookmarks) && res.bookmarks.length > 0) {
        setSavedQuestions(res.bookmarks);
      } else {
        // Local fallback: match local bookmarked IDs from question bank
        const localIds = gamification.getBookmarkedIds();
        const matched = EXTENDED_QUESTIONS.filter(q => localIds.includes(q.id));
        setSavedQuestions(matched);
      }
    } catch {
      const localIds = gamification.getBookmarkedIds();
      const matched = EXTENDED_QUESTIONS.filter(q => localIds.includes(q.id));
      setSavedQuestions(matched);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const data = await api.getDashboardStats();
        setDashboardData(data);
      } catch {
        // Handled
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
    fetchSavedQuestions();

    const handleStreakUpdate = () => {
      setStreakInfo(gamification.getStreak(user));
      const updated = achievementManager.getAllBadges(user, dashboardData?.stats, dashboardData?.recentExams);
      setBadges(updated);
      achievementManager.checkAndAwardBadges(user, dashboardData?.stats, dashboardData?.recentExams);
    };
    const handleXpUpdate = (e: any) => {
      if (e.detail?.newXp) {
        setUserXp(e.detail.newXp);
      } else {
        setUserXp(gamification.getXp(user));
      }
      const updated = achievementManager.getAllBadges(user, dashboardData?.stats, dashboardData?.recentExams);
      setBadges(updated);
    };
    const handleBadgeUnlocked = () => {
      setBadges(achievementManager.getAllBadges(user, dashboardData?.stats, dashboardData?.recentExams));
    };

    window.addEventListener('studynaija_streak_updated', handleStreakUpdate);
    window.addEventListener('studynaija_xp_updated', handleXpUpdate);
    window.addEventListener('studynaija_badge_unlocked', handleBadgeUnlocked);
    return () => {
      window.removeEventListener('studynaija_streak_updated', handleStreakUpdate);
      window.removeEventListener('studynaija_xp_updated', handleXpUpdate);
      window.removeEventListener('studynaija_badge_unlocked', handleBadgeUnlocked);
    };
  }, [user]);

  useEffect(() => {
    if (dashboardData) {
      const updated = achievementManager.getAllBadges(user, dashboardData.stats, dashboardData.recentExams);
      setBadges(updated);
      achievementManager.checkAndAwardBadges(user, dashboardData.stats, dashboardData.recentExams);
    }
  }, [dashboardData, user]);

  const handleRemoveBookmark = async (qId: string) => {
    gamification.toggleBookmark(qId);
    setSavedQuestions(prev => prev.filter(q => q.id !== qId));
    try {
      await api.toggleBookmarkQuestion(qId, false);
    } catch {}
  };

  const studentName = user?.name || dashboardData?.user?.name || 'Candidate';
  const stats = dashboardData?.stats || {
    questionsAnswered: 84,
    averageScore: 74,
    bestScore: 88,
    weakestSubject: 'Physics'
  };

  const currentUser = user || dashboardData?.user;
  const integrityScore = currentUser?.integrityScore ?? 100;
  const verifiedSession = currentUser?.verifiedSession !== false && integrityScore >= 75;
  const totalTabSwitches = currentUser?.totalTabSwitches ?? 0;
  const flaggedExams = currentUser?.flaggedExamsCount ?? 0;
  const verifiedExams = currentUser?.verifiedExamsCount ?? (currentUser ? 4 : 0);

  const recentExams: ExamResult[] = dashboardData?.recentExams || [];
  const recommendedTopics = dashboardData?.recommendedTopics || [
    { topic: 'Mechanics & Newton Laws', subjectName: 'Physics', subjectId: 'physics', questionsAvailable: 25 },
    { topic: 'Calculus Fundamentals', subjectName: 'Mathematics', subjectId: 'mathematics', questionsAvailable: 30 },
    { topic: 'Acids, Bases & Salts', subjectName: 'Chemistry', subjectId: 'chemistry', questionsAvailable: 20 }
  ];

  const badgeSummary = achievementManager.getBadgeSummary(badges);
  const streak5Badge = badges.find(b => b.id === 'streak_5');
  const topScorerBadge = badges.find(b => b.id === 'top_scorer');

  // Filter saved questions by subject
  const filteredSavedQuestions = savedQuestions.filter(q => {
    if (savedSubjectFilter === 'ALL') return true;
    return q.subjectId === savedSubjectFilter;
  });

  const availableSavedSubjects = Array.from(new Set(savedQuestions.map(q => q.subjectId)));

  return (
    <div id="student-dashboard-view" className="space-y-8 pb-16">
      
      {/* FUTURISTIC WELCOME COMMAND CENTER BANNER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 border border-cyan-500/30 shadow-[0_10px_35px_rgba(6,182,212,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>NEURAL MATRIX // ADMISSION HUB</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              FOCUS: {user?.targetExam || 'JAMB UTME & WAEC'}
            </span>
            {/* Visual Indicator: Shield Icon for Verified Session / Integrity Status */}
            <span 
              title={verifiedSession 
                ? `Verified CBT Session (${integrityScore}% Academic Integrity) • Zero Malpractice Strikes` 
                : `Penalized Account (${integrityScore}% Academic Integrity) • Frequent Tab-Switching Detected`}
              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                verifiedSession 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              }`}
            >
              {verifiedSession ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{verifiedSession ? 'Verified Session' : 'Penalized'} ({integrityScore}%)</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-['Outfit'] tracking-tight text-white flex items-center gap-3">
            <span>Welcome back, {studentName}</span>
            {verifiedSession ? (
              <span title="Verified CBT Session: 100% Fair" className="inline-flex items-center text-emerald-400 bg-emerald-950/80 p-1 rounded-xl border border-emerald-500/40 shadow-xs">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
              </span>
            ) : (
              <span title={`Penalized: ${integrityScore}% Integrity due to tab switches`} className="inline-flex items-center text-amber-400 bg-amber-950/80 p-1 rounded-xl border border-amber-500/40 shadow-xs">
                <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              </span>
            )}
            <span className="inline-block animate-pulse text-2xl">⚡</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            {user?.targetCourse 
              ? `Aspirant for ${user.targetCourse}. Maintain your daily practice streak and complete your daily study goals to secure your admission merit score!`
              : 'Real-time telemetry, CBT speed analytics, diagnostic question reviews, and daily study goal tracking.'}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-500/30 transition-all flex items-center gap-2 cursor-pointer shadow-xs hover:border-cyan-400"
              title="Open Profile Settings & Theme"
            >
              <div className="relative flex items-center justify-center">
                <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                {verifiedSession ? (
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400 absolute -bottom-1 -right-1" />
                ) : (
                  <ShieldAlert className="w-2.5 h-2.5 text-amber-400 absolute -bottom-1 -right-1" />
                )}
              </div>
              <span>Profile & Theme</span>
              <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                verifiedSession ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {integrityScore}%
              </span>
            </button>
          )}

          <button
            onClick={() => onNavigate('search-pad')}
            className="px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:border-cyan-400"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>Search Pad</span>
          </button>

          <button
            onClick={() => onOpenFlashChallenge ? onOpenFlashChallenge() : onNavigate('practice')}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5 cursor-pointer hover:scale-102"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>60s Flash CBT</span>
          </button>

          <button
            onClick={() => onNavigate('stories')}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5 cursor-pointer hover:scale-102"
            title="Read student story books & literature for JAMB/WAEC"
          >
            <BookOpen className="w-4 h-4 fill-slate-950" />
            <span>Story Books 📖</span>
          </button>

          <button
            onClick={() => onNavigate('practice')}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1.5 cursor-pointer hover:scale-102"
          >
            <BookOpen className="w-4 h-4 fill-slate-950" />
            <span>Launch Practice</span>
          </button>
        </div>
      </div>

      {/* PROMINENT DAILY STREAK COUNTER (Flame & Calendar Icon) */}
      <DailyStreakCounter
        user={user}
        onNavigate={onNavigate}
      />

      {/* DAILY STUDY GOALS PROGRESS BAR COMPONENT */}
      <DailyStudyGoals
        user={user}
        onNavigate={onNavigate}
      />

      {/* FOCUS SESSION POMODORO STUDY TIMER */}
      <FocusSessionTimer
        user={user}
        onNavigate={onNavigate}
        onOpenAITutor={onOpenAITutor}
      />

      {/* SECONDARY GAMIFICATION METRICS: RANK & FLASH BEST & MILESTONE BADGES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Academic XP Rank Matrix */}
        <div className="bg-slate-950/80 rounded-3xl p-6 border border-purple-500/30 shadow-[0_8px_30px_rgba(168,85,247,0.08)] space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-mono font-bold text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
              <span>ACADEMIC MERIT RANK</span>
            </span>
            <span className="text-xs font-black text-purple-300 bg-purple-950/90 px-3 py-1 rounded-xl border border-purple-400/40 shadow-xs">
              Lv. {rankData.rank.level} {rankData.rank.badge}
            </span>
          </div>
          <div className="font-black text-lg text-white font-['Outfit'] relative z-10">
            {rankData.rank.title}
          </div>
          <div className="space-y-1.5 relative z-10">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{userXp} XP Current</span>
              <span>{rankData.nextRank ? `${rankData.xpToNext} XP to Lv.${rankData.nextRank.level}` : 'Top Rank Mastered'}</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-purple-500/20">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                style={{ width: `${rankData.progressPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 pt-0.5">
              Active Perk: <span className="text-purple-300 font-medium">{rankData.rank.perk}</span>
            </div>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className="w-full mt-2 py-1.5 px-3 bg-purple-950/80 hover:bg-purple-900/80 text-purple-200 border border-purple-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>View National Leaderboard Rankings →</span>
            </button>
          </div>
        </div>

        {/* Card 2: 60-Second Speed CBT Rush */}
        <div className="bg-slate-950/80 rounded-3xl p-6 border border-amber-500/30 shadow-[0_8px_30px_rgba(245,158,11,0.08)] space-y-3 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-widest">
              SPEED CBT ACCELERATOR
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              TIME: 60s
            </span>
          </div>
          <div className="relative z-10 space-y-1">
            <div className="text-2xl font-black font-['Outfit'] flex items-center gap-2 text-white">
              <Trophy className="w-6 h-6 text-amber-400 fill-amber-400/20" />
              <span>Personal Best: {flashBestScore} Pts</span>
            </div>
            <p className="text-xs text-slate-300">
              Test quick retrieval speed against JAMB 40-second pacing constraints.
            </p>
          </div>
          <div className="relative z-10 pt-1">
            <button
              onClick={() => onOpenFlashChallenge ? onOpenFlashChallenge() : onNavigate('practice')}
              className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Launch 60-Second Challenge</span>
            </button>
          </div>
        </div>

        {/* Card 3: Milestone Achievement Badges (5-Day Streak & Top Scorer) */}
        <div className="bg-slate-950/80 rounded-3xl p-6 border border-cyan-500/30 shadow-[0_8px_30px_rgba(6,182,212,0.08)] space-y-3 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>ACHIEVEMENT HONOURS</span>
            </span>
            <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/90 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
              {badgeSummary.unlockedCount} / {badgeSummary.total} Unlocked
            </span>
          </div>

          <div className="relative z-10 space-y-2.5">
            {/* 5-Day Streak Milestone */}
            <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-amber-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl">🔥</span>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white truncate font-['Outfit']">5-Day Streak</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {streak5Badge?.unlocked ? 'Unlocked • +150 XP' : `${Math.min(5, Math.max(streakInfo.streak, streakInfo.longestStreak))}/5 Days Complete`}
                  </div>
                </div>
              </div>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                streak5Badge?.unlocked ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
                {streak5Badge?.unlocked ? '✓ Earned' : 'In Progress'}
              </span>
            </div>

            {/* Top Scorer Milestone */}
            <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-purple-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl">🏆</span>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white truncate font-['Outfit']">Top Scorer (80%+)</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {topScorerBadge?.unlocked ? 'Unlocked • +200 XP' : `${Math.min(80, stats.bestScore)}% / 80% Target`}
                  </div>
                </div>
              </div>
              <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                topScorerBadge?.unlocked ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
                {topScorerBadge?.unlocked ? '✓ Earned' : 'In Progress'}
              </span>
            </div>
          </div>

          <div className="relative z-10 pt-1">
            <button
              onClick={() => setActiveTab('badges')}
              className="w-full py-2 px-3 bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>View All 12 Badges & XP Citations →</span>
            </button>
          </div>
        </div>

      </div>

      {/* DASHBOARD TABS: "Overview" vs "Badges" vs "Leaderboard" vs "Saved Questions" */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Overview & Stats
        </button>

        <button
          onClick={() => setActiveTab('weekly-goals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'weekly-goals'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black shadow-md'
              : 'bg-white text-slate-700 hover:bg-cyan-50 hover:text-cyan-800 border border-slate-200 hover:border-cyan-300'
          }`}
        >
          <Target className={`w-3.5 h-3.5 ${activeTab === 'weekly-goals' ? 'text-cyan-200' : 'text-cyan-600'}`} />
          <span>Weekly Study Goals</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'weekly-goals' ? 'bg-slate-950 text-cyan-200' : 'bg-cyan-100 text-cyan-800'
          }`}>
            {weeklyGoalsState.totalCompleted}/{weeklyGoalsState.totalTarget} Qs
          </span>
        </button>

        <button
          onClick={() => setActiveTab('study-planner')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'study-planner'
              ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-black shadow-md'
              : 'bg-white text-slate-700 hover:bg-indigo-50 hover:text-indigo-800 border border-slate-200 hover:border-indigo-300'
          }`}
        >
          <BookOpen className={`w-3.5 h-3.5 ${activeTab === 'study-planner' ? 'text-cyan-200' : 'text-indigo-600'}`} />
          <span>Study Planner</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'study-planner' ? 'bg-slate-950 text-cyan-200' : 'bg-indigo-100 text-indigo-800'
          }`}>
            Per-Subject Goals
          </span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'badges'
              ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-black shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className={`w-3.5 h-3.5 ${activeTab === 'badges' ? 'text-amber-300' : 'text-cyan-600'}`} />
          <span>Achievement Badges</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'badges' ? 'bg-slate-950 text-cyan-200' : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
          }`}>
            {badgeSummary.unlockedCount} / {badgeSummary.total}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'leaderboard'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Trophy className={`w-3.5 h-3.5 ${activeTab === 'leaderboard' ? 'fill-slate-950 text-slate-950' : 'text-amber-500'}`} />
          <span>Student Leaderboard</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-black uppercase tracking-wider ${
            activeTab === 'leaderboard' ? 'bg-slate-950 text-amber-300' : 'bg-amber-100 text-amber-800'
          }`}>
            Top Scorers
          </span>
        </button>

        <button
          onClick={() => setActiveTab('saved-questions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'saved-questions'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Questions</span>
          <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
            activeTab === 'saved-questions' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
          }`}>
            {savedQuestions.length}
          </span>
        </button>

        <button
          onClick={() => onNavigate('stories')}
          className="px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-xs"
          title="Read student story books & literature"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Story Books 📖</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-slate-950">
            READ
          </span>
        </button>

        <button
          onClick={() => onOpenGoogleWorkspace?.()}
          className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap bg-blue-950/70 hover:bg-blue-900 text-blue-200 border border-blue-500/40 shadow-xs ml-auto"
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Google Workspace Sync</span>
          <span className="px-2 py-0.2 rounded-full text-[10px] font-black bg-blue-500/30 text-blue-200">
            Cloud
          </span>
        </button>
      </div>

      {/* VIEW 1: SAVED QUESTIONS LIST FOR REVIEW */}
      {activeTab === 'saved-questions' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900 font-['Outfit'] flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Saved Questions for Review ({savedQuestions.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Challenging questions you bookmarked during practice sessions. Study the verified step-by-step teacher workings before exam day!
              </p>
            </div>

            {/* Subject Filter Chips */}
            {savedQuestions.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSavedSubjectFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    savedSubjectFilter === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({savedQuestions.length})
                </button>
                {availableSavedSubjects.map(subId => (
                  <button
                    key={subId}
                    onClick={() => setSavedSubjectFilter(subId)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer whitespace-nowrap ${
                      savedSubjectFilter === subId
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {subId} ({savedQuestions.filter(q => q.subjectId === subId).length})
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredSavedQuestions.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                <Bookmark className="w-7 h-7 text-amber-500" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-extrabold text-base text-slate-800">
                  {savedQuestions.length === 0 ? 'No Questions Saved Yet' : 'No questions saved for this subject'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  When taking a CBT practice drill or mock exam, click the <strong>"Bookmark"</strong> button on any tricky question to save it here for concentrated revision!
                </p>
              </div>
              <button
                onClick={() => onNavigate('practice')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>Start a Practice Drill Now</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSavedQuestions.map((q, idx) => {
                const isExpanded = expandedQuestionId === q.id;

                return (
                  <div
                    key={q.id || idx}
                    className="border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 transition-all space-y-3 bg-slate-50/40"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {q.subjectName}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                          {q.examType} {q.year || ''}
                        </span>
                        {q.topic && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            • {q.topic}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleRemoveBookmark(q.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove from saved questions"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Question Statement */}
                    <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                      {q.question}
                    </p>

                    {/* Options List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {(['A', 'B', 'C', 'D'] as const).map(optKey => {
                        const optVal = q.options[optKey];
                        if (!optVal) return null;
                        const isCorrect = q.correctOption.toUpperCase() === optKey;

                        return (
                          <div
                            key={optKey}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                              isCorrect
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {optKey}
                            </span>
                            <span className="truncate">{optVal}</span>
                            {isCorrect && (
                              <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Step-by-Step Explanation Accordion */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <button
                        onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Solution' : 'View Step-by-Step Solution'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => {
                          if (onOpenAITutor) {
                            onOpenAITutor(q.topic || q.subjectName, q.subjectName);
                          } else {
                            onNavigate('ai-tutor');
                          }
                        }}
                        className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Ask AI Tutor to Clarify</span>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200 text-xs text-emerald-950 space-y-1.5 animate-in fade-in duration-150">
                        <div className="font-extrabold text-[11px] uppercase tracking-wider text-emerald-800">
                          Teacher's Verified Explanation:
                        </div>
                        <p className="leading-relaxed font-medium">
                          {q.explanation}
                        </p>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW: WEEKLY STUDY GOALS & SUBJECT TARGETS */}
      {activeTab === 'weekly-goals' && (
        <div className="animate-in fade-in duration-200">
          <WeeklyStudyGoals
            user={user}
            onNavigate={onNavigate}
          />
        </div>
      )}

      {/* VIEW: STUDY PLANNER (PER-SUBJECT DAILY GOALS) */}
      {activeTab === 'study-planner' && (
        <div className="animate-in fade-in duration-200">
          <StudyPlanner
            user={user}
            onNavigate={onNavigate}
          />
        </div>
      )}

      {/* VIEW 2: OFFICIAL ACHIEVEMENT BADGES & CITATIONS SECTION */}
      {activeTab === 'badges' && (
        <div className="animate-in fade-in duration-200">
          <AchievementBadgesSection
            user={user}
            stats={stats}
            recentExams={recentExams}
            onNavigate={onNavigate}
            onOpenProfile={onOpenProfile}
          />
        </div>
      )}

      {/* VIEW 3: STUDENT LEADERBOARD (TOP SCORERS & MOTIVATION) */}
      {activeTab === 'leaderboard' && (
        <StudentLeaderboard
          user={user}
          onNavigate={onNavigate}
          onOpenAuth={onOpenAuth}
          onOpenFlashChallenge={onOpenFlashChallenge}
        />
      )}

      {/* VIEW 4: STANDARD KPI METRICS, MILESTONES & RECOMMENDED LESSONS */}
      {activeTab === 'overview' && (
        <>
          {/* Primary KPI Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Metric 1: Questions Answered */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Questions Answered</span>
                <HelpCircle className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-['Outfit']">
                {stats.questionsAnswered}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+18 answered this week</span>
              </p>
            </div>

            {/* Metric 2: Average Score */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Average Score</span>
                <BarChart3 className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-['Outfit']">
                {stats.averageScore}%
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats.averageScore}%` }} />
              </div>
            </div>

            {/* Metric 3: Best Score */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Best Mock Score</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-amber-600 font-['Outfit']">
                {stats.bestScore}%
              </div>
              <p className="text-[11px] text-slate-500">
                Equiv. ~{Math.round((stats.bestScore / 100) * 400)} in official JAMB
              </p>
            </div>

            {/* Metric 4: Weakest Subject */}
            <div className="bg-white rounded-2xl p-5 border border-red-200 shadow-xs space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-red-500">
                <span className="text-xs font-bold uppercase tracking-wider">Weakest Subject</span>
                <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-black text-red-700 font-['Outfit'] truncate">
                {stats.weakestSubject}
              </div>
              <button
                onClick={() => onNavigate('practice', { subjectId: stats.weakestSubject.toLowerCase() })}
                className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 underline cursor-pointer"
              >
                Review {stats.weakestSubject} Now →
              </button>
            </div>

          </div>

          {/* PROGRESS ANALYTICS: SCORE MILESTONE GAUGE & PERFORMANCE TRENDS SIDE-BY-SIDE */}
          <ScoreMilestonesWidget
            user={user}
            bestScorePercentage={stats.bestScore || 71}
            averageScorePercentage={stats.averageScore || 68}
            weakestSubject={stats.weakestSubject || 'Mathematics'}
            recentExams={dashboardData?.recentExams || []}
            onNavigate={onNavigate}
          />

          {/* Academic Integrity Score & Proctoring Health Widget */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950/80 rounded-3xl p-5 sm:p-6 border border-emerald-500/30 shadow-md text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start sm:items-center gap-4 relative z-10">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                integrityScore >= 80 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 ring-4 ring-emerald-500/10' 
                  : integrityScore >= 60 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 ring-4 ring-amber-500/10' 
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 ring-4 ring-rose-500/10'
              }`}>
                {integrityScore >= 80 ? (
                  <ShieldCheck className="w-8 h-8 sm:w-9 sm:h-9 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-8 h-8 sm:w-9 sm:h-9 text-amber-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Academic Integrity Score
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${
                    integrityScore >= 80 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : integrityScore >= 60 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}>
                    {integrityScore >= 80 ? (
                      <>
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Verified Session (100% Fair)</span>
                      </>
                    ) : integrityScore >= 60 ? (
                      <>
                        <ShieldAlert className="w-3 h-3 text-amber-400" />
                        <span>Fair • Tab-Switch Penalized</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                        <span>Under Proctor Review</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl sm:text-4xl font-black font-mono ${
                    integrityScore >= 80 ? 'text-emerald-400' : integrityScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {integrityScore}%
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    / 100% Clean Proctor Rating
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  {integrityScore >= 80 
                    ? 'Pristine examination history with zero unauthorized tab switches. Your account has verified integrity status, unlocking full qualification for monthly airtime prizes and national leaderboard standings.'
                    : 'Your integrity rating has been penalized due to tab-switching events detected during live CBT exams. Complete subsequent clean exams without navigating away to recover your score.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-6 w-full md:w-auto bg-slate-950/70 p-3.5 sm:p-4 rounded-2xl border border-slate-800 shrink-0 text-xs relative z-10">
              <div className="text-center px-2">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Tab Switches</div>
                <div className={`font-mono text-base font-black ${totalTabSwitches > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {totalTabSwitches}
                </div>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center px-2">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Flagged Exams</div>
                <div className={`font-mono text-base font-black ${flaggedExams > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {flaggedExams}
                </div>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center px-2">
                <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Session Status</div>
                <div className={`font-bold flex items-center justify-center gap-1 ${verifiedSession ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {verifiedSession ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verified</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      <span>Penalized</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* CHAMPIONS LEAGUE ARENA & UEFA INTRO SPOTLIGHT BANNER */}
          <div 
            onClick={() => onNavigate('tournament')}
            className="group rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500/50 hover:border-amber-400 p-5 sm:p-6 text-white shadow-xl hover:shadow-2xl hover:shadow-amber-500/20 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-start sm:items-center gap-4 relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/50 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                <Trophy className="w-8 h-8 sm:w-9 sm:h-9 text-amber-400 animate-pulse fill-amber-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-black text-amber-300 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-900/60 border border-amber-500/40">
                    NATIONAL GRAND SLAM • TOP 32
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                    ₦9,500 Cash Bounty
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white font-['Outfit'] group-hover:text-amber-200 transition-colors">
                  StudyNaija Champions League Arena
                </h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  Tap to launch the official UEFA Champions League grand stadium intro and enter Nigeria's premier academic knockout championship! (Requires 2,300+ XP or Top 32 qualification).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto justify-end">
              <button
                type="button"
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-xl shadow-amber-500/25 transition-all group-hover:scale-105 flex items-center gap-2 cursor-pointer font-['Outfit']"
              >
                <Trophy className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>TAP TO ENTER CHAMPIONS</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>

          {/* WEEKLY STUDY GOALS & SUBJECT TARGETS SPOTLIGHT CARD */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-black shadow-xs">
                  <Target className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit']">
                      Weekly Subject Study Goals
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                      {weeklyGoalsState.weekStart} – {weeklyGoalsState.weekEnd}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Track your question target completion rate across your core subjects for this week.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('weekly-goals');
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('studynaija_open_set_weekly_goal'));
                    }, 50);
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  <span>+ Set Subject Goal</span>
                </button>
                <button
                  onClick={() => setActiveTab('weekly-goals')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  View All ({weeklyGoalsState.goals.length}) →
                </button>
              </div>
            </div>

            {/* Overall Sprint Progress Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Weekly Sprint Completion Volume</span>
                </span>
                <span className="font-mono text-cyan-700 font-black">
                  {weeklyGoalsState.totalCompleted} / {weeklyGoalsState.totalTarget} Questions ({weeklyGoalsState.overallPercentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${weeklyGoalsState.overallPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{Math.max(0, weeklyGoalsState.totalTarget - weeklyGoalsState.totalCompleted)} practice questions left to crush weekly quota</span>
                <span>{weeklyGoalsState.daysRemaining} days remaining</span>
              </div>
            </div>

            {/* Subject-Specific Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {weeklyGoalsState.goals.slice(0, 6).map(goal => {
                const isCrushed = goal.isCompleted;
                return (
                  <div
                    key={goal.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      isCrushed 
                        ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/20' 
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {goal.title}
                      </span>
                      {isCrushed ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-0.5 shrink-0">
                          <Check className="w-3 h-3" />
                          <span>100%</span>
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                          {goal.percentage}%
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-mono font-black text-slate-800 text-sm">
                          {goal.completedQuestions} <span className="text-slate-400 text-xs font-normal">/ {goal.targetQuestions} Qs</span>
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {goal.targetQuestions - goal.completedQuestions > 0 ? `${goal.targetQuestions - goal.completedQuestions} left` : 'Completed'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCrushed ? 'bg-emerald-500' : 'bg-cyan-500'
                          }`}
                          style={{ width: `${goal.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => {
                          const updated = weeklyGoalsManager.quickIncrementGoal(goal.id, 5);
                          setWeeklyGoalsState(updated);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-[11px] transition-colors cursor-pointer"
                        title="Log 5 solved practice questions"
                      >
                        +5 Qs
                      </button>

                      <button
                        onClick={() => onNavigate('practice', { subjectId: goal.subjectId })}
                        className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Practice</span>
                        <ArrowRight className="w-3 h-3 text-cyan-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DEDICATED MILESTONE BADGES SPOTLIGHT STRIP IN OVERVIEW */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-cyan-500/30 shadow-[0_10px_30px_rgba(6,182,212,0.12)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center justify-center text-lg">
                  <Award className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-['Outfit'] flex items-center gap-2">
                    <span>Student Milestone Badges</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </h3>
                  <p className="text-xs text-slate-300">
                    Key academic honours awarded for sustained practice streaks and outstanding CBT scores.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                  {badgeSummary.unlockedCount} / {badgeSummary.total} Badges Unlocked
                </span>
                <button
                  onClick={() => setActiveTab('badges')}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2 Primary Milestones Grid: 5-Day Streak and Top Scorer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Milestone 1: 5-Day Streak */}
              <div className={`p-4 rounded-2xl border transition-all ${
                streak5Badge?.unlocked 
                  ? 'bg-amber-950/20 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                  : 'bg-slate-900/60 border-slate-800'
              }`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner">
                      <span>🔥</span>
                    </div>
                    <div>
                      <div className="text-sm font-black text-white font-['Outfit'] flex items-center gap-2">
                        <span>5-Day Streak</span>
                        <span className="text-xs text-amber-400 font-mono font-bold">+150 XP</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Maintain 5 consecutive days of CBT study sessions.
                      </p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    streak5Badge?.unlocked ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {streak5Badge?.unlocked ? '✓ Unlocked' : 'In Progress'}
                  </span>
                </div>

                <div className="space-y-1 pt-1 font-mono text-[10px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Progress:</span>
                    <span className="font-bold text-white">{Math.min(5, Math.max(streakInfo.streak, streakInfo.longestStreak))} / 5 Days</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 border border-amber-500/20">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (Math.max(streakInfo.streak, streakInfo.longestStreak) / 5) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Milestone 2: Top Scorer */}
              <div className={`p-4 rounded-2xl border transition-all ${
                topScorerBadge?.unlocked 
                  ? 'bg-purple-950/20 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.1)]' 
                  : 'bg-slate-900/60 border-slate-800'
              }`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 border border-purple-500/30 flex items-center justify-center text-2xl shadow-inner">
                      <span>🏆</span>
                    </div>
                    <div>
                      <div className="text-sm font-black text-white font-['Outfit'] flex items-center gap-2">
                        <span>Top Scorer</span>
                        <span className="text-xs text-purple-400 font-mono font-bold">+200 XP</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        Score 80% or higher on any CBT drill or full mock exam.
                      </p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    topScorerBadge?.unlocked ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {topScorerBadge?.unlocked ? '✓ Unlocked' : 'In Progress'}
                  </span>
                </div>

                <div className="space-y-1 pt-1 font-mono text-[10px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Target Score:</span>
                    <span className="font-bold text-white">{stats.bestScore}% / 80% Target</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 border border-purple-500/20">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (stats.bestScore / 80) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* GOOGLE WORKSPACE ACADEMIC CLOUD INTEGRATION CARD */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-blue-500/30 shadow-[0_10px_30px_rgba(59,130,246,0.12)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-['Outfit'] flex items-center gap-2">
                    <span>Google Workspace Academic Cloud Hub</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      LIVE CLOUD SYNC
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Connect your Google Account to export test analytics to Sheets, study notes to Docs, sync Classroom coursework, and create practice Forms.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenGoogleWorkspace?.()}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md hover:scale-102 shrink-0"
              >
                <span>Launch Google Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div 
                onClick={() => onOpenGoogleWorkspace?.()}
                className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer space-y-1 hover:bg-slate-900"
              >
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Google Sheets</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Export mock test scores, percentages, and performance breakdowns directly to Google Sheets.
                </p>
              </div>

              <div 
                onClick={() => onOpenGoogleWorkspace?.()}
                className="p-3 rounded-2xl bg-slate-900/80 border border-blue-500/20 hover:border-blue-500/50 transition-all cursor-pointer space-y-1 hover:bg-slate-900"
              >
                <div className="flex items-center gap-2 font-bold text-blue-400">
                  <FileText className="w-4 h-4" />
                  <span>Google Docs</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Generate revision summaries, high-yield formulas, and exam tips in a formatted Google Doc.
                </p>
              </div>

              <div 
                onClick={() => onOpenGoogleWorkspace?.()}
                className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer space-y-1 hover:bg-slate-900"
              >
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <GraduationCap className="w-4 h-4" />
                  <span>Google Classroom</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Sync your active school courses and view coursework assignments alongside JAMB prep goals.
                </p>
              </div>

              <div 
                onClick={() => onOpenGoogleWorkspace?.()}
                className="p-3 rounded-2xl bg-slate-900/80 border border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer space-y-1 hover:bg-slate-900"
              >
                <div className="flex items-center gap-2 font-bold text-purple-400">
                  <FileQuestion className="w-4 h-4" />
                  <span>Google Forms</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Create customized CBT quiz forms with past JAMB questions inside your own Google account.
                </p>
              </div>
            </div>
          </div>

          {/* STORY BOOKS & LITERATURE SECTION (DASHBOARD LOBBY) */}
          <StoryBooksLobbySection
            onNavigate={onNavigate}
            title="Dashboard Story Books & Literature Corner 📖"
            subtitle="Take a breather between past questions with culturally rich Nigerian student stories that sharpen your vocabulary and reading comprehension."
            maxDisplay={4}
          />

          {/* Middle Grid: Recommended Topics & Recent Exams */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Recommended Topics (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    <span>Recommended Topics To Boost Your Score</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Targeted lessons generated automatically from your practice errors.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {recommendedTopics.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/30 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {item.subjectName}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1 group-hover:text-emerald-800 transition-colors">
                        {item.topic}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.questionsAvailable}+ questions with step-by-step solutions
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigate('practice', { subjectId: item.subjectId, topic: item.topic })}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Practice</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Recent Exams History (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span>Recent CBT Exams</span>
                </h3>
                <span className="text-xs text-slate-400">History</span>
              </div>

              {recentExams.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl space-y-2">
                  <Timer className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">No mock exams recorded yet</p>
                  <button
                    onClick={() => onNavigate('mock-exam')}
                    className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    Take your first CBT Mock Exam →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentExams.map((exam, idx) => (
                    <div
                      key={exam.id || idx}
                      className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800">
                          {exam.examType} Mock
                        </span>
                        <div className="text-xs font-bold text-slate-900 mt-1">
                          {new Date(exam.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {exam.totalQuestions} Questions • {Math.round(exam.timeSpentSeconds / 60)} mins
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black text-slate-900">
                          {exam.jambScore ? `${exam.jambScore}/400` : `${exam.scorePercentage}%`}
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          exam.scorePercentage >= 70 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {exam.waecGrade || `${exam.scorePercentage}%`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('mock-exam')}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>Start New Mock Exam</span>
                </button>
              </div>
            </div>

          </div>

          {/* Device Memory & Phone Sync Card */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-7 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Persistent Login Active
                  </span>
                </div>
                <h3 className="text-base font-black font-['Outfit'] text-white">
                  Remembered on This Device • Multi-Phone Access
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                  Your login credentials and CBT progress are safely saved so you won't be asked to log in every time. Changing or replacing your phone? Generate a quick 6-digit sync code anytime.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('device-sync')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Smartphone className="w-4 h-4" />
              <span>Switch Phone / Device Code</span>
            </button>
          </div>
        </>
      )}

    </div>
  );
};
