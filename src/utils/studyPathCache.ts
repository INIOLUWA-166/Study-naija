import { PersonalizedStudyPath, Question, StudyPathModule, User } from '../types';
import { INITIAL_QUESTIONS, INITIAL_SUBJECTS } from '../mockData';
import { EXTENDED_QUESTIONS } from './questionBank';

export const STUDY_PATH_CACHE_NAME = 'studynaija-study-paths-v1';
export const QUESTIONS_API_CACHE_NAME = 'studynaija-questions-api-v1';
const STORAGE_STUDY_PATH_FALLBACK_PREFIX = 'studynaija_sw_study_path_';

export interface CachedStudyPathRecord {
  studyPath: PersonalizedStudyPath;
  cachedAt: string;
  sizeKb: number;
  storedInServiceWorkerCache: boolean;
}

export interface ServiceWorkerCacheStatus {
  serviceWorkerSupported: boolean;
  cacheApiSupported: boolean;
  swRegistered: boolean;
  swActive: boolean;
  cachedStudyPathEntries: number;
  cachedQuestionEntries: number;
}

function getStudentKey(user: User | null): string {
  return user?.id || 'guest_student';
}

function getScheduledSubjectsFromPlanner(user: User | null): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`studynaija_daily_planner_${user?.id || 'guest'}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const ids = parsed
      .map((t: any) => (typeof t?.subjectId === 'string' ? t.subjectId.toLowerCase() : ''))
      .filter(Boolean);
    return Array.from(new Set(ids));
  } catch {
    return [];
  }
}

export function buildPersonalizedStudyPathUrl(user: User | null, extraSubjectIds?: string[]): string {
  const params = new URLSearchParams();
  const studentId = getStudentKey(user);
  const level = user?.educationLevel || 'secondary';
  const exam = user?.targetExam || (level === 'primary' ? 'COMMON_ENTRANCE' : level === 'university' ? 'UNIVERSITY_GST' : 'JAMB');
  const weakSubject = user?.stats?.weakestSubject || 'Physics';

  params.set('studentId', studentId);
  params.set('level', level);
  params.set('exam', exam);
  params.set('weakSubject', weakSubject);
  if (user?.name) {
    params.set('studentName', user.name);
  }
  if (user?.targetCourse) {
    params.set('targetCourse', user.targetCourse);
  }

  const plannerSubjects = getScheduledSubjectsFromPlanner(user);
  const combinedSubjects = Array.from(new Set([...(extraSubjectIds || []), ...plannerSubjects]));
  if (combinedSubjects.length > 0) {
    params.set('subjects', combinedSubjects.slice(0, 6).join(','));
  }

  return `/api/study-paths/personalized?${params.toString()}`;
}

export function generateLocalPersonalizedStudyPath(
  user: User | null,
  cacheUrl: string,
  extraSubjectIds?: string[]
): PersonalizedStudyPath {
  const studentId = getStudentKey(user);
  const studentName = user?.name || 'Nigerian Scholar';
  const level = user?.educationLevel || 'secondary';
  const targetExam = user?.targetExam || (level === 'primary' ? 'COMMON_ENTRANCE' : level === 'university' ? 'UNIVERSITY_GST' : 'JAMB');
  const targetCourse = user?.targetCourse || 'General Studies';
  const weakSubject = user?.stats?.weakestSubject || 'Physics';

  const levelSubjects = INITIAL_SUBJECTS.filter(s => !s.educationLevel || s.educationLevel === level);
  const plannerSubjects = getScheduledSubjectsFromPlanner(user);
  const requestedIds = Array.from(new Set([...(extraSubjectIds || []), ...plannerSubjects]));

  const weakMatch = levelSubjects.find(
    s => s.id.toLowerCase() === weakSubject.toLowerCase() || s.name.toLowerCase().includes(weakSubject.toLowerCase())
  );

  const selectedList: typeof levelSubjects = [];
  const pushUnique = (sub?: typeof levelSubjects[number]) => {
    if (sub && !selectedList.some(item => item.id === sub.id)) {
      selectedList.push(sub);
    }
  };

  requestedIds.forEach(id => {
    pushUnique(
      levelSubjects.find(s => s.id.toLowerCase() === id.toLowerCase()) ||
      INITIAL_SUBJECTS.find(s => s.id.toLowerCase() === id.toLowerCase())
    );
  });
  pushUnique(weakMatch);
  pushUnique(levelSubjects.find(s => s.id === 'english' || s.id.includes('english')));
  pushUnique(levelSubjects.find(s => s.id === 'mathematics' || s.id === 'maths' || s.id.includes('math')));
  levelSubjects.forEach(s => {
    if (selectedList.length < 4) pushUnique(s);
  });

  const combinedBank = [...EXTENDED_QUESTIONS, ...INITIAL_QUESTIONS];
  const bundledQuestions: Question[] = [];
  const seenIds = new Set<string>();

  const modules: StudyPathModule[] = selectedList.map((sub, idx) => {
    const subQuestions = combinedBank.filter(q => q.subjectId === sub.id).slice(0, 30);
    subQuestions.forEach(q => {
      if (!seenIds.has(q.id)) {
        seenIds.add(q.id);
        bundledQuestions.push(q);
      }
    });

    const isWeak = weakMatch?.id === sub.id;
    const priority: StudyPathModule['priority'] = isWeak ? 'critical' : idx < 2 ? 'high' : 'recommended';

    return {
      id: `module-${sub.id}`,
      subjectId: sub.id,
      subjectName: sub.name,
      priority,
      reason: isWeak
        ? `Targeted boost for your priority weak subject (${weakSubject})`
        : idx === 0 || sub.id === 'english'
          ? `Compulsory ${targetExam} core foundation`
          : `Curated ${targetExam} syllabus drill module`,
      topics: (sub.topics || []).slice(0, 5),
      questionCount: subQuestions.length,
      estimatedMinutes: Math.max(20, subQuestions.length * 2),
      questionsUrl: `/api/questions?subjectId=${encodeURIComponent(sub.id)}&level=${encodeURIComponent(level)}&limit=60&dailyRandomize=false`
    };
  });

  const payload: PersonalizedStudyPath = {
    id: `path-${studentId}-${level}`,
    studentId,
    studentName,
    educationLevel: level,
    targetExam,
    targetCourse,
    weakestSubject: weakMatch?.name || weakSubject,
    title: `${targetExam} Personalized Study Path — ${studentName.split(' ')[0]}`,
    cacheUrl,
    prefetchUrls: modules.map(m => m.questionsUrl),
    modules,
    questions: bundledQuestions,
    totalTopics: modules.reduce((sum, m) => sum + m.topics.length, 0),
    totalQuestions: bundledQuestions.length,
    estimatedSizeKb: 0,
    generatedAt: new Date().toISOString(),
    source: 'offline-generator'
  };

  payload.estimatedSizeKb = Math.max(8, Math.round(new Blob([JSON.stringify(payload)]).size / 1024));
  return payload;
}

async function putJsonInCache(cacheName: string, url: string, data: unknown): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;
  try {
    const cache = await window.caches.open(cacheName);
    const body = JSON.stringify(data);
    const response = new Response(body, {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-StudyNaija-Offline-Cache': 'true',
        'X-Cached-At': new Date().toISOString()
      }
    });
    await cache.put(new Request(url, { method: 'GET' }), response);
    return true;
  } catch (err) {
    console.warn('Cache Storage write skipped:', err);
    return false;
  }
}

export const studyPathCacheManager = {
  /**
   * Fetches the personalized study path from server (if online & backend active) and
   * persists both the study path bundle and all subject question sets into Service Worker Cache Storage.
   */
  downloadPersonalizedStudyPath: async (
    user: User | null,
    extraSubjectIds?: string[],
    authToken?: string | null
  ): Promise<CachedStudyPathRecord> => {
    const cacheUrl = buildPersonalizedStudyPathUrl(user, extraSubjectIds);
    let studyPath: PersonalizedStudyPath | null = null;

    // 1. Attempt network fetch so Workbox runtimeCaching intercepts and caches live backend payload
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch(cacheUrl, { headers });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        if (json && Array.isArray(json.modules)) {
          studyPath = {
            ...json,
            cacheUrl,
            source: 'network'
          };
        }
      }
    } catch {
      // Offline or backend unavailable; will synthesize and write into SW Cache Storage directly
    }

    if (!studyPath) {
      studyPath = generateLocalPersonalizedStudyPath(user, cacheUrl, extraSubjectIds);
    }

    const cachedAt = new Date().toISOString();
    const studyPathPayload: PersonalizedStudyPath = {
      ...studyPath,
      cacheUrl,
      source: 'service-worker-cache'
    };

    // 2. Write personalized study path explicitly to Service Worker Cache Storage
    const storedStudyPath = await putJsonInCache(STUDY_PATH_CACHE_NAME, cacheUrl, studyPathPayload);

    // 3. Prefetch & cache per-subject question API URLs so PracticeView works offline via SW Cache Storage
    await Promise.all(
      studyPathPayload.modules.map(async (mod) => {
        let cachedViaNetwork = false;
        try {
          const qRes = await fetch(mod.questionsUrl);
          const qType = qRes.headers.get('content-type') || '';
          if (qRes.ok && qType.includes('application/json')) {
            const qJson = await qRes.json();
            if (qJson && Array.isArray(qJson.questions)) {
              await putJsonInCache(QUESTIONS_API_CACHE_NAME, mod.questionsUrl, qJson);
              cachedViaNetwork = true;
            }
          }
        } catch {
          // Offline or static host fallback
        }

        if (!cachedViaNetwork) {
          const modQuestions = studyPathPayload.questions.filter(q => q.subjectId === mod.subjectId);
          await putJsonInCache(QUESTIONS_API_CACHE_NAME, mod.questionsUrl, {
            questions: modQuestions,
            total: modQuestions.length,
            cachedOffline: true
          });
        }
      })
    );

    const sizeKb = Math.max(
      8,
      Math.round(new Blob([JSON.stringify(studyPathPayload)]).size / 1024)
    );

    const record: CachedStudyPathRecord = {
      studyPath: { ...studyPathPayload, estimatedSizeKb: sizeKb },
      cachedAt,
      sizeKb,
      storedInServiceWorkerCache: storedStudyPath
    };

    // Keep lightweight fallback mirror in localStorage
    try {
      localStorage.setItem(
        `${STORAGE_STUDY_PATH_FALLBACK_PREFIX}${getStudentKey(user)}`,
        JSON.stringify(record)
      );
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('studynaija_study_path_cache_updated', {
        detail: { action: 'downloaded', studentId: getStudentKey(user), record }
      }));
    }

    return record;
  },

  /**
   * Reads the student's downloaded personalized study path from Service Worker Cache Storage first,
   * falling back to localStorage mirror if Cache Storage is unavailable.
   */
  getCachedStudyPath: async (user: User | null): Promise<CachedStudyPathRecord | null> => {
    if (typeof window === 'undefined') return null;
    const studentId = getStudentKey(user);

    if ('caches' in window) {
      try {
        const cache = await window.caches.open(STUDY_PATH_CACHE_NAME);
        const exactUrl = buildPersonalizedStudyPathUrl(user);
        let match = await cache.match(exactUrl);

        if (!match) {
          const keys = await cache.keys();
          const studentKeyMatch = keys.find(req =>
            req.url.includes('/api/study-paths/personalized') &&
            req.url.includes(`studentId=${encodeURIComponent(studentId)}`)
          ) || keys.find(req => req.url.includes('/api/study-paths/personalized'));
          if (studentKeyMatch) {
            match = await cache.match(studentKeyMatch);
          }
        }

        if (match) {
          const json = (await match.json()) as PersonalizedStudyPath;
          if (json && Array.isArray(json.modules)) {
            const cachedAt = match.headers.get('X-Cached-At') || json.generatedAt || new Date().toISOString();
            const sizeKb = json.estimatedSizeKb || Math.max(8, Math.round(new Blob([JSON.stringify(json)]).size / 1024));
            return {
              studyPath: { ...json, source: 'service-worker-cache' },
              cachedAt,
              sizeKb,
              storedInServiceWorkerCache: true
            };
          }
        }
      } catch (err) {
        console.warn('Could not read study path from Service Worker Cache Storage:', err);
      }
    }

    try {
      const raw = localStorage.getItem(`${STORAGE_STUDY_PATH_FALLBACK_PREFIX}${studentId}`);
      if (raw) {
        return JSON.parse(raw) as CachedStudyPathRecord;
      }
    } catch {}

    return null;
  },

  /**
   * Removes cached personalized study path from Service Worker Cache Storage.
   */
  removeCachedStudyPath: async (user: User | null): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    const studentId = getStudentKey(user);

    if ('caches' in window) {
      try {
        const cache = await window.caches.open(STUDY_PATH_CACHE_NAME);
        const keys = await cache.keys();
        await Promise.all(
          keys
            .filter(req =>
              req.url.includes('/api/study-paths/personalized') &&
              (req.url.includes(`studentId=${encodeURIComponent(studentId)}`) || studentId === 'guest_student')
            )
            .map(req => cache.delete(req))
        );
      } catch {}
    }

    try {
      localStorage.removeItem(`${STORAGE_STUDY_PATH_FALLBACK_PREFIX}${studentId}`);
    } catch {}

    window.dispatchEvent(new CustomEvent('studynaija_study_path_cache_updated', {
      detail: { action: 'removed', studentId }
    }));

    return true;
  },

  /**
   * Reads cached subject questions from Service Worker Cache Storage when offline.
   */
  getCachedQuestionsForSubject: async (subjectId: string): Promise<Question[]> => {
    if (typeof window === 'undefined' || !('caches' in window)) return [];
    try {
      const cache = await window.caches.open(QUESTIONS_API_CACHE_NAME);
      const keys = await cache.keys();
      const matching = keys.filter(req => req.url.includes(`subjectId=${encodeURIComponent(subjectId)}`));
      for (const req of matching) {
        const res = await cache.match(req);
        if (res) {
          const data = await res.json();
          if (data && Array.isArray(data.questions) && data.questions.length > 0) {
            return data.questions;
          }
        }
      }
    } catch {}
    return [];
  },

  /**
   * Inspects live Service Worker registration and Cache Storage counts.
   */
  getServiceWorkerCacheStatus: async (): Promise<ServiceWorkerCacheStatus> => {
    const serviceWorkerSupported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
    const cacheApiSupported = typeof window !== 'undefined' && 'caches' in window;
    let swRegistered = false;
    let swActive = false;
    let cachedStudyPathEntries = 0;
    let cachedQuestionEntries = 0;

    if (serviceWorkerSupported) {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        swRegistered = Boolean(reg);
        swActive = Boolean(reg?.active || navigator.serviceWorker.controller);
      } catch {}
    }

    if (cacheApiSupported) {
      try {
        const pathCache = await window.caches.open(STUDY_PATH_CACHE_NAME);
        const pathKeys = await pathCache.keys();
        cachedStudyPathEntries = pathKeys.length;

        const qCache = await window.caches.open(QUESTIONS_API_CACHE_NAME);
        const qKeys = await qCache.keys();
        cachedQuestionEntries = qKeys.length;
      } catch {}
    }

    return {
      serviceWorkerSupported,
      cacheApiSupported,
      swRegistered,
      swActive,
      cachedStudyPathEntries,
      cachedQuestionEntries
    };
  }
};
