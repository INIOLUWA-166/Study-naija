import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, CheckCircle2, Sparkles, KeyRound } from 'lucide-react';
import { api } from '../services/api';
import { User as UserType } from '../types';
import { aiVoice, getStudentFirstName, setStoredFirstName } from '../utils/aiVoice';
import { studentNotificationManager } from '../utils/studentNotificationManager';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: UserType) => void;
  onSuccess?: (user: UserType) => void;
  initialMode?: 'login' | 'signup' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, onSuccess, initialMode }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode === 'login' ? 'login' : 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [educationLevel, setEducationLevel] = useState<'primary' | 'secondary' | 'university' | ''>('');
  const [targetExam, setTargetExam] = useState<'JAMB' | 'WAEC' | 'BOTH' | 'COMMON_ENTRANCE' | 'UNIVERSITY_GST'>('JAMB');
  const [targetCourse, setTargetCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Strict validation
    if (mode === 'register') {
      if (!name.trim() || name.trim().length < 3) {
        setError('Please enter your full name (at least 3 characters).');
        return;
      }
      const parts = name.trim().split(/\s+/);
      if (parts.length < 2) {
        setError('Please enter both your first name and last name (e.g., Emeka Adeleke).');
        return;
      }
      if (!email.trim() || !emailRegex.test(email.trim().toLowerCase())) {
        setError('Please enter a valid email address (e.g., student@example.com).');
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (!educationLevel) {
        setError('You must choose your Education Level (Primary School, Secondary School, or Higher Institution) to proceed.');
        return;
      }
    } else {
      if (!email.trim() || !emailRegex.test(email.trim().toLowerCase())) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!password) {
        setError('Password is required.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email.trim().toLowerCase(), password);
        const firstName = getStudentFirstName(res.user?.name);
        if (firstName) {
          setStoredFirstName(firstName);
          setTimeout(() => {
            aiVoice.speakWelcomeGreeting(firstName);
          }, 300);
        }
        // Check for 24-hour inactivity upon student login
        studentNotificationManager.check24HourInactivity(res.user);
        if (res.user?.email) {
          const welcomeEmailKey = `studynaija_welcome_email_dispatched_${res.user.email.toLowerCase()}`;
          if (!localStorage.getItem(welcomeEmailKey)) {
            api.sendWelcomeEmail(res.user.email, res.user.name, res.user.targetExam).catch(() => {});
            localStorage.setItem(welcomeEmailKey, 'true');
          }
        }
        (onAuthSuccess || onSuccess)?.(res.user);
        onClose();
      } else {
        const res = await api.register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          educationLevel: educationLevel as 'primary' | 'secondary' | 'university',
          targetExam,
          targetCourse: targetCourse.trim()
        });
        const firstName = getStudentFirstName(res.user?.name || name);
        if (firstName) {
          setStoredFirstName(firstName);
          setTimeout(() => {
            aiVoice.speakWelcomeGreeting(firstName);
          }, 300);
        }
        // Send automatic welcome message & dispatch welcome email to new student
        studentNotificationManager.triggerSignupWelcome(res.user);
        if (res.user?.email) {
          const welcomeEmailKey = `studynaija_welcome_email_dispatched_${res.user.email.toLowerCase()}`;
          api.sendWelcomeEmail(res.user.email, res.user.name, res.user.targetExam).catch(() => {});
          localStorage.setItem(welcomeEmailKey, 'true');
        }
        (onAuthSuccess || onSuccess)?.(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Access Denied: Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoStudent = async () => {
    setEmail('student@studynaija.ng');
    setPassword('StudentPass123!');
    setLoading(true);
    setError(null);
    try {
      const res = await api.login('student@studynaija.ng', 'StudentPass123!');
      const firstName = getStudentFirstName(res.user?.name);
      if (firstName) {
        setStoredFirstName(firstName);
        setTimeout(() => {
          aiVoice.speakWelcomeGreeting(firstName);
        }, 300);
      }
      (onAuthSuccess || onSuccess)?.(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to demo login');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoAdmin = async () => {
    setEmail('admin@studynaija.ng');
    setPassword('AdminPass123!');
    setLoading(true);
    setError(null);
    try {
      const res = await api.login('admin@studynaija.ng', 'AdminPass123!');
      const firstName = getStudentFirstName(res.user?.name);
      if (firstName) {
        setStoredFirstName(firstName);
        setTimeout(() => {
          aiVoice.speakWelcomeGreeting(firstName);
        }, 300);
      }
      (onAuthSuccess || onSuccess)?.(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to demo login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="auth-modal-card"
        className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-['Outfit']">
            {mode === 'login' ? 'Welcome to StudyNaija' : 'Create Student Account'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'Access your saved scores, mock results, and practice streak.'
              : 'Join thousands of Nigerian candidates preparing for 300+ scores.'}
          </p>
        </div>

        {/* Switch Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Free Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aminat Bello or Emeka Nwosu"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="student@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">🔒 Encrypted securely with salted bcrypt on the server.</p>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Education Level <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Locked to Profile
                  </span>
                </div>
                <select
                  required
                  value={educationLevel}
                  onChange={e => {
                    const val = e.target.value as 'primary' | 'secondary' | 'university' | '';
                    setEducationLevel(val);
                    if (val === 'primary') setTargetExam('COMMON_ENTRANCE');
                    else if (val === 'university') setTargetExam('UNIVERSITY_GST');
                    else if (val === 'secondary') setTargetExam('JAMB');
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 cursor-pointer"
                >
                  <option value="">-- Choose Your Level (Mandatory) --</option>
                  <option value="primary">🏫 Primary School (Basic 1 - 6 / Common Entrance)</option>
                  <option value="secondary">🎓 Secondary School (JSS1 - SSS3 / WAEC / JAMB)</option>
                  <option value="university">🏛️ Higher Institution / University (Undergraduate & GST)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Questions and curriculum are strictly tailored based on this level.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Exam</label>
                <select
                  value={targetExam}
                  onChange={e => setTargetExam(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {educationLevel === 'primary' ? (
                    <option value="COMMON_ENTRANCE">National Common Entrance Exam (NCEE)</option>
                  ) : educationLevel === 'university' ? (
                    <option value="UNIVERSITY_GST">University GST & Faculty Exams</option>
                  ) : (
                    <>
                      <option value="JAMB">JAMB UTME (University / Poly)</option>
                      <option value="WAEC">WAEC SSCE (Senior Secondary)</option>
                      <option value="BOTH">Both JAMB & WAEC</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {educationLevel === 'university'
                    ? 'Department & University (Optional)'
                    : educationLevel === 'primary'
                      ? 'Target Secondary School (Optional)'
                      : 'Target Course & University (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={
                    educationLevel === 'university'
                      ? 'e.g. Computer Science, UNILAG'
                      : educationLevel === 'primary'
                        ? 'e.g. King\'s College Lagos'
                        : 'e.g. Pharmacy, UI or Accounting, UNILAG'
                  }
                  value={targetCourse}
                  onChange={e => setTargetCourse(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{mode === 'login' ? 'Sign In to StudyNaija' : 'Complete Registration'}</span>
            )}
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="mt-5 pt-4 border-t border-slate-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
            Quick 1-Click Demo Accounts
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickDemoStudent}
              className="px-2.5 py-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-left transition-all"
            >
              <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                <span>👨🏾‍🎓 Demo Student</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">student@studynaija.ng</div>
            </button>
            <button
              type="button"
              onClick={handleQuickDemoAdmin}
              className="px-2.5 py-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-left transition-all"
            >
              <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                <span>🔐 Site Admin</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">admin@studynaija.ng</div>
            </button>
          </div>
        </div>

        {/* Security badge note */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Server-verified security • Passwords salted & hashed</span>
        </div>
      </div>
    </div>
  );
};
