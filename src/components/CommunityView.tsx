import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  ShieldAlert, 
  Heart, 
  Sparkles, 
  Pin, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  CornerDownRight, 
  BookOpen, 
  School, 
  Bot, 
  ThumbsUp, 
  HelpCircle,
  Hash,
  X,
  Plus
} from 'lucide-react';
import { User, CommunityMessage, CommunityChannel, ModerationResult } from '../types';
import { api } from '../services/api';

interface CommunityViewProps {
  user: User | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onNavigate: (view: string, extra?: any) => void;
}

const CHANNELS: { id: CommunityChannel; name: string; tag: string; description: string; icon: string }[] = [
  { 
    id: 'general', 
    name: 'General Lounge', 
    tag: '#general-lounge', 
    description: 'Student gist, study motivation, exam schedules & peer encouragement.',
    icon: '🇳🇬'
  },
  { 
    id: 'jamb', 
    name: 'JAMB UTME 2027', 
    tag: '#jamb-utme-2027', 
    description: 'Subject combinations, CBT test centers, 300+ target strategies & cut-off discussions.',
    icon: '🎯'
  },
  { 
    id: 'waec', 
    name: 'WAEC SSCE Prep', 
    tag: '#waec-ssce-prep', 
    description: 'Theory questions, Chemistry/Physics practicals, Literature analysis & past papers.',
    icon: '📚'
  },
  { 
    id: 'admissions', 
    name: 'University Admissions', 
    tag: '#university-admissions', 
    description: 'UNILAG, UI, OAU, UNN, ABU, Post-UTME screening formulas & merit lists.',
    icon: '🏛️'
  },
  { 
    id: 'study-qna', 
    name: 'Study Q&A & Solutions', 
    tag: '#study-qna', 
    description: 'Challenging questions in Maths, Physics, Chemistry, Government & Biology.',
    icon: '💡'
  }
];

export const CommunityView: React.FC<CommunityViewProps> = ({
  user,
  onOpenAuth,
  onNavigate
}) => {
  const [activeChannel, setActiveChannel] = useState<CommunityChannel>('general');
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [inputText, setInputText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [replyingTo, setReplyingTo] = useState<CommunityMessage | null>(null);
  
  // AI Moderation Rejection Modal / Alert
  const [moderationAlert, setModerationAlert] = useState<{
    reason: string;
    violationType?: string;
    cleanAdvice?: string;
    educationalFeedback?: string;
  } | null>(null);

  // AI Tutor Explain Loading State
  const [explainingMessageId, setExplainingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadMessages = async (channel: CommunityChannel, search?: string) => {
    try {
      setLoading(true);
      const data = await api.getCommunityMessages(channel, search);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load community messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages(activeChannel, searchQuery);
    // Polling interval for live student discussion
    const interval = setInterval(() => {
      loadMessages(activeChannel, searchQuery);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeChannel, searchQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend) return;

    setSubmitting(true);
    setModerationAlert(null);

    try {
      const authorName = user?.name || (user?.email ? user.email.split('@')[0] : 'Nigerian Scholar');
      const authorEmail = user?.email;

      await api.postCommunityMessage({
        channelId: activeChannel,
        content: textToSend,
        replyToId: replyingTo?.id,
        replyToSnippet: replyingTo ? replyingTo.content.slice(0, 80) : undefined,
        authorName,
        authorEmail,
        userTournamentBadge: user?.tournamentBadge,
        userThemeVariant: user?.themeVariant
      });

      setInputText('');
      setReplyingTo(null);
      // Reload immediately
      await loadMessages(activeChannel, searchQuery);
    } catch (err: any) {
      // Caught by SabiGuard AI Moderator
      if (err.moderation) {
        setModerationAlert({
          reason: err.moderation.reason || err.message,
          violationType: err.moderation.violationType,
          cleanAdvice: err.moderation.cleanAdvice,
          educationalFeedback: err.moderation.educationalFeedback
        });
      } else {
        alert(err.message || 'Failed to post message.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (msgId: string) => {
    try {
      const res = await api.likeCommunityMessage(msgId, user?.id);
      setMessages(prev => prev.map(m => {
        if (m.id === msgId) {
          return { ...m, likes: res.likes };
        }
        return m;
      }));
    } catch (err) {
      console.error('Failed to like message:', err);
    }
  };

  const handleAskAiToExplain = async (msg: CommunityMessage) => {
    try {
      setExplainingMessageId(msg.id);
      await api.requestCommunityAiExplanation(msg.content, msg.id, msg.channelId);
      await loadMessages(activeChannel, searchQuery);
    } catch (err) {
      alert('SabiGuard AI explanation temporarily unavailable.');
    } finally {
      setExplainingMessageId(null);
    }
  };

  const currentChannelInfo = CHANNELS.find(c => c.id === activeChannel) || CHANNELS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner with AI Moderator Badge */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Users className="w-3.5 h-3.5" />
            <span>StudyNaija Student Discussion Hub</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight text-white">
            Nigeria&apos;s Academic Community Square
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Chat, exchange study questions, compare Post-UTME cutoffs, and prepare together for JAMB & WAEC with fellow secondary and tertiary aspirants nationwide.
          </p>
        </div>

        {/* Real-time SabiGuard AI Moderator Status Shield */}
        <div className="w-full md:w-80 rounded-2xl bg-slate-900/90 border border-emerald-500/40 p-4 space-y-2 text-xs backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SabiGuard AI Moderator</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
              Active 24/7
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Profanity, cyberbullying, and illegal exam &ldquo;expo&rdquo;/leak scams are filtered and blocked automatically in real time to ensure a safe learning space.
          </p>
        </div>
      </div>

      {/* Main Grid: Channels Sidebar + Chat Room Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: Channels & Guidelines */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Channels Navigation */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-2 shadow-lg">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider px-2 block">
              Study Rooms & Channels
            </span>

            <div className="space-y-1">
              {CHANNELS.map(ch => {
                const isActive = ch.id === activeChannel;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setActiveChannel(ch.id);
                      setReplyingTo(null);
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white font-bold shadow-md'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <span className="text-lg shrink-0 mt-0.5">{ch.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold truncate">{ch.name}</span>
                        {isActive && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                      </div>
                      <span className={`text-[10px] block truncate ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {ch.tag}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Moderator Safety Rulebook Card */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>SabiGuard Safety Rules</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc list-inside">
              <li>Strictly NO exam malpractice (&ldquo;runs&rdquo;, &ldquo;expo&rdquo;, leaks).</li>
              <li>Zero tolerance for profanity, insults, or harassment.</li>
              <li>No contact spam or phone number solicitations.</li>
              <li>Encourage fellow candidates with verified study tips.</li>
            </ul>
          </div>

          {/* Quick AI Test Triggers */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-4 space-y-2 text-xs">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
              Test AI Moderator Live
            </span>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleSendMessage('Can someone message me on WhatsApp for JAMB runs and leaked answers?')}
                className="w-full text-left px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/40 text-[11px] text-rose-300 font-semibold transition"
              >
                🚫 Test Malpractice Filter (&ldquo;Runs/Expo&rdquo;)
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Shut up you senseless idiot!')}
                className="w-full text-left px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/40 text-[11px] text-rose-300 font-semibold transition"
              >
                🚫 Test Profanity Filter
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('What is the formula for calculating mechanical advantage in Physics?')}
                className="w-full text-left px-3 py-2 rounded-xl bg-slate-800 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-500/40 text-[11px] text-emerald-300 font-semibold transition"
              >
                ✅ Test Clean Study Question
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Chat Room Stream & Message Input */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Channel Header & Search */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentChannelInfo.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-white font-['Outfit']">
                    {currentChannelInfo.name}
                  </h2>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {currentChannelInfo.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentChannelInfo.description}
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search discussions..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* AI MODERATION BLOCK ALERT BANNER (If user attempted bad content) */}
          {moderationAlert && (
            <div className="p-5 rounded-3xl bg-rose-950/60 border-2 border-rose-500/80 text-white space-y-3 animate-fade-in shadow-xl relative">
              <button
                onClick={() => setModerationAlert(null)}
                className="absolute top-4 right-4 text-rose-300 hover:text-white text-sm"
              >
                ✕
              </button>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-2xl bg-rose-500 text-slate-950 shrink-0 font-bold">
                  <ShieldAlert className="w-6 h-6 text-slate-950" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-black tracking-wider text-rose-400 block">
                    MESSAGE BLOCKED BY SABIGUARD AI MODERATOR
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {moderationAlert.reason}
                  </h3>
                  {moderationAlert.cleanAdvice && (
                    <p className="text-xs text-rose-200/90 leading-relaxed">
                      💡 <strong>Advice:</strong> {moderationAlert.cleanAdvice}
                    </p>
                  )}
                  {moderationAlert.educationalFeedback && (
                    <p className="text-[11px] text-rose-300/80 pt-1">
                      {moderationAlert.educationalFeedback}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Messages Stream Container */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6 min-h-[460px] max-h-[560px] overflow-y-auto space-y-4">
            
            {loading && messages.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-3 text-slate-400">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Loading {currentChannelInfo.name} conversations...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-2 text-center text-slate-400">
                <MessageSquare className="w-10 h-10 text-slate-600" />
                <p className="text-sm font-bold text-slate-300">No messages in this study room yet.</p>
                <p className="text-xs max-w-sm">Be the first Nigerian scholar to start the discussion in {currentChannelInfo.tag}!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isAi = msg.isAiAssistant;
                const isMine = user?.id && msg.userId === user.id;

                return (
                  <div
                    key={msg.id}
                    className={`rounded-2xl p-4 transition-all space-y-2.5 ${
                      isAi
                        ? 'bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                        : msg.isAiPinned
                          ? 'bg-slate-800/90 border border-amber-500/40'
                          : 'bg-slate-800/60 border border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-md ${
                          isAi 
                            ? 'bg-emerald-500 text-slate-950'
                            : msg.userTournamentBadge === '1st' || msg.userThemeVariant === 'gold'
                            ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 font-black border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                            : msg.userTournamentBadge === '2nd' || msg.userThemeVariant === 'diamond'
                            ? 'bg-gradient-to-br from-cyan-400 to-teal-500 text-slate-950 font-black border border-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                            : msg.userTournamentBadge === '3rd' || msg.userThemeVariant === 'platinum'
                            ? 'bg-gradient-to-br from-slate-200 to-zinc-400 text-slate-950 font-black border border-slate-100 shadow-[0_0_10px_rgba(203,213,225,0.4)]'
                            : 'bg-slate-700 text-white'
                        }`}>
                          {isAi ? <Bot className="w-5 h-5 text-slate-950" /> : msg.userName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold ${
                              msg.userTournamentBadge === '1st' || msg.userThemeVariant === 'gold'
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-extrabold drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]'
                                : msg.userTournamentBadge === '2nd' || msg.userThemeVariant === 'diamond'
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-teal-300 font-extrabold drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]'
                                : msg.userTournamentBadge === '3rd' || msg.userThemeVariant === 'platinum'
                                ? 'text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-zinc-100 to-slate-300 font-extrabold drop-shadow-[0_0_6px_rgba(203,213,225,0.3)]'
                                : 'text-white'
                            }`}>
                              {msg.userName}
                            </span>
                            
                            {/* Champions League Tournament Winner Badges */}
                            {msg.userTournamentBadge === '1st' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-600/25 text-amber-300 border border-amber-400/60 text-[9px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.4)] animate-pulse">
                                🥇 1st Place Champion
                              </span>
                            )}
                            {msg.userTournamentBadge === '2nd' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/25 via-sky-500/20 to-teal-500/25 text-cyan-300 border border-cyan-400/60 text-[9px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                                💎 2nd Place Runner-Up
                              </span>
                            )}
                            {msg.userTournamentBadge === '3rd' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-slate-400/25 via-zinc-400/20 to-slate-300/25 text-slate-200 border border-slate-300/60 text-[9px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(203,213,225,0.3)]">
                                🥉 3rd Place Bronze
                              </span>
                            )}

                            {isAi && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                                Official AI Coach
                              </span>
                            )}
                            {msg.isAiPinned && !isAi && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold flex items-center gap-1">
                                <Pin className="w-2.5 h-2.5" />
                                <span>Pinned</span>
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            {msg.targetExam && <span>{msg.targetExam} Scholar</span>}
                            {msg.targetCourse && <span>• {msg.targetCourse}</span>}
                            <span>• {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* AI Verified Badge */}
                      <span className="text-[10px] text-emerald-400/80 font-mono hidden sm:flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>SabiGuard Verified</span>
                      </span>
                    </div>

                    {/* Replied snippet context */}
                    {msg.replyToSnippet && (
                      <div className="ml-11 px-3 py-1.5 rounded-xl bg-slate-900/80 border-l-2 border-emerald-500 text-[11px] text-slate-400 italic">
                        &ldquo;{msg.replyToSnippet}&rdquo;
                      </div>
                    )}

                    {/* Content */}
                    <div className="ml-11 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                      {msg.content}
                    </div>

                    {/* Tags */}
                    {msg.tags && msg.tags.length > 0 && (
                      <div className="ml-11 flex flex-wrap gap-1.5 pt-1">
                        {msg.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-slate-900/60 text-slate-400 text-[10px] font-mono">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Message Actions */}
                    <div className="ml-11 pt-2 border-t border-slate-700/40 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleLike(msg.id)}
                          className="flex items-center gap-1.5 hover:text-emerald-400 transition cursor-pointer"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="font-bold">{msg.likes || 0}</span>
                        </button>

                        <button
                          onClick={() => {
                            setReplyingTo(msg);
                            setInputText(`@${msg.userName} `);
                          }}
                          className="flex items-center gap-1.5 hover:text-white transition cursor-pointer"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </button>
                      </div>

                      {/* Ask SabiGuard AI button for tricky study questions */}
                      {!isAi && (
                        <button
                          onClick={() => handleAskAiToExplain(msg)}
                          disabled={explainingMessageId === msg.id}
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>{explainingMessageId === msg.id ? 'Generating Explanation...' : 'Ask AI to Explain'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Replying banner */}
          {replyingTo && (
            <div className="p-2.5 px-4 rounded-2xl bg-slate-800 text-xs text-slate-300 flex items-center justify-between border border-slate-700">
              <span className="truncate">
                Replying to <strong>{replyingTo.userName}</strong>: &ldquo;{replyingTo.content.slice(0, 50)}...&rdquo;
              </span>
              <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-white text-sm font-bold">
                ✕
              </button>
            </div>
          )}

          {/* Message Input Box */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-emerald-400 font-bold">{currentChannelInfo.tag}</span>
              <span>•</span>
              <span className="text-[11px]">Protected by SabiGuard AI Real-Time Anti-Cheat & Respect Filter</span>
            </div>

            <div className="flex gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
                placeholder={`Post a study question, academic tip, or discussion in ${currentChannelInfo.name}...`}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={submitting || !inputText.trim()}
                className="px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg transition-all flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4 h-4 text-slate-950" />
                <span className="text-[10px] uppercase tracking-wider">{submitting ? 'Checking...' : 'Send'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Press <strong>Enter</strong> to post. Shift + Enter for new line.</span>
              <span className="flex items-center gap-1 text-emerald-400/80">
                <CheckCircle2 className="w-3 h-3" />
                <span>AI Moderated Safe Environment</span>
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
