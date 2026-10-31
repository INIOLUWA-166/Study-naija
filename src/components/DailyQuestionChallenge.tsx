import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Share2, 
  Zap, 
  Trophy, 
  HelpCircle, 
  ArrowRight,
  Flame,
  Award,
  BookOpen
} from 'lucide-react';
import { User, Question } from '../types';
import confetti from 'canvas-confetti';
import { tournamentAudio } from '../utils/tournamentAudio';

interface DailyQuestionChallengeProps {
  user: User | null;
  onNavigate?: (view: string, extra?: any) => void;
  onUpdateUser?: (updated: User) => void;
}

// Curated rotating daily challenge questions across Nigerian departments
const DAILY_CHALLENGE_BANK: Question[] = [
  {
    id: 'daily-eng-1',
    subjectId: 'english',
    subjectName: 'English Language',
    topic: 'Lexis & Structure',
    examType: 'JAMB',
    year: 2024,
    question: 'The committee members agreed with the proposal, but the chairman took exception _______ the final budgetary allocation.',
    options: {
      A: 'to',
      B: 'with',
      C: 'at',
      D: 'against'
    },
    correctOption: 'A',
    explanation: 'The standard idiomatic prepositional phrase is "to take exception TO something", meaning to object to or disagree strongly with it.',
    difficulty: 'Medium'
  },
  {
    id: 'daily-mth-2',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    topic: 'Indices & Logarithms',
    examType: 'JAMB',
    year: 2024,
    question: 'If log₁₀ 2 = 0.3010 and log₁₀ 3 = 0.4771, calculate the value of log₁₀ 18 without using a mathematical table.',
    options: {
      A: '1.2552',
      B: '1.5031',
      C: '1.1481',
      D: '0.9542'
    },
    correctOption: 'A',
    explanation: '18 = 2 * 3² = 2 * 9. log₁₀ 18 = log₁₀ 2 + 2(log₁₀ 3) = 0.3010 + 2(0.4771) = 0.3010 + 0.9542 = 1.2552.',
    difficulty: 'Medium'
  },
  {
    id: 'daily-bio-3',
    subjectId: 'biology',
    subjectName: 'Biology',
    topic: 'Genetics & Heredity',
    examType: 'WAEC',
    year: 2023,
    question: 'A man with blood group A (heterozygous IAi) marries a woman with blood group B (heterozygous IBi). What is the probability that their first child will possess universal recipient blood group AB?',
    options: {
      A: '25% (1 in 4 chance)',
      B: '50% (1 in 2 chance)',
      C: '75% (3 in 4 chance)',
      D: '0% (Impossible)'
    },
    correctOption: 'A',
    explanation: 'Punnett square of IAi x IBi yields: IAIB (AB - 25%), IAi (A - 25%), IBi (B - 25%), and ii (O - 25%). Hence, the probability of blood group AB is exactly 25%.',
    difficulty: 'Medium'
  },
  {
    id: 'daily-chm-4',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    topic: 'Acids, Bases & Salts',
    examType: 'JAMB',
    year: 2024,
    question: 'Which of the following aqueous salt solutions turns blue litmus paper red due to cationic hydrolysis in water?',
    options: {
      A: 'Ammonium chloride (NH₄Cl)',
      B: 'Sodium chloride (NaCl)',
      C: 'Sodium carbonate (Na₂CO₃)',
      D: 'Potassium nitrate (KNO₃)'
    },
    correctOption: 'A',
    explanation: 'NH₄Cl is a salt of a weak base (NH₄OH) and a strong acid (HCl). In aqueous solution, the ammonium cation hydrolyzes to produce excess hydronium (H₃O⁺) ions, resulting in an acidic pH (< 7) that turns blue litmus red.',
    difficulty: 'Hard'
  },
  {
    id: 'daily-lit-5',
    subjectId: 'literature',
    subjectName: 'Literature in English',
    topic: 'African Drama',
    examType: 'JAMB',
    year: 2024,
    question: 'In Wole Soyinka’s "The Lion and the Jewel", how does the cunning Bale Baroka successfully trick Sidi into falling for his advances?',
    options: {
      A: 'By feigning impotence and having Sadiku broadcast his alleged loss of virility across Ilujinle',
      B: 'By bribing the village surveyor to divert the railway line away from her compound',
      C: 'By promising to publish her photographs on royal postage stamps in London',
      D: 'By having Lakunle arrested for public defamation of the ancestral customs'
    },
    correctOption: 'A',
    explanation: 'Baroka concocts the false rumor of his own impotence, knowing Sadiku would boast about it. Sidi, feeling secure and wanting to gloat over the vanquished lion, visits the palace unguarded, where Baroka traps and seduces her.',
    difficulty: 'Medium'
  },
  {
    id: 'daily-com-6',
    subjectId: 'commerce',
    subjectName: 'Commerce',
    topic: 'Foreign Trade',
    examType: 'WAEC',
    year: 2023,
    question: 'The commercial term "FOB" (Free On Board) stamped on international shipping documentation signifies that:',
    options: {
      A: 'The seller pays all loading and transport costs up until the goods are placed on board the vessel, after which risk passes to the buyer',
      B: 'The freight costs and marine insurance are paid entirely by the shipping carrier',
      C: 'The buyer is completely exempt from paying import tariffs at Nigerian ports',
      D: 'The goods can only be transported aboard Nigerian-flagged maritime vessels'
    },
    correctOption: 'A',
    explanation: 'In FOB contracts, the exporter fulfills their obligation when the cargo passes over the ship’s rail at the designated port of shipment. Marine insurance and sea freight thereafter become the responsibility of the buyer.',
    difficulty: 'Medium'
  }
];

export const DailyQuestionChallenge: React.FC<DailyQuestionChallengeProps> = ({
  user,
  onNavigate,
  onUpdateUser
}) => {
  const todayKey = new Date().toISOString().slice(0, 10);
  
  // Pick question based on calendar day
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const currentQuestion = DAILY_CHALLENGE_BANK[dayOfYear % DAILY_CHALLENGE_BANK.length];

  const storageKey = `studynaija_daily_q_${todayKey}`;
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.selectedOption || null;
      }
    } catch {}
    return null;
  });

  const [hasSubmitted, setHasSubmitted] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem(storageKey);
    } catch {
      return false;
    }
  });

  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [timerActive, setTimerActive] = useState<boolean>(!hasSubmitted);

  useEffect(() => {
    if (!timerActive || hasSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, hasSubmitted]);

  const handleSubmit = (option: 'A' | 'B' | 'C' | 'D') => {
    if (hasSubmitted) return;
    setSelectedOption(option);
    setHasSubmitted(true);
    setTimerActive(false);

    const isCorrect = option === currentQuestion.correctOption;

    try {
      localStorage.setItem(storageKey, JSON.stringify({
        selectedOption: option,
        isCorrect,
        submittedAt: new Date().toISOString()
      }));
    } catch {}

    if (isCorrect) {
      tournamentAudio.playWhistle();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (user && onUpdateUser) {
        const updated: User = {
          ...user,
          xp: (user.xp || 0) + 50
        };
        onUpdateUser(updated);
      }
    }
  };

  const isCorrect = selectedOption === currentQuestion.correctOption;

  const handleShareToWhatsApp = () => {
    const text = isCorrect
      ? `🎯 I just crushed today's Official JAMB Question of the Day on StudyNaija in ${60 - timeLeft} seconds! (+50 XP earned). Can you solve it faster? Practice past questions at ${window.location.origin}`
      : `🔥 Just attempted today's Official JAMB Question of the Day on StudyNaija! Test your speed and ace your exams at ${window.location.origin}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border-2 border-indigo-500/40 p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  DAILY 6:00 AM CHALLENGE
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  +50 XP REWARD
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white font-['Outfit'] tracking-tight">
                Official Question of the Day
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {!hasSubmitted && (
              <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-mono font-bold ${
                timeLeft <= 15
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                  : 'bg-slate-800/80 text-cyan-300 border-cyan-500/30'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{timeLeft}s Remaining</span>
              </div>
            )}
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              {currentQuestion.subjectName} • {currentQuestion.topic}
            </span>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
              {currentQuestion.examType} {currentQuestion.year}
            </span>
            <span>•</span>
            <span className="text-amber-400 font-bold">{currentQuestion.subjectName}</span>
          </div>

          <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
            {currentQuestion.question}
          </p>
        </div>

        {/* 4 Interactive Option Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(['A', 'B', 'C', 'D'] as const).map(key => {
            const isUserPick = selectedOption === key;
            const isCorrectOption = key === currentQuestion.correctOption;

            let buttonStyles = 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-200';

            if (hasSubmitted) {
              if (isCorrectOption) {
                buttonStyles = 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-md ring-2 ring-emerald-500/30';
              } else if (isUserPick) {
                buttonStyles = 'bg-rose-950/80 border-rose-400 text-rose-200';
              } else {
                buttonStyles = 'bg-slate-950/50 border-slate-900 text-slate-500 opacity-60';
              }
            } else if (isUserPick) {
              buttonStyles = 'bg-indigo-950/90 border-indigo-400 text-white shadow-md';
            }

            return (
              <button
                key={key}
                disabled={hasSubmitted}
                onClick={() => handleSubmit(key)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 relative ${buttonStyles}`}
              >
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono shrink-0 ${
                  hasSubmitted && isCorrectOption
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : hasSubmitted && isUserPick
                    ? 'bg-rose-500 text-white font-black'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {key}
                </span>
                <span className="text-xs sm:text-sm font-medium leading-snug flex-1">
                  {currentQuestion.options[key]}
                </span>
                {hasSubmitted && isCorrectOption && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 self-center" />
                )}
                {hasSubmitted && isUserPick && !isCorrectOption && (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 self-center" />
                )}
              </button>
            );
          })}
        </div>

        {/* Post-Submission Feedback & Explanation Box */}
        {hasSubmitted && (
          <div className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm space-y-3 animate-in fade-in duration-200 ${
            isCorrect 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100' 
              : 'bg-amber-950/40 border-amber-500/40 text-amber-100'
          }`}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 font-black font-['Outfit'] text-sm sm:text-base">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-300">Spot on! +50 XP Awarded</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-300">Nice attempt! Correct answer is Option {currentQuestion.correctOption}</span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleShareToWhatsApp}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Challenge Classmates on WhatsApp</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 space-y-1">
              <span className="font-bold text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
                Official Marking Scheme & Explanation:
              </span>
              <p className="text-xs leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
