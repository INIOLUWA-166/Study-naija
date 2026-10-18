import React, { useState, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  Sparkles, 
  FileCheck2, 
  Bookmark, 
  BookmarkCheck, 
  Filter, 
  CheckCircle2, 
  ArrowRight,
  Calculator,
  Atom,
  HelpCircle,
  GraduationCap,
  ChevronRight,
  TrendingUp,
  Zap
} from 'lucide-react';
import { TopicItem, Subject, User } from '../types';
import { SYLLABUS_TOPICS } from '../utils/syllabusTopics';

interface SearchPadViewProps {
  user: User | null;
  subjects: Subject[];
  onStartPractice: (subjectId: string, topic?: string) => void;
  onOpenAITutor: (topic: string, subjectName: string) => void;
  onNavigate: (view: string, extra?: any) => void;
}

export const SearchPadView: React.FC<SearchPadViewProps> = ({
  user,
  subjects,
  onStartPractice,
  onOpenAITutor,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [savedTopicIds, setSavedTopicIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('studynaija_saved_topics');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [selectedTopic, setSelectedTopic] = useState<TopicItem | null>(null);

  const toggleSaveTopic = (topicId: string) => {
    setSavedTopicIds(prev => {
      const updated = prev.includes(topicId) 
        ? prev.filter(id => id !== topicId) 
        : [...prev, topicId];
      try {
        localStorage.setItem('studynaija_saved_topics', JSON.stringify(updated));
      } catch {
        // Handled
      }
      return updated;
    });
  };

  // Filter topics based on search query, subject, and level
  const filteredTopics = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return SYLLABUS_TOPICS.filter(t => {
      // Subject filter
      if (selectedSubject !== 'ALL' && t.subjectId !== selectedSubject) {
        return false;
      }
      // Level filter
      if (selectedLevel !== 'ALL' && t.educationLevel !== selectedLevel) {
        return false;
      }
      // Text query match
      if (!q) return true;
      const inName = t.name.toLowerCase().includes(q);
      const inSubject = t.subjectName.toLowerCase().includes(q);
      const inDesc = t.description.toLowerCase().includes(q);
      const inConcepts = t.keyConcepts.some(c => c.toLowerCase().includes(q));
      const inFormulas = t.formulasOrRules.some(f => f.toLowerCase().includes(q));
      return inName || inSubject || inDesc || inConcepts || inFormulas;
    });
  }, [searchQuery, selectedSubject, selectedLevel]);

  // Distinct subjects present in syllabus
  const availableSubjectIds = Array.from(new Set(SYLLABUS_TOPICS.map(t => t.subjectId)));

  const quickPicks = [
    { label: 'Quadratic Equations', subject: 'mathematics', query: 'Quadratic' },
    { label: 'Concord & Agreement', subject: 'english', query: 'Concord' },
    { label: "Newton's Motion Laws", subject: 'physics', query: "Newton" },
    { label: 'Acids, Bases & Salts', subject: 'chemistry', query: 'Acid' },
    { label: 'Cell Organelles', subject: 'biology', query: 'Cell' },
    { label: 'Demand & Supply', subject: 'economics', query: 'Demand' },
    { label: '1922-1999 Constitutions', subject: 'government', query: 'Constitution' },
  ];

  return (
    <div id="topic-search-pad-view" className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Search className="w-3.5 h-3.5" />
            <span>National Exam Curriculum & Topic Search Pad</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-['Outfit'] tracking-tight">
            Find Any Topic in Any Subject Instantly 🔍
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Search across the full 2026/2027 JAMB UTME, WAEC SSCE, NECO, and University GST syllabuses. 
            Get core definitions, standard formulas, high-yield traps, and launch direct 10-question practice drills.
          </p>

          {/* Primary Search Input */}
          <div className="pt-2">
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                id="topic-search-input"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search any topic, formula, law, rule (e.g. 'Quadratic', 'Concord', 'Newton', 'Acid', 'Demand')..."
                className="w-full pl-12 pr-10 py-3.5 bg-white text-slate-900 rounded-2xl border-2 border-emerald-400/80 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 shadow-md text-sm sm:text-base outline-none transition-all placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Click Topic Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-slate-400 font-medium mr-1 text-[11px]">Trending topics:</span>
            {quickPicks.map((pick, idx) => (
              <button
                key={idx}
                onClick={() => setSearchQuery(pick.query)}
                className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-emerald-600 text-slate-300 hover:text-white text-[11px] font-medium transition-all border border-slate-700 cursor-pointer"
              >
                {pick.label}
              </button>
            ))}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-[-40px] top-[-40px] w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedSubject('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedSubject === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Subjects ({SYLLABUS_TOPICS.length})
          </button>

          {availableSubjectIds.map(subId => {
            const count = SYLLABUS_TOPICS.filter(t => t.subjectId === subId).length;
            const subObj = subjects.find(s => s.id === subId);
            const name = subObj?.name || subId;
            return (
              <button
                key={subId}
                onClick={() => setSelectedSubject(subId)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap capitalize cursor-pointer ${
                  selectedSubject === subId
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {name} ({count})
              </button>
            );
          })}
        </div>

        {/* Level Filter Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 font-medium">Level:</span>
          <select
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Levels</option>
            <option value="secondary">Secondary (JAMB/WAEC)</option>
            <option value="primary">Primary (Common Entrance)</option>
            <option value="university">University (GST Courses)</option>
          </select>
        </div>

      </div>

      {/* Main Results Layout: Grid of Topics with detail drawer or modal */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Found {filteredTopics.length} Curriculum Topics</span>
          </h2>
          {searchQuery && (
            <span className="text-xs text-slate-500">
              Filtering for: <strong className="text-slate-800">"{searchQuery}"</strong>
            </span>
          )}
        </div>

        {filteredTopics.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-800">No exact topic matches for "{searchQuery}"</h3>
              <p className="text-xs text-slate-500">
                You can ask Naija AI (our dedicated academic tutor) to explain any topic from any Nigerian curriculum!
              </p>
            </div>
            <button
              onClick={() => onOpenAITutor(searchQuery || 'Custom Topic', 'General Subject')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Tutor to Teach "{searchQuery}" →</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTopics.map(topic => {
              const isSaved = savedTopicIds.includes(topic.id);
              return (
                <div
                  key={topic.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Header Pill & Bookmark */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          {topic.subjectName}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {topic.examType}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleSaveTopic(topic.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isSaved 
                            ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' 
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                        title={isSaved ? 'Topic Saved' : 'Save Topic to My Review'}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Topic Title */}
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-800 transition-colors font-['Outfit']">
                      {topic.name}
                    </h3>

                    {/* Synopsis Description */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {topic.description}
                    </p>

                    {/* Key formulas or rules box */}
                    {topic.formulasOrRules && topic.formulasOrRules.length > 0 && (
                      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Golden Formula / Rule:
                        </span>
                        <div className="text-xs font-mono font-semibold text-slate-800 truncate">
                          {topic.formulasOrRules[0]}
                        </div>
                      </div>
                    )}

                    {/* Key concepts chips */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Core Concepts:
                      </span>
                      <ul className="text-[11px] text-slate-600 space-y-0.5">
                        {topic.keyConcepts.slice(0, 2).map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold">•</span>
                            <span className="truncate">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => onStartPractice(topic.subjectId, topic.name)}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Practice ({topic.questionCount})</span>
                    </button>

                    <button
                      onClick={() => onOpenAITutor(topic.name, topic.subjectName)}
                      className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                      title="Ask AI Tutor to explain this topic step-by-step"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Ask AI</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Naija AI Assistant Callout */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border border-emerald-500/20 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
              Can’t find a very specific question or sub-topic?
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Launch **Naija AI** anytime. Ask for step-by-step math proofs, English lexis explanations, or memory mnemonics!
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenAITutor('General Curriculum', 'General Subject')}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Launch AI Tutor Now</span>
        </button>
      </div>

    </div>
  );
};
