import React, { useState, useEffect, useRef } from 'react';
import { 
  Swords, 
  Trophy, 
  Timer, 
  Flame, 
  ShieldAlert, 
  Users, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Lock, 
  Crown,
  Volume2,
  VolumeX,
  Play,
  HelpCircle,
  Award,
  Bot,
  ShieldCheck,
  QrCode,
  ExternalLink,
  Search,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, Question } from '../types';
import { api, authStorage } from '../services/api';
import { MatchVerificationModal } from './MatchVerificationModal';
import { TournamentCountdown } from './TournamentCountdown';

interface HeadToHeadArenaViewProps {
  user: User | null;
  onNavigate: (view: string, extra?: any) => void;
  onRefreshUser?: () => void;
}

interface MatchQuestion {
  id: string;
  question: string;
  options: { label: string; text: string }[];
  subjectName?: string;
  topic?: string;
  examType?: string;
  year?: number;
}

interface QuestionReview {
  id: string;
  question: string;
  options: { label: string; text: string }[] | any;
  correctOption: string;
  explanation: string;
  subjectName?: string;
  topic?: string;
}

export const normalizeOptions = (options: any): { label: string; text: string }[] => {
  if (!options) return [];
  if (Array.isArray(options)) {
    return options.map((opt: any, i: number) => {
      if (typeof opt === 'string') {
        const labels = ['A', 'B', 'C', 'D'];
        return { label: labels[i] || String.fromCharCode(65 + i), text: opt };
      }
      return {
        label: String(opt.label || opt.key || String.fromCharCode(65 + i)),
        text: String(opt.text || opt.value || '')
      };
    });
  }
  if (typeof options === 'object') {
    return Object.entries(options).map(([key, val]) => ({
      label: key,
      text: String(val)
    }));
  }
  return [];
};

export const HeadToHeadArenaView: React.FC<HeadToHeadArenaViewProps> = ({
  user,
  onNavigate,
  onRefreshUser
}) => {
  // Connection & Match State
  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [inQueueCount, setInQueueCount] = useState<number>(0);
  const [arenaState, setArenaState] = useState<'lobby' | 'queue' | 'starting' | 'playing' | 'finished'>('lobby');
  
  // Custom Room State
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [joinRoomInput, setJoinRoomInput] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Active Match Data
  const [matchId, setMatchId] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<{ id: string; name: string } | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [questions, setQuestions] = useState<MatchQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [myScore, setMyScore] = useState<number>(0);
  const [myAnswers, setMyAnswers] = useState<Record<string, { option: string; isCorrect: boolean }>>({});
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [opponentQIndex, setOpponentQIndex] = useState<number>(0);
  const [opponentIsFinished, setOpponentIsFinished] = useState(false);
  const [isFinishedWaiting, setIsFinishedWaiting] = useState(false);

  // Match Result
  const [matchResult, setMatchResult] = useState<{
    winnerId: string | null;
    tie: boolean;
    reason?: string;
    winnerName: string | null;
    discountExpiresAt?: string | null;
    questionsReview?: QuestionReview[];
    verificationCode?: string;
    verificationHash?: string;
  } | null>(null);

  // Anti-Cheat Verification Modal State
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verifyQueryCode, setVerifyQueryCode] = useState<string>('');
  const [copiedVerifyLink, setCopiedVerifyLink] = useState(false);

  // Error / Discount lock state
  const [lockError, setLockError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [arenaTabSwitchCount, setArenaTabSwitchCount] = useState<number>(0);
  const [showArenaTabWarning, setShowArenaTabWarning] = useState<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if current user has an active 25% discount
  const hasActiveDiscount = !!(
    user?.arenaDiscountExpiresAt &&
    new Date(user.arenaDiscountExpiresAt).getTime() > Date.now()
  );

  const discountExpiryDate = user?.arenaDiscountExpiresAt
    ? new Date(user.arenaDiscountExpiresAt).toLocaleDateString('en-NG', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  // Calculate days/hours left on discount
  const getRemainingDiscountTime = () => {
    if (!user?.arenaDiscountExpiresAt) return null;
    const diff = new Date(user.arenaDiscountExpiresAt).getTime() - Date.now();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  // Play browser chime
  const playSfx = (type: 'correct' | 'wrong' | 'whistle' | 'victory') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'correct') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.setValueAtTime(160, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else if (type === 'whistle') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1900, audioCtx.currentTime + 0.08);
        osc.frequency.setValueAtTime(1600, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'victory') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15);
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3);
        osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      }
    } catch {}
  };

  // Connect to WebSocket Server
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Authenticate
      ws.send(JSON.stringify({
        type: 'auth',
        userId: user?.id,
        userName: user?.name || user?.email?.split('@')[0] || 'Scholar',
        educationLevel: user?.educationLevel || 'secondary'
      }));

      // Check URL for custom room parameter (e.g. invite from classmate via WhatsApp)
      const params = new URLSearchParams(window.location.search);
      const urlRoom = params.get('arenaRoom') || params.get('room');
      if (urlRoom && !hasActiveDiscount) {
        setJoinRoomInput(urlRoom.toUpperCase());
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'lobby_stats') {
          setOnlineCount(msg.onlineCount || 1);
          setInQueueCount(msg.inQueueCount || 0);
        }

        if (msg.type === 'queue_joined') {
          setArenaState('queue');
          setLockError(null);
        }

        if (msg.type === 'queue_left') {
          setArenaState('lobby');
        }

        if (msg.type === 'queue_error') {
          setLockError(msg.message);
          setArenaState('lobby');
        }

        if (msg.type === 'room_created') {
          setCreatedRoomCode(msg.roomCode);
        }

        if (msg.type === 'match_found') {
          setMatchId(msg.matchId);
          setOpponent(msg.opponent);
          setArenaState('starting');
          setCountdown(3);
          playSfx('whistle');

          // 3-second kickoff countdown
          let count = 3;
          const countTimer = setInterval(() => {
            count -= 1;
            setCountdown(count);
            if (count <= 0) {
              clearInterval(countTimer);
            }
          }, 1000);
        }

        if (msg.type === 'match_start') {
          const rawQuestions = Array.isArray(msg.questions) ? msg.questions : [];
          const normalized = rawQuestions.map((q: any) => ({
            ...q,
            options: normalizeOptions(q.options)
          }));
          setQuestions(normalized);
          setCurrentQIndex(0);
          setMyScore(0);
          setMyAnswers({});
          setOpponentScore(0);
          setOpponentQIndex(0);
          setOpponentIsFinished(false);
          setIsFinishedWaiting(false);
          setArenaState('playing');
          setTimeLeft(msg.durationSeconds || 60);

          // 60-second real-time countdown timer
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
              if (prev <= 1) {
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }

        if (msg.type === 'answer_result') {
          setMyScore(msg.score);
          setCurrentQIndex(msg.currentQuestionIndex);
          setMyAnswers(prev => ({
            ...prev,
            [msg.questionId]: {
              option: msg.selectedOption,
              isCorrect: msg.isCorrect
            }
          }));

          if (msg.isCorrect) {
            playSfx('correct');
          } else {
            playSfx('wrong');
          }

          if (msg.isFinished) {
            setIsFinishedWaiting(true);
          }
        }

        if (msg.type === 'opponent_progress') {
          setOpponentScore(msg.opponentScore);
          setOpponentQIndex(msg.opponentQuestionIndex);
          if (msg.opponentIsFinished) {
            setOpponentIsFinished(true);
          }
        }

        if (msg.type === 'match_finished') {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setArenaState('finished');
          const rawReview = Array.isArray(msg.questionsReview) ? msg.questionsReview : [];
          const normalizedReview = rawReview.map((q: any) => ({
            ...q,
            options: normalizeOptions(q.options)
          }));
          setMatchResult({
            winnerId: msg.winnerId,
            tie: msg.tie,
            reason: msg.reason,
            winnerName: msg.winnerName,
            discountExpiresAt: msg.winnerDiscountExpiresAt,
            questionsReview: normalizedReview,
            verificationCode: msg.verificationCode || `SN-ARENA-${(msg.matchId || '').replace(/^match_/, '').toUpperCase().substring(0, 8)}`,
            verificationHash: msg.verificationHash || `SIG-${Date.now().toString(16).toUpperCase()}`
          });

          // If current user is winner, blast celebration confetti!
          const isMeWinner = msg.winnerId && msg.winnerId === user?.id;
          if (isMeWinner) {
            playSfx('victory');
            confetti({
              particleCount: 150,
              spread: 90,
              origin: { y: 0.6 }
            });
          }

          // Trigger user data refresh to pull the new 25% discount & stats
          if (onRefreshUser) {
            onRefreshUser();
          }
        }
      } catch (err) {
        console.error('Error handling WS event:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      ws.close();
    };
  }, [user?.id]);

  // Live Match Anti-Cheat & Visibility Guard
  useEffect(() => {
    if (arenaState !== 'playing') {
      setShowArenaTabWarning(false);
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setArenaTabSwitchCount(prev => prev + 1);
        setShowArenaTabWarning(true);
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCopy);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCopy);
    };
  }, [arenaState]);

  // Join public queue
  const handleFindChallenger = () => {
    if (hasActiveDiscount) {
      setLockError(
        `Active 25% Discount Locked! You already have an active discount valid until ${discountExpiryDate}. You cannot compete again until it expires in 7 days.`
      );
      return;
    }
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'queue_join' }));
    }
  };

  // Cancel public queue
  const handleCancelQueue = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'queue_leave' }));
    }
    setArenaState('lobby');
  };

  // Create Custom Room
  const handleCreateRoom = () => {
    if (hasActiveDiscount) {
      setLockError('You already have an active 25% discount! You cannot duel until it expires in 7 days.');
      return;
    }
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'create_room' }));
    }
  };

  // Join Custom Room
  const handleJoinRoom = () => {
    if (!joinRoomInput.trim()) return;
    if (hasActiveDiscount) {
      setLockError('You already have an active 25% discount! You cannot duel until it expires in 7 days.');
      return;
    }
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'join_room',
        roomCode: joinRoomInput.trim().toUpperCase()
      }));
    }
  };

  // Submit Answer for active question
  const handleSelectOption = (optionLabel: string) => {
    if (arenaState !== 'playing' || isFinishedWaiting) return;
    const currentQ = questions[currentQIndex];
    if (!currentQ) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'submit_answer',
        matchId,
        questionId: currentQ.id,
        selectedOption: optionLabel,
        questionIndex: currentQIndex
      }));
    }
  };

  // Forfeit active match
  const handleForfeit = () => {
    if (window.confirm('Are you sure you want to forfeit this 1v1 challenge? Your opponent will win by default.')) {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: 'leave_match' }));
      }
      setArenaState('lobby');
    }
  };

  const isAdmin = user?.role === 'admin';

  // Admin AI Match Handler
  const handlePlayAiBot = () => {
    if (!isAdmin) {
      setLockError('AI test mode is restricted to administrator accounts.');
      return;
    }
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      setLockError(null);
      socketRef.current.send(JSON.stringify({ type: 'start_ai_match' }));
    }
  };

  // Admin Reset Discount Handler
  const handleAdminResetDiscount = () => {
    if (!isAdmin) return;
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'admin_reset_discount' }));
      setLockError(null);
      if (onRefreshUser) onRefreshUser();
    }
  };

  const currentQ = questions[currentQIndex];
  const isMeWinner = matchResult?.winnerId && matchResult.winnerId === user?.id;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* ARENA HERO TOP BAR */}
      <div className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-14 z-30 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-white text-base sm:text-lg tracking-tight font-['Outfit']">
                  1v1 HEAD-TO-HEAD ARENA
                </h1>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  FC Mobile Style
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Real-time human vs human duel: 10 Questions • 60 Seconds • Winner gets 7-Day 25% Discount
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Online Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs text-slate-300">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="font-semibold text-white">{onlineCount}</span>
              <span className="text-[11px] text-slate-400">Online in NG</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title={soundEnabled ? 'Mute Arena SFX' : 'Enable Arena SFX'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-5xl mx-auto px-4 pt-6">

        {/* ACTIVE DISCOUNT BANNER (IF APPLICABLE) */}
        {hasActiveDiscount && (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-950/80 via-amber-900/60 to-slate-900 p-4 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-200 text-sm">Active 25% Winner Discount Locked</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                    {getRemainingDiscountTime()} Left
                  </span>
                </div>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  You won a 1v1 duel! Your 25% discount is valid until <strong>{discountExpiryDate}</strong>. You cannot play again until it expires.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('premium')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Use 25% OFF on Premium</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ERROR / TOURNAMENT RULE LOCK BANNER */}
        {lockError && (
          <div className="mb-6 rounded-2xl bg-rose-950/70 border border-rose-600/50 p-4 text-rose-200 text-xs flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-rose-300">Tournament Constraint Notice</p>
              <p className="mt-0.5 leading-relaxed">{lockError}</p>
            </div>
            <button onClick={() => setLockError(null)} className="text-rose-400 hover:text-white text-sm font-bold">✕</button>
          </div>
        )}

        {/* STATE 1: LOBBY SCREEN */}
        {arenaState === 'lobby' && (
          <div className="space-y-6">
            {/* MONTHLY CHAMPIONS LEAGUE TOURNAMENT PORTAL */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/90 via-yellow-950/80 to-slate-950 border-2 border-amber-500/60 p-6 sm:p-7 shadow-[0_0_35px_rgba(245,158,11,0.25)] text-white">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl text-center lg:text-left">
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-black flex items-center gap-1.5 shadow-sm">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>MONTHLY CHAMPIONS LEAGUE</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                      Starts 12th of Each Month
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase tracking-wider">
                      ₦9,500 Cash + VIP Pass
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white tracking-tight">
                    Top 32 Scholars 1v1 Champions League 🏆
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    8 Groups of 4 Scholars randomly seeded by Autonomous Admin AI. Compete in 10-question 1v1 matches (2-min timer, 5 mins Math), 2-legged knockout rounds, sudden-death tiebreakers, and 4-subject Grande Finale!
                  </p>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold text-amber-200">
                    <span className="flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>1st: ₦5,000 + Gold Site & Chat Badge</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-cyan-300" />
                      <span>2nd: ₦3,000 + Diamond Theme</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-slate-300" />
                      <span>3rd: ₦1,500 + Platinum Theme</span>
                    </span>
                  </div>
                </div>

                <div className="w-full lg:w-80 shrink-0 space-y-3">
                  <TournamentCountdown variant="lobby" onNavigate={onNavigate} />
                  
                  <button
                    onClick={() => onNavigate('tournament')}
                    className="w-full px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Trophy className="w-5 h-5 text-slate-950" />
                    <span>ENTER CHAMPIONS LEAGUE</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>
                </div>
              </div>
            </div>

            {/* Friendly Student Quiz Challenge Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-900 border border-emerald-500/40 p-6 sm:p-8 shadow-xl text-white">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 max-w-xl text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-400/40 text-emerald-200 text-xs font-bold">
                    <span>🇳🇬</span>
                    <span>Friendly 1v1 Quiz Match</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight">
                    10-Question Quick Quiz Match
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                    Challenge a fellow Nigerian student to a fun 60-second quiz! Both of you answer the same 10 JAMB/WAEC past questions. Whoever scores higher wins an exclusive <strong className="text-amber-300">25% discount reward</strong> on StudyNaija VIP!
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-emerald-200">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Student vs Student</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>60-Second Rapid Clock</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Win 25% VIP Discount</span>
                    </div>
                  </div>
                </div>

                {/* Quick Match CTA Card */}
                <div className="w-full sm:w-80 rounded-2xl bg-slate-900/80 border border-emerald-500/30 p-5 backdrop-blur-sm space-y-4 text-center">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Play Now</span>
                    <h3 className="text-lg font-black text-white font-['Outfit']">Find Any Student</h3>
                  </div>

                  <button
                    onClick={handleFindChallenger}
                    disabled={hasActiveDiscount}
                    className={`w-full py-4 rounded-xl font-black text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                      hasActiveDiscount
                        ? 'bg-slate-700/60 text-slate-400 cursor-not-allowed border border-slate-600'
                        : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-amber-500/20 hover:scale-[1.02]'
                    }`}
                  >
                    {hasActiveDiscount ? (
                      <>
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span>Game Locked (Discount Active)</span>
                      </>
                    ) : (
                      <>
                        <Swords className="w-4 h-4 text-slate-950" />
                        <span>PLAY QUICK MATCH</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-300">
                    {inQueueCount > 0 ? (
                      <span className="text-emerald-300 font-semibold animate-pulse">{inQueueCount} student(s) waiting to play</span>
                    ) : (
                      <span>Instant pairing with students across Nigeria</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* EXCLUSIVE ADMIN TEST MODE: PLAY AGAINST AI BOT */}
            {isAdmin && (
              <div className="rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/70 to-slate-900 border-2 border-indigo-500/40 p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black tracking-wide">
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                      <span>ADMIN-ONLY TEST SUITE</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <h3 className="text-xl font-black text-white font-['Outfit'] tracking-tight flex items-center gap-2">
                      <span>Play Against AI Challenger</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                        Admin Account Exclusive
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Test the entire 60-second real-time examination loop against a simulated <strong>StudyNaija AI Bot 🤖</strong> without needing a second player. Test question answering, scoring, tug-of-war HUD bar, sound effects, accuracy tracking, and 25% discount reward generation.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Discount lock bypassed for testing</span>
                      </span>
                      <span className="flex items-center gap-1 text-indigo-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Dynamic simulated opponent</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
                    <button
                      onClick={handlePlayAiBot}
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-black text-xs tracking-wider uppercase shadow-xl shadow-indigo-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Bot className="w-4 h-4 text-white" />
                      <span>Launch AI Duel (Admin Test)</span>
                    </button>

                    {hasActiveDiscount && (
                      <button
                        onClick={handleAdminResetDiscount}
                        className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        <span>Reset Test Discount</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DUEL MODES GRID: FRIEND CHALLENGE & STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card A: Challenge a Classmate / Custom Room */}
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Play with a Classmate 👥</h3>
                    <p className="text-xs text-slate-400">Share a code on WhatsApp or join with your friend's code</p>
                  </div>
                </div>

                {/* Create Room Section */}
                {!createdRoomCode ? (
                  <button
                    onClick={handleCreateRoom}
                    disabled={hasActiveDiscount}
                    className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Share2 className="w-4 h-4 text-blue-400" />
                    <span>Create Game Code for Friend</span>
                  </button>
                ) : (
                  <div className="rounded-2xl bg-blue-950/40 border border-blue-500/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-300 font-semibold">Your Private Match Code:</span>
                      <span className="text-xl font-black text-white font-mono tracking-widest bg-blue-900/60 px-3 py-1 rounded-lg border border-blue-500/40">
                        {createdRoomCode}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(createdRoomCode);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 border border-slate-700"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied Code!' : 'Copy Code'}</span>
                      </button>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `🇳🇬 I challenge you to a 1v1 JAMB CBT Head-to-Head duel on StudyNaija! Join my room using code: ${createdRoomCode} or open: ${window.location.origin}?arenaRoom=${createdRoomCode}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5 shadow-md"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Send WhatsApp</span>
                      </a>
                    </div>
                    <p className="text-[11px] text-blue-300/80 text-center animate-pulse">
                      Waiting for your friend to enter this code...
                    </p>
                  </div>
                )}

                {/* Join Room Section */}
                <div className="pt-3 border-t border-slate-800/80">
                  <span className="text-xs text-slate-400 font-medium block mb-2">Have a code from a classmate?</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. JAMB-4921"
                      value={joinRoomInput}
                      onChange={(e) => setJoinRoomInput(e.target.value)}
                      disabled={hasActiveDiscount}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-blue-500 uppercase tracking-wider"
                    />
                    <button
                      onClick={handleJoinRoom}
                      disabled={!joinRoomInput.trim() || hasActiveDiscount}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Join Room
                    </button>
                  </div>
                </div>
              </div>

              {/* Card B: Player Arena Statistics & Rules */}
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-white text-base">Your 1v1 Battle Record</h3>
                  </div>
                  <span className="text-xs text-slate-400">{user?.name || 'Scholar'}</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-slate-800/60 p-3 text-center border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 block font-medium">Wins</span>
                    <span className="text-xl font-black text-emerald-400">{user?.arenaWins || 0}</span>
                  </div>
                  <div className="rounded-2xl bg-slate-800/60 p-3 text-center border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 block font-medium">Losses</span>
                    <span className="text-xl font-black text-rose-400">{user?.arenaLosses || 0}</span>
                  </div>
                  <div className="rounded-2xl bg-slate-800/60 p-3 text-center border border-slate-700/60">
                    <span className="text-[11px] text-slate-400 block font-medium">Total Matches</span>
                    <span className="text-xl font-black text-white">{user?.arenaMatches || 0}</span>
                  </div>
                </div>

                <div className="pt-2 rounded-xl bg-slate-800/40 p-3.5 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    <span>Tournament Rules & Reward Structure:</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc list-inside">
                    <li>10 Randomized JAMB/WAEC CBT questions per match.</li>
                    <li>60-second synchronized server countdown.</li>
                    <li>Each correct answer earns <strong>+10 points</strong>.</li>
                    <li>Winner earns a <strong>25% discount for 7 days</strong> on Basic, Medium, or Premium.</li>
                    <li><strong className="text-slate-300">Anti-stacking constraint:</strong> If you already hold an active discount, you cannot play until the 7 days expire.</li>
                  </ul>
                </div>
              </div>

              {/* Card C: Anti-Cheat & Match Verification Gateway */}
              <div className="md:col-span-2 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/50 border border-emerald-500/40 p-6 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">Check Someone&apos;s Duel Claim</h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Anti-Fraud</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Did someone message you claiming they beat you or won a 1v1 duel? Verify their official StudyNaija match code to confirm whether they are telling the truth or fabricating claims.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setVerifyQueryCode('');
                      setIsVerificationModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Verify a Match Result</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATE 2: QUEUE SEARCHING SCREEN */}
        {arenaState === 'queue' && (
          <div className="max-w-md mx-auto my-12 rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-6 shadow-2xl">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="relative w-24 h-24 rounded-full bg-slate-800 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
                <Swords className="w-10 h-10 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white font-['Outfit']">Searching for Challenger...</h3>
              <p className="text-xs text-slate-400">
                Matching you with a live student in Nigeria for a 10-question sprint.
              </p>
            </div>

            <div className="rounded-xl bg-slate-800/60 p-3 text-xs text-slate-300 flex items-center justify-around border border-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px]">Students Online</span>
                <span className="font-bold text-emerald-400">{onlineCount}</span>
              </div>
              <div className="w-px h-6 bg-slate-700" />
              <div>
                <span className="text-slate-400 block text-[10px]">In Queue</span>
                <span className="font-bold text-white">{inQueueCount}</span>
              </div>
            </div>

            <button
              onClick={handleCancelQueue}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-colors"
            >
              Cancel Matchmaking
            </button>
          </div>
        )}

        {/* STATE 3: KICKOFF COUNTDOWN (3... 2... 1...) */}
        {arenaState === 'starting' && (
          <div className="max-w-lg mx-auto my-12 rounded-3xl bg-gradient-to-b from-slate-900 to-emerald-950 border border-emerald-500/50 p-8 text-center space-y-8 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <Flame className="w-4 h-4 text-emerald-400" />
              <span>Challenger Found! Match Starting</span>
            </div>

            {/* Matchup Banner: You vs Opponent */}
            <div className="flex items-center justify-between gap-4 px-4">
              <div className="text-center space-y-1">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg mx-auto">
                  {(user?.name || 'You').charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-white block">{user?.name || 'You'}</span>
                <span className="text-[10px] text-emerald-400">Challenger 1</span>
              </div>

              <div className="text-center">
                <span className="text-2xl font-black text-amber-400 italic">VS</span>
              </div>

              <div className="text-center space-y-1">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg mx-auto">
                  {(opponent?.name || 'Rival').charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-white block">{opponent?.name || 'Opponent'}</span>
                <span className="text-[10px] text-blue-400">Challenger 2</span>
              </div>
            </div>

            {/* Countdown Number */}
            <div className="text-6xl font-black text-white font-['Outfit'] animate-bounce">
              {countdown > 0 ? countdown : 'KICKOFF!'}
            </div>

            <p className="text-xs text-slate-300">
              10 Questions • 60 Seconds • Get ready to answer fast!
            </p>
          </div>
        )}

        {/* STATE 4: PLAYING ARENA SCREEN (FC MOBILE HEAD-TO-HEAD LIVE GAMEPLAY) */}
        {arenaState === 'playing' && (
          <div className="space-y-6">
            {/* LIVE STADIUM HUD SCOREBOARD */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-xl">
              <div className="flex items-center justify-between gap-2">
                {/* Player 1 (You) */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                    {(user?.name || 'You').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block truncate max-w-[120px] sm:max-w-[160px]">
                      {user?.name || 'You'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Q: <strong className="text-emerald-400">{Math.min(10, currentQIndex + 1)}/10</strong>
                    </span>
                  </div>
                </div>

                {/* Center Timer & Score Counter */}
                <div className="text-center px-2">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
                      {myScore}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">-</span>
                    <span className="text-3xl sm:text-4xl font-black text-blue-400 font-mono">
                      {opponentScore}
                    </span>
                  </div>

                  {/* 60s Countdown Pill */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-bold mt-1 ${
                    timeLeft <= 10 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' : 'bg-slate-800 text-slate-300'
                  }`}>
                    <Timer className="w-3.5 h-3.5 text-amber-400" />
                    <span>{timeLeft}s remaining</span>
                  </div>
                </div>

                {/* Player 2 (Opponent) */}
                <div className="flex items-center justify-end gap-3 text-right">
                  <div>
                    <span className="text-xs font-bold text-white block truncate max-w-[120px] sm:max-w-[160px]">
                      {opponent?.name || 'Opponent'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Q: <strong className="text-blue-400">{opponentQIndex}/10</strong>
                      {opponentIsFinished && ' (Done)'}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                    {(opponent?.name || 'Rival').charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>

              {/* TUG-OF-WAR PROGRESS BAR */}
              <div className="mt-3 pt-3 border-t border-slate-800">
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${
                        myScore + opponentScore === 0
                          ? 50
                          : (myScore / (myScore + opponentScore)) * 100
                      }%`
                    }}
                  />
                  <div
                    className="bg-blue-500 transition-all duration-300"
                    style={{
                      width: `${
                        myScore + opponentScore === 0
                          ? 50
                          : (opponentScore / (myScore + opponentScore)) * 100
                      }%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Tab switch warning alert banner */}
            {showArenaTabWarning && (
              <div className="p-3 bg-amber-500/20 border border-amber-500/50 rounded-2xl text-amber-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>Malpractice Warning:</strong> Tab switch detected! (Strike {arenaTabSwitchCount}). Stay in the match window.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowArenaTabWarning(false)}
                  className="text-amber-300 font-bold hover:text-white text-xs cursor-pointer"
                >
                  Dismiss ✕
                </button>
              </div>
            )}

            {/* QUESTION CARD OR WAITING STATE */}
            {!isFinishedWaiting && currentQ ? (
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl select-none" onContextMenu={e => e.preventDefault()}>
                {/* Meta header */}
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                    Question {currentQIndex + 1} of 10
                  </span>
                  <div className="flex items-center gap-2 text-slate-400">
                    {currentQ.subjectName && <span>{currentQ.subjectName}</span>}
                    {currentQ.examType && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-slate-300">
                        {currentQ.examType}
                      </span>
                    )}
                  </div>
                </div>

                {/* Question statement */}
                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed select-none">
                  {currentQ.question}
                </h3>

                {/* 4 Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 select-none">
                  {normalizeOptions(currentQ.options).map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => handleSelectOption(opt.label)}
                      className="group p-4 rounded-2xl bg-slate-800/80 hover:bg-emerald-950/60 border border-slate-700/80 hover:border-emerald-500/60 transition-all text-left flex items-start gap-3 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-700 group-hover:bg-emerald-500 group-hover:text-slate-950 text-white font-bold text-xs flex items-center justify-center shrink-0 transition-colors">
                        {opt.label}
                      </div>
                      <span className="text-xs sm:text-sm text-slate-200 group-hover:text-white pt-1 leading-relaxed">
                        {opt.text}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Progress Indicators */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {questions.map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          idx < currentQIndex
                            ? 'bg-emerald-400'
                            : idx === currentQIndex
                              ? 'bg-amber-400 scale-125'
                              : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleForfeit}
                    className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    Forfeit Match
                  </button>
                </div>
              </div>
            ) : (
              /* WAITING FOR OPPONENT OR CLOCK TO RUN OUT */
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white font-['Outfit']">
                  You Completed All 10 Questions!
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Great speed! Waiting for {opponent?.name || 'opponent'} to finish or for the remaining {timeLeft} seconds on the clock to expire...
                </p>
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mt-4" />
              </div>
            )}
          </div>
        )}

        {/* STATE 5: FINISHED / RESULTS SCREEN */}
        {arenaState === 'finished' && matchResult && (
          <div className="space-y-6">
            {/* Victory / Defeat Stadium Billboard */}
            <div className={`rounded-3xl p-6 sm:p-8 text-center space-y-4 border shadow-2xl ${
              isMeWinner
                ? 'bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 border-emerald-500/60'
                : matchResult.tie
                  ? 'bg-gradient-to-b from-slate-900 to-amber-950 border-amber-500/50'
                  : 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800'
            }`}>
              <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-xl border">
                {isMeWinner ? (
                  <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-amber-500 to-emerald-400 flex items-center justify-center text-slate-950 border border-emerald-300">
                    <Trophy className="w-10 h-10 text-slate-950 animate-bounce" />
                  </div>
                ) : matchResult.tie ? (
                  <div className="w-full h-full rounded-3xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
                    <Award className="w-10 h-10" />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-3xl bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-700">
                    <Swords className="w-10 h-10" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight">
                  {isMeWinner ? 'VICTORY! YOU ARE THE ARENA CHAMPION! 🎉' : matchResult.tie ? 'HONORABLE DRAW!' : 'DEFEAT - HARD LUCK!'}
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Final Score: <strong>You {myScore} PTS</strong> vs <strong>{opponent?.name || 'Opponent'} {opponentScore} PTS</strong>
                </p>
              </div>

              {/* PRIZE CARD: 7-DAY 25% DISCOUNT */}
              {isMeWinner && (
                <div className="max-w-md mx-auto rounded-2xl bg-gradient-to-r from-emerald-900/60 to-slate-900 border border-emerald-400/50 p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>PRIZE UNLOCKED: 7-DAY 25% DISCOUNT</span>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">
                    Congratulations! Your 25% discount is now active for <strong>7 days</strong> across all 3 Premium plans:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Basic</span>
                      <span className="line-through text-slate-500 text-[10px]">₦1,500</span>
                      <span className="font-bold text-emerald-400 block">₦1,125</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-emerald-500/40">
                      <span className="text-[10px] text-slate-400 block">Medium</span>
                      <span className="line-through text-slate-500 text-[10px]">₦3,500</span>
                      <span className="font-bold text-emerald-400 block">₦2,625</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-amber-500/40">
                      <span className="text-[10px] text-slate-400 block">Premium</span>
                      <span className="line-through text-slate-500 text-[10px]">₦6,000</span>
                      <span className="font-bold text-amber-300 block">₦4,500</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('premium')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Upgrade to Premium with 25% Discount</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {isAdmin && (
                  <button
                    onClick={handlePlayAiBot}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Play Again vs AI (Admin Test)</span>
                  </button>
                )}
                <button
                  onClick={() => setArenaState('lobby')}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
                >
                  Return to Arena Lobby
                </button>
                <button
                  onClick={() => onNavigate('premium')}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  View Premium Plans
                </button>
              </div>
            </div>

            {/* OFFICIAL VERIFIABLE MATCH RESULT & ANTI-CHEAT PROOF */}
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950 border-2 border-emerald-500/50 p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
                    <ShieldCheck className="w-6 h-6 text-slate-950" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                        StudyNaija Certified Arena Record
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        Anti-Fraud Proof
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white font-['Outfit']">
                      Official Proof of Victory & Verification Code
                    </h3>
                  </div>
                </div>

                <div className="font-mono text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Official Code</span>
                  <strong className="text-emerald-300">{matchResult.verificationCode || 'SN-ARENA-LIVE'}</strong>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Want to prove to the opponent or classmates on WhatsApp that you genuinely won? Share this official verification link. Anyone can enter your unique match code on StudyNaija to verify your authentic win, final scores, and prize without doubt.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (matchResult.verificationCode) {
                        navigator.clipboard.writeText(matchResult.verificationCode);
                        setCopiedVerifyLink(true);
                        setTimeout(() => setCopiedVerifyLink(false), 2000);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedVerifyLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedVerifyLink ? 'Code Copied!' : 'Copy Match Code'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setVerifyQueryCode(matchResult.verificationCode || '');
                      setIsVerificationModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View Official Certificate</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    const winnerName = isMeWinner ? (user?.name || 'I') : (opponent?.name || 'Opponent');
                    const code = matchResult.verificationCode || 'SN-ARENA-RECORD';
                    const text = `🇳🇬 *StudyNaija 1v1 Arena Result*\n` +
                      `🏆 Result: ${isMeWinner ? `I WON against ${opponent?.name || 'Opponent'}!` : `Duel against ${opponent?.name || 'Opponent'} finished.`}\n` +
                      `📊 Scores: You ${myScore} pts vs Opponent ${opponentScore} pts\n` +
                      `🔒 Verification Code: *${code}*\n` +
                      `✅ Verify this genuine match on StudyNaija: ${window.location.origin}?verifyMatch=${encodeURIComponent(code)}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 ml-auto"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Proof to WhatsApp</span>
                </button>
              </div>
            </div>

            {/* FULL QUESTION-BY-QUESTION REVIEW FOR EXAM PREPARATION */}
            {matchResult.questionsReview && matchResult.questionsReview.length > 0 && (
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-white font-['Outfit']">
                      Post-Match Examination Review (10 Questions)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Review correct answers and detailed explanations for all questions played in this duel.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                    Learn & Master
                  </span>
                </div>

                <div className="space-y-4">
                  {matchResult.questionsReview.map((q, idx) => {
                    const myAns = myAnswers[q.id];
                    const wasCorrect = myAns?.isCorrect;

                    return (
                      <div
                        key={q.id}
                        className={`rounded-2xl p-5 border text-xs space-y-3 ${
                          wasCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : myAns
                              ? 'bg-rose-950/20 border-rose-500/30'
                              : 'bg-slate-800/40 border-slate-700/60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-300">
                            Question {idx + 1} • {q.subjectName || 'General'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            wasCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {wasCorrect ? 'You Answered Correctly' : myAns ? 'You Answered Incorrectly' : 'Unanswered'}
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-white leading-relaxed">
                          {q.question}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {normalizeOptions(q.options).map((opt) => (
                            <div
                              key={opt.label}
                              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                                opt.label === q.correctOption
                                  ? 'bg-emerald-900/40 border-emerald-500 text-emerald-200 font-bold'
                                  : myAns?.option === opt.label
                                    ? 'bg-rose-900/40 border-rose-500 text-rose-200'
                                    : 'bg-slate-900/50 border-slate-800 text-slate-400'
                              }`}
                            >
                              <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center font-bold text-[11px]">
                                {opt.label}
                              </span>
                              <span>{opt.text}</span>
                            </div>
                          ))}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-[11px] leading-relaxed">
                            <strong className="text-emerald-400 block mb-1">Explanation & Syllabus Note:</strong>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Public Anti-Cheat Match Verification Modal */}
      <MatchVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        initialCode={verifyQueryCode}
        onNavigateToArena={() => setArenaState('lobby')}
      />
    </div>
  );
};
