import React, { useState, useEffect } from 'react';
import { 
  Timer, 
  Calendar, 
  Sparkles, 
  ChevronRight, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  Flame, 
  ArrowRight,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { JambCountdownData } from '../types';
import { api } from '../services/api';

const CACHE_KEY = 'studynaija_jamb_countdown_v1';

interface JambCountdownTimerProps {
  onNavigate?: (view: string, extra?: any) => void;
  variant?: 'banner' | 'pill' | 'standalone';
}

export const JambCountdownTimer: React.FC<JambCountdownTimerProps> = ({
  onNavigate,
  variant = 'banner'
}) => {
  const [data, setData] = useState<JambCountdownData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.officialExamDate) {
            return parsed;
          }
        }
      } catch {}
    }

    // Default initial fallback while fetching
    const officialExamDate = '2027-04-17T08:00:00+01:00';
    const target = new Date(officialExamDate);
    const diffMs = Math.max(0, target.getTime() - Date.now());

    return {
      examName: 'JAMB UTME 2027',
      officialExamDate,
      registrationStartDate: '2027-01-15T08:00:00+01:00',
      registrationCloseDate: '2027-02-26T23:59:59+01:00',
      mockExamDate: '2027-03-27T08:00:00+01:00',
      daysRemaining: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
      hoursRemaining: Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutesRemaining: Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)),
      secondsRemaining: Math.floor((diffMs % (1000 * 60)) / 1000),
      totalSecondsRemaining: Math.floor(diffMs / 1000),
      officialAnnouncement: 'Official JAMB Bulletin: Next Unified Tertiary Matriculation Examination (UTME) scheduled across 750+ accredited Computer Based Test (CBT) centres nationwide.',
      status: 'UPCOMING',
      syllabusPhase: 'Intensive Preparation & Mock Drills',
      studyTips: [
        'Master the 8-Key navigation system (A, B, C, D, N, P, R, S) without touching the mouse.',
        'Spend max 40 seconds per question on Use of English.',
        'Aim for a score of 280+ to secure competitive federal university courses (Medicine, Law, Engineering).'
      ]
    };
  });

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: data.daysRemaining,
    hours: data.hoursRemaining,
    minutes: data.minutesRemaining,
    seconds: data.secondsRemaining
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch simulated API data on mount and cache it
  useEffect(() => {
    let isMounted = true;
    api.getJambCountdown()
      .then((res) => {
        if (isMounted && res) {
          setData(res);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(res));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Could not fetch JAMB countdown from API:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Real-time ticking countdown interval
  useEffect(() => {
    const calculateTime = () => {
      const targetTime = new Date(data.officialExamDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [data.officialExamDate]);

  // Format helper
  const pad = (n: number) => String(n).padStart(2, '0');

  // Format official exam date for display
  const formattedExamDate = new Date(data.officialExamDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // 1. PILL VARIANT: For inline placement in the main Navbar next to streak
  if (variant === 'pill') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="group relative px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-emerald-950/80 hover:from-cyan-900 hover:to-emerald-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.18)]"
          title={`Official JAMB UTME 2027 Countdown: ${timeLeft.days} days, ${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s remaining. Click to view full roadmap!`}
        >
          <div className="relative flex items-center justify-center">
            <Timer className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow group-hover:scale-110 transition-transform" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>

          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-cyan-400 hidden xl:inline">
              JAMB:
            </span>
            <span className="font-extrabold text-white text-[11px] sm:text-xs tracking-tight">
              {timeLeft.days}<span className="text-cyan-400 font-bold">d</span>
            </span>
            <span className="text-[10px] text-slate-300 font-semibold hidden md:inline">
              {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m
            </span>
          </div>

          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold hidden sm:inline">
            LIVE
          </span>
        </button>

        {/* Roadmap Modal */}
        {isModalOpen && (
          <CountdownRoadmapModal
            data={data}
            timeLeft={timeLeft}
            formattedDate={formattedExamDate}
            onClose={() => setIsModalOpen(false)}
            onNavigate={(view) => {
              setIsModalOpen(false);
              if (onNavigate) onNavigate(view);
            }}
          />
        )}
      </>
    );
  }

  // 2. BANNER VARIANT: For top micro-banner inside the header
  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className="group inline-flex items-center gap-2 cursor-pointer transition-all hover:opacity-95"
        title="Click to view official JAMB UTME 2027 examination timeline and preparation roadmap"
      >
        <div className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-850 px-2.5 py-0.5 rounded-full border border-cyan-500/30 text-slate-200 shadow-2xs">
          <div className="relative flex items-center">
            <Timer className="w-3 h-3 text-cyan-400" />
            <span className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
          </div>

          <span className="font-mono text-[10px] text-cyan-300 font-extrabold uppercase tracking-wider">
            JAMB 2027:
          </span>

          {/* Days Remaining Highlight */}
          <span className="font-mono font-black text-[11px] text-white tracking-tight">
            {timeLeft.days} <span className="text-cyan-400 font-bold text-[10px]">DAYS</span>
          </span>

          {/* Live Hours, Minutes, Seconds */}
          <span className="font-mono text-[10px] text-slate-400 hidden sm:inline">
            • {pad(timeLeft.hours)}h {pad(timeLeft.minutes)}m <span className="text-cyan-400 font-bold">{pad(timeLeft.seconds)}s</span>
          </span>

          <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 px-1 rounded border border-amber-600/30 hidden md:inline">
            April 17
          </span>

          <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>

      {/* Roadmap Modal */}
      {isModalOpen && (
        <CountdownRoadmapModal
          data={data}
          timeLeft={timeLeft}
          formattedDate={formattedExamDate}
          onClose={() => setIsModalOpen(false)}
          onNavigate={(view) => {
            setIsModalOpen(false);
            if (onNavigate) onNavigate(view);
          }}
        />
      )}
    </>
  );
};

// =========================================================================
// OFFICIAL JAMB UTME COUNTDOWN & EXAM ROADMAP MODAL
// =========================================================================
interface CountdownRoadmapModalProps {
  data: JambCountdownData;
  timeLeft: { days: number; hours: number; minutes: number; seconds: number };
  formattedDate: string;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

const CountdownRoadmapModal: React.FC<CountdownRoadmapModalProps> = ({
  data,
  timeLeft,
  formattedDate,
  onClose,
  onNavigate
}) => {
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-lg w-full overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)] text-white space-y-0">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-950 p-5 sm:p-6 border-b border-cyan-500/30 flex items-start justify-between relative">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Official National Exam Schedule
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] flex items-center gap-2">
              <span>{data.examName}</span>
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/40">
                Official Date
              </span>
            </h3>
            <p className="text-xs text-slate-300 font-mono">
              Commences: <strong className="text-cyan-300">{formattedDate}</strong> (08:00 WAT)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Digital Clock Display */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Ticking Digital Digits */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
            
            {/* Days */}
            <div className="bg-slate-950/80 rounded-2xl p-3 border border-cyan-500/30 shadow-inner">
              <div className="font-mono text-2xl sm:text-4xl font-black text-cyan-400 tracking-tight">
                {timeLeft.days}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Days
              </div>
            </div>

            {/* Hours */}
            <div className="bg-slate-950/80 rounded-2xl p-3 border border-cyan-500/30 shadow-inner">
              <div className="font-mono text-2xl sm:text-4xl font-black text-white tracking-tight">
                {pad(timeLeft.hours)}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Hours
              </div>
            </div>

            {/* Minutes */}
            <div className="bg-slate-950/80 rounded-2xl p-3 border border-cyan-500/30 shadow-inner">
              <div className="font-mono text-2xl sm:text-4xl font-black text-white tracking-tight">
                {pad(timeLeft.minutes)}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Minutes
              </div>
            </div>

            {/* Seconds */}
            <div className="bg-slate-950/80 rounded-2xl p-3 border border-cyan-500/30 shadow-inner">
              <div className="font-mono text-2xl sm:text-4xl font-black text-amber-400 tracking-tight animate-pulse">
                {pad(timeLeft.seconds)}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Seconds
              </div>
            </div>

          </div>

          {/* Official Bulletin Notice */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3 text-xs leading-relaxed">
            <Bell className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-cyan-200">
                Official Examination Advisory
              </div>
              <p className="text-slate-300 text-[11px]">
                {data.officialAnnouncement}
              </p>
            </div>
          </div>

          {/* Timeline Key Dates */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Examination Milestones:
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <span className="text-slate-400">Registration Opens:</span>
                <span className="font-mono font-bold text-emerald-400">15 Jan 2027</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <span className="text-slate-400">Registration Closes:</span>
                <span className="font-mono font-bold text-rose-400">26 Feb 2027</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <span className="text-slate-400">National Mock CBT:</span>
                <span className="font-mono font-bold text-amber-400">27 Mar 2027</span>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-between">
                <span className="text-cyan-200 font-bold">UTME Main Exam:</span>
                <span className="font-mono font-extrabold text-cyan-300">17 Apr 2027</span>
              </div>
            </div>
          </div>

          {/* High-Yield Preparation Strategy Tips */}
          {data.studyTips && data.studyTips.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>High-Yield Strategy Tips:</span>
              </div>
              <ul className="space-y-1 text-xs text-slate-300">
                {data.studyTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Call to Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={() => onNavigate('mock-exam')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-600 hover:from-cyan-400 hover:to-emerald-500 text-slate-950 font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Take Full 180-Question Mock</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('practice')}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 shrink-0"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Daily Practice Drills</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
