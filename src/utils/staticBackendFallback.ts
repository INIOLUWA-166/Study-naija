import {
  User,
  Question,
  Subject,
  Article,
  ExamResult,
  AdminStats,
  PaymentRecord,
  CommunityMessage,
  CommunityChannel,
  ModerationResult,
  ForumThread,
  ForumReply,
  ForumExamCategory,
  SecurityIncident,
  OffenseType,
  MonthlyWinnerRecord,
  AdminNotification,
  VerifiedArenaMatch,
  SmartWebInsights
} from '../types';
import { INITIAL_SUBJECTS, INITIAL_QUESTIONS, STUDY_ARTICLES, PRICING_PLANS } from '../mockData';
import { EXTENDED_QUESTIONS } from './questionBank';
import { generateNaijaAIResponse } from '../services/naijaAiEngine';
import { getMonthlySeasonInfo, MONTHLY_PRIZES } from './leaderboardData';
import {
  auth,
  saveExamResultToFirestore,
  fetchUserExamResultsFromFirestore,
  saveBookmarkToFirestore,
  removeBookmarkFromFirestore,
  createForumThreadInFirestore,
  fetchForumThreadsFromFirestore,
  addForumReplyInFirestore,
  fetchForumRepliesFromFirestore,
  setForumThreadPinnedInFirestore,
  setForumThreadLockedInFirestore,
  deleteForumThreadFromFirestore
} from '../services/firebase';

export const LOCAL_USERS_DIRECTORY_KEY = 'studynaija_local_users_directory_v1';
const LOCAL_QUESTIONS_KEY = 'studynaija_local_questions_v1';
const LOCAL_SUBJECTS_KEY = 'studynaija_local_subjects_v1';
const LOCAL_ARTICLES_KEY = 'studynaija_local_articles_v1';
const LOCAL_EXAM_RESULTS_KEY = 'studynaija_local_exam_results_v1';
const LOCAL_BOOKMARKS_KEY = 'studynaija_local_bookmarks_v1';
const LOCAL_PAYMENT_CONFIG_KEY = 'studynaija_local_payment_config_v1';
const LOCAL_PAYMENTS_KEY = 'studynaija_local_payments_v1';
const LOCAL_AI_USAGE_KEY = 'studynaija_local_ai_usage_v1';
const LOCAL_COMMUNITY_MSGS_KEY = 'studynaija_local_community_msgs_v1';
const LOCAL_FORUM_THREADS_KEY = 'studynaija_local_forum_threads_v1';
const LOCAL_SECURITY_INCIDENTS_KEY = 'studynaija_local_security_incidents_v1';
const LOCAL_ARENA_MATCHES_KEY = 'studynaija_local_arena_matches_v1';
const LOCAL_PRIZE_CLAIMS_KEY = 'studynaija_local_prize_claims_v1';
const LOCAL_ADMIN_NOTIFS_KEY = 'studynaija_local_admin_notifs_v1';

export interface LocalStoredUser extends User {
  password?: string;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function getAllLocalQuestionPool(): Question[] {
  const custom = readJson<Question[]>(LOCAL_QUESTIONS_KEY, []);
  const map = new Map<string, Question>();
  [...custom, ...INITIAL_QUESTIONS, ...EXTENDED_QUESTIONS].forEach(q => {
    if (q && q.id && !map.has(q.id)) {
      map.set(q.id, q);
    }
  });
  return Array.from(map.values());
}

export function getAllLocalSubjects(): Subject[] {
  const custom = readJson<Subject[]>(LOCAL_SUBJECTS_KEY, []);
  const map = new Map<string, Subject>();
  [...INITIAL_SUBJECTS, ...custom].forEach(s => {
    if (s && s.id) map.set(s.id, s);
  });
  return Array.from(map.values());
}

export function getAllLocalArticles(): Article[] {
  const custom = readJson<Article[]>(LOCAL_ARTICLES_KEY, []);
  const map = new Map<string, Article>();
  [...custom, ...STUDY_ARTICLES].forEach(a => {
    if (a && a.id) map.set(a.id, a);
  });
  return Array.from(map.values());
}

// =========================================================================
// EXAM RESULTS & DASHBOARD
// =========================================================================
export function saveLocalExamResult(result: ExamResult, user: User | null): ExamResult {
  const list = readJson<ExamResult[]>(LOCAL_EXAM_RESULTS_KEY, []);
  const enriched: ExamResult = {
    ...result,
    userId: result.userId || user?.id || 'local_scholar'
  };
  list.unshift(enriched);
  writeJson(LOCAL_EXAM_RESULTS_KEY, list.slice(0, 100));

  if (auth.currentUser) {
    saveExamResultToFirestore(enriched).catch(() => {});
  }
  return enriched;
}

export async function getLocalDashboardStats(user: User | null) {
  let exams = readJson<ExamResult[]>(LOCAL_EXAM_RESULTS_KEY, []);
  if (user?.id) {
    exams = exams.filter(e => !e.userId || e.userId === user.id || e.userId === 'local_scholar');
  }
  if (auth.currentUser && user?.id === auth.currentUser.uid) {
    try {
      const fsExams = await fetchUserExamResultsFromFirestore(user.id);
      if (fsExams.length > 0) {
        const seen = new Set(exams.map(e => e.id));
        fsExams.forEach(fe => {
          if (!seen.has(fe.id)) exams.push(fe);
        });
      }
    } catch {}
  }

  exams.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalAnswered = exams.reduce((sum, e) => sum + (e.totalQuestions || 0), 0);
  const avgScore = exams.length > 0
    ? Math.round(exams.reduce((sum, e) => sum + (e.scorePercentage || 0), 0) / exams.length)
    : (user?.stats?.averageScore ?? 0);
  const bestScore = exams.length > 0
    ? Math.max(...exams.map(e => e.scorePercentage || 0))
    : (user?.stats?.bestScore ?? 0);

  return {
    stats: {
      questionsAnswered: Math.max(totalAnswered, user?.stats?.questionsAnswered || 0),
      averageScore: avgScore,
      bestScore,
      weakestSubject: user?.stats?.weakestSubject || 'Physics'
    },
    recentExams: exams.slice(0, 10),
    recommendedTopics: [
      { topic: 'Mechanics & Newton Laws', subjectName: 'Physics', subjectId: 'physics', questionsAvailable: 24 },
      { topic: 'Calculus & Derivatives', subjectName: 'Mathematics', subjectId: 'mathematics', questionsAvailable: 30 },
      { topic: 'Acids, Bases & Salts', subjectName: 'Chemistry', subjectId: 'chemistry', questionsAvailable: 20 }
    ]
  };
}

// =========================================================================
// PAYMENTS & MERCHANT CONFIG
// =========================================================================
const DEFAULT_PAYMENT_CONFIG = {
  bankName: 'OPay (PayCom)',
  accountNumber: '9166059676',
  accountName: 'INIOLUWA JESULEKE MICHEAL',
  bankCode: '999992',
  ussdTemplate: '*955*2*9166059676*{amount}#',
  instructions: 'Transfer the fee directly to OPay account 9166059676 (INIOLUWA JESULEKE MICHEAL) via your OPay app, PalmPay, Kuda, or ANY Nigerian bank app, then upload your transfer receipt screenshot.'
};

export function getLocalPaymentConfig() {
  return readJson(LOCAL_PAYMENT_CONFIG_KEY, DEFAULT_PAYMENT_CONFIG);
}

export function updateLocalPaymentConfig(config: Record<string, any>) {
  const updated = { ...getLocalPaymentConfig(), ...config, updatedAt: new Date().toISOString() };
  writeJson(LOCAL_PAYMENT_CONFIG_KEY, updated);
  return { success: true, config: updated };
}

export function initializeLocalPayment(
  user: User | null,
  planId: 'basic' | 'medium' | 'premium',
  paymentMethod = 'opay',
  phoneNumber?: string
) {
  const plan = PRICING_PLANS.find(p => p.id === planId) || PRICING_PLANS[1];
  const cfg = getLocalPaymentConfig();
  const hasArenaDiscount = Boolean(user?.arenaDiscountExpiresAt && new Date(user.arenaDiscountExpiresAt).getTime() > Date.now());
  const discountRate = hasArenaDiscount ? 0.25 : 0;
  const finalAmount = Math.round(plan.priceAmount * (1 - discountRate));
  const reference = `SN-${planId.toUpperCase()}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

  const record: PaymentRecord = {
    id: reference,
    reference,
    userId: user?.id || 'guest',
    userName: user?.name || 'StudyNaija Scholar',
    userEmail: user?.email || 'scholar@studynaija.ng',
    userPhone: phoneNumber || user?.phone,
    planId,
    planName: plan.name,
    amount: finalAmount,
    paymentMethod,
    bankName: cfg.bankName,
    accountNumber: cfg.accountNumber,
    accountName: cfg.accountName,
    status: 'pending',
    createdAt: Date.now()
  };

  const payments = readJson<PaymentRecord[]>(LOCAL_PAYMENTS_KEY, []);
  payments.unshift(record);
  writeJson(LOCAL_PAYMENTS_KEY, payments);

  return {
    success: true,
    reference,
    amount: finalAmount,
    originalAmount: plan.priceAmount,
    discountApplied: hasArenaDiscount,
    planId,
    planName: plan.name,
    paymentMethod,
    bankName: cfg.bankName,
    accountNumber: cfg.accountNumber,
    accountName: cfg.accountName,
    ussdCode: (cfg.ussdTemplate || '*955*2*9166059676*{amount}#').replace('{amount}', String(finalAmount)),
    instructions: cfg.instructions
  };
}

export function verifyLocalPayment(
  user: User | null,
  payload: {
    reference: string;
    senderAccountName?: string;
    senderBank?: string;
    receiptScreenshotUrl?: string;
    planId?: string;
  }
) {
  const payments = readJson<PaymentRecord[]>(LOCAL_PAYMENTS_KEY, []);
  const idx = payments.findIndex(p => p.reference === payload.reference);
  const existing = idx >= 0 ? payments[idx] : null;
  const planId = (payload.planId || existing?.planId || 'medium') as 'basic' | 'medium' | 'premium';
  const plan = PRICING_PLANS.find(p => p.id === planId) || PRICING_PLANS[1];
  const cfg = getLocalPaymentConfig();

  const updatedRecord: PaymentRecord = {
    ...(existing || {
      id: payload.reference,
      reference: payload.reference,
      userId: user?.id || 'guest',
      userName: user?.name || 'StudyNaija Scholar',
      userEmail: user?.email || 'scholar@studynaija.ng',
      planId,
      planName: plan.name,
      amount: plan.priceAmount,
      paymentMethod: 'opay',
      bankName: cfg.bankName,
      accountNumber: cfg.accountNumber,
      accountName: cfg.accountName,
      createdAt: Date.now()
    }),
    senderAccountName: payload.senderAccountName || user?.name || 'Student Transfer',
    senderBank: payload.senderBank || 'OPay / Bank Transfer',
    receiptScreenshotUrl: payload.receiptScreenshotUrl,
    submittedAt: Date.now(),
    status: 'pending',
    aiVerifiedBy: 'SabiPay Verification Queue',
    aiAuditNotes: 'Transfer proof received and queued for Inioluwa\'s confirmation on OPay (9166059676).'
  };

  if (idx >= 0) {
    payments[idx] = updatedRecord;
  } else {
    payments.unshift(updatedRecord);
  }
  writeJson(LOCAL_PAYMENTS_KEY, payments);

  return {
    success: true,
    status: 'pending',
    payment: updatedRecord,
    message: 'Payment transfer proof submitted! Awaiting admin verification in Admin Portal -> Payments Queue.',
    aiAudit: {
      notes: updatedRecord.aiAuditNotes
    }
  };
}

export function getLocalPaymentStatus(reference: string, currentUser: User | null) {
  const payments = readJson<PaymentRecord[]>(LOCAL_PAYMENTS_KEY, []);
  const payment = payments.find(p => p.reference === reference);
  if (!payment) {
    return { status: 'pending', payment: null };
  }
  let updatedUser: User | undefined;
  if (payment.status === 'approved' && currentUser) {
    updatedUser = {
      ...currentUser,
      premiumPlan: payment.planId as User['premiumPlan']
    };
  }
  return { status: payment.status, payment, user: updatedUser };
}

export function getLocalAdminPayments() {
  const payments = readJson<PaymentRecord[]>(LOCAL_PAYMENTS_KEY, []);
  return { success: true, payments };
}

export function approveLocalAdminPayment(
  reference: string,
  updateDirectoryUser: (userId: string, updater: (u: LocalStoredUser) => LocalStoredUser) => void
) {
  const payments = readJson<PaymentRecord[]>(LOCAL_PAYMENTS_KEY, []);
  const idx = payments.findIndex(p => p.reference === reference);
  if (idx < 0) throw new Error('Payment reference not found');
  payments[idx] = {
    ...payments[idx],
    status: 'approved',
    approvedAt: Date.now(),
    approvedBy: 'Admin'
  };
  writeJson(LOCAL_PAYMENTS_KEY, payments);
  updateDirectoryUser(payments[idx].userId, u => ({
    ...u,
    premiumPlan: payments[idx].planId as User['premiumPlan']
  }));
  return { success: true, message: `Approved ${payments[idx].planName} for ${payments[idx].userName}.`, payment: payments[idx] };
}

export function rejectLocalAdminPayment(reference: string, reason?: string) {
  const payments = readJson<PaymentRecord[]>(LOCAL_PAYMENTS_KEY, []);
  const idx = payments.findIndex(p => p.reference === reference);
  if (idx < 0) throw new Error('Payment reference not found');
  payments[idx] = {
    ...payments[idx],
    status: 'rejected',
    rejectionReason: reason || 'Transfer not confirmed in receiving account'
  };
  writeJson(LOCAL_PAYMENTS_KEY, payments);
  return { success: true, message: 'Payment marked as rejected.', payment: payments[idx] };
}

export function banTrollLocalPayment(
  reference: string,
  reason: string | undefined,
  updateDirectoryUser: (userId: string, updater: (u: LocalStoredUser) => LocalStoredUser) => void
) {
  const payments = readJson<PaymentRecord[]>(LOCAL_PAYMENTS_KEY, []);
  const idx = payments.findIndex(p => p.reference === reference);
  if (idx < 0) throw new Error('Payment reference not found');
  const banReason = reason || 'Submitted fraudulent payment confirmation';
  payments[idx] = {
    ...payments[idx],
    status: 'rejected',
    isTrollFlagged: true,
    rejectionReason: banReason
  };
  writeJson(LOCAL_PAYMENTS_KEY, payments);
  updateDirectoryUser(payments[idx].userId, u => ({
    ...u,
    isPaymentSuspended: true,
    paymentSuspendedReason: banReason
  }));
  return { success: true, message: `${payments[idx].userName} flagged and suspended from payment submissions.` };
}

export function unbanTrollLocalPayment(
  reference: string,
  updateDirectoryUser: (userId: string, updater: (u: LocalStoredUser) => LocalStoredUser) => void
) {
  const payments = readJson<PaymentRecord[]>(LOCAL_PAYMENTS_KEY, []);
  const idx = payments.findIndex(p => p.reference === reference);
  if (idx < 0) throw new Error('Payment reference not found');
  payments[idx] = {
    ...payments[idx],
    isTrollFlagged: false
  };
  writeJson(LOCAL_PAYMENTS_KEY, payments);
  updateDirectoryUser(payments[idx].userId, u => ({
    ...u,
    isPaymentSuspended: false,
    paymentSuspendedReason: undefined
  }));
  return { success: true, message: `${payments[idx].userName} has been unbanned.` };
}

// =========================================================================
// ADMIN CRUD & STATS
// =========================================================================
export function createLocalQuestion(questionData: any): Question {
  const custom = readJson<Question[]>(LOCAL_QUESTIONS_KEY, []);
  const q: Question = {
    id: questionData.id || `q_local_${Date.now()}`,
    subjectId: questionData.subjectId || 'english',
    subjectName: questionData.subjectName || questionData.subjectId || 'General',
    educationLevel: questionData.educationLevel || 'secondary',
    topic: questionData.topic || 'General Topic',
    examType: questionData.examType || 'JAMB',
    year: questionData.year ? Number(questionData.year) : 2026,
    question: questionData.question || '',
    options: questionData.options || { A: '', B: '', C: '', D: '' },
    correctOption: questionData.correctOption || 'A',
    explanation: questionData.explanation || 'Verified StudyNaija solution.',
    difficulty: questionData.difficulty || 'Medium'
  };
  custom.unshift(q);
  writeJson(LOCAL_QUESTIONS_KEY, custom);
  return q;
}

export function updateLocalQuestion(id: string, questionData: any): Question {
  const custom = readJson<Question[]>(LOCAL_QUESTIONS_KEY, []);
  const idx = custom.findIndex(q => q.id === id);
  const base = idx >= 0 ? custom[idx] : getAllLocalQuestionPool().find(q => q.id === id);
  const updated: Question = { ...(base || ({ id } as Question)), ...questionData, id };
  if (idx >= 0) {
    custom[idx] = updated;
  } else {
    custom.unshift(updated);
  }
  writeJson(LOCAL_QUESTIONS_KEY, custom);
  return updated;
}

export function deleteLocalQuestion(id: string) {
  const custom = readJson<Question[]>(LOCAL_QUESTIONS_KEY, []).filter(q => q.id !== id);
  writeJson(LOCAL_QUESTIONS_KEY, custom);
  return { success: true };
}

export function createLocalSubject(subjectData: any): Subject {
  const custom = readJson<Subject[]>(LOCAL_SUBJECTS_KEY, []);
  const sub: Subject = {
    id: subjectData.id || (subjectData.name || 'subject').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: subjectData.name || 'New Subject',
    code: subjectData.code || 'SUB',
    icon: subjectData.icon || '📚',
    educationLevel: subjectData.educationLevel || 'secondary',
    department: subjectData.department || 'general',
    description: subjectData.description || 'Nigerian exam preparation module.',
    topics: Array.isArray(subjectData.topics) ? subjectData.topics : ['Core Concepts'],
    questionCount: subjectData.questionCount || 20,
    featured: true
  };
  custom.push(sub);
  writeJson(LOCAL_SUBJECTS_KEY, custom);
  return sub;
}

export function createLocalArticle(articleData: any): Article {
  const custom = readJson<Article[]>(LOCAL_ARTICLES_KEY, []);
  const art: Article = {
    id: `art_local_${Date.now()}`,
    title: articleData.title || 'Study Guide',
    slug: (articleData.title || 'study-guide').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4),
    category: (['JAMB', 'WAEC', 'General', 'Time Management'].includes(articleData.category) ? articleData.category : 'General') as Article['category'],
    readTime: articleData.readTime || '4 min read',
    excerpt: articleData.excerpt || articleData.summary || (articleData.content || '').slice(0, 140),
    content: articleData.content || '',
    date: new Date().toISOString().split('T')[0],
    author: articleData.author || 'StudyNaija Academic Team',
    tags: Array.isArray(articleData.tags) ? articleData.tags : ['Study Tips']
  };
  custom.unshift(art);
  writeJson(LOCAL_ARTICLES_KEY, custom);
  return art;
}

export function deleteLocalArticle(id: string) {
  const custom = readJson<Article[]>(LOCAL_ARTICLES_KEY, []).filter(a => a.id !== id);
  writeJson(LOCAL_ARTICLES_KEY, custom);
  return { success: true };
}

export function getLocalAdminStats(users: LocalStoredUser[]): AdminStats {
  const exams = readJson<ExamResult[]>(LOCAL_EXAM_RESULTS_KEY, []);
  const payments = readJson<PaymentRecord[]>(LOCAL_PAYMENTS_KEY, []);
  const approvedPayments = payments.filter(p => p.status === 'approved');
  const activeSubs = users.filter(u => u.premiumPlan && u.premiumPlan !== 'free').length;
  const revenue = approvedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return {
    totalUsers: users.length,
    totalQuestions: getAllLocalQuestionPool().length,
    totalExamsTaken: exams.length,
    activeSubscriptions: activeSubs,
    monthlyRevenue: revenue,
    recentUsers: users.slice(0, 8).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      plan: u.premiumPlan || 'free',
      joined: (u.createdAt || new Date().toISOString()).split('T')[0]
    }))
  };
}

// =========================================================================
// AI TUTOR (NAIJA AI ENGINE + DAILY QUOTA)
// =========================================================================
function getPlanDailyLimit(plan?: string): { limit: number; isUnlimited: boolean } {
  switch (plan) {
    case 'premium':
      return { limit: 9999, isUnlimited: true };
    case 'medium':
      return { limit: 100, isUnlimited: false };
    case 'basic':
      return { limit: 25, isUnlimited: false };
    default:
      return { limit: 10, isUnlimited: false };
  }
}

export function getLocalAITutorStatus(user: User | null) {
  const today = new Date().toISOString().split('T')[0];
  const uid = user?.id || 'guest';
  const usageMap = readJson<Record<string, { date: string; count: number }>>(LOCAL_AI_USAGE_KEY, {});
  const entry = usageMap[uid];
  const usedToday = entry && entry.date === today ? entry.count : 0;
  const plan = user?.premiumPlan || 'free';
  const { limit, isUnlimited } = getPlanDailyLimit(plan);

  return {
    usedToday,
    dailyLimit: limit,
    remainingToday: isUnlimited ? 9999 : Math.max(0, limit - usedToday),
    isUnlimited,
    plan
  };
}

export function resetLocalAITutorTrial(user: User | null) {
  const today = new Date().toISOString().split('T')[0];
  const uid = user?.id || 'guest';
  const usageMap = readJson<Record<string, { date: string; count: number }>>(LOCAL_AI_USAGE_KEY, {});
  usageMap[uid] = { date: today, count: 0 };
  writeJson(LOCAL_AI_USAGE_KEY, usageMap);
  return { success: true, ...getLocalAITutorStatus(user) };
}

export function askLocalAITutor(
  user: User | null,
  payload: {
    message: string;
    topic?: string;
    subjectName?: string;
    examType?: string;
    questionContext?: string;
    chatHistory?: Array<{ sender: 'user' | 'tutor'; text: string }>;
    mode?: string;
  }
) {
  const status = getLocalAITutorStatus(user);
  if (!status.isUnlimited && status.remainingToday <= 0) {
    const err: any = new Error(`You have used all ${status.dailyLimit} daily Naija AI messages on the ${status.plan} plan. Upgrade your plan or reset your trial to continue!`);
    err.status = 429;
    err.data = { requiresUpgrade: true, ...status };
    throw err;
  }

  const today = new Date().toISOString().split('T')[0];
  const uid = user?.id || 'guest';
  const usageMap = readJson<Record<string, { date: string; count: number }>>(LOCAL_AI_USAGE_KEY, {});
  const nextCount = status.usedToday + 1;
  usageMap[uid] = { date: today, count: nextCount };
  writeJson(LOCAL_AI_USAGE_KEY, usageMap);

  const enrichedMessage = payload.questionContext
    ? `${payload.message}\n\nQuestion Context: ${payload.questionContext}`
    : payload.message;

  const replyText = generateNaijaAIResponse(
    enrichedMessage,
    payload.topic,
    payload.subjectName,
    user?.name?.split(' ')[0] || 'Scholar',
    payload.chatHistory
  );

  const updatedStatus = getLocalAITutorStatus(user);
  return {
    message: replyText,
    ...updatedStatus,
    groundingSources: [
      {
        title: 'JAMB & WAEC Official Nigerian Syllabus Reference',
        url: 'https://studynaija10.netlify.app',
        snippet: `${payload.subjectName || 'Academic'} mastery notes verified by Naija AI.`
      }
    ] as { title: string; url: string; snippet?: string }[],
    smartWebInsights: undefined as SmartWebInsights | undefined
  };
}

// =========================================================================
// BOOKMARKS
// =========================================================================
export function getLocalBookmarks(user: User | null): { bookmarks: Question[]; total: number; bookmarkedIds: string[] } {
  const uid = user?.id || 'guest';
  const store = readJson<Record<string, string[]>>(LOCAL_BOOKMARKS_KEY, {});
  const ids = store[uid] || [];
  const pool = getAllLocalQuestionPool();
  const bookmarks = ids
    .map(id => pool.find(q => q.id === id))
    .filter((q): q is Question => Boolean(q));
  return { bookmarks, total: bookmarks.length, bookmarkedIds: ids };
}

export function toggleLocalBookmark(user: User | null, questionId: string, bookmarked?: boolean) {
  const uid = user?.id || 'guest';
  const store = readJson<Record<string, string[]>>(LOCAL_BOOKMARKS_KEY, {});
  const current = new Set<string>(store[uid] || []);
  const shouldBookmark = typeof bookmarked === 'boolean' ? bookmarked : !current.has(questionId);

  if (shouldBookmark) {
    current.add(questionId);
    const q = getAllLocalQuestionPool().find(item => item.id === questionId);
    if (auth.currentUser && auth.currentUser.uid === uid && q) {
      saveBookmarkToFirestore(uid, questionId, q.subjectId, q.question).catch(() => {});
    }
  } else {
    current.delete(questionId);
    if (auth.currentUser && auth.currentUser.uid === uid) {
      removeBookmarkFromFirestore(uid, questionId).catch(() => {});
    }
  }

  const nextIds = Array.from(current);
  store[uid] = nextIds;
  writeJson(LOCAL_BOOKMARKS_KEY, store);

  return { success: true, isBookmarked: shouldBookmark, bookmarkedIds: nextIds };
}

// =========================================================================
// COMMUNITY LOUNGE CHAT
// =========================================================================
function getSeededCommunityMessages(): CommunityMessage[] {
  const now = Date.now();
  return [
    {
      id: 'cm_seed_1',
      channelId: 'general',
      userId: 'user-admin-demo',
      userName: 'StudyNaija Academic Coach',
      targetExam: 'JAMB',
      content: 'Welcome to the Nigerian Scholar Lounge! Drop any tough JAMB or WAEC question here or ask @NaijaAI for instant step-by-step explanations.',
      createdAt: new Date(now - 3600000).toISOString(),
      likes: 18,
      likedBy: [],
      isAiPinned: true,
      moderationStatus: 'approved'
    },
    {
      id: 'cm_seed_2',
      channelId: 'jamb',
      userId: 'user-student-demo',
      userName: 'Chukwuebuka Obi',
      targetExam: 'JAMB',
      targetCourse: 'Medicine & Surgery, UNILAG',
      content: 'Remember to practice 8-key CBT shortcuts (A, B, C, D, N, P, R, S) daily—aiming for 310+ in UTME 2027!',
      createdAt: new Date(now - 2400000).toISOString(),
      likes: 12,
      likedBy: [],
      moderationStatus: 'approved'
    },
    {
      id: 'cm_seed_3',
      channelId: 'waec',
      userId: 'user-student-demo',
      userName: 'Amina Bello',
      targetExam: 'WAEC',
      content: 'Tip for WAEC Chemistry titration: always record burette readings to 2 decimal places (e.g. 24.50 cm³) to keep full accuracy marks!',
      createdAt: new Date(now - 1800000).toISOString(),
      likes: 9,
      likedBy: [],
      moderationStatus: 'approved'
    }
  ];
}

function runClientModeration(text: string): ModerationResult {
  const lower = text.toLowerCase();
  const bannedTerms = ['expo', 'runz', 'leaked question', 'buy answers', 'cheat sheet leak'];
  if (bannedTerms.some(term => lower.includes(term))) {
    return {
      isAllowed: false,
      violationType: 'exam_malpractice',
      reason: 'StudyNaija strictly prohibits exam malpractice, "expo", or leaked answer claims.',
      cleanAdvice: 'Ask for topic explanations or step-by-step problem solving instead!'
    };
  }
  return { isAllowed: true, violationType: null };
}

export function getLocalCommunityMessages(channel = 'general', search?: string) {
  let msgs = readJson<CommunityMessage[]>(LOCAL_COMMUNITY_MSGS_KEY, []);
  if (msgs.length === 0) {
    msgs = getSeededCommunityMessages();
    writeJson(LOCAL_COMMUNITY_MSGS_KEY, msgs);
  }
  let filtered = msgs.filter(m => !channel || channel === 'all' || m.channelId === channel);
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(m =>
      m.content.toLowerCase().includes(q) || m.userName.toLowerCase().includes(q)
    );
  }
  return { success: true, channel, messages: filtered, totalCount: filtered.length };
}

export function postLocalCommunityMessage(user: User | null, payload: any) {
  const mod = runClientModeration(payload.content || '');
  if (!mod.isAllowed) {
    return { success: false, blocked: true, error: mod.reason, moderation: mod };
  }
  const msgs = readJson<CommunityMessage[]>(LOCAL_COMMUNITY_MSGS_KEY, getSeededCommunityMessages());
  const msg: CommunityMessage = {
    id: `cm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    channelId: payload.channelId || 'general',
    userId: user?.id || 'guest',
    userName: payload.authorName || user?.name || 'Scholar',
    userEmail: payload.authorEmail || user?.email,
    targetExam: user?.targetExam,
    targetCourse: user?.targetCourse,
    content: payload.content,
    replyToId: payload.replyToId,
    replyToSnippet: payload.replyToSnippet,
    tags: payload.tags || [],
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: [],
    moderationStatus: 'approved',
    userTournamentBadge: payload.userTournamentBadge,
    userThemeVariant: payload.userThemeVariant
  };
  msgs.push(msg);
  writeJson(LOCAL_COMMUNITY_MSGS_KEY, msgs);
  return { success: true, message: msg, moderation: mod };
}

export function likeLocalCommunityMessage(messageId: string, userId = 'guest') {
  const msgs = readJson<CommunityMessage[]>(LOCAL_COMMUNITY_MSGS_KEY, getSeededCommunityMessages());
  const idx = msgs.findIndex(m => m.id === messageId);
  if (idx < 0) return { success: false, likes: 0, isLiked: false };
  const likedBy = new Set<string>(msgs[idx].likedBy || []);
  let isLiked = false;
  if (likedBy.has(userId)) {
    likedBy.delete(userId);
  } else {
    likedBy.add(userId);
    isLiked = true;
  }
  msgs[idx].likedBy = Array.from(likedBy);
  msgs[idx].likes = Math.max(0, msgs[idx].likedBy.length);
  writeJson(LOCAL_COMMUNITY_MSGS_KEY, msgs);
  return { success: true, likes: msgs[idx].likes, isLiked };
}

export function requestLocalCommunityAiExplanation(questionText: string, channelId: CommunityChannel = 'general') {
  const replyText = generateNaijaAIResponse(questionText, undefined, undefined, 'Scholar');
  const msgs = readJson<CommunityMessage[]>(LOCAL_COMMUNITY_MSGS_KEY, getSeededCommunityMessages());
  const aiMsg: CommunityMessage = {
    id: `cm_ai_${Date.now()}`,
    channelId,
    userId: 'naija-ai',
    userName: 'Naija AI Tutor 🤖',
    content: replyText,
    createdAt: new Date().toISOString(),
    likes: 1,
    likedBy: [],
    isAiAssistant: true,
    moderationStatus: 'approved'
  };
  msgs.push(aiMsg);
  writeJson(LOCAL_COMMUNITY_MSGS_KEY, msgs);
  return { success: true, reply: aiMsg };
}

// =========================================================================
// COMMUNITY FORUM (FIRESTORE + LOCALSTORAGE SYNC)
// =========================================================================
function getSeededForumThreads(): ForumThread[] {
  const now = Date.now();
  return [
    {
      id: 'thread_jamb_2027_strategy',
      title: 'How to Score 300+ in JAMB UTME 2027 Without Stress',
      content: 'Share your daily CBT mock routines, Use of English timing strategies, and favorite past-question shortcuts here.',
      authorId: 'user-admin-demo',
      authorName: 'StudyNaija Academic Board',
      authorRole: 'admin',
      examType: 'JAMB',
      subjectId: 'english',
      subjectName: 'English Language',
      tags: ['JAMB 2027', '300+ Target', 'Strategy'],
      views: 142,
      likes: 24,
      likedBy: [],
      replyCount: 1,
      isPinned: true,
      isLocked: false,
      isSolved: false,
      moderationStatus: 'approved',
      createdAt: new Date(now - 86400000).toISOString(),
      updatedAt: new Date(now - 3600000).toISOString(),
      replies: [
        {
          id: 'reply_seed_1',
          threadId: 'thread_jamb_2027_strategy',
          authorId: 'user-student-demo',
          authorName: 'Chukwuebuka Obi',
          authorRole: 'student',
          content: 'Doing 2 timed 40-question drills per day and reviewing every wrong explanation raised my mock score from 215 to 292!',
          createdAt: new Date(now - 3600000).toISOString(),
          likes: 7,
          likedBy: [],
          isAcceptedAnswer: true
        }
      ]
    },
    {
      id: 'thread_waec_physics_laws',
      title: 'Quick Trick for Remembering Newton Laws & Projectile Motion Formulas',
      content: 'For projectile motion in JAMB/WAEC Physics: Time of flight T = 2u sinθ / g, Max Height H = u² sin²θ / 2g, Range R = u² sin2θ / g.',
      authorId: 'user-student-demo',
      authorName: 'Toluwanimi Adeyemi',
      authorRole: 'student',
      examType: 'WAEC',
      subjectId: 'physics',
      subjectName: 'Physics',
      tags: ['Physics', 'Formulas'],
      views: 89,
      likes: 15,
      likedBy: [],
      replyCount: 0,
      isPinned: false,
      isLocked: false,
      isSolved: true,
      moderationStatus: 'approved',
      createdAt: new Date(now - 43200000).toISOString(),
      updatedAt: new Date(now - 43200000).toISOString(),
      replies: []
    }
  ];
}

function loadLocalForumThreads(): ForumThread[] {
  let list = readJson<ForumThread[]>(LOCAL_FORUM_THREADS_KEY, []);
  if (list.length === 0) {
    list = getSeededForumThreads();
    writeJson(LOCAL_FORUM_THREADS_KEY, list);
  }
  return list;
}

export async function getLocalForumThreads(params?: {
  examCategory?: string;
  subjectId?: string;
  search?: string;
  sort?: 'latest' | 'popular' | 'unanswered' | 'solved';
}) {
  let local = loadLocalForumThreads();
  try {
    const fsThreads = await fetchForumThreadsFromFirestore();
    if (fsThreads.length > 0) {
      const map = new Map<string, ForumThread>();
      local.forEach(t => map.set(t.id, t));
      fsThreads.forEach(t => map.set(t.id, { ...(map.get(t.id) || {}), ...t }));
      local = Array.from(map.values());
    }
  } catch {}

  let filtered = local.filter(t => t.moderationStatus !== 'hidden');
  if (params?.examCategory && params.examCategory !== 'ALL') {
    filtered = filtered.filter(t => t.examType === params.examCategory);
  }
  if (params?.subjectId && params.subjectId !== 'all') {
    filtered = filtered.filter(t => t.subjectId === params.subjectId);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.content.toLowerCase().includes(q) ||
      t.authorName.toLowerCase().includes(q)
    );
  }
  if (params?.sort === 'popular') {
    filtered.sort((a, b) => (b.likes + b.replyCount) - (a.likes + a.replyCount));
  } else if (params?.sort === 'unanswered') {
    filtered = filtered.filter(t => (t.replyCount || 0) === 0);
  } else if (params?.sort === 'solved') {
    filtered = filtered.filter(t => t.isSolved);
  } else {
    filtered.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  return { success: true, threads: filtered, total: filtered.length };
}

export async function getLocalForumThread(threadId: string) {
  const local = loadLocalForumThreads();
  let thread = local.find(t => t.id === threadId);
  try {
    const fsThreads = await fetchForumThreadsFromFirestore();
    const fsMatch = fsThreads.find(t => t.id === threadId);
    if (fsMatch) {
      const fsReplies = await fetchForumRepliesFromFirestore(threadId);
      thread = { ...(thread || {}), ...fsMatch, replies: fsReplies.length > 0 ? fsReplies : (thread?.replies || []) };
    }
  } catch {}
  if (!thread) throw new Error('Forum discussion thread not found');
  return { success: true, thread };
}

export async function createLocalForumThread(user: User | null, payload: any) {
  const mod = runClientModeration(`${payload.title} ${payload.content}`);
  if (!mod.isAllowed) {
    const err: any = new Error(mod.reason || 'Content violates guidelines');
    err.moderation = mod;
    err.blocked = true;
    throw err;
  }
  const now = new Date().toISOString();
  const thread: ForumThread = {
    id: `thread_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: payload.title,
    content: payload.content,
    authorId: auth.currentUser?.uid || user?.id || 'guest',
    authorName: payload.authorName || user?.name || 'Scholar',
    authorEmail: payload.authorEmail || user?.email,
    authorRole: user?.role || 'student',
    authorTournamentBadge: payload.userTournamentBadge,
    authorThemeVariant: payload.userThemeVariant,
    examType: payload.examCategory || 'GENERAL',
    subjectId: payload.subjectId,
    subjectName: payload.subjectName,
    tags: payload.tags || [],
    views: 1,
    likes: 0,
    likedBy: [],
    replyCount: 0,
    isPinned: false,
    isLocked: false,
    isSolved: false,
    moderationStatus: 'approved',
    createdAt: now,
    updatedAt: now,
    replies: []
  };

  const list = loadLocalForumThreads();
  list.unshift(thread);
  writeJson(LOCAL_FORUM_THREADS_KEY, list);

  if (auth.currentUser) {
    createForumThreadInFirestore(thread).catch(() => {});
  }
  return { success: true, thread, moderation: mod };
}

export async function postLocalForumReply(user: User | null, threadId: string, payload: any) {
  const mod = runClientModeration(payload.content || '');
  if (!mod.isAllowed) {
    const err: any = new Error(mod.reason || 'Reply violates guidelines');
    err.moderation = mod;
    err.blocked = true;
    throw err;
  }
  const list = loadLocalForumThreads();
  const idx = list.findIndex(t => t.id === threadId);
  if (idx < 0) throw new Error('Forum thread not found');
  const reply: ForumReply = {
    id: `reply_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    threadId,
    authorId: auth.currentUser?.uid || user?.id || 'guest',
    authorName: payload.authorName || user?.name || 'Scholar',
    authorEmail: payload.authorEmail || user?.email,
    authorRole: user?.role || 'student',
    authorTournamentBadge: payload.userTournamentBadge,
    authorThemeVariant: payload.userThemeVariant,
    content: payload.content,
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: [],
    isAdminResponse: user?.role === 'admin'
  };
  list[idx].replies = [...(list[idx].replies || []), reply];
  list[idx].replyCount = list[idx].replies.length;
  list[idx].lastReplyAt = reply.createdAt;
  list[idx].updatedAt = reply.createdAt;
  writeJson(LOCAL_FORUM_THREADS_KEY, list);

  if (auth.currentUser) {
    addForumReplyInFirestore(threadId, { ...reply, newReplyCount: list[idx].replyCount } as any).catch(() => {});
  }
  return { success: true, reply, thread: list[idx], moderation: mod };
}

export function likeLocalForumThread(threadId: string, userId = 'guest') {
  const list = loadLocalForumThreads();
  const idx = list.findIndex(t => t.id === threadId);
  if (idx < 0) return { success: false, likes: 0, isLiked: false };
  const set = new Set<string>(list[idx].likedBy || []);
  let isLiked = false;
  if (set.has(userId)) set.delete(userId);
  else { set.add(userId); isLiked = true; }
  list[idx].likedBy = Array.from(set);
  list[idx].likes = list[idx].likedBy.length;
  writeJson(LOCAL_FORUM_THREADS_KEY, list);
  return { success: true, likes: list[idx].likes, isLiked };
}

export function likeLocalForumReply(threadId: string, replyId: string, userId = 'guest') {
  const list = loadLocalForumThreads();
  const idx = list.findIndex(t => t.id === threadId);
  if (idx < 0) return { success: false, likes: 0, isLiked: false };
  const replies = list[idx].replies || [];
  const rIdx = replies.findIndex(r => r.id === replyId);
  if (rIdx < 0) return { success: false, likes: 0, isLiked: false };
  const set = new Set<string>(replies[rIdx].likedBy || []);
  let isLiked = false;
  if (set.has(userId)) set.delete(userId);
  else { set.add(userId); isLiked = true; }
  replies[rIdx].likedBy = Array.from(set);
  replies[rIdx].likes = replies[rIdx].likedBy.length;
  writeJson(LOCAL_FORUM_THREADS_KEY, list);
  return { success: true, likes: replies[rIdx].likes, isLiked };
}

export async function pinLocalForumThread(threadId: string, isPinned: boolean) {
  const list = loadLocalForumThreads();
  const idx = list.findIndex(t => t.id === threadId);
  if (idx >= 0) {
    list[idx].isPinned = isPinned;
    writeJson(LOCAL_FORUM_THREADS_KEY, list);
  }
  if (auth.currentUser) {
    setForumThreadPinnedInFirestore(threadId, isPinned).catch(() => {});
  }
  return { success: true, isPinned };
}

export async function lockLocalForumThread(threadId: string, isLocked: boolean) {
  const list = loadLocalForumThreads();
  const idx = list.findIndex(t => t.id === threadId);
  if (idx >= 0) {
    list[idx].isLocked = isLocked;
    writeJson(LOCAL_FORUM_THREADS_KEY, list);
  }
  if (auth.currentUser) {
    setForumThreadLockedInFirestore(threadId, isLocked).catch(() => {});
  }
  return { success: true, isLocked };
}

export function markLocalForumThreadSolved(threadId: string, replyId?: string, isSolved?: boolean) {
  const list = loadLocalForumThreads();
  const idx = list.findIndex(t => t.id === threadId);
  if (idx < 0) throw new Error('Thread not found');
  const nextSolved = typeof isSolved === 'boolean' ? isSolved : true;
  list[idx].isSolved = nextSolved;
  list[idx].solvedReplyId = replyId;
  if (replyId && list[idx].replies) {
    list[idx].replies = list[idx].replies!.map(r => ({
      ...r,
      isAcceptedAnswer: r.id === replyId ? nextSolved : false
    }));
  }
  writeJson(LOCAL_FORUM_THREADS_KEY, list);
  return { success: true, isSolved: nextSolved, thread: list[idx] };
}

export async function moderateLocalForumThread(threadId: string, action: 'pin' | 'lock' | 'delete' | 'flag' | 'unflag', note?: string) {
  if (action === 'delete') {
    await deleteLocalForumThread(threadId);
    return { success: true };
  }
  const list = loadLocalForumThreads();
  const idx = list.findIndex(t => t.id === threadId);
  if (idx < 0) return { success: false };
  if (action === 'pin') list[idx].isPinned = !list[idx].isPinned;
  if (action === 'lock') list[idx].isLocked = !list[idx].isLocked;
  if (action === 'flag') { list[idx].moderationStatus = 'flagged'; list[idx].moderationReason = note; }
  if (action === 'unflag') { list[idx].moderationStatus = 'approved'; list[idx].moderationReason = undefined; }
  writeJson(LOCAL_FORUM_THREADS_KEY, list);
  return { success: true, thread: list[idx] };
}

export async function deleteLocalForumThread(threadId: string) {
  const list = loadLocalForumThreads().filter(t => t.id !== threadId);
  writeJson(LOCAL_FORUM_THREADS_KEY, list);
  if (auth.currentUser) {
    deleteForumThreadFromFirestore(threadId).catch(() => {});
  }
  return { success: true };
}

export function deleteLocalForumReply(threadId: string, replyId: string) {
  const list = loadLocalForumThreads();
  const idx = list.findIndex(t => t.id === threadId);
  if (idx >= 0 && list[idx].replies) {
    list[idx].replies = list[idx].replies!.filter(r => r.id !== replyId);
    list[idx].replyCount = list[idx].replies!.length;
    writeJson(LOCAL_FORUM_THREADS_KEY, list);
  }
  return { success: true };
}

// =========================================================================
// ADMIN SENTINEL SECURITY (BAN, UNBAN, SUSPEND, UNSUSPEND)
// =========================================================================
export function getLocalSecurityIncidents(): SecurityIncident[] {
  return readJson<SecurityIncident[]>(LOCAL_SECURITY_INCIDENTS_KEY, []);
}

export function getLocalSecurityStats(users: LocalStoredUser[]) {
  const incidents = getLocalSecurityIncidents();
  const dist: Record<string, number> = {};
  incidents.forEach(i => {
    dist[i.offenseType] = (dist[i.offenseType] || 0) + 1;
  });
  return {
    success: true,
    stats: {
      totalThreatsBlocked: incidents.length,
      bannedAccountsCount: users.filter(u => u.isBanned).length,
      suspendedAccountsCount: users.filter(u => u.isSuspended).length,
      activeProctoringScans: Math.max(12, users.length * 3),
      threatDistribution: dist,
      engineVersion: 'Sentinel AI v3.4 (Edge Guard)'
    }
  };
}

export function recordLocalSecurityAction(
  users: LocalStoredUser[],
  saveUsers: (next: LocalStoredUser[]) => void,
  action: 'ban' | 'suspend' | 'unban' | 'unsuspend' | 'clear_strikes',
  userId: string,
  reason = '',
  durationHours = 24
) {
  const idx = users.findIndex(u => u.id === userId);
  if (idx < 0) throw new Error('User not found in directory');
  const now = new Date();
  let nextUser: LocalStoredUser = { ...users[idx] };
  let incident: SecurityIncident | undefined;

  if (action === 'ban') {
    nextUser = {
      ...nextUser,
      isBanned: true,
      isSuspended: false,
      banReason: reason || 'Admin Sentinel permanent ban',
      bannedAt: now.toISOString(),
      securityStrikes: (nextUser.securityStrikes || 0) + 1
    };
    incident = {
      id: `inc_${Date.now()}`,
      userId: nextUser.id,
      userName: nextUser.name,
      userEmail: nextUser.email,
      offenseType: 'proctoring_violation',
      severity: 'critical',
      details: reason || 'Account permanently banned by Administrator.',
      evidence: 'Manual Sentinel AI Sanction',
      actionTaken: 'banned_permanently',
      detectedBy: 'Admin Sentinel',
      timestamp: now.toISOString(),
      status: 'active'
    };
  } else if (action === 'suspend') {
    const until = new Date(now.getTime() + durationHours * 3600000).toISOString();
    nextUser = {
      ...nextUser,
      isSuspended: true,
      suspensionExpiresAt: until,
      suspensionReason: reason || `Suspended for ${durationHours}h`,
      securityStrikes: (nextUser.securityStrikes || 0) + 1
    };
    incident = {
      id: `inc_${Date.now()}`,
      userId: nextUser.id,
      userName: nextUser.name,
      userEmail: nextUser.email,
      offenseType: 'proctoring_violation',
      severity: 'major',
      details: reason || `Temporary ${durationHours}h suspension.`,
      evidence: 'Manual Sentinel AI Suspension',
      actionTaken: durationHours >= 168 ? 'suspended_7d' : 'suspended_24h',
      detectedBy: 'Admin Sentinel',
      timestamp: now.toISOString(),
      status: 'active'
    };
  } else if (action === 'unban') {
    nextUser = {
      ...nextUser,
      isBanned: false,
      banReason: undefined,
      bannedAt: undefined
    };
  } else if (action === 'unsuspend') {
    nextUser = {
      ...nextUser,
      isSuspended: false,
      suspensionExpiresAt: undefined,
      suspensionReason: undefined
    };
  } else if (action === 'clear_strikes') {
    nextUser = {
      ...nextUser,
      securityStrikes: 0
    };
  }

  const nextUsers = [...users];
  nextUsers[idx] = nextUser;
  saveUsers(nextUsers);

  if (incident) {
    const incidents = getLocalSecurityIncidents();
    incidents.unshift(incident);
    writeJson(LOCAL_SECURITY_INCIDENTS_KEY, incidents.slice(0, 100));
  }

  const { password: _, ...safeUser } = nextUser;
  return {
    success: true,
    message: `Security action (${action}) completed for ${safeUser.name}.`,
    user: safeUser,
    incident
  };
}

export function simulateLocalSecurityThreat(threatType: string, users: LocalStoredUser[]) {
  const sampleStudent = users.find(u => u.role !== 'admin') || users[0];
  const validType = (threatType || 'cbt_speed_hack') as OffenseType;
  const incident: SecurityIncident = {
    id: `inc_sim_${Date.now()}`,
    userId: sampleStudent?.id || 'sim_user',
    userName: sampleStudent?.name || 'Simulated Tester',
    userEmail: sampleStudent?.email || 'tester@studynaija.ng',
    offenseType: validType,
    severity: validType === 'cbt_speed_hack' || validType === 'score_tampering' ? 'critical' : 'major',
    details: `Simulated Sentinel AI interception for [${validType}] integrity check.`,
    evidence: 'Automated Anomaly Probe (Static Edge Guard)',
    actionTaken: 'warned',
    detectedBy: 'Sentinel AI v3.4',
    timestamp: new Date().toISOString(),
    status: 'resolved'
  };
  const incidents = getLocalSecurityIncidents();
  incidents.unshift(incident);
  writeJson(LOCAL_SECURITY_INCIDENTS_KEY, incidents.slice(0, 100));
  return { success: true, message: 'Threat simulation intercepted.', incident };
}

// =========================================================================
// ARENA MATCH RECORDS, MONTHLY WINNERS, NOTIFICATIONS, HARVESTER & NEWS
// =========================================================================
export function saveLocalArenaMatch(match: VerifiedArenaMatch) {
  const matches = readJson<VerifiedArenaMatch[]>(LOCAL_ARENA_MATCHES_KEY, []);
  matches.unshift(match);
  writeJson(LOCAL_ARENA_MATCHES_KEY, matches.slice(0, 50));
}

export function verifyLocalArenaMatch(codeOrId: string) {
  const clean = codeOrId.trim().toLowerCase();
  const matches = readJson<VerifiedArenaMatch[]>(LOCAL_ARENA_MATCHES_KEY, []);
  const found = matches.find(m =>
    m.matchId.toLowerCase() === clean ||
    m.verificationCode.toLowerCase() === clean
  );
  if (!found) {
    throw new Error('Arena match record not found on this device. Play a match first or enter a valid SN-ARENA code.');
  }
  return {
    success: true,
    match: found,
    ledger: 'StudyNaija Verified Arena Ledger',
    verifiedAt: new Date().toISOString()
  };
}

export function verifyLocalExamResult(idOrCode: string) {
  const clean = idOrCode.trim().toLowerCase();
  const exams = readJson<ExamResult[]>(LOCAL_EXAM_RESULTS_KEY, []);
  const found = exams.find(e =>
    e.id.toLowerCase() === clean ||
    (e.candidateRegNo && e.candidateRegNo.toLowerCase() === clean)
  );
  if (!found) {
    throw new Error('Exam certificate record not found. Verify the Exam ID from your dashboard.');
  }
  return {
    success: true,
    exam: found,
    ledger: 'StudyNaija Official CBT Ledger'
  };
}

export function claimLocalMonthlyPrize(user: User | null, data: { phoneNumber: string; network: string; notes?: string }) {
  const season = getMonthlySeasonInfo();
  const claim: MonthlyWinnerRecord = {
    id: `win_${Date.now()}`,
    seasonKey: season.seasonKey,
    seasonTitle: season.seasonTitle,
    month: season.currentMonthName,
    year: season.currentYear,
    rank: 1,
    userId: user?.id || 'guest',
    studentName: user?.name || 'Scholar',
    studentEmail: user?.email || 'scholar@studynaija.ng',
    score: user?.xp || 100,
    prizeLabel: MONTHLY_PRIZES[0]?.label || '1st Place Champion',
    prizeAmount: MONTHLY_PRIZES[0]?.cashOrVoucher || '₦2,000 Airtime / Data Grant',
    verificationCode: `WIN-${season.seasonKey.replace('-', '')}-R1-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    phoneNumber: data.phoneNumber,
    network: data.network,
    status: 'ready_to_send',
    createdAt: new Date().toISOString(),
    claimedAt: new Date().toISOString(),
    notes: data.notes
  };
  const claims = readJson<MonthlyWinnerRecord[]>(LOCAL_PRIZE_CLAIMS_KEY, []);
  claims.unshift(claim);
  writeJson(LOCAL_PRIZE_CLAIMS_KEY, claims);
  return { success: true, claim, message: 'Airtime claim details recorded for admin fulfillment!' };
}

export function getLocalMyPrizeClaim(user: User | null) {
  const claims = readJson<MonthlyWinnerRecord[]>(LOCAL_PRIZE_CLAIMS_KEY, []);
  const mine = claims.find(c => c.userId === user?.id);
  return { hasClaim: Boolean(mine), claim: mine || null };
}

export function getLocalAdminMonthlyWinners() {
  const season = getMonthlySeasonInfo();
  const winners = readJson<MonthlyWinnerRecord[]>(LOCAL_PRIZE_CLAIMS_KEY, []);
  return { success: true, winners, currentSeason: season };
}

export function fulfillLocalMonthlyWinner(id: string, notes?: string) {
  const winners = readJson<MonthlyWinnerRecord[]>(LOCAL_PRIZE_CLAIMS_KEY, []);
  const idx = winners.findIndex(w => w.id === id);
  if (idx >= 0) {
    winners[idx] = {
      ...winners[idx],
      status: 'fulfilled',
      fulfilledAt: new Date().toISOString(),
      notes: notes || winners[idx].notes
    };
    writeJson(LOCAL_PRIZE_CLAIMS_KEY, winners);
  }
  return { success: true, message: 'Marked prize as fulfilled.' };
}

export function updateLocalMonthlyWinnerPhone(id: string, phoneNumber: string, network: string, notes?: string) {
  const winners = readJson<MonthlyWinnerRecord[]>(LOCAL_PRIZE_CLAIMS_KEY, []);
  const idx = winners.findIndex(w => w.id === id);
  if (idx >= 0) {
    winners[idx] = { ...winners[idx], phoneNumber, network, notes };
    writeJson(LOCAL_PRIZE_CLAIMS_KEY, winners);
  }
  return { success: true, message: 'Winner phone details updated.' };
}

export function getLocalAdminNotifications() {
  const notifs = readJson<AdminNotification[]>(LOCAL_ADMIN_NOTIFS_KEY, [
    {
      id: 'notif_welcome_admin',
      type: 'system',
      title: 'StudyNaija Static Edge Ready',
      message: 'All student study paths, CBT mocks, forums, and AI Tutor features are operating in high-speed static mode.',
      timestamp: new Date().toISOString(),
      read: false,
      emailSentTo: 'luvkidjaja@gmail.com'
    }
  ]);
  return {
    success: true,
    notifications: notifs,
    unreadCount: notifs.filter(n => !n.read).length
  };
}

export function markLocalAdminNotificationRead(id?: string) {
  const { notifications } = getLocalAdminNotifications();
  const updated = notifications.map(n => (!id || n.id === id ? { ...n, read: true } : n));
  writeJson(LOCAL_ADMIN_NOTIFS_KEY, updated);
  return { success: true };
}

export function getLocalHarvestPresetSources() {
  return {
    success: true,
    sources: [
      { name: 'StudyNaija Verified JAMB Past Bank', url: 'https://studynaija10.netlify.app', examType: 'JAMB' },
      { name: 'WAEC & NECO Standard Syllabus Archive', url: 'https://waeconline.org.ng', examType: 'WAEC' }
    ]
  };
}

export function harvestLocalQuestions(params: { examType: string; subjectId: string; year?: number; topic?: string; count?: number; rawText?: string }) {
  const pool = getAllLocalQuestionPool().filter(q =>
    (!params.subjectId || params.subjectId === 'all' || q.subjectId === params.subjectId) &&
    (!params.examType || params.examType === 'ALL' || q.examType === params.examType || q.examType === 'ALL')
  );
  const sliced = pool.slice(0, params.count || 10);
  return {
    success: true,
    questions: sliced,
    count: sliced.length,
    source: 'StudyNaija Verified Offline Bank'
  };
}

export function getLocalTrendingNewsTopics() {
  return {
    success: true,
    trendingTopics: [
      { id: 't1', category: 'exam_updates', title: 'JAMB UTME 2027 Syllabus & Registration Guidelines', query: 'What are the key tips and subject requirements for JAMB UTME 2027?', badge: 'JAMB 2027' },
      { id: 't2', category: 'exam_updates', title: 'WAEC SSCE May/June Marking Scheme & Practicals Guide', query: 'Explain the WAEC SSCE marking scheme and science practical tips', badge: 'WAEC' },
      { id: 't3', category: 'current_events', title: 'Federal University Cut-Off Marks & Post-UTME', query: 'How do UNILAG, UI, OAU, and UNN calculate Post-UTME aggregate scores?', badge: 'Admissions' }
    ]
  };
}

export function queryLocalNewsAgent(queryText: string, mode = 'news') {
  const answer = generateNaijaAIResponse(queryText, mode, 'Current Affairs & Exams', 'Scholar');
  return {
    success: true,
    answer,
    summary: answer,
    mode,
    searchQueries: [queryText],
    citations: [
      { title: 'StudyNaija Academic Intelligence', url: 'https://studynaija10.netlify.app', snippet: 'Curated Nigerian exam & educational guidance.' }
    ],
    timestamp: new Date().toISOString()
  };
}
