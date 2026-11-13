import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Check, 
  X, 
  Sun, 
  Sunset, 
  Moon, 
  Flame, 
  Filter, 
  BarChart2, 
  GraduationCap, 
  Edit3,
  Bookmark,
  Download,
  WifiOff,
  RefreshCw,
  Database
} from 'lucide-react';
import { User, Subject } from '../types';
import { INITIAL_SUBJECTS } from '../mockData';
import { authStorage } from '../services/api';
import { CachedStudyPathRecord, studyPathCacheManager } from '../utils/studyPathCache';
import confetti from 'canvas-confetti';

export interface ScheduledTopicTask {
  id: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  customTime?: string; // e.g. "09:00 AM"
  targetQuestions: number;
  durationMinutes: number;
  notes?: string;
  priority: 'high' | 'medium' | 'normal';
  completed: boolean;
  completedAt?: string;
  scheduledDate: string; // YYYY-MM-DD
}

interface DailyStudyPlannerProps {
  user: User | null;
  subjects?: Subject[];
  onNavigate: (view: string, extra?: any) => void;
  onOpenAITutor?: (topic?: string, subjectName?: string) => void;
}

// Popular syllabus topics per subject for quick auto-fill
const SYLLABUS_TOPIC_PRESETS: Record<string, string[]> = {
  mathematics: [
    'Quadratic Equations & Polynomials',
    'Indices, Logarithms & Surds',
    'Trigonometry & Bearing',
    'Differentiation & Integration (Calculus)',
    'Matrices & Determinants',
    'Coordinate Geometry',
    'Probability & Statistics',
    'Sequences and Series (AP & GP)'
  ],
  english: [
    'Concord & Subject-Verb Agreement',
    'Synonyms & Antonyms (Lexis & Structure)',
    'Idioms & Figurative Expressions',
    'Vowels, Consonants & Rhyme Schemes (Oral English)',
    'Sentence Correction & Question Tags',
    'Comprehension Passages & Inference'
  ],
  physics: [
    'Electric Fields, Current & Resistance',
    'Wave Motion, Sound & Light Optics',
    'Newton Laws of Motion & Momentum',
    'Gravitational Fields & Planetary Motion',
    'Thermodynamics & Heat Energy',
    'Radioactivity & Nuclear Energy',
    'Electromagnetism & Induction'
  ],
  chemistry: [
    'Periodic Table & Atomic Structure',
    'Acids, Bases, Salts & Neutralization',
    'Chemical Bonding & Hybridization',
    'Organic Chemistry (Hydrocarbons, Alkanes, Alkanols)',
    'Stoichiometry & Mole Concept',
    'Electrochemistry & Electrolysis',
    'Rates of Reactions & Equilibrium'
  ],
  biology: [
    'Cell Structure & Cell Division (Mitosis/Meiosis)',
    'Ecology & Nigerian Biomes',
    'Genetics, Heredity & DNA',
    'Photosynthesis, Respiration & Enzymes',
    'Circulatory & Excretory Systems in Mammals',
    'Reproductive System in Plants and Animals',
    'Evolution & Natural Selection'
  ],
  economics: [
    'Theory of Consumer Behavior & Utility',
    'Demand, Supply & Price Elasticity',
    'National Income Accounting (GDP & GNP)',
    'Inflation & Unemployment in Nigeria',
    'Money, Banking & Financial Institutions',
    'International Trade & Balance of Payments',
    'Public Finance & Taxation'
  ],
  government: [
    'Basic Concepts of Government & Rule of Law',
    'Arms of Government (Executive, Legislative, Judiciary)',
    'Pre-Colonial Administration in Nigeria (Hausa, Yoruba, Igbo)',
    'Constitutional Development in Nigeria (1922-1999)',
    'Federalism & Revenue Allocation in Nigeria',
    'Foreign Policy & International Organizations (ECOWAS, AU, UN)'
  ],
  literature: [
    'Drama: Literary Devices & Themes',
    'Poetry: Figures of Speech & Stanza Analysis',
    'Prose: African and Non-African Novels',
    'Characterization and Plot Devices'
  ]
};

export const DailyStudyPlanner: React.FC<DailyStudyPlannerProps> = ({
  user,
  subjects = INITIAL_SUBJECTS,
  onNavigate,
  onOpenAITutor
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const storageKey = `studynaija_daily_planner_${user?.id || 'guest'}`;

  // Load saved schedule from localStorage
  const [tasks, setTasks] = useState<ScheduledTopicTask[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}

    // Initial default scheduled topics for today
    return [
      {
        id: 'task-def-1',
        subjectId: 'mathematics',
        subjectName: 'Mathematics',
        topic: 'Quadratic Equations & Polynomials',
        timeSlot: 'morning',
        customTime: '08:30 AM',
        targetQuestions: 15,
        durationMinutes: 40,
        notes: 'Practice factorisation and quadratic formula questions',
        priority: 'high',
        completed: false,
        scheduledDate: todayStr
      },
      {
        id: 'task-def-2',
        subjectId: 'english',
        subjectName: 'English Language',
        topic: 'Concord & Subject-Verb Agreement',
        timeSlot: 'morning',
        customTime: '10:30 AM',
        targetQuestions: 15,
        durationMinutes: 30,
        notes: 'Rules of proximity and collective nouns',
        priority: 'high',
        completed: false,
        scheduledDate: todayStr
      },
      {
        id: 'task-def-3',
        subjectId: 'physics',
        subjectName: 'Physics',
        topic: 'Electric Fields, Current & Resistance',
        timeSlot: 'afternoon',
        customTime: '02:00 PM',
        targetQuestions: 12,
        durationMinutes: 45,
        notes: 'Ohm law and series/parallel resistor combinations',
        priority: 'medium',
        completed: false,
        scheduledDate: todayStr
      },
      {
        id: 'task-def-4',
        subjectId: 'chemistry',
        subjectName: 'Chemistry',
        topic: 'Periodic Table & Atomic Structure',
        timeSlot: 'evening',
        customTime: '06:30 PM',
        targetQuestions: 15,
        durationMinutes: 35,
        notes: 'Electronegativity trends and ionization energy',
        priority: 'normal',
        completed: false,
        scheduledDate: todayStr
      }
    ];
  });

  // Modal / Form state for scheduling a new topic
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubjectId, setFormSubjectId] = useState<string>('mathematics');
  const [formTopic, setFormTopic] = useState<string>('');
  const [formTimeSlot, setFormTimeSlot] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  const [formCustomTime, setFormCustomTime] = useState<string>('09:00 AM');
  const [formTargetQuestions, setFormTargetQuestions] = useState<number>(15);
  const [formDurationMinutes, setFormDurationMinutes] = useState<number>(35);
  const [formPriority, setFormPriority] = useState<'high' | 'medium' | 'normal'>('high');
  const [formNotes, setFormNotes] = useState<string>('');

  // Filter state (all | pending | completed)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Service Worker personalized study path offline cache state
  const [cachedPathRecord, setCachedPathRecord] = useState<CachedStudyPathRecord | null>(null);
  const [isCachingPath, setIsCachingPath] = useState<boolean>(false);

  const loadCachedPathStatus = async () => {
    const rec = await studyPathCacheManager.getCachedStudyPath(user);
    setCachedPathRecord(rec);
  };

  useEffect(() => {
    void loadCachedPathStatus();
    const handleCacheUpdate = () => {
      void loadCachedPathStatus();
    };
    window.addEventListener('studynaija_study_path_cache_updated', handleCacheUpdate);
    return () => {
      window.removeEventListener('studynaija_study_path_cache_updated', handleCacheUpdate);
    };
  }, [user]);

  const handleDownloadOfflinePath = async () => {
    setIsCachingPath(true);
    try {
      const scheduledSubjects = Array.from(
        new Set<string>(tasks.map(t => t.subjectId).filter((id): id is string => Boolean(id)))
      );
      const rec = await studyPathCacheManager.downloadPersonalizedStudyPath(
        user,
        scheduledSubjects,
        authStorage.getToken()
      );
      setCachedPathRecord(rec);
    } finally {
      setIsCachingPath(false);
    }
  };

  const handleRemoveOfflinePath = async () => {
    await studyPathCacheManager.removeCachedStudyPath(user);
    setCachedPathRecord(null);
  };

  // Persist tasks whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    } catch {}
  }, [tasks, storageKey]);

  // Automatically mark task complete when student finishes practice on that topic
  useEffect(() => {
    const handlePracticeCompleted = (e: any) => {
      const detail = e.detail;
      if (detail && detail.subjectId) {
        setTasks(prev => {
          let updated = false;
          const next = prev.map(t => {
            if (
              t.scheduledDate === todayStr &&
              !t.completed &&
              t.subjectId === detail.subjectId &&
              (!detail.topic || t.topic.toLowerCase().includes(detail.topic.toLowerCase()))
            ) {
              updated = true;
              return {
                ...t,
                completed: true,
                completedAt: new Date().toISOString()
              };
            }
            return t;
          });
          if (updated) {
            try {
              confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
            } catch {}
          }
          return next;
        });
      }
    };

    window.addEventListener('studynaija_practice_completed', handlePracticeCompleted);
    return () => {
      window.removeEventListener('studynaija_practice_completed', handlePracticeCompleted);
    };
  }, [todayStr]);

  // Tasks for the selected date
  const dateTasks = tasks.filter(t => t.scheduledDate === selectedDate);
  const completedCount = dateTasks.filter(t => t.completed).length;
  const totalCount = dateTasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered view
  const displayedTasks = dateTasks.filter(t => {
    if (statusFilter === 'pending') return !t.completed;
    if (statusFilter === 'completed') return t.completed;
    return true;
  });

  const handleToggleComplete = (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            try {
              confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
            } catch {}
          }
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTopic.trim()) return;

    const matchedSubject = subjects.find(s => s.id === formSubjectId);
    const subjectName = matchedSubject ? matchedSubject.name : formSubjectId.toUpperCase();

    const newTask: ScheduledTopicTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      subjectId: formSubjectId,
      subjectName,
      topic: formTopic.trim(),
      timeSlot: formTimeSlot,
      customTime: formCustomTime.trim() || undefined,
      targetQuestions: formTargetQuestions,
      durationMinutes: formDurationMinutes,
      priority: formPriority,
      notes: formNotes.trim() || undefined,
      completed: false,
      scheduledDate: selectedDate
    };

    setTasks(prev => [...prev, newTask]);
    setIsModalOpen(false);
    setFormTopic('');
    setFormNotes('');
  };

  // Preset combo loaders
  const loadPresetCombo = (comboType: 'science' | 'commercial' | 'art') => {
    let presetList: ScheduledTopicTask[] = [];

    if (comboType === 'science') {
      presetList = [
        {
          id: `task-sci-1-${Date.now()}`,
          subjectId: 'mathematics',
          subjectName: 'Mathematics',
          topic: 'Calculus Fundamentals & Differentiation',
          timeSlot: 'morning',
          customTime: '08:00 AM',
          targetQuestions: 15,
          durationMinutes: 45,
          priority: 'high',
          completed: false,
          scheduledDate: selectedDate
        },
        {
          id: `task-sci-2-${Date.now()}`,
          subjectId: 'english',
          subjectName: 'English Language',
          topic: 'Oral English & Stress Patterns',
          timeSlot: 'morning',
          customTime: '10:30 AM',
          targetQuestions: 15,
          durationMinutes: 30,
          priority: 'high',
          completed: false,
          scheduledDate: selectedDate
        },
        {
          id: `task-sci-3-${Date.now()}`,
          subjectId: 'physics',
          subjectName: 'Physics',
          topic: 'Newton Laws of Motion & Momentum',
          timeSlot: 'afternoon',
          customTime: '01:30 PM',
          targetQuestions: 15,
          durationMinutes: 40,
          priority: 'medium',
          completed: false,
          scheduledDate: selectedDate
        },
        {
          id: `task-sci-4-${Date.now()}`,
          subjectId: 'chemistry',
          subjectName: 'Chemistry',
          topic: 'Organic Chemistry & Hydrocarbons',
          timeSlot: 'evening',
          customTime: '05:30 PM',
          targetQuestions: 15,
          durationMinutes: 40,
          priority: 'high',
          completed: false,
          scheduledDate: selectedDate
        }
      ];
    } else if (comboType === 'commercial') {
      presetList = [
        {
          id: `task-comm-1-${Date.now()}`,
          subjectId: 'economics',
          subjectName: 'Economics',
          topic: 'Demand, Supply & Price Elasticity',
          timeSlot: 'morning',
          customTime: '08:30 AM',
          targetQuestions: 15,
          durationMinutes: 40,
          priority: 'high',
          completed: false,
          scheduledDate: selectedDate
        },
        {
          id: `task-comm-2-${Date.now()}`,
          subjectId: 'english',
          subjectName: 'English Language',
          topic: 'Idioms & Figurative Expressions',
          timeSlot: 'morning',
          customTime: '10:45 AM',
          targetQuestions: 15,
          durationMinutes: 30,
          priority: 'high',
          completed: false,
          scheduledDate: selectedDate
        },
        {
          id: `task-comm-3-${Date.now()}`,
          subjectId: 'mathematics',
          subjectName: 'Mathematics',
          topic: 'Simple Interest & Compound Percentage',
          timeSlot: 'afternoon',
          customTime: '02:00 PM',
          targetQuestions: 15,
          durationMinutes: 40,
          priority: 'medium',
          completed: false,
          scheduledDate: selectedDate
        },
        {
          id: `task-comm-4-${Date.now()}`,
          subjectId: 'commerce',
          subjectName: 'Commerce',
          topic: 'Trade, Advertising & Warehousing',
          timeSlot: 'evening',
          customTime: '06:00 PM',
          targetQuestions: 15,
          durationMinutes: 35,
          priority: 'normal',
          completed: false,
          scheduledDate: selectedDate
        }
      ];
    } else {
      presetList = [
        {
          id: `task-art-1-${Date.now()}`,
          subjectId: 'literature',
          subjectName: 'Literature in English',
          topic: 'Poetic Devices & Drama Themes',
          timeSlot: 'morning',
          customTime: '08:30 AM',
          targetQuestions: 15,
          durationMinutes: 40,
          priority: 'high',
          completed: false,
          scheduledDate: selectedDate
        },
        {
          id: `task-art-2-${Date.now()}`,
          subjectId: 'government',
          subjectName: 'Government',
          topic: 'Arms of Government & Constitutional History',
          timeSlot: 'morning',
          customTime: '10:30 AM',
          targetQuestions: 15,
          durationMinutes: 40,
          priority: 'high',
          completed: false,
          scheduledDate: selectedDate
        },
        {
          id: `task-art-3-${Date.now()}`,
          subjectId: 'english',
          subjectName: 'English Language',
          topic: 'Synonyms & Antonyms (Lexis & Structure)',
          timeSlot: 'afternoon',
          customTime: '02:30 PM',
          targetQuestions: 15,
          durationMinutes: 30,
          priority: 'high',
          completed: false,
          scheduledDate: selectedDate
        },
        {
          id: `task-art-4-${Date.now()}`,
          subjectId: 'crs',
          subjectName: 'Christian Religious Studies (CRS)',
          topic: 'Sovereignty of God & Early Church Acts',
          timeSlot: 'evening',
          customTime: '06:00 PM',
          targetQuestions: 15,
          durationMinutes: 30,
          priority: 'normal',
          completed: false,
          scheduledDate: selectedDate
        }
      ];
    }

    // Replace or append tasks for this date
    setTasks(prev => {
      const otherDates = prev.filter(t => t.scheduledDate !== selectedDate);
      return [...otherDates, ...presetList];
    });
  };

  const getTimeSlotIcon = (slot: string) => {
    switch (slot) {
      case 'morning':
        return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'afternoon':
        return <Sun className="w-3.5 h-3.5 text-orange-400" />;
      case 'evening':
        return <Sunset className="w-3.5 h-3.5 text-rose-400" />;
      case 'night':
      default:
        return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div id="daily-study-planner" className="space-y-6">
      
      {/* HEADER BANNER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-cyan-500/30 p-6 sm:p-8 shadow-[0_10px_35px_rgba(6,182,212,0.15)]">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold px-2.5 py-1 rounded-lg bg-cyan-950/90 border border-cyan-500/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>DAILY STUDY PLANNER // TOPIC SCHEDULER</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Auto-Tracks Practice Completions</span>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight text-white flex items-center gap-2">
              <span>Today's Study Schedule & Topic Tracker</span>
              <span className="text-xl">📅</span>
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Plan specific syllabus topics throughout your morning, afternoon, and evening. Check off topics as you finish them or click <strong>"Practice Now"</strong> to automatically complete them!
            </p>
          </div>

          {/* Real-Time Daily Progress Gauge */}
          <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-5 min-w-[280px] shadow-xl backdrop-blur-md space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="text-cyan-300">Completion Status for Today</span>
              <span className="font-mono text-emerald-400 font-bold">{completionPercentage}% Completed</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black font-mono text-white">
                {completedCount} <span className="text-sm font-normal text-slate-400">/ {totalCount} Topics</span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {totalCount - completedCount} Remaining
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-cyan-500/30">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-700 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            {completionPercentage === 100 && totalCount > 0 && (
              <div className="text-[11px] font-bold text-emerald-400 text-center animate-pulse flex items-center justify-center gap-1">
                <span>🎉 All scheduled topics conquered today!</span>
              </div>
            )}
          </div>
        </div>

        {/* Service Worker Offline Study Path Sync Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5 text-xs">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
              cachedPathRecord
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                : 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300'
            }`}>
              {cachedPathRecord ? <Database className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                <span>Offline Study Path Cache (Service Worker)</span>
                {cachedPathRecord && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                    {cachedPathRecord.studyPath.totalQuestions} Qs • {cachedPathRecord.sizeKb} KB Ready
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300">
                {cachedPathRecord
                  ? `Cached in browser Service Worker storage (${new Date(cachedPathRecord.cachedAt).toLocaleDateString()}). Works 100% without mobile data.`
                  : 'Download your personalized study path & scheduled subject drills so you can practice anytime offline.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {cachedPathRecord ? (
              <>
                <button
                  onClick={() => {
                    const firstSubjectId = cachedPathRecord.studyPath.modules[0]?.subjectId || 'mathematics';
                    onNavigate('practice', {
                      subjectId: firstSubjectId,
                      customQuestions: cachedPathRecord.studyPath.questions
                    });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Practice Offline Path</span>
                </button>
                <button
                  onClick={handleDownloadOfflinePath}
                  disabled={isCachingPath}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Refresh offline study path cache"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCachingPath ? 'animate-spin' : ''}`} />
                  <span>Sync</span>
                </button>
                <button
                  onClick={handleRemoveOfflinePath}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors cursor-pointer"
                  title="Clear offline study path cache"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={handleDownloadOfflinePath}
                disabled={isCachingPath}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.35)] disabled:opacity-60"
              >
                {isCachingPath ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Caching Path...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Study Path Offline</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONTROLS BAR: Date Selector, Quick Combo Presets, Add Button */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Left: Date Switcher & Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-xs font-bold focus:outline-none cursor-pointer"
            />
          </div>

          {selectedDate !== todayStr && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-xs font-bold border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 transition cursor-pointer"
            >
              Back to Today
            </button>
          )}

          {/* Status Filter */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All ({dateTasks.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Pending ({dateTasks.filter(t => !t.completed).length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Done ({dateTasks.filter(t => t.completed).length})
            </button>
          </div>
        </div>

        {/* Right: Preset Combos & Add Topic Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Presets Dropdown/Buttons */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">1-Tap Preset:</span>
            <button
              onClick={() => loadPresetCombo('science')}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/80 hover:bg-cyan-100 text-cyan-800 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-800 transition cursor-pointer text-[11px]"
              title="Populate Science 4-subject combo for this day"
            >
              🔬 Science
            </button>
            <button
              onClick={() => loadPresetCombo('commercial')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 transition cursor-pointer text-[11px]"
              title="Populate Commercial 4-subject combo for this day"
            >
              📈 Commercial
            </button>
            <button
              onClick={() => loadPresetCombo('art')}
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/80 hover:bg-amber-100 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 transition cursor-pointer text-[11px]"
              title="Populate Arts/Humanities 4-subject combo for this day"
            >
              🎭 Arts
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer ml-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Topic</span>
          </button>
        </div>
      </div>

      {/* SCHEDULED TOPICS LIST */}
      {displayedTasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 sm:p-14 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white font-['Outfit']">
              {statusFilter === 'all'
                ? `No topics scheduled for ${selectedDate === todayStr ? 'Today' : selectedDate}`
                : `No ${statusFilter} topics found`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Schedule your daily revision topics across Mathematics, English, Sciences, and Arts to ensure complete syllabus coverage before exam day.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule a Topic Now</span>
            </button>
            <button
              onClick={() => loadPresetCombo('science')}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Load 4-Subject Recommended Preset
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedTasks.map(task => {
            return (
              <div
                key={task.id}
                className={`rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between gap-4 ${
                  task.completed
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-cyan-400/50 shadow-sm'
                }`}
              >
                {/* Top Row: Subject, Time Slot, Priority, Completion Checkbox */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60">
                        {task.subjectName}
                      </span>

                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center gap-1">
                        {getTimeSlotIcon(task.timeSlot)}
                        <span className="capitalize">{task.customTime || task.timeSlot}</span>
                      </span>

                      {task.priority === 'high' && (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          High Priority
                        </span>
                      )}
                    </div>

                    {/* Toggle Completion Checkbox Button */}
                    <button
                      onClick={() => handleToggleComplete(task.id)}
                      className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                        task.completed
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600'
                      }`}
                      title={task.completed ? 'Mark topic as pending' : 'Mark topic as completed'}
                    >
                      {task.completed ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Done</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4" />
                          <span>Mark Done</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Topic Title */}
                  <div>
                    <h4 className={`text-base font-extrabold font-['Outfit'] leading-snug ${
                      task.completed
                        ? 'text-slate-500 dark:text-slate-400 line-through'
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {task.topic}
                    </h4>

                    {task.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {task.notes}
                      </p>
                    )}
                  </div>

                  {/* Metrics: Target Questions and Duration */}
                  <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>{task.targetQuestions} Practice Questions</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-500" />
                      <span>{task.durationMinutes} Minutes</span>
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {onOpenAITutor && (
                      <button
                        onClick={() => onOpenAITutor(task.topic, task.subjectName)}
                        className="px-2.5 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/80 hover:bg-teal-100 text-teal-800 dark:text-teal-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Get step-by-step guidance from Sarah AI on this topic"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span>AI Tutor Breakdown</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                      title="Delete scheduled topic"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Practice This Topic Now Button */}
                  <button
                    onClick={() => {
                      onNavigate('practice', { subjectId: task.subjectId, topic: task.topic });
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      task.completed
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                        : 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-cyan-600/20'
                    }`}
                  >
                    <span>{task.completed ? 'Practice Again' : 'Practice Topic Now'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SCHEDULE TOPIC MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 text-slate-900 dark:text-white space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg font-['Outfit']">Schedule Revision Topic</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Plan specific syllabus topics for {selectedDate}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              {/* Subject Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Subject <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formSubjectId}
                  onChange={e => {
                    setFormSubjectId(e.target.value);
                    // Reset topic if changing subject
                    const presets = SYLLABUS_TOPIC_PRESETS[e.target.value];
                    if (presets && presets.length > 0) {
                      setFormTopic(presets[0]);
                    }
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code || s.id.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic Input with Syllabus Presets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Syllabus Topic Title <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">
                    Select preset or type custom
                  </span>
                </div>
                <input
                  type="text"
                  value={formTopic}
                  onChange={e => setFormTopic(e.target.value)}
                  placeholder="e.g. Differentiation & Integration (Calculus)"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />

                {/* Quick Presets Pills */}
                {SYLLABUS_TOPIC_PRESETS[formSubjectId] && (
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto">
                    {SYLLABUS_TOPIC_PRESETS[formSubjectId].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormTopic(preset)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border transition cursor-pointer text-left ${
                          formTopic === preset
                            ? 'bg-cyan-600 text-white border-cyan-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-400'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Time Slot & Custom Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Time Slot
                  </label>
                  <select
                    value={formTimeSlot}
                    onChange={e => setFormTimeSlot(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                  >
                    <option value="morning">🌅 Morning (8AM - 12PM)</option>
                    <option value="afternoon">☀️ Afternoon (12PM - 5PM)</option>
                    <option value="evening">🌇 Evening (5PM - 8PM)</option>
                    <option value="night">🌙 Night (8PM - 11PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Time Label
                  </label>
                  <input
                    type="text"
                    value={formCustomTime}
                    onChange={e => setFormCustomTime(e.target.value)}
                    placeholder="e.g. 09:30 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* Target Questions & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Questions (Drills)
                  </label>
                  <select
                    value={formTargetQuestions}
                    onChange={e => setFormTargetQuestions(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                  >
                    <option value={5}>5 Questions (Quick Check)</option>
                    <option value={10}>10 Questions (Standard Drill)</option>
                    <option value={15}>15 Questions (Intensive)</option>
                    <option value={20}>20 Questions (Deep Mastery)</option>
                    <option value={30}>30 Questions (Exam Simulation)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Study Duration
                  </label>
                  <select
                    value={formDurationMinutes}
                    onChange={e => setFormDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                  >
                    <option value={20}>20 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes (1 Hour)</option>
                    <option value={90}>90 Minutes (1.5 Hours)</option>
                  </select>
                </div>
              </div>

              {/* Study Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Study Notes / Focus Tips (Optional)
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="e.g. Master formula memorization and past question speed"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold shadow-md cursor-pointer transition"
                >
                  Add Topic to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
