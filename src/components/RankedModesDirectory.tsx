import React, { useState } from 'react';
import {
  Trophy,
  Zap,
  Timer,
  BookOpen,
  Sparkles,
  Calculator,
  WifiOff,
  Compass,
  Swords,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Flame,
  Award,
  Crown,
  HelpCircle,
  Eye,
  Lock,
  Layers
} from 'lucide-react';

export interface ModeItem {
  id: string;
  name: string;
  category: 'ranked' | 'unranked';
  badge: string;
  tagline: string;
  pointsEarned: string;
  pointsDetails: string;
  rules: string;
  rewards: string;
  targetView: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  isPopular?: boolean;
}

export const MODES_LIST: ModeItem[] = [
  // ---------------- RANKED MODES ----------------
  {
    id: 'mock-exam',
    name: 'Full CBT Mock Exam',
    category: 'ranked',
    badge: '🟢 RANKED • HIGH STAKES',
    tagline: 'Official 4-Subject JAMB UTME Simulation',
    pointsEarned: '+10 to +400 Aggregate PTS',
    pointsDetails: 'Earns official scaled composite score (out of 400), +Speed Bonus points (+20 pts for answers < 35s), and +50 Daily Study XP.',
    rules: 'Strict 2-Hour Clock, 3 Tab-Switch Malpractice Strikes lock session, Official 8-Key CBT navigation.',
    rewards: 'Directly updates Public Leaderboard Rank & qualifies Top 32 scholars for Monthly Champions League cash prizes.',
    targetView: 'mock-exam',
    icon: Timer,
    accentColor: 'emerald',
    isPopular: true
  },
  {
    id: 'tournament',
    name: 'Champions League Tournament',
    category: 'ranked',
    badge: '🟢 RANKED • CASH REWARDS',
    tagline: 'Top 32 Monthly Scholar Championship',
    pointsEarned: '3 Pts for Win • 1 Pt for Draw',
    pointsDetails: 'Earn official UEFA-format group stage points (3 for Win, 1 for Sudden-Death Draw), goal difference, and knockout advancement.',
    rules: 'Strict 2-minute timer (5 minutes for Mathematics), 1-minute pause scientific calculator, 2-legged knockouts.',
    rewards: 'Cash Payouts: ₦5,000 (1st Place), ₦3,000 (2nd Place), ₦1,500 (3rd Place) + Gold Site Theme & VIP Goat badge.',
    targetView: 'tournament',
    icon: Trophy,
    accentColor: 'amber',
    isPopular: true
  },
  {
    id: 'arena-1v1',
    name: '1v1 Live Challenge Arena',
    category: 'ranked',
    badge: '🟢 RANKED • MULTIPLAYER',
    tagline: 'Head-to-Head Speed Duels vs Peers or AI',
    pointsEarned: '+25 PTS Win • +10 PTS Draw',
    pointsDetails: 'Wins award +25 Arena Rating points, updates Win/Loss record, and boosts your Scholar Speed Tier.',
    rules: '10 synchronized past questions, live score tracking, sudden-death tiebreaker questions.',
    rewards: 'Arena Elo Rating, Duelist Honours Badges, and bragging rights on public standings.',
    targetView: 'arena-1v1',
    icon: Swords,
    accentColor: 'cyan',
    isPopular: true
  },
  {
    id: 'flash-challenge',
    name: '60-Second Flash CBT Drill',
    category: 'ranked',
    badge: '🟢 RANKED • SPEED SPRINT',
    tagline: '10 Rapid-Fire Questions Under 1 Minute',
    pointsEarned: '+5 PTS / Correct • +15 Streak Bonus',
    pointsDetails: 'Awards +5 speed points per correct answer + up to +15 bonus points for unbroken answer streaks.',
    rules: '60-second unrelenting countdown, rapid answering, instant speed rating.',
    rewards: 'Speed Demon Badge, Quick XP boost, and Daily Goal credit.',
    targetView: 'flash',
    icon: Zap,
    accentColor: 'orange'
  },
  {
    id: 'practice-mastery',
    name: 'Topic Mastery Drills (Scored)',
    category: 'ranked',
    badge: '🟢 RANKED • SYLLABUS PROGRESS',
    tagline: 'Topic-by-Topic Syllabus Completion',
    pointsEarned: '+2 XP / Question • Streak XP',
    pointsDetails: 'Each correctly answered question awards +2 XP towards your Daily Goal, preserves your Study Streak, and advances Topic Mastery %.',
    rules: 'Answer validation per question, syllabus topic milestones.',
    rewards: 'Advances Predicted Score % and unlocks subject topic completion badges.',
    targetView: 'practice',
    icon: Flame,
    accentColor: 'rose'
  },

  // ---------------- UNRANKED MODES ----------------
  {
    id: 'practice-untimed',
    name: 'Self-Paced Untimed Practice',
    category: 'unranked',
    badge: '⚪ UNRANKED • SAFE PRACTICE',
    tagline: 'Zero Pressure & Step-by-Step Solutions',
    pointsEarned: '0 Rank Risk (Safe Learning)',
    pointsDetails: 'Does not affect your leaderboard score or win/loss ratio. No point penalties for wrong answers.',
    rules: 'Untimed mode, no tab switch strikes, reveal worked solutions & examiner traps anytime.',
    rewards: 'Bookmark questions for revision and build strong conceptual foundations.',
    targetView: 'practice',
    icon: BookOpen,
    accentColor: 'blue'
  },
  {
    id: 'ai-tutor',
    name: 'Naija AI Voice Academic Tutor',
    category: 'unranked',
    badge: '⚪ UNRANKED • PERSONAL COACH',
    tagline: 'Interactive 24/7 Voice & Formula Assistant',
    pointsEarned: '0 Rank Risk (Private Tutor)',
    pointsDetails: 'Unlimited conversational academic guidance with no scoring constraints.',
    rules: 'American lady coach voice audio, step-by-step formula derivations, syllabus explanations.',
    rewards: 'Master difficult calculations, chemistry equations, and physics concepts on demand.',
    targetView: 'ai-tutor',
    icon: Sparkles,
    accentColor: 'purple'
  },
  {
    id: 'scientific-calculator',
    name: 'CBT Scientific Calculator Sandbox',
    category: 'unranked',
    badge: '⚪ UNRANKED • STEM TOOL',
    tagline: 'Approved Scientific Pad & Physics Constants',
    pointsEarned: '0 Rank Risk (Free Tool)',
    pointsDetails: 'Practice with the exact official CBT calculator approved for JAMB and WAEC calculation subjects.',
    rules: 'Trigonometry (sin, cos, tan, inverse), DEG/RAD modes, logarithm, 10 approved physics constants, 1-minute pause drill.',
    rewards: 'Familiarize yourself with calculator shortcuts before sitting for actual exam.',
    targetView: 'calculator',
    icon: Calculator,
    accentColor: 'teal'
  },
  {
    id: 'study-tips',
    name: 'Syllabus & Exam Tips Library',
    category: 'unranked',
    badge: '⚪ UNRANKED • STUDY RESOURCE',
    tagline: 'Curriculum Guides & High-Yield Traps',
    pointsEarned: '0 Rank Risk (Resource Center)',
    pointsDetails: 'Official approved texts, examiner pitfalls, and JAMB subject combination advice.',
    rules: 'Browse comprehensive articles, literature guides, and cutoff predictions.',
    rewards: 'Academic strategic planning and avoiding common exam room traps.',
    targetView: 'study-tips',
    icon: Compass,
    accentColor: 'indigo'
  },
  {
    id: 'offline-packs',
    name: 'Zero-Data Offline Study Packs',
    category: 'unranked',
    badge: '⚪ UNRANKED • OFFLINE',
    tagline: 'Study Anywhere Without Internet Data',
    pointsEarned: 'Syncs Progress on Reconnect',
    pointsDetails: 'Download verified subjects and study without burning mobile data. Progress syncs when you go back online.',
    rules: 'Runs 100% offline via browser local storage cache.',
    rewards: 'Keep your study momentum going even with poor network connectivity.',
    targetView: 'offline-packs',
    icon: WifiOff,
    accentColor: 'slate'
  }
];

interface RankedModesDirectoryProps {
  onNavigate: (view: string, extra?: any) => void;
  onOpenCalculator?: () => void;
  onOpenFlashChallenge?: () => void;
  onOpenOfflinePacks?: () => void;
}

export const RankedModesDirectory: React.FC<RankedModesDirectoryProps> = ({
  onNavigate,
  onOpenCalculator,
  onOpenFlashChallenge,
  onOpenOfflinePacks
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'ranked' | 'unranked'>('all');

  const filteredModes = MODES_LIST.filter(item => {
    if (activeTab === 'ranked') return item.category === 'ranked';
    if (activeTab === 'unranked') return item.category === 'unranked';
    return true;
  });

  const handleModeClick = (item: ModeItem) => {
    if (item.targetView === 'calculator') {
      if (onOpenCalculator) onOpenCalculator();
    } else if (item.targetView === 'flash') {
      if (onOpenFlashChallenge) onOpenFlashChallenge();
      else onNavigate('practice');
    } else if (item.targetView === 'offline-packs') {
      if (onOpenOfflinePacks) onOpenOfflinePacks();
      else onNavigate('practice');
    } else {
      onNavigate(item.targetView);
    }
  };

  return (
    <section id="ranked-unranked-modes-guide" className="space-y-6">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
              OFFICIAL MODE DIRECTORY
            </span>
            <span className="text-xs text-slate-500 font-medium">Know where you earn points</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit'] tracking-tight">
            Ranked vs. Unranked Modes
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
            Find out exactly which modes award Leaderboard Points, cash prize qualification, and XP, versus safe unranked revision sandboxes with zero rank risk.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Modes ({MODES_LIST.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ranked')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ranked'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ Ranked Only ({MODES_LIST.filter(m => m.category === 'ranked').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('unranked')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'unranked'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>🛡️ Unranked Safe ({MODES_LIST.filter(m => m.category === 'unranked').length})</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
            ⚡
          </div>
          <div>
            <div className="font-bold text-emerald-950">Ranked Modes (Earn Points & Airtime)</div>
            <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
              Competitive exam simulations with timer countdowns and anti-cheating protection. Earns <strong>Aggregate Score Points, Leaderboard XP, and Top 32 Champions League qualification</strong>.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 font-bold">
            🛡️
          </div>
          <div>
            <div className="font-bold text-slate-900">Unranked Modes (Zero Rank Risk)</div>
            <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
              Self-paced revision sandboxes. <strong>No point penalties, no timer stress, and zero impact on leaderboard standings</strong>. Perfect for learning new concepts and practicing formulas.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Modes Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModes.map(item => {
          const Icon = item.icon;
          const isRanked = item.category === 'ranked';

          return (
            <div
              key={item.id}
              onClick={() => handleModeClick(item)}
              className={`rounded-3xl p-5 border transition-all cursor-pointer flex flex-col justify-between hover:shadow-lg group relative overflow-hidden ${
                isRanked
                  ? 'bg-gradient-to-b from-white via-emerald-50/20 to-emerald-50/40 border-emerald-300/80 hover:border-emerald-500 hover:shadow-emerald-500/10'
                  : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-slate-500/10'
              }`}
            >
              {item.isPopular && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 font-black text-[9px] px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-xs">
                  🔥 POPULAR
                </div>
              )}

              <div className="space-y-3">
                {/* Header Strip with Icon and Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${
                    isRanked
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-white'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                    isRanked
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {item.badge}
                  </span>
                </div>

                {/* Mode Name and Tagline */}
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {item.tagline}
                  </p>
                </div>

                {/* Points Earned Box */}
                <div className={`p-3 rounded-2xl border space-y-1 ${
                  isRanked
                    ? 'bg-emerald-50/80 border-emerald-200/90'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600">Points Awarded:</span>
                    <span className={`font-mono font-black ${
                      isRanked ? 'text-emerald-700' : 'text-slate-600'
                    }`}>
                      {item.pointsEarned}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {item.pointsDetails}
                  </p>
                </div>

                {/* Rules & Rewards Checklist */}
                <div className="space-y-1.5 text-[11px] pt-1">
                  <div className="flex items-start gap-1.5 text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-tight"><strong>Rules:</strong> {item.rules}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-600">
                    <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span className="leading-tight"><strong>Rewards:</strong> {item.rewards}</span>
                  </div>
                </div>
              </div>

              {/* Action Button Strip */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                <span className={isRanked ? 'text-emerald-700 group-hover:underline' : 'text-slate-800 group-hover:underline'}>
                  {item.targetView === 'calculator' ? 'Launch Calculator' : `Open ${item.name}`}
                </span>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform group-hover:translate-x-1 ${
                  isRanked ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'
                }`}>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
