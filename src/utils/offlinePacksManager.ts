import { OfflinePack, Question } from '../types';
import { EXTENDED_QUESTIONS } from './questionBank';
import { INITIAL_QUESTIONS } from '../mockData';
import { QUESTIONS_API_CACHE_NAME } from './studyPathCache';

const STORAGE_OFFLINE_PACKS_INDEX = 'studynaija_offline_packs_index';
const STORAGE_OFFLINE_PACK_PREFIX = 'studynaija_offline_data_';

export const DEFAULT_OFFLINE_PACKS: OfflinePack[] = [
  {
    id: 'pack-english-100',
    subjectId: 'english',
    subjectName: 'Use of English',
    title: 'Master Drill Pack (Concord, Lexis & Oral)',
    questionCount: 80,
    sizeKb: 42,
    isDownloaded: false,
    examType: 'ALL'
  },
  {
    id: 'pack-maths-100',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    title: 'Algebra, Geometry & Calculus Pack',
    questionCount: 75,
    sizeKb: 54,
    isDownloaded: false,
    examType: 'ALL'
  },
  {
    id: 'pack-physics-80',
    subjectId: 'physics',
    subjectName: 'Physics',
    title: 'Mechanics, Optics & Current Electricity',
    questionCount: 70,
    sizeKb: 48,
    isDownloaded: false,
    examType: 'ALL'
  },
  {
    id: 'pack-chemistry-80',
    subjectId: 'chemistry',
    subjectName: 'Chemistry',
    title: 'Organic, Stoichiometry & Gas Laws',
    questionCount: 70,
    sizeKb: 46,
    isDownloaded: false,
    examType: 'ALL'
  },
  {
    id: 'pack-biology-80',
    subjectId: 'biology',
    subjectName: 'Biology',
    title: 'Ecology, Genetics & Human Physiology',
    questionCount: 65,
    sizeKb: 44,
    isDownloaded: false,
    examType: 'ALL'
  },
  {
    id: 'pack-government-60',
    subjectId: 'government',
    subjectName: 'Government',
    title: 'Constitutions & Political Systems Pack',
    questionCount: 60,
    sizeKb: 38,
    isDownloaded: false,
    examType: 'ALL'
  },
  {
    id: 'pack-economics-60',
    subjectId: 'economics',
    subjectName: 'Economics',
    title: 'Micro & Macroeconomics, Nigerian Economy',
    questionCount: 60,
    sizeKb: 40,
    isDownloaded: false,
    examType: 'ALL'
  }
];

async function cacheSubjectQuestionsInSW(subjectId: string, questionsList: Question[]) {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const url = `/api/questions?subjectId=${encodeURIComponent(subjectId)}&limit=100`;
    // Also trigger live fetch so Workbox caches freshest backend payload if online
    try {
      const netRes = await fetch(url);
      const ct = netRes.headers.get('content-type') || '';
      if (netRes.ok && ct.includes('application/json')) {
        const netJson = await netRes.json();
        if (netJson && Array.isArray(netJson.questions) && netJson.questions.length > 0) {
          const cache = await window.caches.open(QUESTIONS_API_CACHE_NAME);
          await cache.put(
            new Request(url, { method: 'GET' }),
            new Response(JSON.stringify(netJson), {
              status: 200,
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'X-StudyNaija-Offline-Cache': 'true',
                'X-Cached-At': new Date().toISOString()
              }
            })
          );
          return;
        }
      }
    } catch {}

    const cache = await window.caches.open(QUESTIONS_API_CACHE_NAME);
    await cache.put(
      new Request(url, { method: 'GET' }),
      new Response(JSON.stringify({ questions: questionsList, total: questionsList.length, cachedOffline: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-StudyNaija-Offline-Cache': 'true',
          'X-Cached-At': new Date().toISOString()
        }
      })
    );
  } catch {}
}

async function deleteSubjectQuestionsFromSW(subjectId: string) {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const cache = await window.caches.open(QUESTIONS_API_CACHE_NAME);
    const keys = await cache.keys();
    await Promise.all(
      keys
        .filter(req => req.url.includes(`subjectId=${encodeURIComponent(subjectId)}`))
        .map(req => cache.delete(req))
    );
  } catch {}
}

export const offlinePacksManager = {
  getPacks: (): OfflinePack[] => {
    if (typeof window === 'undefined') return DEFAULT_OFFLINE_PACKS;
    try {
      const raw = localStorage.getItem(STORAGE_OFFLINE_PACKS_INDEX);
      if (!raw) return DEFAULT_OFFLINE_PACKS;
      const parsed: OfflinePack[] = JSON.parse(raw);
      return DEFAULT_OFFLINE_PACKS.map(def => {
        const found = parsed.find(p => p.id === def.id);
        return found ? { ...found, ...def, isDownloaded: found.isDownloaded, downloadedAt: found.downloadedAt } : def;
      });
    } catch {
      return DEFAULT_OFFLINE_PACKS;
    }
  },

  downloadPack: (packId: string): { success: boolean; pack: OfflinePack | null } => {
    if (typeof window === 'undefined') return { success: false, pack: null };
    const packs = offlinePacksManager.getPacks();
    const pack = packs.find(p => p.id === packId);
    if (!pack) return { success: false, pack: null };

    const targetIds = pack.subjectId === 'mathematics' ? ['mathematics', 'maths'] : [pack.subjectId];
    const relevant = [
      ...EXTENDED_QUESTIONS.filter(q => targetIds.includes(q.subjectId)),
      ...INITIAL_QUESTIONS.filter(q => targetIds.includes(q.subjectId))
    ];

    const unique = Array.from(new Map(relevant.map(q => [q.id, q])).values()).slice(0, pack.questionCount);

    try {
      localStorage.setItem(`${STORAGE_OFFLINE_PACK_PREFIX}${pack.subjectId}`, JSON.stringify(unique));
      void cacheSubjectQuestionsInSW(pack.subjectId, unique);

      const downloadedAt = new Date().toISOString();
      const updatedPacks = packs.map(p => {
        if (p.id === packId) {
          return {
            ...p,
            isDownloaded: true,
            downloadedAt
          };
        }
        return p;
      });

      localStorage.setItem(STORAGE_OFFLINE_PACKS_INDEX, JSON.stringify(updatedPacks));

      window.dispatchEvent(new CustomEvent('studynaija_offline_packs_updated', {
        detail: { packId, isDownloaded: true }
      }));

      return { success: true, pack: { ...pack, isDownloaded: true, downloadedAt } };
    } catch (err) {
      console.error('Failed to store offline pack:', err);
      return { success: false, pack };
    }
  },

  deletePack: (packId: string): boolean => {
    if (typeof window === 'undefined') return false;
    const packs = offlinePacksManager.getPacks();
    const pack = packs.find(p => p.id === packId);
    if (!pack) return false;

    try {
      localStorage.removeItem(`${STORAGE_OFFLINE_PACK_PREFIX}${pack.subjectId}`);
      void deleteSubjectQuestionsFromSW(pack.subjectId);
      const updatedPacks = packs.map(p => p.id === packId ? { ...p, isDownloaded: false, downloadedAt: undefined } : p);
      localStorage.setItem(STORAGE_OFFLINE_PACKS_INDEX, JSON.stringify(updatedPacks));

      window.dispatchEvent(new CustomEvent('studynaija_offline_packs_updated', {
        detail: { packId, isDownloaded: false }
      }));

      return true;
    } catch {
      return false;
    }
  },

  getOfflineQuestions: (subjectId: string): Question[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(`${STORAGE_OFFLINE_PACK_PREFIX}${subjectId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return [];
  },

  getTotalDownloadedSizeKb: (): number => {
    const packs = offlinePacksManager.getPacks();
    return packs.filter(p => p.isDownloaded).reduce((acc, p) => acc + p.sizeKb, 0);
  }
};
