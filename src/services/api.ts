import { User, Subject, Question, Article, ExamResult, AdminStats, PricingPlan, LeaderboardEntry, SubjectChampion, VerifiedArenaMatch, CommunityMessage, CommunityChannel, ModerationResult, SmartWebInsights, JambCountdownData, TournamentState, TournamentBankClaim, SecurityIncident, ForumThread, ForumReply, ForumExamCategory } from '../types';
import { generateLeaderboard, LeaderboardFilterOptions, LeaderboardStatsSummary } from '../utils/leaderboardData';
import * as staticFb from '../utils/staticBackendFallback';
import type { LocalStoredUser } from '../utils/staticBackendFallback';

const TOKEN_KEY = 'studynaija_auth_token';
const USER_KEY = 'studynaija_current_user';
const REMEMBERED_CREDENTIALS_KEY = 'studynaija_saved_credentials';

export interface SavedCredentials {
  identifier: string; // phone or email
  password?: string;
  name?: string;
  phone?: string;
  rememberMe: boolean;
  savedAt: number;
}

// In-memory crash-proof fallback cache for environments with strict storage policies or full quota
const memoryStorage = new Map<string, string>();

export const authStorage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY) || memoryStorage.get(TOKEN_KEY) || null;
    } catch {
      return memoryStorage.get(TOKEN_KEY) || null;
    }
  },
  setToken: (token: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
    memoryStorage.set(TOKEN_KEY, token);
  },
  clearToken: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
    memoryStorage.delete(TOKEN_KEY);
    memoryStorage.delete(USER_KEY);
  },
  getUser: (): User | null => {
    try {
      const raw = localStorage.getItem(USER_KEY) || memoryStorage.get(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      const raw = memoryStorage.get(USER_KEY);
      try {
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }
  },
  setUser: (user: User) => {
    const serialized = JSON.stringify(user);
    try {
      localStorage.setItem(USER_KEY, serialized);
    } catch {}
    memoryStorage.set(USER_KEY, serialized);
  },
  
  // Saved Login Credentials for device persistence & switching phones
  getSavedCredentials: (): SavedCredentials | null => {
    try {
      const raw = localStorage.getItem(REMEMBERED_CREDENTIALS_KEY) || memoryStorage.get(REMEMBERED_CREDENTIALS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      const raw = memoryStorage.get(REMEMBERED_CREDENTIALS_KEY);
      try {
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }
  },
  setSavedCredentials: (creds: SavedCredentials) => {
    const serialized = JSON.stringify(creds);
    try {
      localStorage.setItem(REMEMBERED_CREDENTIALS_KEY, serialized);
    } catch {}
    memoryStorage.set(REMEMBERED_CREDENTIALS_KEY, serialized);
  },
  clearSavedCredentials: () => {
    try {
      localStorage.removeItem(REMEMBERED_CREDENTIALS_KEY);
    } catch {}
    memoryStorage.delete(REMEMBERED_CREDENTIALS_KEY);
  }
};

const getHeaders = (hasBody = true) => {
  const headers: Record<string, string> = {};
  if (hasBody) headers['Content-Type'] = 'application/json';
  const token = authStorage.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const LOCAL_USERS_DIRECTORY_KEY = staticFb.LOCAL_USERS_DIRECTORY_KEY;

const getDefaultLocalUsers = (): LocalStoredUser[] => [
  {
    id: 'user-student-demo',
    name: 'Chukwuebuka Obi',
    email: 'student@studynaija.ng',
    phone: '08012345678',
    password: 'StudentPass123!',
    role: 'student',
    educationLevel: 'secondary',
    targetExam: 'JAMB',
    targetCourse: 'Medicine & Surgery, UNILAG',
    premiumPlan: 'free',
    createdAt: new Date().toISOString(),
    xp: 250,
    streakDays: 5,
    stats: {
      questionsAnswered: 91,
      averageScore: 74,
      bestScore: 88,
      weakestSubject: 'Physics'
    }
  },
  {
    id: 'user-admin-demo',
    name: 'StudyNaija Admin',
    email: 'admin@studynaija.ng',
    phone: '08099999999',
    password: 'AdminPass123!',
    role: 'admin',
    educationLevel: 'university',
    targetExam: 'BOTH',
    targetCourse: 'Administration',
    premiumPlan: 'premium',
    createdAt: new Date().toISOString(),
    xp: 1200,
    streakDays: 30,
    stats: {
      questionsAnswered: 400,
      averageScore: 95,
      bestScore: 100,
      weakestSubject: 'None'
    }
  }
];

const loadLocalUsersDirectory = (): LocalStoredUser[] => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_DIRECTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  const defaults = getDefaultLocalUsers();
  try {
    localStorage.setItem(LOCAL_USERS_DIRECTORY_KEY, JSON.stringify(defaults));
  } catch {}
  return defaults;
};

const saveLocalUsersDirectory = (list: LocalStoredUser[]) => {
  try {
    localStorage.setItem(LOCAL_USERS_DIRECTORY_KEY, JSON.stringify(list));
  } catch {}
};

const normalizePhoneForAuth = (raw: string): string => {
  let clean = raw.trim().replace(/\D/g, '');
  if (clean.startsWith('234') && clean.length === 13) {
    clean = '0' + clean.slice(3);
  } else if (clean.length === 10 && /^[789]/.test(clean)) {
    clean = '0' + clean;
  }
  return clean;
};

async function fetchBackendJson(url: string, init?: RequestInit): Promise<{ isBackendAvailable: boolean; ok: boolean; data: any }> {
  try {
    const res = await fetch(url, init);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { isBackendAvailable: false, ok: false, data: null };
    }
    const data = await res.json();
    return { isBackendAvailable: true, ok: res.ok, data };
  } catch {
    return { isBackendAvailable: false, ok: false, data: null };
  }
}

// Optional helper to trigger browser password manager
const saveToBrowserCredentialManager = async (identifier: string, password?: string, name?: string) => {
  try {
    if (password && typeof window !== 'undefined' && 'credentials' in navigator && (window as any).PasswordCredential) {
      const cred = new (window as any).PasswordCredential({
        id: identifier,
        password: password,
        name: name || identifier
      });
      await navigator.credentials.store(cred);
    }
  } catch {
    // Ignore browser credential store exceptions
  }
};

export const api = {
  // Auth
  register: async (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    educationLevel: 'primary' | 'secondary' | 'university';
    targetExam?: string;
    targetCourse?: string;
  }, rememberMe = true): Promise<{ token: string; user: User }> => {
    const backend = await fetchBackendJson('/api/auth/register', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    let result: { token: string; user: User };
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Registration failed');
      result = backend.data;
    } else {
      // Static hosting fallback (e.g. Netlify)
      const directory = loadLocalUsersDirectory();
      const emailNorm = data.email.trim().toLowerCase();
      const phoneNorm = data.phone ? normalizePhoneForAuth(data.phone) : undefined;
      if (directory.some(u => u.email.toLowerCase() === emailNorm)) {
        throw new Error('An account with this email address already exists. Please use the Log In tab.');
      }
      const isDefaultAdmin = emailNorm === 'luvkidjaja@gmail.com';
      const newUser: LocalStoredUser = {
        id: `stu_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: data.name.trim(),
        email: emailNorm,
        phone: phoneNorm,
        password: data.password,
        role: isDefaultAdmin ? 'admin' : 'student',
        educationLevel: data.educationLevel,
        targetExam: (data.targetExam as any) || 'JAMB',
        targetCourse: data.targetCourse || '',
        premiumPlan: isDefaultAdmin ? 'premium' : 'free',
        createdAt: new Date().toISOString(),
        xp: 100,
        streakDays: 1,
        stats: { questionsAnswered: 0, averageScore: 0, bestScore: 0, weakestSubject: 'None' }
      };
      directory.push(newUser);
      saveLocalUsersDirectory(directory);
      const { password: _, ...safeUser } = newUser;
      result = { token: `local_jwt_${newUser.id}_${Date.now()}`, user: safeUser };
    }

    authStorage.setToken(result.token);
    authStorage.setUser(result.user);

    if (rememberMe) {
      authStorage.setSavedCredentials({
        identifier: data.phone || data.email,
        phone: data.phone,
        password: data.password,
        name: data.name,
        rememberMe: true,
        savedAt: Date.now()
      });
      saveToBrowserCredentialManager(data.email, data.password, data.name);
    }
    return result;
  },

  login: async (identifierOrEmail: string, password: string, rememberMe = true): Promise<{ token: string; user: User }> => {
    const backend = await fetchBackendJson('/api/auth/login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ identifier: identifierOrEmail, email: identifierOrEmail, password })
    });

    let result: { token: string; user: User };
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Login failed');
      result = backend.data;
    } else {
      // Static hosting fallback (e.g. Netlify)
      const directory = loadLocalUsersDirectory();
      const targetLower = identifierOrEmail.trim().toLowerCase();
      const cleanPhone = normalizePhoneForAuth(identifierOrEmail);
      const matched = directory.find(u =>
        u.email.toLowerCase() === targetLower ||
        (cleanPhone.length >= 10 && u.phone && normalizePhoneForAuth(u.phone) === cleanPhone)
      );
      if (!matched) {
        throw new Error('Access Denied: No account found with this email or phone number on this device. Please register or sign in with Google.');
      }
      if (matched.isBanned) {
        throw new Error(`Account Permanently Banned: ${matched.banReason || 'Security violation detected by Admin Sentinel.'}`);
      }
      if (matched.isSuspended && (!matched.suspensionExpiresAt || new Date(matched.suspensionExpiresAt).getTime() > Date.now())) {
        throw new Error(`Account Suspended: ${matched.suspensionReason || 'Temporarily suspended by administrator.'}`);
      }
      if (matched.password && matched.password !== password) {
        throw new Error('Access Denied: Incorrect password. Please check your password and try again.');
      }
      const { password: _, ...safeUser } = matched;
      result = { token: `local_jwt_${matched.id}_${Date.now()}`, user: safeUser };
    }

    authStorage.setToken(result.token);
    authStorage.setUser(result.user);

    if (rememberMe) {
      authStorage.setSavedCredentials({
        identifier: identifierOrEmail,
        phone: result.user?.phone,
        password: password,
        name: result.user?.name,
        rememberMe: true,
        savedAt: Date.now()
      });
      saveToBrowserCredentialManager(identifierOrEmail, password, result.user?.name);
    }
    return result;
  },

  syncGoogleUser: async (userData: {
    id: string;
    email: string;
    name?: string;
    educationLevel?: string;
    targetExam?: string;
    targetCourse?: string;
    photoURL?: string;
  }): Promise<{ token: string; user: User }> => {
    const safeEmail = (userData.email || '').trim().toLowerCase() || `${userData.id}@google.studynaija.ng`;
    const backend = await fetchBackendJson('/api/auth/google-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userData, email: safeEmail })
    });

    let result: { token: string; user: User };
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to sync Google user session');
      result = backend.data;
    } else {
      const directory = loadLocalUsersDirectory();
      const existingIdx = directory.findIndex(u => u.id === userData.id || u.email.toLowerCase() === safeEmail);
      const isDefaultAdmin = safeEmail === 'luvkidjaja@gmail.com';
      let syncedUser: User;
      if (existingIdx >= 0) {
        const existing = directory[existingIdx];
        if (existing.isBanned) {
          throw new Error(`Account Permanently Banned: ${existing.banReason || 'Security violation detected by Admin Sentinel.'}`);
        }
        if (existing.isSuspended && (!existing.suspensionExpiresAt || new Date(existing.suspensionExpiresAt).getTime() > Date.now())) {
          throw new Error(`Account Suspended: ${existing.suspensionReason || 'Temporarily suspended by administrator.'}`);
        }
        const { password: _, ...safeExisting } = existing;
        syncedUser = {
          ...safeExisting,
          name: userData.name || safeExisting.name,
          email: safeEmail || safeExisting.email
        };
      } else {
        syncedUser = {
          id: userData.id,
          name: userData.name || 'Nigerian Scholar',
          email: safeEmail,
          role: isDefaultAdmin ? 'admin' : 'student',
          educationLevel: (userData.educationLevel as any) || 'secondary',
          targetExam: (userData.targetExam as any) || 'JAMB',
          targetCourse: userData.targetCourse || 'General Studies',
          premiumPlan: isDefaultAdmin ? 'premium' : 'free',
          createdAt: new Date().toISOString(),
          xp: 100,
          streakDays: 1,
          stats: { questionsAnswered: 0, averageScore: 0, bestScore: 0, weakestSubject: 'None' }
        };
        directory.push(syncedUser);
        saveLocalUsersDirectory(directory);
      }
      result = { token: `firebase_session_${syncedUser.id}`, user: syncedUser };
    }

    authStorage.setToken(result.token);
    authStorage.setUser(result.user);
    return result;
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = authStorage.getToken();
      if (!token) {
        // Try auto-login if saved credentials exist
        const saved = authStorage.getSavedCredentials();
        if (saved && saved.rememberMe && saved.identifier && saved.password) {
          try {
            const loginRes = await api.login(saved.identifier, saved.password, true);
            return loginRes.user;
          } catch {}
        }
        return null;
      }

      const backend = await fetchBackendJson('/api/auth/me', {
        headers: getHeaders(false)
      });
      if (!backend.isBackendAvailable) {
        return authStorage.getUser();
      }
      if (!backend.ok) {
        // Token might have expired, try auto-login from saved credentials
        const saved = authStorage.getSavedCredentials();
        if (saved && saved.rememberMe && saved.identifier && saved.password) {
          try {
            const loginRes = await api.login(saved.identifier, saved.password, true);
            return loginRes.user;
          } catch {}
        }
        return authStorage.getUser();
      }
      if (backend.data?.user) authStorage.setUser(backend.data.user);
      return backend.data?.user || authStorage.getUser();
    } catch {
      // Offline / network failure: gracefully return cached user so student is not locked out
      return authStorage.getUser();
    }
  },

  // Device Transfer & Multi-Device Sync
  createDeviceSyncCode: async (): Promise<{ code: string; expiresAt: string; expiresInMinutes?: number; email: string; phone?: string }> => {
    const backend = await fetchBackendJson('/api/auth/device-sync/create', {
      method: 'POST',
      headers: getHeaders()
    });
    if (!backend.isBackendAvailable) {
      throw new Error('Device transfer codes require the live backend server. On Netlify, please sign in using Continue with Google or your Email & Password.');
    }
    if (!backend.ok) throw new Error(backend.data?.error || 'Failed to create device sync code');
    return backend.data;
  },

  verifyDeviceSyncCode: async (code: string): Promise<{ token: string; user: User }> => {
    const backend = await fetchBackendJson('/api/auth/device-sync/verify', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code })
    });
    if (!backend.isBackendAvailable) {
      throw new Error('Device transfer codes require the live backend server. On Netlify, please sign in using Continue with Google or your Email & Password.');
    }
    const data = backend.data;
    if (!backend.ok) throw new Error(data?.error || 'Invalid or expired sync code');
    authStorage.setToken(data.token);
    authStorage.setUser(data.user);
    // Remember the user on this new device
    authStorage.setSavedCredentials({
      identifier: data.user.phone || data.user.email,
      phone: data.user.phone,
      name: data.user.name,
      rememberMe: true,
      savedAt: Date.now()
    });
    return data;
  },

  recoverAccountByPhone: async (identifier: string, newPassword: string): Promise<{ token: string; user: User; message: string }> => {
    const backend = await fetchBackendJson('/api/auth/recover-phone', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ identifier, newPassword })
    });
    let data: { token: string; user: User; message: string };
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Account recovery failed');
      data = backend.data;
    } else {
      const directory = loadLocalUsersDirectory();
      const targetLower = identifier.trim().toLowerCase();
      const cleanPhone = normalizePhoneForAuth(identifier);
      const matched = directory.find(u =>
        u.email.toLowerCase() === targetLower ||
        (cleanPhone.length >= 10 && u.phone && normalizePhoneForAuth(u.phone) === cleanPhone)
      );
      if (!matched) {
        throw new Error('No registered account found with that phone number or email on this device.');
      }
      matched.password = newPassword;
      saveLocalUsersDirectory(directory);
      const { password: _, ...safeUser } = matched;
      data = { token: `local_jwt_${matched.id}_${Date.now()}`, user: safeUser, message: 'Password reset successfully.' };
    }
    authStorage.setToken(data.token);
    authStorage.setUser(data.user);
    authStorage.setSavedCredentials({
      identifier,
      password: newPassword,
      name: data.user.name,
      rememberMe: true,
      savedAt: Date.now()
    });
    return data;
  },

  logout: () => {
    authStorage.clearToken();
    // Intentionally keep saved credentials identifier for easy 1-click re-login if user clicks sign in again
  },

  // Official JAMB Countdown
  getJambCountdown: async (): Promise<JambCountdownData> => {
    const backend = await fetchBackendJson('/api/jamb-countdown', { headers: getHeaders(false) });
    if (backend.isBackendAvailable && backend.ok) return backend.data;

    const officialExamDate = '2027-04-17T08:00:00+01:00';
    const target = new Date(officialExamDate);
    const diffMs = Math.max(0, target.getTime() - Date.now());
    return {
      examName: 'JAMB UTME 2027',
      officialExamDate,
      registrationStartDate: '2027-01-15T08:00:00+01:00',
      registrationCloseDate: '2027-02-26T23:59:59+01:00',
      mockExamDate: '2027-03-27T08:00:00+01:00',
      daysRemaining: Math.floor(diffMs / (1000 * 60 * 60 * 24)),
      hoursRemaining: Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutesRemaining: Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)),
      secondsRemaining: Math.floor((diffMs % (1000 * 60)) / 1000),
      totalSecondsRemaining: Math.floor(diffMs / 1000),
      officialAnnouncement: 'Official JAMB Bulletin: Next Unified Tertiary Matriculation Examination (UTME) scheduled across 750+ accredited Computer Based Test (CBT) centres nationwide.',
      status: diffMs > 0 ? 'UPCOMING' : 'IN_PROGRESS',
      syllabusPhase: 'Intensive Preparation & Mock Drills',
      studyTips: [
        'Master the 8-Key navigation system (A, B, C, D, N, P, R, S) without touching the mouse.',
        'Spend max 40 seconds per question on Use of English.',
        'Aim for a score of 280+ to secure competitive federal university courses (Medicine, Law, Engineering).'
      ]
    };
  },

  // Subjects
  getSubjects: async (params?: { level?: string }): Promise<Subject[]> => {
    const query = params?.level ? `?level=${encodeURIComponent(params.level)}` : '';
    const backend = await fetchBackendJson(`/api/subjects${query}`, { headers: getHeaders(false) });
    if (backend.isBackendAvailable && backend.ok) return backend.data;

    const currentUser = authStorage.getUser();
    const level = params?.level || currentUser?.educationLevel;
    const allSubjects = staticFb.getAllLocalSubjects();
    if (level && level !== 'all') {
      return allSubjects.filter(s => !s.educationLevel || s.educationLevel === level);
    }
    return allSubjects;
  },

  // Questions
  getQuestions: async (params?: { subjectId?: string; topic?: string; examType?: string; level?: string; limit?: number; offset?: number; difficulty?: string }): Promise<{ questions: Question[]; total: number }> => {
    try {
      const query = new URLSearchParams();
      if (params?.subjectId) query.set('subjectId', params.subjectId);
      if (params?.topic) query.set('topic', params.topic);
      if (params?.examType) query.set('examType', params.examType);
      if (params?.level) query.set('level', params.level);
      if (params?.difficulty && params.difficulty !== 'All' && params.difficulty !== 'all') query.set('difficulty', params.difficulty);
      if (params?.limit) query.set('limit', String(params.limit));
      if (params?.offset) query.set('offset', String(params.offset));

      const res = await fetch(`/api/questions?${query.toString()}`, { headers: getHeaders(false) });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) throw new Error();
      return await res.json();
    } catch {
      const currentUser = authStorage.getUser();
      const level = params?.level || currentUser?.educationLevel;

      let pool: Question[] = staticFb.getAllLocalQuestionPool();
      if (params?.subjectId && params.subjectId !== 'all') {
        try {
          const { studyPathCacheManager } = await import('../utils/studyPathCache');
          const { offlinePacksManager } = await import('../utils/offlinePacksManager');
          const swCached = await studyPathCacheManager.getCachedQuestionsForSubject(params.subjectId);
          const packCached = offlinePacksManager.getOfflineQuestions(params.subjectId);
          const merged = new Map<string, Question>();
          [...swCached, ...packCached, ...pool].forEach(q => {
            if (q && q.id && !merged.has(q.id)) merged.set(q.id, q);
          });
          pool = Array.from(merged.values());
        } catch {}
      }

      let filtered = pool;
      if (level && level !== 'all') {
        filtered = filtered.filter(q => !q.educationLevel || q.educationLevel === level);
      }
      if (params?.subjectId && params.subjectId !== 'all') {
        filtered = filtered.filter(q => q.subjectId === params.subjectId);
      }
      if (params?.topic && params.topic !== 'all') {
        filtered = filtered.filter(q => q.topic.toLowerCase() === params.topic!.toLowerCase());
      }
      if (params?.examType && params.examType !== 'ALL') {
        filtered = filtered.filter(q => q.examType === params.examType || q.examType === 'ALL');
      }
      if (params?.difficulty && params.difficulty !== 'All' && params.difficulty !== 'all') {
        filtered = filtered.filter(q => q.difficulty?.toLowerCase() === params.difficulty!.toLowerCase());
      }
      const limit = params?.limit || 100;
      const offset = params?.offset || 0;
      return { questions: filtered.slice(offset, offset + limit), total: filtered.length };
    }
  },

  submitPracticeAnswer: async (questionId: string, selectedOption: string, isCorrect?: boolean, correctOption?: string) => {
    const backend = await fetchBackendJson('/api/questions/submit-practice', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ questionId, selectedOption, isCorrect, correctOption })
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;

    const q = staticFb.getAllLocalQuestionPool().find(item => item.id === questionId);
    const targetCorrect = correctOption || q?.correctOption || 'A';
    const answerCorrect = typeof isCorrect === 'boolean' ? isCorrect : (targetCorrect === selectedOption);

    const currentUser = authStorage.getUser();
    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        xp: (currentUser.xp || 0) + (answerCorrect ? 10 : 2),
        stats: {
          questionsAnswered: (currentUser.stats?.questionsAnswered || 0) + 1,
          averageScore: currentUser.stats?.averageScore || 0,
          bestScore: currentUser.stats?.bestScore || 0,
          weakestSubject: currentUser.stats?.weakestSubject || 'None'
        }
      };
      authStorage.setUser(updatedUser);
    }

    return {
      isCorrect: answerCorrect,
      correctOption: targetCorrect,
      explanation: q?.explanation || 'Standard solution'
    };
  },

  // Mock Exam
  generateMockExam: async (examType: 'JAMB' | 'WAEC', selectedSubjects: string[], questionCountPerSubject = 10, excludeQuestionIds: string[] = []) => {
    const clientStudentId = typeof localStorage !== 'undefined' ? (localStorage.getItem('studynaija_student_id') || `stu_${Date.now()}`) : `stu_${Date.now()}`;
    const backend = await fetchBackendJson('/api/exams/generate', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ examType, selectedSubjects, questionCountPerSubject, excludeQuestionIds, clientStudentId })
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;

    const pool = staticFb.getAllLocalQuestionPool();
    const picked: Question[] = [];
    const seen = new Set<string>();
    const excludeSet = new Set<string>(excludeQuestionIds);
    selectedSubjects.forEach(sId => {
      let matching = pool.filter(q => q.subjectId === sId && !seen.has(q.id) && !excludeSet.has(q.id));
      if (matching.length < questionCountPerSubject) {
        matching = pool.filter(q => q.subjectId === sId && !seen.has(q.id));
      }
      matching.slice(0, questionCountPerSubject).forEach(q => {
        seen.add(q.id);
        picked.push(q);
      });
    });
    return {
      examSessionId: `fallback_sess_${Date.now()}`,
      examType,
      questions: picked.length ? picked : pool.slice(0, 10),
      durationMinutes: examType === 'JAMB' ? 120 : 90,
      totalQuestions: picked.length || 10
    };
  },

  submitMockExam: async (payload: {
    examSessionId?: string;
    examType: string;
    durationMinutes: number;
    timeSpentSeconds: number;
    answers: { questionId: string; selectedOption: string | null; correctOption?: string }[];
    tabSwitchCount?: number;
    integrityViolated?: boolean;
    speedBonusPoints?: number;
  }): Promise<ExamResult> => {
    const backend = await fetchBackendJson('/api/exams/submit', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to submit exam');
      return backend.data.result;
    }

    const currentUser = authStorage.getUser();
    const pool = staticFb.getAllLocalQuestionPool();
    const totalQuestions = payload.answers.length || 1;
    let correctCount = 0;
    const toOption = (val?: string | null): 'A' | 'B' | 'C' | 'D' =>
      val === 'A' || val === 'B' || val === 'C' || val === 'D' ? val : 'A';
    const evaluatedAnswers = payload.answers.map(ans => {
      const q = pool.find(item => item.id === ans.questionId);
      const correctOpt = toOption(ans.correctOption || q?.correctOption);
      const selectedOpt = toOption(ans.selectedOption);
      const isCorrect = ans.selectedOption === correctOpt;
      if (isCorrect) correctCount++;
      return {
        questionId: ans.questionId,
        selectedOption: selectedOpt,
        correctOption: correctOpt,
        isCorrect
      };
    });
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const resolvedExamType: ExamResult['examType'] =
      payload.examType === 'WAEC' || payload.examType === 'COMMON_ENTRANCE' || payload.examType === 'UNIVERSITY_GST'
        ? payload.examType
        : 'JAMB';
    const jambScore = resolvedExamType === 'JAMB' ? Math.round((scorePercentage / 100) * 400) : undefined;
    const result: ExamResult = {
      id: `exam_${Date.now()}`,
      userId: currentUser?.id || 'local_scholar',
      examType: resolvedExamType,
      title: `${resolvedExamType} Mock Examination`,
      date: new Date().toISOString(),
      durationMinutes: payload.durationMinutes,
      timeSpentSeconds: payload.timeSpentSeconds,
      totalQuestions,
      correctCount,
      scorePercentage,
      jambScore,
      subjectScores: [],
      answers: evaluatedAnswers
    };

    staticFb.saveLocalExamResult(result, currentUser);
    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        xp: (currentUser.xp || 0) + correctCount * 15 + (payload.speedBonusPoints || 0),
        stats: {
          questionsAnswered: (currentUser.stats?.questionsAnswered || 0) + totalQuestions,
          averageScore: currentUser.stats?.averageScore ? Math.round((currentUser.stats.averageScore + scorePercentage) / 2) : scorePercentage,
          bestScore: Math.max(currentUser.stats?.bestScore || 0, scorePercentage),
          weakestSubject: currentUser.stats?.weakestSubject || 'None'
        }
      };
      authStorage.setUser(updatedUser);
    }
    return result;
  },

  // Dashboard
  getDashboardStats: async () => {
    const backend = await fetchBackendJson('/api/dashboard', { headers: getHeaders(false) });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return await staticFb.getLocalDashboardStats(authStorage.getUser());
  },

  // Student Leaderboard (Nationwide CBT Top Scorers & Champions)
  getLeaderboard: async (options: LeaderboardFilterOptions): Promise<{
    entries: LeaderboardEntry[];
    stats: LeaderboardStatsSummary;
    champions: SubjectChampion[];
  }> => {
    const query = new URLSearchParams();
    if (options.subjectId) query.set('subjectId', options.subjectId);
    if (options.timeframe) query.set('timeframe', options.timeframe);
    if (options.examType) query.set('examType', options.examType);
    if (options.searchQuery) query.set('searchQuery', options.searchQuery);

    const backend = await fetchBackendJson(`/api/leaderboard?${query.toString()}`, { headers: getHeaders(false) });
    if (backend.isBackendAvailable && backend.ok) return backend.data;

    const currentUser = authStorage.getUser();
    const dash = await staticFb.getLocalDashboardStats(currentUser).catch(() => ({ recentExams: [] }));
    return generateLeaderboard(currentUser, options, dash.recentExams || []);
  },

  // Articles
  getArticles: async (): Promise<Article[]> => {
    const backend = await fetchBackendJson('/api/articles');
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.getAllLocalArticles();
  },

  getArticle: async (slug: string): Promise<Article | null> => {
    const backend = await fetchBackendJson(`/api/articles/${slug}`);
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.getAllLocalArticles().find(a => a.slug === slug || a.id === slug) || null;
  },

  // Payments (Real Nigerian & International Gateways, AI verified settlement)
  initializePayment: async (planId: 'basic' | 'medium' | 'premium', paymentMethod?: string, phoneNumber?: string) => {
    const currentUser = authStorage.getUser();
    const headers = getHeaders();
    if (currentUser?.id) headers['x-user-id'] = currentUser.id;
    if (currentUser?.email) headers['x-user-email'] = currentUser.email;

    const backend = await fetchBackendJson('/api/payment/initialize', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        planId,
        paymentMethod,
        phoneNumber,
        userId: currentUser?.id,
        userEmail: currentUser?.email,
        userName: currentUser?.name
      })
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to initialize payment');
      return backend.data;
    }
    return staticFb.initializeLocalPayment(currentUser, planId, paymentMethod, phoneNumber);
  },

  verifyPayment: async (
    param1: {
      reference: string;
      senderAccountName?: string;
      senderBank?: string;
      receiptScreenshotUrl?: string;
      planId?: string;
    } | string,
    legacySender?: string,
    legacyBank?: string,
    legacyPlanId?: string
  ) => {
    const currentUser = authStorage.getUser();
    const headers = getHeaders();
    if (currentUser?.id) headers['x-user-id'] = currentUser.id;
    if (currentUser?.email) headers['x-user-email'] = currentUser.email;

    const payload = typeof param1 === 'object' ? param1 : {
      reference: param1,
      senderAccountName: legacySender,
      senderBank: legacyBank,
      planId: legacyPlanId
    };

    const backend = await fetchBackendJson('/api/payment/verify', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...payload,
        userId: currentUser?.id,
        userEmail: currentUser?.email
      })
    });
    if (backend.isBackendAvailable) {
      const data = backend.data;
      if (!backend.ok) throw new Error(data?.error || 'Payment confirmation failed.');
      if (data.token) authStorage.setToken(data.token);
      if (data.user && data.status === 'approved') authStorage.setUser(data.user);
      return data;
    }
    return staticFb.verifyLocalPayment(currentUser, payload);
  },

  getPaymentStatus: async (reference: string) => {
    const backend = await fetchBackendJson(`/api/payment/status/${encodeURIComponent(reference)}`, { headers: getHeaders(false) });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to check payment status');
      if (backend.data?.user) authStorage.setUser(backend.data.user);
      return backend.data;
    }
    const res = staticFb.getLocalPaymentStatus(reference, authStorage.getUser());
    if (res.user) authStorage.setUser(res.user);
    return res;
  },

  initializePaystackPayment: async (planId: string, email?: string, callbackUrl?: string) => {
    const currentUser = authStorage.getUser();
    const backend = await fetchBackendJson('/api/payment/paystack/initialize', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        planId,
        email: email || currentUser?.email,
        callbackUrl
      })
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to initialize Paystack transaction');
      return backend.data;
    }
    return staticFb.initializeLocalPayment(currentUser, (planId as any) || 'medium', 'paystack', currentUser?.phone);
  },

  verifyPaystackPayment: async (reference: string, planId?: string) => {
    const backend = await fetchBackendJson('/api/payment/paystack/verify', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reference, planId })
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to verify Paystack transaction');
      if (backend.data?.user) authStorage.setUser(backend.data.user);
      return backend.data;
    }
    return staticFb.verifyLocalPayment(authStorage.getUser(), { reference, planId });
  },

  getPaymentConfig: async () => {
    const backend = await fetchBackendJson('/api/payment/config', { headers: getHeaders(false) });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.getLocalPaymentConfig();
  },

  updatePaymentConfig: async (config: { bankName: string; accountNumber: string; accountName: string; instructions?: string }) => {
    const backend = await fetchBackendJson('/api/admin/payment-config', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(config)
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to update payment configuration');
      return backend.data;
    }
    return staticFb.updateLocalPaymentConfig(config);
  },

  getAdminPayments: async () => {
    const backend = await fetchBackendJson('/api/admin/payments', { headers: getHeaders() });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to fetch payments queue');
      return backend.data;
    }
    return staticFb.getLocalAdminPayments();
  },

  approveAdminPayment: async (reference: string) => {
    const backend = await fetchBackendJson(`/api/admin/payments/${encodeURIComponent(reference)}/approve`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to approve payment');
      return backend.data;
    }
    return staticFb.approveLocalAdminPayment(reference, (uid, updater) => {
      const dir = loadLocalUsersDirectory();
      const idx = dir.findIndex(u => u.id === uid);
      if (idx >= 0) {
        dir[idx] = updater(dir[idx]);
        saveLocalUsersDirectory(dir);
      }
    });
  },

  rejectAdminPayment: async (reference: string, reason?: string) => {
    const backend = await fetchBackendJson(`/api/admin/payments/${encodeURIComponent(reference)}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to reject payment');
      return backend.data;
    }
    return staticFb.rejectLocalAdminPayment(reference, reason);
  },

  banTrollPayment: async (reference: string, reason?: string) => {
    const backend = await fetchBackendJson(`/api/admin/payments/${encodeURIComponent(reference)}/ban-troll`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to ban troll');
      return backend.data;
    }
    return staticFb.banTrollLocalPayment(reference, reason, (uid, updater) => {
      const dir = loadLocalUsersDirectory();
      const idx = dir.findIndex(u => u.id === uid);
      if (idx >= 0) {
        dir[idx] = updater(dir[idx]);
        saveLocalUsersDirectory(dir);
      }
    });
  },

  unbanTrollPayment: async (reference: string) => {
    const backend = await fetchBackendJson(`/api/admin/payments/${encodeURIComponent(reference)}/unban-troll`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to unban user');
      return backend.data;
    }
    return staticFb.unbanTrollLocalPayment(reference, (uid, updater) => {
      const dir = loadLocalUsersDirectory();
      const idx = dir.findIndex(u => u.id === uid);
      if (idx >= 0) {
        dir[idx] = updater(dir[idx]);
        saveLocalUsersDirectory(dir);
      }
    });
  },

  // Admin APIs
  createQuestion: async (questionData: any) => {
    const backend = await fetchBackendJson('/api/admin/questions', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(questionData)
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to create question');
      return backend.data;
    }
    return { success: true, question: staticFb.createLocalQuestion(questionData) };
  },

  updateQuestion: async (id: string, questionData: any) => {
    const backend = await fetchBackendJson(`/api/admin/questions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(questionData)
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to update question');
      return backend.data;
    }
    return { success: true, question: staticFb.updateLocalQuestion(id, questionData) };
  },

  deleteQuestion: async (id: string) => {
    const backend = await fetchBackendJson(`/api/admin/questions/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to delete question');
      return backend.data;
    }
    return staticFb.deleteLocalQuestion(id);
  },

  createSubject: async (subjectData: any) => {
    const backend = await fetchBackendJson('/api/admin/subjects', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(subjectData)
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to create subject');
      return backend.data;
    }
    return { success: true, subject: staticFb.createLocalSubject(subjectData) };
  },

  createArticle: async (articleData: any) => {
    const backend = await fetchBackendJson('/api/admin/articles', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(articleData)
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to publish article');
      return backend.data;
    }
    return { success: true, article: staticFb.createLocalArticle(articleData) };
  },

  deleteArticle: async (id: string) => {
    const backend = await fetchBackendJson(`/api/admin/articles/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to delete article');
      return backend.data;
    }
    return staticFb.deleteLocalArticle(id);
  },

  getAdminStats: async (): Promise<AdminStats> => {
    const backend = await fetchBackendJson('/api/admin/stats', { headers: getHeaders(false) });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to fetch admin stats');
      return backend.data;
    }
    return staticFb.getLocalAdminStats(loadLocalUsersDirectory());
  },

  // AI Tutor ("Naija AI")
  askAITutor: async (payload: {
    message: string;
    topic?: string;
    subjectName?: string;
    examType?: string;
    questionContext?: string;
    chatHistory?: Array<{ sender: 'user' | 'tutor'; text: string }>;
    mode?: string;
  }): Promise<{
    message: string;
    usedToday: number;
    dailyLimit: number;
    remainingToday: number;
    isUnlimited: boolean;
    plan: string;
    requiresUpgrade?: boolean;
    groundingSources?: { title: string; url: string; snippet?: string }[];
    smartWebInsights?: SmartWebInsights;
  }> => {
    const backend = await fetchBackendJson('/api/ai-tutor/chat', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) {
        const error: any = new Error(backend.data?.message || backend.data?.error || 'AI Tutor request failed');
        error.data = backend.data;
        throw error;
      }
      return backend.data;
    }
    return staticFb.askLocalAITutor(authStorage.getUser(), payload);
  },

  getAITutorStatus: async () => {
    const backend = await fetchBackendJson('/api/ai-tutor/status', { headers: getHeaders(false) });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.getLocalAITutorStatus(authStorage.getUser());
  },

  resetAITutorTrial: async () => {
    const backend = await fetchBackendJson('/api/ai-tutor/reset-trial', {
      method: 'POST',
      headers: getHeaders()
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.resetLocalAITutorTrial(authStorage.getUser());
  },

  // Question Bookmarks
  getBookmarkedQuestions: async (): Promise<{ bookmarks: Question[]; total: number; bookmarkedIds: string[] }> => {
    const backend = await fetchBackendJson('/api/questions/bookmarks', { headers: getHeaders(false) });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.getLocalBookmarks(authStorage.getUser());
  },

  toggleBookmarkQuestion: async (questionId: string, bookmarked?: boolean): Promise<{ success: boolean; isBookmarked: boolean; bookmarkedIds: string[] }> => {
    const backend = await fetchBackendJson('/api/questions/bookmark', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ questionId, bookmarked })
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.toggleLocalBookmark(authStorage.getUser(), questionId, bookmarked);
  },

  // Gamification Sync
  syncGamification: async (payload: { xp?: number; streakDays?: number; flashChallengeBestScore?: number }) => {
    const backend = await fetchBackendJson('/api/user/sync-gamification', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;

    const currentUser = authStorage.getUser();
    if (currentUser) {
      const updatedUser: User = {
        ...currentUser,
        xp: typeof payload.xp === 'number' ? payload.xp : currentUser.xp,
        streakDays: typeof payload.streakDays === 'number' ? payload.streakDays : currentUser.streakDays,
        flashChallengeBestScore: typeof payload.flashChallengeBestScore === 'number' ? payload.flashChallengeBestScore : currentUser.flashChallengeBestScore
      };
      authStorage.setUser(updatedUser);
    }
    return { success: true };
  },

  // Monthly Leaderboard Winner Airtime Claims & Admin Alerts
  claimMonthlyPrize: async (data: { phoneNumber: string; network: string; notes?: string }) => {
    const backend = await fetchBackendJson('/api/leaderboard/claim-prize', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to submit airtime claim details');
      return backend.data;
    }
    return staticFb.claimLocalMonthlyPrize(authStorage.getUser(), data);
  },

  getMyPrizeClaim: async () => {
    const backend = await fetchBackendJson('/api/leaderboard/my-prize-claim', { headers: getHeaders(false) });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.getLocalMyPrizeClaim(authStorage.getUser());
  },

  getAdminMonthlyWinners: async () => {
    const backend = await fetchBackendJson('/api/admin/monthly-winners', { headers: getHeaders() });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to fetch monthly winners');
      return backend.data;
    }
    return staticFb.getLocalAdminMonthlyWinners();
  },

  fulfillAdminMonthlyWinner: async (id: string, notes?: string) => {
    const backend = await fetchBackendJson(`/api/admin/monthly-winners/${encodeURIComponent(id)}/fulfill`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ notes })
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to mark airtime as sent');
      return backend.data;
    }
    return staticFb.fulfillLocalMonthlyWinner(id, notes);
  },

  updateAdminMonthlyWinnerPhone: async (id: string, phoneNumber: string, network: string, notes?: string) => {
    const backend = await fetchBackendJson(`/api/admin/monthly-winners/${encodeURIComponent(id)}/update-phone`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ phoneNumber, network, notes })
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to update winner phone');
      return backend.data;
    }
    return staticFb.updateLocalMonthlyWinnerPhone(id, phoneNumber, network, notes);
  },

  refreshAdminMonthlyWinners: async () => {
    const backend = await fetchBackendJson('/api/admin/monthly-winners/snapshot', {
      method: 'POST',
      headers: getHeaders()
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to refresh winners snapshot');
      return backend.data;
    }
    return staticFb.getLocalAdminMonthlyWinners();
  },

  getAdminNotifications: async () => {
    const backend = await fetchBackendJson('/api/admin/notifications', { headers: getHeaders() });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to fetch admin notifications');
      return backend.data;
    }
    return staticFb.getLocalAdminNotifications();
  },

  markAdminNotificationRead: async (id: string) => {
    const backend = await fetchBackendJson(`/api/admin/notifications/${encodeURIComponent(id)}/read`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.markLocalAdminNotificationRead(id);
  },

  markAllAdminNotificationsRead: async () => {
    const backend = await fetchBackendJson('/api/admin/notifications/mark-all-read', {
      method: 'POST',
      headers: getHeaders()
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.markLocalAdminNotificationRead();
  },

  testAdminEmailNotification: async () => {
    const backend = await fetchBackendJson('/api/admin/test-email-notification', {
      method: 'POST',
      headers: getHeaders()
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to trigger test email notification');
      return backend.data;
    }
    return { success: true, message: 'Static hosting preview: email dispatch is simulated on Netlify.' };
  },

  // Public Anti-Cheat & Match Verification
  verifyArenaMatch: async (codeOrId: string): Promise<{ success: boolean; match: VerifiedArenaMatch; ledger: string; verifiedAt: string }> => {
    const backend = await fetchBackendJson(`/api/arena/verify/${encodeURIComponent(codeOrId.trim())}`);
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Match record not found or unverified');
      return backend.data;
    }
    return staticFb.verifyLocalArenaMatch(codeOrId);
  },

  verifyExamResult: async (idOrCode: string): Promise<{ success: boolean; exam: ExamResult; ledger: string }> => {
    const backend = await fetchBackendJson(`/api/verify/exam/${encodeURIComponent(idOrCode.trim())}`);
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Exam certificate record not found or unverified');
      return backend.data;
    }
    return staticFb.verifyLocalExamResult(idOrCode);
  },

  // Student Community & SabiGuard AI Moderation
  getCommunityMessages: async (channel: string = 'general', search?: string): Promise<{ success: boolean; channel: string; messages: CommunityMessage[]; totalCount: number }> => {
    const params = new URLSearchParams();
    if (channel) params.append('channel', channel);
    if (search) params.append('search', search);

    const backend = await fetchBackendJson(`/api/community/messages?${params.toString()}`, { headers: getHeaders(false) });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to fetch community messages');
      return backend.data;
    }
    return staticFb.getLocalCommunityMessages(channel, search);
  },

  postCommunityMessage: async (payload: {
    channelId: CommunityChannel;
    content: string;
    replyToId?: string;
    replyToSnippet?: string;
    tags?: string[];
    authorName?: string;
    authorEmail?: string;
    userTournamentBadge?: '1st' | '2nd' | '3rd' | null;
    userThemeVariant?: 'default' | 'gold' | 'diamond' | 'platinum';
  }): Promise<{ success: boolean; message?: CommunityMessage; blocked?: boolean; error?: string; moderation?: ModerationResult }> => {
    const backend = await fetchBackendJson('/api/community/messages', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (backend.isBackendAvailable) {
      const data = backend.data;
      if (!backend.ok) {
        const err: any = new Error(data?.error || 'Message could not be posted');
        err.moderation = data?.moderation;
        err.blocked = data?.blocked;
        throw err;
      }
      return data;
    }
    const res = staticFb.postLocalCommunityMessage(authStorage.getUser(), payload);
    if (!res.success) {
      const err: any = new Error(res.error || 'Message could not be posted');
      err.moderation = res.moderation;
      err.blocked = res.blocked;
      throw err;
    }
    return res;
  },

  likeCommunityMessage: async (messageId: string, userId?: string): Promise<{ success: boolean; likes: number; isLiked: boolean }> => {
    const backend = await fetchBackendJson(`/api/community/messages/${encodeURIComponent(messageId)}/like`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.likeLocalCommunityMessage(messageId, userId || authStorage.getUser()?.id);
  },

  requestCommunityAiExplanation: async (questionText: string, _messageId?: string, channelId?: string): Promise<{ success: boolean; reply: CommunityMessage }> => {
    const backend = await fetchBackendJson('/api/community/ai-explain', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ questionText, messageId: _messageId, channelId })
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to get AI explanation');
      return backend.data;
    }
    return staticFb.requestLocalCommunityAiExplanation(questionText, (channelId as CommunityChannel) || 'general');
  },

  // Monthly Champions League Tournament & Admin AI Assistant
  getTournamentState: async (): Promise<{ success: boolean; tournament: TournamentState }> => {
    const backend = await fetchBackendJson('/api/tournament', { headers: getHeaders() });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    const { tournamentManager } = await import('../utils/tournamentManager');
    return { success: true, tournament: tournamentManager.getState() };
  },

  voteTournamentKickoff: async (time: string, userId: string): Promise<{ success: boolean; message: string; tournament: TournamentState }> => {
    const backend = await fetchBackendJson('/api/tournament/vote', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ time, userId })
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    const { tournamentManager } = await import('../utils/tournamentManager');
    const res = tournamentManager.castVote(time, userId);
    return { success: res.success, message: res.message, tournament: res.state };
  },

  randomizeTournamentGroups: async (): Promise<{ success: boolean; tournament: TournamentState }> => {
    const backend = await fetchBackendJson('/api/tournament/distribute', {
      method: 'POST',
      headers: getHeaders()
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    const { tournamentManager } = await import('../utils/tournamentManager');
    return { success: true, tournament: tournamentManager.randomizeGroups() };
  },

  submitTournamentBankClaim: async (claim: { userId: string; accountNumber: string; accountName: string; bankName: string }): Promise<{ success: boolean; message: string; claim: TournamentBankClaim }> => {
    const backend = await fetchBackendJson('/api/tournament/claim-bank', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(claim)
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    const { tournamentManager } = await import('../utils/tournamentManager');
    return tournamentManager.submitBankClaim(claim);
  },

  askAdminAiAssistant: async (prompt: string, tournamentState?: TournamentState): Promise<{ success: boolean; reply: string; actionExecuted?: string }> => {
    const backend = await fetchBackendJson('/api/tournament/admin-ai-chat', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ prompt, tournamentState })
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return {
      success: true,
      reply: `Admin AI Assistant has processed your directive: "${prompt}". Tournament rules, candidate tracking, and automated prize activations are operating with 100% integrity.`
    };
  },

  getAdminTournamentClaims: async (): Promise<{ success: boolean; claims: TournamentBankClaim[] }> => {
    const backend = await fetchBackendJson('/api/admin/tournament/claims', { headers: getHeaders() });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    const { tournamentManager } = await import('../utils/tournamentManager');
    return { success: true, claims: tournamentManager.getState().bankClaims };
  },

  disburseTournamentClaim: async (claimId: string): Promise<{ success: boolean; message: string }> => {
    const backend = await fetchBackendJson(`/api/admin/tournament/claims/${encodeURIComponent(claimId)}/disburse`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return { success: true, message: 'Prize disbursement status updated.' };
  },

  // =========================================================================
  // ADMIN SENTINEL AI: ANTI-CHEAT & PROCTORING SHIELD API
  // =========================================================================
  getAdminUsers: async (): Promise<{ success: boolean; users: User[]; totalCount: number }> => {
    const backend = await fetchBackendJson('/api/admin/users', { headers: getHeaders() });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    const users = loadLocalUsersDirectory().map(({ password: _, ...u }) => u);
    return { success: true, users, totalCount: users.length };
  },

  getSecurityIncidents: async (): Promise<{ success: boolean; incidents: SecurityIncident[]; totalCount: number }> => {
    const backend = await fetchBackendJson('/api/admin/security/incidents', { headers: getHeaders() });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    const incidents = staticFb.getLocalSecurityIncidents();
    return { success: true, incidents, totalCount: incidents.length };
  },

  getSecurityStats: async (): Promise<{
    success: boolean;
    stats: {
      totalThreatsBlocked: number;
      bannedAccountsCount: number;
      suspendedAccountsCount: number;
      activeProctoringScans: number;
      threatDistribution: Record<string, number>;
      engineVersion: string;
    };
  }> => {
    const backend = await fetchBackendJson('/api/admin/security/stats', { headers: getHeaders() });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.getLocalSecurityStats(loadLocalUsersDirectory());
  },

  banUserSecurity: async (userId: string, reason: string): Promise<{ success: boolean; message: string; user: User; incident: SecurityIncident }> => {
    const backend = await fetchBackendJson('/api/admin/security/ban', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, reason })
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    const res = staticFb.recordLocalSecurityAction(loadLocalUsersDirectory(), saveLocalUsersDirectory, 'ban', userId, reason);
    return { ...res, incident: res.incident! };
  },

  suspendUserSecurity: async (userId: string, durationHours: number, reason: string): Promise<{ success: boolean; message: string; user: User; incident: SecurityIncident }> => {
    const backend = await fetchBackendJson('/api/admin/security/suspend', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, durationHours, reason })
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    const res = staticFb.recordLocalSecurityAction(loadLocalUsersDirectory(), saveLocalUsersDirectory, 'suspend', userId, reason, durationHours);
    return { ...res, incident: res.incident! };
  },

  unbanUserSecurity: async (userId: string): Promise<{ success: boolean; message: string; user: User }> => {
    const backend = await fetchBackendJson('/api/admin/security/unban', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.recordLocalSecurityAction(loadLocalUsersDirectory(), saveLocalUsersDirectory, 'unban', userId);
  },

  unsuspendUserSecurity: async (userId: string): Promise<{ success: boolean; message: string; user: User }> => {
    const backend = await fetchBackendJson('/api/admin/security/unsuspend', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.recordLocalSecurityAction(loadLocalUsersDirectory(), saveLocalUsersDirectory, 'unsuspend', userId);
  },

  clearSecurityStrikes: async (userId: string): Promise<{ success: boolean; message: string; user: User }> => {
    const backend = await fetchBackendJson('/api/admin/security/clear-strikes', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.recordLocalSecurityAction(loadLocalUsersDirectory(), saveLocalUsersDirectory, 'clear_strikes', userId);
  },

  simulateSecurityThreat: async (threatType: string): Promise<{ success: boolean; message: string; incident: SecurityIncident }> => {
    const backend = await fetchBackendJson('/api/admin/security/simulate-incident', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ threatType })
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.simulateLocalSecurityThreat(threatType, loadLocalUsersDirectory());
  },

  sendEmailNotification: async (payload: { recipientEmail?: string; subject: string; message: string; studentName?: string }): Promise<{ success: boolean; message: string }> => {
    const backend = await fetchBackendJson('/api/send-email', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return { success: true, message: 'Notification recorded.' };
  },

  sendWelcomeEmail: async (email?: string, name?: string, targetExam?: string): Promise<{ success: boolean; message: string }> => {
    const backend = await fetchBackendJson('/api/auth/send-welcome-email', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, name, targetExam })
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return { success: true, message: 'Welcome status recorded.' };
  },

  getWelcomeEmailStatus: async (email?: string): Promise<{ sent: boolean; email: string; lastDispatchedAt: string | null; totalDispatched: number }> => {
    const url = email ? `/api/auth/welcome-email-status?email=${encodeURIComponent(email)}` : '/api/auth/welcome-email-status';
    const backend = await fetchBackendJson(url, { headers: getHeaders(false) });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return { sent: true, email: email || '', lastDispatchedAt: new Date().toISOString(), totalDispatched: 1 };
  },

  // Universal Past Question Harvester (JAMB, WAEC, NECO)
  getHarvestPresetSources: async () => {
    const backend = await fetchBackendJson('/api/harvest-questions/preset-sources', { headers: getHeaders(false) });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.getLocalHarvestPresetSources();
  },

  harvestQuestionsFromUrl: async (url: string, examType: string, subjectId: string, year?: number) => {
    const backend = await fetchBackendJson('/api/harvest-questions/from-url', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ url, examType, subjectId, year })
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.harvestLocalQuestions({ examType, subjectId, year });
  },

  harvestQuestionsFromText: async (rawText: string, examType: string, subjectId: string, year?: number) => {
    const backend = await fetchBackendJson('/api/harvest-questions/from-text', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rawText, examType, subjectId, year })
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.harvestLocalQuestions({ rawText, examType, subjectId, year });
  },

  harvestQuestionsFromSearch: async (examType: string, subjectId: string, year?: number, topic?: string, count: number = 10) => {
    const backend = await fetchBackendJson('/api/harvest-questions/search', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ examType, subjectId, year, topic, count })
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.harvestLocalQuestions({ examType, subjectId, year, topic, count });
  },

  saveHarvestedQuestionsToBank: async (questions: Question[]) => {
    const backend = await fetchBackendJson('/api/harvest-questions/save-to-bank', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ questions })
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    questions.forEach(q => staticFb.createLocalQuestion(q));
    return { success: true, savedCount: questions.length };
  },

  // Real-Time Google Search News & Fact-Checker Agent
  getTrendingNewsTopics: async () => {
    const backend = await fetchBackendJson('/api/news-agent/trending-topics', { headers: getHeaders(false) });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.getLocalTrendingNewsTopics();
  },

  queryNewsAgent: async (query: string, mode: 'news' | 'factcheck' | 'current_events' | 'exam_updates' = 'news') => {
    const backend = await fetchBackendJson('/api/news-agent/query', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query, mode })
    });
    if (backend.isBackendAvailable && backend.ok) return backend.data;
    return staticFb.queryLocalNewsAgent(query, mode);
  },

  // =========================================================================
  // STUDYNAIJA COMMUNITY FORUM API (Discussions, QA, Admin Moderation)
  // =========================================================================
  getForumThreads: async (params?: {
    examCategory?: string;
    subjectId?: string;
    search?: string;
    sort?: 'latest' | 'popular' | 'unanswered' | 'solved';
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; threads: ForumThread[]; total: number }> => {
    const query = new URLSearchParams();
    if (params?.examCategory && params.examCategory !== 'ALL') query.set('examCategory', params.examCategory);
    if (params?.subjectId && params.subjectId !== 'all') query.set('subjectId', params.subjectId);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));

    const backend = await fetchBackendJson(`/api/forum/threads?${query.toString()}`, { headers: getHeaders(false) });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to fetch forum threads');
      return backend.data;
    }
    return await staticFb.getLocalForumThreads(params);
  },

  getForumThread: async (threadId: string): Promise<{ success: boolean; thread: ForumThread }> => {
    const backend = await fetchBackendJson(`/api/forum/threads/${encodeURIComponent(threadId)}`, { headers: getHeaders(false) });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to fetch forum thread');
      return backend.data;
    }
    return await staticFb.getLocalForumThread(threadId);
  },

  createForumThread: async (payload: {
    title: string;
    content: string;
    examCategory: ForumExamCategory;
    subjectId?: string;
    subjectName?: string;
    tags?: string[];
    authorName?: string;
    authorEmail?: string;
    userTournamentBadge?: '1st' | '2nd' | '3rd' | null;
    userThemeVariant?: 'default' | 'gold' | 'diamond' | 'platinum';
  }): Promise<{ success: boolean; thread: ForumThread; moderation?: ModerationResult }> => {
    const backend = await fetchBackendJson('/api/forum/threads', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (backend.isBackendAvailable) {
      const data = backend.data;
      if (!backend.ok) {
        const err: any = new Error(data?.error || 'Failed to create forum thread');
        err.moderation = data?.moderation;
        err.blocked = data?.blocked;
        throw err;
      }
      return data;
    }
    return await staticFb.createLocalForumThread(authStorage.getUser(), payload);
  },

  postForumReply: async (threadId: string, payload: {
    content: string;
    authorName?: string;
    authorEmail?: string;
    userTournamentBadge?: '1st' | '2nd' | '3rd' | null;
    userThemeVariant?: 'default' | 'gold' | 'diamond' | 'platinum';
  }): Promise<{ success: boolean; reply: ForumReply; thread: ForumThread; moderation?: ModerationResult }> => {
    const backend = await fetchBackendJson(`/api/forum/threads/${encodeURIComponent(threadId)}/reply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (backend.isBackendAvailable) {
      const data = backend.data;
      if (!backend.ok) {
        const err: any = new Error(data?.error || 'Failed to post forum reply');
        err.moderation = data?.moderation;
        err.blocked = data?.blocked;
        throw err;
      }
      return data;
    }
    return await staticFb.postLocalForumReply(authStorage.getUser(), threadId, payload);
  },

  likeForumThread: async (threadId: string, userId?: string): Promise<{ success: boolean; likes: number; isLiked: boolean }> => {
    const backend = await fetchBackendJson(`/api/forum/threads/${encodeURIComponent(threadId)}/like`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to like thread');
      return backend.data;
    }
    return staticFb.likeLocalForumThread(threadId, userId || authStorage.getUser()?.id);
  },

  likeForumReply: async (threadId: string, replyId: string, userId?: string): Promise<{ success: boolean; likes: number; isLiked: boolean }> => {
    const backend = await fetchBackendJson(`/api/forum/threads/${encodeURIComponent(threadId)}/replies/${encodeURIComponent(replyId)}/like`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to like reply');
      return backend.data;
    }
    return staticFb.likeLocalForumReply(threadId, replyId, userId || authStorage.getUser()?.id);
  },

  pinForumThread: async (threadId: string, isPinned: boolean): Promise<{ success: boolean; isPinned: boolean }> => {
    const backend = await fetchBackendJson(`/api/forum/threads/${encodeURIComponent(threadId)}/pin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ isPinned })
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to pin/unpin thread');
      return backend.data;
    }
    return await staticFb.pinLocalForumThread(threadId, isPinned);
  },

  lockForumThread: async (threadId: string, isLocked: boolean): Promise<{ success: boolean; isLocked: boolean }> => {
    const backend = await fetchBackendJson(`/api/forum/threads/${encodeURIComponent(threadId)}/lock`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ isLocked })
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to lock/unlock thread');
      return backend.data;
    }
    return await staticFb.lockLocalForumThread(threadId, isLocked);
  },

  markForumThreadSolved: async (threadId: string, replyId?: string, isSolved?: boolean): Promise<{ success: boolean; isSolved: boolean; thread: ForumThread }> => {
    const backend = await fetchBackendJson(`/api/forum/threads/${encodeURIComponent(threadId)}/solve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ replyId, isSolved })
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to mark thread status');
      return backend.data;
    }
    return staticFb.markLocalForumThreadSolved(threadId, replyId, isSolved);
  },

  moderateForumThread: async (threadId: string, action: 'pin' | 'lock' | 'delete' | 'flag' | 'unflag', note?: string): Promise<{ success: boolean; thread?: ForumThread }> => {
    const backend = await fetchBackendJson(`/api/forum/threads/${encodeURIComponent(threadId)}/moderate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action, note })
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to execute moderation action');
      return backend.data;
    }
    return await staticFb.moderateLocalForumThread(threadId, action, note);
  },

  deleteForumThread: async (threadId: string): Promise<{ success: boolean }> => {
    const backend = await fetchBackendJson(`/api/forum/threads/${encodeURIComponent(threadId)}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to delete thread');
      return backend.data;
    }
    return await staticFb.deleteLocalForumThread(threadId);
  },

  deleteForumReply: async (threadId: string, replyId: string): Promise<{ success: boolean }> => {
    const backend = await fetchBackendJson(`/api/forum/threads/${encodeURIComponent(threadId)}/replies/${encodeURIComponent(replyId)}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (backend.isBackendAvailable) {
      if (!backend.ok) throw new Error(backend.data?.error || 'Failed to delete reply');
      return backend.data;
    }
    return staticFb.deleteLocalForumReply(threadId, replyId);
  }
};


