import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Award, 
  Flame, 
  Zap, 
  TrendingUp, 
  Search, 
  Sparkles, 
  ArrowRight, 
  Swords, 
  Crown, 
  CheckCircle2, 
  Filter, 
  BookOpen, 
  Binary, 
  FlaskConical, 
  Dna, 
  Landmark, 
  BarChart3, 
  ShieldCheck, 
  ChevronRight, 
  Clock, 
  Target, 
  Share2, 
  X,
  GraduationCap,
  Gift,
  Coins,
  MessageCircle,
  HelpCircle,
  AlertCircle,
  Check,
  Smartphone,
  Send,
  Info,
  PhoneCall,
  Copy,
  Shuffle,
  Lock
} from 'lucide-react';
import { User, Subject, LeaderboardEntry, SubjectChampion } from '../types';
import { api } from '../services/api';
import { gamification } from '../utils/gamification';
import { 
  LeaderboardStatsSummary, 
  SUBJECT_CHAMPIONS, 
  MONTHLY_PRIZES, 
  MonthlyPrizeTier, 
  getMonthlySeasonInfo 
} from '../utils/leaderboardData';

interface StudentLeaderboardProps {
  user: User | null;
  subjects?: Subject[];
  onNavigate: (view: string, extra?: any) => void;
  onOpenAuth?: () => void;
  onOpenFlashChallenge?: () => void;
}

export const StudentLeaderboard: React.FC<StudentLeaderboardProps> = ({
  user,
  subjects = [],
  onNavigate,
  onOpenAuth,
  onOpenFlashChallenge
}) => {
  // Filter states
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<'monthly' | 'weekly' | 'all-time' | 'daily'>('monthly');
  const [examType, setExamType] = useState<'ALL' | 'JAMB' | 'WAEC'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data states
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStatsSummary | null>(null);
  const [champions, setChampions] = useState<SubjectChampion[]>(SUBJECT_CHAMPIONS);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals & UI helpers
  const [comparedStudent, setComparedStudent] = useState<LeaderboardEntry | null>(null);
  const [prizeRulesModalOpen, setPrizeRulesModalOpen] = useState<boolean>(false);
  const [selectedPrizeTier, setSelectedPrizeTier] = useState<MonthlyPrizeTier | null>(null);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Winner Claim states (Phone number submission for airtime disbursement)
  const [claimPhone, setClaimPhone] = useState<string>(user?.phone || '');
  const [claimNetwork, setClaimNetwork] = useState<string>('MTN');
  const [claimNotes, setClaimNotes] = useState<string>('');
  const [submittingClaim, setSubmittingClaim] = useState<boolean>(false);
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);
  const [existingClaim, setExistingClaim] = useState<any | null>(null);
  const [showClaimForm, setShowClaimForm] = useState<boolean>(false);

  // Live countdown state
  const [seasonCountdown, setSeasonCountdown] = useState(() => getMonthlySeasonInfo());

  // Update countdown clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setSeasonCountdown(getMonthlySeasonInfo());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch current user prize claim status if logged in
  useEffect(() => {
    if (user?.phone && !claimPhone) {
      setClaimPhone(user.phone);
    }
    if (user) {
      api.getMyPrizeClaim().then(res => {
        if (res?.hasClaim && res.claim) {
          setExistingClaim(res.claim);
          if (res.claim.phoneNumber) setClaimPhone(res.claim.phoneNumber);
          if (res.claim.network) setClaimNetwork(res.claim.network);
        }
      }).catch(() => {});
    }
  }, [user]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (!claimPhone || claimPhone.trim().length < 8) {
      alert('Please enter a valid Nigerian mobile phone number (e.g. 08012345678)');
      return;
    }
    setSubmittingClaim(true);
    try {
      const res = await api.claimMonthlyPrize({
        phoneNumber: claimPhone.trim(),
        network: claimNetwork,
        notes: claimNotes
      });
      setClaimSuccessMsg(res.message || 'Phone number sent to Admin! Your airtime will be recharged shortly.');
      setExistingClaim(res.claim);
      setShowClaimForm(false);
    } catch (err: any) {
      alert(err.message || 'Failed to submit phone number');
    } finally {
      setSubmittingClaim(false);
    }
  };

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await api.getLeaderboard({
        subjectId: selectedSubject,
        timeframe,
        examType,
        searchQuery
      });
      setEntries(data.entries);
      setStats(data.stats);
      if (data.champions && data.champions.length > 0) {
        setChampions(data.champions);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedSubject, timeframe, examType, user]);

  // Handle live search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeaderboard();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Current user's entry if found in the list
  const currentUserEntry = useMemo(() => {
    return entries.find(e => e.isCurrentUser);
  }, [entries]);

  // Check if current user is in prize position (Ranks 1 to 5)
  const userPrize = useMemo(() => {
    if (!currentUserEntry || currentUserEntry.rank > 5) return null;
    return MONTHLY_PRIZES[currentUserEntry.rank - 1] || null;
  }, [currentUserEntry]);

  // Available subjects list for filter pills
  const subjectFilterOptions = [
    { id: 'all', label: 'All Subjects (UTME Aggregate)', icon: Trophy },
    { id: 'english', label: 'English Language', icon: BookOpen },
    { id: 'mathematics', label: 'General Mathematics', icon: Binary },
    { id: 'physics', label: 'Physics', icon: Zap },
    { id: 'chemistry', label: 'Chemistry', icon: FlaskConical },
    { id: 'biology', label: 'Biology', icon: Dna },
    { id: 'economics', label: 'Economics', icon: BarChart3 },
    { id: 'government', label: 'Government', icon: Landmark }
  ];

  const handleShareStanding = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const shareText = `I am currently ranked #${stats?.currentUserRank || 1} on the StudyNaija Monthly CBT Championship (${seasonCountdown.seasonTitle}) competing for the ₦15,000 cash grant & 20GB data prize! Can you beat my score? https://studynaija.ng`;
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. HERO BANNER: MONTHLY REFRESH & CASH/DATA PRIZES (RANKS 1 TO 5) */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white border border-amber-500/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-amber-500/25 via-orange-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>{seasonCountdown.seasonTitle.toUpperCase()}</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1.5">
                <Coins className="w-3 h-3 text-emerald-400" />
                <span>Airtime, Data & VIP Pass Prizes</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>100% Real Registered Students Only</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-['Outfit'] tracking-tight text-white leading-tight">
              Top 5 Monthly CBT Championship Prizes 🇳🇬
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every month, StudyNaija rewards our top 5 hardest working students with real <strong>Airtime / Data Recharges, Free VIP Subscriptions, and Signed Merit Certificates</strong>! The leaderboard automatically resets on the <strong>1st day of every month at 00:00 WAT</strong>.
            </p>

            {/* LIVE COUNTDOWN TIMER TO 1ST OF MONTH */}
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    Next Season Reset on {seasonCountdown.resetDateString}:
                  </div>
                  <div className="text-sm sm:text-base font-mono font-black text-amber-300 flex items-center gap-1">
                    <span>{seasonCountdown.daysRemaining}d</span>
                    <span className="text-slate-500">:</span>
                    <span>{String(seasonCountdown.hoursRemaining).padStart(2, '0')}h</span>
                    <span className="text-slate-500">:</span>
                    <span>{String(seasonCountdown.minutesRemaining).padStart(2, '0')}m</span>
                    <span className="text-slate-500">:</span>
                    <span>{String(seasonCountdown.secondsRemaining).padStart(2, '0')}s</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPrizeRulesModalOpen(true)}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Prize Terms & How to Claim</span>
              </button>
            </div>
          </div>

          {/* Quick Action Hub */}
          <div className="w-full lg:w-72 flex flex-col gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('mock-exam')}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4 fill-slate-950" />
              <span>Take Full Mock Exam (+200 XP)</span>
            </button>
            <button
              onClick={() => onNavigate('practice')}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
              <span>Practice Past Questions (+15 XP)</span>
            </button>
            <button
              onClick={() => onNavigate('ai-tutor')}
              className="w-full py-2.5 px-4 bg-slate-900/70 hover:bg-slate-800 text-emerald-300 font-bold text-xs rounded-2xl border border-emerald-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Naija AI Tutor (+15 XP)</span>
            </button>
          </div>
        </div>

        {/* Champions League Top 32 Tournament Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-slate-900 border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
              <Trophy className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">Monthly Champions League (Top 32 Scholars)</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">Starts 12th</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                The top 32 ranked scholars from this leaderboard qualify for the 8-group Champions League tournament competing for ₦9,500 Cash, Free Memberships & Custom Website Themes!
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('tournament')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-md hover:shadow-purple-500/20 transition-all cursor-pointer"
          >
            <span>View Champions League</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. TOP 5 PRIZE CARDS SHOWCASE (1ST TO 5TH PLACE) */}
        {/* ========================================================================= */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-black font-['Outfit'] tracking-wide text-amber-300 uppercase flex items-center gap-2">
              <span>🏆 Official Prizes for Ranks 1st – 5th</span>
              <span className="text-[10px] text-slate-400 font-normal lowercase">(Refreshes 1st of every month)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Click any card to inspect reward</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {MONTHLY_PRIZES.map((tier) => (
              <div
                key={tier.rank}
                onClick={() => setSelectedPrizeTier(tier)}
                className={`p-3.5 rounded-2xl border bg-gradient-to-b ${tier.cardBg} cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{tier.icon}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${tier.badgeColor}`}>
                    Rank #{tier.rank}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-black text-white truncate font-['Outfit']">
                    {tier.cashOrVoucher}
                  </div>
                  <div className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
                    {tier.digitalPerk}
                  </div>
                </div>
                <div className="text-[10px] font-bold text-amber-300 pt-1 border-t border-white/10 flex items-center justify-between">
                  <span>{tier.totalValue}</span>
                  <span className="text-[10px] opacity-80">View Details →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. CURRENT STUDENT STANDING CARD */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 rounded-2xl p-4 sm:p-5 border border-emerald-500/30 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className={`w-13 h-13 rounded-2xl flex items-center justify-center font-black text-lg shadow-xs shrink-0 border ${
              currentUserEntry && currentUserEntry.rank <= 5 
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 animate-pulse' 
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
            }`}>
              #{currentUserEntry ? currentUserEntry.rank : (stats?.currentUserRank || 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-white font-['Outfit']">
                  {user?.name ? `${user.name}’s Standing` : 'Your National Standing'}
                </span>
                {userPrize ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 text-[10px] font-mono font-bold flex items-center gap-1">
                    <span>🎉 IN POSITION FOR: {userPrize.cashOrVoucher}</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                    Active Monthly Aspirant
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Current UTME Score: <strong className="text-emerald-400">{currentUserEntry?.score || stats?.currentUserScore || 280}/400</strong> • Accuracy: <strong className="text-cyan-300">{currentUserEntry?.accuracyPercentage || 85}%</strong> • XP: <strong className="text-purple-300">{gamification.getXp(user)} XP</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-2 md:pt-0">
            {!userPrize ? (
              <div className="text-left md:text-right text-[11px] text-slate-300">
                <div>Climb into Top 5 to win <strong className="text-amber-300">Airtime, Data & VIP Access</strong>!</div>
                <div className="text-emerald-400 font-medium">Practice 20 questions to boost your score</div>
              </div>
            ) : (
              <div className="text-left md:text-right text-[11px] text-amber-200">
                <div className="font-bold">Maintain this rank until {seasonCountdown.resetDateString}!</div>
                <div className="text-slate-400">Prizes sent via direct airtime/data top-up & WhatsApp</div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareStanding}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700 shrink-0"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedShare ? 'Copied Link!' : 'Share'}</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3B. WINNER AIRTIME CLAIM & PHONE SUBMISSION (TOP 5 WINNERS) */}
      {/* ========================================================================= */}
      {(userPrize || existingClaim || (currentUserEntry && currentUserEntry.rank <= 5) || showClaimForm) && (
        <section className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-emerald-500/10 rounded-3xl p-5 sm:p-6 border-2 border-amber-400/50 shadow-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-200/50 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                🎁
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 font-['Outfit'] flex items-center gap-2">
                  <span>Enter Your Phone Number to Receive Airtime</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    Ranks 1st – 5th
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  When you win or finish in the Top 5, provide your phone number so the Admin can send your airtime top-up directly!
                </p>
              </div>
            </div>

            {existingClaim?.phoneNumber && !showClaimForm && (
              <button
                type="button"
                onClick={() => setShowClaimForm(true)}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 underline flex items-center gap-1 cursor-pointer"
              >
                <span>Edit Phone Number</span>
              </button>
            )}
          </div>

          {claimSuccessMsg && (
            <div className="p-3.5 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{claimSuccessMsg}</span>
            </div>
          )}

          {existingClaim?.phoneNumber && !showClaimForm ? (
            <div className="bg-white rounded-2xl p-4 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  <span className="text-xs text-slate-500">Submitted Airtime Line:</span>
                  <strong className="text-sm font-bold text-slate-900 font-mono">{existingClaim.phoneNumber}</strong>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
                    {existingClaim.network || 'MTN'}
                  </span>
                </div>
                
                {/* Official Anti-Fraud Verification Code */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Official Verification Code:
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-950 font-mono font-black text-xs border border-emerald-300">
                    {existingClaim.verificationCode || `WIN-${seasonCountdown.seasonKey.replace('-', '')}-R${existingClaim.rank || 1}`}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(existingClaim.verificationCode || '');
                      setClaimSuccessMsg(`Copied verification code ${existingClaim.verificationCode} to clipboard!`);
                      setTimeout(() => setClaimSuccessMsg(null), 3000);
                    }}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Copy Verification Code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-slate-500">
                    (Give this code to Admin on WhatsApp if asked to confirm your win)
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  Prize: <strong className="text-amber-700">{existingClaim.prizeAmount || userPrize?.cashOrVoucher || 'Monthly Airtime'}</strong> • Status: {
                    existingClaim.status === 'fulfilled' ? (
                      <span className="text-emerald-700 font-bold">✅ Airtime Recharged / Sent!</span>
                    ) : (
                      <span className="text-amber-700 font-bold">📱 Received by Admin (Pending Airtime Transfer)</span>
                    )
                  }
                </div>
              </div>
              <div className="text-xs text-slate-500 font-medium md:text-right shrink-0">
                Admin is notified on the Admin Portal and via email to disburse your credit.
              </div>
            </div>
          ) : (
            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                
                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nigerian Mobile Number (Where airtime should be sent) *
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 08012345678 or 090..."
                      value={claimPhone}
                      onChange={(e) => setClaimPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Network *
                  </label>
                  <select
                    value={claimNetwork}
                    onChange={(e) => setClaimNetwork(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="MTN">MTN Nigeria</option>
                    <option value="Airtel">Airtel Nigeria</option>
                    <option value="Glo">Glo (Globacom)</option>
                    <option value="9mobile">9mobile</option>
                    <option value="OPay">OPay Account</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Optional WhatsApp Note
                  </label>
                  <input
                    type="text"
                    placeholder="Optional message"
                    value={claimNotes}
                    onChange={(e) => setClaimNotes(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Admin verifies your rank and sends airtime top-up within 24 hours of month start.</span>
                </p>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {existingClaim?.phoneNumber && (
                    <button
                      type="button"
                      onClick={() => setShowClaimForm(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submittingClaim}
                    className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingClaim ? 'Sending to Admin...' : 'Submit Phone Number to Admin'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3C. CLEAR 4-STEP REWARD GUIDE FOR ALL STUDENTS */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              🇳🇬
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 font-['Outfit']">
                How Monthly Airtime & Data Rewards Work (4 Easy Steps)
              </h3>
              <p className="text-xs text-slate-500">Every student has an equal, fair chance to win every month!</p>
            </div>
          </div>
          <button
            onClick={() => setPrizeRulesModalOpen(true)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Read Full Rules</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
              1
            </div>
            <div className="text-xs font-bold text-slate-900">Practice Daily</div>
            <div className="text-[11px] text-slate-600 leading-relaxed">
              Answer JAMB & WAEC CBT questions and take full timed mock exams to accumulate high scores and XP.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
              2
            </div>
            <div className="text-xs font-bold text-slate-900">Finish in Top 5</div>
            <div className="text-[11px] text-slate-600 leading-relaxed">
              When the month closes on the 1st, students holding Ranks 1st through 5th automatically win their rewards!
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-cyan-600 text-white font-black text-xs flex items-center justify-center">
              3
            </div>
            <div className="text-xs font-bold text-slate-900">Enter Phone Number</div>
            <div className="text-[11px] text-slate-600 leading-relaxed">
              Winners simply input their Nigerian mobile phone line (MTN, Airtel, Glo, 9mobile) right here.
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center">
              4
            </div>
            <div className="text-xs font-bold text-slate-900">Admin Sends Airtime</div>
            <div className="text-[11px] text-slate-600 leading-relaxed">
              Admin is instantly alerted and sends the airtime top-up directly to your phone. Simple & reliable!
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3D. 100% FAIR PLAY & ANTI-COPYING LEADERBOARD INTEGRITY GUARANTEE */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-5 sm:p-7 border border-emerald-500/30 shadow-xl relative overflow-hidden">
        {/* Subtle Decorative Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30 shadow-inner shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg font-['Outfit'] flex items-center gap-2">
                  <span>100% Fair Play & Anti-Copying Guaranteed</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                    Leaderboard Integrity
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Our algorithm ensures that cash and airtime rewards go exclusively to hardworking students through genuine merit.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span>Daily Question & Option Randomizer: ACTIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Shuffle className="w-4 h-4" />
                <span>1. Daily Question Randomization</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Nobody gets the same questions on any day. Each candidate receives a distinct, uniquely seeded question set each day, making it impossible to sit side-by-side or copy questions.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <Zap className="w-4 h-4" />
                <span>2. Dynamic Value & Answer Variation</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Even if two students encounter the same topic or question formula, numerical values, parameters, and roots are procedurally varied so the correct answer is genuinely different.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Lock className="w-4 h-4" />
                <span>3. Option Key Scrambling (A, B, C, D)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Every question's answer options (A, B, C, D) are permuted per student and per attempt. If Student 1 has option 'B' as correct, Student 2 has it at 'D', neutralizing answer copying completely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FILTER CONTROLS BAR: SUBJECT, EXAM TYPE & SEARCH */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          {/* Timeframe selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                timeframe === 'monthly'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>{seasonCountdown.currentMonthName} Season (Cash Prizes)</span>
            </button>
            <button
              onClick={() => setTimeframe('all-time')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeframe === 'all-time'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All-Time Records
            </button>
          </div>

          {/* Exam Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Exam:</span>
            {(['ALL', 'JAMB', 'WAEC'] as const).map(type => (
              <button
                key={type}
                onClick={() => setExamType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  examType === type
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'ALL' ? 'All Exams' : type === 'JAMB' ? 'JAMB UTME' : 'WAEC SSCE'}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Filter Pills Carousel & Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 lg:pb-0 scrollbar-none">
            {subjectFilterOptions.map(sub => {
              const active = selectedSubject === sub.id;
              const Icon = sub.icon;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 5. LEADERBOARD TABLE: REAL REGISTERED CANDIDATES + PRIZE TIERS */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="font-extrabold text-base text-slate-900 font-['Outfit'] flex items-center gap-2">
              <span>{seasonCountdown.currentMonthName} National Rankings</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                Live Authentic Data
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Only real candidates who registered and solved questions appear here.
            </p>
          </div>

          <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Top 5 lock in prizes on {seasonCountdown.resetDateString}</span>
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-100">
          {entries.length === 0 && !loading ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl mx-auto flex items-center justify-center">
                <Gift className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                  All Top 5 Prize Slots are OPEN this Month!
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Be the first student to practice questions or complete a CBT Mock Exam this month to claim the <strong>Rank #1 ₦15,000 Cash Transfer</strong> slot!
                </p>
              </div>
              <button
                onClick={() => onNavigate('practice')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Start Practice Now & Take Rank #1 →
              </button>
            </div>
          ) : (
            entries.map((student) => {
              const prize = student.rank <= 5 ? MONTHLY_PRIZES[student.rank - 1] : null;

              return (
                <div
                  key={student.id}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                    student.isCurrentUser
                      ? 'bg-emerald-50/70 border-l-4 border-l-emerald-600'
                      : student.rank <= 3
                      ? 'bg-amber-50/20'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  {/* Rank + Student Profile */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Rank Badge */}
                    <div className="flex flex-col items-center justify-center shrink-0 w-11">
                      {student.rank === 1 ? (
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
                          🥇
                        </div>
                      ) : student.rank === 2 ? (
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900 flex items-center justify-center font-black text-sm shadow-md">
                          🥈
                        </div>
                      ) : student.rank === 3 ? (
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-700 to-amber-800 text-white flex items-center justify-center font-black text-sm shadow-md">
                          🥉
                        </div>
                      ) : (
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border ${
                          student.rank <= 5 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          #{student.rank}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 font-['Outfit'] truncate">
                          {student.name}
                        </span>
                        {student.isCurrentUser && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">
                            YOU
                          </span>
                        )}
                        {/* Prize Slot Tag */}
                        {prize && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${prize.badgeColor}`}>
                            <Gift className="w-3 h-3" />
                            <span>{prize.cashOrVoucher} Slot</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{student.schoolOrCity || 'Tertiary Aspirant'}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-bold">{student.targetExam}</span>
                        {student.integrityStatus === 'verified' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Verified Hall
                          </span>
                        )}
                        {student.integrityStatus === 'flagged' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-300">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Unranked (Tab-Switched)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Performance Telemetry */}
                  <div className="flex items-center gap-3 sm:gap-5 self-end sm:self-center shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center justify-end gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>CSI Index</span>
                      </div>
                      <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
                        {student.csiScore ?? Math.round(student.score * 2.5)}
                        <span className="text-[10px] text-slate-400 font-bold ml-0.5">pts</span>
                      </div>
                    </div>

                    <div className="text-right hidden sm:block">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Mock Score
                      </div>
                      <div className="text-sm font-black text-slate-800 font-mono">
                        {student.score}
                        <span className="text-[10px] text-slate-400 font-normal">/400</span>
                      </div>
                    </div>

                    <div className="text-right hidden md:block">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Accuracy
                      </div>
                      <div className="text-sm font-bold text-emerald-700">
                        {student.accuracyPercentage}%
                      </div>
                    </div>

                    <button
                      onClick={() => setComparedStudent(student)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Compare
                    </button>
                  </div>

                </div>
              );
            })
          )}

          {/* If there are fewer than 5 registered contestants, show the open cash slots! */}
          {entries.length < 5 && (
            Array.from({ length: 5 - entries.length }).map((_, idx) => {
              const slotRank = entries.length + idx + 1;
              const slotPrize = MONTHLY_PRIZES[slotRank - 1];
              return (
                <div
                  key={`open-slot-${slotRank}`}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/40 border-dashed border-amber-300 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100/80 border border-amber-300 text-amber-900 flex items-center justify-center font-black text-xs">
                      #{slotRank}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-700 font-['Outfit']">
                          Open Prize Slot: {slotPrize?.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                          AVAILABLE
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 font-medium">
                        Reward: <strong>{slotPrize?.cashOrVoucher}</strong> + {slotPrize?.digitalPerk}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('practice')}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition-colors flex items-center gap-1 cursor-pointer self-end sm:self-center shadow-xs"
                  >
                    <span>Claim Slot Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 6. PRIZE DETAILS & CLAIM TERMS MODAL */}
      {/* ========================================================================= */}
      {(prizeRulesModalOpen || selectedPrizeTier) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-amber-300 shadow-2xl space-y-5 animate-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 font-['Outfit']">
                    Monthly Championship Prizes
                  </h3>
                  <p className="text-xs text-slate-500">
                    Refreshes on the 1st of every month at 00:00 WAT
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPrizeRulesModalOpen(false);
                  setSelectedPrizeTier(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If specific prize tier selected */}
            {selectedPrizeTier ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border bg-gradient-to-b ${selectedPrizeTier.cardBg} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{selectedPrizeTier.icon}</span>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${selectedPrizeTier.badgeColor}`}>
                      Rank #{selectedPrizeTier.rank} Prize
                    </span>
                  </div>
                  <div className="text-base font-black text-slate-900 font-['Outfit']">
                    {selectedPrizeTier.cashOrVoucher}
                  </div>
                  <div className="text-xs text-slate-600">
                    {selectedPrizeTier.digitalPerk}
                  </div>
                  <div className="text-xs font-bold text-amber-700 pt-1">
                    Total Estimated Value: {selectedPrizeTier.totalValue}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="font-bold text-slate-900 block">How Payment & Claim Works:</span>
                  <p>{selectedPrizeTier.claimInstructions}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600 max-h-[380px] overflow-y-auto pr-1">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 font-medium">
                  🇳🇬 <strong>Why we give prizes:</strong> We believe in rewarding Nigerian students for their hard academic work. Our monthly competition encourages consistent daily CBT practice so you can easily smash the 300+ cut-off mark for JAMB and 9 A1s in WAEC!
                </div>

                <div className="space-y-2 pt-2">
                  <strong className="text-slate-900 text-xs block">Key Rules & Settlement:</strong>
                  <ul className="space-y-1.5 pl-4 list-disc">
                    <li>
                      <strong>Automatic Monthly Snapshot:</strong> On the 1st day of every month at exactly 00:00 WAT, the top 5 ranking students are confirmed for the season's rewards.
                    </li>
                    <li>
                      <strong>Airtime & Data Top-ups:</strong> Sent directly to your registered MTN, Airtel, Glo, or 9mobile phone number (or OPay) within 24 hours of month-end verification.
                    </li>
                    <li>
                      <strong>StudyNaija VIP Membership:</strong> Automatically activated on the winner's account for free, unlocking unlimited Naija AI questions and unlimited timed CBT mock tests.
                    </li>
                    <li>
                      <strong>Digital Merit Certificate & Spotlight:</strong> Official signed Certificate of Academic Excellence delivered via WhatsApp/PDF, perfect for showing parents and sharing on status.
                    </li>
                    <li>
                      <strong>Fair Play & Dynamic Anti-Copying:</strong> Nobody gets the same questions on any day. Questions are dynamically generated and randomized daily. Even if a question template appears, numerical parameters and variables are altered so the correct answer is different. Answer choices (A, B, C, D) are permuted per student to make copying completely impossible and maintain total leaderboard fairness.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Direct WhatsApp Contact to Claim */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <a
                href="https://wa.me/2349166059676?text=Hello%20StudyNaija%2C%20I%20am%20inquiring%20about%20the%20Monthly%20Leaderboard%20Prizes%20and%20Claiming%20Winnings"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact Admin on WhatsApp (09166059676)</span>
              </a>

              <button
                onClick={() => {
                  setPrizeRulesModalOpen(false);
                  setSelectedPrizeTier(null);
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. STATS COMPARISON MODAL */}
      {/* ========================================================================= */}
      {comparedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                  Student Comparison
                </h3>
                <p className="text-xs text-slate-500">
                  Compare your pacing against {comparedStudent.name}
                </p>
              </div>
              <button
                onClick={() => setComparedStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] text-slate-400 font-bold block">You</span>
                <span className="text-lg font-black text-slate-900">{currentUserEntry?.score || stats?.currentUserScore || 280}</span>
                <span className="text-[10px] text-slate-500 block">Score / 400</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-[11px] text-amber-700 font-bold block">{comparedStudent.name}</span>
                <span className="text-lg font-black text-amber-900">{comparedStudent.score}</span>
                <span className="text-[10px] text-amber-700 block">Score / 400</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex justify-between">
                <span>Accuracy:</span>
                <strong className="text-slate-900">{comparedStudent.accuracyPercentage}%</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <strong className="text-slate-900">{comparedStudent.questionsAnswered}</strong>
              </div>
              <div className="flex justify-between">
                <span>Study Streak:</span>
                <strong className="text-amber-600">{comparedStudent.streakDays} Days 🔥</strong>
              </div>
            </div>

            <button
              onClick={() => {
                setComparedStudent(null);
                onNavigate('practice');
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Practice to Beat This Score →
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
