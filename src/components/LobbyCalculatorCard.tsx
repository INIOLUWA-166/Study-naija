import React, { useState } from 'react';
import {
  Calculator,
  Maximize2,
  Clock,
  Atom,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  RotateCcw
} from 'lucide-react';
import { evaluateMathExpression, PHYSICS_CONSTANTS } from '../utils/calculatorEngine';

interface LobbyCalculatorCardProps {
  onOpenFullCalculator: () => void;
}

export const LobbyCalculatorCard: React.FC<LobbyCalculatorCardProps> = ({
  onOpenFullCalculator
}) => {
  const [quickInput, setQuickInput] = useState('sin(30) * 10');
  const [quickResult, setQuickResult] = useState('5');
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleCompute = (exprToEval?: string) => {
    const expr = exprToEval !== undefined ? exprToEval : quickInput;
    try {
      const res = evaluateMathExpression(expr, angleMode);
      setQuickResult(String(res));
      setStatusMsg(null);
    } catch {
      setQuickResult('Error');
      setStatusMsg('Invalid math expression syntax');
    }
  };

  const handleSample = (sample: string) => {
    setQuickInput(sample);
    handleCompute(sample);
  };

  return (
    <section id="lobby-scientific-calculator" className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/80 rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/50 text-white shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Information & Key Capabilities */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/40 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>OFFICIAL CBT SCIENTIFIC CALCULATOR</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
              Approved for JAMB, WAEC & NECO
            </span>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white tracking-tight">
              Interactive STEM Scientific Calculator 🧮
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Standard non-programmable CBT calculator built directly into StudyNaija. Use it to solve complex Mathematics, Physics, Chemistry, and Economics problems.
            </p>
          </div>

          {/* Key Features Bullet List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Trig & Inverses:</strong> sin, cos, tan, sin⁻¹, cos⁻¹ (DEG/RAD)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Powers & Logs:</strong> xʸ, √x, ∛x, log₁₀, ln, eˣ, n!</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>10 Physics Constants:</strong> g (9.8 & 10), c (3e8), h, e⁻, N_A</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>1-Minute Exam Pause:</strong> Pauses timer for calculation</span>
            </div>
          </div>

          {/* Quick Launch Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenFullCalculator}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/25 hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <Maximize2 className="w-4 h-4 text-slate-950" />
              <span>Open Full Scientific Calculator</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Auto 60s Timer Pause Active in Mock Exams</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Mini Test Pad in Lobby */}
        <div className="lg:col-span-5 bg-slate-950/90 rounded-2xl p-5 border border-slate-800 shadow-2xl space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-300 font-mono">Quick Lobby Scratchpad</span>
            </div>
            <button
              onClick={() => setAngleMode(prev => (prev === 'DEG' ? 'RAD' : 'DEG'))}
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/40 cursor-pointer"
              title="Toggle angle mode"
            >
              {angleMode} MODE
            </button>
          </div>

          {/* Quick Scratchpad Display */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-right">
            <div className="text-[11px] text-slate-400 font-mono h-5 truncate">{quickInput}</div>
            <div className="text-2xl font-black font-mono text-emerald-400 tracking-wider">
              = {quickResult}
            </div>
          </div>

          {/* Input & Calculate Bar */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleCompute();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={quickInput}
              onChange={e => setQuickInput(e.target.value)}
              placeholder="e.g. sin(45) * 9.8 / 2"
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
            >
              Solve
            </button>
          </form>

          {/* Quick Sample Calculations for Students */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Quick STEM Samples (Click to test):
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleSample('sin(30) * 10')}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 font-mono transition cursor-pointer"
              >
                sin(30) × 10
              </button>
              <button
                type="button"
                onClick={() => handleSample('sqrt(196) + 4^2')}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 font-mono transition cursor-pointer"
              >
                √196 + 4²
              </button>
              <button
                type="button"
                onClick={() => handleSample('9.8 * 5^2 / 2')}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-teal-300 font-mono transition cursor-pointer"
              >
                ½ × g × t² (Physics)
              </button>
              <button
                type="button"
                onClick={() => handleSample('log(1000) * 5')}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-300 font-mono transition cursor-pointer"
              >
                log(1000) × 5
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
