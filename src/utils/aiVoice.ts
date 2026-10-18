// AI Voice Engine for StudyNaija
// Provides natural, skip-free, fast spoken audio feedback for CBT Practice, Mock Exams, and Flash Challenges
// Features:
// - Phonetic normalization: converts "StudyNaija" -> "Study Ny-jah", "SabiTutor" -> "Sah-bee Tutor", "JAMB" -> "Jamb" so voices never stumble
// - Expressive, human-grade voice selection (prioritizes Natural/Neural/Enhanced voices over robotic legacy synthesizers)
// - Voice Persona toggle: 'female' (Amina - Warm & Inspiring) or 'male' (Chidi - Energetic & Sharp)
// - Brisk, dynamic speech rate (default 1.22x) so feedback is fast, energetic, and never drags on
// - Instant startup: non-blocking audio hardware wake-up with zero waiting delay
// - Global window utterance anchoring: eliminates Chromium garbage collection clipping that stopped speech mid-sentence
// - Web Audio silent wake-lock: keeps browser audio threads alive without destructive pause/resume loops

export type ExamPerformanceTier = 'well' | 'average' | 'bad';
export type VoicePersona = 'female' | 'male';

export function determinePerformanceTier(percentage: number): ExamPerformanceTier {
  if (percentage >= 70) return 'well';
  if (percentage >= 40) return 'average';
  return 'bad';
}

export interface VoiceFeedbackContent {
  tier: ExamPerformanceTier;
  category?: 'great' | 'average' | 'needs_help';
  speechText: string;
  message: string; // for backward-compatibility with UI call-sites
  title: string;
  subtitle: string;
  actionText?: string;
  accentColor: string;
}

/**
 * Extracts and sanitizes the student's first name.
 * If given "Chukwuebuka Obi" -> returns "Chukwuebuka".
 * If given "Emeka Adeleke" -> returns "Emeka".
 * If given "luvkidjaja@gmail.com" -> returns "Luvkidjaja".
 */
export function getStudentFirstName(studentName?: string): string {
  if (!studentName || typeof studentName !== 'string') return '';
  let name = studentName.trim();
  if (name.includes('@')) {
    name = name.split('@')[0];
  }
  // Remove numbers and punctuation
  name = name.replace(/[^a-zA-Z\s]/g, ' ').trim();
  if (!name) return '';
  const firstPart = name.split(/\s+/)[0];
  if (!firstPart || firstPart.length < 2) return '';
  return firstPart.charAt(0).toUpperCase() + firstPart.slice(1).toLowerCase();
}

const VISITOR_NAME_KEY = 'studynaija_student_first_name';
const WELCOME_SPOKEN_SESSION_KEY = 'studynaija_welcome_spoken_session';
const VOICE_PERSONA_KEY = 'studynaija_voice_persona';
const SPEECH_RATE_KEY = 'studynaija_speech_rate';
const PREFERRED_VOICE_NAME_KEY = 'studynaija_preferred_voice_name';

export function getStoredFirstName(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(VISITOR_NAME_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredFirstName(name: string): void {
  if (typeof window === 'undefined') return;
  try {
    const clean = getStudentFirstName(name);
    if (clean) {
      localStorage.setItem(VISITOR_NAME_KEY, clean);
    }
  } catch {}
}

export function getVoicePersona(): VoicePersona {
  if (typeof window === 'undefined') return 'female';
  try {
    const saved = localStorage.getItem(VOICE_PERSONA_KEY);
    return saved === 'male' ? 'male' : 'female';
  } catch {
    return 'female';
  }
}

export function setVoicePersona(persona: VoicePersona): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VOICE_PERSONA_KEY, persona);
  } catch {}
}

export function getStoredSpeechRate(): number {
  if (typeof window === 'undefined') return 1.05;
  try {
    const saved = localStorage.getItem(SPEECH_RATE_KEY);
    const parsed = saved ? parseFloat(saved) : 1.05;
    // Migrate old hyper-fast default (1.22) to natural 20s American lady speed (1.05)
    if (parsed === 1.22) {
      try { localStorage.setItem(SPEECH_RATE_KEY, '1.05'); } catch {}
      return 1.05;
    }
    return isNaN(parsed) || parsed < 0.8 || parsed > 2.0 ? 1.05 : parsed;
  } catch {
    return 1.05;
  }
}

export function setStoredSpeechRate(rate: number): void {
  if (typeof window === 'undefined') return;
  try {
    const safeRate = Math.min(2.0, Math.max(0.8, rate));
    localStorage.setItem(SPEECH_RATE_KEY, safeRate.toString());
  } catch {}
}

export function hasWelcomeBeenSpokenThisSession(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return sessionStorage.getItem(WELCOME_SPOKEN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markWelcomeAsSpoken(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(WELCOME_SPOKEN_SESSION_KEY, 'true');
  } catch {}
}

export function resetWelcomeSession(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(WELCOME_SPOKEN_SESSION_KEY);
  } catch {}
}

/**
 * Sanitizes student names for voice synthesis.
 * Strips email domains (e.g. "luvkidjaja@gmail.com" -> "Luvkidjaja")
 * and special characters so the voice synthesizer never stumbles or stutters.
 */
export function cleanStudentName(studentName?: string): string {
  if (!studentName || typeof studentName !== 'string') return 'Scholar';
  let name = studentName.trim();
  if (name.includes('@')) {
    name = name.split('@')[0];
  }
  // Remove numbers and punctuation
  name = name.replace(/[^a-zA-Z\s]/g, ' ').trim();
  if (!name || name.length < 2) return 'Scholar';

  // Capitalize first letter of each word
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Phonetically translates Nigerian acronyms, compound names, and terms
 * so that standard TTS synthesizers pronounce "Study Naija" accurately as
 * "Study Ny-jah" instead of stumbling.
 */
export function phoneticNormalize(text: string): string {
  if (!text) return '';
  return text
    // Replace StudyNaija compound word with space "Study Naija"
    .replace(/StudyNaija/gi, 'Study Naija')
    // Ensure "Naija AI" spells out "A I" in TTS so it speaks clearly
    .replace(/Naija\s*AI\b/gi, 'Naija A I')
    // Replace any legacy SabiTutor references with Naija AI
    .replace(/\bSabiTutor\b/gi, 'Naija A I')
    .replace(/\bSabi\b/gi, 'Naija')
    // Nigerian academic & CBT terms
    .replace(/\bJAMB\b/g, 'Jamb')
    .replace(/\bUTME\b/g, 'U T M E')
    .replace(/\bWAEC\b/g, 'Wa-eck')
    .replace(/\bSSCE\b/g, 'S S C E')
    .replace(/\bNECO\b/g, 'Neh-co')
    .replace(/\bCBT\b/g, 'C B T')
    .replace(/\bPOST-UTME\b/gi, 'Post U T M E')
    .replace(/\bXP\b/g, 'X P');
}

/**
 * Strips markdown, LaTeX formulas, emojis, and unpronounceable characters,
 * applying phonetic corrections so the synthesis engine produces crystal-clear speech.
 */
export function cleanSpokenText(text: string): string {
  if (!text) return '';
  let cleaned = text
    // Replace LaTeX fractions and math notations with spoken words
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2')
    .replace(/\\pm/g, ' plus or minus ')
    .replace(/\\sqrt\{([^}]+)\}/g, ' square root of $1 ')
    .replace(/\\implies/g, ' implies that ')
    .replace(/\\neq/g, ' not equal to ')
    .replace(/\\times/g, ' times ')
    .replace(/\\div/g, ' divided by ')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\$/g, '')
    // Replace percentages with spoken word "percent" to avoid speech engine stumbles
    .replace(/([0-9]+)\s*%/g, '$1 percent')
    .replace(/%/g, ' percent ')
    // Strip markdown formatting
    .replace(/###/g, '')
    .replace(/##/g, '')
    .replace(/#/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    // Remove links/URLs
    .replace(/https?:\/\/\S+/g, '')
    // Remove common emojis and unusual non-ASCII characters that cause audio skips
    .replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    // Normalize punctuation & whitespace
    .replace(/[\(\)\[\]\{\}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Apply phonetic replacements for accurate pronunciation
  return phoneticNormalize(cleaned);
}

/**
 * Breaks long text into natural sentence-sized chunks (min 180 chars).
 * Short texts (under 240 chars) are kept intact as a single utterance to avoid
 * dropped syllables or prematurely terminated speech.
 */
export function splitIntoCleanChunks(cleanText: string): string[] {
  if (!cleanText) return [];
  if (cleanText.length <= 240) {
    return [cleanText];
  }

  // Split only on genuine sentence boundaries (. ! ?)
  const rawSentences = cleanText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleanText];
  const chunks: string[] = [];
  let buffer = '';

  for (const s of rawSentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if ((buffer + ' ' + trimmed).length > 180 && buffer) {
      chunks.push(buffer.trim());
      buffer = trimmed;
    } else {
      buffer = buffer ? `${buffer} ${trimmed}` : trimmed;
    }
  }

  if (buffer.trim()) {
    chunks.push(buffer.trim());
  }

  return chunks.length > 0 ? chunks : [cleanText];
}

/**
 * Generates punchy, concise voice feedback so the AI delivers high-impact motivation
 * without talking for too long! (under 5-6 seconds spoken duration).
 */
export function getVoiceFeedbackContent(percentage: number, studentName?: string): VoiceFeedbackContent {
  const tier = determinePerformanceTier(percentage);
  const cleanName = cleanStudentName(studentName);
  const roundedPct = Math.round(percentage);

  switch (tier) {
    case 'well': {
      const speech = `Great job, ${cleanName}! You scored ${roundedPct} percent! Keep this winning streak alive!`;
      return {
        tier: 'well',
        category: 'great',
        speechText: speech,
        message: speech,
        title: 'Proud of You! 🌟',
        subtitle: `Outstanding score of ${roundedPct}%! You are mastering these syllabus objectives.`,
        accentColor: 'emerald'
      };
    }
    case 'average': {
      const speech = `Solid effort, ${cleanName}! You scored ${roundedPct} percent. Review your corrections to push even higher!`;
      return {
        tier: 'average',
        category: 'average',
        speechText: speech,
        message: speech,
        title: 'Steady Progress! 📈',
        subtitle: `Solid effort at ${roundedPct}%. Review your corrections to push your score above 75%!`,
        accentColor: 'amber'
      };
    }
    case 'bad':
    default: {
      const speech = `Don't worry, ${cleanName}! You scored ${roundedPct} percent. Naija AI is here to guide you step-by-step. Let's conquer it!`;
      return {
        tier: 'bad',
        category: 'needs_help',
        speechText: speech,
        message: speech,
        title: 'Need Help? Try Naija AI 💡',
        subtitle: `Score: ${roundedPct}%. Don't be discouraged! Let Naija AI break down these tricky topics step-by-step.`,
        actionText: 'Ask Naija AI for Help',
        accentColor: 'rose'
      };
    }
  }
}

// Global anchor window array to permanently guard against Chromium Garbage Collection clipping
declare global {
  interface Window {
    __studyNaijaUtteranceAnchor?: SpeechSynthesisUtterance[];
    __studyNaijaAudioCtx?: AudioContext;
  }
}

// Helper scoring function to identify genuine mid-20s American lady voices
export function scoreAmericanLadyVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = (v.lang || '').toLowerCase().replace(/_/g, '-');
  let score = 0;

  // Language constraint: Must be English
  if (!lang.startsWith('en')) return -1000;
  if (lang === 'en-us' || lang.startsWith('en-us')) {
    score += 400;
  } else if (lang.startsWith('en-ca')) {
    score += 200; // Canadian English is North American
  } else {
    score += 50;
  }

  // Explicit male voice disqualification / heavy penalty
  const maleKeywords = [
    'david', 'mark', 'george', 'guy', 'ryan', 'daniel', 'oliver', 
    'arthur', 'richard', 'alex', 'fred', 'stefan', 'christopher', 
    'eric', 'male', 'chidi', 'brian', 'james', 'john', 'tom', 'steffan'
  ];
  for (const kw of maleKeywords) {
    if (name.includes(kw)) return -900;
  }

  // Tier 1: Microsoft Edge Natural/Neural Mid-20s American Female Voices
  if (name.includes('jenny')) score += 2000;       // Microsoft Jenny (Natural) - Mid-20s American Lady
  if (name.includes('aria')) score += 1900;        // Microsoft Aria (Natural) - Energetic Young US Female
  if (name.includes('ava')) score += 1800;         // Microsoft Ava / Apple Ava - Young US Female
  if (name.includes('michelle')) score += 1700;    // Microsoft Michelle
  if (name.includes('emma')) score += 1650;        // Microsoft Emma
  if (name.includes('ana')) score += 1600;         // Microsoft Ana
  
  // Tier 2: Apple macOS / iOS Premium US Female Voices
  if (name.includes('samantha')) score += 1500;    // Apple Samantha (Classic clear US female)
  if (name.includes('victoria')) score += 1300;    // Apple Victoria
  if (name.includes('allison')) score += 1250;     // Apple Allison
  if (name.includes('zoe')) score += 1200;         // Apple Zoe
  if (name.includes('susan')) score += 1100;
  if (name.includes('karen')) score += 1000;

  // Tier 3: Google Chrome / Android Neural US Female Voices
  if (name.includes('google us english')) score += 1400; // Google US English (Standard Chrome female)
  if (name.includes('en-us-x-sfg') || name.includes('en-us-x-tpd') || name.includes('en-us-x-iol')) score += 1350;
  if (name.includes('wavenet') && (name.includes('-c') || name.includes('-f') || name.includes('-e'))) score += 1300;
  if (name.includes('neural2') && (name.includes('-c') || name.includes('-f'))) score += 1300;

  // Quality acoustic tags
  if (name.includes('natural')) score += 300;
  if (name.includes('neural')) score += 300;
  if (name.includes('enhanced')) score += 250;
  if (name.includes('premium')) score += 250;
  if (name.includes('online')) score += 100;

  // Female descriptors
  if (name.includes('female') || name.includes('woman') || name.includes('girl')) score += 200;

  // Windows Desktop fallback (Zira is the only built-in US female voice on Windows 10/11)
  if (name.includes('zira')) score += 600;

  // Small penalty for local desktop synthesizer
  if (name.includes('desktop')) score -= 20;

  return score;
}

export function scoreMaleVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = (v.lang || '').toLowerCase().replace(/_/g, '-');
  let score = 0;

  if (!lang.startsWith('en')) return -1000;
  if (lang.includes('en-ng') || lang.includes('en-gb') || lang.includes('en-us')) score += 200;

  const femaleKeywords = ['female', 'woman', 'girl', 'jenny', 'aria', 'ava', 'samantha', 'zira', 'karen', 'victoria'];
  for (const kw of femaleKeywords) {
    if (name.includes(kw)) return -900;
  }

  if (name.includes('guy')) score += 1000;
  if (name.includes('ryan')) score += 950;
  if (name.includes('daniel')) score += 900;
  if (name.includes('arthur')) score += 850;
  if (name.includes('oliver')) score += 800;
  if (name.includes('male')) score += 500;
  if (name.includes('natural') || name.includes('neural')) score += 200;

  return score;
}

export class AIVoiceEngine {
  private isSpeakingActive: boolean = false;
  private voicePreference: SpeechSynthesisVoice | null = null;
  private activePersona: VoicePersona = getVoicePersona();
  private speechRate: number = getStoredSpeechRate();
  private listeners: Set<(speaking: boolean) => void> = new Set();
  private pendingTimeout: any = null;
  private currentSessionId: number = 0;
  private audioCtx: AudioContext | null = null;
  private silentGainNode: GainNode | null = null;
  private silentOscillator: OscillatorNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.__studyNaijaUtteranceAnchor = window.__studyNaijaUtteranceAnchor || [];
      if ('speechSynthesis' in window) {
        this.initVoices();

        const handleVoicesChanged = () => {
          this.initVoices(true);
        };

        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
        }
        try {
          window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
        } catch {}

        // Chromium background thread voice-loading polling watchdog:
        // getVoices() is often empty on initial synchronous script tick.
        // Polling every 120ms ensures we lock onto the American lady voice as soon as Chrome exposes it.
        let attempts = 0;
        const voicePoll = setInterval(() => {
          attempts++;
          const voices = window.speechSynthesis.getVoices();
          if (voices && voices.length > 0) {
            this.initVoices(true);
            clearInterval(voicePoll);
          } else if (attempts >= 12) {
            clearInterval(voicePoll);
          }
        }, 120);
      }
    }
  }

  /**
   * Discovers and selects the optimal mid-20s American lady voice.
   */
  public initVoices(force = false): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    try {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return this.voicePreference;

      // Check if user manually saved a preferred voice name
      const preferredName = localStorage.getItem(PREFERRED_VOICE_NAME_KEY);
      if (!force && preferredName) {
        const found = voices.find(v => v.name === preferredName);
        if (found) {
          this.voicePreference = found;
          return found;
        }
      }

      if (this.activePersona === 'female') {
        // Score every available voice for mid-20s American lady attributes
        const scored = voices
          .map(v => ({ voice: v, score: scoreAmericanLadyVoice(v) }))
          .sort((a, b) => b.score - a.score);

        const best = scored[0];
        if (best && best.score > 0) {
          this.voicePreference = best.voice;
        } else {
          // Fallback: any en-US voice or first voice
          const anyEnUs = voices.find(v => (v.lang || '').toLowerCase().startsWith('en-us'));
          this.voicePreference = anyEnUs || voices[0] || null;
        }
      } else {
        const scored = voices
          .map(v => ({ voice: v, score: scoreMaleVoice(v) }))
          .sort((a, b) => b.score - a.score);

        const best = scored[0];
        this.voicePreference = (best && best.score > 0 ? best.voice : voices[0]) || null;
      }

      return this.voicePreference;
    } catch {
      return null;
    }
  }

  public getActiveVoiceName(): string {
    if (this.voicePreference) {
      return `${this.voicePreference.name} (${this.voicePreference.lang})`;
    }
    return this.activePersona === 'female' ? 'Sarah (American Lady - en-US)' : 'Chidi (en-NG/GB)';
  }

  public setVoiceByName(voiceName: string): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    const voices = window.speechSynthesis.getVoices();
    const target = voices.find(v => v.name === voiceName);
    if (target) {
      this.voicePreference = target;
      try {
        localStorage.setItem(PREFERRED_VOICE_NAME_KEY, target.name);
      } catch {}
      return true;
    }
    return false;
  }

  public setPersona(persona: VoicePersona) {
    this.activePersona = persona;
    setVoicePersona(persona);
    this.initVoices(true);
  }

  public getPersona(): VoicePersona {
    return this.activePersona;
  }

  public getSpeechRate(): number {
    return this.speechRate;
  }

  public setSpeechRate(rate: number) {
    const safeRate = Math.min(2.0, Math.max(0.8, rate));
    this.speechRate = safeRate;
    setStoredSpeechRate(safeRate);
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isSpeaking(): boolean {
    return this.isSpeakingActive;
  }

  public onSpeakingChange(callback: (speaking: boolean) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(speaking: boolean) {
    this.isSpeakingActive = speaking;
    this.listeners.forEach(cb => {
      try {
        cb(speaking);
      } catch {}
    });
  }

  /**
   * Plays a subtle, non-blocking acoustic earcon chime.
   * Runs asynchronously in the background so speech starts without waiting!
   */
  private playIntroChime(): void {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
        return;
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5 pleasant bright chime

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.04, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  private startSilentWakeLock() {
    if (typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      if (!this.silentOscillator) {
        this.silentGainNode = this.audioCtx.createGain();
        this.silentGainNode.gain.setValueAtTime(0.0001, this.audioCtx.currentTime);

        this.silentOscillator = this.audioCtx.createOscillator();
        this.silentOscillator.frequency.setValueAtTime(40, this.audioCtx.currentTime);
        this.silentOscillator.connect(this.silentGainNode);
        this.silentGainNode.connect(this.audioCtx.destination);
        this.silentOscillator.start();
      }
    } catch {}
  }

  private stopSilentWakeLock() {
    try {
      if (this.silentOscillator) {
        this.silentOscillator.stop();
        this.silentOscillator.disconnect();
        this.silentOscillator = null;
      }
      if (this.silentGainNode) {
        this.silentGainNode.disconnect();
        this.silentGainNode = null;
      }
    } catch {}
  }

  public stop() {
    this.currentSessionId++;
    if (this.pendingTimeout) {
      clearTimeout(this.pendingTimeout);
      this.pendingTimeout = null;
    }
    this.stopSilentWakeLock();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    if (typeof window !== 'undefined' && window.__studyNaijaUtteranceAnchor) {
      window.__studyNaijaUtteranceAnchor = [];
    }
    this.notify(false);
  }

  /**
   * High-speed speech dispatch with zero artificial latency.
   * Delivers speech crisply at user's preferred speed (default 1.22x).
   */
  public async speak(rawText: string, onEnd?: () => void): Promise<boolean> {
    if (!this.isSupported() || !rawText) return false;

    // Invalidate prior speech sessions and clear any ongoing audio
    this.stop();
    const sessionId = ++this.currentSessionId;

    const cleaned = cleanSpokenText(rawText);
    if (!cleaned) return false;

    const chunks = splitIntoCleanChunks(cleaned);
    if (chunks.length === 0) return false;

    // Refresh voice preference
    this.initVoices(true);

    // Play subtle musical earcon asynchronously (non-blocking)
    this.playIntroChime();

    // Start playback immediately with zero delay
    this.notify(true);
    this.startSilentWakeLock();
    this.playChunkQueue(chunks, 0, sessionId, onEnd);

    return true;
  }

  private playChunkQueue(chunks: string[], index: number, sessionId: number, onEnd?: () => void) {
    if (this.currentSessionId !== sessionId) return;

    if (index >= chunks.length) {
      this.stopSilentWakeLock();
      this.notify(false);
      if (onEnd) onEnd();
      return;
    }

    const chunkText = chunks[index];
    if (!chunkText || !chunkText.trim()) {
      this.playChunkQueue(chunks, index + 1, sessionId, onEnd);
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(chunkText);
      if (!this.voicePreference) {
        this.initVoices(true);
      }
      if (this.voicePreference) {
        utterance.voice = this.voicePreference;
      }
      // Explicitly enforce en-US language model so synthesis uses American dialect
      utterance.lang = this.voicePreference?.lang || 'en-US';

      // Acoustic calibration for mid-20s American lady:
      // - Pitch: 1.15 produces a youthful, bright, upbeat, friendly collegiate tone
      // - Rate: 1.05 delivers natural modern American conversational cadence
      if (this.activePersona === 'female') {
        const vName = (this.voicePreference?.name || '').toLowerCase();
        utterance.pitch = vName.includes('zira') ? 1.18 : 1.15;
        utterance.rate = this.speechRate;
      } else {
        utterance.pitch = 0.98;
        utterance.rate = this.speechRate;
      }
      utterance.volume = 1.0;

      // Pin permanently to global window array so Chromium's Garbage Collector NEVER cuts speech mid-sentence
      if (typeof window !== 'undefined') {
        window.__studyNaijaUtteranceAnchor = window.__studyNaijaUtteranceAnchor || [];
        window.__studyNaijaUtteranceAnchor.push(utterance);
      }

      let isFinished = false;

      const finishCurrent = () => {
        if (isFinished) return;
        isFinished = true;

        if (typeof window !== 'undefined' && window.__studyNaijaUtteranceAnchor) {
          const idx = window.__studyNaijaUtteranceAnchor.indexOf(utterance);
          if (idx !== -1) {
            window.__studyNaijaUtteranceAnchor.splice(idx, 1);
          }
        }

        if (this.currentSessionId === sessionId) {
          setTimeout(() => {
            this.playChunkQueue(chunks, index + 1, sessionId, onEnd);
          }, 5); // ultra-low 5ms gap between chunks
        }
      };

      utterance.onend = finishCurrent;
      utterance.onerror = finishCurrent;

      window.speechSynthesis.speak(utterance);
    } catch {
      this.stopSilentWakeLock();
      this.notify(false);
    }
  }

  public speakExamFeedback(percentage: number, studentName?: string, onEnd?: () => void): VoiceFeedbackContent {
    const feedback = getVoiceFeedbackContent(percentage, studentName);
    this.speak(feedback.speechText, onEnd);
    return feedback;
  }

  public speakLoginGreeting(studentName?: string, onEnd?: () => void): string {
    const firstName = getStudentFirstName(studentName) || getStoredFirstName() || 'Scholar';
    const text = `Hey ${firstName}, welcome back! I'm ready whenever you are. Let's crush your study goals today!`;
    this.speak(text, onEnd);
    markWelcomeAsSpoken();
    return text;
  }

  public speakWelcomeGreeting(studentName?: string, onEnd?: () => void): string {
    const firstName = getStudentFirstName(studentName) || getStoredFirstName() || 'Scholar';
    const text = `Hey ${firstName}! Welcome to Study Naija! I'm Sarah, your AI coach. I'm super excited to help you ace your exams with top scores. Let's get started!`;
    this.speak(text, onEnd);
    markWelcomeAsSpoken();
    return text;
  }

  /**
   * Reads an explanation concisely at fast speed (max 15-20 seconds).
   */
  public speakConciseExplanation(text: string, onEnd?: () => void): void {
    const clean = cleanSpokenText(text);
    // Take only first 2 sentences if text is very long
    const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
    const concise = sentences.slice(0, 2).join(' ') || clean;
    this.speak(concise, onEnd);
  }
}

export const aiVoice = new AIVoiceEngine();
