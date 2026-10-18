import React, { useState, useEffect } from 'react';
import { Timer, Calendar, Trophy, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { getNextTournamentCountdown } from '../utils/tournamentManager';

interface TournamentCountdownProps {
  variant?: 'card' | 'banner' | 'compact' | 'lobby';
  onNavigate?: (view: string) => void;
  showDetails?: boolean;
}

export const TournamentCountdown: React.FC<TournamentCountdownProps> = ({
  variant = 'card',
  onNavigate,
  showDetails = true
}) => {
  const [countdown, setCountdown] = useState(() => getNextTournamentCountdown());

  useEffect(() => {
    // Ticking timer every second
    const interval = setInterval(() => {
      setCountdown(getNextTournamentCountdown());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (num: number) => String(num).padStart(2, '0');

  // Variant: Compact pill (for top bars or header strips)
  if (variant === 'compact') {
    return (
      <div 
        onClick={() => onNavigate && onNavigate('tournament')}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs font-mono font-bold shadow-sm ${onNavigate ? 'cursor-pointer hover:bg-amber-900/90 transition-all' : ''}`}
      >
        <Trophy className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span className="text-[10px] text-amber-300/80 uppercase font-sans font-bold">Champions League in:</span>
        <span className="text-white font-black">
          {countdown.days}d {pad(countdown.hours)}h {pad(countdown.minutes)}m {pad(countdown.seconds)}s
        </span>
      </div>
    );
  }

  // Variant: Banner (for TournamentView hero or announcement strips)
  if (variant === 'banner') {
    return (
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border border-amber-500/40 p-4 sm:p-5 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider">
                  Official Kickoff Countdown
                </span>
                <span className="px-2 py-0.2 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                  Qualifiers Active • Top 32
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Kickoff: <strong>12th {countdown.targetMonthName} at 8:00 PM WAT</strong> • Top 32 Scholars
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-center font-mono">
            <div className="px-3 py-1.5 bg-slate-950/80 rounded-xl border border-amber-500/30 min-w-[50px]">
              <div className="text-lg font-black text-amber-400">{countdown.days}</div>
              <div className="text-[9px] text-slate-400 uppercase font-sans font-semibold">Days</div>
            </div>
            <span className="text-amber-500 font-black text-lg">:</span>
            <div className="px-3 py-1.5 bg-slate-950/80 rounded-xl border border-amber-500/30 min-w-[50px]">
              <div className="text-lg font-black text-white">{pad(countdown.hours)}</div>
              <div className="text-[9px] text-slate-400 uppercase font-sans font-semibold">Hours</div>
            </div>
            <span className="text-amber-500 font-black text-lg">:</span>
            <div className="px-3 py-1.5 bg-slate-950/80 rounded-xl border border-amber-500/30 min-w-[50px]">
              <div className="text-lg font-black text-white">{pad(countdown.minutes)}</div>
              <div className="text-[9px] text-slate-400 uppercase font-sans font-semibold">Mins</div>
            </div>
            <span className="text-amber-500 font-black text-lg">:</span>
            <div className="px-3 py-1.5 bg-slate-950/80 rounded-xl border border-amber-500/30 min-w-[50px]">
              <div className="text-lg font-black text-amber-300">{pad(countdown.seconds)}</div>
              <div className="text-[9px] text-slate-400 uppercase font-sans font-semibold">Secs</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Variant: Lobby (Feature-packed countdown card designed specially for the 1v1 Arena & Home Lobby)
  return (
    <div className="rounded-2xl bg-slate-950/85 border border-amber-500/40 p-4 sm:p-5 backdrop-blur-md shadow-xl text-white space-y-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-black text-amber-300 uppercase tracking-wider font-['Outfit']">
            Tournament Starts In
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
          Qualifiers Active • Top 32
        </span>
      </div>

      {/* Countdown Digital Matrix */}
      <div className="grid grid-cols-4 gap-2 text-center font-mono">
        <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-b from-amber-950/60 to-slate-900 border border-amber-500/40 shadow-inner">
          <div className="text-xl sm:text-2xl font-black text-amber-400">{countdown.days}</div>
          <div className="text-[10px] text-slate-300 uppercase font-sans font-bold">Days</div>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-b from-amber-950/60 to-slate-900 border border-amber-500/40 shadow-inner">
          <div className="text-xl sm:text-2xl font-black text-white">{pad(countdown.hours)}</div>
          <div className="text-[10px] text-slate-300 uppercase font-sans font-bold">Hours</div>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-b from-amber-950/60 to-slate-900 border border-amber-500/40 shadow-inner">
          <div className="text-xl sm:text-2xl font-black text-white">{pad(countdown.minutes)}</div>
          <div className="text-[10px] text-slate-300 uppercase font-sans font-bold">Mins</div>
        </div>
        <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-b from-amber-950/60 to-slate-900 border border-amber-500/40 shadow-inner">
          <div className="text-xl sm:text-2xl font-black text-amber-300 animate-pulse">{pad(countdown.seconds)}</div>
          <div className="text-[10px] text-slate-300 uppercase font-sans font-bold">Secs</div>
        </div>
      </div>

      {showDetails && (
        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5 text-amber-200">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Kickoff: 12th at 8:00 PM WAT</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-semibold">
            ● Registration Open
          </span>
        </div>
      )}
    </div>
  );
};
