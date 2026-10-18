import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  Clock, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Award, 
  Check, 
  X, 
  Flame, 
  HelpCircle, 
  Sliders, 
  Share2, 
  FileText, 
  Lightbulb, 
  Compass, 
  Zap, 
  GraduationCap,
  ChevronRight
} from 'lucide-react';
import { STORY_BOOKS, StoryBook, StoryChapter, VocabularyWord } from '../data/storyBooks';
import { User } from '../types';
import confetti from 'canvas-confetti';

interface StoryBooksViewProps {
  user: User | null;
  onNavigate: (view: string, extra?: any) => void;
  onUpdateUser?: (user: User) => void;
}

export const StoryBooksView: React.FC<StoryBooksViewProps> = ({
  user,
  onNavigate,
  onUpdateUser
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeStory, setActiveStory] = useState<StoryBook | null>(null);
  const [activeChapterIdx, setActiveChapterIdx] = useState<number>(0);
  const [readerTheme, setReaderTheme] = useState<'day' | 'sepia' | 'night' | 'oled'>('sepia');
  const [readerFontSize, setReaderFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [selectedVocabWord, setSelectedVocabWord] = useState<VocabularyWord | null>(null);
  
  // Bookmarks & Completion state
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('studynaija_bookmarked_stories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [completedStories, setCompletedStories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('studynaija_completed_stories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Quiz state
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Audio Narration (Web Speech API)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Sync bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('studynaija_bookmarked_stories', JSON.stringify(bookmarkedIds));
    } catch {}
  }, [bookmarkedIds]);

  // Sync completed
  useEffect(() => {
    try {
      localStorage.setItem('studynaija_completed_stories', JSON.stringify(completedStories));
    } catch {}
  }, [completedStories]);

  // Cleanup speech synthesis on unmount or story close
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleBookmark = (storyId: string) => {
    setBookmarkedIds(prev => 
      prev.includes(storyId) ? prev.filter(id => id !== storyId) : [...prev, storyId]
    );
  };

  const genres = ['All', 'Mystery', 'Sci-Fi', 'Folklore', 'Thriller', 'Historical STEM', 'Campus Comedy'];

  const [currentPage, setCurrentPage] = useState<number>(1);
  const storiesPerPage = 12;

  // Reset page when genre or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenre, searchQuery]);

  const filteredStories = STORY_BOOKS.filter(story => {
    const matchesGenre = selectedGenre === 'All' || story.genre === selectedGenre;
    const matchesQuery = !searchQuery || 
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.synopsis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.moralLesson.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filteredStories.length / storiesPerPage));
  const paginatedStories = filteredStories.slice((currentPage - 1) * storiesPerPage, currentPage * storiesPerPage);

  // Open story reader
  const handleOpenStory = (story: StoryBook, startChapter = 0) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveStory(story);
    setActiveChapterIdx(startChapter);
    setQuizActive(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setSelectedVocabWord(null);
  };

  const handleCloseStory = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setActiveStory(null);
    setSelectedVocabWord(null);
    setQuizActive(false);
  };

  // Text-To-Speech controls
  const handleTogglePlaySpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !activeStory) return;

    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    // Start fresh speech for active chapter
    window.speechSynthesis.cancel();
    const currentChapter = activeStory.chapters[activeChapterIdx];
    const textToRead = `${currentChapter.title}. ${currentChapter.content}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95; // Steady, expressive reading rate
    utterance.pitch = 1.0;

    // Try finding an English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en-NG') || v.lang.startsWith('en-GB') || v.lang.startsWith('en-US'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  };

  // Submit Comprehension Quiz
  const handleSubmitQuiz = () => {
    if (!activeStory) return;
    let correctCount = 0;
    activeStory.comprehensionQuiz.forEach(q => {
      if (quizAnswers[q.id] === q.correctOption) {
        correctCount++;
      }
    });

    setQuizScore(correctCount);
    setQuizSubmitted(true);

    if (correctCount >= 3) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      // Add to completed stories
      if (!completedStories.includes(activeStory.id)) {
        setCompletedStories(prev => [...prev, activeStory.id]);
      }

      // Award XP
      if (user && onUpdateUser) {
        const xpBonus = 35;
        const updated = {
          ...user,
          xp: (user.xp || 0) + xpBonus,
          stats: {
            ...user.stats,
            questionsSolved: (user.stats?.questionsSolved || 0) + activeStory.comprehensionQuiz.length
          }
        };
        onUpdateUser(updated);
      }
    }
  };

  // Font size classes
  const fontSizes = {
    sm: 'text-sm leading-relaxed',
    md: 'text-base sm:text-lg leading-relaxed',
    lg: 'text-lg sm:text-xl leading-relaxed',
    xl: 'text-xl sm:text-2xl leading-loose'
  };

  // Theme styling for reader
  const themeStyles = {
    day: {
      bg: 'bg-white',
      text: 'text-slate-900',
      heading: 'text-slate-950',
      panel: 'bg-slate-50 border-slate-200',
      border: 'border-slate-200',
      accent: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      highlight: 'bg-yellow-100 text-slate-950 underline decoration-amber-400 cursor-pointer hover:bg-yellow-200'
    },
    sepia: {
      bg: 'bg-[#fbf0d9]',
      text: 'text-[#433422]',
      heading: 'text-[#2b1d0e]',
      panel: 'bg-[#f4e2bf] border-[#e2cca4]',
      border: 'border-[#dfc69c]',
      accent: 'text-[#5d3b14] bg-[#ebd5ad] border-[#d8be92]',
      highlight: 'bg-[#ebd097] text-[#2b1d0e] font-semibold underline decoration-[#8c5825] cursor-pointer hover:bg-[#dfbe7b]'
    },
    night: {
      bg: 'bg-slate-900',
      text: 'text-slate-200',
      heading: 'text-white',
      panel: 'bg-slate-800/90 border-slate-700',
      border: 'border-slate-700',
      accent: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30',
      highlight: 'bg-cyan-950/80 text-cyan-200 font-semibold underline decoration-cyan-400 cursor-pointer hover:bg-cyan-900'
    },
    oled: {
      bg: 'bg-black',
      text: 'text-zinc-300',
      heading: 'text-white',
      panel: 'bg-zinc-950 border-zinc-800',
      border: 'border-zinc-800',
      accent: 'text-amber-400 bg-amber-950/60 border-amber-500/30',
      highlight: 'bg-amber-950/90 text-amber-200 font-semibold underline decoration-amber-400 cursor-pointer hover:bg-amber-900'
    }
  };

  const currentTheme = themeStyles[readerTheme];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 animate-fade-in font-sans">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & HERO BANNER */}
      {/* ========================================================================= */}
      {!activeStory && (
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-500/40 p-6 sm:p-10 text-white shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>STUDYNAIJA LITERATURE & STORY BOOKS HUB</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  {STORY_BOOKS.length} Stories Available
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black font-['Outfit'] tracking-tight text-white">
                Captivating Stories for Nigerian Scholars 📚
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Explore an inspiring collection of original Nigerian short stories—from 
                <strong> African science fiction in Nsukka</strong> and <strong>university mysteries in Ibadan</strong> to 
                <strong> ancient Kano legends, humorous campus chemistry pranks, and classic folklore</strong>. 
                Improve your vocabulary, master reading comprehension, and earn Merit XP!
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Audio Speech Narration</span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Interactive Vocabulary Tooltips</span>
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>CBT Comprehension Quizzes (+35 XP)</span>
                </span>
              </div>
            </div>

            {/* Quick Stats Widget */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 text-center shrink-0 w-full md:w-auto min-w-[220px] shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-2xl mx-auto mb-2">
                📖
              </div>
              <div className="text-2xl font-black font-mono text-emerald-300">
                {completedStories.length} / {STORY_BOOKS.length}
              </div>
              <div className="text-xs text-slate-300 font-medium">Stories Read & Quizzed</div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                {bookmarkedIds.length} Saved in Reading List
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FILTER & SEARCH BAR */}
      {/* ========================================================================= */}
      {!activeStory && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stories by title, author, moral, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Bookmarked Filter Pill */}
            {bookmarkedIds.length > 0 && (
              <button
                onClick={() => setSearchQuery(searchQuery === '__bookmarked__' ? '' : '__bookmarked__')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  searchQuery === '__bookmarked__'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-900 border border-slate-800 text-amber-300 hover:bg-slate-850'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>My Bookmarks ({bookmarkedIds.length})</span>
              </button>
            )}
          </div>

          {/* Genre Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedGenre === genre
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STORIES GALLERY GRID (PAGINATED 500-STORY CATALOG) */}
      {/* ========================================================================= */}
      {!activeStory && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>
              Showing {Math.min((currentPage - 1) * storiesPerPage + 1, filteredStories.length)} – {Math.min(currentPage * storiesPerPage, filteredStories.length)} of {filteredStories.length} Nigerian Stories
            </span>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedStories.map(story => {
            const isBookmarked = bookmarkedIds.includes(story.id);
            const isCompleted = completedStories.includes(story.id);

            return (
              <div
                key={story.id}
                className="group bg-slate-900 rounded-3xl border border-slate-800 hover:border-emerald-500/40 shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:translate-y-[-3px]"
              >
                {/* Header Banner */}
                <div className={`p-5 bg-gradient-to-r ${story.coverGradient} relative border-b border-slate-800`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-inner shrink-0">
                        {story.icon}
                      </div>
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/15 text-white uppercase tracking-wider">
                          {story.genre}
                        </span>
                        <div className="text-xs text-slate-300 font-medium mt-1">
                          By {story.author}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleBookmark(story.id)}
                      className="p-2 rounded-xl bg-slate-950/60 hover:bg-slate-950 text-slate-300 hover:text-amber-300 transition cursor-pointer"
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Story'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <h3 className="text-lg font-black font-['Outfit'] text-white mt-4 line-clamp-1 group-hover:text-emerald-300 transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                    {story.tagline}
                  </p>
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {story.synopsis}
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{story.readingTimeMinutes} min read</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{story.chapters.length} Chapters</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                        <span>{story.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Award className="w-3.5 h-3.5 text-purple-400" />
                        <span>{story.vocabulary.length} Vocab Words</span>
                      </div>
                    </div>

                    {/* Moral Lesson Quote Pill */}
                    <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 italic flex items-start gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{story.moralLesson}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80">
                    {isCompleted ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Completed & Tested</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        +35 XP on Quiz Completion
                      </span>
                    )}

                    <button
                      onClick={() => handleOpenStory(story)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer ml-auto"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read Story →</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-800 text-xs">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed border border-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Page</span>
            </button>

            {/* Page number indicators */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {Array.from({ length: Math.min(7, totalPages) }, (_, idx) => {
                let pageNum = idx + 1;
                if (totalPages > 7) {
                  if (currentPage > 4 && currentPage < totalPages - 2) {
                    pageNum = currentPage - 3 + idx;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 6 + idx;
                  }
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-mono font-bold transition cursor-pointer text-xs ${
                      currentPage === pageNum
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed border border-slate-800"
            >
              <span>Next Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ACTIVE STORY IMMERSIVE READER VIEW */}
      {/* ========================================================================= */}
      {activeStory && (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
          
          {/* Reader Top Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl text-white">
            <button
              onClick={handleCloseStory}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Library</span>
            </button>

            {/* Audio Speech Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePlaySpeech}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md ${
                  isSpeaking && !isPaused
                    ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
                title="Listen to Story Narration via AI Voice"
              >
                {isSpeaking && !isPaused ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Audio</span>
                  </>
                ) : isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Resume Audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen Aloud 🎙️</span>
                  </>
                )}
              </button>

              {isSpeaking && (
                <button
                  onClick={handleStopSpeech}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                  title="Stop Audio"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Reader Style Toggles */}
            <div className="flex items-center gap-3">
              {/* Theme Picker */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setReaderTheme('sepia')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    readerTheme === 'sepia' ? 'bg-[#ebd097] text-slate-950 font-black' : 'text-slate-400'
                  }`}
                  title="Sepia Book Mode"
                >
                  📜 Sepia
                </button>
                <button
                  onClick={() => setReaderTheme('day')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    readerTheme === 'day' ? 'bg-white text-slate-950 font-black' : 'text-slate-400'
                  }`}
                  title="Day Light Mode"
                >
                  ☀️ Day
                </button>
                <button
                  onClick={() => setReaderTheme('night')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    readerTheme === 'night' ? 'bg-slate-800 text-white font-black' : 'text-slate-400'
                  }`}
                  title="Night Slate Mode"
                >
                  🌙 Night
                </button>
                <button
                  onClick={() => setReaderTheme('oled')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    readerTheme === 'oled' ? 'bg-zinc-800 text-amber-300 font-black' : 'text-slate-400'
                  }`}
                  title="OLED Dark Mode"
                >
                  🌑 OLED
                </button>
              </div>

              {/* Font Size Selector */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setReaderFontSize('sm')}
                  className={`px-2 py-1 rounded-lg font-bold cursor-pointer ${readerFontSize === 'sm' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                >
                  A-
                </button>
                <button
                  onClick={() => setReaderFontSize('md')}
                  className={`px-2 py-1 rounded-lg font-bold cursor-pointer ${readerFontSize === 'md' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                >
                  A
                </button>
                <button
                  onClick={() => setReaderFontSize('lg')}
                  className={`px-2 py-1 rounded-lg font-bold cursor-pointer ${readerFontSize === 'lg' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                >
                  A+
                </button>
                <button
                  onClick={() => setReaderFontSize('xl')}
                  className={`px-2 py-1 rounded-lg font-bold cursor-pointer ${readerFontSize === 'xl' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}
                >
                  A++
                </button>
              </div>

              {/* Bookmark Toggle */}
              <button
                onClick={() => toggleBookmark(activeStory.id)}
                className={`p-2 rounded-xl transition cursor-pointer ${
                  bookmarkedIds.includes(activeStory.id) ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Bookmark"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chapter Tabs & Comprehension Quiz Switcher */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 overflow-x-auto gap-2">
            <div className="flex items-center gap-1.5">
              {activeStory.chapters.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveChapterIdx(idx);
                    setQuizActive(false);
                    if (isSpeaking) handleStopSpeech();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    !quizActive && activeChapterIdx === idx
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800'
                  }`}
                >
                  <span>Ch. {idx + 1}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setQuizActive(true);
                if (isSpeaking) handleStopSpeech();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                quizActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'bg-slate-900 hover:bg-slate-850 text-amber-300 border border-amber-500/30'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Comprehension Quiz (+35 XP)</span>
            </button>
          </div>

          {/* Vocabulary Popover Modal */}
          {selectedVocabWord && (
            <div className="p-4 rounded-2xl bg-amber-950/90 border border-amber-500/50 text-amber-100 shadow-xl flex items-start justify-between gap-4 animate-in fade-in">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-amber-300 font-mono uppercase">
                    {selectedVocabWord.word}
                  </span>
                  <span className="text-[10px] font-mono italic px-2 py-0.5 rounded bg-amber-900/60 text-amber-200">
                    {selectedVocabWord.partOfSpeech}
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  <strong>Definition:</strong> {selectedVocabWord.definition}
                </p>
                <p className="text-[11px] text-amber-300/80 italic">
                  <strong>Example:</strong> "{selectedVocabWord.exampleSentence}"
                </p>
              </div>
              <button
                onClick={() => setSelectedVocabWord(null)}
                className="p-1 rounded-lg text-amber-300 hover:bg-amber-900/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Main Book Paper Sheet */}
          {!quizActive ? (
            <article className={`p-6 sm:p-12 rounded-3xl shadow-2xl border ${currentTheme.bg} ${currentTheme.text} ${currentTheme.border} space-y-6 transition-colors duration-200`}>
              
              {/* Story Header */}
              <header className="border-b pb-6 space-y-2 border-current/20">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest opacity-80">
                  <span>{activeStory.genre}</span>
                  <span>•</span>
                  <span>{activeStory.difficulty}</span>
                  <span>•</span>
                  <span>{activeStory.readingTimeMinutes} min read</span>
                </div>

                <h1 className={`text-2xl sm:text-4xl font-black font-['Outfit'] ${currentTheme.heading}`}>
                  {activeStory.title}
                </h1>

                <div className="text-sm font-semibold opacity-90">
                  Written by {activeStory.author}
                </div>
              </header>

              {/* Chapter Content */}
              <div className="space-y-6">
                <h2 className={`text-xl font-black font-['Outfit'] ${currentTheme.heading} flex items-center gap-2`}>
                  <span>{activeStory.chapters[activeChapterIdx].title}</span>
                </h2>

                {/* Chapter paragraphs */}
                <div className={`space-y-4 font-serif text-justify ${fontSizes[readerFontSize]}`}>
                  {activeStory.chapters[activeChapterIdx].content.split('\n\n').map((paragraph, pIdx) => {
                    return (
                      <p key={pIdx} className="leading-relaxed">
                        {paragraph}
                      </p>
                    );
                  })}
                </div>
              </div>

              {/* Clickable Vocabulary Helper Bar */}
              <div className={`p-4 rounded-2xl ${currentTheme.panel} space-y-2 mt-8`}>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span>Key Literary Vocabulary in This Story (Click to Inspect):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeStory.vocabulary.map((v, vIdx) => (
                    <button
                      key={vIdx}
                      onClick={() => setSelectedVocabWord(v)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${currentTheme.accent}`}
                    >
                      {v.word} ({v.partOfSpeech})
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Between Chapters */}
              <div className="flex items-center justify-between pt-6 border-t border-current/20">
                {activeChapterIdx > 0 ? (
                  <button
                    onClick={() => {
                      setActiveChapterIdx(prev => prev - 1);
                      if (isSpeaking) handleStopSpeech();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous Chapter</span>
                  </button>
                ) : (
                  <div />
                )}

                {activeChapterIdx < activeStory.chapters.length - 1 ? (
                  <button
                    onClick={() => {
                      setActiveChapterIdx(prev => prev + 1);
                      if (isSpeaking) handleStopSpeech();
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-500 transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Next Chapter</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setQuizActive(true);
                      if (isSpeaking) handleStopSpeech();
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 transition flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Take Comprehension Quiz (+35 XP) →</span>
                  </button>
                )}
              </div>
            </article>
          ) : (
            /* COMPREHENSION QUIZ SCREEN */
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-6 text-white">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                    CBT Comprehension & Literary Analysis
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white mt-0.5">
                    Quiz: {activeStory.title}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                    4 Questions • Passing: 3/4
                  </span>
                </div>
              </div>

              {/* Quiz Questions List */}
              <div className="space-y-6">
                {activeStory.comprehensionQuiz.map((q, qIdx) => {
                  const selected = quizAnswers[q.id];
                  const isSubmitted = quizSubmitted;
                  const isCorrect = selected === q.correctOption;

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          {qIdx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-slate-200 leading-snug">
                          {q.question}
                        </h4>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {(['A', 'B', 'C', 'D'] as const).map(optKey => {
                          const optText = q.options[optKey];
                          const isOptionSelected = selected === optKey;
                          const isOptionCorrect = q.correctOption === optKey;

                          let btnClasses = 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800';

                          if (isSubmitted) {
                            if (isOptionCorrect) {
                              btnClasses = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                            } else if (isOptionSelected && !isCorrect) {
                              btnClasses = 'bg-red-950/80 border-red-500 text-red-200 line-through';
                            }
                          } else if (isOptionSelected) {
                            btnClasses = 'bg-emerald-600 text-white font-bold border-emerald-500';
                          }

                          return (
                            <button
                              key={optKey}
                              disabled={isSubmitted}
                              onClick={() => {
                                setQuizAnswers(prev => ({ ...prev, [q.id]: optKey }));
                              }}
                              className={`p-3 rounded-xl border text-xs text-left transition flex items-center gap-2.5 cursor-pointer ${btnClasses}`}
                            >
                              <span className="w-5 h-5 rounded-md bg-slate-800 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                                {optKey}
                              </span>
                              <span>{optText}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation on submission */}
                      {isSubmitted && (
                        <div className={`p-3 rounded-xl text-xs space-y-1 ${
                          isCorrect ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-slate-900 text-slate-300 border border-slate-800'
                        }`}>
                          <div className="font-bold">
                            {isCorrect ? '✅ Correct Answer!' : `❌ Correct Option was (${q.correctOption})`}
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit / Results Bar */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                {!quizSubmitted ? (
                  <>
                    <span className="text-xs text-slate-400">
                      Answer all 4 questions to verify your comprehension and earn +35 XP.
                    </span>
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(quizAnswers).length < 4}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-black text-xs transition shadow-lg disabled:opacity-40 cursor-pointer"
                    >
                      Submit Quiz Answers →
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black text-xl">
                        {quizScore >= 3 ? '🏆' : '📚'}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">
                          Your Score: {quizScore} / 4 Correct ({Math.round((quizScore / 4) * 100)}%)
                        </div>
                        <div className="text-xs text-slate-300">
                          {quizScore >= 3 
                            ? '🎉 Superb comprehension! You earned +35 Merit XP!' 
                            : 'Review the story chapters and try again to master this text!'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setQuizAnswers({});
                          setQuizSubmitted(false);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
                      >
                        Retake Quiz
                      </button>
                      <button
                        onClick={handleCloseStory}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                      >
                        Finish & Browse More Stories
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
