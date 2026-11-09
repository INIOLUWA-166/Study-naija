import React from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  UserPlus, 
  BookOpen, 
  Trophy, 
  Timer, 
  X,
  Bot
} from 'lucide-react';

interface WelcomeNewScholarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

export const WelcomeNewScholarModal: React.FC<WelcomeNewScholarModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-slate-900 dark:text-white"
        role="dialog"
        aria-modal="true"
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Header Icon & Tag */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20 mx-auto">
              <GraduationCap className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
              <span>🇳🇬 Official 2026/2027 CBT Portal</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Outfit'] text-slate-900 dark:text-white">
              Welcome to StudyNaija!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              Are you a new student or returning scholar? Please sign in or create your student profile to start your preparation.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-200 font-medium">10,000+ Past UTME & WAEC Questions</span>
            </div>
            <div className="flex items-start gap-2">
              <Timer className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-200 font-medium">Timed CBT Mock Simulator & Countdown</span>
            </div>
            <div className="flex items-start gap-2">
              <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-200 font-medium">24/7 Step-by-Step Naija AI Tutor</span>
            </div>
            <div className="flex items-start gap-2">
              <Trophy className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-slate-700 dark:text-slate-200 font-medium">Monthly Cash & Airtime Grants</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={onRegister}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Free Student Account (New User)</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              type="button"
              onClick={onLogin}
              className="w-full py-3 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Already Registered? Sign In to Existing Account</span>
            </button>
          </div>

          {/* Mandatory registration security note */}
          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Mandatory student registration protects your CBT mock history and exam scores.</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
