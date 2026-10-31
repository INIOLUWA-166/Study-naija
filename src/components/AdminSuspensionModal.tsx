import React, { useState, useEffect } from 'react';
import { Bot, ShieldAlert, Lock, Clock, AlertTriangle, RefreshCw, CheckCircle2, Zap } from 'lucide-react';

interface AdminSuspensionModalProps {
  isOpen: boolean;
  onUnlock: () => void;
}

export const AdminSuspensionModal: React.FC<AdminSuspensionModalProps> = ({
  isOpen,
  onUnlock
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutes = 120 seconds
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(120);
      setIsUnlocked(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsUnlocked(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleForceOverride = () => {
    const code = prompt('Enter Admin AI Security Override Passcode (Hint: 2027):');
    if (code === '2027' || code === 'SABI') {
      setIsUnlocked(true);
      setTimeout(() => {
        onUnlock();
      }, 500);
    } else {
      alert('Incorrect AI security passcode. Please wait for the 2-minute AI audit to complete.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border-2 border-red-500/70 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white shadow-[0_0_80px_rgba(239,68,68,0.4)] relative overflow-hidden space-y-6">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-4 border-b border-red-500/30 pb-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-xl shadow-red-950/60 border border-red-400/50 shrink-0">
            <Bot className="w-7 h-7 animate-bounce" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-red-950 border border-red-500/50 text-red-300 text-[10px] font-mono font-bold tracking-widest uppercase flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-red-400" />
                SABI-GUARD AI SENTINEL
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                #ADMIN-LOCKDOWN
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white font-['Outfit'] tracking-tight">
              Admin Portal Suspended by AI ⚠️
            </h2>
          </div>
        </div>

        {/* Body Content */}
        <div className="space-y-5 relative z-10 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/40 space-y-2 shadow-inner">
            <div className="flex items-center gap-2 text-red-300 font-bold text-xs">
              <Lock className="w-4 h-4 text-red-400 shrink-0" />
              <span>Mandatory 2-Minute Security Audit & Calibration</span>
            </div>
            <p className="text-xs text-slate-300">
              The autonomous <strong className="text-white">SabiGuard AI Sentinel</strong> has temporarily suspended administrative override privileges to verify integrity logs, audit grade distributions, and calibrate anti-malpractice protocols.
            </p>
          </div>

          {/* Countdown Display Card */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-center space-y-3 shadow-xl">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              Admin Site Resumption In:
            </span>

            <div className="text-4xl sm:text-5xl font-mono font-black text-amber-400 tracking-wider drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
              {formattedTime}
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
              <div 
                className="bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 h-full transition-all duration-1000"
                style={{ width: `${((120 - timeLeft) / 120) * 100}%` }}
              />
            </div>
          </div>

          {isUnlocked ? (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-white">AI Audit Successfully Completed!</h4>
                  <p className="text-[11px] text-emerald-200/90">Administrative privileges and controls have been restored.</p>
                </div>
              </div>
              <button
                onClick={onUnlock}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-md cursor-pointer shrink-0 font-['Outfit']"
              >
                Enter Admin Portal →
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>🔒 Admin access restricted until timer completes.</span>
              <button
                onClick={handleForceOverride}
                className="text-cyan-400 hover:text-cyan-300 underline font-semibold cursor-pointer"
              >
                Admin Passcode Override
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 relative z-10">
          <button
            disabled={!isUnlocked}
            onClick={onUnlock}
            className={`w-full py-3 rounded-xl font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg font-['Outfit'] cursor-pointer ${
              isUnlocked 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 scale-102' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <span>{isUnlocked ? 'ACCESS ADMIN PORTAL' : 'AI SUSPENSION IN PROGRESS (2 MINS)'}</span>
            <Zap className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
