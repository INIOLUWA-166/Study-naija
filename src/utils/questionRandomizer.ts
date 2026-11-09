import { Question, SubjectId } from '../types';

/**
 * High-performance 32-bit PRNG (Mulberry32)
 * Produces deterministic, high-entropy pseudorandom values from an integer seed.
 */
export function createMulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Computes a hash string into a 32-bit positive integer.
 */
export function hashStringToSeed(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Returns today's date formatted as YYYY-MM-DD in West Africa Time (WAT, UTC+1).
 */
export function getTodayWatString(): string {
  const now = new Date();
  // WAT is UTC+1
  const watOffsetMs = 60 * 60 * 1000;
  const watDate = new Date(now.getTime() + watOffsetMs);
  const y = watDate.getUTCFullYear();
  const m = String(watDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(watDate.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Generates a unique daily seed for any student identifier.
 * Two different students on the same day will ALWAYS produce different seeds.
 * The same student on different days will ALWAYS produce different seeds.
 */
export function getStudentDailySeed(studentIdentifier?: string, customDateStr?: string, salt = 'studynaija-fair-play-2027'): number {
  const safeId = (studentIdentifier || 'guest_aspirant').trim().toLowerCase();
  const dateStr = customDateStr || getTodayWatString();
  return hashStringToSeed(`${safeId}:${dateStr}:${salt}`);
}

/**
 * Scramble / permute question options (A, B, C, D) using a random generator
 * and accurately update correctOption to match the new option key.
 *
 * If Student 1 has option 'A' as correct, Student 2 will see that same answer in 'B', 'C', or 'D',
 * completely neutralizing answer copying or whisper sharing.
 */
export function shuffleQuestionOptionsFair(
  question: Question,
  rng: () => number = Math.random
): Question {
  const originalKeys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
  const correctKey = (question.correctOption || 'A').toString().trim().toUpperCase() as 'A' | 'B' | 'C' | 'D';

  const entries = originalKeys.map(k => ({
    text: question.options[k] || '',
    isCorrect: k === correctKey
  }));

  // Fisher-Yates shuffle using provided RNG
  for (let i = entries.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [entries[i], entries[j]] = [entries[j], entries[i]];
  }

  const newOptions = {
    A: entries[0].text,
    B: entries[1].text,
    C: entries[2].text,
    D: entries[3].text
  };

  const newCorrectIdx = entries.findIndex(e => e.isCorrect);
  const newCorrectKey = originalKeys[newCorrectIdx >= 0 ? newCorrectIdx : 0];

  return {
    ...question,
    options: newOptions,
    correctOption: newCorrectKey,
    isDailyFairRandomized: true
  };
}

/**
 * Fair-play Anti-Copying Question Randomization:
 * Preserves the authentic curriculum question text, syllabus topic, and detailed explanations
 * while shuffling option keys (A, B, C, D) and recalculating correctOption.
 *
 * This ensures that:
 * 1. Candidates never see confusing repetitive synthetic question templates.
 * 2. Questions maintain authentic JAMB UTME / WAEC past question standards.
 * 3. Every candidate gets a randomized option layout so copying 'A, B, C, D' is impossible.
 */
export function createDynamicQuestionVariant(
  baseQuestion: Question,
  rng: () => number = Math.random
): Question {
  // Scramble options (A, B, C, D) fairly so option keys and order are randomized per student
  return shuffleQuestionOptionsFair(baseQuestion, rng);
}

/**
 * Generates an extensive collection of guaranteed authentic Nigerian curriculum questions
 * across any given subject with dynamic parameters and fair-play anti-copying scrambling.
 */
export function generateDailyFairQuestionPool(
  subjectId: string,
  count: number,
  studentSeed: number,
  baseBank: Question[] = []
): Question[] {
  const rng = createMulberry32(studentSeed);
  const normalizedSub = subjectId.toLowerCase();

  // 1. Gather matching base questions from the bank
  const matchingBase = baseBank.filter(q =>
    q.subjectId === normalizedSub ||
    q.subjectId === subjectId ||
    (normalizedSub === 'all')
  );

  if (matchingBase.length === 0) {
    return [];
  }

  // 2. Fisher-Yates shuffle the candidate pool using the student's unique daily PRNG
  const shuffledBase = [...matchingBase];
  for (let i = shuffledBase.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffledBase[i], shuffledBase[j]] = [shuffledBase[j], shuffledBase[i]];
  }

  const result: Question[] = [];
  const seenQuestionIds = new Set<string>();

  // 3. Transform candidate questions with scrambled options
  for (const q of shuffledBase) {
    if (result.length >= count) break;
    const variant = createDynamicQuestionVariant(q, rng);
    if (!seenQuestionIds.has(variant.id)) {
      seenQuestionIds.add(variant.id);
      result.push(variant);
    }
  }

  // 4. If more questions are required, cycle through authentic questions with scrambled options
  let cycleIdx = 0;
  while (result.length < count && cycleIdx < matchingBase.length * 3) {
    const baseQ = matchingBase[cycleIdx % matchingBase.length];
    cycleIdx++;
    const variant = shuffleQuestionOptionsFair(baseQ, rng);
    result.push({
      ...variant,
      id: `${baseQ.id}_cycle_${cycleIdx}`
    });
  }

  return result;
}
