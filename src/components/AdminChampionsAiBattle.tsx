import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Crown, 
  Bot, 
  Swords, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  ShieldCheck, 
  Flame, 
  Timer, 
  Coins,
  ChevronRight,
  Zap,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { triggerChampionsLeagueVictoryConfetti } from '../utils/confettiCelebration';
import { User, Question, TournamentState } from '../types';
import { tournamentManager, getTournamentQuestions, getGrandeFinaleQuestions } from '../utils/tournamentManager';
import { api } from '../services/api';

interface AdminChampionsAiBattleProps {
  user: User | null;
  onTournamentUpdated?: (state: TournamentState) => void;
  onUserUpgraded?: (user: User) => void;
  onNavigate?: (view: string) => void;
}

interface TournamentRoundStage {
  id: string;
  name: string;
  stageType: 'group' | 'r16' | 'quarters' | 'semis' | 'final';
  subjectId: string;
  subjectName: string;
  aiOpponentName: string;
  aiOpponentState: string;
  questionCount: number;
  timeSeconds: number;
}

const TOURNAMENT_STAGES: TournamentRoundStage[] = [
  {
    id: 'grp-match-1',
    name: 'Group Stage Match 1',
    stageType: 'group',
    subjectId: 'english',
    subjectName: 'Use of English',
    aiOpponentName: 'Chidi AI Bot',
    aiOpponentState: 'Anambra',
    questionCount: 10,
    timeSeconds: 120
  },
  {
    id: 'grp-match-2',
    name: 'Group Stage Match 2',
    stageType: 'group',
    subjectId: 'mathematics',
    subjectName: 'General Mathematics',
    aiOpponentName: 'Amina AI Bot',
    aiOpponentState: 'Kano',
    questionCount: 10,
    timeSeconds: 300 // 5 minutes for Mathematics rule
  },
  {
    id: 'grp-match-3',
    name: 'Group Stage Match 3',
    stageType: 'group',
    subjectId: 'physics',
    subjectName: 'Physics',
    aiOpponentName: 'Damilola AI Bot',
    aiOpponentState: 'Oyo',
    questionCount: 10,
    timeSeconds: 120
  },
  {
    id: 'r16-tie',
    name: 'Round of 16 Knockout',
    stageType: 'r16',
    subjectId: 'biology',
    subjectName: 'Biology',
    aiOpponentName: 'Kelechi AI Bot',
    aiOpponentState: 'Enugu',
    questionCount: 10,
    timeSeconds: 120
  },
  {
    id: 'qf-tie',
    name: 'Quarter-Finals Knockout',
    stageType: 'quarters',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    aiOpponentName: 'Fatima AI Bot',
    aiOpponentState: 'Kaduna',
    questionCount: 10,
    timeSeconds: 120
  },
  {
    id: 'sf-tie',
    name: 'Semi-Finals Knockout',
    stageType: 'semis',
    subjectId: 'economics',
    subjectName: 'Economics',
    aiOpponentName: 'Babatunde AI Bot',
    aiOpponentState: 'Lagos',
    questionCount: 10,
    timeSeconds: 120
  },
  {
    id: 'grand-finale',
    name: 'Grande Finale (4 Subjects)',
    stageType: 'final',
    subjectId: 'all_four_subjects',
    subjectName: 'All 4 Subjects (ENG, MTH, PHY, CHM)',
    aiOpponentName: 'Ngozi Eze AI Bot',
    aiOpponentState: 'Imo',
    questionCount: 20,
    timeSeconds: 360
  }
];

export const AdminChampionsAiBattle: React.FC<AdminChampionsAiBattleProps> = ({
  user,
  onTournamentUpdated,
  onUserUpgraded,
  onNavigate
}) => {
  // Strictly restricted to Admin role or Admin Email
  const isAdmin = user && (user.role === 'admin' || user.email?.toLowerCase() === 'luvkidjaja@gmail.com');

  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [completedStageIds, setCompletedStageIds] = useState<string[]>([]);
  const [inBattle, setInBattle] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);

  // Scores
  const [adminScore, setAdminScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [aiStatus, setAiStatus] = useState<string>('Analyzing question...');
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [matchResult, setMatchResult] = useState<{
    stage: TournamentRoundStage;
    adminScore: number;
    aiScore: number;
    isFinal: boolean;
  } | null>(null);

  const [grandChampionAnnounced, setGrandChampionAnnounced] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const timerRef = useRef<any>(null);

  const activeStage = TOURNAMENT_STAGES[currentStageIdx] || TOURNAMENT_STAGES[0];

  // Timer countdown
  useEffect(() => {
    if (inBattle && timeRemaining > 0 && !hasAnsweredCurrent) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishMatch();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [inBattle, timeRemaining, hasAnsweredCurrent]);

  // Both students and admin can play! Admin has guaranteed victory; students play competitive mode.

  // Start a stage battle
  const startStageBattle = (stageIdx: number) => {
    const stage = TOURNAMENT_STAGES[stageIdx];
    setCurrentStageIdx(stageIdx);
    setMatchResult(null);

    let stageQs: Question[] = [];
    if (stage.subjectId === 'all_four_subjects') {
      stageQs = getGrandeFinaleQuestions().slice(0, stage.questionCount);
    } else {
      stageQs = getTournamentQuestions(stage.subjectId, stage.questionCount);
    }

    setQuestions(stageQs);
    setCurrentQIdx(0);
    setAdminScore(0);
    setAiScore(0);
    setSelectedOption(null);
    setHasAnsweredCurrent(false);
    setTimeRemaining(stage.timeSeconds);
    setInBattle(true);
    setAiStatus(`${stage.aiOpponentName} ready for kickoff.`);
  };

  // Admin selects option
  const handleSelectOption = (optKey: string) => {
    if (hasAnsweredCurrent) return;
    setSelectedOption(optKey);
    setHasAnsweredCurrent(true);

    const q = questions[currentQIdx];
    const isCorrect = q && optKey === q.correctOption;

    // Points logic:
    // If admin: victory guaranteed; if student: score on correct answers
    const pointIncrement = isAdmin ? 1 : (isCorrect ? 1 : 0);
    const newAdminScore = adminScore + pointIncrement;
    setAdminScore(newAdminScore);

    // AI opponent answers
    const aiAnswersCorrectly = isAdmin 
      ? (Math.random() < 0.4 && newAdminScore > (aiScore + 1))
      : (Math.random() < 0.45);
    const newAiScore = aiAnswersCorrectly ? aiScore + 1 : aiScore;
    setAiScore(newAiScore);

    setAiStatus(
      aiAnswersCorrectly 
        ? `${activeStage.aiOpponentName} selected Option ${q?.correctOption}.` 
        : `${activeStage.aiOpponentName} hesitated and chose incorrect option.`
    );

    // Auto next after 1.2s
    setTimeout(() => {
      if (currentQIdx + 1 < questions.length) {
        setCurrentQIdx(prev => prev + 1);
        setSelectedOption(null);
        setHasAnsweredCurrent(false);
        setAiStatus(`${activeStage.aiOpponentName} reading question #${currentQIdx + 2}...`);
      } else {
        finishMatch(newAdminScore, newAiScore);
      }
    }, 1200);
  };

  // Finish match and celebrate winner
  const finishMatch = (currentAdmin?: number, currentAi?: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setInBattle(false);

    let finalAdminScore = currentAdmin !== undefined ? currentAdmin : adminScore;
    let finalAiScore = currentAi !== undefined ? currentAi : aiScore;

    // Victory enforcement: admin is guaranteed victory; for students, ensure exciting victory if they performed well
    if (isAdmin) {
      if (finalAdminScore <= finalAiScore) {
        finalAdminScore = Math.max(finalAdminScore, 8);
        finalAiScore = Math.max(0, finalAdminScore - 3);
      }
    } else {
      if (finalAdminScore <= finalAiScore && finalAdminScore >= 5) {
        finalAdminScore = finalAiScore + 1; // Encourage student triumph
      }
    }
    setAdminScore(finalAdminScore);
    setAiScore(finalAiScore);

    const isFinalStage = activeStage.id === 'grand-finale';
    setCompletedStageIds(prev => Array.from(new Set([...prev, activeStage.id])));

    triggerChampionsLeagueVictoryConfetti();

    setMatchResult({
      stage: activeStage,
      adminScore: finalAdminScore,
      aiScore: finalAiScore,
      isFinal: isFinalStage
    });

    // If Grande Finale won, crown Admin as official National Champion!
    if (isFinalStage && user) {
      setGrandChampionAnnounced(true);
      const updatedTournament = tournamentManager.recordAdminAiVictory(user);
      if (onTournamentUpdated) onTournamentUpdated(updatedTournament);

      // Upgrade Admin user in memory and server to undisputed G.O.A.T
      const updatedAdminUser: User = {
        ...user,
        premiumPlan: 'premium',
        themeVariant: 'goat',
        isGoat: true,
        goatPrivilegesActive: true,
        tournamentBadge: '1st',
        xp: (user.xp || 5000) + 2500
      };

      if (onUserUpgraded) onUserUpgraded(updatedAdminUser);

      // Server endpoint notification
      fetch('/api/tournament/admin-battle-win', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email })
      }).catch(() => {});
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Godmode Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-yellow-950 to-slate-950 rounded-3xl p-6 sm:p-7 border-2 border-amber-500/60 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-black flex items-center gap-1.5 shadow-sm">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>ADMIN EXCLUSIVE • 100% WIN GUARANTEE</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-mono">
                {user?.email}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white tracking-tight">
              Play Champions League with AI 🏆
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              As platform administrator, you can battle AI contenders through every tournament stage from Group Stage to the Grande Finale. <strong className="text-amber-300">Your victory is 100% guaranteed on every game</strong>. Conquering the final unlocks 1-Month Free Premium, the 24K Gold Site Theme, and the 🥇 1st Place National Champion badge!
            </p>
          </div>

          <div className="w-full md:w-auto shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
            {!inBattle && (
              <button
                onClick={() => startStageBattle(currentStageIdx)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Swords className="w-4 h-4 text-slate-950" />
                <span>PLAY NEXT STAGE NOW</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            )}

            <button
              onClick={() => {
                tournamentManager.resetTournament(user);
                setResetMessage('Tournament reset to unplayed state! Nobody has won yet.');
                setTimeout(() => setResetMessage(null), 3000);
                if (onTournamentUpdated) onTournamentUpdated(tournamentManager.getState(user));
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Entire Tournament</span>
            </button>
            {resetMessage && (
              <span className="text-[11px] text-amber-300 font-mono text-center animate-fade-in">
                {resetMessage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stage Roadmap Progress Bar */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-bold flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Tournament Battle Roadmap ({completedStageIds.length} of {TOURNAMENT_STAGES.length} Completed)</span>
          </span>
          <span className="font-mono text-amber-400 font-bold">
            Target: 1st Place Gold Champion
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {TOURNAMENT_STAGES.map((stg, idx) => {
            const isCompleted = completedStageIds.includes(stg.id);
            const isCurrent = idx === currentStageIdx;
            return (
              <button
                key={stg.id}
                onClick={() => {
                  if (!inBattle) startStageBattle(idx);
                }}
                disabled={inBattle}
                className={`p-2.5 rounded-xl border text-left transition-all relative ${
                  isCompleted 
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' 
                    : isCurrent 
                    ? 'bg-amber-950/80 border-amber-400 text-amber-200 shadow-md shadow-amber-500/10' 
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                } ${inBattle ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase">
                    Stage {idx + 1}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-xs font-bold truncate mt-1 text-white">
                  {stg.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  vs {stg.aiOpponentName.split(' ')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE BATTLE VIEW */}
      {inBattle && (
        <div className="bg-slate-950 rounded-3xl border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Battle Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-mono font-bold">
                  {activeStage.name.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Subject: <strong className="text-white">{activeStage.subjectName}</strong>
                </span>
              </div>
              <h3 className="text-xl font-black text-white font-['Outfit'] mt-1">
                Question {currentQIdx + 1} of {questions.length}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                <Timer className="w-4 h-4 text-amber-400 animate-spin" />
                <span>{Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}</span>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                Admin Victory Enforced 🛡️
              </span>
            </div>
          </div>

          {/* Dual Split Scoreboard: Admin vs AI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Admin Player Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
                  👑
                </div>
                <div>
                  <div className="text-xs font-mono text-amber-300 font-bold">Admin Contender (You)</div>
                  <div className="text-sm font-black text-white">{user?.name}</div>
                  <div className="text-[10px] text-slate-400">100% Win Rate Protocol</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-black font-mono text-amber-300">{adminScore}</div>
                <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Points</div>
              </div>
            </div>

            {/* AI Opponent Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-950 text-purple-300 border border-purple-500/30 flex items-center justify-center font-black text-lg">
                  🤖
                </div>
                <div>
                  <div className="text-xs font-mono text-purple-300 font-bold">AI Opponent ({activeStage.aiOpponentState})</div>
                  <div className="text-sm font-black text-white">{activeStage.aiOpponentName}</div>
                  <div className="text-[10px] text-slate-400 italic truncate max-w-[150px]">{aiStatus}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-black font-mono text-purple-300">{aiScore}</div>
                <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Points</div>
              </div>
            </div>
          </div>

          {/* Current Question */}
          {questions[currentQIdx] && (
            <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-5">
              <div className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                {questions[currentQIdx].question}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(questions[currentQIdx].options).map(([key, text]) => {
                  const isSelected = selectedOption === key;
                  const isCorrect = key === questions[currentQIdx].correctOption;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectOption(key)}
                      disabled={hasAnsweredCurrent}
                      className={`p-4 rounded-xl text-left font-medium text-xs sm:text-sm border transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : hasAnsweredCurrent && isCorrect
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                        {key}
                      </span>
                      <span>{text}</span>
                    </button>
                  );
                })}
              </div>

              {hasAnsweredCurrent && (
                <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Point registered! Admin victory protocol active.</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 animate-pulse">Advancing...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MATCH VICTORY MODAL / CARD */}
      {matchResult && !inBattle && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950/90 via-slate-900 to-slate-950 border-2 border-amber-500 shadow-2xl space-y-6 text-white text-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 mx-auto flex items-center justify-center text-3xl font-black shadow-xl animate-bounce">
            🏆
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-black">
              MATCH VICTORY CONFIRMED
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-['Outfit']">
              {user?.name} Defeats {matchResult.stage.aiOpponentName}!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Final Score: <strong className="text-amber-300">{matchResult.adminScore}</strong> vs{' '}
              <strong className="text-purple-300">{matchResult.aiScore}</strong>. You won this match and advanced in the Champions League!
            </p>
          </div>

          {matchResult.isFinal ? (
            <div className="p-6 rounded-2xl bg-amber-500/20 border-2 border-amber-400 space-y-4 max-w-xl mx-auto">
              <Crown className="w-10 h-10 text-amber-300 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h4 className="text-lg font-black text-amber-200 uppercase font-['Outfit']">
                  👑 You Are The National Champions League Winner!
                </h4>
                <p className="text-xs text-slate-200">
                  Congratulations! You conquered all 8 groups, knockout rounds, and the 4-subject Grande Finale.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/40 text-amber-300 font-bold">
                  ₦5,000 Cash Prize Claim
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/40 text-amber-300 font-bold">
                  1-Mo Free Premium
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/40 text-amber-300 font-bold">
                  24K Gold Site Theme
                </div>
              </div>

              <button
                onClick={() => {
                  if (onNavigate) onNavigate('tournament');
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                Inspect Official Winner Tournament Bracket →
              </button>
            </div>
          ) : (
            <div className="pt-2">
              <button
                onClick={() => {
                  if (currentStageIdx + 1 < TOURNAMENT_STAGES.length) {
                    startStageBattle(currentStageIdx + 1);
                  }
                }}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-sm tracking-wide shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Advance to Stage {currentStageIdx + 2}: {TOURNAMENT_STAGES[currentStageIdx + 1]?.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
