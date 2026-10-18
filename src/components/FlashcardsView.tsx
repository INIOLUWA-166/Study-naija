import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Shuffle, 
  Award,
  Filter
} from 'lucide-react';
import { Flashcard, User } from '../types';
import { FLASHCARD_DECKS } from '../data/flashcardsData';
import { aiVoice } from '../utils/aiVoice';

interface FlashcardsViewProps {
  user: User | null;
  onNavigate: (view: string, extra?: any) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  user,
  onNavigate
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('studynaija_flashcards_mastered');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // Filter cards
  const filteredCards = useMemo(() => {
    return FLASHCARD_DECKS.filter(card => {
      if (selectedSubject !== 'all' && card.subjectId !== selectedSubject) return false;
      if (selectedCategory !== 'all' && card.category !== selectedCategory) return false;
      return true;
    });
  }, [selectedSubject, selectedCategory]);

  const currentCard: Flashcard | undefined = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1);
    }
  };

  const handleToggleMastered = (cardId: string) => {
    const updated = new Set(masteredIds);
    if (updated.has(cardId)) {
      updated.delete(cardId);
    } else {
      updated.add(cardId);
    }
    setMasteredIds(updated);
    try {
      localStorage.setItem('studynaija_flashcards_mastered', JSON.stringify(Array.from(updated)));
    } catch {}
  };

  const handleSpeakCard = () => {
    if (!currentCard) return;
    const textToSpeak = isFlipped 
      ? `Answer: ${currentCard.back}. ${currentCard.mnemonic ? `Mnemonic to remember: ${currentCard.mnemonic}` : ''}`
      : `Question: ${currentCard.front}`;
    aiVoice.speak(textToSpeak);
  };

  return (
    <div id="flashcards-view" className="space-y-8 pb-16">
      
      {/* Header Bar */}
      <div className="rounded-3xl bg-slate-950 text-white border border-cyan-500/30 p-6 sm:p-8 shadow-[0_10px_35px_rgba(6,182,212,0.12)] relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>RAPID-FIRE MEMORY ENGINE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-['Outfit'] tracking-tight">
              Formula & Concept Flashcards
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              High-yield Physics equations, Chemistry reaction laws, Mathematics identities, and English concord rules optimized for quick spaced repetition.
            </p>
          </div>

          {/* Quick Mastery Counter */}
          <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shrink-0">
            <div className="text-center">
              <div className="text-2xl font-black font-mono text-cyan-400">
                {masteredIds.size} / {FLASHCARD_DECKS.length}
              </div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Mastered Cards</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center">
              <div className="text-2xl font-black font-mono text-emerald-400">
                {Math.round((masteredIds.size / FLASHCARD_DECKS.length) * 100)}%
              </div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Retention Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Subject:</span>
          {[
            { id: 'all', label: 'All Subjects' },
            { id: 'physics', label: 'Physics' },
            { id: 'chemistry', label: 'Chemistry' },
            { id: 'maths', label: 'Mathematics' },
            { id: 'english', label: 'English' },
            { id: 'government', label: 'Government' }
          ].map(sub => (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedSubject(sub.id);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSubject === sub.id
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type:</span>
          <select
            value={selectedCategory}
            onChange={e => {
              setSelectedCategory(e.target.value);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="all">All Card Types</option>
            <option value="formula">Formulas Only</option>
            <option value="law">Laws & Principles</option>
            <option value="shortcut">Exam Shortcuts</option>
          </select>
        </div>
      </div>

      {/* Main Flashcard Interactive Stage */}
      {filteredCards.length > 0 && currentCard ? (
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Card Meta & Navigation header */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 px-2">
            <span className="font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
              {currentCard.subjectName} • {currentCard.topic}
            </span>
            <span>
              Card {currentIndex + 1} of {filteredCards.length}
            </span>
          </div>

          {/* 3D Flip Card Container */}
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative min-h-[340px] sm:min-h-[380px] rounded-3xl cursor-pointer select-none transition-all duration-300 transform perspective-1000 group"
          >
            <div className={`relative w-full h-full rounded-3xl p-8 sm:p-10 flex flex-col justify-between border shadow-lg transition-all duration-300 ${
              isFlipped 
                ? 'bg-slate-950 text-white border-cyan-500/40 shadow-[0_15px_40px_rgba(6,182,212,0.2)]'
                : 'bg-white text-slate-900 border-slate-200 hover:border-cyan-500/40 hover:shadow-xl'
            }`}>
              
              {/* Top Tags inside card */}
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                  isFlipped 
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500/30'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {isFlipped ? 'SOLUTION // VERIFIED FORMULA' : 'RECALL PROMPT // TAP TO FLIP'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpeakCard();
                    }}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      isFlipped
                        ? 'bg-slate-900 border-slate-800 text-cyan-400 hover:text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                    title="Listen to card audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleMastered(currentCard.id);
                    }}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      masteredIds.has(currentCard.id)
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xs font-bold'
                        : isFlipped
                          ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-800'
                    }`}
                    title={masteredIds.has(currentCard.id) ? 'Mastered!' : 'Mark as mastered'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Center Content */}
              <div className="my-auto py-6 space-y-4">
                {!isFlipped ? (
                  <div className="space-y-3">
                    <span className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">Question:</span>
                    <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] leading-snug">
                      {currentCard.front}
                    </h3>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fadeIn">
                    <span className="text-xs uppercase font-mono font-bold text-cyan-400 tracking-wider">Detailed Formula & Breakdown:</span>
                    <div className="text-base sm:text-lg font-mono font-bold whitespace-pre-line text-cyan-200 bg-cyan-950/40 p-4 rounded-2xl border border-cyan-500/20">
                      {currentCard.back}
                    </div>

                    {currentCard.mnemonic && (
                      <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <span><strong>Mnemonic:</strong> {currentCard.mnemonic}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Flip Hint */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Tap anywhere on card to {isFlipped ? 'see question' : 'reveal answer'}</span>
                </span>
                <span className="text-emerald-500 font-bold">
                  {masteredIds.has(currentCard.id) ? '✓ Mastered' : '○ Learning'}
                </span>
              </div>

            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Card</span>
            </button>

            <button
              onClick={() => handleToggleMastered(currentCard.id)}
              className={`px-5 py-3 rounded-2xl font-bold text-xs border transition-all flex items-center gap-2 cursor-pointer ${
                masteredIds.has(currentCard.id)
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{masteredIds.has(currentCard.id) ? 'Mastered (Click to Unmark)' : 'Mark as Mastered'}</span>
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs border border-slate-800 shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>Next Card</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-500 text-sm">No flashcards found for the selected filter.</p>
        </div>
      )}

    </div>
  );
};
