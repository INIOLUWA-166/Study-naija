import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  Timer, 
  BookOpen, 
  Award,
  BookMarked,
  Zap, 
  PlayCircle, 
  Search, 
  Flame, 
  Sparkles, 
  Volume2, 
  Trophy, 
  Swords, 
  Users, 
  Target, 
  WifiOff, 
  Layers, 
  TrendingUp, 
  Keyboard,
  Clock,
  Sparkle,
  Compass,
  Smile,
  ShieldCheck,
  Gift,
  Crown
} from 'lucide-react';
import { Subject, User, PredictedScoreData } from '../types';
import { AdBanner } from './AdBanner';
import { gamification } from '../utils/gamification';
import { DailyStudyGoals } from './DailyStudyGoals';
import { DailyStreakCounter } from './DailyStreakCounter';
import { calculatePredictedScore } from '../utils/scorePredictor';
import { offlinePacksManager } from '../utils/offlinePacksManager';
import { getMonthlySeasonInfo, MONTHLY_PRIZES } from '../utils/leaderboardData';
import { TournamentCountdown } from './TournamentCountdown';
import { RankedModesDirectory } from './RankedModesDirectory';
import { LobbyCalculatorCard } from './LobbyCalculatorCard';
import { ScientificCalculator } from './ScientificCalculator';
import { StudentWelcomeGuideCard } from './StudentWelcomeGuideCard';
import { StoryBooksLobbySection } from './StoryBooksLobbySection';

interface HomeViewProps {
  subjects: Subject[];
  user: User | null;
  activeExamFilter?: 'ALL' | 'JAMB' | 'WAEC';
  setActiveExamFilter?: (filter: 'ALL' | 'JAMB' | 'WAEC') => void;
  onNavigate: (view: string, extra?: any) => void;
  onOpenAuth: () => void;
  onSelectExamFilter?: (filter: 'ALL' | 'JAMB' | 'WAEC') => void;
  onOpenFlashChallenge?: () => void;
  onOpenPredictedScore?: () => void;
  onOpenOfflinePacks?: () => void;
  onOpenCalculator?: () => void;
  onOpenStoreModal?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  subjects,
  user,
  activeExamFilter = 'ALL',
  setActiveExamFilter,
  onNavigate,
  onOpenAuth,
  onSelectExamFilter,
  onOpenFlashChallenge,
  onOpenPredictedScore,
  onOpenOfflinePacks,
  onOpenCalculator,
  onOpenStoreModal
}) => {
  const [isLobbyCalculatorOpen, setIsLobbyCalculatorOpen] = useState(false);
  const [arenaRoomCodeInput, setArenaRoomCodeInput] = useState('');
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');
  const [offlinePackCount, setOfflinePackCount] = useState(() => 
    offlinePacksManager.getPacks().filter(p => p.isDownloaded).length
  );
  
  // Real-time predicted score diagnostic preview
  const predictedScore: PredictedScoreData = calculatePredictedScore([], user);

  // Friendly countdown to upcoming Nigerian UTME exam
  const [countdown, setCountdown] = useState({ days: 42, hours: 14, minutes: 28, seconds: 45 });
  const seasonInfo = getMonthlySeasonInfo();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { ...prev, days: Math.max(0, prev.days - 1), hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFilterClick = (filter: 'ALL' | 'JAMB' | 'WAEC') => {
    if (setActiveExamFilter) {
      setActiveExamFilter(filter);
    } else if (onSelectExamFilter) {
      onSelectExamFilter(filter);
    }
  };

  const handleJoinArenaWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (arenaRoomCodeInput.trim()) {
      onNavigate('arena-1v1', { roomCode: arenaRoomCodeInput.trim().toUpperCase() });
    } else {
      onNavigate('arena-1v1');
    }
  };

  const handleOpenCalculator = () => {
    if (onOpenCalculator) {
      onOpenCalculator();
    } else {
      setIsLobbyCalculatorOpen(true);
    }
  };

  const studentFirstName = user?.name ? user.name.split(' ')[0] : null;

  // Filter subjects by exam type and search term
  const filteredSubjects = subjects.filter(subject => {
    const matchesFilter = 
      activeExamFilter === 'ALL' || 
      (activeExamFilter === 'JAMB' && subject.isJamb) || 
      (activeExamFilter === 'WAEC' && subject.isWaec);
    
    const matchesSearch = 
      !subjectSearchQuery.trim() ||
      subject.name.toLowerCase().includes(subjectSearchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(subjectSearchQuery.toLowerCase()) ||
      subject.topics.some(t => t.toLowerCase().includes(subjectSearchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <div id="home-view-container" className="space-y-10 pb-16">
      
      {/* ========================================================================= */}
      {/* WARM & ENCOURAGING STUDENT HERO BANNER */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 sm:p-10 shadow-xl border border-emerald-600/40">
        {/* Soft decorative background accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          
          {/* Friendly Status & Countdown Strip */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/60 border border-emerald-400/30 text-emerald-100 text-xs font-medium">
              <span className="text-base leading-none">🇳🇬</span>
              <span>Nigeria's Premier Study Companion</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>2026 JAMB UTME: <strong>{countdown.days} days, {countdown.hours} hrs left</strong></span>
            </div>
          </div>

          {/* Student Welcome Headline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Outfit'] text-white">
              {studentFirstName ? (
                <>Welcome back, <span className="text-amber-300">{studentFirstName}</span>! 👋</>
              ) : (
                <>Ace Your <span className="text-amber-300">JAMB & WAEC</span> Exams</>
              )}
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Study smarter with 10,000+ verified past questions, easy step-by-step explanations, official CBT mock exams, and instant Naija AI guidance.
            </p>
          </div>

          {/* Simple Exam Filter Tabs */}
          <div className="inline-flex items-center p-1.5 bg-emerald-900/60 rounded-2xl border border-emerald-500/30">
            <button
              onClick={() => handleFilterClick('ALL')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeExamFilter === 'ALL'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              All Exams
            </button>
            <button
              onClick={() => handleFilterClick('JAMB')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeExamFilter === 'JAMB'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              JAMB UTME
            </button>
            <button
              onClick={() => handleFilterClick('WAEC')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                activeExamFilter === 'WAEC'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              WAEC SSCE
            </button>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-emerald-600/40 text-center">
            <div className="p-2">
              <div className="text-xl sm:text-2xl font-black text-white">10,000+</div>
              <div className="text-xs text-emerald-200">Past Questions</div>
            </div>
            <div className="p-2">
              <div className="text-xl sm:text-2xl font-black text-white">8-Key</div>
              <div className="text-xs text-emerald-200">Official JAMB Mock</div>
            </div>
            <div className="p-2">
              <div className="text-xl sm:text-2xl font-black text-white">Naija AI</div>
              <div className="text-xs text-emerald-200">Academic Voice Tutor</div>
            </div>
            <div className="p-2">
              <div className="text-xl sm:text-2xl font-black text-white">Zero-Data</div>
              <div className="text-xs text-emerald-200">Offline Study Mode</div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* MONTHLY STUDENT PRIZE BOARD (1ST TO 5TH PLACE AIRTIME & VIP PASSES) */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-200 rounded-3xl p-6 sm:p-8 border-2 border-amber-300 text-slate-950 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-950 text-amber-300 text-xs font-mono font-black flex items-center gap-1.5 shadow-xs">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>{seasonInfo.seasonTitle}</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-700 text-white text-xs font-bold shadow-xs">
                🇳🇬 Monthly Airtime Rewards
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] text-slate-950 tracking-tight">
              Top 5 Students Win Free Phone Airtime Every Month! 🎁
            </h3>

            <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
              Study hard, solve past questions, and climb the leaderboard! Every <strong>1st day of the month</strong>, the race resets and winners receive recharge airtime for MTN, Airtel, Glo, or 9mobile!
            </p>

            {/* Clear Prize Tier Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-xl bg-white/90 text-slate-950 text-xs font-black shadow-2xs border border-amber-200">
                🥇 1st: ₦2,000 Airtime + VIP
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/90 text-slate-950 text-xs font-black shadow-2xs border border-amber-200">
                🥈 2nd: ₦1,500 Airtime + VIP
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/90 text-slate-950 text-xs font-black shadow-2xs border border-amber-200">
                🥉 3rd: ₦1,000 Airtime
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/90 text-slate-950 text-xs font-black shadow-2xs border border-amber-200">
                🏅 4th & 5th: ₦500 Airtime
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-700 pt-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-slate-900" />
              <span>Current race ends in <strong>{seasonInfo.daysRemaining} days, {seasonInfo.hoursRemaining} hours</strong> on {seasonInfo.resetDateString}!</span>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0">
            <button
              onClick={() => onNavigate('leaderboard')}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>View Leaderboard & Standings</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3-STEP STUDENT SUCCESS GUIDE (MAKES THE PORTAL 100% CLEAR) */}
      {/* ========================================================================= */}
      <StudentWelcomeGuideCard
        user={user}
        onNavigate={onNavigate}
        onOpenCalculator={handleOpenCalculator}
        onOpenFlashChallenge={onOpenFlashChallenge}
      />

      {/* ========================================================================= */}
      {/* STORY BOOKS & LITERATURE CORNER (STUDENT LOBBY FEATURE) */}
      {/* ========================================================================= */}
      <StoryBooksLobbySection
        onNavigate={onNavigate}
        title="StudyNaija Story Books & Literature Corner 📖"
        subtitle="Take a refreshing brain break between intense CBT mock drills with gripping, culturally rich stories written specifically for Nigerian students."
        maxDisplay={4}
      />

      {/* ========================================================================= */}
      {/* MONTHLY CHAMPIONS LEAGUE TOURNAMENT SHOWCASE (LOBBY FEATURE) */}
      {/* ========================================================================= */}
      <section id="lobby-champions-league" className="bg-gradient-to-r from-amber-950/90 via-yellow-950/80 to-slate-950 rounded-3xl p-6 sm:p-8 border-2 border-amber-500/50 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-black flex items-center gap-1.5 shadow-xs">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>CHAMPIONS LEAGUE TOURNAMENT</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                Starts 12th of Each Month
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider">
                ₦9,500 Cash Payouts
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white tracking-tight">
              StudyNaija Monthly Champions League 🏆
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Top 32 scholars from the previous month’s leaderboard face off in 8 groups of 4. Compete in 10-question 1v1 matches (2-min timer, 5 mins Math), 2-legged knockout rounds, sudden-death tiebreakers, and a 4-subject Grande Finale!
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold text-amber-200">
              <span className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>1st: ₦5,000 + 1-Mo Premium + Gold Theme</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-cyan-300" />
                <span>2nd: ₦3,000 + 1-Mo Medium + Diamond Theme</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-slate-300" />
                <span>3rd: ₦1,500 + 1-Mo Basic + Platinum Theme</span>
              </span>
            </div>
          </div>

          <div className="w-full lg:w-80 shrink-0 space-y-3">
            <TournamentCountdown variant="lobby" onNavigate={onNavigate} />
            <button
              onClick={() => onNavigate('tournament')}
              className="w-full px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/25 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="w-5 h-5 text-slate-950" />
              <span>ENTER CHAMPIONS LEAGUE</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* LOBBY CBT SCIENTIFIC CALCULATOR CARD */}
      {/* ========================================================================= */}
      <LobbyCalculatorCard onOpenFullCalculator={handleOpenCalculator} />

      {/* ========================================================================= */}
      {/* OFFICIAL RANKED VS UNRANKED MODES DIRECTORY */}
      {/* ========================================================================= */}
      <RankedModesDirectory
        onNavigate={onNavigate}
        onOpenCalculator={handleOpenCalculator}
        onOpenFlashChallenge={onOpenFlashChallenge}
        onOpenOfflinePacks={onOpenOfflinePacks}
      />

      {/* ========================================================================= */}
      {/* 5 CORE STUDY PATHS (STUDENT FRIENDLY QUICK-START) */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
            What would you like to do today?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Choose your learning mode to start practicing immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          
          {/* Card 1: Champions League (Highlighted) */}
          <div 
            onClick={() => onNavigate('tournament')}
            className="group bg-gradient-to-b from-amber-950/80 via-slate-900 to-slate-950 rounded-3xl p-6 border-2 border-amber-500/50 hover:border-amber-400 shadow-md hover:shadow-xl hover:shadow-amber-500/10 transition-all cursor-pointer flex flex-col justify-between text-white"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <Trophy className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">Starts 12th • Top 32</span>
                <h3 className="text-lg font-black text-amber-300 group-hover:text-amber-200 transition-colors">
                  Champions League
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Compete in 8 groups, 1v1 knockouts, and win up to ₦5,000 cash, free VIP & gold site themes!
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-black text-amber-400 group-hover:gap-1.5 transition-all">
              <span>Enter Tournament</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
          
          {/* Card 1: Practice Past Questions (Turned Gold) */}
          <div 
            onClick={() => onNavigate('practice')}
            className="group bg-gradient-to-b from-amber-950/90 via-slate-900 to-amber-950/70 rounded-3xl p-6 border-2 border-amber-400/60 hover:border-amber-300 shadow-md hover:shadow-xl hover:shadow-amber-500/20 transition-all cursor-pointer flex flex-col justify-between text-white"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <BookOpen className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-amber-300 group-hover:text-yellow-200 transition-colors">
                Practice Past Questions
              </h3>
              <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
                Pick any subject, solve questions at your own pace, and view detailed step-by-step explanations.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-amber-400 group-hover:text-amber-300 group-hover:gap-1.5 transition-all">
              <span>Start Practicing</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Card 2: Timed Mock Exam (Turned Gold) */}
          <div 
            onClick={() => onNavigate('mock-exam')}
            className="group bg-gradient-to-b from-amber-950/90 via-slate-900 to-amber-950/70 rounded-3xl p-6 border-2 border-amber-400/60 hover:border-amber-300 shadow-md hover:shadow-xl hover:shadow-amber-500/20 transition-all cursor-pointer flex flex-col justify-between text-white"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <Timer className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-amber-300 group-hover:text-yellow-200 transition-colors">
                Full CBT Mock Exam
              </h3>
              <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
                Experience the real JAMB hall. 4 subjects, official 8-key keyboard controls, and real-time timer countdown.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-amber-400 group-hover:text-amber-300 group-hover:gap-1.5 transition-all">
              <span>Take Mock Exam</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Card 3: Naija AI & Voice (Turned Gold) */}
          <div 
            onClick={() => onNavigate('ai-tutor')}
            className="group bg-gradient-to-b from-amber-950/90 via-slate-900 to-amber-950/70 rounded-3xl p-6 border-2 border-amber-400/60 hover:border-amber-300 shadow-md hover:shadow-xl hover:shadow-amber-500/20 transition-all cursor-pointer flex flex-col justify-between text-white"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <Sparkles className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-amber-300 group-hover:text-yellow-200 transition-colors">
                Ask Naija AI
              </h3>
              <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
                Stuck on a difficult concept? Naija AI breaks it down step-by-step with proofs, past questions, and voice audio.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-amber-400 group-hover:text-amber-300 group-hover:gap-1.5 transition-all">
              <span>Chat with Naija AI</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Card 4: 1v1 Challenge Arena (Turned Gold) */}
          <div 
            onClick={() => onNavigate('arena-1v1')}
            className="group bg-gradient-to-b from-amber-950/90 via-slate-900 to-amber-950/70 rounded-3xl p-6 border-2 border-amber-400/60 hover:border-amber-300 shadow-md hover:shadow-xl hover:shadow-amber-500/20 transition-all cursor-pointer flex flex-col justify-between text-white"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <Swords className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black text-amber-300 group-hover:text-yellow-200 transition-colors">
                1v1 Student Quiz Arena
              </h3>
              <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
                Play a friendly 5-question match against another student. Win games, climb the ranks, and earn rewards!
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-amber-400 group-hover:text-amber-300 group-hover:gap-1.5 transition-all">
              <span>Play Quiz Match</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* DAILY STUDY GOALS & STREAK (MOTIVATIONAL & CLEAN) */}
      {/* ========================================================================= */}
      <section id="lobby-goals-streak" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
              Your Daily Study Habit
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Solve a few questions daily to build confidence and retain what you read.
            </p>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>View Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dual Column: Daily Goals & Streak */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <DailyStudyGoals user={user} onNavigate={onNavigate} />
          <DailyStreakCounter user={user} onNavigate={onNavigate} />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* STUDENT STORY BOOKS & LITERATURE HUB (NEW) */}
      {/* ========================================================================= */}
      <section id="lobby-story-books" className="rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/40 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>STUDENT STORY BOOKS & LITERATURE</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/40">
                Audio Narration & Quizzes
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white">
              Engaging Original Stories for Nigerian Scholars 📖
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Read captivating short stories designed to boost your English lexis, comprehension speed, and moral wisdom. 
              Featuring African science fiction, campus mysteries, historical STEM heroes, and classic folklore!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1">
                <span>⚡ The Quantum Calabash</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span>🕵️ Midnight Organ of Hall 4</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span>🐢 Ijapa & River of Wisdom</span>
              </span>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <button
              onClick={() => onNavigate('stories')}
              className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-5 h-5 text-slate-950" />
              <span>EXPLORE STORY BOOKS</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FEATURED SUBJECTS LIST WITH QUICK SEARCH */}
      {/* ========================================================================= */}
      <section id="featured-subjects-section" className="space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
              Choose a Subject to Practice
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Showing {filteredSubjects.length} subjects for {activeExamFilter === 'ALL' ? 'JAMB & WAEC' : activeExamFilter}.
            </p>
          </div>

          {/* Quick Subject Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search subject or topic..."
              value={subjectSearchQuery}
              onChange={e => setSubjectSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSubjects.map(subject => (
            <div
              key={subject.id}
              id={`subject-card-${subject.id}`}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-emerald-500/60 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-mono">
                    {subject.code}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {subject.questionCount}+ Questions
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {subject.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {subject.description}
                </p>

                {/* Popular Topics Preview */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {subject.topics.slice(0, 2).map((t, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 bg-slate-50 text-slate-600 rounded-md truncate max-w-[140px] border border-slate-100">
                        {t}
                      </span>
                    ))}
                    {subject.topics.length > 2 && (
                      <span className="text-[11px] px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded-md font-medium">
                        +{subject.topics.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 flex items-center gap-2">
                <button
                  onClick={() => onNavigate('practice', { subjectId: subject.id })}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Practice</span>
                </button>
                <button
                  onClick={() => onNavigate('mock-exam', { preferredSubject: subject.id })}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  title="Mock Exam on this subject"
                >
                  Mock
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-700">No subjects found matching "{subjectSearchQuery}"</div>
            <button
              onClick={() => setSubjectSearchQuery('')}
              className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
            >
              Clear search and view all subjects
            </button>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* STUDENT BONUS TOOLS ROW (PRACTICE BOOSTER PACKS) */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
            Extra Study Boosters
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Fun revision tools to boost your recall, reflex speed, and offline access.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Tool 1: 60s Speed Quiz */}
          <div className="bg-gradient-to-b from-slate-900 to-amber-950/40 rounded-3xl p-5 border border-amber-500/30 hover:border-amber-400 shadow-md transition-all flex flex-col justify-between space-y-3 text-white">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-xs">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-amber-200">
                60-Second Speed Quiz
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Test your reflex with rapid questions. Great for a quick 1-minute brain warm-up before class.
              </p>
            </div>
            <button
              onClick={onOpenFlashChallenge || (() => onNavigate('dashboard'))}
              className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Play 60s Challenge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tool 2: Formula Flashcards */}
          <div className="bg-gradient-to-b from-slate-900 to-amber-950/40 rounded-3xl p-5 border border-amber-500/30 hover:border-amber-400 shadow-md transition-all flex flex-col justify-between space-y-3 text-white">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-amber-200">
                Formula Flashcards
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Quick flip-cards for Physics equations, Chemistry laws, Math formulas, and English concord.
              </p>
            </div>
            <button
              onClick={() => onNavigate('flashcards')}
              className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Open Flashcards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tool 3: Offline Study Packs */}
          <div className="bg-gradient-to-b from-slate-900 to-amber-950/40 rounded-3xl p-5 border border-amber-500/30 hover:border-amber-400 shadow-md transition-all flex flex-col justify-between space-y-3 text-white">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-xs">
                <WifiOff className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-amber-200">
                Zero-Data Offline Mode
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Save past questions to your browser. Study whenever you are on the road or when there's no data.
              </p>
            </div>
            <button
              onClick={onOpenOfflinePacks || (() => onNavigate('practice'))}
              className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Manage Offline Packs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tool 4: Syllabus Topic Search */}
          <div className="bg-gradient-to-b from-slate-900 to-amber-950/40 rounded-3xl p-5 border border-amber-500/30 hover:border-amber-400 shadow-md transition-all flex flex-col justify-between space-y-3 text-white">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-xs">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-amber-200">
                Syllabus Search Pad
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Look up any specific topic across all subjects to see what JAMB and WAEC examiners test most.
              </p>
            </div>
            <button
              onClick={() => onNavigate('search-pad')}
              className="w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Search Syllabus</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* HELPFUL STUDENT GUIDE: HOW THE JAMB 8-KEY SYSTEM WORKS */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border-2 border-emerald-200">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Keyboard className="w-3.5 h-3.5 text-emerald-700" />
            <span>Official JAMB Hall Shortcut Tip</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] text-slate-900">
            Learn the Official JAMB 8-Key System ⌨️
          </h3>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            In the official JAMB exam hall, you can finish much faster by using your keyboard instead of clicking with the mouse. Our mock exam simulator lets you practice with the exact 8 keys:
          </p>

          {/* 8-Key Visual Keys Designed like real computer keys */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-[0_4px_0_0_#cbd5e1] text-center">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-lg font-mono font-black text-sm border border-amber-300 mb-1">
                A, B, C, D
              </span>
              <div className="text-xs text-slate-700 font-bold">Pick Options</div>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-[0_4px_0_0_#cbd5e1] text-center">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 rounded-lg font-mono font-black text-sm border border-emerald-300 mb-1">
                N
              </span>
              <div className="text-xs text-slate-700 font-bold">Next Question</div>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-[0_4px_0_0_#cbd5e1] text-center">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-900 rounded-lg font-mono font-black text-sm border border-blue-300 mb-1">
                P
              </span>
              <div className="text-xs text-slate-700 font-bold">Previous Question</div>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-[0_4px_0_0_#cbd5e1] text-center">
              <span className="inline-block px-3 py-1 bg-rose-100 text-rose-900 rounded-lg font-mono font-black text-sm border border-rose-300 mb-1">
                S
              </span>
              <div className="text-xs text-slate-700 font-bold">Submit Exam</div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('mock-exam')}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Practice with 8-Key Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Ad Banner for Free Tier */}
      <AdBanner placement="homepage" user={user} />

      {/* Floating Scientific Calculator Modal from Lobby */}
      {isLobbyCalculatorOpen && (
        <ScientificCalculator
          isOpen={isLobbyCalculatorOpen}
          onClose={() => setIsLobbyCalculatorOpen(false)}
          mode="floating"
          subjectName="General Mathematics & Science"
        />
      )}

    </div>
  );
};
