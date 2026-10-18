import React from 'react';
import { 
  Trophy, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  X, 
  Zap, 
  TrendingUp, 
  Eye, 
  Play
} from 'lucide-react';
import { User } from '../types';

interface ChampionsQualificationModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, extra?: any) => void;
  onProceedAsSpectator: () => void;
  onPreviewIntro?: () => void;
}

export const ChampionsQualificationModal: React.FC<ChampionsQualificationModalProps> = ({
  user,
  isOpen,
  onClose,
  onNavigate,
  onProceedAsSpectator
}) => {
  if (!isOpen) return null;

  const userXp = user?.xp || 0;
  const benchmarkXp = 2300;
  const progressPercent = Math.min(100, Math.round((userXp / benchmarkXp) * 100));
  const remainingXp = Math.max(0, benchmarkXp - userXp);

  return (
    <div 
      id="champions-qualification-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 rounded-3xl border-2 border-amber-500/40 p-6 sm:p-8 text-white shadow-[0_0_50px_rgba(245,158,11,0.2)] space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Trophy & Lock Icon */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border-2 border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0">
            <Trophy className="w-7 h-7 text-amber-400 fill-amber-400/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-400/40 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>MERIT ACCESS RESTRICTED</span>
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white mt-1">
              Champions League Qualification
            </h3>
          </div>
        </div>

        {/* Informative Explanation */}
        <div className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <p>
            The official UEFA-style Champions League arena and grand contender intro are unlocked exclusively for the <strong>Top 32 Nigerian Merit Scholars</strong>.
          </p>
          <p className="text-slate-400 text-xs">
            Qualified scholars battle in 8 groups of 4 for <strong>₦9,500 Cash Payouts</strong>, 1-Month Free Premium, and custom Website Themes.
          </p>
        </div>

        {/* Merit Benchmark Progress Bar */}
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5 font-mono">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Your Merit XP: {userXp} XP</span>
            </span>
            <span className="text-amber-300 font-mono font-black">
              Benchmark: {benchmarkXp} XP ({progressPercent}%)
            </span>
          </div>

          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-amber-500/20">
            <div 
              className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-amber-200/80 font-mono">
            {remainingXp > 0 
              ? `⚡ Earn ${remainingXp} more XP through CBT practice to secure an official qualification slot!`
              : '✓ Qualification benchmark met! Updating server rankings...'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={() => {
              onClose();
              onNavigate('practice');
            }}
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-102"
          >
            <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>Practice Questions to Earn Merit XP</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <button
            onClick={() => {
              onClose();
              onProceedAsSpectator();
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Enter & Spectate Tournament Brackets</span>
          </button>
        </div>

      </div>
    </div>
  );
};
