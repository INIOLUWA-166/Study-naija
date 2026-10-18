import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, Check, Edit3, ArrowRight, UserCheck, Mic } from 'lucide-react';
import { User } from '../types';
import { 
  aiVoice, 
  getStudentFirstName, 
  getStoredFirstName, 
  setStoredFirstName,
  hasWelcomeBeenSpokenThisSession,
  markWelcomeAsSpoken,
  getVoicePersona,
  setVoicePersona,
  VoicePersona
} from '../utils/aiVoice';

interface WelcomeVoiceBannerProps {
  user: User | null;
  onOpenAuth?: () => void;
}

export const WelcomeVoiceBanner: React.FC<WelcomeVoiceBannerProps> = ({ user, onOpenAuth }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [guestNameInput, setGuestNameInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<VoicePersona>(() => getVoicePersona());
  const [currentSpokenName, setCurrentSpokenName] = useState<string>(() => {
    return getStudentFirstName(user?.name) || getStudentFirstName(user?.email) || getStoredFirstName() || '';
  });

  const hasAutoSpokenRef = useRef(false);

  // Keep spoken name updated if user logs in or changes
  useEffect(() => {
    const nameFromUser = getStudentFirstName(user?.name) || getStudentFirstName(user?.email);
    if (nameFromUser) {
      setCurrentSpokenName(nameFromUser);
      setStoredFirstName(nameFromUser);
    } else {
      const stored = getStoredFirstName();
      if (stored) {
        setCurrentSpokenName(stored);
      }
    }
  }, [user]);

  // Track speech synthesis speaking state
  useEffect(() => {
    const unsub = aiVoice.onSpeakingChange(speaking => {
      setIsSpeaking(speaking);
    });
    return unsub;
  }, []);

  // Play welcome voice AUTOMATICALLY upon entering the website
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const playWelcomeNow = () => {
      if (hasAutoSpokenRef.current) return;
      hasAutoSpokenRef.current = true;

      const activeName = getStudentFirstName(user?.name) || getStudentFirstName(user?.email) || getStoredFirstName() || 'Scholar';
      aiVoice.speakWelcomeGreeting(activeName);
    };

    // 1. Instantly trigger automatic welcome voice on page mount (500ms delay for voice thread discovery)
    const autoPlayTimer = setTimeout(() => {
      playWelcomeNow();
    }, 500);

    // 2. Unpause/resume watchdog: In case browser enforces strict un-gestured autoplay policy,
    // any natural interaction (scroll, touch, pointer movement, or click) will immediately launch or unpause the voice!
    const handleBrowserInteraction = () => {
      if (!hasAutoSpokenRef.current) {
        playWelcomeNow();
      } else if ('speechSynthesis' in window && window.speechSynthesis.paused) {
        try {
          window.speechSynthesis.resume();
        } catch {}
      }
      cleanupListeners();
    };

    const cleanupListeners = () => {
      window.removeEventListener('pointerdown', handleBrowserInteraction);
      window.removeEventListener('touchstart', handleBrowserInteraction);
      window.removeEventListener('scroll', handleBrowserInteraction);
      window.removeEventListener('click', handleBrowserInteraction);
      window.removeEventListener('keydown', handleBrowserInteraction);
    };

    window.addEventListener('pointerdown', handleBrowserInteraction, { passive: true });
    window.addEventListener('touchstart', handleBrowserInteraction, { passive: true });
    window.addEventListener('scroll', handleBrowserInteraction, { passive: true });
    window.addEventListener('click', handleBrowserInteraction, { passive: true });
    window.addEventListener('keydown', handleBrowserInteraction, { passive: true });

    return () => {
      clearTimeout(autoPlayTimer);
      cleanupListeners();
    };
  }, [user]);

  const handleManualSpeak = () => {
    if (isSpeaking) {
      aiVoice.stop();
    } else {
      const name = currentSpokenName || 'Scholar';
      aiVoice.speakWelcomeGreeting(name);
    }
  };

  const handlePersonaSwitch = (newPersona: VoicePersona) => {
    setCurrentPersona(newPersona);
    aiVoice.setPersona(newPersona);
    const name = currentSpokenName || 'Scholar';
    aiVoice.speakWelcomeGreeting(name);
  };

  const handleSaveGuestName = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = getStudentFirstName(guestNameInput);
    if (!clean) return;

    setStoredFirstName(clean);
    setCurrentSpokenName(clean);
    setIsEditingName(false);
    setGuestNameInput('');

    // Immediately welcome the student with the AI voice
    aiVoice.speakWelcomeGreeting(clean);
  };

  if (isDismissed) return null;

  return (
    <section 
      id="welcome-voice-banner"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white border border-emerald-500/20 shadow-sm p-4 sm:p-5 mb-6"
    >
      {/* Background subtle ambient ring */}
      <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Left Side: Avatar & Greeting */}
        <div className="flex items-start sm:items-center gap-3.5 flex-1">
          <div className="relative flex-shrink-0 mt-0.5 sm:mt-0">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner transition-transform duration-300 ${
              isSpeaking 
                ? 'bg-emerald-500 text-slate-950 scale-105 ring-4 ring-emerald-400/30' 
                : 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
            }`}>
              {isSpeaking ? (
                <div className="flex items-center gap-0.5 h-5">
                  <span className="w-1 bg-slate-950 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
                  <span className="w-1 bg-slate-950 rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.1s] h-5" />
                  <span className="w-1 bg-slate-950 rounded-full animate-[pulse_0.5s_ease-in-out_infinite_0.2s] h-4" />
                  <span className="w-1 bg-slate-950 rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.15s] h-2" />
                </div>
              ) : (
                <Sparkles className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/60 inline-flex items-center gap-1.5">
                <Mic className="w-3 h-3 text-emerald-400" />
                AI Voice: Mid-20s American Lady
              </span>

              {/* Voice Persona Toggle */}
              <div className="inline-flex items-center rounded-lg bg-slate-950/60 p-0.5 border border-slate-700/80 text-[11px]">
                <button
                  type="button"
                  onClick={() => handlePersonaSwitch('female')}
                  className={`px-2.5 py-0.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    currentPersona === 'female'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Switch to Sarah (Mid-20s American Lady Voice - en-US)"
                >
                  <span>🇺🇸 Sarah (Mid-20s American)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePersonaSwitch('male')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    currentPersona === 'male'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Switch to Chidi (Male Alternative Voice)"
                >
                  <span>👨🏾 Chidi</span>
                </button>
              </div>

              {isSpeaking && (
                <span className="text-[11px] font-medium text-emerald-300 animate-pulse flex items-center gap-1.5 bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Sarah is speaking welcome greeting...
                </span>
              )}
            </div>

            {currentSpokenName && !isEditingName ? (
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                    Welcome to Study Naija, <span className="text-emerald-400">{currentSpokenName}</span>! 👋
                  </h3>
                  {!user && (
                    <button
                      onClick={() => {
                        setGuestNameInput(currentSpokenName);
                        setIsEditingName(true);
                      }}
                      className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                      title="Edit your first name"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-300 max-w-xl">
                  {isSpeaking 
                    ? `“Hey ${currentSpokenName}! Welcome to Study Naija! I'm Sarah, your AI coach. I'm super excited to help you ace your JAMB and WAEC exams with top scores. Let's get started!”`
                    : `Your AI coach Sarah is ready with real-time audio guidance for JAMB UTME, WAEC SSCE, and timed CBT practice.`}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                  Welcome to Study Naija! What is your name?
                </h3>
                <p className="text-xs text-slate-300">
                  Tell Naija AI your first name so we can welcome and guide you personally.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Controls / Input Form */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end flex-shrink-0">
          {(!currentSpokenName || isEditingName) ? (
            <form onSubmit={handleSaveGuestName} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={guestNameInput}
                onChange={e => setGuestNameInput(e.target.value)}
                placeholder="Enter your first name..."
                maxLength={20}
                className="px-3 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-48"
                autoFocus
              />
              <button
                type="submit"
                disabled={!guestNameInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap cursor-pointer"
              >
                <span>Greet Me</span>
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              {isEditingName && (
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="px-2 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
              )}
            </form>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                id="listen-welcome-voice-btn"
                onClick={handleManualSpeak}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
                  isSpeaking
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-102 active:scale-98 shadow-emerald-950/40'
                }`}
                title={isSpeaking ? 'Stop speaking' : 'Hear natural voice welcome'}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Replay Welcome Voice</span>
                  </>
                )}
              </button>

              {!user && onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1 hidden sm:inline-flex cursor-pointer"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3 h-3 text-emerald-400" />
                </button>
              )}

              <button
                onClick={() => setIsDismissed(true)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
                title="Dismiss banner"
              >
                <span className="text-xs">✕</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
