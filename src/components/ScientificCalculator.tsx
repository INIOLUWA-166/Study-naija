import React, { useState, useEffect, useRef } from 'react';
import {
  Calculator,
  X,
  Clock,
  RotateCcw,
  Check,
  Minimize2,
  Maximize2,
  Copy,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  History,
  Atom,
  Flame,
  Zap,
  ArrowRight
} from 'lucide-react';
import {
  evaluateMathExpression,
  PHYSICS_CONSTANTS,
  PhysicsConstant
} from '../utils/calculatorEngine';

export interface ScientificCalculatorProps {
  isOpen?: boolean;
  onClose: () => void;
  mode?: 'floating' | 'docked';
  onToggleMode?: (newMode: 'floating' | 'docked') => void;
  onPauseTimer?: () => void;
  onResumeTimer?: () => void;
  isCalculationRelated?: boolean;
  subjectName?: string;
  className?: string;
}

export const ScientificCalculator: React.FC<ScientificCalculatorProps> = ({
  isOpen = true,
  onClose,
  mode = 'floating',
  onToggleMode,
  onPauseTimer,
  onResumeTimer,
  isCalculationRelated = true,
  subjectName = 'Mathematics & Physics',
  className = ''
}) => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');
  const [memory, setMemory] = useState<number | null>(null);
  const [history, setHistory] = useState<Array<{ expr: string; result: string }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showConstants, setShowConstants] = useState(false);
  const [isSecondMode, setIsSecondMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 1-minute countdown pause

  // Dragging state for floating mode
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0
  });

  // Handle pause and resume timer
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(60);
      if (onPauseTimer) onPauseTimer();
    } else {
      if (onResumeTimer) onResumeTimer();
    }
  }, [isOpen]);

  // 1-minute countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose(); // Auto-resume exam timer when 1 minute expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Keypad Handlers
  const handleDigit = (d: string) => {
    setDisplay(prev => {
      if (prev === '0' || prev === 'Error') return d;
      return prev + d;
    });
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(prev => (prev === 'Error' ? '0.' : prev + '.'));
    }
  };

  const handleOperator = (op: string) => {
    setExpression(prev => {
      const current = display === 'Error' ? '0' : display;
      return prev ? `${prev} ${current} ${op}` : `${current} ${op}`;
    });
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleClearEntry = () => {
    setDisplay('0');
  };

  const handleBackspace = () => {
    setDisplay(prev => (prev.length > 1 && prev !== 'Error' ? prev.slice(0, -1) : '0'));
  };

  const handleToggleSign = () => {
    if (display === '0' || display === 'Error') return;
    setDisplay(prev => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
  };

  const handleScientificUnary = (func: string) => {
    try {
      const val = parseFloat(display);
      if (isNaN(val)) return;

      let res = 0;
      switch (func) {
        case 'sin':
          res = angleMode === 'DEG' ? Math.sin((val * Math.PI) / 180) : Math.sin(val);
          break;
        case 'cos':
          res = angleMode === 'DEG' ? Math.cos((val * Math.PI) / 180) : Math.cos(val);
          break;
        case 'tan':
          if (angleMode === 'DEG' && (val - 90) % 180 === 0) throw new Error('Undefined');
          res = angleMode === 'DEG' ? Math.tan((val * Math.PI) / 180) : Math.tan(val);
          break;
        case 'asin':
          if (val < -1 || val > 1) throw new Error('Domain error');
          res = angleMode === 'DEG' ? (Math.asin(val) * 180) / Math.PI : Math.asin(val);
          break;
        case 'acos':
          if (val < -1 || val > 1) throw new Error('Domain error');
          res = angleMode === 'DEG' ? (Math.acos(val) * 180) / Math.PI : Math.acos(val);
          break;
        case 'atan':
          res = angleMode === 'DEG' ? (Math.atan(val) * 180) / Math.PI : Math.atan(val);
          break;
        case 'sqrt':
          if (val < 0) throw new Error('Domain error');
          res = Math.sqrt(val);
          break;
        case 'cbrt':
          res = Math.cbrt(val);
          break;
        case 'sqr':
          res = val * val;
          break;
        case 'cube':
          res = val * val * val;
          break;
        case 'reciprocal':
          if (val === 0) throw new Error('Division by zero');
          res = 1 / val;
          break;
        case 'abs':
          res = Math.abs(val);
          break;
        case 'log':
          if (val <= 0) throw new Error('Domain error');
          res = Math.log10(val);
          break;
        case 'ln':
          if (val <= 0) throw new Error('Domain error');
          res = Math.log(val);
          break;
        case 'exp':
          res = Math.exp(val);
          break;
        case '10x':
          res = Math.pow(10, val);
          break;
        case 'fact':
          if (val < 0 || !Number.isInteger(val)) throw new Error('Integer required');
          let f = 1;
          for (let i = 2; i <= Math.min(val, 170); i++) f *= i;
          res = f;
          break;
        default:
          return;
      }

      const rounded = Math.round(res * 1e10) / 1e10;
      setDisplay(String(rounded));
      setExpression(`${func}(${display})`);
    } catch {
      setDisplay('Error');
    }
  };

  const handleCalculate = () => {
    try {
      const fullExpr = expression ? `${expression} ${display}` : display;
      const res = evaluateMathExpression(fullExpr, angleMode);
      const strRes = String(res);
      setHistory(prev => [{ expr: fullExpr, result: strRes }, ...prev.slice(0, 9)]);
      setDisplay(strRes);
      setExpression('');
    } catch {
      setDisplay('Error');
    }
  };

  const insertConstant = (c: PhysicsConstant) => {
    setDisplay(String(c.value));
    setShowConstants(false);
  };

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(display);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Memory Handlers
  const handleMemoryStore = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) setMemory(val);
  };
  const handleMemoryRecall = () => {
    if (memory !== null) setDisplay(String(memory));
  };
  const handleMemoryClear = () => {
    setMemory(null);
  };
  const handleMemoryAdd = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) setMemory((memory || 0) + val);
  };
  const handleMemorySub = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) setMemory((memory || 0) - val);
  };

  // Dragging support for floating modal
  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'floating') return;
    isDraggingRef.current = true;
    const initialPos = position || { x: 0, y: 0 };
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: initialPos.x,
      initY: initialPos.y
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = moveEvent.clientX - dragStartRef.current.startX;
      const dy = moveEvent.clientY - dragStartRef.current.startY;
      setPosition({
        x: dragStartRef.current.initX + dx,
        y: dragStartRef.current.initY + dy
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Calculator Card Content
  const calculatorCard = (
    <div
      className={`bg-slate-900 border border-emerald-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white font-sans ${
        mode === 'docked' ? 'w-full h-full' : 'w-[440px] max-w-[95vw]'
      } ${className}`}
      style={
        mode === 'floating' && position
          ? { transform: `translate(${position.x}px, ${position.y}px)` }
          : undefined
      }
    >
      {/* Header Bar */}
      <div
        onMouseDown={handleMouseDown}
        className={`bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between select-none ${
          mode === 'floating' ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-950/50">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm text-white tracking-tight">CBT Scientific Calculator</h3>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {angleMode}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Approved for JAMB UTME, WAEC, NECO & Physics Calculations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Dock / Float Mode Toggle Button */}
          {onToggleMode && (
            <button
              onClick={() => onToggleMode(mode === 'floating' ? 'docked' : 'floating')}
              className="p-1.5 text-slate-400 hover:text-cyan-300 bg-slate-800/80 hover:bg-slate-800 rounded-lg text-xs transition cursor-pointer border border-slate-700/60"
              title={mode === 'floating' ? 'Dock Calculator into Exam Hall Grid' : 'Float Calculator Freely'}
            >
              {mode === 'floating' ? (
                <div className="flex items-center gap-1 px-1">
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold hidden sm:inline">Dock</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-1">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold hidden sm:inline">Float</span>
                </div>
              )}
            </button>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-rose-900/60 hover:text-rose-300 rounded-lg transition cursor-pointer border border-slate-700/60"
            title="Done Early / Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1-Minute Exam Pause Indicator Strip */}
      <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-teal-500/15 border-b border-emerald-500/30 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-amber-300">
          <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span className="text-[11px] font-medium">
            Exam Clock Paused: <strong className="font-mono text-amber-200">{formatTimer(timeLeft)}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
            60s Drill
          </span>
        </div>
      </div>

      {/* Calculator Body */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        {/* Main Display Screen */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-right relative shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-slate-400 h-5 mb-1 font-mono overflow-x-auto">
            <span className="text-emerald-500/80 uppercase font-semibold text-[10px]">
              {subjectName.slice(0, 18)}
            </span>
            <span className="text-slate-400 truncate max-w-[260px]">{expression || '\u00A0'}</span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
              {memory !== null && (
                <span className="px-1.5 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 rounded font-bold">
                  M={memory}
                </span>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 tracking-wider overflow-x-auto">
              {display}
            </div>
          </div>

          {/* Quick copy result button */}
          <button
            onClick={copyToClipboard}
            className="absolute top-2 left-2 text-slate-500 hover:text-slate-300 transition"
            title="Copy Result"
          >
            {copied ? (
              <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-bold">
                <CheckCircle2 className="w-3 h-3" /> Copied
              </span>
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Quick Toolbar: DEG/RAD, 2nd, Constants, Memory, History */}
        <div className="flex items-center justify-between gap-1 text-[11px]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setAngleMode(prev => (prev === 'DEG' ? 'RAD' : 'DEG'))}
              className={`px-2 py-1 rounded-lg font-mono font-bold transition border cursor-pointer ${
                angleMode === 'DEG'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Toggle Trigonometry Angle Mode (Degrees vs Radians)"
            >
              {angleMode}
            </button>
            <button
              onClick={() => setIsSecondMode(prev => !prev)}
              className={`px-2 py-1 rounded-lg font-bold transition border cursor-pointer ${
                isSecondMode
                  ? 'bg-amber-950 text-amber-300 border-amber-700'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Shift / 2nd Function (Inverse Trig, Powers)"
            >
              2nd
            </button>
            <button
              onClick={() => setShowConstants(prev => !prev)}
              className={`px-2 py-1 rounded-lg font-bold transition border cursor-pointer flex items-center gap-1 ${
                showConstants
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Physics & Science Constants (g, c, h, e, Avogadro)"
            >
              <Atom className="w-3 h-3 text-cyan-400" />
              <span>Const</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowHistory(prev => !prev)}
              className={`p-1.5 rounded-lg transition border cursor-pointer ${
                showHistory
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Calculation History Tape"
            >
              <History className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Physics Constants Quick Drawer */}
        {showConstants && (
          <div className="bg-slate-950 border border-cyan-800/60 rounded-2xl p-3 animate-fade-in space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
              <span className="flex items-center gap-1.5">
                <Atom className="w-3.5 h-3.5 text-cyan-400" />
                <span>Physics & Chemistry Constants (Click to insert)</span>
              </span>
              <button
                onClick={() => setShowConstants(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {PHYSICS_CONSTANTS.map(c => (
                <button
                  key={c.symbol}
                  onClick={() => insertConstant(c)}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-700 text-left transition flex items-center justify-between text-[11px]"
                  title={`${c.name}: ${c.description}`}
                >
                  <span className="font-bold text-cyan-300 font-mono">{c.symbol}</span>
                  <span className="font-mono text-slate-400 text-[10px]">
                    {c.value < 1e-4 || c.value > 1e4 ? c.value.toExponential(2) : c.value} {c.unit}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* History Tape Drawer */}
        {showHistory && (
          <div className="bg-slate-950 border border-indigo-800/60 rounded-2xl p-3 animate-fade-in space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
              <span className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                <span>Recent Calculation Steps</span>
              </span>
              <button
                onClick={() => setHistory([])}
                className="text-[10px] text-slate-400 hover:text-rose-400 underline"
              >
                Clear History
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-[11px] text-slate-500 py-2 text-center">No calculations yet</p>
            ) : (
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                {history.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => setDisplay(h.result)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 flex items-center justify-between cursor-pointer transition"
                    title="Click to load result"
                  >
                    <span className="text-slate-400 truncate max-w-[180px]">{h.expr}</span>
                    <span className="font-bold text-emerald-400">= {h.result}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Memory Strip */}
        <div className="grid grid-cols-5 gap-1.5">
          <button
            onClick={handleMemoryClear}
            className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold rounded-lg transition"
            title="Memory Clear"
          >
            MC
          </button>
          <button
            onClick={handleMemoryRecall}
            className="py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold rounded-lg transition"
            title="Memory Recall"
          >
            MR
          </button>
          <button
            onClick={handleMemoryAdd}
            className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg transition"
            title="Memory Add"
          >
            M+
          </button>
          <button
            onClick={handleMemorySub}
            className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg transition"
            title="Memory Subtract"
          >
            M-
          </button>
          <button
            onClick={handleMemoryStore}
            className="py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg transition"
            title="Memory Store"
          >
            MS
          </button>
        </div>

        {/* Scientific Functions Keypad */}
        <div className="grid grid-cols-5 gap-1.5 text-xs">
          {/* Row 1: Trig */}
          <button
            onClick={() => handleScientificUnary(isSecondMode ? 'asin' : 'sin')}
            className="py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold rounded-xl transition"
          >
            {isSecondMode ? 'sin⁻¹' : 'sin'}
          </button>
          <button
            onClick={() => handleScientificUnary(isSecondMode ? 'acos' : 'cos')}
            className="py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold rounded-xl transition"
          >
            {isSecondMode ? 'cos⁻¹' : 'cos'}
          </button>
          <button
            onClick={() => handleScientificUnary(isSecondMode ? 'atan' : 'tan')}
            className="py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold rounded-xl transition"
          >
            {isSecondMode ? 'tan⁻¹' : 'tan'}
          </button>
          <button
            onClick={() => handleScientificUnary(isSecondMode ? 'cbrt' : 'sqrt')}
            className="py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-xl transition"
          >
            {isSecondMode ? '∛x' : '√x'}
          </button>
          <button
            onClick={() => handleScientificUnary(isSecondMode ? 'cube' : 'sqr')}
            className="py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-xl transition"
          >
            {isSecondMode ? 'x³' : 'x²'}
          </button>

          {/* Row 2: Powers & Logs */}
          <button
            onClick={() => handleOperator('^')}
            className="py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-xl transition"
          >
            xʸ
          </button>
          <button
            onClick={() => handleScientificUnary('log')}
            className="py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold rounded-xl transition"
          >
            log
          </button>
          <button
            onClick={() => handleScientificUnary(isSecondMode ? 'exp' : 'ln')}
            className="py-2 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold rounded-xl transition"
          >
            {isSecondMode ? 'eˣ' : 'ln'}
          </button>
          <button
            onClick={() => setDisplay(String(Math.PI))}
            className="py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold rounded-xl transition"
          >
            π
          </button>
          <button
            onClick={() => setDisplay(String(Math.E))}
            className="py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold rounded-xl transition"
          >
            e
          </button>

          {/* Row 3: Brackets & Advanced */}
          <button
            onClick={() => handleScientificUnary('reciprocal')}
            className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
          >
            1/x
          </button>
          <button
            onClick={() => handleScientificUnary('abs')}
            className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
          >
            |x|
          </button>
          <button
            onClick={() => handleScientificUnary('fact')}
            className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
          >
            n!
          </button>
          <button
            onClick={() => handleDigit('(')}
            className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
          >
            (
          </button>
          <button
            onClick={() => handleDigit(')')}
            className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
          >
            )
          </button>
        </div>

        {/* Standard Numeric Keypad */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="py-3 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded-2xl text-sm transition"
          >
            C
          </button>
          <button
            onClick={handleClearEntry}
            className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-sm transition"
          >
            CE
          </button>
          <button
            onClick={handleBackspace}
            className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-sm transition"
          >
            ⌫
          </button>
          <button
            onClick={() => handleOperator('/')}
            className="py-3 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 font-bold rounded-2xl text-sm transition"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleDigit('7')}
            className="py-3 bg-slate-800/90 hover:bg-slate-700 text-white font-extrabold rounded-2xl text-base transition shadow-xs"
          >
            7
          </button>
          <button
            onClick={() => handleDigit('8')}
            className="py-3 bg-slate-800/90 hover:bg-slate-700 text-white font-extrabold rounded-2xl text-base transition shadow-xs"
          >
            8
          </button>
          <button
            onClick={() => handleDigit('9')}
            className="py-3 bg-slate-800/90 hover:bg-slate-700 text-white font-extrabold rounded-2xl text-base transition shadow-xs"
          >
            9
          </button>
          <button
            onClick={() => handleOperator('*')}
            className="py-3 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 font-bold rounded-2xl text-sm transition"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleDigit('4')}
            className="py-3 bg-slate-800/90 hover:bg-slate-700 text-white font-extrabold rounded-2xl text-base transition shadow-xs"
          >
            4
          </button>
          <button
            onClick={() => handleDigit('5')}
            className="py-3 bg-slate-800/90 hover:bg-slate-700 text-white font-extrabold rounded-2xl text-base transition shadow-xs"
          >
            5
          </button>
          <button
            onClick={() => handleDigit('6')}
            className="py-3 bg-slate-800/90 hover:bg-slate-700 text-white font-extrabold rounded-2xl text-base transition shadow-xs"
          >
            6
          </button>
          <button
            onClick={() => handleOperator('-')}
            className="py-3 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 font-bold rounded-2xl text-sm transition"
          >
            −
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleDigit('1')}
            className="py-3 bg-slate-800/90 hover:bg-slate-700 text-white font-extrabold rounded-2xl text-base transition shadow-xs"
          >
            1
          </button>
          <button
            onClick={() => handleDigit('2')}
            className="py-3 bg-slate-800/90 hover:bg-slate-700 text-white font-extrabold rounded-2xl text-base transition shadow-xs"
          >
            2
          </button>
          <button
            onClick={() => handleDigit('3')}
            className="py-3 bg-slate-800/90 hover:bg-slate-700 text-white font-extrabold rounded-2xl text-base transition shadow-xs"
          >
            3
          </button>
          <button
            onClick={() => handleOperator('+')}
            className="py-3 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 font-bold rounded-2xl text-sm transition"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={handleToggleSign}
            className="py-3 bg-slate-800/90 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-sm transition shadow-xs"
          >
            ±
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="py-3 bg-slate-800/90 hover:bg-slate-700 text-white font-extrabold rounded-2xl text-base transition shadow-xs"
          >
            0
          </button>
          <button
            onClick={handleDecimal}
            className="py-3 bg-slate-800/90 hover:bg-slate-700 text-white font-bold rounded-2xl text-base transition shadow-xs"
          >
            .
          </button>
          <button
            onClick={handleCalculate}
            className="py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl text-lg transition shadow-lg shadow-emerald-950/60 cursor-pointer"
          >
            =
          </button>
        </div>

        {/* Action Button: "Done Early / Resume Exam" (Requested by user) */}
        <div className="pt-1">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs sm:text-sm font-black transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40"
          >
            <Check className="w-4 h-4 text-emerald-200" />
            <span>Done Early / Resume Exam Timer</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Render according to mode
  if (mode === 'docked') {
    return calculatorCard;
  }

  // Floating Modal Render (with backdrop and centering)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in overflow-y-auto">
      {calculatorCard}
    </div>
  );
};
