import React, { useState, useEffect } from 'react';
import { Bell, X, ArrowRight, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { StudentNotification } from '../utils/studentNotificationManager';

interface NotificationToastProps {
  onOpenNotifications: () => void;
  onNavigate: (view: string, extra?: any) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  onOpenNotifications,
  onNavigate
}) => {
  const [activeToast, setActiveToast] = useState<StudentNotification | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      const notif = e.detail as StudentNotification;
      if (notif) {
        setActiveToast(notif);
        // Auto dismiss after 9 seconds
        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 9000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('studynaija_new_notification_toast', handler);
    return () => window.removeEventListener('studynaija_new_notification_toast', handler);
  }, []);

  if (!activeToast) return null;

  const isWelcome = activeToast.category === 'welcome';
  const isInactivity = activeToast.category === 'inactivity_24h';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-2xl text-white animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
          isWelcome
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : isInactivity
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
        }`}>
          {isWelcome && <Sparkles className="w-4 h-4" />}
          {isInactivity && <Clock className="w-4 h-4" />}
          {!isWelcome && !isInactivity && <Bell className="w-4 h-4" />}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-1">
            <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-1">{activeToast.title}</h4>
            <button
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
            {activeToast.message}
          </p>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => {
                setActiveToast(null);
                onOpenNotifications();
              }}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
            >
              View in Inbox
            </button>

            {activeToast.actionView && (
              <button
                onClick={() => {
                  setActiveToast(null);
                  onNavigate(activeToast.actionView!, activeToast.actionExtra);
                }}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ml-auto"
              >
                <span>{activeToast.actionLabel || 'Open'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
