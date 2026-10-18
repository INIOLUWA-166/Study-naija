import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  Timer,
  AlertCircle,
  Trash2,
  CheckCheck,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Send,
  Volume2,
  Mail
} from 'lucide-react';
import {
  studentNotificationManager,
  StudentNotification,
  NotificationCategory
} from '../utils/studentNotificationManager';
import { User } from '../types';

interface StudentNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onNavigate: (view: string, extra?: any) => void;
}

export const StudentNotificationModal: React.FC<StudentNotificationModalProps> = ({
  isOpen,
  onClose,
  user,
  onNavigate
}) => {
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'system' | 'alerts'>('all');
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const [emailStatusNotice, setEmailStatusNotice] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  const loadNotifications = () => {
    const list = studentNotificationManager.getNotifications(user?.id);
    setNotifications(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setBrowserPermission(Notification.permission);
      }
    }
  }, [isOpen, user]);

  useEffect(() => {
    const handler = () => {
      loadNotifications();
    };
    window.addEventListener('studynaija_notification_updated', handler);
    return () => window.removeEventListener('studynaija_notification_updated', handler);
  }, [user]);

  if (!isOpen) return null;

  const handleMarkAsRead = (id: string) => {
    studentNotificationManager.markAsRead(id, user?.id);
    loadNotifications();
  };

  const handleMarkAllRead = () => {
    studentNotificationManager.markAllAsRead(user?.id);
    loadNotifications();
  };

  const handleDelete = (id: string) => {
    studentNotificationManager.deleteNotification(id, user?.id);
    loadNotifications();
  };

  const handleClearAll = () => {
    studentNotificationManager.clearAll(user?.id);
    loadNotifications();
  };

  const handleActionClick = (notif: StudentNotification) => {
    studentNotificationManager.markAsRead(notif.id, user?.id);
    onClose();
    if (notif.actionView) {
      onNavigate(notif.actionView, notif.actionExtra);
    }
  };

  const handleRequestPush = async () => {
    const perm = await studentNotificationManager.requestBrowserNotificationPermission();
    setBrowserPermission(perm);
  };

  const handleResendWelcomeEmail = async () => {
    const targetUser: User = user || {
      id: 'demo-student',
      name: 'Scholar',
      email: 'luvkidjaja@gmail.com',
      role: 'student',
      educationLevel: 'secondary',
      targetExam: 'JAMB',
      premiumPlan: 'free',
      createdAt: new Date().toISOString()
    };
    setSendingEmail(true);
    setEmailStatusNotice(null);
    try {
      const res = await studentNotificationManager.resendWelcomeEmail(targetUser);
      setEmailStatusNotice(`✅ Official Welcome Email sent to ${targetUser.email}! Check your inbox & spam folder.`);
      loadNotifications();
    } catch (err: any) {
      setEmailStatusNotice(`❌ Email dispatch error: ${err.message || 'Please try again'}`);
    } finally {
      setSendingEmail(false);
    }
  };

  // Test Triggers for User Verification & Instant Demonstration
  const handleTestWelcome = async () => {
    const targetUser: User = user || {
      id: 'demo-student',
      name: 'Scholar',
      email: 'luvkidjaja@gmail.com',
      role: 'student',
      educationLevel: 'secondary',
      targetExam: 'JAMB',
      premiumPlan: 'free',
      createdAt: new Date().toISOString()
    };
    studentNotificationManager.triggerSignupWelcome(targetUser, true);
    setEmailStatusNotice(`🎉 Welcome message generated & official welcome email dispatched to ${targetUser.email}!`);
    loadNotifications();
  };

  const handleTestInactivity = () => {
    studentNotificationManager.check24HourInactivity(user, true);
    loadNotifications();
  };

  const handleTestCountdown = () => {
    studentNotificationManager.triggerExamCountdownAlert(user, 42, '2026 JAMB UTME');
    loadNotifications();
  };

  const handleTestStreak = () => {
    studentNotificationManager.triggerStreakAlert(user, 5);
    loadNotifications();
  };

  const handleTestAirtime = () => {
    studentNotificationManager.triggerAirtimeLeaderboardAlert(user);
    loadNotifications();
  };

  const handleTestMockScored = () => {
    studentNotificationManager.triggerMockExamScored(user, 'JAMB CBT', 78, 40, 31);
    loadNotifications();
  };

  const filteredList = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'system') return n.category === 'welcome' || n.category === 'system';
    if (activeTab === 'alerts') return n.category === 'inactivity_24h' || n.category === 'exam_alert' || n.category === 'airtime_prize';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] text-white font-sans">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-950/50">
              <Bell className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">Student Notification Center</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Official Welcome messages, 24-hour inactivity reminders & exam alerts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Welcome Email Status Notice */}
        {emailStatusNotice && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-5 py-2.5 flex items-center justify-between text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{emailStatusNotice}</span>
            </div>
            <button
              onClick={() => setEmailStatusNotice(null)}
              className="text-emerald-400 hover:text-white p-1 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Live Email Dispatch & Push Notification Strip */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 px-5 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Signed in as <strong>{user?.email || 'Scholar'}</strong> • Official welcome email sent upon registration & login
            </span>
          </div>
          <button
            onClick={handleResendWelcomeEmail}
            disabled={sendingEmail}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
            title="Send or resend official welcome email to this address"
          >
            <Send className="w-3 h-3" />
            <span>{sendingEmail ? 'Dispatching...' : 'Resend Welcome Email'}</span>
          </button>
        </div>

        {/* Browser Push Permission Banner */}
        {browserPermission !== 'granted' && (
          <div className="bg-gradient-to-r from-cyan-950/60 to-slate-900 px-5 py-2.5 border-b border-cyan-800/40 flex items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2 text-cyan-200">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Get instant study streak & 24h inactivity reminders on this device</span>
            </div>
            <button
              onClick={handleRequestPush}
              className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg font-bold text-xs transition cursor-pointer shrink-0"
            >
              Enable Browser Alerts
            </button>
          </div>
        )}

        {/* Tab Filters & Bulk Actions */}
        <div className="px-5 sm:px-6 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Tabs */}
          <div className="inline-flex p-1 bg-slate-900 rounded-xl border border-slate-800 gap-1 font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'unread' ? 'bg-amber-500/20 text-amber-300 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'system' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Welcome & System
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'alerts' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              24h & Exam Alerts
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg font-medium text-[11px] transition flex items-center gap-1 cursor-pointer"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark All Read</span>
              </button>
            )}

            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-2.5 py-1 text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-slate-800 rounded-lg font-medium text-[11px] transition flex items-center gap-1 cursor-pointer"
                title="Clear all notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 space-y-3 max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Bell className="w-7 h-7 opacity-40" />
              </div>
              <h4 className="font-bold text-slate-300 text-sm">No Notifications in this tab</h4>
              <p className="text-xs text-slate-500">
                You're all caught up! You'll receive automatic updates here when you sign up, complete study goals, or after 24 hours of inactivity.
              </p>
            </div>
          ) : (
            filteredList.map(notif => {
              const isUrgent = notif.priority === 'urgent';
              const isWelcome = notif.category === 'welcome';
              const isInactivity = notif.category === 'inactivity_24h';

              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start justify-between gap-3 relative ${
                    !notif.read
                      ? isWelcome
                        ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/50 shadow-sm'
                        : isInactivity
                          ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/50 shadow-sm'
                          : 'bg-slate-850/90 border-slate-700 shadow-xs'
                      : 'bg-slate-950/60 border-slate-800/80 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    {/* Category Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isWelcome
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isInactivity
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : notif.category === 'exam_alert'
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : notif.category === 'airtime_prize'
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-slate-800 text-slate-300'
                    }`}>
                      {isWelcome && <Sparkles className="w-4 h-4" />}
                      {isInactivity && <Clock className="w-4 h-4" />}
                      {notif.category === 'exam_alert' && <Timer className="w-4 h-4" />}
                      {notif.category === 'airtime_prize' && <Trophy className="w-4 h-4" />}
                      {notif.category === 'system' && <Bell className="w-4 h-4" />}
                      {notif.category === 'streak' && <Zap className="w-4 h-4" />}
                    </div>

                    {/* Content */}
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{notif.title}</h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        )}
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(notif.timestamp).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Action Button */}
                      {notif.actionLabel && (
                        <div className="pt-2">
                          <button
                            onClick={() => handleActionClick(notif)}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <span>{notif.actionLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Item controls */}
                  <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 bg-slate-800/60 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        title="Mark as read"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-800/60 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Testing & Info Bar */}
        <div className="bg-slate-950 px-5 sm:px-6 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-300">Test Automatic Triggers:</span>
            <button
              onClick={handleResendWelcomeEmail}
              disabled={sendingEmail}
              className="px-2 py-0.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-lg font-bold text-[10px] transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
              title="Send/resend official welcome email to current user"
            >
              <Mail className="w-3 h-3 text-emerald-400" />
              <span>{sendingEmail ? 'Sending...' : '📧 Send Welcome Email'}</span>
            </button>
            <button
              onClick={handleTestWelcome}
              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 rounded-lg font-medium text-[10px] transition cursor-pointer"
              title="Test automatic new signup welcome message"
            >
              🎉 Welcome Msg
            </button>
            <button
              onClick={handleTestInactivity}
              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-lg font-medium text-[10px] transition cursor-pointer"
              title="Test 24-hour inactivity study check-in message"
            >
              ⏰ 24h Inactive
            </button>
            <button
              onClick={handleTestCountdown}
              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-lg font-medium text-[10px] transition cursor-pointer"
              title="Test exam countdown alert"
            >
              ⏳ Exam Alert
            </button>
            <button
              onClick={handleTestStreak}
              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-orange-300 border border-orange-500/30 rounded-lg font-medium text-[10px] transition cursor-pointer"
              title="Test study streak protection"
            >
              🔥 Streak Alert
            </button>
            <button
              onClick={handleTestMockScored}
              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 rounded-lg font-medium text-[10px] transition cursor-pointer"
              title="Test mock exam scored notification"
            >
              📊 Mock Scored
            </button>
            <button
              onClick={handleTestAirtime}
              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-yellow-300 border border-yellow-500/30 rounded-lg font-medium text-[10px] transition cursor-pointer"
              title="Test monthly airtime leaderboard prize"
            >
              🎁 Airtime Race
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
