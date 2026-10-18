import React, { useState, useEffect } from 'react';
import { 
  BookMarked, 
  Clock, 
  User as UserIcon, 
  Tag, 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { Article, User } from '../types';
import { api } from '../services/api';
import { AdBanner } from './AdBanner';

interface StudyTipsViewProps {
  user: User | null;
  initialSlug?: string;
  onNavigate: (view: string, extra?: any) => void;
}

export const StudyTipsView: React.FC<StudyTipsViewProps> = ({
  user,
  initialSlug,
  onNavigate
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const data = await api.getArticles();
        setArticles(data);
        if (initialSlug) {
          const match = data.find(a => a.slug === initialSlug || a.id === initialSlug);
          if (match) setSelectedArticle(match);
        }
      } catch {
        // Handled
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [initialSlug]);

  const categories = ['ALL', 'JAMB', 'WAEC', 'Time Management', 'General'];

  const filteredArticles = activeCategory === 'ALL'
    ? articles
    : articles.filter(a => a.category === activeCategory);

  if (selectedArticle) {
    return (
      <div id="study-tip-detail" className="max-w-3xl mx-auto space-y-6 pb-16">
        
        {/* Back Button */}
        <button
          onClick={() => setSelectedArticle(null)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Study Tips</span>
        </button>

        {/* Article Container */}
        <article className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
          
          <div className="space-y-3 pb-6 border-b border-slate-100">
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
              {selectedArticle.category}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 font-['Outfit'] leading-tight">
              {selectedArticle.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5" />
                <span>{selectedArticle.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{selectedArticle.readTime}</span>
              </div>
              <div>{selectedArticle.date}</div>
            </div>
          </div>

          {/* In-Article Proper Ad Space (Requirement 8) */}
          <AdBanner placement="article" user={user} />

          {/* Article Markdown Content formatted */}
          <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4">
            {selectedArticle.content.split('\n\n').map((paragraph, idx) => {
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit'] pt-4">
                    {paragraph.replace('### ', '')}
                  </h3>
                );
              }
              if (paragraph.startsWith('#### ')) {
                return (
                  <h4 key={idx} className="text-base font-bold text-slate-800 pt-2">
                    {paragraph.replace('#### ', '')}
                  </h4>
                );
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <ul key={idx} className="list-disc pl-5 space-y-1.5 text-slate-700 text-sm">
                    {paragraph.split('\n').map((line, lIdx) => (
                      <li key={lIdx}>{line.replace('- ', '')}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={idx} className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1">Tags:</span>
            {selectedArticle.tags.map((tag, tIdx) => (
              <span key={tIdx} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium">
                #{tag}
              </span>
            ))}
          </div>

        </article>

        {/* Next practice suggestion */}
        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-emerald-950">Ready to put these techniques to the test?</h4>
            <p className="text-xs text-emerald-800 mt-0.5">Practice with official past questions to calibrate your timing.</p>
          </div>
          <button
            onClick={() => onNavigate('practice')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0"
          >
            Start Practice Session
          </button>
        </div>

      </div>
    );
  }

  return (
    <div id="study-tips-list-view" className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
            <BookMarked className="w-4 h-4" />
            <span>Academic Strategies & Syllabus Guides</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
            Study Tips & Examiner Insights
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Proven study techniques, time management frameworks, and WAEC/JAMB examiner grading secrets.
          </p>
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeCategory === cat
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'ALL' ? 'All Articles' : cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map(art => (
          <div
            key={art.id}
            onClick={() => setSelectedArticle(art)}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded">
                  {art.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {art.readTime}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                {art.title}
              </h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                {art.excerpt}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">{art.author}</span>
              <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Read Article →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Between content sections proper ad space (Requirement 8) */}
      <AdBanner placement="in-feed" user={user} />

    </div>
  );
};
