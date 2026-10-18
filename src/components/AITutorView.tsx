import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Lock, 
  Crown, 
  AlertCircle, 
  RefreshCw, 
  BookOpen, 
  Check, 
  Copy, 
  Lightbulb,
  Zap, 
  ArrowRight, 
  Volume2, 
  Square,
  Trash2,
  Brain,
  Search,
  CheckCheck,
  Calculator,
  Maximize2,
  Minimize2,
  FileText,
  RotateCcw,
  Smile,
  Paperclip,
  Mic,
  MoreVertical,
  CheckCircle2,
  Code,
  ShieldAlert,
  Terminal,
  Cpu,
  Globe,
  FolderDown,
  Folder,
  Download,
  HelpCircle
} from 'lucide-react';
import { User, AITutorMessage, Subject } from '../types';
import { api } from '../services/api';
import { gamification } from '../utils/gamification';
import { aiVoice, VoicePersona, getVoicePersona, setVoicePersona } from '../utils/aiVoice';
import { SmartWebInsightsSection } from './SmartWebInsightsSection';
import { InteractiveCodeBlock } from './InteractiveCodeBlock';

const CHAT_STORAGE_KEY = 'studynaija_naija_ai_chat_history_v3';

// Markdown Block Parser: Separates markdown text and fenced code blocks
interface ParsedBlock {
  type: 'text' | 'code';
  language?: string;
  content: string;
}

const parseMessageBlocks = (text: string): ParsedBlock[] => {
  const codeBlockRegex = /```([a-zA-Z0-9_\+#\.\-]+)?\n([\s\S]*?)```/g;
  const blocks: ParsedBlock[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    blocks.push({
      type: 'code',
      language: match[1] || 'code',
      content: match[2].trimEnd()
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    blocks.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return blocks.length > 0 ? blocks : [{ type: 'text', content: text }];
};

// Formats inline bold (**text**) and inline code (`code`)
const renderFormattedText = (raw: string) => {
  const parts = raw.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-slate-200/90 text-emerald-850 font-mono text-[11px] font-semibold border border-slate-300/60">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

const DEFAULT_WELCOME_MESSAGE: AITutorMessage = {
  id: 'msg-welcome',
  sender: 'tutor',
  text: `🇳🇬 **Welcome to Naija AI!** I'm your dedicated AI Academic Tutor & STEM Coach for JAMB UTME, WAEC SSCE, NECO, and University Studies.\n\n⚡ **What I can do for you:**\n• **📐 Step-by-Step Mathematical Workings:** Calculus, quadratic equations, logarithms, trigonometry, and commercial arithmetic with clear formulas and proofs.\n• **🔬 Science Mastery (Physics, Chemistry, Biology):** Mechanics, electricity, stoichiometry, organic reactions, genetics, ecology, and memorable study mnemonics.\n• **📖 English Lexis, Concord & Comprehension:** Grammatical concord rules, oral stress patterns, idioms, and high-scoring summary techniques.\n• **📊 Commercial & Arts Curriculum:** Economics (elasticity & market structures), Government (constitution & separation of powers), and Literature text analysis.\n• **💻 Computer Science & Coding:** Python, algorithms, data structures, Big-O notation, SQL, JavaScript, and web development fundamentals.\n• **🎯 24/7 CBT Practice & Interactive Quizzes:** Ask me to quiz you on any topic, explain past questions, or break down difficult examiner traps!\n\nType any academic question or formula to get started!`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  smartWebInsights: {
    googleSources: [
      {
        title: 'JAMB Official Syllabus 2026/2027 Guidelines',
        url: 'https://myschool.ng/classroom',
        snippet: 'Official curriculum requirements, key objectives, and recommended texts for UTME candidates.'
      }
    ],
    smartWebsites: [
      {
        name: 'Myschool.ng Classroom',
        url: 'https://myschool.ng/classroom',
        badge: 'Verified Past Questions',
        description: 'Authentic Nigerian CBT past questions with verified answers and explanations.'
      },
      {
        name: 'Khan Academy STEM',
        url: 'https://www.khanacademy.org',
        badge: 'Interactive Lessons',
        description: 'Deep conceptual explanations in Mathematics, Physics, Chemistry, and Biology.'
      }
    ]
  }
};

interface ChatMessageBubbleProps {
  msg: AITutorMessage;
  speakingMsgId: string | null;
  copiedId: string | null;
  onToggleVoice: (id: string, text: string) => void;
  onCopy: (text: string, id: string) => void;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = React.memo(({
  msg,
  speakingMsgId,
  copiedId,
  onToggleVoice,
  onCopy
}) => {
  const isUser = msg.sender === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}>
      <div
        className={`relative p-3.5 sm:p-4 rounded-2xl shadow-xs leading-relaxed ${
          isUser
            ? 'bg-[#d9fdd3] text-slate-900 border border-[#b2e7ad] rounded-tr-xs max-w-[88%] sm:max-w-[78%]'
            : 'bg-white text-slate-900 border border-slate-200/90 rounded-tl-xs max-w-[95%] sm:max-w-[85%]'
        }`}
      >
        {!isUser && (
          <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 font-['Outfit']">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Naija AI Tutor</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
            </div>

            {msg.topic && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {msg.topic}
              </span>
            )}
          </div>
        )}

        <div className="text-xs sm:text-sm text-slate-900 space-y-2.5 font-normal leading-relaxed">
          {parseMessageBlocks(msg.text).map((block, bIdx) => {
            if (block.type === 'code') {
              return (
                <InteractiveCodeBlock
                  key={bIdx}
                  code={block.content}
                  language={block.language || 'text'}
                />
              );
            }

            return (
              <div key={bIdx} className="space-y-2">
                {block.content.split('\n\n').map((paragraph, pIdx) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;

                  if (trimmed.startsWith('### ')) {
                    return (
                      <h4 key={pIdx} className="font-extrabold text-sm sm:text-base text-emerald-950 mt-3 mb-1 font-['Outfit']">
                        {trimmed.replace('### ', '')}
                      </h4>
                    );
                  }

                  if (trimmed.startsWith('## ')) {
                    return (
                      <h3 key={pIdx} className="font-extrabold text-base sm:text-lg text-emerald-950 mt-3 mb-1 font-['Outfit']">
                        {trimmed.replace('## ', '')}
                      </h3>
                    );
                  }

                  if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.includes('\n- ') || trimmed.includes('\n• ')) {
                    const items = trimmed.split('\n');
                    return (
                      <ul key={pIdx} className="list-disc pl-4 space-y-1 my-1.5">
                        {items.map((it, iIdx) => {
                          const cleaned = it.replace(/^[-•]\s*/, '').trim();
                          if (!cleaned) return null;
                          return (
                            <li key={iIdx}>
                              {renderFormattedText(cleaned)}
                            </li>
                          );
                        })}
                      </ul>
                    );
                  }

                  return (
                    <p key={pIdx} className="whitespace-pre-wrap">
                      {renderFormattedText(paragraph)}
                    </p>
                  );
                })}
              </div>
            );
          })}
        </div>

        {!isUser && (msg.smartWebInsights || msg.groundingSources) && (
          <SmartWebInsightsSection
            insights={msg.smartWebInsights}
            groundingSources={msg.groundingSources}
            topic={msg.topic}
          />
        )}

        {!isUser && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleVoice(msg.id, msg.text)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  speakingMsgId === msg.id
                    ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {speakingMsgId === msg.id ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Listen (Voice Note)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onCopy(msg.text, msg.id)}
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-medium border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedId === msg.id ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-500" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium ml-auto">
              <span>{msg.timestamp}</span>
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
        )}

        {isUser && (
          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-500">
            <span>{msg.timestamp}</span>
            <CheckCheck className="w-3.5 h-3.5 text-[#34B7F1]" />
          </div>
        )}
      </div>
    </div>
  );
});

interface AITutorViewProps {
  user: User | null;
  subjects: Subject[];
  initialTopic?: string;
  initialSubject?: string;
  onNavigate: (view: string, extra?: any) => void;
  onRefreshUser?: () => void;
}

export const AITutorView: React.FC<AITutorViewProps> = ({
  user,
  subjects,
  initialTopic,
  initialSubject,
  onNavigate,
  onRefreshUser
}) => {
  // Restore saved conversation history or load default welcome message
  const [messages, setMessages] = useState<AITutorMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(CHAT_STORAGE_KEY) || localStorage.getItem('studynaija_sabitutor_chat_history_v2');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Failed to parse saved chat history:', err);
      }
    }
    return [DEFAULT_WELCOME_MESSAGE];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || 'General');
  const [selectedTopic, setSelectedTopic] = useState(initialTopic || '');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isRefreshingQuota, setIsRefreshingQuota] = useState(false);
  const [speechRate, setSpeechRateState] = useState<number>(() => aiVoice.getSpeechRate());
  const [persona, setPersonaState] = useState<VoicePersona>(() => getVoicePersona());
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [activeMode, setActiveMode] = useState<'all' | 'stem' | 'coding' | 'cybersecurity' | 'unrestricted'>('all');
  const [membershipPromptOpen, setMembershipPromptOpen] = useState(false);
  const isExamLockdownActive = typeof window !== 'undefined' && localStorage.getItem('studynaija_active_exam_in_progress') === 'true';

  // Check if current user has active membership tier (Basic, Medium, Premium, or Tournament GOAT)
  const isMember = user?.premiumPlan === 'basic' || user?.premiumPlan === 'medium' || user?.premiumPlan === 'premium' || !!user?.isGoat;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getStorageKey = () => user?.id ? `studynaija_naija_ai_chat_${user.id}` : CHAT_STORAGE_KEY;

  // Restore user-specific chat history when user changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const key = getStorageKey();
        const saved = localStorage.getItem(key) || localStorage.getItem(CHAT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to restore chat:', err);
      }
    }
  }, [user?.id]);

  const handleSetSpeechRate = (rate: number) => {
    aiVoice.setSpeechRate(rate);
    setSpeechRateState(rate);
  };

  const handleSwitchPersona = (newPersona: VoicePersona) => {
    aiVoice.setPersona(newPersona);
    setPersonaState(newPersona);
  };

  // Quota status state
  const [quota, setQuota] = useState<{
    plan: string;
    dailyLimit: number;
    usedToday: number;
    remainingToday: number;
    isUnlimited: boolean;
  }>({
    plan: user?.premiumPlan || 'free',
    dailyLimit: isMember ? (user?.premiumPlan === 'premium' ? 999999 : 50) : 10,
    usedToday: 0,
    remainingToday: isMember ? (user?.premiumPlan === 'premium' ? 999999 : 50) : 10,
    isUnlimited: user?.premiumPlan === 'premium' || !!user?.isGoat
  });

  const [limitReachedModal, setLimitReachedModal] = useState(false);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        const key = getStorageKey();
        localStorage.setItem(key, JSON.stringify(messages));
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      } catch (err) {
        console.warn('Failed to save chat to localStorage:', err);
      }
    }
  }, [messages, user?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Sync voice state
  useEffect(() => {
    const unsub = aiVoice.onSpeakingChange((isSpeaking) => {
      if (!isSpeaking) {
        setSpeakingMsgId(null);
      }
    });
    return () => {
      unsub();
    };
  }, []);

  // Load quota status on mount
  useEffect(() => {
    api.getAITutorStatus()
      .then(res => {
        if (res) {
          setQuota({
            plan: res.plan,
            dailyLimit: res.dailyLimit,
            usedToday: res.usedToday,
            remainingToday: res.remainingToday,
            isUnlimited: res.isUnlimited
          });
        }
      })
      .catch(() => {});
  }, [user]);

  // Handle prefilled topic from Search Pad or Practice View
  useEffect(() => {
    if (initialTopic && initialTopic !== 'General Curriculum') {
      setSelectedTopic(initialTopic);
      setInputMessage(`Explain the core rules, formulas, and common JAMB traps for: ${initialTopic}`);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialTopic]);

  const handleResetQuota = async () => {
    setIsRefreshingQuota(true);
    try {
      const res = await api.resetAITutorTrial();
      if (res && res.success) {
        setQuota({
          plan: res.plan,
          dailyLimit: res.dailyLimit,
          usedToday: 0,
          remainingToday: res.dailyLimit,
          isUnlimited: res.plan === 'premium'
        });
        setLimitReachedModal(false);
      }
    } catch (err) {
      console.error('Failed to reset quota:', err);
    } finally {
      setIsRefreshingQuota(false);
    }
  };

  const handleClearChat = () => {
    aiVoice.stop();
    setSpeakingMsgId(null);
    const newWelcome: AITutorMessage = {
      id: `msg-welcome-${Date.now()}`,
      sender: 'tutor',
      text: `🇳🇬 **New chat session started with Naija AI!**\n\nWhat subject or topic are we tackling right now? Ask me any calculation, past question, or syllabus concept!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([newWelcome]);
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
      if (user?.id) {
        localStorage.removeItem(getStorageKey());
      }
    } catch {}
    setClearConfirmOpen(false);
  };

  const handleToggleVoice = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      aiVoice.stop();
      setSpeakingMsgId(null);
      return;
    }

    aiVoice.stop();
    // Strip markdown tags and math formulas for clean spoken output
    let cleanSpeech = text
      .replace(/###/g, '')
      .replace(/\*\*/g, '')
      .replace(/\$/g, '')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2')
      .replace(/\\pm/g, 'plus or minus')
      .replace(/\\sqrt\{([^}]+)\}/g, 'square root of $1')
      .replace(/\\implies/g, 'implies that')
      .replace(/\\neq/g, 'not equal to')
      .replace(/\\times/g, 'times')
      .replace(/\\div/g, 'divided by')
      .replace(/\\mathbf\{([^}]+)\}/g, '$1')
      .replace(/⚡/g, '')
      .replace(/•/g, '')
      .trim();

    // Extract core key takeaway sentences
    const sentences = cleanSpeech.split(/(?<=[.!?])\s+/);
    if (sentences.length > 3) {
      cleanSpeech = sentences.slice(0, 3).join(' ') + ' Check the full workings below.';
    }

    setSpeakingMsgId(msgId);
    aiVoice.speakConciseExplanation(cleanSpeech, () => {
      setSpeakingMsgId(null);
    });
  };

  const handleExportChatNotes = () => {
    if (messages.length === 0) return;
    const header = `# StudyNaija AI Study Session Notes\nDate: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}\nStudent: ${user?.name || 'Scholar'}\n\n=======================================================\n\n`;
    const formatted = messages.map(m => {
      const sender = m.sender === 'user' ? `[YOU] (${m.timestamp})` : `[NAIJA AI TUTOR] (${m.timestamp})`;
      return `${sender}\n${m.text}\n\n-------------------------------------------------------\n`;
    }).join('\n');

    const blob = new Blob([header + formatted], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudyNaija_AI_Notes_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const text = customPrompt || inputMessage;
    if (!text.trim() || isLoading) return;

    // Check if Exam Hall Lockdown is active
    if (isExamLockdownActive) {
      const lockMsg: AITutorMessage = {
        id: `tutor-lock-${Date.now()}`,
        sender: 'tutor',
        text: `🔒 **Exam Hall Lockdown Protocol Active!**\n\nNaija AI is temporarily paused while you are sitting a live timed CBT Mock Exam. To protect exam hall integrity and leaderboard rankings, AI explanations are locked until you submit your test. Return to your exam room to finish your paper!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, lockMsg]);
      return;
    }

    // Check if user is attempting unrestricted mode without membership
    if (activeMode === 'unrestricted' && !isMember) {
      setMembershipPromptOpen(true);
      return;
    }

    // Check if free user is already out of quota
    if (!quota.isUnlimited && quota.remainingToday <= 0) {
      setLimitReachedModal(true);
      return;
    }

    const userMsg: AITutorMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      topic: selectedTopic || undefined
    };

    // Update messages state immediately
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Pass chat history and mode so the AI has continuous context and proper tier privileges
      const res = await api.askAITutor({
        message: text.trim(),
        topic: selectedTopic || undefined,
        subjectName: selectedSubject !== 'General' ? selectedSubject : undefined,
        examType: 'JAMB/WAEC',
        chatHistory: updatedMessages.map(m => ({ sender: m.sender, text: m.text })),
        mode: activeMode
      });

      // Update quota status
      setQuota({
        plan: res.plan,
        dailyLimit: res.dailyLimit,
        usedToday: res.usedToday,
        remainingToday: res.remainingToday,
        isUnlimited: res.isUnlimited
      });

      // Award XP for engaging with AI Tutor
      gamification.addXp(15, 'Asked Naija AI tutor question');

      const tutorMsgId = `tutor-${Date.now()}`;
      const tutorMsg: AITutorMessage = {
        id: tutorMsgId,
        sender: 'tutor',
        text: res.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        topic: selectedTopic || undefined,
        groundingSources: res.groundingSources,
        smartWebInsights: res.smartWebInsights
      };

      setMessages(prev => [...prev, tutorMsg]);
    } catch (err: any) {
      if (err?.status === 403 && (err?.message?.includes('UNRESTRICTED') || err?.message?.includes('Unrestricted'))) {
        setMembershipPromptOpen(true);
      } else if (err?.status === 403 || err?.data?.error === 'MEMBERSHIP_LIMIT_REACHED') {
        setLimitReachedModal(true);
        setQuota(prev => ({ ...prev, remainingToday: 0 }));
      } else {
        const errorMsg: AITutorMessage = {
          id: `tutor-err-${Date.now()}`,
          sender: 'tutor',
          text: `⚠️ Naija AI is experiencing high traffic. Please try asking your question again in a moment!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const insertTemplate = (snippet: string) => {
    setInputMessage(prev => (prev.trim() ? `${prev}\n\n${snippet}` : snippet));
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // High-yield prompts tailored by active mode (All Subjects, STEM & Calculations, Coding Lab, Cybersecurity, Unrestricted VIP)
  const promptSuggestions = activeMode === 'unrestricted' ? [
    { label: '🐛 Computer Worm Propagation', text: 'How does a computer worm perform, exploit vulnerabilities, and propagate across networks without human intervention?' },
    { label: '👤 Who is Mia Khalifa?', text: 'Who is Mia Khalifa and what is her career background and public advocacy?' },
    { label: '⚛️ Quantum Computing & Qubits', text: 'Explain quantum computing, qubits, superposition, and entanglement in clear and understandable terms.' },
    { label: '⛓️ Blockchain Consensus (PoW vs PoS)', text: 'Explain how blockchain consensus mechanisms like Proof of Work and Proof of Stake operate under the hood.' },
    { label: '🚀 Full-Stack REST API Architecture', text: 'How do you design a scalable production REST API with JWT authentication, rate limiting, and database connection pooling?' },
    { label: '🧠 Neural Networks & Backprop', text: 'Explain how deep neural networks learn via forward propagation, loss functions, and backpropagation gradient descent.' },
    { label: '🌍 World Geopolitics & African Trade', text: 'Explain the role of the African Continental Free Trade Area (AfCFTA) and its impact on regional commerce.' },
    { label: '🔓 Ask Any Question Without Limits', text: 'Explain the architectural differences between monolithic and microservice systems with real-world enterprise trade-offs.' }
  ] : activeMode === 'stem' ? [
    { label: '📐 Quadratic Almighty Formula', text: 'Solve the quadratic equation 2x^2 + 5x - 3 = 0 using the Almighty Formula with step-by-step workings and discriminant analysis.' },
    { label: '⚡ Newton\'s Laws & Mechanics', text: 'Explain Newton\'s Three Laws of Motion with real-world examples and solve a problem on force and momentum: F = ma.' },
    { label: '🧪 Balancing Redox Equations', text: 'Explain the ion-electron (half-reaction) method for balancing oxidation-reduction chemical equations in acidic medium.' },
    { label: '🧬 DNA Replication vs Transcription', text: 'Explain the difference between DNA replication, transcription, and translation with simple diagrams and key enzymes involved.' },
    { label: '🧮 Calculus: Product & Chain Rule', text: 'Explain how to differentiate functions using the Product Rule and Chain Rule with 2 worked examples.' },
    { label: '💡 Reactivity Series Mnemonic', text: 'Give me a memorable mnemonic for the Reactivity Series of Metals and explain single displacement reactions.' },
    { label: '🔋 Electric Circuits (Ohm\'s Law)', text: 'How do you calculate total resistance and current in combined series-parallel resistor circuits? Give a worked example.' },
    { label: '🎯 High-Yield JAMB Physics Traps', text: 'What are the top 5 tricky examiner traps and calculation mistakes students make in JAMB UTME Physics, and how do I avoid them?' }
  ] : activeMode === 'coding' ? [
    { label: '🐍 Python Binary Search O(log n)', text: 'Write a complete Python implementation of the Binary Search algorithm, explain how it cuts time complexity to O(log n), and compare it with Linear Search.' },
    { label: '🔄 Two Pointers Pattern in Python', text: 'Explain the Two Pointers algorithmic pattern in Python with an example problem, time complexity, and clean code.' },
    { label: '⚡ JavaScript QuickSort Algorithm', text: 'Write an optimized JavaScript implementation of QuickSort algorithm with step-by-step logic and Big-O time and space complexity.' },
    { label: '🗄️ SQL Joins & Window Functions', text: 'Explain INNER, LEFT, RIGHT, and FULL OUTER joins in SQL with visual diagram explanations and real student database queries.' },
    { label: '☕ Java OOP Principles Explained', text: 'Explain the 4 pillars of Object-Oriented Programming (Encapsulation, Inheritance, Polymorphism, Abstraction) in Java with code.' },
    { label: '🌐 HTML & CSS Flexbox vs Grid', text: 'Explain the conceptual and practical differences between CSS Flexbox (1D) and CSS Grid (2D) with clean code layouts.' },
    { label: '🐛 Debug & Optimize My Code', text: 'Here is my code: [paste code]. Please analyze bugs, suggest optimizations, and explain the Big-O complexity improvement.' },
    { label: '💻 Big-O Notation Cheat Sheet', text: 'Explain Big-O time complexity (O(1), O(log n), O(n), O(n log n), O(n²)) with everyday examples and code snippets.' }
  ] : activeMode === 'cybersecurity' ? [
    { label: '💉 SQL Injection: Attack & Prevention', text: 'Explain how SQL Injection (SQLi) works technically, give a vulnerable SQL query example, and provide the exact parameterized query code in Python to completely prevent it.' },
    { label: '🍪 XSS: Cookie Theft & Defense', text: 'How does Cross-Site Scripting (XSS) allow attackers to steal session cookies, and what are the exact sanitization, Content Security Policy (CSP), and HttpOnly cookie steps to prevent it?' },
    { label: '🔑 Password Cracking & Bcrypt Salt', text: 'How do attackers crack passwords using brute force and dictionary tools, and what is the exact Python bcrypt hashing code with salt to stop them?' },
    { label: '🎣 Phishing Portals & 2FA Defense', text: 'How do phishing attacks clone legitimate portals like JAMB or banks, and how can students and developers use 2FA, FIDO2, and domain checks to prevent compromise?' },
    { label: '🌊 DDoS Floods & Anycast Defense', text: 'How do DDoS attacks (SYN floods and UDP amplification) knock websites offline, and how do Anycast CDNs, rate limiting, and SYN cookies prevent them?' },
    { label: '📶 Wi-Fi Security & WPA3-SAE', text: 'How do attackers capture WPA2 handshakes, and why does upgrading to WPA3-SAE with long passphrases completely prevent offline cracking?' },
    { label: '🕵️ MITM Packet Sniffing & TLS 1.3', text: 'How do Man-in-the-Middle (MITM) and ARP poisoning attacks work, and how does HTTPS with HSTS prevent packet sniffing on public Wi-Fi?' },
    { label: '🛡️ Ethical Hacking Career Roadmap', text: 'What is the complete roadmap and methodology for becoming an ethical hacker / penetration tester, and what are the legal boundaries under the Nigerian Cybercrimes Act 2015?' }
  ] : [
    { label: '📐 Quadratic & Almighty Formula', text: 'How do I solve quadratic equations using the Almighty Formula? Show complete step-by-step workings with an example.' },
    { label: '📖 English Concord & Grammatical Rules', text: 'Explain the essential rules of grammatical concord in English (Subject-Verb agreement, Proximity, Indefinite Pronouns) with JAMB past question examples.' },
    { label: '⚡ Newton\'s Laws of Motion', text: 'Explain Newton\'s Three Laws of Motion with real-world examples, mathematical formulas, and calculations.' },
    { label: '🧪 Periodic Table & Chemical Bonding', text: 'Explain electrovalent vs covalent bonding, ionization energy trends across the Periodic Table, and how to balance redox reactions.' },
    { label: '🧬 Genetics & Mendelian Inheritance', text: 'Explain Mendel\'s Laws of Inheritance, monohybrid cross with Punnett squares, and ABO blood group inheritance.' },
    { label: '📊 Price Elasticity of Demand', text: 'Explain Price Elasticity of Demand (Elastic, Inelastic, Unitary) with calculation formulas and JAMB exam shortcuts.' },
    { label: '🏛️ Nigerian 1999 Constitution', text: 'Explain the principle of Separation of Powers and Checks and Balances in the Nigerian 1999 Constitution.' },
    { label: '💡 Study Mnemonics for Sciences', text: 'Give me memorable mnemonics for sciences (Electromagnetic spectrum, Essential amino acids, Reactivity series) and math formulas.' },
    { label: '🎯 5-Question Rapid JAMB Quiz', text: 'Quiz me on 5 high-yield JAMB UTME questions in Mathematics, English, Physics, or Chemistry. Wait for my answers and score me!' },
    { label: '📝 WAEC Summary Writing Secrets', text: 'What are the examiner guidelines and rules for scoring full marks in the WAEC English Summary passage?' }
  ];

  return (
    <div id="ai-tutor-view" className="w-full max-w-5xl mx-auto pb-12 transition-all">

      {/* ========================================================================= */}
      {/* WHATSAPP-STYLE EXPANSIVE CHAT CARD */}
      {/* ========================================================================= */}
      <div className="bg-[#efeae2] rounded-3xl border border-slate-300/80 shadow-2xl overflow-hidden flex flex-col min-h-[680px] h-[calc(100vh-170px)] max-h-[860px]">
        
        {/* ========================================================================= */}
        {/* WHATSAPP GREEN HEADER BAR */}
        {/* ========================================================================= */}
        <div className="bg-[#075e54] text-white px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between shadow-md shrink-0 z-10">
          
          {/* Left: Avatar, Name & Live Status */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-800 border-2 border-emerald-400/40 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-5 h-5 text-emerald-300" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#075e54]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-extrabold text-base sm:text-lg text-white font-['Outfit'] leading-tight">
                  Naija AI
                </h2>
                <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  24/7 CBT Tutor
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-100/90 font-medium">
                {isLoading ? (
                  <span className="flex items-center gap-1 text-emerald-200 animate-pulse font-bold">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    typing a detailed solution...
                  </span>
                ) : (
                  <span>online • JAMB UTME, WAEC SSCE & University GST</span>
                )}
              </p>
            </div>
          </div>

          {/* Right: Voice Settings, Quota & Actions */}
          <div className="flex items-center gap-2">
            
            {/* Voice Persona Selector */}
            <div className="hidden sm:inline-flex items-center rounded-xl bg-emerald-950/40 p-0.5 border border-emerald-600/40 text-[11px]">
              <button
                type="button"
                onClick={() => handleSwitchPersona('female')}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  persona === 'female'
                    ? 'bg-[#128c7e] text-white shadow-2xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
                title="Switch to Sarah (Mid-20s American Lady Voice - en-US)"
              >
                🇺🇸 Sarah (Mid-20s US)
              </button>
              <button
                type="button"
                onClick={() => handleSwitchPersona('male')}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  persona === 'male'
                    ? 'bg-[#128c7e] text-white shadow-2xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
                title="Switch to Chidi Voice"
              >
                👨🏾 Chidi
              </button>
            </div>

            {/* Voice Speed Toggle */}
            <div className="hidden md:flex items-center gap-1 bg-emerald-950/40 px-2 py-1 rounded-xl border border-emerald-600/40 text-[11px]">
              <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
              {([1.0, 1.25, 1.5] as const).map(rate => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handleSetSpeechRate(rate)}
                  className={`px-1.5 py-0.2 rounded font-bold cursor-pointer transition-colors ${
                    speechRate === rate
                      ? 'bg-emerald-400 text-emerald-950 font-black'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Active Speech Indicator & Stop */}
            {speakingMsgId && (
              <button
                onClick={() => {
                  aiVoice.stop();
                  setSpeakingMsgId(null);
                }}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs animate-pulse"
                title="Stop Speaking"
              >
                <Square className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">Stop Audio</span>
              </button>
            )}

            {/* Unrestricted Mode Membership Indicator & CTA */}
            {isMember ? (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/70 border border-purple-400/40 text-[11px] font-bold">
                <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span className="text-purple-200">Unrestricted AI</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] uppercase border border-emerald-400/30 font-black">UNLOCKED</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setMembershipPromptOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/70 border border-amber-500/40 text-[11px] font-bold hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300">Unrestricted Mode</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] uppercase border border-amber-500/30 font-black">MEMBERSHIP ONLY</span>
              </button>
            )}

            {/* Quota Badge */}
            {quota.isUnlimited ? (
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-900/60 border border-purple-400/40 text-purple-200 text-xs font-bold">
                <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Unlimited</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-emerald-950/50 px-2.5 py-1 rounded-xl border border-emerald-600/40 text-xs font-bold">
                <span className="text-emerald-200 text-[11px] hidden sm:inline">Daily:</span>
                <span className={quota.remainingToday > 0 ? 'text-white' : 'text-rose-300 font-extrabold'}>
                  {quota.remainingToday}/{quota.dailyLimit}
                </span>
                <button
                  onClick={handleResetQuota}
                  disabled={isRefreshingQuota}
                  title="Reset daily trial quota"
                  className="text-emerald-300 hover:text-white transition-colors cursor-pointer ml-0.5"
                >
                  <RotateCcw className={`w-3 h-3 ${isRefreshingQuota ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}

            {/* Export Chat Notes */}
            {messages.length > 1 && (
              <button
                onClick={handleExportChatNotes}
                title="Export & Download Chat Notes (Markdown)"
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-700/60 rounded-xl transition-all cursor-pointer flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* Clear Chat Button */}
            {messages.length > 1 && (
              <button
                onClick={() => setClearConfirmOpen(true)}
                title="Clear WhatsApp chat"
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-700/60 rounded-xl transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>

        {/* ========================================================================= */}
        {/* SPECIALTY MODE SELECTOR BAR (ALL SUBJECTS, STEM, CODING, CYBERSECURITY, UNRESTRICTED VIP) */}
        {/* ========================================================================= */}
        <div className="bg-[#054c44] border-b border-emerald-800/80 px-3 sm:px-5 py-2 flex items-center justify-between gap-2 overflow-x-auto text-xs shrink-0 scrollbar-none shadow-inner">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider hidden sm:inline mr-1">
              Active Focus:
            </span>
            <button
              type="button"
              onClick={() => setActiveMode('all')}
              className={`px-3 py-1 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'all'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'bg-emerald-950/60 text-emerald-200 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-emerald-300" />
              <span>🎓 All Subjects</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('stem')}
              className={`px-3 py-1 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'stem'
                  ? 'bg-cyan-600 text-white shadow-xs font-bold'
                  : 'bg-emerald-950/60 text-emerald-200 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-cyan-300" />
              <span>🧪 STEM & Calculations</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('coding')}
              className={`px-3 py-1 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'coding'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'bg-emerald-950/60 text-emerald-200 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-amber-300" />
              <span>💻 Coding & CS Lab</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('cybersecurity')}
              className={`px-3 py-1 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'cybersecurity'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-emerald-950/60 text-emerald-200 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
              <span>🛡️ Hacking & Defense</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (isMember) {
                  setActiveMode('unrestricted');
                } else {
                  setMembershipPromptOpen(true);
                }
              }}
              className={`px-3 py-1 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'unrestricted'
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white shadow-md ring-2 ring-purple-300 font-black'
                  : isMember
                    ? 'bg-purple-950/70 text-purple-200 hover:text-white hover:bg-purple-900/80 border border-purple-500/40'
                    : 'bg-slate-900/90 text-amber-300 hover:text-amber-200 hover:bg-slate-850 border border-amber-500/50'
              }`}
            >
              {isMember ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  <span>👑 Unrestricted AI (VIP)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>🔓 Unrestricted Mode</span>
                  <span className="px-1 py-0.2 bg-amber-500/30 text-amber-300 rounded text-[9px] uppercase font-black">PRO</span>
                </>
              )}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-emerald-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>24/7 CBT Syllabus Precision</span>
          </div>
        </div>

        {/* Live Exam Hall Lockdown Alert Banner */}
        {isExamLockdownActive && (
          <div className="bg-rose-950/95 border-b border-rose-500/80 px-4 py-3 flex items-center justify-between gap-3 text-xs text-rose-200 animate-in fade-in shrink-0 shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-600/30 text-rose-300 flex items-center justify-center shrink-0 border border-rose-500/40">
                <Lock className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <div className="font-extrabold text-white text-xs">Exam Hall Lockdown Active</div>
                <div className="text-[11px] text-rose-200">Naija AI is locked while your CBT Mock Exam clock is ticking. Submit your exam to unlock AI assistance.</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('mock-exam')}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-xs shrink-0 cursor-pointer shadow-md transition-all hover:scale-105"
            >
              Return to Exam →
            </button>
          </div>
        )}

        {/* Clear Chat Confirmation Banner */}
        {clearConfirmOpen && (
          <div className="bg-rose-50 border-b border-rose-200 p-2.5 px-4 flex items-center justify-between gap-3 text-xs text-rose-900 animate-in fade-in shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Are you sure you want to clear this WhatsApp conversation with Naija AI?</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleClearChat}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setClearConfirmOpen(false)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* WHATSAPP CHAT CANVAS WALLPAPER & SCROLL CONTAINER */}
        {/* ========================================================================= */}
        <div 
          className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5 scrollbar-thin relative"
          style={{
            backgroundImage: `radial-gradient(#075e54 0.45px, transparent 0.45px), radial-gradient(#128c7e 0.45px, #efeae2 0.45px)`,
            backgroundSize: '18px 18px',
            backgroundPosition: '0 0, 9px 9px'
          }}
        >
          {/* WhatsApp Date Chip */}
          <div className="flex justify-center my-1">
            <span className="px-3 py-1 rounded-lg bg-white/90 shadow-2xs border border-black/5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Today • Naija AI Academic Chat
            </span>
          </div>

          {/* Active Context Memory Notice */}
          {messages.filter(m => m.sender === 'user').length > 0 && (
            <div className="flex justify-center">
              <span className="px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-900 text-[11px] font-semibold flex items-center gap-1.5 border border-emerald-300 shadow-2xs">
                <Brain className="w-3 h-3 text-emerald-700 shrink-0" />
                <span>Naija AI is remembering previous questions in this thread</span>
              </span>
            </div>
          )}

          {/* Messages Loop */}
          {messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              msg={msg}
              speakingMsgId={speakingMsgId}
              copiedId={copiedId}
              onToggleVoice={handleToggleVoice}
              onCopy={copyToClipboard}
            />
          ))}

          {/* Loading Bubble */}
          {isLoading && (
            <div className="flex items-start gap-2 animate-in fade-in">
              <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 text-xs text-slate-700 border border-slate-200/90 shadow-xs flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                <span className="font-semibold text-emerald-950">
                  Naija AI is formulating step-by-step calculations with syllabus precision...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ========================================================================= */}
        {/* QUICK SYLLABUS ASK CHIPS (WHATSAPP QUICK REPLIES) */}
        {/* ========================================================================= */}
        <div className="px-3 py-1.5 bg-[#f0f2f5] border-t border-slate-200/80 overflow-x-auto flex items-center gap-1.5 scrollbar-none shrink-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" /> Quick Ask:
          </span>
          {promptSuggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(item.text)}
              disabled={isLoading || (!quota.isUnlimited && quota.remainingToday <= 0)}
              className="text-[11px] font-medium px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 border border-slate-200 rounded-lg transition-all shrink-0 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* WHATSAPP BOTTOM INPUT DOCK (BIG, EXPANSIVE & COMFORTABLE) */}
        {/* ========================================================================= */}
        <div className="p-2.5 sm:p-4 bg-[#f0f2f5] border-t border-slate-300/80 shrink-0 space-y-2">
          
          {/* Quick Math Symbols, Code & Cybersecurity Snippet Bar */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5 text-xs scrollbar-none">
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Mode-specific Quick Inserts */}
              {activeMode === 'stem' ? (
                <div className="flex items-center gap-1 shrink-0 bg-cyan-500/10 p-0.5 rounded-lg border border-cyan-500/30">
                  <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider px-1 flex items-center gap-1">
                    <Calculator className="w-3 h-3 text-cyan-600" /> STEM Tools:
                  </span>
                  <button
                    type="button"
                    onClick={() => insertTemplate('Solve with full step-by-step mathematical working and formulas: ')}
                    className="px-2 py-0.5 bg-white hover:bg-cyan-100 text-cyan-900 font-bold rounded-md border border-cyan-300 transition-colors text-[10px] cursor-pointer shadow-2xs"
                  >
                    📐 Step-by-Step Workings
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate('Give me a memorable mnemonic and visual memory trick to memorize: ')}
                    className="px-2 py-0.5 bg-white hover:bg-cyan-100 text-cyan-900 font-bold rounded-md border border-cyan-300 transition-colors text-[10px] cursor-pointer shadow-2xs"
                  >
                    💡 Study Mnemonic
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate('Quiz me on 3 high-yield JAMB UTME calculation questions for: ')}
                    className="px-2 py-0.5 bg-white hover:bg-cyan-100 text-cyan-900 font-bold rounded-md border border-cyan-300 transition-colors text-[10px] cursor-pointer shadow-2xs"
                  >
                    🎯 Practice Quiz
                  </button>
                </div>
              ) : activeMode === 'coding' ? (
                <div className="flex items-center gap-1 shrink-0 bg-amber-500/10 p-0.5 rounded-lg border border-amber-500/30">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider px-1 flex items-center gap-1">
                    <Code className="w-3 h-3 text-amber-600" /> Coding:
                  </span>
                  <button
                    type="button"
                    onClick={() => insertTemplate('Write a complete, well-commented Python implementation with time complexity analysis for: ')}
                    className="px-2 py-0.5 bg-white hover:bg-amber-100 text-amber-900 font-bold rounded-md border border-amber-300 transition-colors text-[10px] cursor-pointer shadow-2xs"
                  >
                    🐍 Python
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate('Write clean JavaScript/TypeScript code with test cases for: ')}
                    className="px-2 py-0.5 bg-white hover:bg-amber-100 text-amber-900 font-bold rounded-md border border-amber-300 transition-colors text-[10px] cursor-pointer shadow-2xs"
                  >
                    ⚡ JS / TS
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate('Write a secure, production-grade SQL query with prepared statements and join logic for: ')}
                    className="px-2 py-0.5 bg-white hover:bg-amber-100 text-amber-900 font-bold rounded-md border border-amber-300 transition-colors text-[10px] cursor-pointer shadow-2xs"
                  >
                    🗄️ SQL
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate('Analyze the time and space Big-O complexity and suggest optimizations for this code:\n\n')}
                    className="px-2 py-0.5 bg-white hover:bg-amber-100 text-amber-900 font-bold rounded-md border border-amber-300 transition-colors text-[10px] cursor-pointer shadow-2xs"
                  >
                    🐛 Debug & Optimize
                  </button>
                </div>
              ) : activeMode === 'cybersecurity' ? (
                <div className="flex items-center gap-1 shrink-0 bg-rose-500/10 p-0.5 rounded-lg border border-rose-500/30">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider px-1 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-rose-600" /> Security:
                  </span>
                  <button
                    type="button"
                    onClick={() => insertTemplate('Explain the technical mechanics of SQL Injection (SQLi) and write the exact parameterized queries in Python to prevent it.')}
                    className="px-2 py-0.5 bg-white hover:bg-rose-100 text-rose-900 font-bold rounded-md border border-rose-300 transition-colors text-[10px] cursor-pointer shadow-2xs"
                  >
                    💉 SQLi Defense
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate('Explain how Cross-Site Scripting (XSS) works and how to prevent it using Content Security Policy (CSP) and sanitization.')}
                    className="px-2 py-0.5 bg-white hover:bg-rose-100 text-rose-900 font-bold rounded-md border border-rose-300 transition-colors text-[10px] cursor-pointer shadow-2xs"
                  >
                    🍪 XSS Defense
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate('How do attackers brute-force passwords, and write Python bcrypt salt hashing code to prevent cracking.')}
                    className="px-2 py-0.5 bg-white hover:bg-rose-100 text-rose-900 font-bold rounded-md border border-rose-300 transition-colors text-[10px] cursor-pointer shadow-2xs"
                  >
                    🔑 Bcrypt Hashing
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate('How do DDoS botnets flood servers, and what are the exact rate-limiting and Cloudflare Anycast steps to prevent downtime?')}
                    className="px-2 py-0.5 bg-white hover:bg-rose-100 text-rose-900 font-bold rounded-md border border-rose-300 transition-colors text-[10px] cursor-pointer shadow-2xs"
                  >
                    🌊 DDoS Defense
                  </button>
                </div>
              ) : activeMode === 'unrestricted' ? (
                <div className="flex items-center gap-1 shrink-0 bg-purple-500/10 p-0.5 rounded-lg border border-purple-500/30">
                  <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider px-1 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-purple-600" /> VIP AI:
                  </span>
                  <button
                    type="button"
                    onClick={() => insertTemplate('How does a computer worm exploit network ports and propagate autonomously without human interaction?')}
                    className="px-2 py-0.5 bg-white hover:bg-purple-100 text-purple-900 font-bold rounded-md border border-purple-300 transition-colors text-[10px] cursor-pointer shadow-2xs"
                  >
                    🐛 Worm Mechanics
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate('Who is ')}
                    className="px-2 py-0.5 bg-white hover:bg-purple-100 text-purple-900 font-bold rounded-md border border-purple-300 transition-colors text-[10px] cursor-pointer shadow-2xs"
                  >
                    👤 Biography
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate('Explain the physical mechanics of quantum computing, qubits, and superposition.')}
                    className="px-2 py-0.5 bg-white hover:bg-purple-100 text-purple-900 font-bold rounded-md border border-purple-300 transition-colors text-[10px] cursor-pointer shadow-2xs"
                  >
                    ⚛️ Quantum
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTemplate('Explain Proof of Work (PoW) vs Proof of Stake (PoS) consensus in blockchain architecture.')}
                    className="px-2 py-0.5 bg-white hover:bg-purple-100 text-purple-900 font-bold rounded-md border border-purple-300 transition-colors text-[10px] cursor-pointer shadow-2xs"
                  >
                    ⛓️ Blockchain
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <Calculator className="w-3 h-3 text-slate-500" /> Math:
                  </span>
                  {['x²', 'x³', '√', 'π', 'θ', '±', '÷', '×', 'Δ', 'α', 'β', '→', '½', '≠', '≤', '≥', '∫'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setInputMessage(prev => prev + s);
                        textareaRef.current?.focus();
                      }}
                      className="px-2 py-0.5 bg-white hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 font-mono font-bold rounded-md border border-slate-200 transition-colors shrink-0 cursor-pointer shadow-2xs text-[11px]"
                      title={`Insert ${s}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subject Selector & Expand Toggle */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
              >
                <option value="General">All Subjects</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setIsInputExpanded(!isInputExpanded)}
                className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-300 cursor-pointer shadow-2xs"
              >
                {isInputExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                <span>{isInputExpanded ? 'Standard Box' : 'Large Workspace'}</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Text Input Capsule */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            {/* Input Capsule Box */}
            <div className="flex-1 bg-white rounded-2xl sm:rounded-3xl border border-slate-300 shadow-sm p-1.5 sm:p-2 flex items-end gap-2 focus-within:border-[#00a884] focus-within:ring-2 focus-within:ring-[#00a884]/20 transition-all">
              
              {/* Insert Question Template quick icon */}
              <button
                type="button"
                onClick={() => insertTemplate('Solve step-by-step:\n')}
                className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                title="Insert Step-by-Step Question Template"
              >
                <FileText className="w-4 h-4" />
              </button>

              {/* Textarea */}
              <textarea
                id="ai-tutor-message-input"
                ref={textareaRef}
                rows={isInputExpanded ? 6 : 2}
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  !quota.isUnlimited && quota.remainingToday <= 0
                    ? "Daily questions finished. Upgrade to continue asking Naija AI..."
                    : "Message Naija AI... (e.g. 'Solve 3x² - 5x + 2 = 0', or paste a past question)"
                }
                disabled={isLoading || (!quota.isUnlimited && quota.remainingToday <= 0)}
                className={`w-full ${
                  isInputExpanded ? 'min-h-[140px]' : 'min-h-[46px] max-h-[160px]'
                } p-1.5 text-xs sm:text-sm bg-transparent text-slate-900 outline-none resize-y leading-relaxed placeholder:text-slate-400`}
              />

              {/* Clear draft */}
              {inputMessage.trim() && (
                <button
                  type="button"
                  onClick={() => setInputMessage('')}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-full transition-colors cursor-pointer shrink-0"
                  title="Clear text"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Circular WhatsApp Send Button */}
            <button
              id="send-ai-tutor-btn"
              type="submit"
              disabled={!inputMessage.trim() || isLoading || (!quota.isUnlimited && quota.remainingToday <= 0)}
              className="w-12 h-12 rounded-full bg-[#00a884] hover:bg-[#008f6f] active:scale-95 text-white flex items-center justify-center shadow-md transition-all disabled:opacity-40 disabled:scale-100 cursor-pointer shrink-0"
              title="Send to Naija AI (Enter)"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MEMBERSHIP LIMIT MODAL */}
      {/* ========================================================================= */}
      {limitReachedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-amber-300 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-center">
            
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 px-3 py-1 bg-amber-50 rounded-full border border-amber-200">
                Daily Limit Reached
              </span>
              <h3 className="text-xl font-black text-slate-900 font-['Outfit']">
                Upgrade to Keep Asking Naija AI 🚀
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You’ve used your questions for today. 
                Our membership plans unlock <strong>Unlimited 24/7 AI tutoring</strong>, full step-by-step workings, and memory continuity!
              </p>
            </div>

            {/* Plan Comparison Pills */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Basic Tier (₦1,500/mo)</span>
                <span className="text-emerald-700 font-extrabold">30 questions/day</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Medium Tier (₦3,000/mo)</span>
                <span className="text-emerald-700 font-extrabold">75 questions/day</span>
              </div>
              <div className="flex items-center justify-between bg-purple-50 p-1.5 rounded-lg border border-purple-200">
                <span className="font-extrabold text-purple-900 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-purple-600" /> Premium VIP
                </span>
                <span className="text-purple-700 font-black">Unlimited + Unrestricted Mode</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setLimitReachedModal(false);
                  onNavigate('premium');
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Choose a Membership Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleResetQuota}
                disabled={isRefreshingQuota}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isRefreshingQuota ? 'animate-spin' : ''}`} />
                <span>Reset Daily Session Allowance</span>
              </button>

              <button
                onClick={() => setLimitReachedModal(false)}
                className="w-full py-1 text-xs text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* UNRESTRICTED MODE MEMBERSHIP REQUIRED MODAL */}
      {/* ========================================================================= */}
      {membershipPromptOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-purple-500/50 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-purple-900/40">
              <Crown className="w-9 h-9 text-amber-200 fill-amber-200" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/30">
                Membership Exclusive
              </span>
              <h3 className="text-xl font-black text-white font-['Outfit']">
                Unlock Unrestricted AI Mode 👑
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Unrestricted AI Mode is reserved for active <strong>StudyNaija Members</strong>. Ask ANY question across all subjects, general knowledge, pop culture, complex coding labs, and system architecture with zero boundaries!
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-purple-500/30 text-left space-y-2 text-xs text-slate-200">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
                <span>Ask ANY question without school curriculum boundaries</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
                <span>Deep technical problem-solving & architecture reviews</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
                <span>Continuous multi-turn conversation memory & zero quotas</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setMembershipPromptOpen(false);
                  onNavigate('premium');
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>Unlock Membership & Unrestricted Mode</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setMembershipPromptOpen(false)}
                className="w-full py-2 text-xs text-slate-400 hover:text-white font-bold cursor-pointer transition-colors"
              >
                Continue in Standard Syllabus Mode
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
