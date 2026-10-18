import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  FileCheck2, 
  Timer, 
  LayoutDashboard, 
  BookMarked, 
  Crown, 
  ShieldCheck, 
  ShieldAlert,
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  Smartphone,
  Search,
  Flame,
  Zap,
  Volume2,
  VolumeX,
  Swords,
  Trophy,
  MessageSquare,
  Users,
  Award,
  Bot,
  Sun,
  Moon,
  Calculator,
  Bell
} from 'lucide-react';
import { User } from '../types';
import { gamification } from '../utils/gamification';
import { aiVoice, getStudentFirstName } from '../utils/aiVoice';
import { JambCountdownTimer } from './JambCountdownTimer';
import { tournamentAudio } from '../utils/tournamentAudio';

interface NavbarProps {
  currentView?: string;
  activeView?: string;
  onNavigate?: (view: string, extra?: any) => void;
  setActiveView?: (view: string) => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  activeExamFilter?: 'ALL' | 'JAMB' | 'WAEC';
  setActiveExamFilter?: (filter: 'ALL' | 'JAMB' | 'WAEC') => void;
  onOpenFlashChallenge?: () => void;
  onOpenProfile?: () => void;
  onOpenGoogleWorkspace?: () => void;
  onOpenCalculator?: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onOpenStoreModal?: () => void;
  themeMode?: 'cyber' | 'light';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  activeView,
  onNavigate,
  setActiveView,
  user,
  onOpenAuth,
  onLogout,
  activeExamFilter = 'ALL',
  setActiveExamFilter,
  onOpenFlashChallenge,
  onOpenProfile,
  onOpenGoogleWorkspace,
  onOpenCalculator,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenStoreModal,
  themeMode = 'cyber',
  onToggleTheme
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [streakInfo, setStreakInfo] = useState(() => gamification.getStreak(user));
  const [isMuted, setIsMuted] = useState(() => tournamentAudio.getIsMuted());

  const active = currentView || activeView || 'home';

  // React to streak changes across the application
  useEffect(() => {
    const handleUpdate = () => {
      setStreakInfo(gamification.getStreak(user));
    };
    window.addEventListener('studynaija_streak_updated', handleUpdate);
    return () => {
      window.removeEventListener('studynaija_streak_updated', handleUpdate);
    };
  }, [user]);

  const navItems = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'practice', label: 'Practice', icon: FileCheck2 },
    { id: 'search-pad', label: 'Search Pad', icon: Search },
    { id: 'ai-tutor', label: 'Naija AI', icon: Sparkles, badge: 'AI' },
    { id: 'mock-exam', label: 'Mock Exam', icon: Timer },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stories', label: 'Story Books', icon: BookOpen, badge: 'READ', highlight: true },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, badge: 'TOP' },
    { id: 'tournament', label: 'Champions League', icon: Trophy, badge: '₦9.5K', highlight: true },
    { id: 'arena-1v1', label: '1v1 Arena', icon: Swords, badge: user?.arenaDiscountExpiresAt && new Date(user.arenaDiscountExpiresAt).getTime() > Date.now() ? '25% ACTIVE' : '25% OFF', highlight: true },
    { id: 'community', label: 'Community', icon: MessageSquare, badge: 'CHAT', highlight: true },
    { id: 'study-tips', label: 'Study Tips', icon: BookMarked },
    { id: 'premium', label: 'Premium', icon: Crown, highlight: true },
  ];

  const handleNavClick = (viewId: string) => {
    if (onNavigate) {
      onNavigate(viewId);
    } else if (setActiveView) {
      setActiveView(viewId);
    }
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleFilterClick = (type: 'ALL' | 'JAMB' | 'WAEC') => {
    if (setActiveExamFilter) {
      setActiveExamFilter(type);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      {/* Top micro-banner for 2026/2027 academic session & exam filters */}
      <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-850">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <span className="font-mono text-[11px] sm:text-xs tracking-tight text-slate-300">
                🇳🇬 <span className="text-cyan-400 font-bold">JAMB 2026/2027</span> // WAEC MAY/JUNE CBT MATRIX
              </span>
            </div>

            {/* Persistent Countdown Timer to Next Official JAMB UTME Date */}
            <JambCountdownTimer onNavigate={onNavigate || setActiveView} variant="banner" />
          </div>

          <div className="flex items-center gap-2.5 text-[11px] ml-auto">
            <button
              onClick={() => handleNavClick('stories')}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/90 hover:bg-amber-900 border border-amber-500/60 text-amber-300 font-mono text-[10px] font-bold transition cursor-pointer shadow-xs"
              title="Read student story books & literature"
            >
              <BookOpen className="w-3 h-3 text-amber-400" />
              <span>📖 Story Books</span>
            </button>

            <button
              onClick={() => onOpenGoogleWorkspace?.()}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-blue-300 font-mono text-[10px] transition cursor-pointer"
              title="Google Workspace Hub (Sheets, Docs, Classroom, Forms)"
            >
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google Sync</span>
            </button>

            <button
              onClick={() => handleNavClick('verify-match')}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] transition cursor-pointer"
              title="Verify 1v1 duel or mock exam result slip"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Verify Match</span>
            </button>

            <span className="text-slate-400 font-mono text-[10px] hidden sm:inline">EXAM FILTER:</span>
            <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
              {(['ALL', 'JAMB', 'WAEC'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => handleFilterClick(type)}
                  className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-[10px] sm:text-[11px] transition-all cursor-pointer ${
                    activeExamFilter === type
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <button 
            id="nav-logo-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-600 text-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-all">
              <GraduationCap className="w-5 h-5 text-slate-950 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white font-['Outfit']">
                  Study<span className="text-cyan-400">Naija</span>
                </span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded">
                  v2.6
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono -mt-0.5">NEURAL CBT PORTAL</p>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : item.highlight
                        ? 'text-amber-400 hover:bg-amber-950/40 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900 font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] bg-purple-900/80 text-purple-300 border border-purple-500/40 font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && (
                    <span className="text-[10px] bg-amber-900/60 text-amber-300 border border-amber-500/40 font-bold px-1.5 py-0.2 rounded-full">
                      ₦5k+
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar (Countdown / Admin / User Account / Login) */}
          <div className="hidden sm:flex items-center space-x-2">
            {/* Live Persistent JAMB Countdown Pill */}
            <JambCountdownTimer onNavigate={onNavigate || setActiveView} variant="pill" />

            {/* Quick 60s Flash CBT Button */}
            <button
              onClick={() => onOpenFlashChallenge ? onOpenFlashChallenge() : handleNavClick('practice')}
              className="px-2.5 py-1.5 text-xs font-black rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              title="Quick 60-Second Flash CBT Challenge"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span className="hidden xl:inline">60s Flash</span>
            </button>

            {/* Google Workspace Integration Hub */}
            <button
              onClick={onOpenGoogleWorkspace}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Google Workspace Hub: Sheets, Docs, Classroom & Forms"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="hidden xl:inline text-[11px] font-semibold">Google Hub</span>
            </button>

            {/* Quick Scientific Calculator Launcher */}
            {onOpenCalculator && (
              <button
                onClick={onOpenCalculator}
                className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Open Official Scientific Calculator (Trig, Powers, Physics & Chemistry Constants)"
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xl:inline text-[11px]">Calculator</span>
              </button>
            )}

            {/* Student Notification Center Bell */}
            {onOpenNotifications && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 transition-all cursor-pointer shadow-xs"
                title="Student Notification Center: Welcome Messages, 24-Hour Inactivity Alerts & Exam News"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}


            {/* Futuristic Daily Streak Indicator */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/20 to-red-500/15 hover:from-amber-500/25 hover:to-orange-500/30 text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:scale-102"
              title={`${streakInfo.streak}-day streak active. Increments every time you complete a practice session! Click to view in Dashboard.`}
            >
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
              <span className="font-mono font-black text-amber-900">{streakInfo.streak}d</span>
              <span className="hidden md:inline text-[10px] font-bold text-amber-700 uppercase tracking-wider">Streak</span>
            </button>

            {/* Stadium Sound FX Master Toggle */}
            <button
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                tournamentAudio.setMuted(nextMuted);
                if (!nextMuted) tournamentAudio.playWhistle();
              }}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-slate-900/60 border-slate-700/60 text-slate-500 hover:text-slate-300'
                  : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              }`}
              title={isMuted ? 'Turn Sound FX ON' : 'Turn Sound FX OFF (Muted)'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 animate-pulse" />}
              <span className="hidden lg:inline text-[10px] font-mono">{isMuted ? 'FX OFF' : 'FX ON'}</span>
            </button>

            {/* Admin shortcut button - only visible to authenticated admins */}
            {user?.role === 'admin' && (
              <button
                id="nav-admin-btn"
                onClick={() => handleNavClick('admin')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  active === 'admin'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                title="Site Owner Admin Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Admin</span>
              </button>
            )}

            {/* Google Workspace Desktop Hub Button */}
            <button
              onClick={() => onOpenGoogleWorkspace?.()}
              className="px-2.5 py-1.5 rounded-xl border border-blue-500/30 bg-blue-950/40 hover:bg-blue-900/60 text-blue-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Google Workspace Hub (Sheets, Docs, Classroom, Forms)"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="hidden xl:inline text-xs font-bold">Google Sync</span>
            </button>

            {/* Quick Theme Toggle (Cyber Dark / High-Contrast Light) */}
            <button
              onClick={onToggleTheme}
              title={themeMode === 'light' ? 'Switch to Cyber Dark Theme' : 'Switch to High-Contrast Light Mode'}
              aria-label="Toggle Display Theme"
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold shadow-xs ${
                themeMode === 'light'
                  ? 'border-amber-400 bg-amber-100/90 text-amber-950 hover:bg-amber-200'
                  : 'border-slate-750 bg-slate-900/90 text-cyan-300 hover:border-cyan-500/40 hover:text-white'
              }`}
            >
              {themeMode === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-800" />
                  <span className="hidden 2xl:inline text-[11px]">Cyber Theme</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden 2xl:inline text-[11px]">Light Mode</span>
                </>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                    user.themeVariant === 'goat' || (user as any).isGoat
                      ? 'border-amber-400 bg-gradient-to-r from-amber-950/80 to-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.4)] ring-1 ring-amber-400/50'
                      : 'border-slate-750 hover:border-cyan-500/40 bg-slate-900/90'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-md ${
                    user.themeVariant === 'goat' || (user as any).isGoat
                      ? 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 text-slate-950 border-2 border-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.8)] ring-1 ring-amber-400'
                      : user.tournamentBadge === '1st' || user.themeVariant === 'gold'
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 border border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                      : user.tournamentBadge === '2nd' || user.themeVariant === 'diamond'
                      ? 'bg-gradient-to-br from-cyan-400 to-teal-500 text-slate-950 border border-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                      : user.tournamentBadge === '3rd' || user.themeVariant === 'platinum'
                      ? 'bg-gradient-to-br from-slate-200 to-zinc-400 text-slate-950 border border-slate-100 shadow-[0_0_8px_rgba(203,213,225,0.4)]'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                  }`}>
                    {user.themeVariant === 'goat' || (user as any).isGoat ? '🏆' : user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold truncate max-w-[110px] flex items-center gap-1 ${
                        user.themeVariant === 'goat' || (user as any).isGoat
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-black drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                          : user.tournamentBadge === '1st' || user.themeVariant === 'gold'
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-extrabold drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]'
                          : user.tournamentBadge === '2nd' || user.themeVariant === 'diamond'
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-teal-300 font-extrabold drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]'
                          : user.tournamentBadge === '3rd' || user.themeVariant === 'platinum'
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-zinc-100 to-slate-300 font-extrabold drop-shadow-[0_0_6px_rgba(203,213,225,0.3)]'
                          : 'text-slate-200'
                      }`}>
                        <span className="truncate">{user.name}</span>
                        {(user.verifiedSession !== false && (user.integrityScore ?? 100) >= 75) ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 inline" title={`Verified CBT Session • ${user.integrityScore ?? 100}% Integrity`} />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 inline" title={`Academic Integrity Penalized • ${user.integrityScore}%`} />
                        )}
                      </span>
                      {user.themeVariant === 'goat' || (user as any).isGoat ? (
                        <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[9px] shadow-sm flex items-center gap-0.5">
                          🏆 Champion
                        </span>
                      ) : user.tournamentBadge === '1st' ? (
                        <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px] font-black">
                          🥇 1st
                        </span>
                      ) : user.tournamentBadge === '2nd' ? (
                        <span className="px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[9px] font-black">
                          💎 2nd
                        </span>
                      ) : user.tournamentBadge === '3rd' ? (
                        <span className="px-1 py-0.2 rounded bg-slate-400/20 text-slate-200 border border-slate-300/40 text-[9px] font-black">
                          🛡️ 3rd
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[10px] text-cyan-400 font-mono font-semibold capitalize">
                      {user.themeVariant === 'goat' || (user as any).isGoat ? (
                        <span className="text-amber-300 font-bold">🏆 Reigning Champion</span>
                      ) : user.premiumPlan !== 'free' ? (
                        `💎 ${user.premiumPlan}`
                      ) : (
                        'Free Student'
                      )}
                    </div>
                  </div>
                </button>

                {/* Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-slate-950 rounded-2xl shadow-2xl border border-cyan-500/30 py-2 z-50 backdrop-blur-xl">
                    <div className="px-4 py-2 border-b border-slate-850">
                      <p className="text-xs font-semibold text-white">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 bg-cyan-950 text-cyan-300 font-mono font-bold rounded border border-cyan-500/40">
                          Exam: {user.targetExam}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-950 text-amber-300 font-bold rounded border border-amber-500/40 capitalize">
                          {user.premiumPlan} Plan
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 font-bold rounded border flex items-center gap-1 ${
                          (user.verifiedSession !== false && (user.integrityScore ?? 100) >= 75)
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-950 text-amber-300 border-amber-500/40'
                        }`}>
                          {(user.verifiedSession !== false && (user.integrityScore ?? 100) >= 75) ? (
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <ShieldAlert className="w-3 h-3 text-amber-400" />
                          )}
                          <span>{user.integrityScore ?? 100}% Integrity</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const firstName = getStudentFirstName(user.name);
                        aiVoice.speakWelcomeGreeting(firstName);
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-cyan-300 hover:bg-slate-900 flex items-center gap-2 cursor-pointer font-medium transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      Hear Welcome Greeting
                    </button>
                    <button
                      onClick={() => {
                        if (onOpenProfile) onOpenProfile();
                        else handleNavClick('profile');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-amber-300 hover:bg-slate-900 flex items-center gap-2 cursor-pointer font-medium transition-colors"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      Academic Honours & Badges
                    </button>
                    <button
                      onClick={() => {
                        if (onToggleTheme) onToggleTheme();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-cyan-300 hover:bg-slate-900 flex items-center justify-between cursor-pointer font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        {themeMode === 'light' ? (
                          <Moon className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <Sun className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span>Theme: {themeMode === 'light' ? 'Light Mode' : 'Cyber Theme'}</span>
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono">
                        Switch
                      </span>
                    </button>
                    <button
                      onClick={() => handleNavClick('dashboard')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-900 hover:text-white flex items-center gap-2 cursor-pointer font-medium transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                      Student Dashboard
                    </button>
                    <button
                      onClick={() => handleNavClick('premium')}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-900 hover:text-white flex items-center gap-2 cursor-pointer font-medium transition-colors"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      Manage Subscription
                    </button>
                    <button
                      onClick={() => {
                        if (onOpenGoogleWorkspace) onOpenGoogleWorkspace();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-blue-300 hover:bg-slate-900 flex items-center gap-2 cursor-pointer font-medium transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      Google Workspace Sync
                    </button>

                    <button
                      onClick={() => {
                        handleNavClick('device-sync');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-900 hover:text-white flex items-center gap-2 cursor-pointer font-medium transition-colors"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      Switch Phone / Device Sync
                    </button>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-900 hover:text-white flex items-center gap-2 cursor-pointer font-medium transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        Admin Controls
                      </button>
                    )}

                    <div className="border-t border-slate-850 mt-1 pt-1">
                      <button
                        onClick={() => {
                          onLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer font-medium transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="navbar-login-btn"
                onClick={onOpenAuth}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Log In / Sign Up</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/95 border-b border-cyan-500/20 px-4 pt-2.5 pb-4 space-y-2 shadow-2xl backdrop-blur-xl">
          {/* Mobile Persistent Countdown Bar */}
          <div className="p-2.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
            <JambCountdownTimer onNavigate={onNavigate || setActiveView} variant="banner" />
          </div>

          <div className="space-y-1">
            {navItems.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="text-[10px] bg-amber-950/60 text-amber-300 border border-amber-500/40 font-bold px-2 py-0.5 rounded-full">
                    Upgrade
                  </span>
                )}
              </button>
            );
          })}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {/* Mobile Notification Center */}
            {onOpenNotifications && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenNotifications();
                }}
                className="col-span-2 px-3 py-2 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>Student Notifications</span>
                </div>
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full">
                    {unreadNotificationsCount} unread
                  </span>
                )}
              </button>
            )}

            {/* Mobile Scientific Calculator */}
            {onOpenCalculator && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCalculator();
                }}
                className="col-span-2 px-3 py-2 bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Open Scientific Calculator</span>
              </button>
            )}

            {/* Mobile Story Books & Literature Quick Access */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('stories');
              }}
              className="col-span-2 px-3 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/50 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>📖 Story Books & Literature Corner</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenFlashChallenge) onOpenFlashChallenge();
              }}
              className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>60s Flash CBT</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('dashboard');
              }}
              className="px-3 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
              <span>{streakInfo.streak}-Day Streak</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('verify-match');
              }}
              className="col-span-2 px-3 py-2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verify 1v1 Duel or Result</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenProfile) onOpenProfile();
                else handleNavClick('profile');
              }}
              className="col-span-2 px-3 py-2 bg-gradient-to-r from-slate-900 to-indigo-950 border border-cyan-500/40 text-cyan-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Academic Honours & Badges</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenGoogleWorkspace) onOpenGoogleWorkspace();
              }}
              className="col-span-2 px-3 py-2 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google Workspace Hub (Sheets, Docs, Classroom)</span>
            </button>
          </div>

          {user?.role === 'admin' && (
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 hover:bg-slate-900 border border-cyan-500/30 mt-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Site Owner Admin Portal</span>
            </button>
          )}

          <div className="pt-3 border-t border-slate-850">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-bold ${
                      user.themeVariant === 'goat' || (user as any).isGoat
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-black'
                        : user.tournamentBadge === '1st' || user.themeVariant === 'gold'
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-extrabold'
                        : user.tournamentBadge === '2nd' || user.themeVariant === 'diamond'
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-teal-300 font-extrabold'
                        : user.tournamentBadge === '3rd' || user.themeVariant === 'platinum'
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-zinc-100 to-slate-300 font-extrabold'
                        : 'text-white'
                    }`}>
                      {user.name}
                    </p>
                    {user.themeVariant === 'goat' || (user as any).isGoat ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[9px]">
                        🏆 Champion
                      </span>
                    ) : user.tournamentBadge === '1st' ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px] font-black">
                        🥇 1st Place
                      </span>
                    ) : user.tournamentBadge === '2nd' ? (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[9px] font-black">
                        💎 2nd Place
                      </span>
                    ) : user.tournamentBadge === '3rd' ? (
                      <span className="px-1.5 py-0.5 rounded bg-slate-400/20 text-slate-200 border border-slate-300/40 text-[9px] font-black">
                        🛡️ 3rd Place
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-slate-400">{user.email}</p>
                  <p className="text-[10px] text-cyan-400 font-mono font-semibold mt-0.5 capitalize">
                    {user.premiumPlan} Membership
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (onToggleTheme) onToggleTheme();
                  }}
                  className="w-full py-2 mb-2 text-xs font-bold text-cyan-300 bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  {themeMode === 'light' ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Switch to Cyber Dark Theme</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Switch to High-Contrast Light Mode</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    handleNavClick('device-sync');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 mb-2 text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Switch Phone / Device Sync</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-xs font-bold text-rose-400 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Student Sign In / Create Account</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
