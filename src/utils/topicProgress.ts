import { Subject, User, SubjectTopicProgress } from '../types';

const STORAGE_TOPIC_PROGRESS_KEY = 'studynaija_user_topic_progress_store_v1';

interface StoredTopicRecord {
  questionsAnswered: number;
  correctCount: number;
  covered: boolean;
  lastPracticed: string;
}

interface StoredSubjectRecord {
  topics: Record<string, StoredTopicRecord>;
}

type StoredProgressMap = Record<string, StoredSubjectRecord>;

// Initial realistic seed topics for core subjects based on standard Nigerian student syllabus progress
const DEFAULT_INITIAL_COVERED: Record<string, string[]> = {
  english: [
    'Comprehension & Summary Passages',
    'Concord & Subject-Verb Agreement',
    'Oral English & Syllable Stress'
  ],
  mathematics: [
    'Quadratic Equations & Polynomials',
    'Indices & Logarithms',
    'Trigonometry & Bearing',
    'Sequences & Series (A.P. & G.P.)'
  ],
  biology: [
    'Cell Structure & Cellular Transport (Osmosis)',
    'Nutrition & Photosynthesis',
    'Genetics & Mendel Laws (Sickle Cell & Blood Groups)'
  ],
  chemistry: [
    'Mole Concept & Stoichiometric Calculations',
    'Atomic Structure & Periodic Trends',
    'Acids, Bases, Salts & Neutralization'
  ],
  physics: [
    'Linear Motion & Equations of Motion',
    'Work, Energy and Power Conservation',
    'Current Electricity, Ohm Law & Resistance'
  ],
  economics: [
    'Theory of Demand & Supply and Price Elasticity',
    'Money, Banking & Financial Institutions'
  ],
  government: [
    'Basic Concepts of Government & Rule of Law',
    'Pre-Independence Nigerian Constitutions (1922-1954)'
  ]
};

function loadStoredProgress(): StoredProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_TOPIC_PROGRESS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to load topic progress from storage:', err);
  }
  return {};
}

function saveStoredProgress(data: StoredProgressMap) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_TOPIC_PROGRESS_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('studynaija_topic_progress_updated'));
  } catch (err) {
    console.warn('Failed to save topic progress to storage:', err);
  }
}

/**
 * Normalizes topic names to handle minor punctuation or whitespace variations
 */
function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export const topicProgressManager = {
  /**
   * Retrieves comprehensive topic progress and mastery stats for a given subject
   */
  getSubjectProgress: (subject: Subject, user: User | null): SubjectTopicProgress => {
    const stored = loadStoredProgress();
    const subjectRecord = stored[subject.id] || { topics: {} };
    const defaultCoveredList = DEFAULT_INITIAL_COVERED[subject.id] || [];

    let coveredCount = 0;
    let questionsSolved = 0;
    let correctAnswers = 0;

    const topicStatuses: SubjectTopicProgress['topicStatuses'] = {};

    subject.topics.forEach(topicName => {
      const normKey = normalizeKey(topicName);
      const record = subjectRecord.topics[normKey];

      // Check if covered either in stored record, or via initial seed
      const isDefaultCovered = defaultCoveredList.some(
        d => normalizeKey(d) === normKey || topicName.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(topicName.toLowerCase())
      );

      const isCovered = record ? record.covered : isDefaultCovered;
      const qAnswered = record ? record.questionsAnswered : (isDefaultCovered ? 8 : 0);
      const qCorrect = record ? record.correctCount : (isDefaultCovered ? 6 : 0);

      const masteryPercentage = qAnswered > 0 ? Math.round((qCorrect / qAnswered) * 100) : (isDefaultCovered ? 75 : 0);

      let status: 'mastered' | 'in_progress' | 'not_started' = 'not_started';
      if (isCovered || qAnswered > 0) {
        if (masteryPercentage >= 75 && qAnswered >= 5) {
          status = 'mastered';
        } else {
          status = 'in_progress';
        }
      }

      if (isCovered || status !== 'not_started') {
        coveredCount++;
      }

      questionsSolved += qAnswered;
      correctAnswers += qCorrect;

      topicStatuses[topicName] = {
        topicName,
        covered: isCovered,
        questionsAnswered: qAnswered,
        correctCount: qCorrect,
        masteryPercentage,
        lastPracticed: record?.lastPracticed || (isDefaultCovered ? 'Recent practice session' : undefined),
        status
      };
    });

    const totalTopics = subject.topics.length || 1;
    const progressPercentage = Math.min(100, Math.round((coveredCount / totalTopics) * 100));

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      totalTopics,
      coveredTopics: coveredCount,
      progressPercentage,
      questionsSolved,
      correctAnswers,
      topicStatuses
    };
  },

  /**
   * Retrieves progress map for all subjects
   */
  getAllSubjectsProgress: (subjects: Subject[], user: User | null): Record<string, SubjectTopicProgress> => {
    const result: Record<string, SubjectTopicProgress> = {};
    subjects.forEach(sub => {
      result[sub.id] = topicProgressManager.getSubjectProgress(sub, user);
    });
    return result;
  },

  /**
   * Calculates overall curriculum statistics across all subjects
   */
  getCurriculumOverallStats: (subjects: Subject[], user: User | null) => {
    let totalTopics = 0;
    let coveredTopics = 0;
    let totalQuestionsSolved = 0;
    let totalCorrect = 0;

    subjects.forEach(sub => {
      const p = topicProgressManager.getSubjectProgress(sub, user);
      totalTopics += p.totalTopics;
      coveredTopics += p.coveredTopics;
      totalQuestionsSolved += p.questionsSolved;
      totalCorrect += p.correctAnswers;
    });

    const overallPercentage = totalTopics > 0 ? Math.min(100, Math.round((coveredTopics / totalTopics) * 100)) : 0;
    const overallMastery = totalQuestionsSolved > 0 ? Math.min(100, Math.round((totalCorrect / totalQuestionsSolved) * 100)) : 70;

    return {
      totalTopics,
      coveredTopics,
      overallPercentage,
      totalQuestionsSolved,
      totalCorrect,
      overallMastery
    };
  },

  /**
   * Records practice session completion on a specific topic
   */
  recordTopicPractice: (subjectId: string, topicName: string, questionsCount: number, correctCount: number) => {
    const stored = loadStoredProgress();
    if (!stored[subjectId]) {
      stored[subjectId] = { topics: {} };
    }

    const normKey = normalizeKey(topicName);
    const existing = stored[subjectId].topics[normKey] || {
      questionsAnswered: 0,
      correctCount: 0,
      covered: false,
      lastPracticed: ''
    };

    stored[subjectId].topics[normKey] = {
      questionsAnswered: existing.questionsAnswered + questionsCount,
      correctCount: existing.correctCount + correctCount,
      covered: true,
      lastPracticed: new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    saveStoredProgress(stored);
  },

  /**
   * Manually toggles a topic between covered and uncovered (study checklist)
   */
  toggleTopicCompletion: (subjectId: string, topicName: string): boolean => {
    const stored = loadStoredProgress();
    if (!stored[subjectId]) {
      stored[subjectId] = { topics: {} };
    }

    const normKey = normalizeKey(topicName);
    const existing = stored[subjectId].topics[normKey];
    const defaultCoveredList = DEFAULT_INITIAL_COVERED[subjectId] || [];
    const isDefaultCovered = defaultCoveredList.some(d => normalizeKey(d) === normKey);

    const currentlyCovered = existing ? existing.covered : isDefaultCovered;
    const newCoveredState = !currentlyCovered;

    stored[subjectId].topics[normKey] = {
      questionsAnswered: existing ? existing.questionsAnswered : (newCoveredState ? 5 : 0),
      correctCount: existing ? existing.correctCount : (newCoveredState ? 4 : 0),
      covered: newCoveredState,
      lastPracticed: new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    saveStoredProgress(stored);
    return newCoveredState;
  },

  /**
   * Resets progress for a subject
   */
  resetSubjectProgress: (subjectId: string) => {
    const stored = loadStoredProgress();
    if (stored[subjectId]) {
      delete stored[subjectId];
      saveStoredProgress(stored);
    }
  }
};
