import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageSquare, 
  MessageCircle,
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
  Plus,
  Scale,
  Lock,
  Unlock,
  Trash2,
  Eye,
  Check,
  Share2,
  Filter,
  ArrowLeft,
  Tag,
  GraduationCap,
  Award,
  AlertCircle,
  Shield
} from 'lucide-react';
import { 
  User, 
  CommunityMessage, 
  CommunityChannel, 
  ModerationResult, 
  ForumThread, 
  ForumReply, 
  ForumExamCategory 
} from '../types';
import { api } from '../services/api';

interface CommunityViewProps {
  user: User | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onNavigate: (view: string, extra?: any) => void;
  onOpenHonorCode?: () => void;
}

const FORUM_SUBJECTS = [
  { id: 'all', name: 'All Subjects' },
  { id: 'english', name: 'English Language' },
  { id: 'mathematics', name: 'Mathematics' },
  { id: 'physics', name: 'Physics' },
  { id: 'chemistry', name: 'Chemistry' },
  { id: 'biology', name: 'Biology' },
  { id: 'economics', name: 'Economics' },
  { id: 'government', name: 'Government' },
  { id: 'literature', name: 'Literature in English' },
  { id: 'commerce', name: 'Commerce' },
  { id: 'civic', name: 'Civic Education' },
  { id: 'agric', name: 'Agricultural Science' }
];

const EXAM_CATEGORIES: { id: ForumExamCategory | 'ALL'; label: string; badgeColor: string; description: string }[] = [
  { id: 'ALL', label: 'All Discussions', badgeColor: 'bg-slate-800 text-slate-300 border-slate-700', description: 'Browse all exam questions and study topics' },
  { id: 'JAMB', label: 'JAMB UTME', badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', description: 'UTME subject combinations, syllabus breakdown, cut-off marks & CBT drills' },
  { id: 'WAEC', label: 'WAEC SSCE', badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40', description: 'WASSCE Theory, practical questions, essay writing & marking guide' },
  { id: 'NECO', label: 'NECO SSCE', badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40', description: 'NECO June/July & Nov/Dec past questions and solutions' },
  { id: 'POST_UTME', label: 'Post-UTME', badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40', description: 'University screenings (UNILAG, UI, OAU, UNN, ABU) & departmental cut-offs' },
  { id: 'GENERAL', label: 'Campus & Gist', badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/40', description: 'Study schedules, memory tricks, scholarships & student lifestyle' }
];

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
  onNavigate,
  onOpenHonorCode
}) => {
  // Navigation Tabs: 'forum' (default) vs 'chat' (live channels)
  const [activeTab, setActiveTab] = useState<'forum' | 'chat'>('forum');

  // Admin Check: checks role or hardcoded admin email
  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'luvkidjaja@gmail.com';

  // =========================================================================
  // FORUM DISCUSSIONS STATE
  // =========================================================================
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [totalThreads, setTotalThreads] = useState<number>(0);
  const [loadingThreads, setLoadingThreads] = useState<boolean>(true);
  const [selectedExamCategory, setSelectedExamCategory] = useState<ForumExamCategory | 'ALL'>('ALL');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [forumSort, setForumSort] = useState<'latest' | 'popular' | 'unanswered' | 'solved'>('latest');
  const [forumSearch, setForumSearch] = useState<string>('');
  
  // Selected Thread Detail View
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null);
  const [loadingThreadDetail, setLoadingThreadDetail] = useState<boolean>(false);
  const [replyInputText, setReplyInputText] = useState<string>('');
  const [submittingReply, setSubmittingReply] = useState<boolean>(false);

  // Create Post Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newExamCategory, setNewExamCategory] = useState<ForumExamCategory>('JAMB');
  const [newSubjectId, setNewSubjectId] = useState<string>('mathematics');
  const [newTags, setNewTags] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [submittingNewThread, setSubmittingNewThread] = useState<boolean>(false);

  // Moderation note modal
  const [moderationActionModal, setModerationActionModal] = useState<{
    threadId: string;
    action: 'pin' | 'lock' | 'delete' | 'flag' | 'unflag';
    currentVal?: boolean;
  } | null>(null);
  const [moderationNote, setModerationNote] = useState<string>('');

  // SabiGuard AI Moderation Alert Modal
  const [moderationAlert, setModerationAlert] = useState<{
    reason: string;
    violationType?: string;
    cleanAdvice?: string;
    educationalFeedback?: string;
  } | null>(null);

  // =========================================================================
  // LIVE CHAT ROOMS STATE (Preserved)
  // =========================================================================
  const [activeChannel, setActiveChannel] = useState<CommunityChannel>('general');
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [chatInputText, setChatInputText] = useState<string>('');
  const [chatSearchQuery, setChatSearchQuery] = useState<string>('');
  const [submittingChatMessage, setSubmittingChatMessage] = useState<boolean>(false);
  const [replyingToMessage, setReplyingToMessage] = useState<CommunityMessage | null>(null);
  const [explainingMessageId, setExplainingMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const isInitialChatLoadRef = useRef<boolean>(true);

  // =========================================================================
  // LOAD FORUM THREADS
  // =========================================================================
  const loadThreads = async () => {
    try {
      setLoadingThreads(true);
      const res = await api.getForumThreads({
        examCategory: selectedExamCategory === 'ALL' ? undefined : selectedExamCategory,
        subjectId: selectedSubjectId === 'all' ? undefined : selectedSubjectId,
        search: forumSearch.trim() || undefined,
        sort: forumSort
      });
      setThreads(res.threads || []);
      setTotalThreads(res.total || 0);
    } catch (err) {
      console.error('Failed to load forum threads:', err);
    } finally {
      setLoadingThreads(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'forum' && !selectedThread) {
      loadThreads();
    }
  }, [activeTab, selectedExamCategory, selectedSubjectId, forumSort, forumSearch, selectedThread]);

  // Load single thread detail
  const handleOpenThread = async (threadId: string) => {
    try {
      setLoadingThreadDetail(true);
      const res = await api.getForumThread(threadId);
      setSelectedThread(res.thread);
      setReplyInputText('');
    } catch (err: any) {
      alert(err.message || 'Failed to load discussion details');
    } finally {
      setLoadingThreadDetail(false);
    }
  };

  // Upvote / Like Thread
  const handleLikeThread = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    try {
      const res = await api.likeForumThread(threadId, user?.id);
      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, likes: res.likes } : t));
      if (selectedThread && selectedThread.id === threadId) {
        setSelectedThread(prev => prev ? { ...prev, likes: res.likes } : null);
      }
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  // Upvote / Like Reply
  const handleLikeReply = async (replyId: string) => {
    if (!selectedThread) return;
    try {
      const res = await api.likeForumReply(selectedThread.id, replyId, user?.id);
      setSelectedThread(prev => {
        if (!prev) return null;
        return {
          ...prev,
          replies: (prev.replies || []).map(r => r.id === replyId ? { ...r, likes: res.likes } : r)
        };
      });
    } catch (err) {
      console.error('Reply like failed:', err);
    }
  };

  // Submit New Discussion Thread
  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Please provide both a title and details for your discussion');
      return;
    }

    setSubmittingNewThread(true);
    try {
      const subjectObj = FORUM_SUBJECTS.find(s => s.id === newSubjectId);
      const parsedTags = newTags
        .split(',')
        .map(t => t.trim().replace(/^#/, ''))
        .filter(t => t.length > 0);

      const res = await api.createForumThread({
        title: newTitle.trim(),
        content: newContent.trim(),
        examCategory: newExamCategory,
        subjectId: newSubjectId !== 'all' ? newSubjectId : undefined,
        subjectName: subjectObj && subjectObj.id !== 'all' ? subjectObj.name : undefined,
        tags: parsedTags,
        authorName: user?.name || 'StudyNaija Scholar',
        authorEmail: user?.email,
        userTournamentBadge: (user as any)?.tournamentBadge || null,
        userThemeVariant: (user as any)?.themeVariant || 'default'
      });

      setShowCreateModal(false);
      setNewTitle('');
      setNewContent('');
      setNewTags('');
      // Open the freshly created thread immediately
      if (res.thread) {
        setSelectedThread(res.thread);
      } else {
        loadThreads();
      }
    } catch (err: any) {
      if (err.moderation || err.blocked) {
        setModerationAlert({
          reason: err.moderation?.reason || err.message,
          violationType: err.moderation?.violationType || 'MALPRACTICE_OR_PROFANITY',
          cleanAdvice: err.moderation?.cleanAdvice,
          educationalFeedback: err.moderation?.educationalFeedback
        });
      } else {
        alert(err.message || 'Failed to post discussion. Please review your content.');
      }
    } finally {
      setSubmittingNewThread(false);
    }
  };

  // Submit Reply to Selected Thread
  const handlePostReply = async () => {
    if (!selectedThread) return;
    if (!replyInputText.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await api.postForumReply(selectedThread.id, {
        content: replyInputText.trim(),
        authorName: user?.name || 'StudyNaija Scholar',
        authorEmail: user?.email,
        userTournamentBadge: (user as any)?.tournamentBadge || null,
        userThemeVariant: (user as any)?.themeVariant || 'default'
      });

      setSelectedThread(res.thread);
      setReplyInputText('');
      // Also update thread in list
      setThreads(prev => prev.map(t => t.id === res.thread.id ? res.thread : t));
    } catch (err: any) {
      if (err.moderation || err.blocked) {
        setModerationAlert({
          reason: err.moderation?.reason || err.message,
          violationType: err.moderation?.violationType || 'POLICY_VIOLATION',
          cleanAdvice: err.moderation?.cleanAdvice,
          educationalFeedback: err.moderation?.educationalFeedback
        });
      } else {
        alert(err.message || 'Could not post reply. Please try again.');
      }
    } finally {
      setSubmittingReply(false);
    }
  };

  // Mark Reply as Solved / Best Answer
  const handleToggleSolve = async (replyId: string) => {
    if (!selectedThread) return;
    const isCurrentlySolved = selectedThread.isSolved && selectedThread.solvedReplyId === replyId;
    try {
      const res = await api.markForumThreadSolved(selectedThread.id, replyId, !isCurrentlySolved);
      setSelectedThread(res.thread);
      setThreads(prev => prev.map(t => t.id === res.thread.id ? res.thread : t));
    } catch (err: any) {
      alert(err.message || 'Failed to update accepted solution');
    }
  };

  // Moderation Controls (Admin Only)
  const handleAdminPinToggle = async (threadId: string, currentPinned: boolean) => {
    try {
      await api.pinForumThread(threadId, !currentPinned);
      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, isPinned: !currentPinned } : t));
      if (selectedThread && selectedThread.id === threadId) {
        setSelectedThread(prev => prev ? { ...prev, isPinned: !currentPinned } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update pin state');
    }
  };

  const handleAdminLockToggle = async (threadId: string, currentLocked: boolean) => {
    try {
      await api.lockForumThread(threadId, !currentLocked);
      setThreads(prev => prev.map(t => t.id === threadId ? { ...t, isLocked: !currentLocked } : t));
      if (selectedThread && selectedThread.id === threadId) {
        setSelectedThread(prev => prev ? { ...prev, isLocked: !currentLocked } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update lock state');
    }
  };

  const handleAdminDeleteThread = async (threadId: string) => {
    if (!confirm('Are you sure you want to permanently delete this discussion thread and all its replies?')) return;
    try {
      await api.deleteForumThread(threadId);
      setThreads(prev => prev.filter(t => t.id !== threadId));
      if (selectedThread && selectedThread.id === threadId) {
        setSelectedThread(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete discussion thread');
    }
  };

  const handleAdminDeleteReply = async (replyId: string) => {
    if (!selectedThread) return;
    if (!confirm('Are you sure you want to delete this reply?')) return;
    try {
      await api.deleteForumReply(selectedThread.id, replyId);
      setSelectedThread(prev => {
        if (!prev) return null;
        return {
          ...prev,
          replies: (prev.replies || []).filter(r => r.id !== replyId),
          replyCount: Math.max(0, (prev.replyCount || 1) - 1)
        };
      });
    } catch (err: any) {
      alert(err.message || 'Failed to delete reply');
    }
  };

  // =========================================================================
  // LIVE CHAT HANDLERS (Preserved)
  // =========================================================================
  const loadChatMessages = async (channel: CommunityChannel, search?: string, isBackgroundPoll = false) => {
    try {
      if (!isBackgroundPoll) setLoadingMessages(true);
      const data = await api.getCommunityMessages(channel, search);
      setMessages(data.messages || []);
      if (!isBackgroundPoll && isInitialChatLoadRef.current) {
        isInitialChatLoadRef.current = false;
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'auto' });
          }
        }, 50);
      }
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    } finally {
      if (!isBackgroundPoll) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      isInitialChatLoadRef.current = true;
      loadChatMessages(activeChannel, chatSearchQuery, false);
      const interval = setInterval(() => {
        loadChatMessages(activeChannel, chatSearchQuery, true);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [activeTab, activeChannel, chatSearchQuery]);

  const handleSendChatMessage = async () => {
    const textToSend = chatInputText.trim();
    if (!textToSend) return;

    setSubmittingChatMessage(true);
    try {
      const res = await api.postCommunityMessage({
        channelId: activeChannel,
        content: textToSend,
        replyToId: replyingToMessage?.id,
        replyToSnippet: replyingToMessage ? replyingToMessage.content.slice(0, 70) : undefined,
        authorName: user?.name || 'StudyNaija Student',
        authorEmail: user?.email,
        userTournamentBadge: (user as any)?.tournamentBadge || null,
        userThemeVariant: (user as any)?.themeVariant || 'default'
      });

      if (res.message) {
        setMessages(prev => [...prev, res.message!]);
        setChatInputText('');
        setReplyingToMessage(null);
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
          }
        }, 50);
      }
    } catch (err: any) {
      if (err.moderation || err.blocked) {
        setModerationAlert({
          reason: err.moderation?.reason || err.message,
          violationType: err.moderation?.violationType,
          cleanAdvice: err.moderation?.cleanAdvice,
          educationalFeedback: err.moderation?.educationalFeedback
        });
      } else {
        alert(err.message || 'Failed to post message.');
      }
    } finally {
      setSubmittingChatMessage(false);
    }
  };

  const handleLikeChatMessage = async (msgId: string) => {
    try {
      const res = await api.likeCommunityMessage(msgId, user?.id);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, likes: res.likes } : m));
    } catch (err) {
      console.error('Failed to like message:', err);
    }
  };

  const handleAskAiToExplain = async (msg: CommunityMessage) => {
    try {
      setExplainingMessageId(msg.id);
      const res = await api.requestCommunityAiExplanation(msg.content, msg.id, msg.channelId);
      if (res.reply) {
        setMessages(prev => [...prev, res.reply]);
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
          }
        }, 80);
      }
    } catch (err) {
      console.error('Failed to request AI explanation:', err);
    } finally {
      setExplainingMessageId(null);
    }
  };

  const currentChannelInfo = CHANNELS.find(c => c.id === activeChannel) || CHANNELS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* ========================================================================= */}
      {/* COMMUNITY HEADER & DUAL MODE SWITCHER */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                <span>Naija Scholar Network</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>SabiGuard Active</span>
              </span>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                  <Shield className="w-3 h-3" />
                  <span>Admin Moderator Privileges</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              StudyNaija Community <span className="text-emerald-400">Forum</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Ask tough questions, share verified past exam solutions, collaborate with peer scholars across Nigeria, and earn academic reputation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => {
                if (!user) {
                  onOpenAuth('login');
                } else {
                  setShowCreateModal(true);
                }
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Ask Question / Post</span>
            </button>
            {onOpenHonorCode && (
              <button
                onClick={onOpenHonorCode}
                className="px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Honor Code</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher: Discussions Forum vs Live Study Rooms */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => {
                setActiveTab('forum');
                setSelectedThread(null);
              }}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'forum'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Discussion Board ({totalThreads})</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Live Study Rooms</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>Over 12,400+ Nigerian scholars revising daily</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: FORUM DISCUSSIONS */}
      {/* ========================================================================= */}
      {activeTab === 'forum' && (
        <div className="space-y-6">

          {/* If viewing a single thread detail */}
          {selectedThread ? (
            <div className="space-y-6 animate-fade-in">
              {/* Back Bar */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedThread(null)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to all discussions</span>
                </button>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAdminPinToggle(selectedThread.id, !!selectedThread.isPinned)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                        selectedThread.isPinned 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                      <span>{selectedThread.isPinned ? 'Unpin' : 'Pin Thread'}</span>
                    </button>
                    <button
                      onClick={() => handleAdminLockToggle(selectedThread.id, !!selectedThread.isLocked)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                        selectedThread.isLocked 
                          ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {selectedThread.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{selectedThread.isLocked ? 'Unlock' : 'Lock Thread'}</span>
                    </button>
                    <button
                      onClick={() => handleAdminDeleteThread(selectedThread.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Main Thread Card */}
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
                {/* Meta Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                    EXAM_CATEGORIES.find(c => c.id === selectedThread.examCategory)?.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}>
                    {selectedThread.examCategory}
                  </span>
                  {selectedThread.subjectName && (
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
                      {selectedThread.subjectName}
                    </span>
                  )}
                  {selectedThread.isPinned && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                      <Pin className="w-3 h-3" />
                      <span>Pinned</span>
                    </span>
                  )}
                  {selectedThread.isSolved && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Solved & Verified</span>
                    </span>
                  )}
                  {selectedThread.isLocked && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold">
                      <Lock className="w-3 h-3" />
                      <span>Locked (Read Only)</span>
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
                  {selectedThread.title}
                </h2>

                {/* Author Info */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-400 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-black text-slate-950 text-sm shadow-md">
                      {selectedThread.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{selectedThread.authorName}</span>
                        {selectedThread.userTournamentBadge && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase">
                            🏆 {selectedThread.userTournamentBadge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Posted {new Date(selectedThread.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(selectedThread.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400 text-xs">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span>{selectedThread.viewCount || 1} views</span>
                    </span>
                    <button
                      onClick={(e) => handleLikeThread(e, selectedThread.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition cursor-pointer font-bold"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{selectedThread.likes || 0} Upvotes</span>
                    </button>
                  </div>
                </div>

                {/* Post Body Content */}
                <div className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line space-y-4 font-sans">
                  {selectedThread.content}
                </div>

                {/* Tags */}
                {selectedThread.tags && selectedThread.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedThread.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800/80 text-emerald-400 text-xs font-mono border border-slate-700/60">
                        <Tag className="w-3 h-3 text-slate-500" />
                        <span>#{tag}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Replies Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    <span>Solutions & Discussion ({selectedThread.replies?.length || 0})</span>
                  </h3>
                </div>

                {/* Reply Stream */}
                {(!selectedThread.replies || selectedThread.replies.length === 0) ? (
                  <div className="rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-slate-300 font-bold text-sm">No replies yet. Be the first scholar to answer!</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Help your fellow student break down this concept or step-by-step solution. Verified answers earn extra reputation.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedThread.replies.map(reply => {
                      const isAccepted = reply.isAcceptedAnswer || (selectedThread.solvedReplyId === reply.id);
                      return (
                        <div
                          key={reply.id}
                          className={`rounded-3xl border p-5 sm:p-6 space-y-3 transition ${
                            isAccepted
                              ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                              : 'bg-slate-900 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                                isAccepted ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                              }`}>
                                {reply.authorName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-xs sm:text-sm">{reply.authorName}</span>
                                  {isAccepted && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                      <span>Best Answer</span>
                                    </span>
                                  )}
                                  {reply.userTournamentBadge && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase">
                                      🏆 {reply.userTournamentBadge}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500">
                                  {new Date(reply.createdAt).toLocaleDateString()} at {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>

                            {/* Actions on Reply */}
                            <div className="flex items-center gap-2">
                              {/* Mark as Best Answer button (for original author or admin) */}
                              {(user?.id === selectedThread.authorId || user?.email === selectedThread.authorEmail || isAdmin) && (
                                <button
                                  onClick={() => handleToggleSolve(reply.id)}
                                  className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                    isAccepted
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                                      : 'bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-700'
                                  }`}
                                  title="Mark this answer as accepted solution"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{isAccepted ? 'Accepted Solution' : 'Accept Answer'}</span>
                                </button>
                              )}

                              {/* Admin Delete Reply */}
                              {isAdmin && (
                                <button
                                  onClick={() => handleAdminDeleteReply(reply.id)}
                                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer"
                                  title="Delete reply"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Like reply button */}
                              <button
                                onClick={() => handleLikeReply(reply.id)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 text-xs font-bold transition cursor-pointer"
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>{reply.likes || 0}</span>
                              </button>
                            </div>
                          </div>

                          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line pl-11">
                            {reply.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Reply Form Box */}
                {selectedThread.isLocked ? (
                  <div className="rounded-3xl bg-red-950/20 border border-red-500/30 p-5 text-center text-red-300 text-xs sm:text-sm flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 text-red-400" />
                    <span>This discussion has been locked by a moderator. New replies are disabled.</span>
                  </div>
                ) : (
                  <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>Write your Answer or Perspective</span>
                      </span>
                      <span className="text-[11px] text-emerald-400/80 font-mono flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>SabiGuard Protected</span>
                      </span>
                    </div>

                    <textarea
                      value={replyInputText}
                      onChange={(e) => setReplyInputText(e.target.value)}
                      placeholder="Type your explanation or solution. Break down steps, formulas, or syllabus insights clearly..."
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition leading-relaxed resize-y"
                    />

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <p className="text-[11px] text-slate-500">
                        Please adhere to the academic honor code. Do not post exam leaks, payment links, or abuse.
                      </p>

                      <button
                        onClick={handlePostReply}
                        disabled={submittingReply || !replyInputText.trim()}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{submittingReply ? 'Verifying...' : 'Post Reply'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* =============================================================== */
            /* THREADS LISTING VIEW */
            /* =============================================================== */
            <div className="space-y-6">

              {/* Filters & Search Toolbar */}
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-6 space-y-4 shadow-xl">
                {/* Search Bar & Subject Select */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={forumSearch}
                      onChange={(e) => setForumSearch(e.target.value)}
                      placeholder="Search questions by topic, formula, keywords (e.g. calculus, redox, UTME cut-off)..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                    {forumSearch && (
                      <button
                        onClick={() => setForumSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Subject Dropdown */}
                  <div className="w-full md:w-56 shrink-0">
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-300 font-bold focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                    >
                      {FORUM_SUBJECTS.map(subj => (
                        <option key={subj.id} value={subj.id}>
                          {subj.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Exam Category Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {EXAM_CATEGORIES.map(cat => {
                    const isActive = selectedExamCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedExamCategory(cat.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sorting options & Count */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400 flex-wrap gap-2">
                  <span className="font-mono">
                    Showing <strong>{threads.length}</strong> of {totalThreads} discussions
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold">Sort:</span>
                    {(['latest', 'popular', 'unanswered', 'solved'] as const).map(sortKey => (
                      <button
                        key={sortKey}
                        onClick={() => setForumSort(sortKey)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                          forumSort === sortKey
                            ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {sortKey}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Thread Cards Listing */}
              {loadingThreads ? (
                <div className="py-16 text-center space-y-4">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                  <p className="text-slate-400 text-sm">Loading community discussions...</p>
                </div>
              ) : threads.length === 0 ? (
                <div className="rounded-3xl bg-slate-900 border border-slate-800 p-12 text-center space-y-4 shadow-xl">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-white">No discussions found</h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    No discussions match your filter criteria. Be the first to start a conversation or question for this subject!
                  </p>
                  <button
                    onClick={() => {
                      if (!user) onOpenAuth('login');
                      else setShowCreateModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shadow-md transition hover:bg-emerald-400 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Start Discussion</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {threads.map(thread => {
                    const examBadge = EXAM_CATEGORIES.find(c => c.id === thread.examCategory)?.badgeColor || 'bg-slate-800 text-slate-300';
                    return (
                      <div
                        key={thread.id}
                        onClick={() => handleOpenThread(thread.id)}
                        className={`group rounded-3xl p-5 sm:p-6 transition-all border cursor-pointer hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/20 relative overflow-hidden ${
                          thread.isPinned
                            ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border-amber-500/40'
                            : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          
                          {/* Left Column: Details */}
                          <div className="space-y-2 flex-1">
                            {/* Badges Row */}
                            <div className="flex items-center gap-2 flex-wrap text-[11px]">
                              {thread.isPinned && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                                  <Pin className="w-2.5 h-2.5" />
                                  <span>Pinned</span>
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-md font-black uppercase tracking-wider border ${examBadge}`}>
                                {thread.examCategory}
                              </span>
                              {thread.subjectName && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                                  {thread.subjectName}
                                </span>
                              )}
                              {thread.isSolved && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>Solved</span>
                                </span>
                              )}
                              {thread.isLocked && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>Locked</span>
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition leading-snug">
                              {thread.title}
                            </h3>

                            {/* Snippet */}
                            <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                              {thread.content}
                            </p>

                            {/* Tags */}
                            {thread.tags && thread.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {thread.tags.map(tag => (
                                  <span key={tag} className="text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Author & Timestamp */}
                            <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500">
                              <span className="font-bold text-slate-300">{thread.authorName}</span>
                              {thread.userTournamentBadge && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase">
                                  🏆 {thread.userTournamentBadge}
                                </span>
                              )}
                              <span>•</span>
                              <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Right Column: Stats & Admin Moderation */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <button
                                onClick={(e) => handleLikeThread(e, thread.id)}
                                className="flex items-center gap-1 hover:text-emerald-400 transition cursor-pointer p-1.5 rounded-xl hover:bg-slate-800 font-bold"
                              >
                                <ThumbsUp className="w-4 h-4" />
                                <span>{thread.likes || 0}</span>
                              </button>

                              <div className="flex items-center gap-1 p-1.5">
                                <MessageSquare className="w-4 h-4 text-emerald-400" />
                                <span className="font-bold">{thread.replyCount || 0}</span>
                              </div>

                              <div className="flex items-center gap-1 p-1.5 text-slate-500 hidden sm:flex">
                                <Eye className="w-4 h-4" />
                                <span>{thread.viewCount || 1}</span>
                              </div>
                            </div>

                            {/* Admin Quick Moderation Buttons */}
                            {isAdmin && (
                              <div className="flex items-center gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleAdminPinToggle(thread.id, !!thread.isPinned)}
                                  className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                    thread.isPinned
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-amber-300'
                                  }`}
                                  title={thread.isPinned ? 'Unpin' : 'Pin to top'}
                                >
                                  <Pin className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleAdminLockToggle(thread.id, !!thread.isLocked)}
                                  className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                    thread.isLocked
                                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                                      : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-red-300'
                                  }`}
                                  title={thread.isLocked ? 'Unlock discussion' : 'Lock discussion'}
                                >
                                  {thread.isLocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                </button>
                                <button
                                  onClick={() => handleAdminDeleteThread(thread.id)}
                                  className="p-1.5 rounded-lg bg-slate-950 text-slate-500 border border-slate-800 hover:text-red-400 hover:border-red-500/40 transition cursor-pointer"
                                  title="Delete thread"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: LIVE STUDY CHAT ROOMS (Preserved & Enhanced) */}
      {/* ========================================================================= */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left Channel Switcher */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 px-1">
              Active Study Channels
            </h3>
            <div className="space-y-1.5">
              {CHANNELS.map(ch => {
                const isActive = activeChannel === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannel(ch.id)}
                    className={`w-full text-left p-3.5 rounded-2xl transition cursor-pointer border ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{ch.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate text-white">{ch.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">{ch.tag}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Tolerance Policy</span>
              </span>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Exam malpractice solicitation ("runs", leaks) and offensive language are automatically blocked by SabiGuard.
              </p>
            </div>
          </div>

          {/* Main Chat Stream Container */}
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 sm:p-5 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentChannelInfo.icon}</span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>{currentChannelInfo.name}</span>
                    <span className="font-mono text-xs text-emerald-400">{currentChannelInfo.tag}</span>
                  </h2>
                  <p className="text-xs text-slate-400">{currentChannelInfo.description}</p>
                </div>
              </div>

              <div className="relative hidden sm:block w-48">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder="Filter chat..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Chat Messages Box */}
            <div
              ref={chatContainerRef}
              className="rounded-3xl bg-slate-950 border border-slate-800 p-4 sm:p-6 h-[460px] overflow-y-auto space-y-4 shadow-inner"
            >
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  <RefreshCw className="w-5 h-5 animate-spin mr-2 text-emerald-400" />
                  <span>Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <MessageCircle className="w-8 h-8 text-slate-600" />
                  <p className="text-xs font-bold text-slate-400">No messages in this study room yet.</p>
                  <p className="text-[11px]">Say hi, ask an exam question, or share your study target!</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isAi = msg.isAi || msg.userName?.includes('AI Coach') || msg.userName?.includes('SabiGuard');
                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-2xl border space-y-2 transition ${
                        isAi
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isAi ? 'text-emerald-300' : 'text-white'}`}>
                            {msg.userName}
                          </span>
                          {isAi && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                              AI COACH
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLikeChatMessage(msg.id)}
                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400 cursor-pointer"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{msg.likes || 0}</span>
                          </button>
                          {!isAi && (
                            <button
                              onClick={() => handleAskAiToExplain(msg)}
                              disabled={explainingMessageId === msg.id}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>{explainingMessageId === msg.id ? 'Thinking...' : 'AI Explain'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Box */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-4 space-y-3 shadow-xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendChatMessage();
                    }
                  }}
                  placeholder={`Chat in ${currentChannelInfo.name}...`}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleSendChatMessage}
                  disabled={submittingChatMessage || !chatInputText.trim()}
                  className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW FORUM DISCUSSION / QUESTION */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Create New Discussion / Question</h3>
                  <p className="text-xs text-slate-400">Share with over 12,000+ Nigerian scholars</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateThread} className="space-y-4">
              
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Question or Discussion Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How do I balance redox equations in acidic medium for WAEC?"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              {/* Exam Category & Subject Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Exam Category *</label>
                  <select
                    value={newExamCategory}
                    onChange={(e) => setNewExamCategory(e.target.value as ForumExamCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-200 font-bold focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                  >
                    <option value="JAMB">JAMB UTME</option>
                    <option value="WAEC">WAEC SSCE</option>
                    <option value="NECO">NECO SSCE</option>
                    <option value="POST_UTME">Post-UTME Screening</option>
                    <option value="GENERAL">General Campus / Study Discussion</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Subject *</label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-200 font-bold focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                  >
                    {FORUM_SUBJECTS.filter(s => s.id !== 'all').map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. redox, past-questions, chemistry-paper-2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition font-mono"
                />
              </div>

              {/* Detailed Content */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Detailed Explanation or Question Context *</label>
                <textarea
                  required
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Provide context, formulas, options, or describe where you are getting stuck. Be specific so tutors and fellow scholars can give complete answers."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition leading-relaxed resize-y"
                />
              </div>

              {/* AI SabiGuard Notice */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Protected by SabiGuard AI: Malpractice requests and abusive text are filtered automatically.</span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNewThread || !newTitle.trim() || !newContent.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingNewThread ? 'Verifying & Posting...' : 'Publish Discussion'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SABIGUARD AI MODERATION REJECTION / WARNING */}
      {/* ========================================================================= */}
      {moderationAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg sm:text-xl font-black text-white">
                SabiGuard AI Content Notice
              </h3>
              <p className="text-xs sm:text-sm text-amber-300/90 leading-relaxed font-semibold">
                {moderationAlert.reason}
              </p>
            </div>

            {moderationAlert.educationalFeedback && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
                <span className="font-bold text-emerald-400 block">Academic Integrity Guide:</span>
                <p>{moderationAlert.educationalFeedback}</p>
              </div>
            )}

            {moderationAlert.cleanAdvice && (
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 leading-relaxed space-y-1">
                <span className="font-bold block">How to rephrase your post:</span>
                <p>{moderationAlert.cleanAdvice}</p>
              </div>
            )}

            <button
              onClick={() => setModerationAlert(null)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg transition cursor-pointer"
            >
              I Understand, Let Me Revise
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
