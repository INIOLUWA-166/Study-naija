import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { AuthGateway } from './components/AuthGateway';
import { HomeView } from './components/HomeView';
import { SubjectsView } from './components/SubjectsView';
import { PracticeView } from './components/PracticeView';
import { MockExamView } from './components/MockExamView';
import { DashboardView } from './components/DashboardView';
import { PremiumView } from './components/PremiumView';
import { StudyTipsView } from './components/StudyTipsView';
import { AdminView } from './components/AdminView';
import { SearchPadView } from './components/SearchPadView';
import { AITutorView } from './components/AITutorView';
import { FlashChallengeModal } from './components/FlashChallengeModal';
import { AdBanner } from './components/AdBanner';
import { DeviceTransferModal } from './components/DeviceTransferModal';
import { WelcomeVoiceBanner } from './components/WelcomeVoiceBanner';
import { WhatsAppSupport } from './components/WhatsAppSupport';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OfflinePacksModal } from './components/OfflinePacksModal';
import { HeadToHeadArenaView } from './components/HeadToHeadArenaView';
import { MatchVerificationModal } from './components/MatchVerificationModal';
import { CommunityView } from './components/CommunityView';
import { TournamentView } from './components/TournamentView';
import { StoryBooksView } from './components/StoryBooksView';
import { StudentProfileModal } from './components/StudentProfileModal';
import { BadgeUnlockedToast } from './components/BadgeUnlockedToast';
import { AdminAiRevocationModal } from './components/AdminAiRevocationModal';
import { AdminSuspensionModal } from './components/AdminSuspensionModal';
import { JambNovelStudyView } from './components/JambNovelStudyView';
import { GoogleWorkspaceModal } from './components/GoogleWorkspaceModal';
import { ChampionsQualificationModal } from './components/ChampionsQualificationModal';
import { ScientificCalculator } from './components/ScientificCalculator';
import { StudentNotificationModal } from './components/StudentNotificationModal';
import { NotificationToast } from './components/NotificationToast';
import { ScholarHonorCodeModal } from './components/ScholarHonorCodeModal';
import { WelcomeNewScholarModal } from './components/WelcomeNewScholarModal';
import { studentNotificationManager } from './utils/studentNotificationManager';
import { NewsFactCheckerAgentView } from './components/NewsFactCheckerAgentView';
import { AIStudyAssistantChatbot } from './components/AIStudyAssistantChatbot';
import { StudentLeaderboard } from './components/StudentLeaderboard';
import { User, Subject, Article, Question } from './types';
import { api, authStorage } from './services/api';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  logOutFromFirebase, 
  syncUserProfileToFirestore 
} from './services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { EXTENDED_QUESTIONS } from './utils/questionBank';
import { INITIAL_QUESTIONS } from './mockData';
import { aiVoice, getStudentFirstName, setStoredFirstName } from './utils/aiVoice';
import { 
  BookOpen, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  Trophy, 
  Crown, 
  Award, 
  Zap, 
  Smartphone, 
  Scale,
  ArrowLeft,
  Target,
  Eye,
  Ban
} from 'lucide-react';
import { tournamentManager, isUserQualifiedForChampions } from './utils/tournamentManager';
import { tournamentAudio } from './utils/tournamentAudio';
import { triggerChampionsLeagueVictoryConfetti } from './utils/confettiCelebration';
import { themeManager, ThemeMode } from './utils/themeManager';

const getViewTitle = (view: string): string => {
  switch (view) {
    case 'tournament':
      return 'Academic Champions League Cup';
    case 'subjects':
      return 'JAMB & WAEC Subjects Catalog';
    case 'practice':
      return 'Daily CBT Practice';
    case 'mock-exam':
      return 'Timed CBT Mock Exam Hall';
    case 'question-grabber':
    case 'harvester':
    case 'grab-questions':
    case 'past-questions':
    case 'past-jamb':
    case 'jamb-archive':
      return 'Past JAMB Questions Archive';
    case 'search-pad':
      return 'Syllabus & Topic Search Pad';
    case 'ai-tutor':
      return 'Naija AI Academic Tutor';
    case 'news-agent':
    case 'news':
    case 'fact-check':
      return 'Real-Time News & Fact-Checker';
    case 'dashboard':
      return 'Student Academic Dashboard';
    case 'leaderboard':
      return 'Nationwide Top Scorers Leaderboard';
    case 'arena-1v1':
      return '1v1 Head-to-Head Arena';
    case 'community':
      return 'Nigerian Scholar Community';
    case 'stories':
    case 'storybook':
    case 'storybooks':
      return 'Literature Storybooks Hub';
    case 'premium':
      return 'StudyNaija VIP Plans & Pricing';
    case 'study-tips':
      return 'Examiner Study Tips & Strategies';
    case 'admin':
      return 'Admin Sentinel Security Portal';
    default:
      return 'Academic Study Hub';
  }
};

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [focusModeActive, setFocusModeActive] = useState<boolean>(true);
  // Optimistically initialize user from persistent local storage so it NEVER flashes login screen
  const [user, setUser] = useState<User | null>(() => authStorage.getUser());
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => themeManager.getThemeMode(user));
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [showGuestWelcomePrompt, setShowGuestWelcomePrompt] = useState<boolean>(false);
  const [isDeviceSyncOpen, setIsDeviceSyncOpen] = useState<boolean>(false);
  const [isFlashChallengeOpen, setIsFlashChallengeOpen] = useState<boolean>(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState<boolean>(false);
  const [verifyModalCode, setVerifyModalCode] = useState<string>('');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [dashboardInitialTab, setDashboardInitialTab] = useState<'overview' | 'weekly-goals' | 'saved-questions' | 'leaderboard' | 'badges'>('overview');
  const [isGoogleWorkspaceOpen, setIsGoogleWorkspaceOpen] = useState<boolean>(false);
  const [revocationNotice, setRevocationNotice] = useState<any>(null);
  const [isRevocationModalOpen, setIsRevocationModalOpen] = useState(false);
  const [isChampionsQualModalOpen, setIsChampionsQualModalOpen] = useState<boolean>(false);
  const [isGlobalCalculatorOpen, setIsGlobalCalculatorOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState<number>(() => studentNotificationManager.getUnreadCount(user?.id));
  const [isAdminSuspendedOpen, setIsAdminSuspendedOpen] = useState<boolean>(false);
  const [isHonorCodeOpen, setIsHonorCodeOpen] = useState<boolean>(false);
  const [isOfflinePacksOpen, setIsOfflinePacksOpen] = useState<boolean>(false);
  const [customPracticeQuestions, setCustomPracticeQuestions] = useState<Question[] | null>(null);

  // Admin AI 2-minute suspension protocol (once)
  useEffect(() => {
    if (currentView === 'admin') {
      const suspendedDone = localStorage.getItem('studynaija_admin_suspended_once');
      if (!suspendedDone) {
        setIsAdminSuspendedOpen(true);
        localStorage.setItem('studynaija_admin_suspended_once', 'true');
      }
    }
  }, [currentView]);

  // Keep unread notification count synchronized in real time
  useEffect(() => {
    const handleNotifUpdate = (e: any) => {
      if (typeof e.detail?.count === 'number') {
        setUnreadNotifCount(e.detail.count);
      } else {
        setUnreadNotifCount(studentNotificationManager.getUnreadCount(user?.id));
      }
    };
    window.addEventListener('studynaija_notification_updated', handleNotifUpdate);
    return () => {
      window.removeEventListener('studynaija_notification_updated', handleNotifUpdate);
    };
  }, [user]);

  // Listen to Firebase Auth state to sync Google signed-in users and restore Firestore profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            const syncedUser: User = {
              id: fbUser.uid,
              name: data.name || fbUser.displayName || 'Scholar',
              email: fbUser.email || data.email || '',
              role: data.role || (fbUser.email === 'luvkidjaja@gmail.com' ? 'admin' : 'student'),
              educationLevel: data.educationLevel || 'secondary',
              targetExam: data.targetExam || 'JAMB',
              targetCourse: data.targetCourse || 'General Studies',
              premiumPlan: data.premiumPlan || 'free',
              createdAt: data.createdAt || new Date().toISOString(),
              xp: data.xp || 50,
              streakDays: data.streakDays || 1,
              lastActiveDate: new Date().toISOString(),
              stats: data.stats || {
                questionsAnswered: 0,
                averageScore: 0,
                bestScore: 0,
                weakestSubject: 'None'
              }
            };
            setUser(syncedUser);
            authStorage.setUser(syncedUser);
            if (!authStorage.getToken()) {
              api.syncGoogleUser({
                id: syncedUser.id,
                email: syncedUser.email,
                name: syncedUser.name,
                educationLevel: syncedUser.educationLevel,
                targetExam: syncedUser.targetExam,
                targetCourse: syncedUser.targetCourse
              }).catch(() => {});
            }
          }
        } catch (err) {
          console.warn('Could not restore user from Firestore:', err);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync user profile updates to Firestore
  useEffect(() => {
    if (user && auth.currentUser && auth.currentUser.uid === user.id) {
      syncUserProfileToFirestore(user).catch(() => {});
    }
  }, [user?.xp, user?.streakDays, user?.targetExam, user?.targetCourse, user?.premiumPlan]);

  // Periodic check for 24-hour inactivity and study streaks
  useEffect(() => {
    studentNotificationManager.check24HourInactivity(user);
    const interval = setInterval(() => {
      studentNotificationManager.check24HourInactivity(user);
    }, 10 * 60 * 1000); // Check every 10 minutes
    return () => clearInterval(interval);
  }, [user]);

  // Synchronize theme with DOM
  useEffect(() => {
    themeManager.applyThemeToDom(themeMode);
  }, [themeMode]);

  // Listen to cross-component theme updates
  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e.detail?.themeMode) {
        setThemeMode(e.detail.themeMode);
      }
    };
    window.addEventListener('studynaija_theme_changed', handleThemeChange);
    return () => {
      window.removeEventListener('studynaija_theme_changed', handleThemeChange);
    };
  }, []);

  const handleToggleTheme = () => {
    const newMode = themeMode === 'cyber' ? 'light' : 'cyber';
    setThemeMode(newMode);
    themeManager.setThemeMode(newMode, user, updated => setUser(updated));
  };

  // Listen for Admin AI Revocation and GOAT coronation events
  useEffect(() => {
    const handleRevocation = (e: any) => {
      setRevocationNotice(e.detail?.revokedNotice || e.detail);
      setIsRevocationModalOpen(true);
      if (user) {
        setUser({
          ...user,
          themeVariant: 'default',
          isGoat: false,
          goatPrivilegesActive: false,
          tournamentBadge: null
        });
      }
    };

    const handleGoatCrowned = (e: any) => {
      const champUser = e.detail?.user;
      if (champUser) {
        setUser({
          ...champUser,
          themeVariant: 'goat',
          isGoat: true,
          goatPrivilegesActive: true,
          tournamentBadge: '1st',
          premiumPlan: 'premium'
        });
      }
    };

    window.addEventListener('studynaija_admin_ai_revocation', handleRevocation);
    window.addEventListener('studynaija_goat_crowned', handleGoatCrowned);
    return () => {
      window.removeEventListener('studynaija_admin_ai_revocation', handleRevocation);
      window.removeEventListener('studynaija_goat_crowned', handleGoatCrowned);
    };
  }, [user]);

  const handleTriggerNextTournamentSeason = async () => {
    const res = tournamentManager.adminAiStartNewSeasonAndRevokePrivileges(user);
    setRevocationNotice(res.revokedNotice);
    setIsRevocationModalOpen(true);

    if (user) {
      const strippedUser: User = {
        ...user,
        themeVariant: 'default',
        isGoat: false,
        goatPrivilegesActive: false,
        tournamentBadge: null
      };
      setUser(strippedUser);
      authStorage.setUser(strippedUser);
    }

    try {
      await fetch('/api/tournament/admin-ai-start-new-season', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, email: user?.email })
      });
    } catch {}
  };
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeExamFilter, setActiveExamFilter] = useState<'ALL' | 'JAMB' | 'WAEC'>('ALL');
  
  // Navigation parameter state
  const [practiceParams, setPracticeParams] = useState<{ subjectId?: string; topic?: string }>({});
  const [tutorParams, setTutorParams] = useState<{ topic?: string; subject?: string }>({});
  const [tipsSlug, setTipsSlug] = useState<string | undefined>(undefined);

  // Initialize session and subjects
  const loadInitialData = async () => {
    // 1. Check for incoming Anti-Cheat Match Verification Link or Device Transfer Link
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const verifyMatchCode = urlParams.get('verifyMatch') || urlParams.get('verifyCode') || urlParams.get('verify');
      if (verifyMatchCode) {
        setVerifyModalCode(verifyMatchCode);
        setIsVerificationOpen(true);
      }

      const syncCode = urlParams.get('device_sync') || urlParams.get('sync') || urlParams.get('syncCode');
      if (syncCode) {
        setAuthLoading(true);
        try {
          const syncRes = await api.verifyDeviceSyncCode(syncCode);
          setUser(syncRes.user);
          window.history.replaceState({}, document.title, window.location.pathname);
          setAuthLoading(false);
          const subjectsData = await api.getSubjects();
          setSubjects(subjectsData);
          return;
        } catch (err) {
          console.warn('Direct device sync code link failed:', err);
        }
      }
    }

    let activeUserResult: User | null = null;
    try {
      const currentUser = await api.getCurrentUser();
      activeUserResult = currentUser;
      setUser(currentUser);
      if (currentUser?.email) {
        const welcomeEmailKey = `studynaija_welcome_email_dispatched_${currentUser.email.toLowerCase()}`;
        if (!localStorage.getItem(welcomeEmailKey)) {
          api.sendWelcomeEmail(currentUser.email, currentUser.name, currentUser.targetExam).catch(() => {});
          localStorage.setItem(welcomeEmailKey, 'true');
        }
      }
    } catch {
      // If offline or temporary error, fall back to cached user
      const cached = authStorage.getUser();
      activeUserResult = cached;
      setUser(cached);
      if (cached?.email) {
        const welcomeEmailKey = `studynaija_welcome_email_dispatched_${cached.email.toLowerCase()}`;
        if (!localStorage.getItem(welcomeEmailKey)) {
          api.sendWelcomeEmail(cached.email, cached.name, cached.targetExam).catch(() => {});
          localStorage.setItem(welcomeEmailKey, 'true');
        }
      }
    } finally {
      setAuthLoading(false);
      if (!activeUserResult) {
        setShowGuestWelcomePrompt(true);
      }
    }

    try {
      const subjectsData = await api.getSubjects();
      setSubjects(subjectsData);
    } catch {
      // Handled
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleNavigate = (view: string, extra?: any) => {
    // Intercept protected actions for unauthenticated guests
    if (!user && (view === 'mock-exam' || view === 'arena-1v1' || view === 'dashboard' || view === 'profile')) {
      handleOpenAuth(view === 'mock-exam' ? 'signup' : 'login');
      return;
    }
    if (view === 'device-sync') {
      setIsDeviceSyncOpen(true);
      return;
    }
    if (view === 'flash-challenge') {
      setIsFlashChallengeOpen(true);
      return;
    }
    if (view === 'offline-packs') {
      setIsOfflinePacksOpen(true);
      return;
    }
    if (view === 'verify-match' || view === 'verify') {
      if (extra?.code) {
        setVerifyModalCode(extra.code);
      }
      setIsVerificationOpen(true);
      return;
    }
    if (view === 'profile') {
      setIsProfileOpen(true);
      return;
    }
    if (view === 'notifications') {
      setIsNotificationModalOpen(true);
      return;
    }
    if (view === 'calculator') {
      setIsGlobalCalculatorOpen(true);
      return;
    }
    if (view === 'rules' || view === 'honor-code' || view === 'conduct') {
      setIsHonorCodeOpen(true);
      return;
    }
    if (view === 'question-grabber' || view === 'harvester' || view === 'grab-questions' || view === 'past-questions' || view === 'past-jamb' || view === 'jamb-archive' || view === 'study-planner') {
      setDashboardInitialTab('study-planner');
      setCurrentView('dashboard');
      window.scrollTo(0, 0);
      return;
    }
    if (view === 'saved' || view === 'saved-questions') {
      setDashboardInitialTab('saved-questions');
      setCurrentView('dashboard');
      window.scrollTo(0, 0);
      return;
    }
    if (view === 'dashboard' && extra?.tab) {
      setDashboardInitialTab(extra.tab);
    }
    if (view === 'practice') {
      if (extra) {
        setPracticeParams({ subjectId: extra.subjectId, topic: extra.topic });
        if (extra.customQuestions) {
          setCustomPracticeQuestions(extra.customQuestions);
        } else {
          setCustomPracticeQuestions(null);
        }
      } else {
        setCustomPracticeQuestions(null);
      }
    } else if (view === 'ai-tutor') {
      if (extra) {
        setTutorParams({ topic: extra.topic, subject: extra.subject });
      }
    } else if (view === 'study-tips') {
      if (extra?.slug) {
        setTipsSlug(extra.slug);
      } else {
        setTipsSlug(undefined);
      }
    } else if (view === 'tournament') {
      if (currentView !== 'tournament') {
        setCurrentView('tournament');
        window.scrollTo(0, 0);
      }
      return;
    }
    if (currentView !== view) {
      setCurrentView(view);
      window.scrollTo(0, 0);
    }
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthInitialMode(mode);
    setIsAuthOpen(true);
  };

  const handleLogout = () => {
    api.logout();
    logOutFromFirebase().catch(() => {});
    aiVoice.stop();
    setUser(null);
    setCurrentView('home');
  };

  const handleAuthSuccess = (authenticatedUser: User, targetView: string = 'home') => {
    setUser(authenticatedUser);
    syncUserProfileToFirestore(authenticatedUser).catch(() => {});
    setCurrentView(targetView);
    const studentName = authenticatedUser.name || authenticatedUser.email;
    const firstName = getStudentFirstName(studentName);
    if (firstName) {
      setStoredFirstName(firstName);
    }

    // Trigger automatic welcome message (if new registration or new email) & check 24h inactivity
    studentNotificationManager.triggerSignupWelcome(authenticatedUser);
    studentNotificationManager.check24HourInactivity(authenticatedUser);
    setUnreadNotifCount(studentNotificationManager.getUnreadCount(authenticatedUser.id));

    // Ensure welcome email is dispatched to this specific email address
    if (authenticatedUser.email) {
      const welcomeEmailKey = `studynaija_welcome_email_dispatched_${authenticatedUser.email.toLowerCase()}`;
      if (!localStorage.getItem(welcomeEmailKey)) {
        api.sendWelcomeEmail(authenticatedUser.email, authenticatedUser.name, authenticatedUser.targetExam).catch(() => {});
        localStorage.setItem(welcomeEmailKey, 'true');
      }
    }

    // Naija AI speaks out loud every time the student logs in
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {}
    setTimeout(() => {
      aiVoice.speakLoginGreeting(studentName);
    }, 250);
  };

  // 1. Loading splash while checking session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg animate-pulse">
          SN
        </div>
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium tracking-wide">Loading StudyNaija Portal...</p>
      </div>
    );
  }

  // 2. Mandatory Login / Registration for First-Time Users & Unauthenticated Scholars
  // When a visitor arrives and is not authenticated, they MUST sign in or register before accessing the CBT Portal.
  if (!user) {
    return (
      <AuthGateway
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  const effectiveUser = user;

  // Check tournament state to honor 1st, 2nd, and 3rd place champions
  const activeTournamentState = tournamentManager.getState(user);
  const isChampion = !!(user && activeTournamentState.champion && (activeTournamentState.champion.id === user?.id || (user?.email && activeTournamentState.champion.email?.toLowerCase() === user.email.toLowerCase())));
  const isRunnerUp = !!(user && activeTournamentState.runnerUp && (activeTournamentState.runnerUp.id === user?.id || (user?.email && activeTournamentState.runnerUp.email?.toLowerCase() === user.email.toLowerCase())));
  const isThirdPlace = !!(user && activeTournamentState.thirdPlace && (activeTournamentState.thirdPlace.id === user?.id || (user?.email && activeTournamentState.thirdPlace.email?.toLowerCase() === user.email.toLowerCase())));

  const effectiveThemeVariant: 'default' | 'gold' | 'diamond' | 'platinum' | 'goat' = 
    isChampion || user?.themeVariant === 'goat' || (user as any)?.isGoat ? 'goat' :
    user?.themeVariant === 'gold' || user?.tournamentBadge === '1st' ? 'gold' :
    user?.themeVariant === 'diamond' || user?.tournamentBadge === '2nd' || isRunnerUp ? 'diamond' :
    user?.themeVariant === 'platinum' || user?.tournamentBadge === '3rd' || isThirdPlace ? 'platinum' :
    'default';

  // Keep user badges and active memberships in sync
  const decoratedUser: User = {
    ...effectiveUser,
    themeVariant: effectiveThemeVariant !== 'default' ? effectiveThemeVariant : (effectiveUser.themeVariant || 'default'),
    isGoat: isChampion || effectiveThemeVariant === 'goat',
    goatPrivilegesActive: isChampion || effectiveThemeVariant === 'goat',
    tournamentBadge: isChampion || effectiveThemeVariant === 'goat' || effectiveThemeVariant === 'gold' ? '1st' :
                     isRunnerUp || effectiveThemeVariant === 'diamond' ? '2nd' :
                     isThirdPlace || effectiveThemeVariant === 'platinum' ? '3rd' :
                     user?.tournamentBadge,
    premiumPlan: (isChampion || effectiveThemeVariant === 'goat') ? 'premium' : isRunnerUp ? 'medium' : isThirdPlace ? 'basic' : (effectiveUser.premiumPlan || 'free')
  };

  const activeUser = decoratedUser;

  return (
    <div className={`min-h-screen flex flex-col font-sans relative overflow-x-hidden ${
      themeMode === 'light'
        ? 'bg-slate-50 text-slate-900 selection:bg-cyan-200 selection:text-slate-950 light-theme'
        : effectiveThemeVariant === 'goat'
        ? 'bg-gradient-to-b from-amber-950/70 via-slate-950 to-amber-950/40 text-amber-50 selection:bg-yellow-400 selection:text-slate-950 ring-2 ring-amber-400/50 shadow-[0_0_80px_rgba(245,158,11,0.25)_inset]'
        : effectiveThemeVariant === 'gold'
        ? 'bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 text-amber-50 selection:bg-amber-400 selection:text-slate-950 ring-1 ring-amber-500/30'
        : effectiveThemeVariant === 'diamond'
        ? 'bg-gradient-to-b from-cyan-950/40 via-slate-950 to-slate-950 text-cyan-50 selection:bg-cyan-400 selection:text-slate-950 ring-1 ring-cyan-400/30'
        : effectiveThemeVariant === 'platinum'
        ? 'bg-gradient-to-b from-slate-900/50 via-slate-950 to-slate-950 text-slate-100 selection:bg-slate-300 selection:text-slate-950 ring-1 ring-slate-400/30'
        : 'bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 futuristic-grid-bg'
    }`}>
      {/* Lightweight GPU-accelerated ambient background gradients */}
      {themeMode === 'light' ? (
        <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.12),rgba(255,255,255,0))]" />
      ) : effectiveThemeVariant === 'goat' ? (
        <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.18),rgba(2,6,23,0))]" />
      ) : effectiveThemeVariant === 'gold' ? (
        <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.14),rgba(2,6,23,0))]" />
      ) : effectiveThemeVariant === 'diamond' ? (
        <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.14),rgba(2,6,23,0))]" />
      ) : effectiveThemeVariant === 'platinum' ? (
        <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(203,213,225,0.12),rgba(2,6,23,0))]" />
      ) : (
        <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.1),rgba(2,6,23,0))]" />
      )}

      {/* EXCLUSIVE CHAMPIONS LEAGUE ACADEMIC CHAMPION REIGN BANNER (Only on Home view) */}
      {currentView === 'home' && effectiveThemeVariant === 'goat' && (
        <div className="bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-950 text-amber-100 py-2.5 px-4 text-center border-b-2 border-amber-400/60 text-xs font-semibold flex flex-wrap items-center justify-center gap-3 shadow-[0_0_35px_rgba(245,158,11,0.35)] relative overflow-hidden z-40">
          <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
          
          <div className="flex items-center gap-2 relative z-10">
            <span className="text-xl animate-bounce">🏆</span>
            <span className="font-black tracking-widest text-amber-300 font-['Outfit'] uppercase flex items-center gap-1.5">
              <span>REIGNING NATIONAL ACADEMIC CHAMPION • 1ST PLACE WINNER</span>
              <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />
            </span>
          </div>

          <div className="flex items-center gap-2 relative z-10 text-[11px] text-amber-200/90 font-medium">
            <span>• 1-Month Free VIP Premium Active</span>
            <span>• ₦5,000 Prize Secured</span>
            <span className="text-amber-400 font-bold">• Privileges Held Until Next Tournament Season Kicks Off!</span>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button
              onClick={() => {
                tournamentAudio.playGoatHorn();
                triggerChampionsLeagueVictoryConfetti();
              }}
              className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-[11px] uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1 hover:scale-105"
            >
              <span>🎉 Celebrate Reign</span>
            </button>

            <button
              onClick={() => handleTriggerNextTournamentSeason()}
              className="px-3 py-1 rounded-full bg-slate-950/80 hover:bg-slate-900 text-amber-300 border border-amber-400/50 font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 hover:border-red-400"
              title="Test Requirement: Triggers the Admin AI to start the next Champions League season and revoke your privileges!"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>⚡ Start Next Season (Admin AI Revoke)</span>
            </button>

            <button
              onClick={() => handleNavigate('tournament')}
              className="px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>Tournament Tab →</span>
            </button>
          </div>
        </div>
      )}

      {/* NON-BYPASSABLE ACCOUNT SANCTION ENFORCEMENT (BAN / SUSPENSION) */}
      {user && (user.isBanned || (user.isSuspended && (!user.suspensionExpiresAt || new Date(user.suspensionExpiresAt).getTime() > Date.now()))) && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl border border-red-300 animate-in fade-in zoom-in-95">
            <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl ${
              user.isBanned ? 'bg-red-600 shadow-red-900/30' : 'bg-amber-500 shadow-amber-900/30'
            }`}>
              <Ban className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
                {user.isBanned ? 'Account Permanently Banned' : 'Account Temporarily Suspended'}
              </h2>
              <p className="text-xs text-slate-500">
                Administrative Disciplinary Sanction Active
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 text-left space-y-2.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Sanction Reason:</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {user.banReason || user.suspensionReason || 'Violation of academic integrity or platform conduct policies.'}
                </p>
              </div>

              {user.isSuspended && user.suspensionExpiresAt && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-700 block tracking-wider">Suspension Ends:</span>
                  <p className="font-bold text-amber-800 mt-0.5">
                    {new Date(user.suspensionExpiresAt).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                If you believe this action was taken in error or want to file an official appeal, please email StudyNaija Administration at <strong className="text-slate-800">luvkidjaja@gmail.com</strong>.
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-sm"
            >
              Sign Out from Account
            </button>
          </div>
        </div>
      )}

      {/* Exclusive Champions League Winner Website Header Banner (Only on Home view) */}
      {currentView === 'home' && effectiveThemeVariant === 'gold' && (
        <div className="bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-950 text-amber-200 py-2 px-4 text-center border-b border-amber-500/40 text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
          <span className="font-black tracking-wider text-amber-300">👑 NATIONAL CHAMPION GOLD THEME ACTIVE:</span>
          <span>Congratulations on taking 1st Place! Your 1-Month Free Premium Plan is activated & ₦5,000 prize is waiting in the Tournament tab.</span>
          <button 
            onClick={() => handleNavigate('tournament')}
            className="ml-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase hover:bg-amber-300 transition-all cursor-pointer shadow-sm"
          >
            Claim ₦5,000 →
          </button>
        </div>
      )}
      {currentView === 'home' && effectiveThemeVariant === 'diamond' && (
        <div className="bg-gradient-to-r from-cyan-950 via-sky-950 to-cyan-950 text-cyan-200 py-2 px-4 text-center border-b border-cyan-400/40 text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <Crown className="w-4 h-4 text-cyan-300 animate-pulse" />
          <span className="font-black tracking-wider text-cyan-300">💎 DIAMOND FINALIST THEME ACTIVE:</span>
          <span>Congratulations on taking 2nd Place! Your 1-Month Free Medium Plan is activated & ₦3,000 prize is waiting.</span>
          <button 
            onClick={() => handleNavigate('tournament')}
            className="ml-2 px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] uppercase hover:bg-cyan-300 transition-all cursor-pointer shadow-sm"
          >
            Claim ₦3,000 →
          </button>
        </div>
      )}
      {currentView === 'home' && effectiveThemeVariant === 'platinum' && (
        <div className="bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-900 text-slate-200 py-2 px-4 text-center border-b border-slate-400/40 text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(203,213,225,0.15)]">
          <Award className="w-4 h-4 text-slate-300" />
          <span className="font-black tracking-wider text-slate-100">🛡️ PLATINUM PODIUM THEME ACTIVE:</span>
          <span>Congratulations on taking 3rd Place! Your 1-Month Free Basic Plan is activated & ₦1,500 prize is waiting.</span>
          <button 
            onClick={() => handleNavigate('tournament')}
            className="ml-2 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-950 font-black text-[10px] uppercase hover:bg-white transition-all cursor-pointer shadow-sm"
          >
            Claim ₦1,500 →
          </button>
        </div>
      )}
      
      {/* Top Banner Non-Intrusive Sponsored Space (Only on Home View) */}
      {currentView === 'home' && (
        <div className="bg-slate-950 text-slate-300 py-1.5 px-4 text-center border-b border-cyan-500/20 text-[11px] hidden sm:flex items-center justify-center gap-2">
          <span className="font-mono font-semibold text-cyan-400">⚡ 2026/2027 JAMB UTME & WAEC REVISION PROTOCOL:</span>
          <span className="text-slate-300">Over 4,000 past questions, syllabus guides, and verified marking schemes available.</span>
          <button
            onClick={() => handleNavigate('mock-exam')}
            className="underline font-bold text-cyan-300 hover:text-cyan-200 ml-1 cursor-pointer"
          >
            Launch CBT Mock →
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        activeView={currentView}
        user={user ? decoratedUser : null}
        onNavigate={handleNavigate}
        setActiveView={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        activeExamFilter={activeExamFilter}
        setActiveExamFilter={setActiveExamFilter}
        onOpenFlashChallenge={() => setIsFlashChallengeOpen(true)}
        onOpenProfile={() => {
          if (!user) {
            handleOpenAuth('login');
          } else {
            setIsProfileOpen(true);
          }
        }}
        onOpenGoogleWorkspace={() => setIsGoogleWorkspaceOpen(true)}
        onOpenCalculator={() => setIsGlobalCalculatorOpen(true)}
        unreadNotificationsCount={unreadNotifCount}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenHonorCode={() => setIsHonorCodeOpen(true)}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Persistent Guest Banner when not signed in */}
      {!user && (
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white px-4 py-2.5 text-xs font-medium shadow-md border-b border-emerald-500/30">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="text-base shrink-0">👋</span>
              <span>
                <strong className="font-bold text-amber-300">Welcome, New Scholar!</strong> You are currently in Guest Mode.
                <span className="text-emerald-100 ml-1">
                  Please log in or register your student account to take full CBT exams, save test scores, track your UTME countdown, and earn monthly prizes.
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleOpenAuth('signup')}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all hover:scale-105 cursor-pointer"
              >
                Register Free (New User)
              </button>
              <button
                onClick={() => handleOpenAuth('login')}
                className="px-3.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl border border-emerald-400/40 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Application Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Clean Back to Home for Subpages */}
        {currentView !== 'home' && (
          <div className="mb-4">
            <button
              onClick={() => handleNavigate('home')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back to Home</span>
            </button>
          </div>
        )}

        {/* Top Header Ad banner (Only on Home view) */}
        {currentView === 'home' && (
          <div className="mb-4">
            <AdBanner placement="top-banner" user={user} />
          </div>
        )}

        {/* Personalized Voice Welcome Banner (Only on Home view) */}
        {currentView === 'home' && (
          <WelcomeVoiceBanner 
            user={user} 
            onOpenAuth={() => handleOpenAuth('login')} 
          />
        )}

        {/* Dynamic Views with Framer Motion Page Transitions */}
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <HomeView
                subjects={subjects}
                user={user}
                activeExamFilter={activeExamFilter}
                setActiveExamFilter={setActiveExamFilter}
                onNavigate={handleNavigate}
                onOpenAuth={handleOpenAuth}
                onOpenFlashChallenge={() => setIsFlashChallengeOpen(true)}
                onOpenCalculator={() => setIsGlobalCalculatorOpen(true)}
                onOpenOfflinePacks={() => setIsOfflinePacksOpen(true)}
                onSelectExamFilter={filter => {
                  setActiveExamFilter(filter);
                  handleNavigate('subjects');
                }}
              />
            </motion.div>
          )}

          {currentView === 'subjects' && (
            <motion.div key="subjects" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <SubjectsView
                subjects={subjects}
                user={user}
                activeExamFilter={activeExamFilter}
                onStartPractice={(subId, topic) => handleNavigate('practice', { subjectId: subId, topic })}
                onStartMock={subId => handleNavigate('mock-exam', { subjectId: subId })}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {currentView === 'practice' && (
            <motion.div key="practice" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <PracticeView
                initialSubjectId={practiceParams.subjectId}
                initialTopic={practiceParams.topic}
                initialCustomQuestions={customPracticeQuestions || undefined}
                subjects={subjects}
                user={user}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {(currentView === 'question-grabber' || currentView === 'harvester' || currentView === 'grab-questions' || currentView === 'past-questions' || currentView === 'past-jamb' || currentView === 'jamb-archive') && (
            <motion.div key="question-grabber-redirect" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center">
              <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl font-black">
                  📅
                </div>
                <h3 className="text-lg font-black text-slate-900 font-['Outfit']">Redirecting to Daily Study Planner</h3>
                <p className="text-xs text-slate-500">Plan your daily topics and track your syllabus progress with zero duplicate questions.</p>
                <button
                  onClick={() => {
                    setDashboardInitialTab('study-planner');
                    setCurrentView('dashboard');
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Open Daily Study Planner
                </button>
              </div>
            </motion.div>
          )}

          {(currentView === 'novel-study' || currentView === 'jamb-novel' || currentView === 'the-life-changer') && (
            <motion.div key="novel-study" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <JambNovelStudyView
                user={user}
                onStartPractice={(novelQuestions) => {
                  setCustomPracticeQuestions(novelQuestions);
                  setCurrentView('practice');
                  window.scrollTo(0, 0);
                }}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {(currentView === 'news-agent' || currentView === 'news' || currentView === 'fact-check') && (
            <motion.div key="news-agent" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <NewsFactCheckerAgentView
                user={user}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {currentView === 'search-pad' && (
            <motion.div key="search-pad" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <SearchPadView
                user={user}
                subjects={subjects}
                onStartPractice={(subId, topic) => handleNavigate('practice', { subjectId: subId, topic })}
                onOpenAITutor={(topic, subjectName) => handleNavigate('ai-tutor', { topic, subject: subjectName })}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {currentView === 'ai-tutor' && (
            <motion.div key="ai-tutor" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <AITutorView
                user={user}
                subjects={subjects}
                initialTopic={tutorParams.topic}
                initialSubject={tutorParams.subject}
                onNavigate={handleNavigate}
                onRefreshUser={loadInitialData}
              />
            </motion.div>
          )}

          {currentView === 'mock-exam' && (
            <motion.div key="mock-exam" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <MockExamView
                subjects={subjects}
                user={user}
                onNavigate={handleNavigate}
                preferredSubject={practiceParams.subjectId}
                onOpenHonorCode={() => setIsHonorCodeOpen(true)}
              />
            </motion.div>
          )}

          {currentView === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <DashboardView
                user={user}
                onNavigate={handleNavigate}
                onOpenAuth={() => handleOpenAuth('login')}
                onOpenFlashChallenge={() => setIsFlashChallengeOpen(true)}
                onOpenAITutor={(topic, subject) => handleNavigate('ai-tutor', { topic, subject })}
                onOpenProfile={() => setIsProfileOpen(true)}
                onOpenGoogleWorkspace={() => setIsGoogleWorkspaceOpen(true)}
                onOpenHonorCode={() => setIsHonorCodeOpen(true)}
                initialTab={dashboardInitialTab}
              />
            </motion.div>
          )}

          {currentView === 'leaderboard' && (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <StudentLeaderboard
                user={activeUser}
                subjects={subjects}
                onNavigate={handleNavigate}
                onOpenAuth={() => handleOpenAuth('login')}
                onOpenFlashChallenge={() => setIsFlashChallengeOpen(true)}
              />
            </motion.div>
          )}

          {currentView === 'arena-1v1' && (
            <motion.div key="arena-1v1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <HeadToHeadArenaView
                user={user}
                onNavigate={handleNavigate}
                onRefreshUser={loadInitialData}
              />
            </motion.div>
          )}

          {currentView === 'tournament' && (
            <motion.div key="tournament" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <TournamentView
                user={activeUser}
                onNavigate={handleNavigate}
                onOpenAuth={() => handleOpenAuth('login')}
              />
            </motion.div>
          )}

          {currentView === 'community' && (
            <motion.div key="community" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <CommunityView
                user={activeUser}
                onOpenAuth={handleOpenAuth}
                onNavigate={handleNavigate}
                onOpenHonorCode={() => setIsHonorCodeOpen(true)}
              />
            </motion.div>
          )}

          {currentView === 'premium' && (
            <motion.div key="premium" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <PremiumView
                user={activeUser}
                onOpenAuth={() => handleOpenAuth('signup')}
                onPaymentSuccess={updatedUser => {
                  setUser(updatedUser);
                }}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {currentView === 'study-tips' && (
            <motion.div key="study-tips" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <StudyTipsView
                user={activeUser}
                initialSlug={tipsSlug}
                onNavigate={handleNavigate}
              />
            </motion.div>
          )}

          {(currentView === 'stories' || currentView === 'storybook' || currentView === 'storybooks') && (
            <motion.div key="stories" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <StoryBooksView
                user={activeUser}
                onNavigate={handleNavigate}
                onUpdateUser={updatedUser => setUser(updatedUser)}
              />
            </motion.div>
          )}

          {currentView === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
              <AdminView
                user={activeUser}
                subjects={subjects}
                onOpenAuth={() => handleOpenAuth('login')}
                onRefreshData={loadInitialData}
                onNavigate={handleNavigate}
                onUserUpgraded={updatedUser => setUser(updatedUser)}
                onOpenGoogleWorkspace={() => setIsGoogleWorkspaceOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer (Only on Home View to keep specific views isolated & distraction-free) */}
      {currentView === 'home' && (
        <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              
              {/* Brand column */}
              <div className="space-y-3 md:col-span-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                    SN
                  </div>
                  <span className="font-extrabold text-white text-base tracking-tight font-['Outfit']">
                    Study<span className="text-emerald-400">Naija</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Nigeria’s dedicated computer-based testing (CBT) prep platform for JAMB UTME, WAEC SSCE, and Post-UTME admission success.
                </p>
                <div className="text-[11px] text-emerald-400/90 font-medium">
                  🇳🇬 Built for Nigerian secondary students & tertiary aspirants.
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Study Resources</h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <button onClick={() => handleNavigate('subjects')} className="hover:text-white transition-colors">
                      JAMB & WAEC Subjects
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleNavigate('practice')} className="hover:text-white transition-colors">
                      Daily Practice Questions
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleNavigate('mock-exam')} className="hover:text-white transition-colors">
                      Timed CBT Mock Exam
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleNavigate('study-tips')} className="hover:text-white transition-colors">
                      Examiner Study Tips
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleNavigate('stories')} className="text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>Story Books & Literature Hub 📖</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Core Subjects */}
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Core Subjects</h4>
                <ul className="space-y-1.5 text-xs text-slate-400">
                  <li>English Language (Compulsory)</li>
                  <li>General Mathematics</li>
                  <li>Biology, Chemistry & Physics</li>
                  <li>Economics & Government</li>
                  <li>Literature & Commerce</li>
                </ul>
              </div>

              {/* Strict Security & Compliance */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Security Guarantee</span>
                </h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  <strong>Strict Non-Storage Policy:</strong> StudyNaija never requests, handles, or stores student bank card numbers, CVVs, ATM PINs, or bank OTPs. Premium access is verified securely via server tokens.
                </p>
                {user?.role === 'admin' && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleNavigate('admin')}
                      className="text-[10px] text-slate-500 hover:text-slate-300 underline"
                    >
                      Site Owner Admin Portal
                    </button>
                  </div>
                )}
              </div>

            </div>

            <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
              <div>
                © 2026 StudyNaija. All rights reserved. Not affiliated with the official Joint Admissions and Matriculation Board or the West African Examinations Council.
              </div>
              <div className="flex items-center gap-4 text-slate-400 flex-wrap">
                <button onClick={() => setIsHonorCodeOpen(true)} className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Scholar Honor Code & Rules</span>
                </button>
                <span>•</span>
                <button onClick={() => handleNavigate('community')} className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                  <span>🇳🇬 Student Community</span>
                </button>
                <span>•</span>
                <button onClick={() => handleNavigate('verify-match')} className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify Match Result</span>
                </button>
                <span>•</span>
                <button onClick={() => handleNavigate('premium')} className="hover:text-white">Pricing Plans</button>
                <span>•</span>
                <button onClick={() => handleNavigate('study-tips')} className="hover:text-white">Study Tips</button>
                <span>•</span>
                <button onClick={() => handleOpenAuth('signup')} className="hover:text-white">Student Registration</button>
              </div>
            </div>

          </div>
        </footer>
      )}

      {/* Public Anti-Cheat Match Verification Modal */}
      <MatchVerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        initialCode={verifyModalCode}
        onNavigateToArena={() => {
          setIsVerificationOpen(false);
          setCurrentView('arena-1v1');
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authInitialMode}
        onSuccess={loggedUser => {
          handleAuthSuccess(loggedUser, currentView === 'home' ? 'dashboard' : currentView);
        }}
      />

      {/* Device Transfer Modal for switching phones */}
      {user && (
        <DeviceTransferModal
          isOpen={isDeviceSyncOpen}
          onClose={() => setIsDeviceSyncOpen(false)}
          user={user}
        />
      )}

      {/* 60-Second Flash CBT Speed Challenge Modal */}
      <FlashChallengeModal
        isOpen={isFlashChallengeOpen}
        onClose={() => setIsFlashChallengeOpen(false)}
        questions={INITIAL_QUESTIONS}
        user={user}
        onXpEarned={() => {}}
      />

      {/* Floating WhatsApp Quick Support (Only on Home to avoid covering specific views) */}
      {currentView === 'home' && <WhatsAppSupport />}

      {/* Floating AI Study Assistant Chatbot (Only on Home to avoid covering specific views) */}
      {currentView === 'home' && (
        <AIStudyAssistantChatbot
          user={activeUser || user}
          onNavigate={handleNavigate}
          subjects={subjects}
        />
      )}

      {/* Offline Status & Local Cache Active Banner */}
      <OfflineIndicator />

      {/* Offline Study Paths & Subject Packs Modal */}
      <OfflinePacksModal
        isOpen={isOfflinePacksOpen}
        onClose={() => setIsOfflinePacksOpen(false)}
        user={activeUser || user}
        onStartOfflineDrill={(subjectId, customQuestions) => {
          handleNavigate('practice', {
            subjectId,
            customQuestions: customQuestions && customQuestions.length > 0 ? customQuestions : undefined
          });
        }}
        onStartOfflineStudyPath={(studyPath) => {
          const firstSubjectId = studyPath.modules[0]?.subjectId || 'english';
          handleNavigate('practice', {
            subjectId: firstSubjectId,
            customQuestions: studyPath.questions
          });
        }}
      />

      {/* Student Profile & Honours Badges Modal */}
      <StudentProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={activeUser}
        onNavigate={handleNavigate}
        onUpdateUser={updatedUser => setUser(updatedUser)}
        onOpenHonorCode={() => setIsHonorCodeOpen(true)}
      />

      {/* Official Scholar Honor Code, Rules & Consequences Modal */}
      <ScholarHonorCodeModal
        isOpen={isHonorCodeOpen}
        onClose={() => setIsHonorCodeOpen(false)}
        user={decoratedUser || activeUser}
        onUpdateUser={updatedUser => setUser(updatedUser)}
      />

      {/* Global Achievement Badge Unlocked Celebratory Toast */}
      <BadgeUnlockedToast />

      {/* Admin AI Sentinel Champions League Season Reset & Revocation Directive Modal */}
      <AdminAiRevocationModal
        isOpen={isRevocationModalOpen}
        onClose={() => setIsRevocationModalOpen(false)}
        onNavigateToTournament={() => handleNavigate('tournament')}
        noticeData={revocationNotice}
      />

      {/* Admin AI Sentinel 2-Minute Admin Site Suspension Modal (Once) */}
      <AdminSuspensionModal
        isOpen={isAdminSuspendedOpen}
        onUnlock={() => setIsAdminSuspendedOpen(false)}
      />

      {/* Google Workspace Integration Hub (Sheets, Docs, Classroom, Forms) */}
      <GoogleWorkspaceModal
        isOpen={isGoogleWorkspaceOpen}
        onClose={() => setIsGoogleWorkspaceOpen(false)}
        currentUser={user}
        examResults={user?.examResults}
      />

      {/* Champions League Qualification Benchmark Modal */}
      <ChampionsQualificationModal
        isOpen={isChampionsQualModalOpen}
        user={activeUser}
        onClose={() => setIsChampionsQualModalOpen(false)}
        onNavigate={handleNavigate}
        onProceedAsSpectator={() => {
          setIsChampionsQualModalOpen(false);
          setCurrentView('tournament');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onPreviewIntro={() => {
          setIsChampionsQualModalOpen(false);
          setCurrentView('tournament');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global Scientific Calculator Modal */}
      {isGlobalCalculatorOpen && (
        <ScientificCalculator
          isOpen={isGlobalCalculatorOpen}
          onClose={() => setIsGlobalCalculatorOpen(false)}
          mode="floating"
          subjectName="Mathematics & Science"
        />
      )}

      {/* Student Notification Center Modal */}
      <StudentNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        user={decoratedUser}
        onNavigate={handleNavigate}
      />

      {/* Welcome & Login Prompt Modal for New Users / Guests */}
      <WelcomeNewScholarModal
        isOpen={showGuestWelcomePrompt && !user}
        onClose={() => setShowGuestWelcomePrompt(false)}
        onLogin={() => {
          setShowGuestWelcomePrompt(false);
          handleOpenAuth('login');
        }}
        onRegister={() => {
          setShowGuestWelcomePrompt(false);
          handleOpenAuth('signup');
        }}
      />

    </div>
  );
}
