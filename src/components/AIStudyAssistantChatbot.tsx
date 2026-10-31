import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Bot,
  User as UserIcon,
  BookOpen,
  Target,
  TrendingUp,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Clock,
  RotateCcw,
  Zap,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  Layers,
  Award,
  Play
} from 'lucide-react';
import { User, Subject } from '../types';
import { api } from '../services/api';
import { SYLLABUS_TOPICS } from '../utils/syllabusTopics';
import { topicProgressManager } from '../utils/topicProgress';
import { SECONDARY_SUBJECTS } from '../mockData';
import { searchHistoryManager } from '../utils/searchHistoryManager';
import { aiVoice } from '../utils/aiVoice';
import { gamification } from '../utils/gamification';

interface RecommendedAction {
  topic: string;
  subjectId: string;
  subjectName: string;
  reason: string;
  scoreBoost: string;
}

interface ChatbotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  subjectName?: string;
  recommendedActions?: RecommendedAction[];
  isPerformanceDiagnostic?: boolean;
}

interface AIStudyAssistantChatbotProps {
  user: User | null;
  onNavigate: (view: string, extra?: any) => void;
  subjects?: Subject[];
}

const STORAGE_CHAT_KEY = 'studynaija_study_assistant_chatbot_messages_v1';

export const AIStudyAssistantChatbot: React.FC<AIStudyAssistantChatbotProps> = ({
  user,
  onNavigate,
  subjects = SECONDARY_SUBJECTS
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'performance' | 'topics'>('chat');
  const [topicSearchQuery, setTopicSearchQuery] = useState<string>('');

  // Search History for AI Chat queries
  const [searchHistory, setSearchHistory] = useState<string[]>(() =>
    searchHistoryManager.getHistory('ai_tutor', 6)
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize messages
  const [messages, setMessages] = useState<ChatbotMessage[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_CHAT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'msg-welcome-1',
        sender: 'assistant',
        text: `👋 **Hello ${user?.name ? user.name.split(' ')[0] : 'Scholar'}! I am your AI Study Assistant.**\n\nI can help you with:\n1. 📖 **Plain English Explanations** of any concept from your study materials.\n2. 📐 **Step-by-Step Workings** for Math, Physics & Chemistry calculations.\n3. 🎯 **Personalized Topic Recommendations** based on your CBT test scores and weak areas.\n4. 💡 **Memory Mnemonics & Examiner Traps** for JAMB UTME & WAEC.\n\nTap **"Analyze My Performance"** below or ask me any question!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Sync search history
  useEffect(() => {
    const handleHistoryUpdate = () => {
      setSearchHistory(searchHistoryManager.getHistory('ai_tutor', 6));
    };
    window.addEventListener('studynaija_search_history_updated', handleHistoryUpdate);
    return () => window.removeEventListener('studynaija_search_history_updated', handleHistoryUpdate);
  }, []);

  // Quick Action: Analyze Student Performance & Recommend Topics
  const handleAnalyzePerformanceAndRecommend = async () => {
    setIsLoading(true);
    setActiveTab('chat');

    const avgScore = user?.stats?.averageScore ?? 68;
    const questionsAnswered = user?.stats?.questionsAnswered ?? 42;
    const weakestSub = user?.stats?.weakestSubject || 'Physics';
    const bestScore = user?.stats?.bestScore ?? 85;

    // Inspect topics for weak areas across syllabus
    const currentSubjectObj = subjects.find(s => s.name.toLowerCase() === weakestSub.toLowerCase()) || subjects[0];
    const progress = topicProgressManager.getSubjectProgress(currentSubjectObj, user);
    
    // Find uncompleted or in-progress topics
    const unmasteredTopics = Object.values(progress.topicStatuses)
      .filter(t => t.status !== 'mastered')
      .slice(0, 3)
      .map(t => t.topicName);

    const weakTopicsList = unmasteredTopics.length > 0 ? unmasteredTopics : ['Linear Motion', 'Equations of Motion', 'Newton Laws'];

    const userPrompt = `Analyze my performance: I've answered ${questionsAnswered} questions with an average score of ${avgScore}%. My weakest subject is ${weakestSub}. Recommend the top priority topics to focus on.`;

    const userMsg: ChatbotMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);

    const structuredRecommendations: RecommendedAction[] = [
      {
        topic: weakTopicsList[0] || 'Linear Motion & Kinematics',
        subjectId: currentSubjectObj.id,
        subjectName: weakestSub,
        reason: `Highest recurring question weight in JAMB UTME. Mastering this addresses your ${weakestSub} performance bottleneck.`,
        scoreBoost: '+15 Marks'
      },
      {
        topic: 'Concord & Subject-Verb Agreement',
        subjectId: 'english',
        subjectName: 'Use of English',
        reason: 'Appears in 8 to 12 objective questions annually. High scoring certainty with rules of proximity.',
        scoreBoost: '+20 Marks'
      },
      {
        topic: 'Quadratic Equations & Polynomials',
        subjectId: 'mathematics',
        subjectName: 'Mathematics',
        reason: 'Fundamental bridge for algebra, calculus, and coordinate geometry questions.',
        scoreBoost: '+18 Marks'
      }
    ];

    try {
      const res = await api.askAITutor({
        message: `Act as a senior Nigerian academic advisor. The student ${user?.name || 'Scholar'} has answered ${questionsAnswered} practice questions, averaging ${avgScore}% overall, with their weakest subject identified as ${weakestSub}.
Provide a sharp, practical diagnostic report in plain English:
1. Student Diagnostic Assessment & Readiness Tier.
2. Why ${weakestSub} and specifically "${weakTopicsList.join(', ')}" need urgent focus.
3. Top 3 high-yield topics to practice right now for the fastest +50 score increase.
4. A concrete 5-day daily action plan (Day 1 to Day 5).
5. A simple memory mnemonic to retain the hardest formulas.`,
        subjectName: weakestSub,
        topic: weakTopicsList[0],
        examType: user?.targetExam || 'JAMB'
      });

      const assistantMsg: ChatbotMessage = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: res.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedActions: structuredRecommendations,
        isPerformanceDiagnostic: true
      };

      setMessages(prev => [...prev, assistantMsg]);
      gamification.addXp(20, 'Generated AI Performance Diagnostic & Study Plan');
    } catch (err: any) {
      // Diagnostic Fallback Report
      const fallbackReport = `### 🎯 Diagnostic Performance Assessment for ${user?.name || 'Scholar'}

**Current Readiness Tier:** ${avgScore >= 75 ? '🟢 Advanced Scholar (75%+ Avg)' : avgScore >= 60 ? '🟡 Competitive Standard (60-74% Avg)' : '🔴 Foundational Review Needed (<60% Avg)'}
- **Questions Answered:** ${questionsAnswered}
- **Average Score:** ${avgScore}%
- **Weakest Subject Alert:** **${weakestSub}** (Needs immediate reinforcement)

---

### 🚀 Top 3 High-Yield Topics to Focus on Right Now:
1. **${weakTopicsList[0] || 'Linear Motion & Equations'} (${weakestSub}):** 
   - *Why:* Accounts for up to 15% of mechanics calculations in JAMB & WAEC.
   - *Score Boost:* +15 Marks
2. **Concord & Grammatical Agreement (Use of English):**
   - *Why:* Compulsory section in English with predictable examiner traps (neither/nor, as well as, indefinite pronouns).
   - *Score Boost:* +20 Marks
3. **Quadratic Equations & Polynomials (Mathematics):**
   - *Why:* Core algebra component; questions are straightforward once you master the discriminant and factorization.
   - *Score Boost:* +18 Marks

---

### 📅 Your 5-Day Score Booster Plan:
- **Day 1:** Review ${weakTopicsList[0] || 'Linear Motion'} formulas and solve 15 past questions with step-by-step workings.
- **Day 2:** Master English Concord rules (Proximity & Parenthetical subject agreement).
- **Day 3:** Practice 20 Mathematics algebra and quadratic equation problems.
- **Day 4:** Take a timed 40-question mock exam on your weakest subject (${weakestSub}).
- **Day 5:** Review all flagged mistakes and test yourself on memory mnemonics.

Tap **"Practice This Topic Now"** below to start an interactive drill right away!`;

      const assistantMsg: ChatbotMessage = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: fallbackReport,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedActions: structuredRecommendations,
        isPerformanceDiagnostic: true
      };

      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send a custom message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    // Record to search history
    searchHistoryManager.addSearch(textToSend, 'ai_tutor');

    const userMsg: ChatbotMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subjectName: selectedSubject !== 'all' ? selectedSubject : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const activeSubjectObj = subjects.find(s => s.id === selectedSubject);
      const res = await api.askAITutor({
        message: textToSend,
        subjectName: activeSubjectObj ? activeSubjectObj.name : undefined,
        examType: user?.targetExam || 'JAMB/WAEC',
        chatHistory: messages.map(m => ({
          sender: m.sender === 'user' ? 'user' : 'tutor',
          text: m.text
        }))
      });

      const assistantMsg: ChatbotMessage = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: res.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subjectName: activeSubjectObj ? activeSubjectObj.name : undefined
      };

      setMessages(prev => [...prev, assistantMsg]);
      gamification.addXp(10, 'Asked AI Study Assistant');
    } catch (err: any) {
      const errText = err?.message || 'I encountered a brief connection issue. Please try again.';
      const errorMsg: ChatbotMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Study Assistant Note:** ${errText}\n\nYou can re-ask your question or pick one of the study suggestions below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Explain a specific study material topic in plain English
  const handleExplainTopic = (topicName: string, subjectName: string) => {
    const prompt = `Explain "${topicName}" in ${subjectName} in simple plain English with a real-world Nigerian analogy, core formula or rule, common examiner traps, and a memorable study mnemonic.`;
    handleSendMessage(prompt);
  };

  // Launch Practice for a recommended topic
  const handleLaunchPractice = (subjectId: string, topic: string) => {
    setIsOpen(false);
    if (onNavigate) {
      onNavigate('practice', { subjectId, topic });
    }
  };

  // Voice playback
  const handleToggleVoice = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      aiVoice.stop();
      setSpeakingMsgId(null);
      return;
    }
    aiVoice.stop();
    const cleanSpeech = text
      .replace(/###/g, '')
      .replace(/\*\*/g, '')
      .replace(/\$/g, '')
      .replace(/⚡|•|📌|🎯|💡|📖|📐|🔬/g, '')
      .trim();

    setSpeakingMsgId(msgId);
    aiVoice.speakConciseExplanation(cleanSpeech, () => {
      setSpeakingMsgId(null);
    });
  };

  // Copy text to clipboard
  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clear chat
  const handleClearChat = () => {
    aiVoice.stop();
    setSpeakingMsgId(null);
    const newWelcome: ChatbotMessage = {
      id: `msg-welcome-${Date.now()}`,
      sender: 'assistant',
      text: `🇳🇬 **New Study Assistant Session Started!**\n\nWhat topic are we conquering next? You can ask a calculation, explain a syllabus concept, or tap **"Analyze My Performance"** for updated recommendations!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([newWelcome]);
    try {
      localStorage.removeItem(STORAGE_CHAT_KEY);
    } catch {}
  };

  // Filter syllabus topics for topic browser tab
  const filteredSyllabusTopics = SYLLABUS_TOPICS.filter(t => {
    if (selectedSubject !== 'all' && t.subjectId !== selectedSubject) return false;
    if (!topicSearchQuery.trim()) return true;
    const q = topicSearchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.subjectName.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    );
  }).slice(0, 15);

  return (
    <>
      {/* Floating Trigger Button (Positioned cleanly at bottom-20 right-5, stacked neatly above WhatsApp button) */}
      {!isOpen && (
        <button
          id="floating-ai-study-assistant-btn"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-5 z-40 group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-2xl hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-emerald-400/40"
          aria-label="Open AI Study Assistant Chatbot"
          title="Open AI Study Assistant: Subject Q&A, Plain English Explanations & Performance Recommendations"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-300 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-[10px] font-black tracking-wider uppercase text-emerald-200 flex items-center gap-1">
              <span>Naija AI</span>
              <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1 rounded-sm">24/7</span>
            </div>
            <div className="text-xs font-bold leading-tight text-white flex items-center gap-1">
              <span>Study Assistant</span>
              <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
            </div>
          </div>
        </button>
      )}

      {/* Slide-out / Modal Chatbot Window */}
      {isOpen && (
        <div
          id="ai-study-assistant-window"
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white shadow-2xl border border-slate-200 overflow-hidden ${
            isExpanded
              ? 'inset-3 sm:inset-6 md:inset-10 rounded-3xl'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[440px] h-[85vh] sm:h-[620px] max-h-[85vh] rounded-3xl'
          }`}
        >
          {/* Top Bar Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-3.5 sm:p-4 border-b border-emerald-500/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-white font-['Outfit']">Naija AI Study Assistant</h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ONLINE
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate max-w-[200px] sm:max-w-xs">
                  Subject Q&A • Study Material Explanations • Recommendations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1.5 hover:bg-slate-800 rounded-xl hover:text-slate-200 transition cursor-pointer"
                title="Restart Chat Session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(prev => !prev)}
                className="p-1.5 hover:bg-slate-800 rounded-xl hover:text-slate-200 transition cursor-pointer hidden sm:block"
                title={isExpanded ? 'Minimize Window' : 'Expand Window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  aiVoice.stop();
                  setSpeakingMsgId(null);
                  setIsOpen(false);
                }}
                className="p-1.5 hover:bg-slate-800 rounded-xl hover:text-white transition cursor-pointer"
                title="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat Assistant</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('performance');
                  handleAnalyzePerformanceAndRecommend();
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'performance'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                }`}
                title="Diagnose student test performance and get topic recommendations"
              >
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>Analyze My Scores 🎯</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('topics')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'topics'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Study Topics</span>
              </button>
            </div>

            {/* Subject Selector dropdown */}
            <div className="shrink-0">
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="text-[11px] font-bold px-2 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="all">All Subjects</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* TAB 1: Chat Stream */}
          {activeTab === 'chat' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              
              {/* Quick Action Banner: 1-Click Performance Analysis */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-emerald-950">Personalized Score Diagnostics</div>
                    <div className="text-[11px] text-emerald-700">
                      Weakest subject: <strong>{user?.stats?.weakestSubject || 'Physics'}</strong> • Avg: <strong>{user?.stats?.averageScore ?? 68}%</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyzePerformanceAndRecommend}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs hover:shadow-emerald-600/30 transition cursor-pointer shrink-0 disabled:opacity-50"
                >
                  Analyze & Boost
                </button>
              </div>

              {/* Chat Message List */}
              {messages.map(msg => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[85%] space-y-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                          isUser
                            ? 'bg-slate-900 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-200/80 shadow-xs rounded-tl-none'
                        }`}
                      >
                        {/* Message Content Formatter */}
                        <div className="space-y-2 whitespace-pre-wrap font-sans">
                          {msg.text.split('\n\n').map((paragraph, pIdx) => {
                            const trimmed = paragraph.trim();
                            if (!trimmed) return null;

                            if (trimmed.startsWith('### ')) {
                              return (
                                <h4 key={pIdx} className="font-extrabold text-xs sm:text-sm text-emerald-900 mt-2 mb-1">
                                  {trimmed.replace('### ', '')}
                                </h4>
                              );
                            }

                            if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.includes('\n- ')) {
                              const items = trimmed.split('\n');
                              return (
                                <ul key={pIdx} className="list-disc pl-4 space-y-1 my-1">
                                  {items.map((it, itIdx) => (
                                    <li key={itIdx}>
                                      {it.replace(/^[-•]\s*/, '')}
                                    </li>
                                  ))}
                                </ul>
                              );
                            }

                            return <p key={pIdx}>{paragraph}</p>;
                          })}
                        </div>

                        {/* Interactive Recommended Topic Cards */}
                        {msg.recommendedActions && msg.recommendedActions.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                            <div className="text-[11px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>Recommended Action Steps:</span>
                            </div>
                            <div className="space-y-1.5">
                              {msg.recommendedActions.map((rec, rIdx) => (
                                <div
                                  key={rIdx}
                                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-xs text-slate-900">{rec.topic}</span>
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                        {rec.scoreBoost}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500">{rec.reason}</div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0 pt-1 sm:pt-0">
                                    <button
                                      type="button"
                                      onClick={() => handleLaunchPractice(rec.subjectId, rec.topic)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                                    >
                                      <Play className="w-2.5 h-2.5" />
                                      <span>Practice Drill</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleExplainTopic(rec.topic, rec.subjectName)}
                                      className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                                    >
                                      Explain
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Message Footer: Voice, Copy, Timestamp */}
                      <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        {!isUser && (
                          <>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={() => handleToggleVoice(msg.id, msg.text)}
                              className={`flex items-center gap-1 font-semibold transition cursor-pointer ${
                                speakingMsgId === msg.id ? 'text-rose-600 font-bold animate-pulse' : 'hover:text-slate-700'
                              }`}
                            >
                              {speakingMsgId === msg.id ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                              <span>{speakingMsgId === msg.id ? 'Stop Voice' : 'Listen'}</span>
                            </button>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(msg.id, msg.text)}
                              className="flex items-center gap-1 font-semibold hover:text-slate-700 cursor-pointer"
                            >
                              {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium p-3 bg-white rounded-2xl border border-slate-200 max-w-xs shadow-xs animate-pulse">
                  <div className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <Sparkles className="w-3 h-3 animate-spin" />
                  </div>
                  <span>Naija AI is formulating explanation...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* TAB 2: Study Topics & Concept Library */}
          {activeTab === 'topics' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Select a Syllabus Concept to Explain in Plain English:
                </h4>
                <input
                  type="text"
                  value={topicSearchQuery}
                  onChange={e => setTopicSearchQuery(e.target.value)}
                  placeholder="Filter topics (e.g. 'osmosis', 'concord', 'stoichiometry')..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                {filteredSyllabusTopics.map(topic => (
                  <div
                    key={topic.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-xs transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-xs text-slate-900">{topic.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {topic.subjectName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{topic.description}</p>
                    
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleLaunchPractice(topic.subjectId, topic.name)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                      >
                        Practice 10Q
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('chat');
                          handleExplainTopic(topic.name, topic.subjectName);
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Lightbulb className="w-3 h-3" />
                        <span>Explain in Plain English</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Prompts & Search History Bar */}
          <div className="bg-white border-t border-slate-200 p-2.5 space-y-2 shrink-0">
            {/* Recent Searches Pills */}
            {searchHistory.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-600" />
                  <span>Recent:</span>
                </span>
                {searchHistory.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(item)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 border border-slate-200 hover:border-emerald-300 font-medium truncate max-w-[130px] shrink-0 cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Prompt Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <button
                type="button"
                onClick={handleAnalyzePerformanceAndRecommend}
                className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-950 font-bold shrink-0 border border-emerald-300 hover:bg-emerald-200 flex items-center gap-1 cursor-pointer"
              >
                <Target className="w-3 h-3 text-emerald-700" />
                <span>🎯 What should I study today?</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Explain Quadratic Equations in simple plain English with step-by-step example.')}
                className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold shrink-0 hover:bg-slate-200 cursor-pointer"
              >
                📐 Quadratic Workings
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('What are the top 15 Concord rules for JAMB Use of English?')}
                className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold shrink-0 hover:bg-slate-200 cursor-pointer"
              >
                📖 JAMB Concord Rules
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('Explain Newton three laws of motion in plain English with daily Nigerian life examples.')}
                className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold shrink-0 hover:bg-slate-200 cursor-pointer"
              >
                🔬 Newton's Laws
              </button>
            </div>

            {/* Input Message Form */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="Ask any subject question, formula or concept in plain English..."
                className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-100 text-slate-900 border border-slate-300 text-xs sm:text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="w-10 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition cursor-pointer shadow-sm shrink-0"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
