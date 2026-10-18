import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Lock, 
  Mail, 
  User as UserIcon, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Award, 
  Clock, 
  TrendingUp,
  AlertCircle,
  ShieldAlert,
  Check,
  X,
  Smartphone,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { api, authStorage, SavedCredentials } from '../services/api';
import { User } from '../types';
import { aiVoice, getStudentFirstName, setStoredFirstName, markWelcomeAsSpoken } from '../utils/aiVoice';
import { studentNotificationManager } from '../utils/studentNotificationManager';

interface AuthGatewayProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthGateway: React.FC<AuthGatewayProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'register' | 'login' | 'device-sync' | 'recover'>('register');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [educationLevel, setEducationLevel] = useState<'primary' | 'secondary' | 'university' | ''>('');
  const [targetExam, setTargetExam] = useState<'JAMB' | 'WAEC' | 'BOTH' | 'COMMON_ENTRANCE' | 'UNIVERSITY_GST'>('JAMB');
  const [targetCourse, setTargetCourse] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // New Phone / Device Sync state
  const [syncCode, setSyncCode] = useState('');

  // Password recovery state
  const [recoverIdentifier, setRecoverIdentifier] = useState('');
  const [recoverPassword, setRecoverPassword] = useState('');
  const [showRecoverPassword, setShowRecoverPassword] = useState(false);

  // Remembered credentials from disk / localStorage
  const [savedCreds, setSavedCreds] = useState<SavedCredentials | null>(null);

  // Validation & error states
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Load saved credentials on mount
  useEffect(() => {
    const creds = authStorage.getSavedCredentials();
    if (creds && creds.identifier) {
      setSavedCreds(creds);
      setEmail(creds.identifier);
      if (creds.password) {
        setPassword(creds.password);
      }
    }
  }, []);

  // Email format regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const cleanNigerianPhone = (num: string) => {
    let clean = num.trim().replace(/\D/g, '');
    if (clean.startsWith('234') && clean.length === 13) {
      clean = '0' + clean.slice(3);
    }
    return clean;
  };

  // Field-level validation rules
  const getNameError = (): string | null => {
    if (!name.trim()) return 'Full name is required to create your student profile.';
    if (name.trim().length < 3) return 'Name must be at least 3 characters long.';
    const parts = name.trim().split(/\s+/);
    if (parts.length < 2) return 'Please enter both your first name and last name (e.g., Emeka Adeleke).';
    if (parts[0].length < 2 || parts[1].length < 2) return 'Each name must be at least 2 characters long.';
    return null;
  };

  const getEmailOrPhoneError = (): string | null => {
    if (!email.trim()) return 'Email address or Nigerian phone number is required.';
    const isEmail = email.includes('@');
    if (isEmail) {
      if (!emailRegex.test(email.trim().toLowerCase())) {
        return 'Please enter a valid email address (e.g., student@example.com).';
      }
    } else {
      const p = cleanNigerianPhone(email);
      if (p.length !== 11) {
        return 'Please enter a valid 11-digit Nigerian phone number (e.g., 08012345678) or email.';
      }
    }
    return null;
  };

  const getRegisterEmailError = (): string | null => {
    if (!email.trim()) return 'Email address is required.';
    if (!emailRegex.test(email.trim().toLowerCase())) {
      return 'Please enter a valid email address (e.g., student@example.com).';
    }
    return null;
  };

  const getPhoneError = (): string | null => {
    if (!phone.trim()) return null;
    const p = cleanNigerianPhone(phone);
    if (p.length !== 11) {
      return 'Nigerian phone number must be 11 digits (e.g. 08012345678).';
    }
    return null;
  };

  const getPasswordError = (): string | null => {
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters long.';
    return null;
  };

  const getConfirmPasswordError = (): string | null => {
    if (mode !== 'register') return null;
    if (!confirmPassword) return 'Please re-type your password to confirm.';
    if (confirmPassword !== password) return 'Passwords do not match. Please re-enter carefully.';
    return null;
  };

  const getEducationLevelError = (): string | null => {
    if (mode !== 'register') return null;
    if (!educationLevel) {
      return 'You must select your Education Level (Primary School, Secondary School, or Higher Institution/University) to proceed.';
    }
    return null;
  };

  const nameError = getNameError();
  const emailError = mode === 'register' ? getRegisterEmailError() : getEmailOrPhoneError();
  const phoneError = getPhoneError();
  const passwordError = getPasswordError();
  const confirmPasswordError = getConfirmPasswordError();
  const educationLevelError = getEducationLevelError();

  const hasFormErrors = mode === 'register' 
    ? Boolean(nameError || emailError || phoneError || passwordError || confirmPasswordError || educationLevelError)
    : Boolean(emailError || passwordError);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleOneTapLogin = async () => {
    if (!savedCreds || !savedCreds.identifier || !savedCreds.password) {
      setMode('login');
      return;
    }
    setLoading(true);
    setServerError(null);
    try {
      const res = await api.login(savedCreds.identifier, savedCreds.password, true);
      onAuthSuccess(res.user);
    } catch (err: any) {
      setServerError(err.message || 'Auto sign-in failed. Please enter your password to sign in.');
      setMode('login');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError(null);

    // 1. Device sync
    if (mode === 'device-sync') {
      const cleanCode = syncCode.trim().replace(/\D/g, '');
      if (cleanCode.length < 6) {
        setServerError('Please enter the 6-digit Device Transfer Code generated on your previous phone.');
        return;
      }
      setLoading(true);
      try {
        const res = await api.verifyDeviceSyncCode(cleanCode);
        onAuthSuccess(res.user);
      } catch (err: any) {
        setServerError(err.message || 'Invalid or expired device transfer code.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Recovery mode
    if (mode === 'recover') {
      if (!recoverIdentifier.trim() || !recoverPassword) {
        setServerError('Please provide your registered phone number or email, and your new password.');
        return;
      }
      if (recoverPassword.length < 6) {
        setServerError('New password must be at least 6 characters long.');
        return;
      }
      setLoading(true);
      try {
        const res = await api.recoverAccountByPhone(recoverIdentifier.trim(), recoverPassword);
        onAuthSuccess(res.user);
      } catch (err: any) {
        setServerError(err.message || 'Account recovery failed. Please verify your phone number or email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 3. Normal Register or Login
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      educationLevel: true
    });

    if (hasFormErrors) {
      if (mode === 'register' && educationLevelError) {
        setServerError('Access Denied: You must choose either Primary School, Secondary School, or Higher Institution/University before entering the website.');
      } else {
        setServerError('Access Denied: You cannot enter the website until all required information is filled correctly.');
      }
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await api.register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() ? cleanNigerianPhone(phone) : undefined,
          password,
          educationLevel: educationLevel as 'primary' | 'secondary' | 'university',
          targetExam,
          targetCourse: targetCourse.trim()
        }, rememberMe);
        const firstName = getStudentFirstName(res.user?.name || name);
        if (firstName) {
          setStoredFirstName(firstName);
          markWelcomeAsSpoken();
          setTimeout(() => {
            aiVoice.speakWelcomeGreeting(firstName);
          }, 350);
        }
        // Send automatic welcome message to student
        studentNotificationManager.triggerSignupWelcome(res.user);
        onAuthSuccess(res.user);
      } else {
        const res = await api.login(email.trim(), password, rememberMe);
        const firstName = getStudentFirstName(res.user?.name);
        if (firstName) {
          setStoredFirstName(firstName);
          markWelcomeAsSpoken();
          setTimeout(() => {
            aiVoice.speakWelcomeGreeting(firstName);
          }, 350);
        }
        // Check 24-hour inactivity for returning student
        studentNotificationManager.check24HourInactivity(res.user);
        // If this email hasn't received welcome email yet, trigger it immediately
        if (res.user?.email) {
          const welcomeEmailKey = `studynaija_welcome_email_dispatched_${res.user.email.toLowerCase()}`;
          if (!localStorage.getItem(welcomeEmailKey)) {
            api.sendWelcomeEmail(res.user.email, res.user.name, res.user.targetExam).catch(() => {});
            localStorage.setItem(welcomeEmailKey, 'true');
          }
        }
        onAuthSuccess(res.user);
      }
    } catch (err: any) {
      setServerError(err.message || 'Access Denied: Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoStudent = async () => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await api.login('student@studynaija.ng', 'StudentPass123!', true);
      const firstName = getStudentFirstName(res.user?.name);
      if (firstName) {
        setStoredFirstName(firstName);
        markWelcomeAsSpoken();
        setTimeout(() => {
          aiVoice.speakWelcomeGreeting(firstName);
        }, 350);
      }
      onAuthSuccess(res.user);
    } catch (err: any) {
      setServerError(err.message || 'Failed to login with demo student account');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAdmin = async () => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await api.login('admin@studynaija.ng', 'AdminPass123!', true);
      const firstName = getStudentFirstName(res.user?.name);
      if (firstName) {
        setStoredFirstName(firstName);
        markWelcomeAsSpoken();
        setTimeout(() => {
          aiVoice.speakWelcomeGreeting(firstName);
        }, 350);
      }
      onAuthSuccess(res.user);
    } catch (err: any) {
      setServerError(err.message || 'Failed to login with demo admin account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-gateway-screen" className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      
      {/* Top Header */}
      <header className="w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-base shadow-md">
              SN
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight font-['Outfit']">
                Study<span className="text-emerald-400">Naija</span>
              </span>
              <span className="text-[10px] text-emerald-300 font-bold ml-2 hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800">
                🇳🇬 2026/2027 JAMB & WAEC CBT
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleQuickDemoStudent}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>⚡ 1-Click Instant Scholar Access</span>
            </button>
            <div className="text-xs text-slate-400 font-medium hidden sm:flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Identity & Information Verification Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Student Membership Required</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-['Outfit'] tracking-tight leading-tight">
              Register to Enter Nigeria's <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">#1 CBT Portal</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              To prevent examination malpractice and maintain accurate student analytics, every candidate must register with valid student details before accessing our question bank.
            </p>

            {/* Benefits list */}
            <div className="space-y-3 pt-2 max-w-lg mx-auto lg:mx-0 text-left">
              {[
                {
                  icon: BookOpen,
                  title: '10-Question Smart Drills (No Repeats)',
                  desc: 'Comprehensive English, Math, Physics, Chemistry, Biology, Economics & Government past questions.'
                },
                {
                  icon: Clock,
                  title: 'JAMB & WAEC Timed CBT Mock Hall',
                  desc: 'Realistic 4-subject combination testing with automatic grading and full answer review.'
                },
                {
                  icon: TrendingUp,
                  title: 'Permanent Student Score History',
                  desc: 'Your performance analytics, average score, and weakest topics are automatically backed up.'
                }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xs">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[11px] text-slate-300 leading-normal mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-xs text-slate-400 italic max-w-md mx-auto lg:mx-0 border-t border-white/10">
              "Providing correct student info ensures your JAMB combinations and mock history are accurately calculated."
              <span className="block not-italic font-bold text-slate-300 text-[11px] mt-1">
                — StudyNaija Academic Advisory Board
              </span>
            </div>

          </div>

          {/* Right Column: High-Validation Form Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
              
              {/* REMEMBERED CREDENTIALS BANNER (If user previously logged in on this browser) */}
              {savedCreds && savedCreds.identifier && savedCreds.password && mode !== 'device-sync' && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold text-emerald-950 truncate">
                        Saved: {savedCreds.name || savedCreds.identifier}
                      </div>
                      <div className="text-[10px] text-emerald-700 truncate">
                        Remembered on this device
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleOneTapLogin}
                    disabled={loading}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl shrink-0 transition-all shadow-xs cursor-pointer"
                  >
                    1-Tap Sign In
                  </button>
                </div>
              )}

              {/* Form Title & Switcher */}
              <div className="text-center mb-5">
                <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] text-slate-900">
                  {mode === 'register' && 'Create Student Account'}
                  {mode === 'login' && 'Student Log In'}
                  {mode === 'device-sync' && 'New Phone Account Sync'}
                  {mode === 'recover' && 'Recover on New Phone'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {mode === 'register' && 'Register once to remember your account permanently on all phones'}
                  {mode === 'login' && 'Enter your phone number or email and password'}
                  {mode === 'device-sync' && 'Switched phones? Enter your 6-digit code to import your account'}
                  {mode === 'recover' && 'Set a new password using your verified phone or email'}
                </p>

                {/* 3 Main Action Tabs */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl mt-4 border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setServerError(null); setSubmitted(false); }}
                    className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      mode === 'register' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Register
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setServerError(null); setSubmitted(false); }}
                    className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      mode === 'login' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('device-sync'); setServerError(null); setSubmitted(false); }}
                    className={`py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      mode === 'device-sync' 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>New Phone</span>
                  </button>
                </div>
              </div>

              {/* STRICT ERROR ALERT BANNER: Shakes and alerts if info is wrong */}
              {serverError && (
                <div className="mb-4 p-3.5 bg-red-50 border-2 border-red-300 text-red-800 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-bold text-red-900">Information Rejected</div>
                    <div className="leading-relaxed text-[11px]">{serverError}</div>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-3.5">

                {/* -------------------------------------------------- */}
                {/* 1. DEVICE SYNC MODE (SWITCHING PHONES)             */}
                {/* -------------------------------------------------- */}
                {mode === 'device-sync' && (
                  <div className="space-y-4 py-2">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-800">
                        Enter 6-Digit Device Transfer Code
                      </h3>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        On your previous phone or computer, open your StudyNaija Dashboard and click <strong>"Switch Phone / Device Code"</strong> to generate your 6-digit sync code.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                        6-Digit Transfer Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={8}
                        placeholder="e.g. 584920"
                        value={syncCode}
                        onChange={e => { setSyncCode(e.target.value.toUpperCase()); if (serverError) setServerError(null); }}
                        className="w-full py-3 text-center text-xl font-black tracking-widest text-emerald-900 bg-slate-50 border-2 border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="text-[11px] text-slate-500 text-center">
                      Don't have your old phone?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-emerald-600 font-bold underline cursor-pointer"
                      >
                        Sign in with Phone Number & Password instead
                      </button>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------- */}
                {/* 2. RECOVER PASSWORD MODE                           */}
                {/* -------------------------------------------------- */}
                {mode === 'recover' && (
                  <div className="space-y-3.5 py-1">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-[11px] text-amber-900">
                      <strong>Forgot your password when changing phone?</strong> Enter your registered Nigerian phone number or email to set a new password and sign in immediately.
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Registered Phone Number or Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 08012345678 or student@gmail.com"
                        value={recoverIdentifier}
                        onChange={e => { setRecoverIdentifier(e.target.value); if (serverError) setServerError(null); }}
                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Set New Password (min 6 characters) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showRecoverPassword ? 'text' : 'password'}
                          placeholder="Enter your new password"
                          value={recoverPassword}
                          onChange={e => { setRecoverPassword(e.target.value); if (serverError) setServerError(null); }}
                          className="w-full pl-3 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRecoverPassword(!showRecoverPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showRecoverPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                      >
                        Back to Log In
                      </button>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------- */}
                {/* 3. REGISTER & LOGIN MODES                          */}
                {/* -------------------------------------------------- */}
                {(mode === 'register' || mode === 'login') && (
                  <>
                    {/* FULL NAME (Register only) */}
                    {mode === 'register' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Full Name (First & Last Name) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            autoComplete="name"
                            placeholder="e.g. Chioma Adebayo"
                            value={name}
                            onChange={e => { setName(e.target.value); if (serverError) setServerError(null); }}
                            onBlur={() => handleBlur('name')}
                            className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border transition-all focus:outline-none ${
                              (submitted || touched.name) && nameError
                                ? 'border-red-500 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-200'
                                : 'border-slate-300 bg-slate-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                            }`}
                          />
                        </div>
                        {(submitted || touched.name) && nameError && (
                          <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1 font-semibold">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{nameError}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* EMAIL ADDRESS OR PHONE */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {mode === 'register' ? 'Valid Email Address' : 'Nigerian Phone Number or Email Address'}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        {mode === 'register' ? (
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        ) : (
                          <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        )}
                        <input
                          type={mode === 'register' ? 'email' : 'text'}
                          autoComplete="username"
                          placeholder={mode === 'register' ? 'e.g. student@gmail.com' : 'e.g. 08012345678 or student@gmail.com'}
                          value={email}
                          onChange={e => { setEmail(e.target.value); if (serverError) setServerError(null); }}
                          onBlur={() => handleBlur('email')}
                          className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border transition-all focus:outline-none ${
                            (submitted || touched.email) && emailError
                              ? 'border-red-500 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-200'
                              : 'border-slate-300 bg-slate-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                          }`}
                        />
                      </div>
                      {(submitted || touched.email) && emailError && (
                        <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1 font-semibold">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{emailError}</span>
                        </p>
                      )}
                    </div>

                    {/* NIGERIAN PHONE NUMBER (Register only: allows easy login on other phones) */}
                    {mode === 'register' && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">
                            Nigerian Phone Number
                          </label>
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                            Recommended for changing phones
                          </span>
                        </div>
                        <div className="relative">
                          <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="tel"
                            autoComplete="tel"
                            placeholder="e.g. 08012345678"
                            value={phone}
                            onChange={e => { setPhone(e.target.value); if (serverError) setServerError(null); }}
                            onBlur={() => handleBlur('phone')}
                            className={`w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border transition-all focus:outline-none ${
                              (submitted || touched.phone) && phoneError
                                ? 'border-red-500 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-200'
                                : 'border-slate-300 bg-slate-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                            }`}
                          />
                        </div>
                        {(submitted || touched.phone) && phoneError ? (
                          <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1 font-semibold">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{phoneError}</span>
                          </p>
                        ) : (
                          <p className="mt-1 text-[10px] text-slate-500">
                            Allows instant 1-step login whenever you change or replace your phone.
                          </p>
                        )}
                      </div>
                    )}

                    {/* PASSWORD */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          Password (min 6 characters) <span className="text-red-500">*</span>
                        </label>
                        {mode === 'login' ? (
                          <button
                            type="button"
                            onClick={() => { setMode('recover'); setServerError(null); }}
                            className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold underline cursor-pointer"
                          >
                            Forgot on new phone?
                          </button>
                        ) : (
                          password.length > 0 && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              password.length < 6 
                                ? 'bg-red-100 text-red-700' 
                                : password.length < 9 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {password.length < 6 ? 'Too Short' : password.length < 9 ? 'Fair' : 'Strong'}
                            </span>
                          )
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                          placeholder="At least 6 characters"
                          value={password}
                          onChange={e => { setPassword(e.target.value); if (serverError) setServerError(null); }}
                          onBlur={() => handleBlur('password')}
                          className={`w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border transition-all focus:outline-none ${
                            (submitted || touched.password) && passwordError
                              ? 'border-red-500 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-200'
                              : 'border-slate-300 bg-slate-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {(submitted || touched.password) && passwordError && (
                        <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1 font-semibold">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{passwordError}</span>
                        </p>
                      )}
                    </div>

                    {/* CONFIRM PASSWORD (Register only) */}
                    {mode === 'register' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            placeholder="Re-type your password"
                            value={confirmPassword}
                            onChange={e => { setConfirmPassword(e.target.value); if (serverError) setServerError(null); }}
                            onBlur={() => handleBlur('confirmPassword')}
                            className={`w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border transition-all focus:outline-none ${
                              (submitted || touched.confirmPassword) && confirmPasswordError
                                ? 'border-red-500 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-200'
                                : 'border-slate-300 bg-slate-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {(submitted || touched.confirmPassword) && confirmPasswordError && (
                          <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1 font-semibold">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{confirmPasswordError}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* EDUCATION LEVEL (Mandatory) */}
                    {mode === 'register' && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-700">
                            Education Level <span className="text-red-500">*</span>
                          </label>
                          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            Locked after registration
                          </span>
                        </div>
                        <select
                          value={educationLevel}
                          onChange={e => {
                            const val = e.target.value as 'primary' | 'secondary' | 'university' | '';
                            setEducationLevel(val);
                            if (val === 'primary') setTargetExam('COMMON_ENTRANCE');
                            else if (val === 'university') setTargetExam('UNIVERSITY_GST');
                            else if (val === 'secondary') setTargetExam('JAMB');
                            if (serverError) setServerError(null);
                          }}
                          onBlur={() => handleBlur('educationLevel')}
                          className={`w-full px-3 py-2.5 text-xs rounded-xl border font-semibold transition-all focus:outline-none cursor-pointer ${
                            (submitted || touched.educationLevel) && educationLevelError
                              ? 'border-red-500 bg-red-50/30 text-red-900 focus:ring-2 focus:ring-red-200'
                              : 'border-slate-300 bg-slate-50/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800'
                          }`}
                        >
                          <option value="">-- Select Your Education Level (Mandatory) --</option>
                          <option value="primary">🏫 Primary School (Basic 1 - 6 / Common Entrance)</option>
                          <option value="secondary">🎓 Secondary School (JSS1 - SSS3 / WAEC / JAMB)</option>
                          <option value="university">🏛️ Higher Institution / University (Undergraduate & GST)</option>
                        </select>
                        {(submitted || touched.educationLevel) && educationLevelError ? (
                          <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1 font-semibold">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{educationLevelError}</span>
                          </p>
                        ) : (
                          <p className="mt-1 text-[10px] text-slate-500 leading-tight">
                            Your questions, subjects, and mock exams will be strictly based on what you choose here.
                          </p>
                        )}
                      </div>
                    )}

                    {/* TARGET EXAM & COURSE */}
                    {mode === 'register' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Primary Target Exam <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={targetExam}
                            onChange={e => setTargetExam(e.target.value as any)}
                            className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 cursor-pointer"
                          >
                            {educationLevel === 'primary' ? (
                              <option value="COMMON_ENTRANCE">National Common Entrance Exam (NCEE)</option>
                            ) : educationLevel === 'university' ? (
                              <option value="UNIVERSITY_GST">University GST & Faculty Exams</option>
                            ) : (
                              <>
                                <option value="JAMB">JAMB UTME (Tertiary Admission)</option>
                                <option value="WAEC">WAEC SSCE (Senior Secondary)</option>
                                <option value="BOTH">Both JAMB & WAEC</option>
                              </>
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {educationLevel === 'university'
                              ? 'Department & Institution (Optional)'
                              : educationLevel === 'primary'
                                ? 'Target Secondary School (Optional)'
                                : 'Target Course & University (Optional)'}
                          </label>
                          <input
                            type="text"
                            placeholder={
                              educationLevel === 'university'
                                ? 'e.g. Computer Science, UNILAG or Law, OAU'
                                : educationLevel === 'primary'
                                  ? 'e.g. King\'s College Lagos or Federal Government College'
                                  : 'e.g. Medicine, UNILAG or Law, UI'
                            }
                            value={targetCourse}
                            onChange={e => setTargetCourse(e.target.value)}
                            className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                          />
                        </div>
                      </>
                    )}

                    {/* REMEMBER LOGIN CREDENTIALS CHECKBOX */}
                    <div className="pt-1 pb-1">
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={e => setRememberMe(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer accent-emerald-600"
                        />
                        <div className="text-left">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>Remember my login credentials on this device</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">Active</span>
                          </span>
                          <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                            Keep me logged in permanently so I am never asked to log in every time I open the website.
                          </p>
                        </div>
                      </label>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>
                        {mode === 'register' && 'Verify Details & Remember Me'}
                        {mode === 'login' && 'Verify Credentials & Enter Portal'}
                        {mode === 'device-sync' && 'Verify 6-Digit Code & Sync Phone'}
                        {mode === 'recover' && 'Reset Password & Sign In'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Fast Verified Accounts */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center mb-2">
                  Pre-Verified 1-Click Test Access
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleQuickDemoStudent}
                    disabled={loading}
                    className="p-2.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1 group-hover:text-emerald-800">
                      <span>👨🏾‍🎓 Demo Student</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">student@studynaija.ng</div>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickDemoAdmin}
                    disabled={loading}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1 group-hover:text-slate-900">
                      <span>🔐 Site Admin</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">admin@studynaija.ng</div>
                  </button>
                </div>
              </div>

              {/* Security Statement */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>365-Day Session Memory • Cloud Multi-Device Sync</span>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-slate-950/70 px-4 sm:px-8 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 StudyNaija 🇳🇬 • Joint Admissions and Matriculation Board & WAEC CBT Prep</span>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Verified Student Access</span>
            <span>•</span>
            <span>Encrypted Credentials</span>
            <span>•</span>
            <span>Accredited 2026/2027 Prep</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
