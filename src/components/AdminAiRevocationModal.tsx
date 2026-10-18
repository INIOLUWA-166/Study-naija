import React from 'react';
import { Bot, ShieldAlert, Trophy, Zap, AlertTriangle, ArrowRight, X } from 'lucide-react';

interface AdminAiRevocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTournament: () => void;
  noticeData?: {
    revokedChampionName?: string;
    newSeasonTitle?: string;
    timestamp?: string;
    reason?: string;
  } | null;
}

export const AdminAiRevocationModal: React.FC<AdminAiRevocationModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTournament,
  noticeData
}) => {
  if (!isOpen) return null;

  const championName = noticeData?.revokedChampionName || 'Champion';
  const newSeasonTitle = noticeData?.newSeasonTitle || 'New Champions League Season';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border-2 border-red-500/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white shadow-[0_0_50px_rgba(239,68,68,0.3)] relative overflow-hidden space-y-6">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-red-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white shadow-lg shrink-0 border border-red-400/50">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-red-950 border border-red-500/40 text-red-300">
                  ADMIN AI SENTINEL PROTOCOL
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  #CL-DEFENSE
                </span>
              </div>
              <h3 className="text-lg font-black text-white font-['Outfit'] mt-1">
                Champions League Season Reset ⚠️
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Message */}
        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 space-y-2">
            <div className="flex items-center gap-2 text-red-300 font-bold">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>G.O.A.T Privileges Relinquished by Admin AI</span>
            </div>
            <p className="text-xs text-slate-300">
              Attention <strong className="text-amber-300">{championName}</strong>: The Admin AI Assistant has officially inaugurated the <strong className="text-white">{newSeasonTitle}</strong>!
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">
              Action Taken by Admin AI:
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>G.O.A.T Aura & Theme Relinquished:</strong> Your website theme has reverted to standard candidate mode.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span>
                <span><strong>Championship Belt Returned:</strong> 1st place medal returned to the prize pool for the new tournament.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Hall of Fame Legacy Preserved:</strong> Your name and previous victory have been etched into the archived Champions Ledger forever.</span>
              </li>
            </ul>
          </div>

          <p className="text-xs text-amber-200/90 italic p-3 rounded-xl bg-amber-500/10 border border-amber-400/20">
            "A true G.O.A.T does not rest on past laurels. The arena doors have opened once again. Battle through the new 32-scholar bracket to reclaim your throne!"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all cursor-pointer text-center"
          >
            Acknowledge Directive
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigateToTournament();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-slate-950 font-black text-xs tracking-wider transition-all shadow-lg hover:scale-102 cursor-pointer flex items-center justify-center gap-1.5 font-['Outfit']"
          >
            <Trophy className="w-4 h-4 text-slate-950" />
            <span>ENTER NEW TOURNAMENT NOW →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
