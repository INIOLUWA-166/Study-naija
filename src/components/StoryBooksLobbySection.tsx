import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  ChevronRight, 
  BookMarked, 
  Compass, 
  Bookmark, 
  Flame, 
  Smile,
  Coffee
} from 'lucide-react';
import { STORY_BOOKS, StoryBook } from '../data/storyBooks';

interface StoryBooksLobbySectionProps {
  onNavigate: (view: string, extra?: any) => void;
  title?: string;
  subtitle?: string;
  maxDisplay?: number;
}

export const StoryBooksLobbySection: React.FC<StoryBooksLobbySectionProps> = ({
  onNavigate,
  title = "Story Books & Literature Corner 📖",
  subtitle = "Relax your mind between CBT practice sessions with gripping, culturally rich stories written for Nigerian students.",
  maxDisplay = 4
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');

  const genres = ['ALL', 'Sci-Fi', 'Mystery', 'Folklore', 'Campus Comedy', 'Historical STEM', 'Thriller'];

  const filteredStories = selectedGenre === 'ALL'
    ? STORY_BOOKS
    : STORY_BOOKS.filter(s => s.genre === selectedGenre);

  const displayStories = filteredStories.slice(0, maxDisplay);

  return (
    <section className="rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-indigo-950/50 border-2 border-amber-500/30 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden space-y-6">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>STUDY BREAK & VOCABULARY BUILDER</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>JAMB & WAEC Lexis Ready</span>
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        <button
          onClick={() => onNavigate('stories')}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-slate-950 font-black text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer shrink-0 font-['Outfit']"
        >
          <span>Open Full Library ({STORY_BOOKS.length} Stories)</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
        </button>
      </div>

      {/* Genre Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 relative z-10 scrollbar-none">
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedGenre === genre
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {genre === 'ALL' ? '🌟 All Stories' : genre}
          </button>
        ))}
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {displayStories.map(story => (
          <div
            key={story.id}
            onClick={() => onNavigate('stories', { storyId: story.id })}
            className="group rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-400/50 p-4 flex flex-col justify-between space-y-3 shadow-md hover:shadow-xl hover:shadow-amber-500/10 transition-all cursor-pointer relative overflow-hidden"
          >
            {/* Top gradient stripe */}
            <div className={`h-1.5 w-full rounded-full bg-gradient-to-r ${story.coverGradient}`} />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono font-bold">
                  {story.genre}
                </span>
                <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{story.readingTimeMinutes} min read</span>
                </span>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <span className="text-2xl p-1.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                  {story.icon}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-1 font-['Outfit']">
                    {story.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    By {story.author}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {story.synopsis}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-400 font-medium">
                {story.chapters.length} Chapters • Quiz Included
              </span>
              <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                <span>Read</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Student Encouragement Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs text-slate-300 relative z-10">
        <div className="flex items-center gap-2">
          <Coffee className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Reading stories improves reading speed, vocabulary recall, and comprehension accuracy on Use of English.
          </span>
        </div>
        <button
          onClick={() => onNavigate('stories')}
          className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Explore All 7 Stories</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
