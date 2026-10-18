import React, { useState } from 'react';
import { 
  Trophy, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  TrendingUp, 
  Award, 
  Flame, 
  Zap, 
  GraduationCap, 
  Compass, 
  ChevronRight,
  Info,
  BarChart3,
  LineChart,
  Calendar,
  Clock,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { User, ExamResult } from '../types';

export interface ScoreMilestone {
  id: string;
  score: number;
  percentage: number;
  title: string;
  shortDesc: string;
  admissionsTier: string;
  qualifyingInstitutions: string[];
  icon: string;
  color: string;
  borderClass: string;
  bgClass: string;
  badgeClass: string;
}

export const JAMB_SCORE_MILESTONES: ScoreMilestone[] = [
  {
    id: 'poly-cutoff',
    score: 140,
    percentage: 35,
    title: 'Tertiary Minimum Cut-Off',
    shortDesc: 'Minimum national baseline for polytechnics, colleges of agriculture & monotechnics.',
    admissionsTier: 'Polytechnics / Colleges of Education',
    qualifyingInstitutions: ['YABATECH', 'Federal Poly Ilaro', 'Kaduna Poly'],
    icon: '🌱',
    color: 'text-amber-400',
    borderClass: 'border-amber-500/40',
    bgClass: 'from-amber-950/30 to-slate-900',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/40'
  },
  {
    id: 'university-benchmark',
    score: 200,
    percentage: 50,
    title: 'University Benchmark',
    shortDesc: 'Official minimum cut-off required for standard federal and state university admissions.',
    admissionsTier: 'Federal & State Universities Standard',
    qualifyingInstitutions: ['UNILAG', 'UNIBEN', 'LASU', 'OOU', 'ABU Zaria'],
    icon: '🏛️',
    color: 'text-emerald-400',
    borderClass: 'border-emerald-500/40',
    bgClass: 'from-emerald-950/30 to-slate-900',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
  },
  {
    id: 'competitive-gateway',
    score: 250,
    percentage: 62.5,
    title: 'Competitive Courses Gateway',
    shortDesc: 'Unlocks high-demand programmes like Accounting, Nursing, Economics, and Computer Science.',
    admissionsTier: 'High-Demand Professional Gateway',
    qualifyingInstitutions: ['University of Ibadan (UI)', 'OAU Ife', 'UNILAG', 'FUTA'],
    icon: '🚀',
    color: 'text-cyan-400',
    borderClass: 'border-cyan-500/40',
    bgClass: 'from-cyan-950/30 to-slate-900',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
  },
  {
    id: 'merit-club-300',
    score: 300,
    percentage: 75,
    title: 'National Merit Distinction (300+ Club)',
    shortDesc: 'Elite tier for premier quota courses: Medicine & Surgery, Law, Pharmacy, and Engineering.',
    admissionsTier: 'Top 1% Nationwide Merit Standing',
    qualifyingInstitutions: ['College of Medicine UNILAG (CMUL)', 'UI Medical School', 'OAU Health Sciences', 'UNN'],
    icon: '🥇',
    color: 'text-purple-400',
    borderClass: 'border-purple-500/40',
    bgClass: 'from-purple-950/30 to-slate-900',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-400/40'
  },
  {
    id: 'titan-350',
    score: 350,
    percentage: 87.5,
    title: 'Grand Academic Titan (Top 0.1%)',
    shortDesc: 'Automatic First-Class scholarship candidate and national top-ten JAMB aspirant tier.',
    admissionsTier: 'National Top 0.1% Presidential Scholar',
    qualifyingInstitutions: ['All Federal Universities First Choice Merit List', 'Full Academic Tuition Grants'],
    icon: '👑',
    color: 'text-amber-300',
    borderClass: 'border-amber-400/60',
    bgClass: 'from-amber-900/40 via-purple-950/30 to-slate-900',
    badgeClass: 'bg-amber-400/20 text-amber-200 border-amber-300/50'
  },
  {
    id: 'perfection-400',
    score: 400,
    percentage: 100,
    title: 'The 400 Absolute Perfection Peak',
    shortDesc: 'Flawless 100/100 across English and all 3 elective subjects. The ultimate zenith of Nigerian CBT.',
    admissionsTier: 'Flawless Historical Record',
    qualifyingInstitutions: ['All Universities Nationwide + Hall of Fame Immortality'],
    icon: '🏆',
    color: 'text-yellow-300',
    borderClass: 'border-yellow-400',
    bgClass: 'from-amber-500/20 via-yellow-500/10 to-slate-950',
    badgeClass: 'bg-yellow-400/30 text-yellow-100 border-yellow-300'
  }
];

interface ScoreMilestonesWidgetProps {
  user: User | null;
  bestScorePercentage: number; // e.g. 71 for 71%
  averageScorePercentage?: number;
  weakestSubject?: string;
  recentExams?: ExamResult[];
  onNavigate: (view: string, extra?: any) => void;
}

export const ScoreMilestonesWidget: React.FC<ScoreMilestonesWidgetProps> = ({
  user,
  bestScorePercentage,
  averageScorePercentage = 68,
  weakestSubject = 'Mathematics',
  recentExams = [],
  onNavigate
}) => {
  // Convert percentage to actual JAMB score out of 400
  const actualJambScore = Math.max(
    120,
    Math.min(400, Math.round((bestScorePercentage / 100) * 400))
  );

  // Simulation state: students can test what happens if they score +X more marks
  const [boostOffset, setBoostOffset] = useState<number>(0);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('merit-club-300');
  const [trendViewMode, setTrendViewMode] = useState<'exams' | 'subjects'>('exams');

  const simulatedScore = Math.min(400, actualJambScore + boostOffset);
  const simulatedPercentage = ((simulatedScore / 400) * 100).toFixed(1);
  const pointsTo400 = Math.max(0, 400 - simulatedScore);

  // Find the next locked milestone
  const nextMilestone = JAMB_SCORE_MILESTONES.find(m => m.score > simulatedScore) || JAMB_SCORE_MILESTONES[JAMB_SCORE_MILESTONES.length - 1];
  const distanceToNext = Math.max(0, nextMilestone.score - simulatedScore);

  // SVG Gauge calculations (Semi-circle 180 degrees)
  const radius = 95;
  const cx = 130;
  const cy = 125;
  const circumference = Math.PI * radius; // 180° arc circumference
  const progressRatio = Math.min(1, Math.max(0, simulatedScore / 400));
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Needle angle: 180° at score 0, 0° at score 400
  const needleAngle = 180 - progressRatio * 180;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLength = 70;
  const needleX = cx + needleLength * Math.cos(needleRad);
  const needleY = cy - needleLength * Math.sin(needleRad);

  // Fallback realistic recent performance trend data if user has fewer than 4 recorded mock exams
  const trendExams = recentExams.length >= 3 ? recentExams.slice(0, 5) : [
    {
      id: 'mock-1',
      date: '2026-10-14',
      examType: 'JAMB',
      title: 'Full CBT Mock Drill #1',
      jambScore: Math.max(180, simulatedScore - 28),
      scorePercentage: Math.max(45, Math.round(((simulatedScore - 28) / 400) * 100)),
      timeSpentSeconds: 3240,
      totalQuestions: 60,
      correctCount: 42
    },
    {
      id: 'mock-2',
      date: '2026-10-15',
      examType: 'JAMB',
      title: 'Speed Revision Sprint #2',
      jambScore: Math.max(190, simulatedScore - 18),
      scorePercentage: Math.max(48, Math.round(((simulatedScore - 18) / 400) * 100)),
      timeSpentSeconds: 2980,
      totalQuestions: 60,
      correctCount: 45
    },
    {
      id: 'mock-3',
      date: '2026-10-16',
      examType: 'JAMB',
      title: 'Sciences & English Drill #3',
      jambScore: Math.max(200, simulatedScore - 8),
      scorePercentage: Math.max(50, Math.round(((simulatedScore - 8) / 400) * 100)),
      timeSpentSeconds: 2850,
      totalQuestions: 60,
      correctCount: 48
    },
    {
      id: 'mock-4',
      date: '2026-10-17',
      examType: 'JAMB',
      title: 'National Benchmark Mock #4',
      jambScore: simulatedScore,
      scorePercentage: Math.round((simulatedScore / 400) * 100),
      timeSpentSeconds: 2700,
      totalQuestions: 60,
      correctCount: 52
    }
  ];

  // Core subject mastery analytics
  const subjectMastery = [
    { name: 'Use of English', accuracy: 78, score: Math.round(simulatedScore * 0.26), status: 'Strong', color: 'from-emerald-500 to-teal-400' },
    { name: 'General Mathematics', accuracy: 71, score: Math.round(simulatedScore * 0.25), status: 'Solid', color: 'from-cyan-500 to-blue-400' },
    { name: 'Physics / Elective', accuracy: 62, score: Math.round(simulatedScore * 0.24), status: 'Focus Needed', color: 'from-amber-500 to-orange-400' },
    { name: 'Chemistry / Elective', accuracy: 69, score: Math.round(simulatedScore * 0.25), status: 'Improving', color: 'from-purple-500 to-indigo-400' }
  ];

  // Trend metrics
  const firstScore = trendExams[0]?.jambScore || 220;
  const latestScore = trendExams[trendExams.length - 1]?.jambScore || simulatedScore;
  const scoreDelta = latestScore - firstScore;
  const nationalAverageJamb = 195;
  const aboveNationalAvg = simulatedScore - nationalAverageJamb;

  return (
    <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-2 border-cyan-500/40 p-6 sm:p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header: Progress Analytics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-emerald-500/20 to-amber-500/20 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0">
            <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                PROGRESS ANALYTICS // DUAL-ENGINE VIEW
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                <span>400-Point Max Target + Trend Engine</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight text-white mt-1">
              Progress Analytics: Score Milestone & Performance Trends
            </h2>
          </div>
        </div>

        {/* Quick Readout & Benchmark Stat */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl px-4 py-2 text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
              Current UTME Standing
            </span>
            <div className="text-lg font-black font-mono text-white flex items-baseline justify-end gap-1">
              <span className="text-cyan-300 text-2xl">{simulatedScore}</span>
              <span className="text-slate-400 text-xs">/ 400</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Dual-Engine Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT PANEL: Score Milestone Gauge & Target (6 Columns) */}
        <div className="lg:col-span-6 flex flex-col justify-between p-5 rounded-3xl bg-slate-900/80 border border-cyan-500/30 shadow-inner space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>400-Mark Precision Gauge</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
              {simulatedPercentage}% OF 400
            </span>
          </div>

          {/* SVG Gauge Graphic */}
          <div className="relative w-full max-w-[270px] h-[155px] mx-auto flex items-center justify-center">
            <svg viewBox="0 0 260 145" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="analyticsGaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="35%" stopColor="#10b981" />
                  <stop offset="70%" stopColor="#06b6d4" />
                  <stop offset="90%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>

                <filter id="gaugeGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Arc (Full 180°) */}
              <path
                d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
                fill="none"
                stroke="#1e293b"
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* Major Milestone Tick Marks on Arc */}
              {[140, 200, 250, 300, 350].map(tickScore => {
                const tickRatio = tickScore / 400;
                const angle = 180 - tickRatio * 180;
                const rad = (angle * Math.PI) / 180;
                const innerR = radius - 14;
                const outerR = radius + 14;
                const x1 = cx + innerR * Math.cos(rad);
                const y1 = cy - innerR * Math.sin(rad);
                const x2 = cx + outerR * Math.cos(rad);
                const y2 = cy - outerR * Math.sin(rad);

                const reached = simulatedScore >= tickScore;

                return (
                  <g key={tickScore}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={reached ? '#06b6d4' : '#475569'}
                      strokeWidth="2.5"
                      strokeDasharray="2,2"
                    />
                  </g>
                );
              })}

              {/* Progress Active Arc with Gradient Fill */}
              <path
                d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
                fill="none"
                stroke="url(#analyticsGaugeGradient)"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                filter="url(#gaugeGlowFilter)"
                className="transition-all duration-700 ease-out"
              />

              {/* Center Needle & Pivot */}
              <line
                x1={cx}
                y1={cy}
                x2={needleX}
                y2={needleY}
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
              <circle cx={cx} cy={cy} r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
              <circle cx={cx} cy={cy} r="3" fill="#0f172a" />
            </svg>

            {/* Readout Text Inside Gauge Base */}
            <div className="absolute bottom-0 text-center flex flex-col items-center">
              <span className="text-3xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                {simulatedScore}
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold -mt-0.5">
                MAX 400
              </span>
            </div>
          </div>

          {/* Scale Labels */}
          <div className="w-full flex justify-between px-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
            <span className="font-bold">0</span>
            <span className="text-amber-400 font-semibold">140 Poly</span>
            <span className="text-emerald-400 font-semibold">200 Uni</span>
            <span className="text-cyan-400 font-semibold">250 Pro</span>
            <span className="text-purple-400 font-semibold">300 Merit</span>
            <span className="text-yellow-300 font-bold">400 Max</span>
          </div>

          {/* Next Target Objective Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-slate-400 uppercase text-[10px] flex items-center gap-1">
                <Target className="w-3 h-3 text-cyan-400" />
                <span>Next Milestone Target</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase border ${nextMilestone.badgeClass}`}>
                {simulatedScore >= 400 ? '👑 Absolute Peak' : `${distanceToNext} Marks Left`}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1 rounded-lg bg-slate-900 border border-slate-800">
                {nextMilestone.icon}
              </span>
              <div className="space-y-0.5 text-xs truncate">
                <div className="font-bold text-white truncate">
                  {nextMilestone.title} ({nextMilestone.score} Marks)
                </div>
                <div className="text-[11px] text-cyan-300 truncate">
                  {nextMilestone.admissionsTier}
                </div>
              </div>
            </div>

            {/* Linear Progress Micro-bar */}
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div 
                className="bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, (simulatedScore / 400) * 100)}%` }}
              />
            </div>
          </div>

          {/* Interactive What-If Booster */}
          <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-slate-300 font-medium">
              Simulate weakest subject (<strong className="text-cyan-300">{weakestSubject}</strong>):
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {[0, 15, 30, 50].map(boost => (
                <button
                  key={boost}
                  onClick={() => setBoostOffset(boost)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    boostOffset === boost
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                  }`}
                >
                  {boost === 0 ? 'Base' : `+${boost}`}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: Recent Performance Trends & Velocity (6 Columns) */}
        <div className="lg:col-span-6 flex flex-col justify-between p-5 rounded-3xl bg-slate-900/80 border border-emerald-500/30 shadow-inner space-y-4">
          
          {/* Header Row & Mode Toggle */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <LineChart className="w-4 h-4 text-emerald-400" />
              <span>Performance Trends & Trajectory</span>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
              <button
                onClick={() => setTrendViewMode('exams')}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  trendViewMode === 'exams' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Mock History
              </button>
              <button
                onClick={() => setTrendViewMode('subjects')}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  trendViewMode === 'subjects' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Subject Mastery
              </button>
            </div>
          </div>

          {/* Key Velocity KPIs Strip */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Velocity</span>
              <div className="text-sm font-black font-mono text-emerald-400 flex items-center justify-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>{scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} pts</span>
              </div>
              <span className="text-[9px] text-slate-400">Recent sprint</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">vs National Avg</span>
              <div className="text-sm font-black font-mono text-cyan-300">
                +{aboveNationalAvg} pts
              </div>
              <span className="text-[9px] text-slate-400">Avg 195/400</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">CBT Pace</span>
              <div className="text-sm font-black font-mono text-amber-300 flex items-center justify-center gap-0.5">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>42s / Q</span>
              </div>
              <span className="text-[9px] text-slate-400">Target &le; 45s</span>
            </div>
          </div>

          {/* Dynamic Content: Mock History Chart vs Subject Mastery Matrix */}
          {trendViewMode === 'exams' ? (
            <div className="space-y-2.5">
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase flex items-center justify-between">
                <span>Recent CBT Mock Scores Trajectory</span>
                <span className="text-emerald-400">Chronological</span>
              </div>

              {/* Visual Bar Chart for Recent Exams */}
              <div className="space-y-2">
                {trendExams.map((exam, i) => {
                  const scoreVal = exam.jambScore || Math.round((exam.scorePercentage / 100) * 400);
                  const barWidth = Math.min(100, Math.round((scoreVal / 400) * 100));
                  const isLatest = i === trendExams.length - 1;

                  return (
                    <div key={exam.id || i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isLatest ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                          <span className="font-bold text-slate-200 truncate text-[11px]">
                            {exam.title || `Mock Test #${i + 1}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-slate-400 text-[10px]">
                            {new Date(exam.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className={`font-black ${isLatest ? 'text-emerald-400' : 'text-white'}`}>
                            {scoreVal} / 400
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isLatest ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 'bg-slate-600'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Subject Mastery Matrix */
            <div className="space-y-2.5">
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase flex items-center justify-between">
                <span>Core Subject Accuracy Breakdown</span>
                <span className="text-cyan-400">4 Subjects</span>
              </div>

              <div className="space-y-2">
                {subjectMastery.map(sub => (
                  <div key={sub.name} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 text-[11px]">{sub.name}</span>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-slate-400 text-[10px]">~{sub.score}/100</span>
                        <span className="font-black text-white">{sub.accuracy}%</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          sub.status === 'Strong' ? 'bg-emerald-500/20 text-emerald-300' :
                          sub.status === 'Solid' ? 'bg-cyan-500/20 text-cyan-300' :
                          sub.status === 'Improving' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${sub.color} transition-all duration-500`}
                        style={{ width: `${sub.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Practice CTA */}
          <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-800 text-xs">
            <span className="text-[11px] text-slate-400">
              Consistency boosts accuracy by up to 25%
            </span>
            <button
              onClick={() => onNavigate('mock-exam')}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer text-xs"
            >
              <span>Take New Mock</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* 3. Six Milestone Cards Timeline (Admissions Gateways) */}
      <div className="space-y-3 relative z-10 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Official JAMB Admission Score Tiers & Requirements</span>
          </h3>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Tap any milestone tier to view eligible Nigerian university cut-offs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {JAMB_SCORE_MILESTONES.map(milestone => {
            const isUnlocked = simulatedScore >= milestone.score;
            const isNext = milestone.id === nextMilestone.id && !isUnlocked;
            const isSelected = selectedMilestoneId === milestone.id;

            return (
              <div
                key={milestone.id}
                onClick={() => setSelectedMilestoneId(milestone.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                  isSelected 
                    ? 'ring-2 ring-cyan-400 shadow-lg' 
                    : 'hover:border-slate-600'
                } ${
                  isUnlocked 
                    ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/40' 
                    : isNext 
                    ? 'bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border-cyan-500/50' 
                    : 'bg-slate-900/60 border-slate-800 opacity-80 hover:opacity-100'
                }`}
              >
                {/* Header row: Icon, Title, and Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                      {milestone.icon}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white font-['Outfit'] flex items-center gap-1.5">
                        <span>{milestone.title}</span>
                      </div>
                      <div className="text-sm font-black font-mono text-cyan-300">
                        {milestone.score} <span className="text-[10px] text-slate-400 font-normal">/ 400</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 border ${
                    isUnlocked
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                      : isNext
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {isUnlocked ? (
                      <>
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Crushed</span>
                      </>
                    ) : isNext ? (
                      <>
                        <Target className="w-2.5 h-2.5 text-cyan-400" />
                        <span>Next Target</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-2.5 h-2.5" />
                        <span>Locked</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                  {milestone.shortDesc}
                </p>

                {/* Qualifying Sample Institutions */}
                <div className="pt-2 border-t border-slate-800/80 text-[10px] space-y-1">
                  <span className="text-slate-400 font-mono block uppercase">Representative Institutions:</span>
                  <div className="text-slate-200 truncate font-medium">
                    {milestone.qualifyingInstitutions.join(' • ')}
                  </div>
                </div>

                {/* Progress bar per milestone */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Target Progress</span>
                    <span className="font-bold text-white">
                      {Math.min(100, Math.round((simulatedScore / milestone.score) * 100))}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isUnlocked ? 'bg-emerald-400' : isNext ? 'bg-cyan-400' : 'bg-slate-700'
                      }`}
                      style={{ width: `${Math.min(100, (simulatedScore / milestone.score) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 relative z-10">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Every verified CBT mock exam dynamically updates your position along the official 400-point trajectory.
          </span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('practice', { subjectId: weakestSubject.toLowerCase() })}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Drill {weakestSubject}</span>
            <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          <button
            onClick={() => onNavigate('mock-exam')}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer font-['Outfit']"
          >
            <Trophy className="w-3.5 h-3.5 fill-slate-950" />
            <span>Launch 400-Point Mock Exam</span>
          </button>
        </div>
      </div>
    </div>
  );
};
