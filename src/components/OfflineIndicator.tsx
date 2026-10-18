import React from 'react';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { WifiOff, CheckCircle } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-banner"
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 text-white px-3.5 py-2 text-xs font-medium shadow-xl border border-slate-700/80 animate-in fade-in"
    >
      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
      <WifiOff className="w-4 h-4 text-amber-400" />
      <div>
        <span className="font-bold block text-[11px]">Offline CBT Mode Active</span>
        <span className="text-[10px] text-slate-300">All downloaded questions & mock exams are ready to practice without data.</span>
      </div>
    </div>
  );
};
