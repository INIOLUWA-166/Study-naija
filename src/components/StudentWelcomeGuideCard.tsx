import React from 'react';
import {
  BookOpen,
  Timer,
  Calculator,
  Sparkles,
  Trophy,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Zap,
  Target
} from 'lucide-react';
import { User } from '../types';

interface StudentWelcomeGuideCardProps {
  user: User | null;
  onNavigate: (view: string, extra?: any) => void;
  onOpenCalculator: () => void;
  onOpenFlashChallenge?: () => void;
}

export const StudentWelcomeGuideCard: React.FC<StudentWelcomeGuideCardProps> = ({
  user,
  onNavigate,
  onOpenCalculator,
  onOpenFlashChallenge
}) => {
  const studentFirstName = user?.name ? user.name.split(' ')[0] : 'Scholar';

  return (
    <section id="student-quick-guide" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
              STUDENT GUIDE • STEP-BY-STEP
            </span>
            <span className="text-xs text-slate-500 font-medium">Clear instructions for all candidates</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight">
            How to Ace Your Exams on StudyNaija in 3 Simple Steps 🎯
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Welcome, <strong>{studentFirstName}</strong>! Here is how to navigate and make the most out of your study sessions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('mock-exam')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Timer className="w-4 h-4 text-emerald-400" />
            <span>Take 8-Key Mock</span>
          </button>
          <button
            onClick={onOpenCalculator}
            className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Open Calculator</span>
          </button>
        </div>
      </div>

      {/* 3 Clear Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Step 1 */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3 relative overflow-hidden group hover:border-emerald-400 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-base shadow-sm">
            1
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Pick Your Goal & Exam
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Targeting JAMB UTME, WAEC SSCE, or both?
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Switch between exams at the top of the page. Select your 4 core examination subjects to load verified past questions dating from 1995 to 2026.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('subjects')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Browse 24 Subjects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3 relative overflow-hidden group hover:border-emerald-400 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-base shadow-sm">
            2
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Choose Ranked or Unranked
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Decide whether you want points or safe practice
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>Ranked Modes</strong> (Full CBT Mock, Champions League, 1v1 Arena) earn Leaderboard Points & airtime prizes. <strong>Unranked Modes</strong> (Untimed Practice, AI Voice Tutor) let you learn at your own pace with zero penalties.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('practice')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Start Free Practice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3 relative overflow-hidden group hover:border-emerald-400 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black text-base shadow-sm">
            3
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Calculate & Master Solutions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Use approved STEM tools & AI explanations
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Need to solve a tricky Physics or Math problem? Open the <strong>CBT Scientific Calculator</strong> (which pauses your exam timer for 1 minute), review step-by-step worked proofs, or ask Naija AI for instant breakdown.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenCalculator}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Test Scientific Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Helpful Key Takeaways Strip */}
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span><strong>Zero Distraction Policy:</strong> 100% focused on passing WAEC and JAMB. Step-by-step Nigerian syllabus guidance.</span>
        </div>
        <div className="flex items-center gap-4 text-emerald-800 font-medium">
          <span>✔️ Free Account Active</span>
          <span>✔️ 10,000+ Past Questions</span>
          <span>✔️ Offline Data-Saver Mode</span>
        </div>
      </div>
    </section>
  );
};
