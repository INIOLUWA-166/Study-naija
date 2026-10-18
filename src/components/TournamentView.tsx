import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Crown, 
  Award, 
  Flame, 
  Zap, 
  Timer, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Vote, 
  Lock, 
  Coins, 
  Send, 
  Bot, 
  RefreshCw, 
  Play, 
  RotateCcw, 
  Smartphone, 
  Building2, 
  Gift, 
  Check, 
  X,
  ExternalLink,
  MessageSquare,
  Volume2,
  VolumeX,
  BookOpen,
  Calculator
} from 'lucide-react';
import { CBTCalculatorModal } from './CBTCalculatorModal';
import { 
  User, 
  TournamentState, 
  TournamentGroup, 
  TournamentMatch, 
  TournamentTieKnockout, 
  TournamentBankClaim, 
  Question 
} from '../types';
import { 
  tournamentManager, 
  getTournamentQuestions, 
  getGrandeFinaleQuestions, 
  getNextTournamentCountdown,
  QUALIFIED_TOP_32_SCHOLARS 
} from '../utils/tournamentManager';
import { AdminChampionsAiBattle } from './AdminChampionsAiBattle';
import { AdminChampionsCutscene } from './AdminChampionsCutscene';
import { TournamentCountdown } from './TournamentCountdown';
import { FloatingReactionToolbar } from './FloatingReactionOverlay';
import { tournamentAudio } from '../utils/tournamentAudio';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { triggerChampionsLeagueVictoryConfetti } from '../utils/confettiCelebration';

interface TournamentViewProps {
  user: User | null;
  onNavigate: (viewId: string) => void;
  onOpenAuth?: () => void;
}

export const TournamentView: React.FC<TournamentViewProps> = ({
  user,
  onNavigate,
  onOpenAuth
}) => {
  const [tournament, setTournament] = useState<TournamentState>(() => tournamentManager.getState(user));
  const [activeTab, setActiveTab] = useState<'bracket' | 'groups' | 'arena' | 'prizes' | 'ai_logs'>('bracket');
  const [selectedGroup, setSelectedGroup] = useState<string>('A');
  const [votingSuccess, setVotingSuccess] = useState<string | null>(null);
  const [showAdminBattleModal, setShowAdminBattleModal] = useState(false);
  const [showAdminCutscene, setShowAdminCutscene] = useState(true);
  const [adminPreviewStudentLocked, setAdminPreviewStudentLocked] = useState(false);

  const isAdmin = Boolean(
    user && (
      user.role === 'admin' ||
      user.email?.toLowerCase() === 'luvkidjaja@gmail.com' ||
      user.email?.toLowerCase() === 'admin@studynaija.ng'
    )
  );

  // Month & Date Calendar calculations
  const now = new Date();
  const currentDay = now.getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const currentMonthName = monthNames[now.getMonth()];
  const nextMonthName = monthNames[(now.getMonth() + 1) % 12];

  // Tournament Stages & Access Control
  const isFinalCompleted = Boolean(tournament.champion) || tournament.currentStage === 'completed';
  const isBefore12th = currentDay < 12;
  const isDuringTournament = currentDay >= 12 && !isFinalCompleted;

  // Qualification in the Top 32
  const userXp = user?.xp || 0;
  const isUserQualified = Boolean(
    isAdmin ||
    tournament.participants.some(p => (p.isCurrentUser || p.id === user?.id || (user?.email && p.email?.toLowerCase() === user.email.toLowerCase()))) ||
    userXp >= 2300
  );

  // Compute exact leaderboard standing
  let userLeaderboardRank: number | null = null;
  if (isAdmin) {
    userLeaderboardRank = 1;
  } else if (user) {
    const higherCount = QUALIFIED_TOP_32_SCHOLARS.filter(s => s.xp > userXp).length;
    userLeaderboardRank = higherCount < 32 ? higherCount + 1 : 33 + Math.floor(Math.max(0, 2300 - userXp) / 40);
  }

  // Live countdown ticker pointing to 12th of this month or 12th of next month (if final completed)
  const [countdown, setCountdown] = useState(() => getNextTournamentCountdown(isFinalCompleted));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getNextTournamentCountdown(isFinalCompleted));
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinalCompleted]);

  // Bank Claim Form state for 1st, 2nd, 3rd place winners
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState(user?.name || '');
  const [bankName, setBankName] = useState('OPay Digital Services');
  const [bankSubmitted, setBankSubmitted] = useState(false);
  const [bankSubmitting, setBankSubmitting] = useState(false);

  // Interactive 1v1 Match simulation / test state
  const [activeMatch, setActiveMatch] = useState<TournamentMatch | null>(null);
  const [matchQuestions, setMatchQuestions] = useState<Question[]>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [matchTimeRemaining, setMatchTimeRemaining] = useState(120); // 2 minutes default
  const [matchStatus, setMatchStatus] = useState<'idle' | 'in_progress' | 'rest' | 'tie_breaker' | 'completed'>('idle');
  const [restSeconds, setRestSeconds] = useState(60); // 1-minute rest between legs
  const [tieBreakerCount, setTieBreakerCount] = useState(0);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const timerRef = useRef<any>(null);
  const restTimerRef = useRef<any>(null);

  // Audio, Commentary & Simulation state
  const [isMuted, setIsMuted] = useState(() => tournamentAudio.getIsMuted());
  const [liveCommentary, setLiveCommentary] = useState<string[]>([]);
  const [simulatingMatchId, setSimulatingMatchId] = useState<string | null>(null);
  const [simulatedMatchResult, setSimulatedMatchResult] = useState<{ match: TournamentMatch; commentary: string[] } | null>(null);

  // Sync state on mount and with backend
  useEffect(() => {
    const localState = tournamentManager.getState(user);
    setTournament(localState);

    // Fetch from backend API
    api.getTournamentState?.().then(res => {
      if (res?.tournament) {
        setTournament(res.tournament);
      }
    }).catch(() => {});
  }, [user]);

  const userRankInTournament = tournament.champion?.id === user?.id 
    ? 1 
    : tournament.runnerUp?.id === user?.id 
    ? 2 
    : tournament.thirdPlace?.id === user?.id 
    ? 3 
    : null;

  // Handle voting for group kickoff time
  const handleVote = async (time: string) => {
    if (!user) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    if (!isUserQualified) {
      alert('Only the 32 qualified candidates from the previous month leaderboard can vote on the kickoff time.');
      return;
    }

    try {
      const res = tournamentManager.castVote(time, user.id);
      if (res.success) {
        setTournament({ ...res.state });
        setVotingSuccess(res.message);
        setTimeout(() => setVotingSuccess(null), 5000);
      } else {
        alert(res.message);
      }
    } catch {
      alert('Failed to submit vote. Please retry.');
    }
  };

  // Handle Bank Account Submission
  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!accountNumber || accountNumber.length < 10) {
      alert('Please enter a valid 10-digit Nigerian NUBAN account number.');
      return;
    }
    if (!accountName.trim()) {
      alert('Please enter your account beneficiary name.');
      return;
    }

    setBankSubmitting(true);
    try {
      const res = tournamentManager.submitBankClaim({
        userId: user.id,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        bankName
      });
      setBankSubmitted(true);
      setTournament(tournamentManager.getState(user));
      try {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      } catch {}
    } catch {
      alert('Failed to save bank details. Please retry.');
    } finally {
      setBankSubmitting(false);
    }
  };

  // Launch interactive match
  const handleStartMatch = (match: TournamentMatch, isFinale = false) => {
    setActiveMatch(match);
    const qs = isFinale ? getGrandeFinaleQuestions() : getTournamentQuestions(match.subjectId, 10);
    setMatchQuestions(qs);
    setCurrentQIdx(0);
    setUserScore(0);
    setOpponentScore(0);
    const duration = isFinale ? 480 : (match.subjectId === 'mathematics' ? 300 : 120);
    setMatchTimeRemaining(duration);
    setMatchStatus('in_progress');
    setActiveTab('arena');

    // Real-time commentary and stadium sounds
    setLiveCommentary([
      `⏱️ 00:00 - Referee double-whistle sounded! Kickoff in the National Champions Arena!`,
      `⚔️ Clash: ${match.player1.name} faces off against ${match.player2.name} in ${match.subjectId.toUpperCase()}!`,
      `📢 45,000 cheering scholars in the digital stands.`
    ]);
    tournamentAudio.playWhistle();
    tournamentAudio.playCrowdCheer(1.8);
  };

  // In-match timer loop (auto-submits on 2 mins or 5 mins for math)
  useEffect(() => {
    if (matchStatus === 'in_progress' && !isCalculatorOpen) {
      timerRef.current = setInterval(() => {
        setMatchTimeRemaining(prev => {
          if (prev <= 10 && prev > 1) {
            tournamentAudio.playTimerTick();
          }
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmitMatch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [matchStatus, userScore, opponentScore, isCalculatorOpen]);

  // Handle answering question in 1v1 arena
  const handleAnswerMatchQ = (optKey: string) => {
    const q = matchQuestions[currentQIdx];
    if (!q) return;
    const isCorrect = optKey === q.correctOption;
    if (isCorrect) {
      setUserScore(prev => prev + 1);
      tournamentAudio.playCorrect();
      setLiveCommentary(prev => [
        `⏱️ Question #${currentQIdx + 1}: ${user?.name || 'You'} locked in correct Option ${optKey}! Point awarded! ⚡`,
        ...prev.slice(0, 8)
      ]);
    } else {
      tournamentAudio.playWrong();
      setLiveCommentary(prev => [
        `⏱️ Question #${currentQIdx + 1}: Option ${optKey} missed. Correct was Option ${q.correctOption}.`,
        ...prev.slice(0, 8)
      ]);
    }

    // Opponent AI simulation (authentic human-like accuracy 70-85%)
    const oppCorrect = Math.random() < 0.75;
    if (oppCorrect) {
      setOpponentScore(prev => prev + 1);
      setLiveCommentary(prev => [
        `⏱️ Opponent ${activeMatch?.player2.name || 'Rival'} answered Question #${currentQIdx + 1} correctly!`,
        ...prev.slice(0, 8)
      ]);
    }

    if (currentQIdx < matchQuestions.length - 1) {
      setCurrentQIdx(prev => prev + 1);
    } else {
      // Completed current leg/set
      handleFinishLeg();
    }
  };

  // Finish match leg and check for tie-breaker or rest time
  const handleFinishLeg = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    // If scores are tied, trigger immediate 5 tie-breaker questions (NO DRAWS ALLOWED)
    if (userScore === opponentScore) {
      setMatchStatus('tie_breaker');
      const tieQs = getTournamentQuestions('mathematics', 5);
      setMatchQuestions(tieQs);
      setCurrentQIdx(0);
      setMatchTimeRemaining(60);
      setTieBreakerCount(prev => prev + 1);
      tournamentAudio.playWhistle();
      setLiveCommentary(prev => [
        `⚡ DRAMATIC DEADLOCK! Tie-breaker penalty shootout activated! 5 sudden-death questions!`,
        ...prev
      ]);
      return;
    }

    // If this is round of 16 to semis and leg 1, start 1-minute rest time before 2nd round
    if (activeMatch && activeMatch.leg === 1) {
      setMatchStatus('rest');
      setRestSeconds(60);
      setLiveCommentary(prev => [
        `⏸️ Half-Time / Inter-Leg Rest! 60-second recovery before Leg 2 kickoff.`,
        ...prev
      ]);
      restTimerRef.current = setInterval(() => {
        setRestSeconds(prev => {
          if (prev <= 1) {
            clearInterval(restTimerRef.current);
            // Launch Leg 2
            const leg2Qs = getTournamentQuestions('physics', 10);
            setMatchQuestions(leg2Qs);
            setCurrentQIdx(0);
            setMatchTimeRemaining(120);
            setMatchStatus('in_progress');
            tournamentAudio.playWhistle();
            tournamentAudio.playCrowdCheer(1.5);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return;
    }

    setMatchStatus('completed');
    tournamentAudio.playWhistle();

    if (userScore > opponentScore) {
      triggerChampionsLeagueVictoryConfetti();
      tournamentAudio.playCrowdCheer(2.5);

      // CROWN G.O.A.T IF THIS WAS THE GRANDE FINALE!
      const isFinale = activeMatch && (activeMatch.round === 'final' || activeMatch.id?.includes('final'));
      if (isFinale && user) {
        const updated = tournamentManager.recordCandidateGrandeFinaleWin(user, activeMatch.player2);
        setTournament(updated);
        tournamentAudio.playChampionsFanfare();
        tournamentAudio.playGoatHorn();
      }
    }
  };

  const handleAutoSubmitMatch = () => {
    handleFinishLeg();
  };

  // Quick Match Simulation for realistic bracket interactions
  const handleQuickSimulateMatch = (matchId: string) => {
    setSimulatingMatchId(matchId);
    tournamentAudio.playWhistle();
    setTimeout(() => {
      const res = tournamentManager.simulateMatchRealistic(matchId);
      setTournament(tournamentManager.getState(user));
      setSimulatedMatchResult(res);
      setSimulatingMatchId(null);
      tournamentAudio.playCrowdCheer(1.5);
    }, 700);
  };

  // Simulate entire group
  const handleSimulateGroup = (groupId: string) => {
    tournamentAudio.playWhistle();
    const updated = tournamentManager.simulateEntireGroup(groupId);
    setTournament(updated);
    tournamentAudio.playCrowdCheer(2.0);
  };

  // Admin AI Start New Season & Revoke Privileges Handler
  const handleTriggerAdminAiRevocation = () => {
    const res = tournamentManager.adminAiStartNewSeasonAndRevokePrivileges(user);
    setTournament(res.updatedTournament);
    fetch('/api/tournament/admin-ai-start-new-season', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id, email: user?.email })
    }).catch(() => {});
  };

  return (
    <div id="champions-league-tournament" className="space-y-8 pb-20">
      
      {/* ========================================================================= */}
      {/* 1. HERO HEADER: CHAMPIONS LEAGUE BRANDING */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-amber-400/30 shadow-2xl relative overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/40">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>StudyNaija Monthly Champions League</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                OFFICIAL CUP
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-['Outfit'] tracking-tight">
              The Academic Champions League
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Nigeria's premier monthly academic tournament. Top 32 merit candidates from the previous month leaderboard 
              clash in 8 Groups of 4, followed by two-legged knockout ties, a 1-day break, and a 4-subject Grande Finale. 
              <strong> ₦9,500 Total Cash & Free Memberships</strong> awarded automatically by the Admin AI Assistant!
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Users className="w-4 h-4" />
                <span>32 Qualified Scholars (Humans Only)</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                <Clock className="w-4 h-4" />
                <span>2-Min Speed Timer (5m Math)</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
                <span>1v1 Knockout (No Draws Allowed)</span>
              </div>
            </div>
          </div>

          {/* Quick Prize Highlights Card */}
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-amber-400/30 shadow-xl space-y-3 shrink-0 w-full md:w-80">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold text-slate-400">Monthly Tournament Prizes</span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">Auto-Activated by AI</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-400/30">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>🥇 1st Place:</span>
                </span>
                <span className="font-black text-white">₦5,000 + Gold Theme</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <span>🥈 2nd Place:</span>
                </span>
                <span className="font-black text-white">₦3,000 + Diamond Theme</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-300/10 border border-slate-300/30">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <span>🥉 3rd Place:</span>
                </span>
                <span className="font-black text-white">₦1,500 + Platinum Theme</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1B. LIVE KICKOFF COUNTDOWN (NOBODY HAS WON YET) */}
      {/* ========================================================================= */}
      <TournamentCountdown variant="banner" onNavigate={onNavigate} />

      {/* Admin Simulator & Cutscene Banner */}
      {isAdmin && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-2 border-amber-500/60 p-4 sm:p-5 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0 animate-bounce">
              🎬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-300 uppercase font-mono">
                  Site Owner Godmode
                </span>
                <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  Admin Access
                </span>
              </div>
              <h4 className="text-sm font-black text-white font-['Outfit']">
                Play Champions League with AI (Cinematic Intro Cutscene)
              </h4>
              <p className="text-xs text-slate-300">
                Experience the stadium fanfare cutscene and battle AI with guaranteed 100% win rate.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAdminBattleModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-slate-950 font-black text-xs tracking-wider shadow-md hover:scale-105 transition-all flex items-center gap-2 shrink-0 cursor-pointer font-['Outfit']"
          >
            <Trophy className="w-4 h-4 text-slate-950" />
            <span>🎬 PLAY CUTSCENE & AI BATTLE</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. OFFICIAL TOURNAMENT SCHEDULE STRIP */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 font-['Outfit']">
              Official Monthly Championship Schedule
            </h3>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500">
            Knockouts Start at 8:00 PM WAT
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1">
            <div className="text-[10px] font-black text-amber-800 uppercase tracking-wider">1st – 11th</div>
            <div className="text-xs font-bold text-slate-900">Gold Kickoff Vote</div>
            <div className="text-[10px] text-slate-600">32 Candidates vote on time</div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 space-y-1">
            <div className="text-[10px] font-black text-blue-800 uppercase tracking-wider">12th of Month</div>
            <div className="text-xs font-bold text-slate-900">8 Group Games</div>
            <div className="text-[10px] text-slate-600">Win=3pts, Loss=1pt (No draws)</div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 space-y-1">
            <div className="text-[10px] font-black text-indigo-800 uppercase tracking-wider">13th of Month</div>
            <div className="text-xs font-bold text-slate-900">Round of 16</div>
            <div className="text-[10px] text-slate-600">2 Legs, 1-min rest</div>
          </div>

          <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 space-y-1">
            <div className="text-[10px] font-black text-purple-800 uppercase tracking-wider">14th of Month</div>
            <div className="text-xs font-bold text-slate-900">Quarter Finals</div>
            <div className="text-[10px] text-slate-600">Top 8 battle in 2 legs</div>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 space-y-1">
            <div className="text-[10px] font-black text-rose-800 uppercase tracking-wider">15th of Month</div>
            <div className="text-xs font-bold text-slate-900">Semi Finals</div>
            <div className="text-[10px] text-slate-600">Finalists & 3rd playoff set</div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
            <div className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">17th (16th Rest)</div>
            <div className="text-xs font-bold text-slate-900">Grande Finale</div>
            <div className="text-[10px] text-slate-600">All 4 subjects + 3rd playoff</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. GOLD VOTING BAR (SHOWN TO QUALIFIED 32 CANDIDATES AT START OF MONTH) */}
      {/* ========================================================================= */}
      {isUserQualified && (
        <section className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 rounded-3xl p-5 sm:p-6 border-2 border-amber-500 shadow-xl space-y-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                🗳️
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg font-['Outfit'] flex items-center gap-2">
                  <span>Gold Voting Bar: Vote on Group Stage Kickoff Time</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950 text-amber-300">
                    Qualified Top 32 Candidate
                  </span>
                </h3>
                <p className="text-xs text-slate-800 font-medium">
                  Voting ends on the 11th at 23:59 WAT. The time with the most votes will host all Group Stage games on the 12th.
                </p>
              </div>
            </div>

            <div className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-950/10 border border-slate-950/20">
              Selected Leading Time: <strong>{tournament.winningGroupStartTime}</strong>
            </div>
          </div>

          {votingSuccess && (
            <div className="p-3 bg-slate-950 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{votingSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {tournament.votingOptions.map((opt) => {
              const isVoted = opt.voterIds.includes(user?.id || '');
              return (
                <button
                  key={opt.time}
                  onClick={() => handleVote(opt.time)}
                  className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isVoted 
                      ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-slate-950/40' 
                      : 'bg-white hover:bg-amber-50 text-slate-950 border-amber-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-sm">{opt.time}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isVoted ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {opt.votes} Votes
                    </span>
                  </div>
                  <div className={`text-xs font-medium ${isVoted ? 'text-amber-300' : 'text-slate-700'}`}>
                    {opt.label}
                  </div>
                  {isVoted && (
                    <div className="text-[10px] text-emerald-400 font-bold mt-2 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Your Cast Vote</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. WINNER BANK ACCOUNT SUBMISSION MESSAGE BAR (1st, 2nd, 3rd) */}
      {/* ========================================================================= */}
      {userRankInTournament && (
        <section className={`rounded-3xl p-5 sm:p-7 border-2 shadow-2xl relative overflow-hidden ${
          userRankInTournament === 1 
            ? 'bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-yellow-500/20 border-amber-400' 
            : userRankInTournament === 2 
            ? 'bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-blue-500/20 border-cyan-400' 
            : 'bg-gradient-to-br from-slate-400/20 via-slate-400/10 to-slate-200/20 border-slate-400'
        }`}>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                  {userRankInTournament === 1 ? '🥇' : userRankInTournament === 2 ? '🥈' : '🥉'}
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 font-['Outfit']">
                    Congratulations! You placed {userRankInTournament === 1 ? '1st' : userRankInTournament === 2 ? '2nd' : '3rd'} in the Champions League!
                  </h3>
                  <p className="text-xs text-slate-700">
                    Your {userRankInTournament === 1 ? '1-Month Free Premium' : userRankInTournament === 2 ? '1-Month Free Medium' : '1-Month Free Basic'} membership has been <strong>automatically activated</strong> by the Admin AI Assistant!
                  </p>
                </div>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-mono font-black text-sm shrink-0">
                Prize: {userRankInTournament === 1 ? '₦5,000 Cash' : userRankInTournament === 2 ? '₦3,000 Cash' : '₦1,500 Cash'}
              </div>
            </div>

            {bankSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  Your bank details ({bankName} - {accountNumber}) have been securely delivered to the Admin Portal. 
                  Your airtime/cash transfer will be disbursed shortly!
                </div>
              </div>
            ) : (
              <form onSubmit={handleBankSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
                <div className="text-xs font-bold text-slate-800">
                  Fill in your Nigerian Bank Account details to receive your cash reward:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      10-Digit Account Number
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="e.g. 0123456789"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Account Beneficiary Name
                    </label>
                    <input
                      type="text"
                      placeholder="Account Full Name"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Select Bank / Wallet
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="OPay Digital Services">OPay Digital Services</option>
                      <option value="PalmPay Limited">PalmPay Limited</option>
                      <option value="Kuda Microfinance Bank">Kuda Bank</option>
                      <option value="Moniepoint MFB">Moniepoint</option>
                      <option value="GTBank (Guaranty Trust)">GTBank</option>
                      <option value="Access Bank Plc">Access Bank</option>
                      <option value="Zenith Bank Plc">Zenith Bank</option>
                      <option value="First Bank of Nigeria">First Bank</option>
                      <option value="United Bank for Africa (UBA)">UBA</option>
                      <option value="Fidelity Bank">Fidelity Bank</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">
                    🔒 Automatically encrypted and routed to the StudyNaija Admin Cash Management Portal.
                  </span>
                  <button
                    type="submit"
                    disabled={bankSubmitting}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>{bankSubmitting ? 'Sending to Admin...' : 'Submit Bank Details for Cash Transfer'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. GLOBAL CHAMPION CELEBRATION BANNER */}
      {/* ========================================================================= */}
      {tournament.champion && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-3xl p-5 text-slate-950 border border-amber-600/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-950">
                Official Grande Finale Result
              </div>
              <div className="text-base sm:text-lg font-black font-['Outfit']">
                {tournament.champion.name} is the National Champion! (Score: 37/40 in all 4 subjects)
              </div>
              <div className="text-xs text-amber-900 font-medium">
                Admin AI Assistant has credited ₦5,000 cash and activated 1-Month Free Premium membership with Gold site honors.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('community')}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Congratulate Champion in Community</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TOURNAMENT PROTOCOL STATUS & COUNTDOWN BANNER */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border-2 border-cyan-500/40 p-6 sm:p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-400/40 text-amber-300 flex items-center justify-center font-black text-3xl shadow-lg shrink-0">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-500/30 uppercase">
                  {isDuringTournament ? 'Tournament Live & Active' : 'Monthly Champions Protocol'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/40">
                  {isFinalCompleted ? 'Grande Finale Concluded' : `Kickoff: ${currentMonthName} 12th`}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  Top 32 Merit Championship
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] mt-1 text-white">
                StudyNaija Monthly Champions League 🏆
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
                Compete across two-legged aggregate knockout fixtures, sudden-death tiebreakers, and 4-subject grand finals. 
                Play official bracket matches or challenge top AI scholars in the 1v1 Arena!
              </p>
            </div>
          </div>

          {/* Countdown & Quick Action Badge */}
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 text-center shrink-0 w-full md:w-auto min-w-[210px] space-y-2">
            <span className="text-[11px] font-mono text-cyan-400 font-bold block uppercase tracking-wider">
              {isDuringTournament ? 'Tournament Window Active' : 'Kickoff Countdown'}
            </span>
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
            </div>
            <button
              onClick={() => {
                setActiveTab('arena');
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 text-slate-950 font-black text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Launch 1v1 Arena Now</span>
            </button>
          </div>
        </div>

        {/* Qualification Standing Status Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Your Contender Standing</span>
            <div className="text-xl font-black font-['Outfit'] text-white">
              {userLeaderboardRank ? `Rank #${userLeaderboardRank}` : 'Unranked Contender'}
            </div>
            <p className="text-[11px] text-slate-400">
              {isUserQualified 
                ? '🎉 Qualified Contender! You can enter all bracket and group matches.' 
                : 'Top 32 qualification active. You can play exhibition matches anytime!'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Your Academic Merit XP</span>
            <div className="text-xl font-black font-['Outfit'] text-cyan-300">
              {userXp.toLocaleString()} XP
            </div>
            <p className="text-[11px] text-slate-400">
              {userXp >= 2300 
                ? 'Met the 2,300+ XP Top 32 qualification threshold!' 
                : `${Math.max(0, 2300 - userXp)} more XP recommended for automatic seeding.`}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Quick Contender Action</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const sampleMatch = tournament.groups[0].matches[0];
                  handleStartMatch(sampleMatch);
                }}
                className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Play 1v1 Match</span>
              </button>
              <button
                onClick={() => setShowAdminBattleModal(true)}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
                title="Play UEFA Champions League Intro & Match with AI"
              >
                <span>Anthem & AI 🏆</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. ALL TABS ARE PERMANENTLY ACCESSIBLE */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {/* Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bracket')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'bracket' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Knockout Bracket</span>
          </button>

          <button
            onClick={() => setActiveTab('groups')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'groups' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>8 Groups (A to H)</span>
          </button>

          <button
            onClick={() => setActiveTab('arena')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'arena' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>1v1 Match Arena & Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('prizes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'prizes' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-purple-400" />
            <span>Rewards & Hall of Fame</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_logs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'ai_logs' 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Orchestrator Logs</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. TAB CONTENT: KNOCKOUT BRACKET */}
      {/* ========================================================================= */}
      {activeTab === 'bracket' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 font-['Outfit']">
                Two-Legged Knockout Rounds
              </h2>
              <p className="text-xs text-slate-500">
                1st leg & 2nd leg aggregate scoring. Winner advances to next round. If tied, 5-question sudden death determines victor!
              </p>
            </div>

            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              1-Minute Rest Between Legs
            </div>
          </div>

          {/* Knockout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Round of 16 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Round of 16 (13th)</span>
                <span className="text-[10px] font-mono text-slate-500">8 Ties</span>
              </div>

              {tournament.r16Ties.map((tie) => (
                <div key={tie.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Tie #{tie.tieIndex}</span>
                    <span className="text-emerald-600 font-bold">2 Legs Agg</span>
                  </div>

                  <div className="space-y-1">
                    <div className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-bold ${
                      tie.winnerId === tie.player1.id ? 'bg-emerald-50 text-emerald-950 font-black' : 'text-slate-700'
                    }`}>
                      <span className="truncate">{tie.player1.name}</span>
                      <span className="font-mono text-xs">{tie.aggregatePlayer1Score}</span>
                    </div>

                    <div className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-bold ${
                      tie.winnerId === tie.player2.id ? 'bg-emerald-50 text-emerald-950 font-black' : 'text-slate-700'
                    }`}>
                      <span className="truncate">{tie.player2.name}</span>
                      <span className="font-mono text-xs">{tie.aggregatePlayer2Score}</span>
                    </div>
                  </div>

                  {/* Match Play Button - Available to all students */}
                  {!tie.isCompleted && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => handleStartMatch(tie.leg1Match)}
                        className="flex-1 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Play Match →</span>
                      </button>
                      <button
                        onClick={() => handleQuickSimulateMatch(tie.leg1Match.id)}
                        disabled={simulatingMatchId === tie.leg1Match.id}
                        className="px-2 py-1.5 text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Simulate with AI"
                      >
                        Sim
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quarter Finals */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Quarter Finals (14th)</span>
                <span className="text-[10px] font-mono text-slate-500">4 Ties</span>
              </div>

              {tournament.quarterTies.map((tie) => (
                <div key={tie.id} className="p-3.5 rounded-2xl bg-white border border-purple-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>QF #{tie.tieIndex}</span>
                    <span className="text-purple-600 font-bold">2 Legs</span>
                  </div>

                  <div className="space-y-1">
                    <div className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-bold ${
                      tie.winnerId === tie.player1.id ? 'bg-purple-50 text-purple-950 font-black' : 'text-slate-700'
                    }`}>
                      <span className="truncate">{tie.player1.name}</span>
                      <span className="font-mono text-xs">{tie.aggregatePlayer1Score}</span>
                    </div>

                    <div className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-bold ${
                      tie.winnerId === tie.player2.id ? 'bg-purple-50 text-purple-950 font-black' : 'text-slate-700'
                    }`}>
                      <span className="truncate">{tie.player2.name}</span>
                      <span className="font-mono text-xs">{tie.aggregatePlayer2Score}</span>
                    </div>
                  </div>

                  {/* Match Play Button - Play or simulate */}
                  {!tie.isCompleted && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => handleStartMatch(tie.leg1Match)}
                        className="flex-1 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Play Match →</span>
                      </button>
                      <button
                        onClick={() => handleQuickSimulateMatch(tie.leg1Match.id)}
                        disabled={simulatingMatchId === tie.leg1Match.id}
                        className="px-2 py-1.5 text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Simulate with AI"
                      >
                        Sim
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Semi Finals */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Semi Finals (15th)</span>
                <span className="text-[10px] font-mono text-slate-500">2 Ties</span>
              </div>

              {tournament.semiTies.map((tie) => (
                <div key={tie.id} className="p-3.5 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>SF #{tie.tieIndex}</span>
                    <span className="text-rose-600 font-bold">2 Legs</span>
                  </div>

                  <div className="space-y-1">
                    <div className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-bold ${
                      tie.winnerId === tie.player1.id ? 'bg-rose-50 text-rose-950 font-black' : 'text-slate-700'
                    }`}>
                      <span className="truncate">{tie.player1.name}</span>
                      <span className="font-mono text-xs">{tie.aggregatePlayer1Score}</span>
                    </div>

                    <div className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-bold ${
                      tie.winnerId === tie.player2.id ? 'bg-rose-50 text-rose-950 font-black' : 'text-slate-700'
                    }`}>
                      <span className="truncate">{tie.player2.name}</span>
                      <span className="font-mono text-xs">{tie.aggregatePlayer2Score}</span>
                    </div>
                  </div>

                  {/* Match Play Button - Play or simulate */}
                  {!tie.isCompleted && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => handleStartMatch(tie.leg1Match)}
                        className="flex-1 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Play Match →</span>
                      </button>
                      <button
                        onClick={() => handleQuickSimulateMatch(tie.leg1Match.id)}
                        disabled={simulatingMatchId === tie.leg1Match.id}
                        className="px-2 py-1.5 text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        title="Simulate with AI"
                      >
                        Sim
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Grande Finale & 3rd Place Playoff */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-amber-700 uppercase tracking-wider">Grande Finale (17th)</span>
                <span className="text-[10px] font-mono font-bold text-amber-600">4 Subjects</span>
              </div>

              {tournament.finalTie && (
                <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-50 to-white border-2 border-amber-400 shadow-md space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                    <span>👑 Championship Match</span>
                    <span className="text-amber-700">40 Qs Total</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-amber-100/70 border border-amber-300 text-xs font-black text-amber-950">
                      <span>🥇 {tournament.finalTie.player1.name}</span>
                      <span className="font-mono text-sm">{tournament.finalTie.aggregatePlayer1Score}/40</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
                      <span>🥈 {tournament.finalTie.player2.name}</span>
                      <span className="font-mono text-sm">{tournament.finalTie.aggregatePlayer2Score}/40</span>
                    </div>
                  </div>

                  {/* Play Finale Button */}
                  {!tournament.finalTie.isCompleted && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => handleStartMatch(tournament.finalTie!.leg1Match, true)}
                        className="flex-1 py-2 text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Play 4-Subject Finale</span>
                      </button>
                      <button
                        onClick={() => handleQuickSimulateMatch(tournament.finalTie!.leg1Match.id)}
                        disabled={simulatingMatchId === tournament.finalTie!.leg1Match.id}
                        className="px-2.5 py-2 text-[10px] font-bold text-slate-700 bg-amber-100 hover:bg-amber-200 rounded-xl transition-all cursor-pointer"
                        title="Simulate Finale"
                      >
                        Sim
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 3rd Place Playoff Card */}
              {tournament.thirdPlaceTie && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-300 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span>🥉 3rd Place Play-Off</span>
                    <span className="text-slate-500">2 Legs</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>{tournament.thirdPlaceTie.player1.name}</span>
                      <span className="font-mono">{tournament.thirdPlaceTie.aggregatePlayer1Score}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>{tournament.thirdPlaceTie.player2.name}</span>
                      <span className="font-mono">{tournament.thirdPlaceTie.aggregatePlayer2Score}</span>
                    </div>
                  </div>

                  {/* Play 3rd Place Button */}
                  {!tournament.thirdPlaceTie.isCompleted && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => handleStartMatch(tournament.thirdPlaceTie!.leg1Match)}
                        className="flex-1 py-1.5 text-[11px] font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-lg cursor-pointer text-center flex items-center justify-center gap-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Play 3rd Place Match</span>
                      </button>
                      <button
                        onClick={() => handleQuickSimulateMatch(tournament.thirdPlaceTie!.leg1Match.id)}
                        disabled={simulatingMatchId === tournament.thirdPlaceTie!.leg1Match.id}
                        className="px-2 py-1.5 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Sim
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. TAB CONTENT: 8 GROUPS (A to H) */}
      {/* ========================================================================= */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900 font-['Outfit']">
                Group Stage: 8 Groups (A to H)
              </h2>
              <p className="text-xs text-slate-500">
                4 candidates per group. 10 questions per match. Win = 3 points, Loss = 1 point. Top 2 advance to Round of 16.
              </p>
            </div>

            {/* Group Selector Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {tournament.groups.map(g => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroup(g.id)}
                  className={`w-9 h-9 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    selectedGroup === g.id 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {g.id}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Group Table & Matches */}
          {(() => {
            const grp = tournament.groups.find(g => g.id === selectedGroup) || tournament.groups[0];
            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Standings Table (2 Columns on large screens) */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-black text-base text-slate-900 font-['Outfit'] flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                        {grp.id}
                      </span>
                      <span>{grp.name} Standings</span>
                    </h3>
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Top 2 Advance to R16
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
                          <th className="py-2.5 px-3">Pos</th>
                          <th className="py-2.5 px-3">Candidate</th>
                          <th className="py-2.5 px-2 text-center">P</th>
                          <th className="py-2.5 px-2 text-center">W</th>
                          <th className="py-2.5 px-2 text-center">L</th>
                          <th className="py-2.5 px-2 text-center">Correct Qs</th>
                          <th className="py-2.5 px-3 text-right">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {grp.standings.map((s, idx) => (
                          <tr key={s.participantId} className={idx < 2 ? 'bg-emerald-50/40 font-bold' : ''}>
                            <td className="py-3 px-3 font-mono font-bold">
                              {idx < 2 ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px]">
                                  {idx + 1}
                                </span>
                              ) : (
                                <span className="text-slate-400 pl-1.5">{idx + 1}</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-extrabold text-slate-900 flex items-center gap-2">
                                <span>{s.participantName}</span>
                                {idx < 2 && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                                    Q
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center font-mono">{s.played}</td>
                            <td className="py-3 px-2 text-center font-mono text-emerald-700">{s.won}</td>
                            <td className="py-3 px-2 text-center font-mono text-slate-400">{s.lost}</td>
                            <td className="py-3 px-2 text-center font-mono">{s.correctAnswers}</td>
                            <td className="py-3 px-3 text-right font-mono font-black text-sm text-slate-900">
                              {s.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-2 flex items-center gap-2 border-t border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Scoring rule: Win = 3 points, Loss = 1 point. In case of ties, sudden-death 5 questions determine winner.</span>
                  </div>
                </div>

                {/* Group Matches */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="font-black text-sm text-slate-900 font-['Outfit']">
                      Group {grp.id} Fixtures & Results
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">6 Matches</span>
                  </div>

                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {grp.matches.map((m) => (
                      <div key={m.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Match #{m.matchNumber} • {m.subjectId.toUpperCase()}</span>
                          <span className="text-emerald-700 font-bold">FT</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={`truncate max-w-[120px] ${m.winnerId === m.player1.id ? 'font-black text-slate-950' : 'text-slate-600'}`}>
                            {m.player1.name}
                          </span>
                          <span className="font-mono font-black px-2 py-0.5 rounded bg-white border text-slate-900">
                            {m.player1Score} - {m.player2Score}
                          </span>
                          <span className={`truncate max-w-[120px] text-right ${m.winnerId === m.player2.id ? 'font-black text-slate-950' : 'text-slate-600'}`}>
                            {m.player2.name}
                          </span>
                        </div>

                        {/* Match Play Button - Play or simulate any group match */}
                        {!m.isCompleted && (
                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              onClick={() => handleStartMatch(m)}
                              className="flex-1 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg cursor-pointer transition-colors text-center shadow-xs flex items-center justify-center gap-1"
                            >
                              <Play className="w-3 h-3" />
                              <span>Play 1v1 Match</span>
                            </button>
                            <button
                              onClick={() => handleQuickSimulateMatch(m.id)}
                              disabled={simulatingMatchId === m.id}
                              className="px-2 py-1 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Simulate with AI"
                            >
                              Sim
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. TAB CONTENT: 1V1 MATCH ARENA SIMULATOR (WITH 2-MIN TIMER & TIE-BREAKER) */}
      {/* ========================================================================= */}
      {activeTab === 'arena' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 font-['Outfit'] flex items-center gap-2">
                <span>1v1 Tournament CBT Arena Simulator</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-900">
                  {matchStatus === 'tie_breaker' ? 'Sudden Death Tie-Breaker' : matchStatus === 'rest' ? '1-Min Rest Period' : 'Live Speed Drill'}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Official 1v1 match environment with a strict 2-minute timer (5 minutes for Mathematics). Timer runs continuously even if browser is closed!
              </p>
            </div>

            {matchStatus === 'in_progress' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCalculatorOpen(true)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                  title="Open Calculator (Pauses Match Timer for 1 Minute)"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Calculator</span>
                </button>
                <div className={`px-4 py-2 rounded-2xl font-mono font-black text-base flex items-center gap-2 ${
                  matchTimeRemaining <= 30 ? 'bg-red-950 text-red-300 animate-pulse border-2 border-red-500' : 'bg-slate-900 text-emerald-400'
                }`}>
                  <Timer className="w-4 h-4" />
                  <span>{Math.floor(matchTimeRemaining / 60)}:{(matchTimeRemaining % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>
            )}
          </div>

          {matchStatus === 'idle' && (
            <div className="text-center py-12 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-black text-2xl mx-auto shadow-inner">
                ⚔️
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Ready to Experience a Tournament 1v1 Match?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-lg mx-auto">
                Test your academic speed against top qualified Nigerian candidates under official 2-minute exam constraints. 
                If answers tie, an instant 5-question sudden-death tiebreaker triggers!
              </p>

              {/* Match Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-left">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-cyan-400 transition-colors space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-700 uppercase">Match 1 • Group A</span>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">Vs. Chukwuebuka Obi</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Top Seed • 368 Score • English Lexis</p>
                  </div>
                  <button
                    onClick={() => {
                      const match = tournament.groups[0].matches[0];
                      handleStartMatch(match);
                    }}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 text-cyan-400" />
                    <span>Challenge Seed #1</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-400 transition-colors space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">Match 2 • Group B</span>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">Vs. Amina Bello</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Seed #2 • 362 Score • Mathematics</p>
                  </div>
                  <button
                    onClick={() => {
                      const match = tournament.groups[1]?.matches[0] || tournament.groups[0].matches[1];
                      handleStartMatch(match);
                    }}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Challenge Seed #2</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-300 hover:border-amber-400 transition-colors space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-800 uppercase">Grande Finale • 40 Qs</span>
                    <h4 className="font-bold text-xs text-slate-950 line-clamp-1">4-Subject National Final</h4>
                    <p className="text-[11px] text-amber-900 mt-0.5">Eng, Math, Phy, Chem • Crown Championship</p>
                  </div>
                  <button
                    onClick={() => {
                      handleStartMatch(tournament.finalTie!.leg1Match, true);
                    }}
                    className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-xs transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Trophy className="w-3 h-3" />
                    <span>Enter Grande Finale</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setShowAdminBattleModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Launch UEFA Star Stadium Intro & AI Battle</span>
                </button>
              </div>
            </div>
          )}

          {matchStatus === 'rest' && (
            <div className="text-center py-12 space-y-4 bg-emerald-50/60 rounded-3xl p-6 border border-emerald-200">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xl mx-auto animate-pulse">
                ⏱️
              </div>
              <h3 className="font-black text-lg text-emerald-950 font-['Outfit']">
                1-Minute Knockout Rest Period Active
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Leg 1 is finished! In official Champions League rules, candidates get exactly 1 minute to catch their breath 
                before Leg 2 starts automatically.
              </p>
              <div className="font-mono font-black text-3xl text-emerald-950">
                00:{restSeconds.toString().padStart(2, '0')}
              </div>
            </div>
          )}

          {matchStatus === 'tie_breaker' && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 text-xs font-bold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <strong>NO DRAWS ALLOWED!</strong> Match ended in a draw ({userScore} - {opponentScore}). 
                Admin AI has instantly deployed <strong>5 Sudden-Death Tie-Breaker Questions</strong>! First to pull ahead wins.
              </div>
            </div>
          )}

          {matchStatus === 'in_progress' && matchQuestions.length > 0 && (
            <div className="space-y-6">
              {/* Scoreboard Strip */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    You
                  </div>
                  <div>
                    <div className="text-xs font-extrabold">{user?.name || 'Your Candidate'}</div>
                    <div className="text-[10px] text-slate-400">Score: {userScore} Correct</div>
                  </div>
                </div>

                <div className="text-center px-4">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Question {currentQIdx + 1} of {matchQuestions.length}
                  </div>
                  <div className="text-xl font-black font-mono text-amber-400">
                    {userScore} : {opponentScore}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-right">
                  <div>
                    <div className="text-xs font-extrabold">{activeMatch?.player2.name || 'Opponent'}</div>
                    <div className="text-[10px] text-slate-400">Score: {opponentScore} Correct</div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
                    OPP
                  </div>
                </div>
              </div>

              {/* Active Question Box */}
              {(() => {
                const q = matchQuestions[currentQIdx];
                if (!q) return null;
                return (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                          {q.subjectName} • {q.topic}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsCalculatorOpen(true)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                            title="Open Official Scientific Calculator (Pauses Match Timer for 1 Minute)"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>Calculator (1m Pause)</span>
                          </button>
                          <span className="text-[10px] font-mono text-slate-400">
                            {matchStatus === 'tie_breaker' ? 'Sudden Death Q' : `Q #${currentQIdx + 1}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                        {q.question}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(['A', 'B', 'C', 'D'] as const).map(key => (
                        <button
                          key={key}
                          onClick={() => handleAnswerMatchQ(key)}
                          className="p-3.5 rounded-2xl text-left border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 bg-white transition-all cursor-pointer flex items-center gap-3"
                        >
                          <span className="w-6 h-6 rounded-lg bg-slate-100 font-mono font-black text-xs text-slate-700 flex items-center justify-center shrink-0">
                            {key}
                          </span>
                          <span className="text-xs text-slate-800 font-medium">
                            {q.options[key]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {matchStatus === 'completed' && (
            <div className="text-center py-10 space-y-6">
              {userScore > opponentScore ? (
                <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-amber-50 via-emerald-50 to-white border-2 border-amber-400/60 shadow-2xl space-y-4 max-w-lg mx-auto">
                  {/* Floating Victory Halo */}
                  <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                    <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl animate-pulse" />
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black text-3xl shadow-lg animate-bounce">
                      🏆
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase font-mono tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>CHAMPIONS LEAGUE 1v1 VICTORY!</span>
                    </div>

                    <h3 className="font-black text-2xl sm:text-3xl text-slate-950 font-['Outfit']">
                      Glorious Triumph, Scholar! 🎉
                    </h3>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      You defeated your fellow qualified Nigerian contender in the official 1v1 duel!
                    </p>
                  </div>

                  {/* Score Board */}
                  <div className="flex items-center justify-center gap-4 py-2">
                    <div className="px-4 py-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                      <div className="text-[10px] font-bold uppercase">You</div>
                      <div className="text-2xl font-black font-mono">{userScore}</div>
                    </div>
                    <span className="text-slate-400 font-black text-lg">VS</span>
                    <div className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl">
                      <div className="text-[10px] font-bold uppercase">Opponent</div>
                      <div className="text-2xl font-black font-mono">{opponentScore}</div>
                    </div>
                  </div>

                  {/* Reward Badges Earned */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                    <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold flex items-center gap-1">
                      <span>⚡ +100 XP Earned</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold flex items-center gap-1">
                      <span>🥇 +3 Tournament Points</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-cyan-100 border border-cyan-300 text-cyan-900 font-bold flex items-center gap-1">
                      <span>🛡️ Win Streak Active</span>
                    </span>
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => triggerChampionsLeagueVictoryConfetti()}
                      className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Celebrate Again 🎉</span>
                    </button>
                    <button
                      onClick={() => setMatchStatus('idle')}
                      className="w-full sm:w-auto px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                    >
                      Return to Arena Lobby
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 max-w-md mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-black text-2xl mx-auto">
                    👏
                  </div>
                  <h3 className="font-black text-xl text-slate-900 font-['Outfit']">
                    Match Completed
                  </h3>
                  <div className="font-mono text-2xl font-black text-slate-900">
                    Final Result: {userScore} - {opponentScore}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Well fought! You earned 1 point for the group standing under the official Champions League format.
                  </p>
                  <button
                    onClick={() => setMatchStatus('idle')}
                    className="px-5 py-2.5 bg-slate-900 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                  >
                    Return to Arena Lobby
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. TAB CONTENT: REWARDS & HALL OF FAME */}
      {/* ========================================================================= */}
      {activeTab === 'prizes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 font-['Outfit']">
                Official Tournament Rewards & Site Theming
              </h2>
              <p className="text-xs text-slate-500">
                Prizes are automatically activated on the winners' accounts by the Admin AI Assistant immediately after the Grande Finale.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* 1st Place Card */}
            <div className="rounded-3xl p-6 bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-transparent border-2 border-amber-400 space-y-3 relative overflow-hidden shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-4xl">🥇</span>
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs">
                  1st Place Champion
                </span>
              </div>
              <h3 className="font-black text-2xl text-slate-950 font-['Outfit']">
                ₦5,000 Naira Cash
              </h3>
              <div className="text-xs text-slate-800 space-y-2 font-medium">
                <div>✨ <strong>1-Month Free Premium Membership</strong> (Auto-activated by Admin AI)</div>
                <div>👑 <strong>Special "1st" Badge</strong> displayed in candidate name & community chat</div>
                <div>🌟 <strong>Full Website Turns GOLD</strong> for the winner for 30 days</div>
              </div>
            </div>

            {/* 2nd Place Card */}
            <div className="rounded-3xl p-6 bg-gradient-to-b from-cyan-500/20 via-cyan-500/10 to-transparent border-2 border-cyan-400 space-y-3 relative overflow-hidden shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-4xl">🥈</span>
                <span className="px-3 py-1 rounded-full bg-cyan-400 text-slate-950 font-black text-xs">
                  2nd Place Runner-Up
                </span>
              </div>
              <h3 className="font-black text-2xl text-slate-950 font-['Outfit']">
                ₦3,000 Naira Cash
              </h3>
              <div className="text-xs text-slate-800 space-y-2 font-medium">
                <div>✨ <strong>1-Month Free Medium Membership</strong> (Auto-activated by Admin AI)</div>
                <div>💎 <strong>Special "2nd" Badge</strong> displayed in name & community chat</div>
                <div>🔷 <strong>Full Website Turns DIAMOND</strong> for the winner for 30 days</div>
              </div>
            </div>

            {/* 3rd Place Card */}
            <div className="rounded-3xl p-6 bg-gradient-to-b from-slate-400/20 via-slate-400/10 to-transparent border-2 border-slate-400 space-y-3 relative overflow-hidden shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-4xl">🥉</span>
                <span className="px-3 py-1 rounded-full bg-slate-300 text-slate-950 font-black text-xs">
                  3rd Place Scholar
                </span>
              </div>
              <h3 className="font-black text-2xl text-slate-950 font-['Outfit']">
                ₦1,500 Naira Cash
              </h3>
              <div className="text-xs text-slate-800 space-y-2 font-medium">
                <div>✨ <strong>1-Month Free Basic Membership</strong> (Auto-activated by Admin AI)</div>
                <div>🎖️ <strong>Special "3rd" Badge</strong> displayed in name & community chat</div>
                <div>💿 <strong>Full Website Turns PLATINUM</strong> for the winner for 30 days</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. TAB CONTENT: AI ORCHESTRATOR LOGS */}
      {/* ========================================================================= */}
      {isAdmin && !adminPreviewStudentLocked && activeTab === 'ai_logs' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                Admin AI Assistant Autonomous Operations
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Zero Manual Interventions Needed
            </span>
          </div>

          <div className="space-y-3">
            {tournament.aiOrchestratorLogs.map(log => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                  <span className="text-emerald-700 font-bold">AUTOMATIC EXECUTION</span>
                </div>
                <div className="font-extrabold text-xs text-slate-900">{log.event}</div>
                <div className="text-xs text-slate-600 leading-relaxed">{log.details}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin AI Battle & Cutscene Modal */}
      {showAdminBattleModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAdminBattleModal(false);
          }}
        >
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <h3 className="font-black text-white text-base font-['Outfit']">
                  Admin Champions League AI Simulator
                </h3>
              </div>
              <button
                onClick={() => setShowAdminBattleModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {showAdminCutscene ? (
              <AdminChampionsCutscene
                onComplete={() => setShowAdminCutscene(false)}
                adminName={user?.name || 'Administrator'}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowAdminCutscene(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition flex items-center gap-1.5"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>🎬 Replay Intro Cutscene</span>
                  </button>
                </div>
                <AdminChampionsAiBattle
                  user={user}
                  onTournamentUpdated={(updated) => setTournament(updated)}
                  onNavigate={onNavigate}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <CBTCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
};
