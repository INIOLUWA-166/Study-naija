import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  Award, 
  Sparkles, 
  Flame, 
  Trophy, 
  Share2, 
  ShieldCheck, 
  ShieldAlert,
  CheckCircle2, 
  Zap, 
  BookOpen, 
  GraduationCap, 
  Calendar,
  Check,
  Crown,
  Sun,
  Moon,
  Eye,
  Settings,
  Sliders,
  CheckCheck,
  Laptop,
  Mail,
  Send
} from 'lucide-react';
import { User, AchievementBadge, ExamResult } from '../types';
import { gamification, getRankFromXp } from '../utils/gamification';
import { achievementManager } from '../utils/achievementBadges';
import { themeManager, ThemeMode } from '../utils/themeManager';
import { studentNotificationManager } from '../utils/studentNotificationManager';

interface StudentProfileModalProps {
  isOpen?: boolean;
  user: User | null;
  onClose: () => void;
  onNavigate?: (view: string, extra?: any) => void;
  stats?: { questionsAnswered?: number; averageScore?: number; bestScore?: number };
  recentExams?: ExamResult[];
  onUpdateUser?: (updated: User) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen = true,
  user,
  onClose,
  onNavigate,
  stats,
  recentExams = [],
  onUpdateUser
}) => {
  const [activeTab, setActiveTab] = useState<'honours' | 'settings'>('honours');
  const [copied, setCopied] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);
  const [copiedBadgeShare, setCopiedBadgeShare] = useState(false);
  const [themeFeedback, setThemeFeedback] = useState<string | null>(null);
  const [emailSentStatus, setEmailSentStatus] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Initialize theme mode from themeManager
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => themeManager.getThemeMode(user));

  const handleSendWelcomeEmail = async () => {
    if (!user) return;
    setSendingEmail(true);
    try {
      const res = await studentNotificationManager.resendWelcomeEmail(user);
      setEmailSentStatus(`✅ Welcome email dispatched to ${user.email}! Check your inbox & spam.`);
      setTimeout(() => setEmailSentStatus(null), 6000);
    } catch (err: any) {
      setEmailSentStatus(`❌ Error sending email: ${err.message || 'Please try again'}`);
    } finally {
      setSendingEmail(false);
    }
  };

  if (!isOpen) return null;

  const xp = gamification.getXp(user);
  const rankInfo = getRankFromXp(xp);
  const streakData = gamification.getStreak(user);

  const allBadges = achievementManager.getAllBadges(user, stats, recentExams);
  const unlockedBadges = allBadges.filter(b => b.unlocked);
  const badgeSummary = achievementManager.getBadgeSummary(allBadges);

  const studentName = user?.name || 'Candidate';
  const email = user?.email || 'student@studynaija.ng';
  const targetExam = user?.targetExam || 'JAMB UTME 2027';
  const targetCourse = user?.targetCourse || 'Medicine / Engineering Aspirant';

  const integrityScore = user?.integrityScore ?? 100;
  const isVerified = user?.verifiedSession !== false && integrityScore >= 75;
  const totalTabSwitches = user?.totalTabSwitches ?? 0;

  const handleSelectTheme = (newMode: ThemeMode) => {
    setThemeModeState(newMode);
    themeManager.setThemeMode(newMode, user, onUpdateUser);
    setThemeFeedback(
      newMode === 'light'
        ? 'High-Contrast Light Mode applied! Clean black-on-white text for enhanced daytime reading.'
        : 'Cyber Dark Theme applied! Midnight glow with cyan accents.'
    );
    setTimeout(() => setThemeFeedback(null), 3500);
  };

  const handleShareBadge = (badge: AchievementBadge) => {
    const text = `🇳🇬 *StudyNaija Academic Achievement!*\nI earned the *"${badge.title}"* ${badge.icon} badge (${badge.rewardXp} XP)!\n🎯 ${badge.description}\n\nPractice past questions & CBT mock exams with me at https://studynaija.ng`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedBadgeShare(true);
      setTimeout(() => setCopiedBadgeShare(false), 2500);
    }
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareMeritCard = () => {
    const text = `🇳🇬 *StudyNaija Academic Profile: ${studentName}*\n🏆 Level ${rankInfo.rank.level} ${rankInfo.rank.title}\n🔥 ${streakData.streak}-Day Active Study Streak\n🎖️ ${unlockedBadges.length} Official Achievement Badges Unlocked\n🎯 Target Exam: ${targetExam}\n\nPractice past questions & CBT mock exams with me at https://studynaija.ng`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-xl w-full overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.25)] text-white space-y-0 max-h-[92vh] flex flex-col">
        
        {/* Modal Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-cyan-950 to-indigo-950 p-6 border-b border-cyan-500/30 flex items-start justify-between relative shrink-0">
          <div className="flex items-center gap-4">
            {/* Student Avatar with Glowing Rank Border */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-emerald-500 to-indigo-600 p-0.5 shadow-lg">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-2xl font-black text-white">
                  {studentName.charAt(0).toUpperCase()}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-purple-950 border border-purple-400 text-purple-300 font-mono text-[9px] font-bold">
                Lv.{rankInfo.rank.level}
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-white font-['Outfit']">
                  {studentName}
                </h3>
                {isVerified ? (
                  <span 
                    title={`Verified CBT Session: ${integrityScore}% Academic Integrity • Zero Malpractice Strikes`}
                    className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1 shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Verified Session ({integrityScore}%)</span>
                  </span>
                ) : (
                  <span 
                    title={`Academic Integrity Penalized: ${integrityScore}% • Frequent Tab-Switching Detected`}
                    className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1 shadow-xs"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Penalized ({integrityScore}%)</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-mono truncate max-w-[240px]">
                {email}
              </p>
              <div className="text-[11px] text-cyan-300 font-semibold pt-0.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                <span>{targetExam} • {targetCourse}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct 1-Click Quick Theme Switcher in Modal Header */}
            <button
              onClick={() => handleSelectTheme(themeMode === 'cyber' ? 'light' : 'cyber')}
              title={themeMode === 'cyber' ? 'Switch to High-Contrast Light Mode' : 'Switch to Cyber Dark Theme'}
              className="px-2.5 py-1.5 rounded-xl border border-cyan-500/40 bg-slate-950/70 hover:bg-slate-900 transition-colors flex items-center gap-1.5 text-xs font-mono font-bold cursor-pointer text-cyan-300 shadow-sm"
            >
              {themeMode === 'cyber' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Cyber Theme</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation: Honours & Badges vs Profile & Readability Settings */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 pt-2 shrink-0 gap-2">
          <button
            onClick={() => setActiveTab('honours')}
            className={`pb-3 px-3 text-xs font-bold font-mono uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'honours'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Honours & Badges</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-3 text-xs font-bold font-mono uppercase tracking-wider transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>Display Settings & Theme</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
              themeMode === 'light'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            }`}>
              {themeMode === 'light' ? '☀️ Light' : '🌌 Cyber'}
            </span>
          </button>
        </div>

        {/* Dynamic Feedback Banner */}
        {themeFeedback && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-200 text-xs flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{themeFeedback}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          
          {/* ========================================================================= */}
          {/* TAB 1: ACADEMIC HONOURS & BADGES */}
          {/* ========================================================================= */}
          {activeTab === 'honours' && (
            <>
              {/* Key Metric Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                
                {/* Streak */}
                <div className="p-3 rounded-2xl bg-slate-950/90 border border-amber-500/30 shadow-inner">
                  <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                    <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
                    <span className="font-mono font-black text-lg sm:text-xl">{streakData.streak}d</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Daily Streak
                  </div>
                </div>

                {/* Academic XP */}
                <div className="p-3 rounded-2xl bg-slate-950/90 border border-purple-500/30 shadow-inner">
                  <div className="font-mono font-black text-lg sm:text-xl text-purple-300 mb-0.5">
                    {xp} <span className="text-xs text-purple-400">XP</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total Merit XP
                  </div>
                </div>

                {/* Badges Unlocked */}
                <div className="p-3 rounded-2xl bg-slate-950/90 border border-cyan-500/30 shadow-inner">
                  <div className="flex items-center justify-center gap-1 text-cyan-300 mb-0.5">
                    <Trophy className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono font-black text-lg sm:text-xl">{unlockedBadges.length}</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Badges Earned
                  </div>
                </div>

                {/* Best Score */}
                <div className="p-3 rounded-2xl bg-slate-950/90 border border-emerald-500/30 shadow-inner">
                  <div className="font-mono font-black text-lg sm:text-xl text-emerald-400 mb-0.5">
                    {stats?.bestScore ?? 88}%
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    CBT Best Score
                  </div>
                </div>

              </div>

              {/* Academic Integrity & Verified Proctoring Card */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isVerified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}>
                    {isVerified ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-['Outfit']">
                        Academic Integrity Rating
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        isVerified ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {isVerified ? '🛡️ Verified Hall' : '⚠️ Tab-Penalized'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {isVerified 
                        ? '100% clean session history. Full leaderboard & airtime prize eligibility.'
                        : `${totalTabSwitches} tab-switching strikes recorded during timed exams.`}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-xl font-black font-mono ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {integrityScore}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Proctor Score</div>
                </div>
              </div>

              {/* Academic Rank & Progress */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400 uppercase tracking-wider">Academic Rank:</span>
                  <span className="font-black text-purple-300 font-['Outfit'] text-sm">
                    Lv. {rankInfo.rank.level} {rankInfo.rank.title} {rankInfo.rank.badge}
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 border border-purple-500/20">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all"
                    style={{ width: `${rankInfo.progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{rankInfo.progressPercent}% to next rank</span>
                  <span>{rankInfo.nextRank ? `${rankInfo.xpToNext} XP needed` : 'Peak rank attained'}</span>
                </div>
              </div>

              {/* Showcase Badges Carousel / Rack */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      Earned Achievement Badges ({unlockedBadges.length} / {allBadges.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-cyan-400 font-mono font-bold">
                    +{badgeSummary.totalXpEarned} XP Total
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {allBadges.map(badge => {
                    const isUnlocked = badge.unlocked;

                    return (
                      <div
                        key={badge.id}
                        onClick={() => setSelectedBadge(badge)}
                        className={`p-3 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer group hover:scale-[1.02] ${
                          isUnlocked
                            ? 'bg-slate-950/90 border-cyan-500/40 shadow-xs hover:border-cyan-400'
                            : 'bg-slate-950/40 border-slate-800/80 opacity-70 hover:opacity-100 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-xl shadow-xs group-hover:scale-110 transition-transform">
                            <span>{badge.icon}</span>
                          </div>
                          <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                            isUnlocked ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {isUnlocked ? 'Unlocked' : 'Locked'}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <div className={`font-black text-xs font-['Outfit'] truncate ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                            {badge.title}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">
                            {badge.description}
                          </div>
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono">
                          <span className="text-amber-400 font-bold">+{badge.rewardXp} XP</span>
                          <span className="text-cyan-400 group-hover:underline">Details →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Badge Detail Drawer */}
              {selectedBadge && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/50 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-inner">
                        {selectedBadge.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-white text-sm font-['Outfit']">{selectedBadge.title}</h4>
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            selectedBadge.unlocked ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {selectedBadge.unlocked ? '✓ Mastered' : 'Locked'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">{selectedBadge.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedBadge(null)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Requirement / Progress</div>
                      <div className="font-bold text-white mt-0.5">
                        {selectedBadge.progressLabel || (selectedBadge.unlocked ? 'Mastered' : 'In Progress')}
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full transition-all"
                          style={{ width: `${selectedBadge.maxProgress ? Math.min(100, (selectedBadge.currentProgress / selectedBadge.maxProgress) * 100) : (selectedBadge.unlocked ? 100 : 25)}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                      <div className="text-[10px] text-slate-400 uppercase">Merit Bonus</div>
                      <div className="font-black text-amber-400 text-sm mt-0.5">
                        +{selectedBadge.rewardXp} Academic XP
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize">{selectedBadge.rarity} Badge</div>
                    </div>
                  </div>

                  {selectedBadge.unlocked && (
                    <button
                      onClick={() => handleShareBadge(selectedBadge)}
                      className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copiedBadgeShare ? 'Copied Badge Citation!' : 'Share Badge on WhatsApp Status'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Share Merit Badge Citation Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Showcase Honours to Parents & WhatsApp Status</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Generate an instant academic citation slip to share your streaks and badges!
                  </p>
                </div>

                <button
                  onClick={handleShareMeritCard}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied Citation!' : 'Share Status Slip'}</span>
                </button>
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: USER PROFILE SETTINGS & USER-CONTROLLED THEME TOGGLE */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              
              {/* THEME SELECTOR CARD */}
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/40 space-y-4 shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-sm font-black text-white font-['Outfit']">
                        Display Theme & Visual Readability
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Choose between the classic futuristic Cyber dark mode or switch to high-contrast Light mode for long study sessions and daytime clarity.
                    </p>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/40 shrink-0">
                    Active: {themeMode === 'light' ? 'Light' : 'Cyber'}
                  </span>
                </div>

                {/* Theme Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  
                  {/* Option 1: Cyber Dark Theme */}
                  <div
                    onClick={() => handleSelectTheme('cyber')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      themeMode === 'cyber'
                        ? 'border-cyan-400 bg-slate-900/90 shadow-[0_0_25px_rgba(6,182,212,0.3)] ring-2 ring-cyan-400/40'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-inner">
                          <Moon className="w-5 h-5 text-cyan-400" />
                        </div>
                        {themeMode === 'cyber' ? (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" /> Active
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Select</span>
                        )}
                      </div>

                      <div className="font-extrabold text-white text-sm font-['Outfit']">
                        Cyber Dark Theme
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        Deep midnight background with neon cyan & emerald circuit glows. Designed for evening preparation, OLED battery conservation, and high-tech immersion.
                      </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] font-mono text-cyan-300">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span>Original Cyber Style</span>
                    </div>
                  </div>

                  {/* Option 2: High-Contrast Light Mode */}
                  <div
                    onClick={() => handleSelectTheme('light')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                      themeMode === 'light'
                        ? 'border-amber-400 bg-amber-950/20 shadow-[0_0_25px_rgba(245,158,11,0.3)] ring-2 ring-amber-400/40'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-inner">
                          <Sun className="w-5 h-5 text-amber-400" />
                        </div>
                        {themeMode === 'light' ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                            <Check className="w-3 h-3 stroke-[3]" /> Active
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Select</span>
                        )}
                      </div>

                      <div className="font-extrabold text-white text-sm font-['Outfit']">
                        High-Contrast Light Mode
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        Ultra-crisp black text on daylight background with high-contrast borders. Perfect for studying under daylight, reducing glare, and marathon CBT reading.
                      </p>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] font-mono text-amber-300">
                      <Eye className="w-3 h-3 text-amber-400" />
                      <span>High Readability & Contrast</span>
                    </div>
                  </div>

                </div>

                {/* Live Question Preview Box */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      Reading Comfort Sample:
                    </span>
                    <span className="text-cyan-300 font-bold">Live Preview</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white space-y-1.5">
                    <div className="font-bold text-slate-200">
                      Sample Question: Which of the following is an allotrope of Carbon?
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono pt-1">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-emerald-500/40 text-emerald-300 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> [A] Diamond & Graphite
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400">
                        [B] Limestone
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* STUDENT ACADEMIC PROFILE & PREFERENCES */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Candidate Profile Summary
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Registered Name</div>
                    <div className="font-bold text-white">{studentName}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Registered Email</div>
                      <button
                        onClick={handleSendWelcomeEmail}
                        disabled={sendingEmail}
                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer underline disabled:opacity-50"
                        title="Dispatch official welcome email"
                      >
                        <Mail className="w-3 h-3 text-emerald-400" />
                        <span>{sendingEmail ? 'Sending...' : 'Resend Welcome Email'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-cyan-300 text-[11px] truncate">{email}</div>
                    {emailSentStatus && (
                      <div className="text-[10px] text-emerald-300 font-semibold pt-0.5">
                        {emailSentStatus}
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Examination Goal</div>
                    <div className="font-bold text-emerald-300">{targetExam}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-0.5">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Aspiring Discipline</div>
                    <div className="font-bold text-purple-300 truncate">{targetCourse}</div>
                  </div>
                </div>
              </div>

              {/* CANDIDATE STUDY ADVICE NOTE */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-slate-950 border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="text-white">Examiner Ergonomics Tip:</strong> Switching to <em>High-Contrast Light Mode</em> during daytime classes helps mimic the official JAMB UTME computer center monitor settings. Use <em>Cyber Dark Theme</em> at night to prevent eye fatigue.
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => {
              onClose();
              if (onNavigate) onNavigate('practice');
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Practice Drills to Earn More Badges</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
