import { OfflinePack, Question } from '../types';
import { EXTENDED_QUESTIONS } from './questionBank';
import { INITIAL_QUESTIONS } from '../mockData';

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
    subjectId: 'maths',
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

export const offlinePacksManager = {
  getPacks: (): OfflinePack[] => {
    if (typeof window === 'undefined') return DEFAULT_OFFLINE_PACKS;
    try {
      const raw = localStorage.getItem(STORAGE_OFFLINE_PACKS_INDEX);
      if (!raw) return DEFAULT_OFFLINE_PACKS;
      const parsed: OfflinePack[] = JSON.parse(raw);
      // Ensure all defaults are present
      return DEFAULT_OFFLINE_PACKS.map(def => {
        const found = parsed.find(p => p.id === def.id);
        return found ? { ...def, ...found } : def;
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

    // Filter relevant questions from available banks
    const relevant = [
      ...EXTENDED_QUESTIONS.filter(q => q.subjectId === pack.subjectId),
      ...INITIAL_QUESTIONS.filter(q => q.subjectId === pack.subjectId)
    ];

    // Deduplicate
    const unique = Array.from(new Map(relevant.map(q => [q.id, q])).values()).slice(0, pack.questionCount);

    try {
      localStorage.setItem(`${STORAGE_OFFLINE_PACK_PREFIX}${pack.subjectId}`, JSON.stringify(unique));
      
      const updatedPacks = packs.map(p => {
        if (p.id === packId) {
          return {
            ...p,
            isDownloaded: true,
            downloadedAt: new Date().toISOString()
          };
        }
        return p;
      });

      localStorage.setItem(STORAGE_OFFLINE_PACKS_INDEX, JSON.stringify(updatedPacks));

      window.dispatchEvent(new CustomEvent('studynaija_offline_packs_updated', {
        detail: { packId, isDownloaded: true }
      }));

      return { success: true, pack: { ...pack, isDownloaded: true, downloadedAt: new Date().toISOString() } };
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
