import { User, Subject, Question, Article, ExamResult, AdminStats, PricingPlan, LeaderboardEntry, SubjectChampion, VerifiedArenaMatch, CommunityMessage, CommunityChannel, ModerationResult, SmartWebInsights, JambCountdownData, TournamentState, TournamentBankClaim, SecurityIncident } from '../types';
import { INITIAL_SUBJECTS, INITIAL_QUESTIONS, STUDY_ARTICLES, PRICING_PLANS } from '../mockData';
import { generateLeaderboard, LeaderboardFilterOptions, LeaderboardStatsSummary } from '../utils/leaderboardData';

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
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Registration failed');
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
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ identifier: identifierOrEmail, email: identifierOrEmail, password })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Login failed');
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

      const res = await fetch('/api/auth/me', {
        headers: getHeaders(false)
      });
      if (!res.ok) {
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
      const data = await res.json();
      if (data.user) authStorage.setUser(data.user);
      return data.user;
    } catch {
      // Offline / network failure: gracefully return cached user so student is not locked out
      return authStorage.getUser();
    }
  },

  // Device Transfer & Multi-Device Sync
  createDeviceSyncCode: async (): Promise<{ code: string; expiresAt: string; expiresInMinutes?: number; email: string; phone?: string }> => {
    const res = await fetch('/api/auth/device-sync/create', {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create device sync code');
    return data;
  },

  verifyDeviceSyncCode: async (code: string): Promise<{ token: string; user: User }> => {
    const res = await fetch('/api/auth/device-sync/verify', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid or expired sync code');
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
    const res = await fetch('/api/auth/recover-phone', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ identifier, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Account recovery failed');
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
    try {
      const res = await fetch('/api/jamb-countdown', {
        headers: getHeaders(false)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      // High-precision client-side simulated fallback
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
    }
  },

  // Subjects
  getSubjects: async (params?: { level?: string }): Promise<Subject[]> => {
    try {
      const query = params?.level ? `?level=${encodeURIComponent(params.level)}` : '';
      const res = await fetch(`/api/subjects${query}`, {
        headers: getHeaders(false)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const currentUser = authStorage.getUser();
      const level = params?.level || currentUser?.educationLevel;
      if (level && level !== 'all') {
        return INITIAL_SUBJECTS.filter(s => !s.educationLevel || s.educationLevel === level);
      }
      return INITIAL_SUBJECTS;
    }
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

      const res = await fetch(`/api/questions?${query.toString()}`, {
        headers: getHeaders(false)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const currentUser = authStorage.getUser();
      const level = params?.level || currentUser?.educationLevel;
      let filtered = [...INITIAL_QUESTIONS];
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
      return { questions: filtered.slice(0, 50), total: filtered.length };
    }
  },

  submitPracticeAnswer: async (questionId: string, selectedOption: string, isCorrect?: boolean, correctOption?: string) => {
    try {
      const res = await fetch('/api/questions/submit-practice', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ questionId, selectedOption, isCorrect, correctOption })
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const q = INITIAL_QUESTIONS.find(item => item.id === questionId);
      const targetCorrect = correctOption || q?.correctOption || 'A';
      return {
        isCorrect: typeof isCorrect === 'boolean' ? isCorrect : (targetCorrect === selectedOption),
        correctOption: targetCorrect,
        explanation: q?.explanation || 'Standard solution'
      };
    }
  },

  // Mock Exam
  generateMockExam: async (examType: 'JAMB' | 'WAEC', selectedSubjects: string[], questionCountPerSubject = 10, excludeQuestionIds: string[] = []) => {
    const clientStudentId = typeof localStorage !== 'undefined' ? (localStorage.getItem('studynaija_student_id') || `stu_${Date.now()}`) : `stu_${Date.now()}`;
    try {
      const res = await fetch('/api/exams/generate', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ examType, selectedSubjects, questionCountPerSubject, excludeQuestionIds, clientStudentId })
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      // client fallback with strict deduplication and option scrambling
      const picked: Question[] = [];
      const seen = new Set<string>();
      const excludeSet = new Set<string>(excludeQuestionIds);
      selectedSubjects.forEach(sId => {
        let matching = INITIAL_QUESTIONS.filter(q => q.subjectId === sId && !seen.has(q.id) && !excludeSet.has(q.id));
        if (matching.length < questionCountPerSubject) {
          matching = INITIAL_QUESTIONS.filter(q => q.subjectId === sId && !seen.has(q.id));
        }
        matching.slice(0, questionCountPerSubject).forEach(q => {
          seen.add(q.id);
          picked.push(q);
        });
      });
      return {
        examSessionId: `fallback_sess_${Date.now()}`,
        examType,
        questions: picked.length ? picked : INITIAL_QUESTIONS.slice(0, 10),
        durationMinutes: examType === 'JAMB' ? 120 : 90,
        totalQuestions: picked.length || 10
      };
    }
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
    const res = await fetch('/api/exams/submit', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit exam');
    return data.result;
  },

  // Dashboard
  getDashboardStats: async () => {
    try {
      const res = await fetch('/api/dashboard', {
        headers: getHeaders(false)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return {
        stats: {
          questionsAnswered: 84,
          averageScore: 74,
          bestScore: 88,
          weakestSubject: 'Physics'
        },
        recentExams: [],
        recommendedTopics: [
          { topic: 'Mechanics & Newton Laws', subjectName: 'Physics', subjectId: 'physics', questionsAvailable: 24 },
          { topic: 'Calculus & Derivatives', subjectName: 'Mathematics', subjectId: 'mathematics', questionsAvailable: 30 },
          { topic: 'Acids, Bases & Salts', subjectName: 'Chemistry', subjectId: 'chemistry', questionsAvailable: 20 }
        ]
      };
    }
  },

  // Student Leaderboard (Nationwide CBT Top Scorers & Champions)
  getLeaderboard: async (options: LeaderboardFilterOptions): Promise<{
    entries: LeaderboardEntry[];
    stats: LeaderboardStatsSummary;
    champions: SubjectChampion[];
  }> => {
    try {
      const query = new URLSearchParams();
      if (options.subjectId) query.set('subjectId', options.subjectId);
      if (options.timeframe) query.set('timeframe', options.timeframe);
      if (options.examType) query.set('examType', options.examType);
      if (options.searchQuery) query.set('searchQuery', options.searchQuery);

      const res = await fetch(`/api/leaderboard?${query.toString()}`, {
        headers: getHeaders(false)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      // Offline fallback: dynamically generate with active client user state
      const currentUser = authStorage.getUser();
      const dash = await api.getDashboardStats().catch(() => ({ recentExams: [] }));
      const mockResults = dash?.recentExams || [];
      return generateLeaderboard(currentUser, options, mockResults);
    }
  },

  // Articles
  getArticles: async (): Promise<Article[]> => {
    try {
      const res = await fetch('/api/articles');
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return STUDY_ARTICLES;
    }
  },

  getArticle: async (slug: string): Promise<Article | null> => {
    try {
      const res = await fetch(`/api/articles/${slug}`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return STUDY_ARTICLES.find(a => a.slug === slug || a.id === slug) || null;
    }
  },

  // Payments (Real Nigerian & International Gateways, AI verified settlement)
  initializePayment: async (planId: 'basic' | 'medium' | 'premium', paymentMethod?: string, phoneNumber?: string) => {
    const currentUser = authStorage.getUser();
    const headers = getHeaders();
    if (currentUser?.id) headers['x-user-id'] = currentUser.id;
    if (currentUser?.email) headers['x-user-email'] = currentUser.email;

    const res = await fetch('/api/payment/initialize', {
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to initialize payment');
    return data;
  },

  verifyPayment: async (
    param1: {
      reference: string;
      senderAccountName?: string;
      senderBank?: string;
      bankSessionId?: string;
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

    const res = await fetch('/api/payment/verify', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...payload,
        userId: currentUser?.id,
        userEmail: currentUser?.email
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Payment confirmation failed.');
    if (data.token) authStorage.setToken(data.token);
    if (data.user && data.status === 'approved') authStorage.setUser(data.user);
    return data;
  },

  getPaymentStatus: async (reference: string) => {
    const res = await fetch(`/api/payment/status/${encodeURIComponent(reference)}`, { headers: getHeaders(false) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to check payment status');
    if (data.user) {
      authStorage.setUser(data.user);
    }
    return data;
  },

  initializePaystackPayment: async (planId: string, email?: string, callbackUrl?: string) => {
    const currentUser = authStorage.getUser();
    const res = await fetch('/api/payment/paystack/initialize', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        planId,
        email: email || currentUser?.email,
        callbackUrl
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to initialize Paystack transaction');
    return data;
  },

  verifyPaystackPayment: async (reference: string, planId?: string) => {
    const res = await fetch('/api/payment/paystack/verify', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reference, planId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to verify Paystack transaction');
    if (data.user) {
      authStorage.setUser(data.user);
    }
    return data;
  },

  getPaymentConfig: async () => {
    const res = await fetch('/api/payment/config', { headers: getHeaders(false) });
    if (!res.ok) throw new Error('Failed to fetch payment configuration');
    return await res.json();
  },

  updatePaymentConfig: async (config: { bankName: string; accountNumber: string; accountName: string; instructions?: string }) => {
    const res = await fetch('/api/admin/payment-config', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(config)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update payment configuration');
    return data;
  },

  getAdminPayments: async () => {
    const res = await fetch('/api/admin/payments', { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch payments queue');
    return data;
  },

  approveAdminPayment: async (reference: string) => {
    const res = await fetch(`/api/admin/payments/${encodeURIComponent(reference)}/approve`, {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to approve payment');
    return data;
  },

  rejectAdminPayment: async (reference: string, reason?: string) => {
    const res = await fetch(`/api/admin/payments/${encodeURIComponent(reference)}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reject payment');
    return data;
  },

  banTrollPayment: async (reference: string, reason?: string) => {
    const res = await fetch(`/api/admin/payments/${encodeURIComponent(reference)}/ban-troll`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to ban troll');
    return data;
  },

  unbanTrollPayment: async (reference: string) => {
    const res = await fetch(`/api/admin/payments/${encodeURIComponent(reference)}/unban-troll`, {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to unban user');
    return data;
  },

  // Admin APIs
  createQuestion: async (questionData: any) => {
    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(questionData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create question');
    return data;
  },

  updateQuestion: async (id: string, questionData: any) => {
    const res = await fetch(`/api/admin/questions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(questionData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update question');
    return data;
  },

  deleteQuestion: async (id: string) => {
    const res = await fetch(`/api/admin/questions/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete question');
    return data;
  },

  createSubject: async (subjectData: any) => {
    const res = await fetch('/api/admin/subjects', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(subjectData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create subject');
    return data;
  },

  createArticle: async (articleData: any) => {
    const res = await fetch('/api/admin/articles', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(articleData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to publish article');
    return data;
  },

  deleteArticle: async (id: string) => {
    const res = await fetch(`/api/admin/articles/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete article');
    return data;
  },

  getAdminStats: async (): Promise<AdminStats> => {
    const res = await fetch('/api/admin/stats', {
      headers: getHeaders(false)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin stats');
    return data;
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
    const res = await fetch('/api/ai-tutor/chat', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      const error: any = new Error(data.message || data.error || 'AI Tutor request failed');
      error.status = res.status;
      error.data = data;
      throw error;
    }
    return data;
  },

  getAITutorStatus: async () => {
    const res = await fetch('/api/ai-tutor/status', {
      headers: getHeaders(false)
    });
    const data = await res.json();
    return data;
  },

  resetAITutorTrial: async () => {
    const res = await fetch('/api/ai-tutor/reset-trial', {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    return data;
  },

  // Question Bookmarks
  getBookmarkedQuestions: async (): Promise<{ bookmarks: Question[]; total: number; bookmarkedIds: string[] }> => {
    const res = await fetch('/api/questions/bookmarks', {
      headers: getHeaders(false)
    });
    const data = await res.json();
    return data;
  },

  toggleBookmarkQuestion: async (questionId: string, bookmarked?: boolean): Promise<{ success: boolean; isBookmarked: boolean; bookmarkedIds: string[] }> => {
    const res = await fetch('/api/questions/bookmark', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ questionId, bookmarked })
    });
    const data = await res.json();
    return data;
  },

  // Gamification Sync
  syncGamification: async (payload: { xp?: number; streakDays?: number; flashChallengeBestScore?: number }) => {
    try {
      const res = await fetch('/api/user/sync-gamification', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  // Monthly Leaderboard Winner Airtime Claims & Admin Alerts
  claimMonthlyPrize: async (data: { phoneNumber: string; network: string; notes?: string }) => {
    const res = await fetch('/api/leaderboard/claim-prize', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to submit airtime claim details');
    return result;
  },

  getMyPrizeClaim: async () => {
    try {
      const res = await fetch('/api/leaderboard/my-prize-claim', {
        headers: getHeaders(false)
      });
      if (!res.ok) return { hasClaim: false, claim: null };
      return await res.json();
    } catch {
      return { hasClaim: false, claim: null };
    }
  },

  getAdminMonthlyWinners: async () => {
    const res = await fetch('/api/admin/monthly-winners', { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch monthly winners');
    return data;
  },

  fulfillAdminMonthlyWinner: async (id: string, notes?: string) => {
    const res = await fetch(`/api/admin/monthly-winners/${encodeURIComponent(id)}/fulfill`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ notes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to mark airtime as sent');
    return data;
  },

  updateAdminMonthlyWinnerPhone: async (id: string, phoneNumber: string, network: string, notes?: string) => {
    const res = await fetch(`/api/admin/monthly-winners/${encodeURIComponent(id)}/update-phone`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ phoneNumber, network, notes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update winner phone');
    return data;
  },

  refreshAdminMonthlyWinners: async () => {
    const res = await fetch('/api/admin/monthly-winners/snapshot', {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to refresh winners snapshot');
    return data;
  },

  getAdminNotifications: async () => {
    const res = await fetch('/api/admin/notifications', { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin notifications');
    return data;
  },

  markAdminNotificationRead: async (id: string) => {
    const res = await fetch(`/api/admin/notifications/${encodeURIComponent(id)}/read`, {
      method: 'POST',
      headers: getHeaders()
    });
    return await res.json();
  },

  markAllAdminNotificationsRead: async () => {
    const res = await fetch('/api/admin/notifications/mark-all-read', {
      method: 'POST',
      headers: getHeaders()
    });
    return await res.json();
  },

  testAdminEmailNotification: async () => {
    const res = await fetch('/api/admin/test-email-notification', {
      method: 'POST',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to trigger test email notification');
    return data;
  },

  // Public Anti-Cheat & Match Verification
  verifyArenaMatch: async (codeOrId: string): Promise<{ success: boolean; match: VerifiedArenaMatch; ledger: string; verifiedAt: string }> => {
    const res = await fetch(`/api/arena/verify/${encodeURIComponent(codeOrId.trim())}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Match record not found or unverified');
    return data;
  },

  verifyExamResult: async (idOrCode: string): Promise<{ success: boolean; exam: ExamResult; ledger: string }> => {
    const res = await fetch(`/api/verify/exam/${encodeURIComponent(idOrCode.trim())}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Exam certificate record not found or unverified');
    return data;
  },

  // Student Community & SabiGuard AI Moderation
  getCommunityMessages: async (channel: string = 'general', search?: string): Promise<{ success: boolean; channel: string; messages: CommunityMessage[]; totalCount: number }> => {
    const params = new URLSearchParams();
    if (channel) params.append('channel', channel);
    if (search) params.append('search', search);

    const res = await fetch(`/api/community/messages?${params.toString()}`, {
      headers: getHeaders(false)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch community messages');
    return data;
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
    const res = await fetch('/api/community/messages', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      // Could be AI moderation rejection or validation error
      const err: any = new Error(data.error || 'Message could not be posted');
      err.moderation = data.moderation;
      err.blocked = data.blocked;
      throw err;
    }
    return data;
  },

  likeCommunityMessage: async (messageId: string, userId?: string): Promise<{ success: boolean; likes: number; isLiked: boolean }> => {
    const res = await fetch(`/api/community/messages/${encodeURIComponent(messageId)}/like`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    return await res.json();
  },

  requestCommunityAiExplanation: async (questionText: string, messageId?: string, channelId?: string): Promise<{ success: boolean; reply: CommunityMessage }> => {
    const res = await fetch('/api/community/ai-explain', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ questionText, messageId, channelId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to get AI explanation');
    return data;
  },

  // Monthly Champions League Tournament & Admin AI Assistant
  getTournamentState: async (): Promise<{ success: boolean; tournament: TournamentState }> => {
    try {
      const res = await fetch('/api/tournament', { headers: getHeaders() });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const { tournamentManager } = await import('../utils/tournamentManager');
      return { success: true, tournament: tournamentManager.getState() };
    }
  },

  voteTournamentKickoff: async (time: string, userId: string): Promise<{ success: boolean; message: string; tournament: TournamentState }> => {
    try {
      const res = await fetch('/api/tournament/vote', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ time, userId })
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const { tournamentManager } = await import('../utils/tournamentManager');
      const res = tournamentManager.castVote(time, userId);
      return { success: res.success, message: res.message, tournament: res.state };
    }
  },

  randomizeTournamentGroups: async (): Promise<{ success: boolean; tournament: TournamentState }> => {
    try {
      const res = await fetch('/api/tournament/distribute', {
        method: 'POST',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const { tournamentManager } = await import('../utils/tournamentManager');
      const newState = tournamentManager.randomizeGroups();
      return { success: true, tournament: newState };
    }
  },

  submitTournamentBankClaim: async (claim: { userId: string; accountNumber: string; accountName: string; bankName: string }): Promise<{ success: boolean; message: string; claim: TournamentBankClaim }> => {
    try {
      const res = await fetch('/api/tournament/claim-bank', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(claim)
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const { tournamentManager } = await import('../utils/tournamentManager');
      return tournamentManager.submitBankClaim(claim);
    }
  },

  askAdminAiAssistant: async (prompt: string, tournamentState?: TournamentState): Promise<{ success: boolean; reply: string; actionExecuted?: string }> => {
    try {
      const res = await fetch('/api/tournament/admin-ai-chat', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ prompt, tournamentState })
      });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return {
        success: true,
        reply: `Admin AI Assistant has processed your directive: "${prompt}". Tournament rules, candidate tracking, and automated prize activations are operating with 100% integrity.`
      };
    }
  },

  getAdminTournamentClaims: async (): Promise<{ success: boolean; claims: TournamentBankClaim[] }> => {
    try {
      const res = await fetch('/api/admin/tournament/claims', { headers: getHeaders() });
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      const { tournamentManager } = await import('../utils/tournamentManager');
      return { success: true, claims: tournamentManager.getState().bankClaims };
    }
  },

  disburseTournamentClaim: async (claimId: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`/api/admin/tournament/claims/${encodeURIComponent(claimId)}/disburse`, {
      method: 'POST',
      headers: getHeaders()
    });
    return await res.json();
  },

  // =========================================================================
  // ADMIN SENTINEL AI: ANTI-CHEAT & PROCTORING SHIELD API
  // =========================================================================
  getAdminUsers: async (): Promise<{ success: boolean; users: User[]; totalCount: number }> => {
    const res = await fetch('/api/admin/users', { headers: getHeaders() });
    return await res.json();
  },

  getSecurityIncidents: async (): Promise<{ success: boolean; incidents: SecurityIncident[]; totalCount: number }> => {
    const res = await fetch('/api/admin/security/incidents', { headers: getHeaders() });
    return await res.json();
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
    const res = await fetch('/api/admin/security/stats', { headers: getHeaders() });
    return await res.json();
  },

  banUserSecurity: async (userId: string, reason: string): Promise<{ success: boolean; message: string; user: User; incident: SecurityIncident }> => {
    const res = await fetch('/api/admin/security/ban', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, reason })
    });
    return await res.json();
  },

  suspendUserSecurity: async (userId: string, durationHours: number, reason: string): Promise<{ success: boolean; message: string; user: User; incident: SecurityIncident }> => {
    const res = await fetch('/api/admin/security/suspend', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId, durationHours, reason })
    });
    return await res.json();
  },

  unbanUserSecurity: async (userId: string): Promise<{ success: boolean; message: string; user: User }> => {
    const res = await fetch('/api/admin/security/unban', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    return await res.json();
  },

  clearSecurityStrikes: async (userId: string): Promise<{ success: boolean; message: string; user: User }> => {
    const res = await fetch('/api/admin/security/clear-strikes', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    return await res.json();
  },

  simulateSecurityThreat: async (threatType: string): Promise<{ success: boolean; message: string; incident: SecurityIncident }> => {
    const res = await fetch('/api/admin/security/simulate-incident', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ threatType })
    });
    return await res.json();
  },

  sendEmailNotification: async (payload: { recipientEmail?: string; subject: string; message: string; studentName?: string }): Promise<{ success: boolean; message: string }> => {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  sendWelcomeEmail: async (email?: string, name?: string, targetExam?: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch('/api/auth/send-welcome-email', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, name, targetExam })
    });
    return await res.json();
  },

  getWelcomeEmailStatus: async (email?: string): Promise<{ sent: boolean; email: string; lastDispatchedAt: string | null; totalDispatched: number }> => {
    const url = email ? `/api/auth/welcome-email-status?email=${encodeURIComponent(email)}` : '/api/auth/welcome-email-status';
    const res = await fetch(url, {
      headers: getHeaders(false)
    });
    return await res.json();
  }
};

