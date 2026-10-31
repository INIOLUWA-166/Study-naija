import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Search,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Newspaper,
  BookOpen,
  ArrowRight,
  TrendingUp,
  X,
  Share2,
  Info
} from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';
import { aiVoice } from '../utils/aiVoice';
import confetti from 'canvas-confetti';

interface NewsFactCheckerAgentViewProps {
  user?: User | null;
  onNavigate?: (view: string, extra?: any) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const NewsFactCheckerAgentView: React.FC<NewsFactCheckerAgentViewProps> = ({
  user,
  onNavigate,
  onClose,
  isModal = false
}) => {
  const [activeMode, setActiveMode] = useState<'news' | 'factcheck' | 'current_events' | 'exam_updates'>('news');
  const [queryInput, setQueryInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Response state
  const [agentAnswer, setAgentAnswer] = useState<string | null>(null);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [citations, setCitations] = useState<Array<{ title: string; url: string; snippet?: string }>>([]);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [responseTimestamp, setResponseTimestamp] = useState<string | null>(null);

  // Audio speech
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Trending topics
  const [trendingTopics, setTrendingTopics] = useState<Array<{
    id: string;
    category: string;
    title: string;
    query: string;
    badge: string;
  }>>([]);

  const responseContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getTrendingNewsTopics()
      .then(res => {
        if (res && res.trendingTopics) {
          setTrendingTopics(res.trendingTopics);
        }
      })
      .catch(() => {});
  }, []);

  const handleQueryAgent = async (targetQuery?: string, targetMode?: 'news' | 'factcheck' | 'current_events' | 'exam_updates') => {
    const finalQuery = targetQuery || queryInput;
    const finalMode = targetMode || activeMode;

    if (!finalQuery.trim()) {
      setErrorMessage('Please enter a current event, news topic, or rumor to fact check.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setAgentAnswer(null);
    setSearchQueries([]);
    setCitations([]);
    setLastQuery(finalQuery);

    try {
      const res = await api.queryNewsAgent(finalQuery.trim(), finalMode);
      if (res.success && res.answer) {
        setAgentAnswer(res.answer);
        setSearchQueries(res.searchQueries || []);
        setCitations(res.citations || []);
        setResponseTimestamp(res.timestamp ? new Date(res.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString());

        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

        setTimeout(() => {
          responseContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } else {
        setErrorMessage(res.error || 'Failed to query real-time Google Search news results.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while connecting to real-time Google Search data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeech = () => {
    if (!agentAnswer) return;

    if (isSpeaking) {
      aiVoice.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      // Clean markdown tags for clear speech
      const cleanText = agentAnswer
        .replace(/[*#_`~]/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .slice(0, 1000);

      aiVoice.speak(cleanText, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleCopyReport = () => {
    if (!agentAnswer) return;
    const fullReport = `SabiNews Sentinel Report [${responseTimestamp || ''}]
Topic: ${lastQuery}

${agentAnswer}

Grounded Google Sources:
${citations.map(c => `- ${c.title}: ${c.url}`).join('\n')}
`;
    navigator.clipboard.writeText(fullReport);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className={`w-full max-w-6xl mx-auto ${isModal ? 'p-4 sm:p-6' : 'p-4 sm:p-8'} space-y-6 animate-in fade-in duration-300`}>
      
      {/* ========================================================================= */}
      {/* HERO BANNER */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 border border-cyan-500/40 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Globe className="w-3.5 h-3.5" />
                <span>LIVE GOOGLE SEARCH AGENT</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Grounded Citations</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                JAMB / WAEC / NECO News
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-['Outfit'] text-white tracking-tight">
              Real-Time News & <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Live Fact-Checker</span>
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Connected directly to <strong>live Google Search results</strong>. Discuss current events, 
              stay updated on <strong>JAMB registration dates, admission lists, WAEC/NECO timetables</strong>, and instantly fact-check rumors with verified sources.
            </p>
          </div>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer self-start md:self-auto"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AGENT MODE SELECTOR & INPUT CONSOLE */}
      {/* ========================================================================= */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-xl space-y-6">
        
        {/* Mode Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <span>Select Agent Specialty Mode:</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'news', label: '📰 Breaking News', desc: 'Current events & news reports' },
              { id: 'factcheck', label: '🔍 Fact-Check Rumors', desc: 'Verify claims & admission lists' },
              { id: 'exam_updates', label: '⚡ JAMB / WAEC / NECO', desc: 'Official exam dates & cut-offs' },
              { id: 'current_events', label: '🇳🇬 Current Affairs', desc: 'Nigeria & global developments' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setActiveMode(m.id as any)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  activeMode === m.id
                    ? 'bg-gradient-to-br from-cyan-950 to-slate-900 border-cyan-400 shadow-md shadow-cyan-950/50'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="font-bold text-xs text-white">{m.label}</div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200">
              Ask or Fact-Check Anything with Live Google Search Data:
            </label>
            <span className="text-[11px] text-cyan-400 font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Real-Time Google Grounding Active</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQueryAgent()}
                placeholder="e.g. Has JAMB released the 2026 registration form? Or fact-check a rumor..."
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium shadow-inner"
              />
            </div>

            <button
              onClick={() => handleQueryAgent()}
              disabled={isLoading || !queryInput.trim()}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl transition shadow-lg disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Searching Google...</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Search & Verify →</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Trending News Chips */}
        {trendingTopics.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Trending Search Topics (Click to Query):</span>
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {trendingTopics.map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setQueryInput(t.query);
                    handleQueryAgent(t.query, 'exam_updates');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 text-xs text-slate-200 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0"
                >
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 font-bold">
                    {t.badge}
                  </span>
                  <span>{t.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* AGENT RESPONSE & CITATIONS CONSOLE */}
      {/* ========================================================================= */}
      {agentAnswer && (
        <div ref={responseContainerRef} className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-300">
          
          {/* Response Header Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Grounded Fact-Check</span>
                </span>
                {responseTimestamp && (
                  <span className="text-xs text-slate-400 font-mono">
                    Retrieved at {responseTimestamp}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1">
                Topic: {lastQuery}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Read Aloud */}
              <button
                onClick={handleToggleSpeech}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isSpeaking ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
              </button>

              {/* Copy Report */}
              <button
                onClick={handleCopyReport}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Google Search Queries Executed */}
          {searchQueries.length > 0 && (
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <Search className="w-3 h-3 text-cyan-400" />
                <span>Google Search Queries Executed:</span>
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {searchQueries.map((q, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                    "{q}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Agent Answer Body */}
          <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans space-y-3">
            {agentAnswer}
          </div>

          {/* Citation Cards */}
          {citations.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Verified Web Citations & Direct Sources ({citations.length}):</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {citations.map((c, i) => {
                  let domain = 'Web Source';
                  try {
                    domain = new URL(c.url).hostname.replace('www.', '');
                  } catch {}

                  return (
                    <a
                      key={i}
                      href={c.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-800/40 transition flex items-start justify-between gap-3 group cursor-pointer"
                    >
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 font-bold inline-block">
                          {domain}
                        </span>
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition line-clamp-2">
                          {c.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono block truncate">
                          {c.url}
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 mt-1 transition" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Information fact-checked in real-time via Google Search grounding.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate && onNavigate('practice')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                Practice Questions on this Topic →
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
