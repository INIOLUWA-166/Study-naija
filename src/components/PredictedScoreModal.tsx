import React, { useState } from 'react';
import { 
  Trophy, 
  Sparkles, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  GraduationCap, 
  Gauge, 
  BarChart3, 
  Zap, 
  Target,
  Compass
} from 'lucide-react';
import { User, ExamResult, PredictedScoreData } from '../types';
import { calculatePredictedScore } from '../utils/scorePredictor';

interface PredictedScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  recentResults?: ExamResult[];
  onNavigate: (view: string, extra?: any) => void;
}

export const PredictedScoreModal: React.FC<PredictedScoreModalProps> = ({
  isOpen,
  onClose,
  user,
  recentResults = [],
  onNavigate
}) => {
  const [examMode, setExamMode] = useState<'JAMB' | 'WAEC'>('JAMB');
  const scoreData: PredictedScoreData = calculatePredictedScore(recentResults, user);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-950 text-white border border-cyan-500/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden my-8">
        {/* Futuristic Cyber Accents */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Gauge className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                    DIAGNOSTIC ENGINE // NEURAL READINESS
                  </span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight text-white mt-1">
                  Predicted Exam Aggregate
                </h2>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setExamMode('JAMB')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  examMode === 'JAMB'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                JAMB UTME (400)
              </button>
              <button
                onClick={() => setExamMode('WAEC')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  examMode === 'WAEC'
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                WAEC SSCE (Grades)
              </button>
            </div>
          </div>

          {/* Holographic Aggregate Score Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-center sm:text-left">
              <div className="relative w-24 h-24 rounded-2xl bg-slate-950 border-2 border-cyan-400/50 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                <span className="text-3xl sm:text-4xl font-black font-mono text-cyan-300">
                  {examMode === 'JAMB' ? scoreData.projectedJambTotal : `${scoreData.projectedWaecDistinctions}A`}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {examMode === 'JAMB' ? '/ 400 MAX' : 'Distinctions'}
                </span>
                <div className="absolute -inset-1 rounded-2xl border border-cyan-400/20 animate-pulse pointer-events-none" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30 mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{scoreData.readinessLevel}</span>
                </div>
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  {examMode === 'JAMB'
                    ? `Projected UTME: ${scoreData.projectedJambTotal} Points`
                    : `Projected WAEC: ${scoreData.projectedWaecDistinctions} Distinctions (A1-B3)`}
                </h3>
                <p className="text-xs text-slate-300 max-w-md">
                  Calculated based on your accuracy, syllabus mastery, question response speeds, and practice completion rate.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-mono text-slate-400">Confidence Metric</div>
              <div className="text-2xl font-black font-mono text-emerald-400">{scoreData.confidencePercent}%</div>
              <div className="text-[10px] text-slate-500">Based on Nigerian CBT norms</div>
            </div>
          </div>

          {/* Subject Breakdown Matrix */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Subject Performance Projections</span>
              <span className="text-[10px] text-cyan-400">4-Subject JAMB Combination</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scoreData.subjectBreakdown.map(sub => (
                <div 
                  key={sub.subjectId}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{sub.subjectName}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        sub.status === 'Strong'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                          : sub.status === 'Average'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-500/30'
                            : 'bg-rose-950 text-rose-300 border-rose-500/30'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Accuracy: {sub.accuracy}% • {sub.attempts} Practice Qs Logged
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black font-mono text-cyan-300">
                      {examMode === 'JAMB' ? `${sub.scoreOutOf100}/100` : sub.letterGrade}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {examMode === 'JAMB' ? sub.letterGrade : `${sub.accuracy}% Acc`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* University Cut-off Target Feasibility */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Target University & Course Cut-Off Feasibility</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {scoreData.recommendedUniversityCutoffs.slice(0, 4).map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    item.achievable
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold">{item.institution}</div>
                    <div className="text-[11px] opacity-80">{item.course} (Cut-off: {item.targetScore})</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.achievable
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.achievable ? 'Feasible' : `${item.targetScore - scoreData.projectedJambTotal} pts to go`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              Want to boost your projected score? Take targeted drills now.
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  onClose();
                  onNavigate('practice');
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Start Practice Drill</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
