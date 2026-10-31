import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Bot, 
  CheckCircle2, 
  X, 
  Award, 
  Lock, 
  Clock, 
  Zap, 
  Flame, 
  Trophy, 
  HelpCircle, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  ExternalLink,
  Smartphone,
  Eye,
  RefreshCw,
  Scale,
  BookOpen
} from 'lucide-react';
import { User } from '../types';
import confetti from 'canvas-confetti';

interface ScholarHonorCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateUser?: (updated: User) => void;
}

export const ScholarHonorCodeModal: React.FC<ScholarHonorCodeModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser
}) => {
  const [activeTab, setActiveTab] = useState<'pillars' | 'tiers' | 'pledge' | 'simulator' | 'appeals'>('pillars');
  const [selectedPillar, setSelectedPillar] = useState<number>(1);
  const [simulatedInfraction, setSimulatedInfraction] = useState<string>('tab_switch');
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [pledgeSignedSuccess, setPledgeSignedSuccess] = useState<boolean>(() => {
    return user?.pledgeSigned || !!localStorage.getItem('studynaija_scholar_pledge_signed');
  });

  if (!isOpen) return null;

  const integrityScore = user?.integrityScore ?? 100;
  const currentTier = integrityScore >= 90 ? 'merit' : integrityScore >= 60 ? 'observation' : 'quarantine';

  const handleSignPledge = () => {
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setPledgeSignedSuccess(true);
      try {
        localStorage.setItem('studynaija_scholar_pledge_signed', 'true');
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}

      if (user && onUpdateUser) {
        const updated: User = {
          ...user,
          pledgeSigned: true,
          honorSealActive: true,
          xp: (user.xp || 0) + 25
        };
        onUpdateUser(updated);
      }
    }, 600);
  };

  const pillarsData = [
    {
      id: 1,
      title: 'Pillar 1: Academic Integrity & CBT Exam Conduct',
      subtitle: 'Official JAMB UTME, WAEC & NECO Examination Simulation Standards',
      badge: 'CBT Proctoring',
      icon: '🛡️',
      color: 'emerald',
      rules: [
        {
          name: 'Zero Exam Malpractice ("Runs" / "Expo")',
          desc: 'Strict prohibition on soliciting, trading, sharing, or discussing leaked exam questions, predicted question papers, or unauthorized answer keys.',
          detection: 'SabiGuard NLP keyword engine scans community messages, usernames, and comment threads in real time.',
          consequences: [
            '1st Offense: Immediate message purge + 24-hour forum mute.',
            '2nd Offense: 7-day discussion suspension + 25-point deduction from Academic Integrity Rating.'
          ]
        },
        {
          name: 'Multi-Tab & Device Switching Restrictions',
          desc: 'Switching browser tabs, minimizing the CBT exam window, or opening external browser extensions during a live timed 400-mark mock exam.',
          detection: 'Browser Page Visibility API & window blur telemetry log every off-screen event with millisecond timestamps.',
          consequences: [
            'Up to 2 tab switches: Yellow proctor warning banner.',
            '3rd tab switch: Automatic exam paper submission with flagged "Proctoring Anomaly" status on the result slip.'
          ]
        },
        {
          name: 'Realistic Response Velocity Checks',
          desc: 'Submitting complex calculation questions (e.g. Physics projectile calculations or Chemistry stoichiometry) in under 2 seconds without cognitive reading time.',
          detection: 'Statistical answer duration analysis relative to syllabus reading difficulty benchmarks.',
          consequences: [
            'Flagged for AI Sentinel velocity audit; score temporarily withheld from national leaderboard until pattern normalizes.'
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Pillar 2: Competitive Fair Play in Tournaments & Arena',
      subtitle: 'Monthly 32-Scholar Champions League & 1v1 Head-to-Head Standards',
      badge: 'Arena & League',
      icon: '🏆',
      color: 'amber',
      rules: [
        {
          name: 'Match Abandonment & Rage-Quitting',
          desc: 'Disconnecting intentionally or closing the application during an ongoing 1v1 Arena bout or Champions League fixture to protect ranking points.',
          detection: 'Server WebSocket heartbeat monitor registers non-graceful connection termination during active rounds.',
          consequences: [
            'Immediate 0–5 walkover victory awarded to opponent.',
            '30-minute queue lockout cooldown from ranked matchmaking.'
          ]
        },
        {
          name: 'Collusion & Sybil Match-Fixing',
          desc: 'Coordinating with friends or using secondary dummy accounts in simultaneous queues to trade easy wins and inflate Composite Scholar Index (CSI).',
          detection: 'Cross-account IP, device fingerprint, and repetitive match pairing heuristics evaluated by Admin Sentinel.',
          consequences: [
            'Eviction from current month’s tournament bracket.',
            'Permanent forfeiture of season qualification points and prize eligibility.'
          ]
        },
        {
          name: 'G.O.A.T Championship Defense Protocol',
          desc: 'Reigning Champions League title holders must uphold continuous learning and actively defend their crown when a new monthly tournament commences.',
          detection: 'Automated 1st-of-the-month tournament cycle reset orchestrated by Admin AI Sentinel.',
          consequences: [
            'Title & belt returned to the open prize pool; previous victory commemorated forever in the National Hall of Fame.'
          ]
        }
      ]
    },
    {
      id: 3,
      title: 'Pillar 3: Learning Streak & Gamification Authenticity',
      subtitle: 'Daily Study Streaks, Experience Points (XP) & Scholar Rankings',
      badge: 'Streaks & XP',
      icon: '🔥',
      color: 'orange',
      rules: [
        {
          name: 'Prohibition of Auto-Clickers & Script Automation',
          desc: 'Deploying browser automation scripts, headless bots, or auto-clicking software to farm questions or falsely extend daily streaks.',
          detection: 'Keystroke interval variance, cursor entropy, and sub-100ms click repetition detection.',
          consequences: [
            'Immediate streak reset back to Day 1.',
            'Rollback of unearned XP points and suspension of leaderboard multiplier.'
          ]
        },
        {
          name: 'Multi-Account Sybil Bonus Exploitation',
          desc: 'Creating alternate accounts to artificially claim referral bonuses, daily study chests, or simulate multi-device usage.',
          detection: 'Device localStorage cross-matching and payment telephone mapping.',
          consequences: [
            'Consolidation of privileges to primary verified student profile; secondary accounts locked.'
          ]
        }
      ]
    },
    {
      id: 4,
      title: 'Pillar 4: Community Respect & Peer Learning',
      subtitle: 'SabiGuard Safety Rules in Discussion Rooms & Study Hubs',
      badge: 'Community',
      icon: '💬',
      color: 'blue',
      rules: [
        {
          name: 'Zero Harassment, Cyberbullying & Discrimination',
          desc: 'Derogatory attacks, tribal prejudice, religious insults, or gender harassment directed at fellow candidates or educational institutions.',
          detection: 'Real-time AI text moderation filter with Nigerian multi-lingual sentiment lexicon.',
          consequences: [
            '1st Strike: Automated message redaction + 48-hour shadow-ban.',
            '2nd Strike: Permanent revocation of discussion board posting privileges.'
          ]
        },
        {
          name: 'No WhatsApp Group Solicitation & Contact Spam',
          desc: 'Broadcasting commercial promotions, paid tutorial links, or harvesting phone numbers from vulnerable secondary school students.',
          detection: 'Automated regex telephone and invite-link scrubber.',
          consequences: [
            'Immediate message block with automated educational guidance alert displayed to sender.'
          ]
        }
      ]
    },
    {
      id: 5,
      title: 'Pillar 5: Prize Claims & Financial Verifications',
      subtitle: 'Airtime Rewards (MTN, Airtel, Glo, 9mobile) & Cash Prize Disbursements',
      badge: 'Cash & Airtime',
      icon: '💰',
      color: 'cyan',
      rules: [
        {
          name: 'Accurate Nigerian Mobile Phone Submission',
          desc: 'Winners must provide an active, valid Nigerian telephone number registered to their chosen network (e.g. 08012345678) within 7 days.',
          detection: 'Administrative payment verification queue with automated prefix network validation.',
          consequences: [
            'Unclaimed airtime disbursements held in escrow for 7 days before rolling over to the next eligible runner-up.'
          ]
        },
        {
          name: 'Zero Fraudulent Bank Transfer Receipts',
          desc: 'Submitting forged, edited, or re-used bank transfer receipts to dishonestly unlock Basic or Premium subscriptions.',
          detection: 'Admin payment audit cross-referenced against OPay business account records (Account: 9166059676).',
          consequences: [
            'Immediate permanent ban from payment verification queue.',
            'Account flagged in Troll & Malpractice Registry with immediate account suspension.'
          ]
        }
      ]
    }
  ];

  const currentPillarData = pillarsData.find(p => p.id === selectedPillar) || pillarsData[0];

  const simulatorScenarios: Record<string, {
    title: string;
    offense: string;
    detection: string;
    penalty: string;
    impact: string;
  }> = {
    tab_switch: {
      title: 'Tab-Switching 3 Times in CBT Mock',
      offense: 'Candidate navigated away from the exam room to look up formulas in Google.',
      detection: 'Page Visibility API logged: TabSwitch#1 (12s), TabSwitch#2 (8s), TabSwitch#3 (15s).',
      penalty: 'Automatic Exam Submission • Result Slip Flagged with Proctoring Anomaly.',
      impact: 'Integrity Rating drops to 70%; disqualified from top-scholar prize drawing for the day.'
    },
    auto_clicker: {
      title: 'Using Auto-Clicker for 100-Day Streak',
      offense: 'Automated script clicked 50 questions in under 15 seconds to trigger streak bonus.',
      detection: 'Delta-time between answers: 0.12s uniformly across 50 questions (Entropy: 0.001).',
      penalty: 'Daily Streak reset to Day 0 • 24-Hour Forum Posting Quarantine.',
      impact: 'Streak multiplier wiped; student must rebuild streak genuinely over next 7 days.'
    },
    fake_receipt: {
      title: 'Submitting Altered OPay Payment Screenshot',
      offense: 'Submitting an edited graphic of a ₦1,500 transfer without sending actual bank funds.',
      detection: 'Admin verification audit against real-time OPay session records shows zero matched reference.',
      penalty: 'Account flagged in Malpractice Registry • Permanent Payment Submission Ban.',
      impact: 'Subscription rejected; user locked out of payment verification queues.'
    },
    expo_solicitation: {
      title: 'Asking for "JAMB Runs" in Community',
      offense: 'Posted: "DM me on WhatsApp 080... for leaked Chemistry expo questions tomorrow".',
      detection: 'SabiGuard NLP keyword match on "runs", "expo", "leaked", and phone regex.',
      penalty: 'Message instantly blocked from view • 48-Hour Study Room Mute.',
      impact: 'Academic integrity rating reduced by 25 points.'
    }
  };

  const activeScenario = simulatorScenarios[simulatedInfraction] || simulatorScenarios.tab_switch;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col text-white shadow-[0_0_60px_rgba(16,185,129,0.25)] relative overflow-hidden">
        
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4 relative z-10 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60 border border-emerald-400/40 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  OFFICIAL CODE OF CONDUCT
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  STUDYNAIJA SCHOLAR INTEGRITY STANDARD
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white font-['Outfit'] tracking-tight">
                Scholar Honor Code, Rules & Consequences
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 sm:px-6 pt-3 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 relative z-10">
          <button
            onClick={() => setActiveTab('pillars')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pillars'
                ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>5 Pillars of Conduct</span>
          </button>

          <button
            onClick={() => setActiveTab('tiers')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'tiers'
                ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>3-Tier Standing System</span>
          </button>

          <button
            onClick={() => setActiveTab('pledge')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pledge'
                ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sign Scholar Pledge (+25 XP)</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Penalty Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('appeals')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'appeals'
                ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Score Recovery & Appeals</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 relative z-10 text-xs sm:text-sm">
          
          {/* TAB 1: 5 PILLARS OF CONDUCT */}
          {activeTab === 'pillars' && (
            <div className="space-y-5">
              
              {/* Pillar Selector Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {pillarsData.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPillar(p.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-1 ${
                      selectedPillar === p.id
                        ? 'bg-slate-800 border-emerald-400/80 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <span className="text-xl">{p.icon}</span>
                    <span className="text-[11px] font-bold text-white line-clamp-1">{p.badge}</span>
                    <span className="text-[9px] font-mono text-emerald-400">Pillar {p.id}</span>
                  </button>
                ))}
              </div>

              {/* Selected Pillar Card */}
              <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{currentPillarData.icon}</span>
                      <h3 className="text-base sm:text-lg font-black text-white font-['Outfit']">
                        {currentPillarData.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {currentPillarData.subtitle}
                    </p>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    SabiGuard Enforced
                  </span>
                </div>

                {/* Rules List inside Pillar */}
                <div className="space-y-4">
                  {currentPillarData.rules.map((rule, idx) => (
                    <div key={idx} className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-[10px] font-mono font-bold">
                            {idx + 1}
                          </span>
                          <span>{rule.name}</span>
                        </h4>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {rule.desc}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 space-y-1">
                          <span className="font-mono text-cyan-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                            <Eye className="w-3 h-3 text-cyan-400" /> Detection Engine:
                          </span>
                          <span className="text-slate-300 leading-snug block">
                            {rule.detection}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-rose-500/20 space-y-1">
                          <span className="font-mono text-rose-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-400" /> Tiered Consequence:
                          </span>
                          <ul className="text-slate-300 space-y-0.5 list-disc list-inside">
                            {rule.consequences.map((c, cIdx) => (
                              <li key={cIdx}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 3-TIER STANDING SYSTEM */}
          {activeTab === 'tiers' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white text-sm">Your Current Scholar Standing</h3>
                  <p className="text-xs text-slate-400">Calculated autonomously from your clean examination and community history.</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-black font-mono ${
                    currentTier === 'merit' ? 'text-emerald-400' : currentTier === 'observation' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {integrityScore}%
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">Academic Integrity Rating</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tier 1 */}
                <div className={`rounded-2xl p-4 border space-y-3 ${
                  currentTier === 'merit'
                    ? 'bg-emerald-950/50 border-emerald-400 shadow-lg ring-2 ring-emerald-500/30'
                    : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      TIER 1 (90% – 100%)
                    </span>
                    {currentTier === 'merit' && (
                      <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Your Standing
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-black text-white font-['Outfit']">National Merit Standing</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Pristine exam history, zero malpractice solicitations, authentic daily study habits.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-300 space-y-1">
                    <div>✓ Eligible for Monthly Airtime & Cash Prizes</div>
                    <div>✓ Full Champions League 32-bracket invitations</div>
                    <div>✓ Official verifiable JAMB/WAEC result slip certification</div>
                  </div>
                </div>

                {/* Tier 2 */}
                <div className={`rounded-2xl p-4 border space-y-3 ${
                  currentTier === 'observation'
                    ? 'bg-amber-950/50 border-amber-400 shadow-lg ring-2 ring-amber-500/30'
                    : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      TIER 2 (60% – 89%)
                    </span>
                    {currentTier === 'observation' && (
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Your Standing
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-black text-white font-['Outfit']">Under Observation</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Minor tab-switching anomalies recorded during timed mocks or forum warning history.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300 space-y-1">
                    <div>⚠️ Proactive SabiGuard focus guidance enabled</div>
                    <div>⚠️ Leaderboard standings marked with caution pill</div>
                    <div>✓ Solvable via 3 clean proctored exam sessions</div>
                  </div>
                </div>

                {/* Tier 3 */}
                <div className={`rounded-2xl p-4 border space-y-3 ${
                  currentTier === 'quarantine'
                    ? 'bg-rose-950/50 border-rose-400 shadow-lg ring-2 ring-rose-500/30'
                    : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30">
                      TIER 3 (&lt;60%)
                    </span>
                    {currentTier === 'quarantine' && (
                      <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Your Standing
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-black text-white font-['Outfit']">Sentinel Quarantine</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Repeated auto-clicker deployment, excessive tab jumps, or payment receipt anomalies.
                  </p>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-rose-300 space-y-1">
                    <div>✕ Prize eligibility paused indefinitely</div>
                    <div>✕ Ranked Champions League matchmaking locked</div>
                    <div>✓ Practice drills remain available for study</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIGN SCHOLAR PLEDGE */}
          {activeTab === 'pledge' && (
            <div className="max-w-2xl mx-auto rounded-3xl bg-slate-950/90 border border-emerald-500/40 p-6 sm:p-8 space-y-6 text-center shadow-xl">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 mx-auto flex items-center justify-center text-slate-950 shadow-lg">
                <ShieldCheck className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
                  The StudyNaija Scholar Pledge
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  Every candidate who aspires to gain admission into Nigeria&rsquo;s leading federal, state, and private universities commits to honest preparation.
                </p>
              </div>

              {/* Pledge Text Box */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 text-left text-xs sm:text-sm text-slate-200 leading-relaxed italic space-y-2 shadow-inner">
                <p>
                  &ldquo;I, <strong className="text-emerald-400 font-bold not-italic">{user?.name || 'Aspirant'}</strong>, solemnly pledge on my academic honour:
                </p>
                <p>
                  1. To sit all CBT Mock examinations with honesty, refusing unauthorized aid, tab switching, or external automation.
                </p>
                <p>
                  2. To compete fairly in the Champions League and 1v1 Arena, respecting my fellow Nigerian scholars win or lose.
                </p>
                <p>
                  3. To encourage my peers in the study discussion rooms with kindness and constructive revision tips, upholding truth and integrity as the foundation of my future tertiary career.&rdquo;
                </p>
              </div>

              {pledgeSignedSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-left">
                    <span className="font-bold text-xs text-white block">Pledge Officially Affirmed & Sealed!</span>
                    <span className="text-[11px] text-emerald-200">You have earned the Verified Merit Scholar Seal (+25 XP).</span>
                  </div>
                </div>
              ) : (
                <button
                  disabled={isSigning}
                  onClick={handleSignPledge}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm tracking-wider shadow-lg hover:scale-102 transition-all cursor-pointer font-['Outfit'] inline-flex items-center gap-2"
                >
                  {isSigning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>AFFIRMING PLEDGE...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      <span>SIGN PLEDGE & CLAIM +25 XP →</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* TAB 4: PENALTY SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-white text-sm">Interactive Penalty & Detection Sandbox</h3>
                <p className="text-xs text-slate-400">Select any simulated violation to preview the exact detection engine and autonomous consequence before it occurs.</p>
              </div>

              {/* Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'tab_switch', label: '📱 Tab-Switching in Mock' },
                  { id: 'auto_clicker', label: '⚡ Auto-Clicker on Streak' },
                  { id: 'fake_receipt', label: '💳 Fake Transfer Receipt' },
                  { id: 'expo_solicitation', label: '🚫 "Runs / Expo" Post' }
                ].map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSimulatedInfraction(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      simulatedInfraction === s.id
                        ? 'bg-rose-500 text-white font-black shadow-md'
                        : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Scenario Display */}
              <div className="rounded-3xl bg-slate-950/90 border border-rose-500/30 p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 text-rose-400 font-bold border-b border-slate-800 pb-3">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm text-white font-['Outfit']">{activeScenario.title}</span>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <span className="font-mono text-slate-400 font-bold uppercase text-[10px] block">Simulated Event:</span>
                    <span className="text-slate-200">{activeScenario.offense}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30">
                    <span className="font-mono text-cyan-400 font-bold uppercase text-[10px] block flex items-center gap-1">
                      <Eye className="w-3 h-3 text-cyan-400" /> SabiGuard Autonomous Telemetry:
                    </span>
                    <span className="text-slate-300 font-mono text-[11px] block mt-1">
                      {activeScenario.detection}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40">
                    <span className="font-mono text-rose-300 font-bold uppercase text-[10px] block flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-rose-400" /> Enforced Consequence:
                    </span>
                    <span className="text-white font-bold block mt-1">
                      {activeScenario.penalty}
                    </span>
                    <span className="text-rose-200/90 text-[11px] block mt-0.5">
                      {activeScenario.impact}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SCORE RECOVERY & APPEALS */}
          {activeTab === 'appeals' && (
            <div className="space-y-5">
              <div className="rounded-3xl bg-slate-950/90 border border-slate-800 p-5 sm:p-6 space-y-4">
                <h3 className="text-base font-black text-white font-['Outfit'] flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span>How to Recover Your Academic Integrity Score</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  StudyNaija operates on redemption through authentic learning. If your integrity rating has been penalized due to accidental tab switching, browser crashes, or minor warnings, you can rebuild your rating automatically:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2">
                    <span className="text-xl">📝</span>
                    <h4 className="font-bold text-white text-xs">Step 1: Clean Exam Sessions</h4>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Complete 3 consecutive timed CBT exams without navigating away from the exam screen (+15% Integrity Recovery).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2">
                    <span className="text-xl">🔥</span>
                    <h4 className="font-bold text-white text-xs">Step 2: 7-Day Organic Streak</h4>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Maintain a 7-day organic practice drill streak without telemetry velocity alerts (+10% Integrity Recovery).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2">
                    <span className="text-xl">🛡️</span>
                    <h4 className="font-bold text-white text-xs">Step 3: Admin Review Appeal</h4>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      If a system error or network disconnect caused an erroneous strike, message support on WhatsApp or contact Admin Sentinel for manual clearing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3 shrink-0 relative z-10 text-xs">
          <span className="text-slate-400 hidden sm:inline">
            🔒 Protected by SabiGuard AI Sentinel Real-Time Anti-Malpractice Engine
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer ml-auto"
          >
            Close Rulebook
          </button>
        </div>

      </div>
    </div>
  );
};
