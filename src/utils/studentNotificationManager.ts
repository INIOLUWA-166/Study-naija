/**
 * Student Notification & Automated Messaging System
 * Handles:
 * 1. Automatic Welcome messages for newly registered students.
 * 2. 24-Hour Inactivity reminders for students who haven't logged in for 24+ hours.
 * 3. Daily Study Streak alerts and warnings.
 * 4. Exam Countdown (JAMB UTME / WAEC SSCE) updates.
 * 5. Monthly Champions League & Airtime Prize announcements.
 * 6. Browser Web Notification API support.
 */

import { User } from '../types';
import { api } from '../services/api';

export type NotificationCategory =
  | 'welcome'
  | 'inactivity_24h'
  | 'streak'
  | 'exam_alert'
  | 'tournament'
  | 'airtime_prize'
  | 'system';

export interface StudentNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  category: NotificationCategory;
  timestamp: string;
  read: boolean;
  priority: 'normal' | 'high' | 'urgent';
  actionLabel?: string;
  actionView?: string;
  actionExtra?: any;
  iconType?: string;
}

const STORAGE_PREFIX = 'studynaija_notifications_';
const LAST_ACTIVE_PREFIX = 'studynaija_last_active_';
const INACTIVITY_SENT_PREFIX = 'studynaija_inactivity_sent_';
const WELCOME_SENT_PREFIX = 'studynaija_welcome_sent_';

function getStorageKey(userId?: string): string {
  return `${STORAGE_PREFIX}${userId || 'guest'}`;
}

export const studentNotificationManager = {
  /**
   * Get all notifications for current user
   */
  getNotifications(userId?: string): StudentNotification[] {
    try {
      const key = getStorageKey(userId);
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to parse notifications', e);
    }

    // Default seeded notifications if none exist
    const defaultList: StudentNotification[] = [
      {
        id: 'notif-system-welcome',
        userId,
        title: '🇳🇬 Welcome to StudyNaija Portal!',
        message: 'Your official CBT revision center is active. Access 10,000+ verified JAMB & WAEC past questions, step-by-step examiner explanations, and the approved CBT Scientific Calculator.',
        category: 'welcome',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'high',
        actionLabel: 'Start Practice Drill',
        actionView: 'practice',
        iconType: 'sparkles'
      },
      {
        id: 'notif-exam-countdown',
        userId,
        title: '⏳ 2026 JAMB UTME Countdown Alert',
        message: 'Official 2026 JAMB UTME kicks off in 42 days! Practice with the 8-key official keyboard simulator and time yourself strictly.',
        category: 'exam_alert',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        priority: 'normal',
        actionLabel: 'Take CBT Mock',
        actionView: 'mock-exam',
        iconType: 'timer'
      },
      {
        id: 'notif-airtime-prize',
        userId,
        title: '🎁 Monthly Airtime Rewards Active',
        message: 'Top 5 scholars on the public leaderboard receive free MTN, Airtel, Glo, or 9mobile recharge airtime on the 1st day of every month! Solve questions daily to earn points.',
        category: 'airtime_prize',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: false,
        priority: 'normal',
        actionLabel: 'View Leaderboard',
        actionView: 'leaderboard',
        iconType: 'trophy'
      }
    ];

    this.saveNotifications(defaultList, userId);
    return defaultList;
  },

  /**
   * Save notifications list to localStorage
   */
  saveNotifications(notifications: StudentNotification[], userId?: string) {
    try {
      const key = getStorageKey(userId);
      localStorage.setItem(key, JSON.stringify(notifications));
      // Dispatch custom window event for instant UI reactivity
      window.dispatchEvent(new CustomEvent('studynaija_notification_updated', {
        detail: { count: notifications.filter(n => !n.read).length }
      }));
    } catch (e) {
      console.warn('Failed to save notifications', e);
    }
  },

  /**
   * Add a new notification
   */
  addNotification(
    notification: Omit<StudentNotification, 'id' | 'timestamp' | 'read'>,
    userId?: string,
    showWebNotification = true
  ): StudentNotification {
    const list = this.getNotifications(userId);
    const newNotif: StudentNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    const updated = [newNotif, ...list.slice(0, 49)]; // Keep latest 50
    this.saveNotifications(updated, userId);

    // Browser Web Notification (if permission granted and requested)
    if (showWebNotification && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(newNotif.title, {
            body: newNotif.message,
            icon: '/favicon.ico'
          });
        } catch (err) {
          // Ignore notification permission error
        }
      }
    }

    // Dispatch toast event
    window.dispatchEvent(new CustomEvent('studynaija_new_notification_toast', {
      detail: newNotif
    }));

    return newNotif;
  },

  /**
   * Mark a notification as read
   */
  markAsRead(notificationId: string, userId?: string) {
    const list = this.getNotifications(userId);
    const updated = list.map(n => n.id === notificationId ? { ...n, read: true } : n);
    this.saveNotifications(updated, userId);
  },

  /**
   * Mark all as read
   */
  markAllAsRead(userId?: string) {
    const list = this.getNotifications(userId);
    const updated = list.map(n => ({ ...n, read: true }));
    this.saveNotifications(updated, userId);
  },

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: string, userId?: string) {
    const list = this.getNotifications(userId);
    const updated = list.filter(n => n.id !== notificationId);
    this.saveNotifications(updated, userId);
  },

  /**
   * Clear all notifications
   */
  clearAll(userId?: string) {
    this.saveNotifications([], userId);
  },

  /**
   * Unread notification count
   */
  getUnreadCount(userId?: string): number {
    return this.getNotifications(userId).filter(n => !n.read).length;
  },

  /**
   * AUTOMATIC TRIGGER: Send welcome message & dispatch official welcome email to newly registered or logged in email
   */
  triggerSignupWelcome(user: User, force = false) {
    if (!user || (!user.id && !user.email)) return;
    const userIdentifier = user.email ? user.email.toLowerCase() : user.id;
    const key = `${WELCOME_SENT_PREFIX}${userIdentifier}`;
    if (!force && localStorage.getItem(key)) return; // Already sent unless forced

    const firstName = user.name ? user.name.split(' ')[0] : 'Scholar';
    const targetExamLabel = user.targetExam === 'WAEC' ? 'WAEC SSCE' : user.targetExam === 'BOTH' ? 'JAMB UTME & WAEC' : 'JAMB UTME';

    this.addNotification({
      userId: user.id,
      title: `🎉 Welcome to StudyNaija, ${firstName}!`,
      message: `Your account is ready for ${targetExamLabel} preparation! You have free access to over 10,000 verified past questions, AI step-by-step solutions, and the approved CBT Scientific Calculator. We also dispatched your official welcome guide to ${user.email || 'your email'}!`,
      category: 'welcome',
      priority: 'urgent',
      actionLabel: 'Start First Practice Drill',
      actionView: 'practice',
      iconType: 'sparkles'
    }, user.id, true);

    localStorage.setItem(key, 'true');

    // Automatically dispatch live welcome email via backend
    if (user.email) {
      api.sendWelcomeEmail(user.email, user.name, user.targetExam).catch(err => {
        console.warn('Welcome email dispatch non-blocking error:', err);
      });
    }
  },

  /**
   * Direct trigger to send/resend welcome email to any student's email address
   */
  async resendWelcomeEmail(user: User): Promise<{ success: boolean; message: string }> {
    if (!user || !user.email) {
      return { success: false, message: 'Please provide a valid student email address' };
    }
    try {
      const res = await api.sendWelcomeEmail(user.email, user.name, user.targetExam);
      const firstName = user.name ? user.name.split(' ')[0] : 'Scholar';

      this.addNotification({
        userId: user.id,
        title: `📧 Welcome Email Dispatched to ${user.email}`,
        message: `Hello ${firstName}, your official StudyNaija Welcome Email and CBT exam study guide have been sent to ${user.email}. Check your inbox or spam folder!`,
        category: 'system',
        priority: 'high',
        actionLabel: 'Open Practice Drills',
        actionView: 'practice',
        iconType: 'sparkles'
      }, user.id, true);

      return { success: true, message: `Welcome email successfully delivered to ${user.email}!` };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to send welcome email' };
    }
  },

  /**
   * AUTOMATIC TRIGGER: Check for 24-hour inactivity and send reminder
   */
  check24HourInactivity(user: User | null, force = false): boolean {
    const userId = user?.id || 'guest';
    const activeKey = `${LAST_ACTIVE_PREFIX}${userId}`;
    const inactivitySentKey = `${INACTIVITY_SENT_PREFIX}${userId}`;

    const now = Date.now();
    const lastActiveRaw = localStorage.getItem(activeKey);
    const lastInactivitySentRaw = localStorage.getItem(inactivitySentKey);

    let sent = false;

    if (force) {
      const firstName = user?.name ? user.name.split(' ')[0] : 'Scholar';
      this.addNotification({
        userId: user?.id,
        title: `⏰ We missed you, ${firstName}! (24-Hour Study Check-in)`,
        message: `It has been over 24 hours since your last study session on StudyNaija. Consistent daily revision is the proven secret to scoring 280+ in JAMB and achieving straight A's in WAEC. Jump in for a quick 5-minute drill or 60-second flash quiz today to keep your study streak active!`,
        category: 'inactivity_24h',
        priority: 'urgent',
        actionLabel: 'Jump In & Protect Streak',
        actionView: 'practice',
        iconType: 'clock'
      }, user?.id, true);
      localStorage.setItem(inactivitySentKey, String(now));
      localStorage.setItem(activeKey, String(now));
      return true;
    }

    if (lastActiveRaw) {
      const lastActive = parseInt(lastActiveRaw, 10);
      const hoursInactive = (now - lastActive) / (1000 * 60 * 60);

      // If user hasn't been active in 24+ hours
      if (hoursInactive >= 24) {
        // Avoid sending more than one inactivity message per 24 hour block
        const lastSent = lastInactivitySentRaw ? parseInt(lastInactivitySentRaw, 10) : 0;
        const hoursSinceLastAlert = (now - lastSent) / (1000 * 60 * 60);

        if (hoursSinceLastAlert >= 24) {
          const firstName = user?.name ? user.name.split(' ')[0] : 'Scholar';

          this.addNotification({
            userId: user?.id,
            title: `⏰ We missed you, ${firstName}! (24-Hour Study Check-in)`,
            message: `It has been over 24 hours since your last study session on StudyNaija. Consistent daily revision is the proven secret to scoring 280+ in JAMB and achieving straight A's in WAEC. Jump in for a quick 5-minute drill or 60-second flash quiz today to keep your study streak active!`,
            category: 'inactivity_24h',
            priority: 'urgent',
            actionLabel: 'Jump In & Protect Streak',
            actionView: 'practice',
            iconType: 'clock'
          }, user?.id, true);

          localStorage.setItem(inactivitySentKey, String(now));
          sent = true;
        }
      }
    }

    // Update last active timestamp to current time for ongoing session
    localStorage.setItem(activeKey, String(now));
    return sent;
  },

  /**
   * SIMULATION TRIGGER: Simulate 24-hour absence for immediate testing
   */
  simulate24HourInactivity(user: User | null): boolean {
    const userId = user?.id || 'guest';
    const activeKey = `${LAST_ACTIVE_PREFIX}${userId}`;
    const inactivitySentKey = `${INACTIVITY_SENT_PREFIX}${userId}`;
    
    // Set last active to 25 hours ago and clear the sent barrier
    const twentyFiveHoursAgo = Date.now() - (25 * 60 * 60 * 1000);
    localStorage.setItem(activeKey, String(twentyFiveHoursAgo));
    localStorage.removeItem(inactivitySentKey);
    
    return this.check24HourInactivity(user);
  },

  /**
   * AUTOMATIC TRIGGER: Daily streak protection reminder
   */
  triggerStreakAlert(user: User | null, streakDays = 1) {
    const firstName = user?.name ? user.name.split(' ')[0] : 'Scholar';
    this.addNotification({
      userId: user?.id,
      title: `🔥 Protect Your ${streakDays}-Day Study Streak!`,
      message: `Hey ${firstName}, your daily learning streak is active! Solve at least 5 questions today to keep your streak multiplier alive and earn bonus XP on the leaderboard.`,
      category: 'streak',
      priority: 'high',
      actionLabel: 'Solve 5 Questions Now',
      actionView: 'practice',
      iconType: 'flame'
    }, user?.id, true);
  },

  /**
   * AUTOMATIC TRIGGER: Official Exam Countdown Alert
   */
  triggerExamCountdownAlert(user: User | null, daysRemaining = 42, examName = '2026 JAMB UTME') {
    this.addNotification({
      userId: user?.id,
      title: `⏳ ${examName} Countdown: ${daysRemaining} Days Left!`,
      message: `The official examination date is approaching rapidly. Practice with the official 8-key CBT simulator, master time management, and test your readiness today.`,
      category: 'exam_alert',
      priority: 'high',
      actionLabel: 'Launch 8-Key CBT Mock',
      actionView: 'mock-exam',
      iconType: 'timer'
    }, user?.id, true);
  },

  /**
   * AUTOMATIC TRIGGER: Mock Exam Scored Summary
   */
  triggerMockExamScored(
    user: User | null,
    examType: string,
    scorePct: number,
    totalQuestions: number,
    correctCount: number
  ) {
    const isPassing = scorePct >= 50;
    this.addNotification({
      userId: user?.id,
      title: `📊 ${examType} Mock Scored: ${Math.round(scorePct)}% (${correctCount}/${totalQuestions})`,
      message: isPassing
        ? `Impressive work! You scored ${Math.round(scorePct)}% on the official simulation. Review your solution breakdowns and step-by-step examiner proofs to reach 80%+!`
        : `You completed your ${examType} mock exam with ${correctCount} correct answers. Focus on reviewing weak areas in the explanation review hall to boost your next score!`,
      category: 'exam_alert',
      priority: 'high',
      actionLabel: 'Review Answers & Solutions',
      actionView: 'mock-exam',
      iconType: 'award'
    }, user?.id, true);
  },

  /**
   * AUTOMATIC TRIGGER: Monthly Airtime Prize Race Alert
   */
  triggerAirtimeLeaderboardAlert(user: User | null) {
    this.addNotification({
      userId: user?.id,
      title: `🎁 Monthly Airtime Race: Top 5 Win Free Airtime!`,
      message: `The monthly leaderboard contest is in full swing! Top 5 ranked candidates on the 1st of the month receive MTN, Airtel, Glo, or 9mobile recharge pins. Solve questions in Ranked Mode to climb!`,
      category: 'airtime_prize',
      priority: 'normal',
      actionLabel: 'Check Your Rank',
      actionView: 'leaderboard',
      iconType: 'trophy'
    }, user?.id, true);
  },

  /**
   * AUTOMATIC TRIGGER: Monthly Champions League Tournament Alert
   */
  triggerTournamentAlert(user: User | null, title?: string, message?: string) {
    this.addNotification({
      userId: user?.id,
      title: title || '🏆 Monthly Champions League: ₦9,500 Cash Payouts',
      message: message || 'Top 32 monthly scholars are qualified for the UEFA-format group stages starting on the 12th! Win up to ₦5,000 cash, VIP privileges, and gold site theme.',
      category: 'tournament',
      priority: 'high',
      actionLabel: 'View Tournament Arena',
      actionView: 'tournament',
      iconType: 'trophy'
    }, user?.id, true);
  },

  /**
   * Request browser Web Notification permission
   */
  async requestBrowserNotificationPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const perm = await Notification.requestPermission();
      return perm;
    } catch {
      return 'denied';
    }
  }
};
