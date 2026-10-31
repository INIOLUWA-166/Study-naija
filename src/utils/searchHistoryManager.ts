/**
 * StudyNaija Search History Manager
 * Handles persistent search query history across past questions, syllabus topics, and AI tutor queries.
 */

export type SearchCategory = 'past_questions' | 'syllabus' | 'ai_tutor' | 'general';

export interface SearchHistoryEntry {
  id: string;
  term: string;
  category: SearchCategory;
  timestamp: number;
}

const STORAGE_KEY = 'studynaija_search_history_v2';
const MAX_HISTORY_PER_CATEGORY = 20;

// Curated popular Nigerian curriculum searches for smart suggestions
export const CURATED_POPULAR_SEARCHES: Record<SearchCategory, string[]> = {
  past_questions: [
    '2024 JAMB English',
    'Calculus & Differentiation',
    'Newton Laws of Motion',
    'Mole Concept & Stoichiometry',
    'Supply and Demand Elasticity',
    'Oral English Stress',
    'Genetics & Sickle Cell',
    'Quadratic Equations',
    '1999 Constitution',
    'The Life Changer'
  ],
  syllabus: [
    'Concord & Subject-Verb Agreement',
    'Quadratic Equations',
    'Linear Motion & Equations of Motion',
    'Acids, Bases & Salts',
    'Photosynthesis & Respiration',
    'Pre-Independence Constitutions',
    'Theory of Demand & Supply',
    'Indices & Logarithms',
    'Electrolysis & Faraday Laws',
    'Oral English Syllable Stress'
  ],
  ai_tutor: [
    'Explain Newton third law in plain English',
    'How to solve quadratic equations with formula',
    'What are the 15 concord rules for JAMB?',
    'Explain mole concept step by step',
    'What topics should I study based on my scores?',
    'Memory mnemonic for first 20 elements'
  ],
  general: [
    'JAMB 2026 Cutoff mark',
    'Subject Combinations for Medicine',
    'Subject Combinations for Computer Science',
    'WAEC Grading System',
    'Post-UTME Past Questions'
  ]
};

function loadAllEntries(): SearchHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to load search history:', err);
    return [];
  }
}

function saveAllEntries(entries: SearchHistoryEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    window.dispatchEvent(new CustomEvent('studynaija_search_history_updated'));
  } catch (err) {
    console.warn('Failed to save search history:', err);
  }
}

export const searchHistoryManager = {
  /**
   * Records a user search query, moves to top, and caps length
   */
  addSearch: (term: string, category: SearchCategory = 'general'): SearchHistoryEntry[] => {
    const clean = term.trim();
    if (!clean || clean.length < 2) return searchHistoryManager.getDetailedHistory(category);

    const entries = loadAllEntries();
    // Remove identical search in the same category
    const filtered = entries.filter(
      e => !(e.category === category && e.term.toLowerCase() === clean.toLowerCase())
    );

    const newEntry: SearchHistoryEntry = {
      id: `sh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      term: clean,
      category,
      timestamp: Date.now()
    };

    // Keep category list capped
    const categoryEntries = filtered.filter(e => e.category === category);
    const otherEntries = filtered.filter(e => e.category !== category);

    const updatedCategoryList = [newEntry, ...categoryEntries].slice(0, MAX_HISTORY_PER_CATEGORY);
    const combined = [...updatedCategoryList, ...otherEntries];

    saveAllEntries(combined);
    return updatedCategoryList;
  },

  /**
   * Retrieves search history for a specific category
   */
  getHistory: (category?: SearchCategory, limit = 10): string[] => {
    const entries = loadAllEntries();
    const filtered = category ? entries.filter(e => e.category === category) : entries;
    return filtered
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map(e => e.term);
  },

  /**
   * Retrieves full structured search history entries
   */
  getDetailedHistory: (category?: SearchCategory, limit = 15): SearchHistoryEntry[] => {
    const entries = loadAllEntries();
    const filtered = category ? entries.filter(e => e.category === category) : entries;
    return filtered
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  },

  /**
   * Removes a specific search term
   */
  removeSearch: (term: string, category?: SearchCategory) => {
    const entries = loadAllEntries();
    const target = term.trim().toLowerCase();
    const filtered = entries.filter(e => {
      if (category && e.category !== category) return true;
      return e.term.toLowerCase() !== target;
    });
    saveAllEntries(filtered);
  },

  /**
   * Clears search history for a category or completely
   */
  clearHistory: (category?: SearchCategory) => {
    if (!category) {
      saveAllEntries([]);
      return;
    }
    const entries = loadAllEntries();
    const filtered = entries.filter(e => e.category !== category);
    saveAllEntries(filtered);
  },

  /**
   * Returns popular suggestions for quick start
   */
  getPopularSuggestions: (category: SearchCategory = 'past_questions'): string[] => {
    return CURATED_POPULAR_SEARCHES[category] || CURATED_POPULAR_SEARCHES.past_questions;
  }
};
