import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  X, 
  Award, 
  ArrowRight,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { AchievementBadge } from '../types';
import { triggerBadgeUnlockConfetti } from '../utils/confettiCelebration';

export const BadgeUnlockedToast: React.FC = () => {
  const [unlockedBadgesQueue, setUnlockedBadgesQueue] = useState<AchievementBadge[]>([]);
  const [currentBadge, setCurrentBadge] = useState<AchievementBadge | null>(null);

  useEffect(() => {
    const handleEvent = (e: any) => {
      const newlyUnlocked: AchievementBadge[] = e.detail?.newlyUnlocked;
      if (Array.isArray(newlyUnlocked) && newlyUnlocked.length > 0) {
        setUnlockedBadgesQueue(prev => [...prev, ...newlyUnlocked]);
      }
    };

    window.addEventListener('studynaija_badge_unlocked', handleEvent);
    return () => {
      window.removeEventListener('studynaija_badge_unlocked', handleEvent);
    };
  }, []);

  useEffect(() => {
    if (!currentBadge && unlockedBadgesQueue.length > 0) {
      const next = unlockedBadgesQueue[0];
      setCurrentBadge(next);
      setUnlockedBadgesQueue(prev => prev.slice(1));
      triggerBadgeUnlockConfetti();
    }
  }, [currentBadge, unlockedBadgesQueue]);

  if (!currentBadge) return null;

  const handleDismiss = () => {
    setCurrentBadge(null);
  };

  const handleShare = () => {
    const text = `🇳🇬 Academic Milestone Unlocked! I just earned the "${currentBadge.title}" ${currentBadge.icon} badge on StudyNaija! 🎯 Practice past questions with me at https://studynaija.ng`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-[0_0_60px_rgba(245,158,11,0.3)] space-y-5 text-white relative">
        
        {/* Glow halo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono font-black uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>NEW ACHIEVEMENT UNLOCKED!</span>
          </div>
          <h3 className="text-2xl font-black text-white font-['Outfit'] pt-1">
            {currentBadge.title}
          </h3>
        </div>

        {/* Big Emblem */}
        <div className="relative z-10 py-1">
          <div className="w-24 h-24 rounded-3xl bg-slate-950 border-2 border-amber-400/80 mx-auto flex items-center justify-center text-5xl shadow-[0_0_35px_rgba(245,158,11,0.4)] animate-bounce-slow">
            <span>{currentBadge.icon}</span>
          </div>
          <div className="mt-3 inline-block px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
            +{currentBadge.rewardXp} Academic XP Awarded
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 leading-relaxed relative z-10 px-2">
          {currentBadge.description}
        </p>

        {/* Buttons */}
        <div className="space-y-2 relative z-10 pt-2">
          <button
            onClick={handleDismiss}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Awesome, Claim Reward!</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-700 flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Badge to WhatsApp Status</span>
          </button>
        </div>

      </div>
    </div>
  );
};
