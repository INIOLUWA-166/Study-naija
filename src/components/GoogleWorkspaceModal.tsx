import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  FileText, 
  GraduationCap, 
  FileQuestion, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  LogOut, 
  RefreshCw,
  Share2,
  FolderOpen
} from 'lucide-react';
import { User as AppUser, ExamResult } from '../types';
import { 
  initAuth, 
  googleSignIn, 
  logoutGoogle, 
  exportToGoogleSheets, 
  exportToGoogleDocs, 
  fetchClassroomCourses, 
  fetchCourseWork, 
  createGoogleQuizForm,
  ClassroomCourse,
  ClassroomCourseWork
} from '../services/googleWorkspace';
import { INITIAL_QUESTIONS } from '../mockData';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  examResults?: ExamResult[];
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  examResults = []
}) => {
  const [activeTab, setActiveTab] = useState<'sheets' | 'docs' | 'classroom' | 'forms'>('sheets');
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string; link?: string } | null>(null);

  // Classroom state
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [courseWorkList, setCourseWorkList] = useState<ClassroomCourseWork[]>([]);
  const [isLoadingClassroom, setIsLoadingClassroom] = useState(false);

  // Docs subject selection
  const [selectedDocSubject, setSelectedDocSubject] = useState('Mathematics');

  // Confirmation dialog state for destructive/creation operations
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  // Initialize auth listener
  useEffect(() => {
    if (isOpen) {
      initAuth(
        (user, token) => {
          setGoogleUser(user);
          setHasToken(!!token);
        },
        () => {
          setHasToken(false);
        }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      const res = await googleSignIn();
      setGoogleUser(res.user);
      setHasToken(true);
      setStatusMessage({ type: 'success', text: `Connected as ${res.user.displayName || res.user.email}!` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Google Sign-In was canceled or failed.' });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setHasToken(false);
    setCourses([]);
    setCourseWorkList([]);
    setStatusMessage({ type: 'success', text: 'Disconnected from Google account.' });
  };

  // 1. Export to Google Sheets
  const triggerExportSheets = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Create Google Sheet for Exam Scores?',
      description: `This will create a new spreadsheet in your Google Drive titled "StudyNaija Exam Performance - ${currentUser?.name || 'Scholar'}" and write your practice test scores and statistics.`,
      onConfirm: async () => {
        setIsLoadingAction(true);
        setStatusMessage(null);
        try {
          const rows = examResults.length > 0 ? examResults.map(r => ({
            studentName: currentUser?.name || 'Scholar',
            examType: r.examType,
            subject: r.subject,
            score: r.score,
            percentage: r.percentage,
            grade: r.percentage >= 75 ? 'A (Excellent)' : r.percentage >= 60 ? 'B (Good)' : 'C (Pass)',
            date: new Date(r.timestamp).toLocaleDateString()
          })) : [
            {
              studentName: currentUser?.name || 'Chukwuebuka Obi',
              examType: 'JAMB UTME 2027 Mock',
              subject: 'Mathematics',
              score: 88,
              percentage: 88,
              grade: 'A (Excellent)',
              date: new Date().toLocaleDateString()
            },
            {
              studentName: currentUser?.name || 'Chukwuebuka Obi',
              examType: 'JAMB UTME 2027 Mock',
              subject: 'English Language',
              score: 82,
              percentage: 82,
              grade: 'A (Excellent)',
              date: new Date().toLocaleDateString()
            },
            {
              studentName: currentUser?.name || 'Chukwuebuka Obi',
              examType: 'JAMB UTME 2027 Mock',
              subject: 'Physics',
              score: 76,
              percentage: 76,
              grade: 'B (Good)',
              date: new Date().toLocaleDateString()
            },
            {
              studentName: currentUser?.name || 'Chukwuebuka Obi',
              examType: 'JAMB UTME 2027 Mock',
              subject: 'Chemistry',
              score: 79,
              percentage: 79,
              grade: 'B (Good)',
              date: new Date().toLocaleDateString()
            }
          ];

          const title = `StudyNaija Exam Performance - ${currentUser?.name || 'Scholar'} (${new Date().toLocaleDateString()})`;
          const res = await exportToGoogleSheets(title, rows);
          setStatusMessage({
            type: 'success',
            text: 'Google Sheet created successfully with formatted scores!',
            link: res.spreadsheetUrl
          });
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err.message || 'Failed to export to Google Sheets.' });
        } finally {
          setIsLoadingAction(false);
        }
      }
    });
  };

  // 2. Export to Google Docs
  const triggerExportDocs = () => {
    setConfirmDialog({
      isOpen: true,
      title: `Create Google Doc Study Guide for ${selectedDocSubject}?`,
      description: `This will create a new document in your Google Drive titled "StudyNaija Comprehensive Study Guide - ${selectedDocSubject}" with formulas, definitions, and examiner traps.`,
      onConfirm: async () => {
        setIsLoadingAction(true);
        setStatusMessage(null);
        try {
          const docTitle = `StudyNaija Revision Guide - ${selectedDocSubject} (${new Date().getFullYear()})`;
          const content = `
SUBJECT: ${selectedDocSubject}
TARGET EXAM: JAMB UTME & WAEC SSCE

1. CORE HIGH-YIELD TOPICS & EXAM BREAKDOWN:
- Focus on foundational definitions, formula derivations, and standard SI units.
- Review past exam questions across 2015-2024.
- Eliminate common distractors in objective questions.

2. GOLDEN FORMULAS & WORKED PRINCIPLES:
- Master key mnemonics (e.g. SOH CAH TOA, BODMAS, Proximity Rule in Concord).
- Verify all step-by-step calculations before picking CBT options.

3. EXAMINER TRAPS TO AVOID:
- Sign errors when crossing the equality sign.
- Unit conversions (e.g., converting cm to meters or Celsius to Kelvin).
- Pay close attention to exceptions in grammar rules and chemical trends.
`;
          const res = await exportToGoogleDocs(docTitle, content);
          setStatusMessage({
            type: 'success',
            text: `Google Doc study guide for ${selectedDocSubject} created successfully!`,
            link: res.documentUrl
          });
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err.message || 'Failed to export to Google Docs.' });
        } finally {
          setIsLoadingAction(false);
        }
      }
    });
  };

  // 3. Google Classroom
  const handleLoadClassroom = async () => {
    setIsLoadingClassroom(true);
    setStatusMessage(null);
    try {
      const courseList = await fetchClassroomCourses();
      setCourses(courseList);
      if (courseList.length > 0) {
        setSelectedCourseId(courseList[0].id);
        const work = await fetchCourseWork(courseList[0].id);
        setCourseWorkList(work);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not fetch Google Classroom courses.' });
    } finally {
      setIsLoadingClassroom(false);
    }
  };

  const handleSelectCourse = async (courseId: string) => {
    setSelectedCourseId(courseId);
    setIsLoadingClassroom(true);
    try {
      const work = await fetchCourseWork(courseId);
      setCourseWorkList(work);
    } catch (err: any) {
      console.warn('Failed to load course work:', err);
    } finally {
      setIsLoadingClassroom(false);
    }
  };

  // 4. Google Forms Quiz
  const triggerCreateForm = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Generate Practice Quiz in Google Forms?',
      description: 'This will create an online quiz form in your Google account populated with 10 real JAMB UTME past questions and multiple-choice options.',
      onConfirm: async () => {
        setIsLoadingAction(true);
        setStatusMessage(null);
        try {
          const sampleQuestions = INITIAL_QUESTIONS.slice(0, 10).map(q => {
            const optionsArray = [
              `A) ${q.options.A}`,
              `B) ${q.options.B}`,
              `C) ${q.options.C}`,
              `D) ${q.options.D}`
            ];
            const correctOptionIndex = q.correctOption === 'A' ? 0 : q.correctOption === 'B' ? 1 : q.correctOption === 'C' ? 2 : 3;
            return {
              question: q.question,
              options: optionsArray,
              correctOptionIndex
            };
          });

          const formTitle = `StudyNaija JAMB CBT Practice Quiz - ${new Date().toLocaleDateString()}`;
          const res = await createGoogleQuizForm(formTitle, sampleQuestions);
          setStatusMessage({
            type: 'success',
            text: 'Google Form practice quiz created successfully!',
            link: res.editUri
          });
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err.message || 'Failed to create Google Form.' });
        } finally {
          setIsLoadingAction(false);
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-blue-500 flex items-center justify-center p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                Google Workspace Integration Hub
              </h3>
              <p className="text-xs text-slate-400">
                Sync with Google Sheets, Docs, Classroom & Forms
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Authentication Banner */}
        <div className="px-4 sm:px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          {hasToken && googleUser ? (
            <div className="flex items-center gap-3">
              {googleUser.photoURL ? (
                <img 
                  src={googleUser.photoURL} 
                  alt={googleUser.displayName || 'Google User'} 
                  className="w-8 h-8 rounded-full border border-emerald-500/40"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {googleUser.displayName?.[0] || 'G'}
                </div>
              )}
              <div>
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <span>{googleUser.displayName || 'Connected Scholar'}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[11px] text-slate-400">{googleUser.email}</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-300">
              Sign in with your Google Account to export data and sync coursework.
            </div>
          )}

          <div>
            {hasToken ? (
              <button
                onClick={handleSignOut}
                className="py-1.5 px-3 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Disconnect
              </button>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="py-2 px-4 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 flex items-center gap-2 shadow transition-all cursor-pointer disabled:opacity-50"
              >
                {isSigningIn ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div className={`px-4 sm:px-5 py-2.5 text-xs font-medium flex items-center justify-between gap-2 border-b ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/50' 
              : 'bg-rose-950/40 text-rose-300 border-rose-900/50'
          }`}>
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            {statusMessage.link && (
              <a
                href={statusMessage.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold underline hover:opacity-80 shrink-0"
              >
                <span>Open in Google</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Service Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-3 sm:px-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('sheets')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'sheets'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Google Sheets</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'docs'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Google Docs</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('classroom');
              if (hasToken && courses.length === 0) {
                handleLoadClassroom();
              }
            }}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'classroom'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Google Classroom</span>
          </button>

          <button
            onClick={() => setActiveTab('forms')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'forms'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileQuestion className="w-4 h-4 text-purple-400" />
            <span>Google Forms</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">

          {/* 1. GOOGLE SHEETS TAB */}
          {activeTab === 'sheets' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <FileSpreadsheet className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Export Exam Records to Google Sheets</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Create a live spreadsheet in your Google Drive populated with your CBT mock test scores, percentage ranks, subject strengths, and completion dates.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <h5 className="text-xs font-semibold text-slate-300">Data to be exported:</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Candidate</span>
                    <span className="font-bold text-white truncate block">{currentUser?.name || 'Chukwuebuka'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Exam Category</span>
                    <span className="font-bold text-emerald-400 block">JAMB & WAEC</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Subjects</span>
                    <span className="font-bold text-amber-400 block">4 Core Subjects</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block">Spreadsheet Style</span>
                    <span className="font-bold text-blue-400 block">StudyNaija Emerald</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={triggerExportSheets}
                    disabled={!hasToken || isLoadingAction}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/30"
                  >
                    {isLoadingAction ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4" />
                    )}
                    <span>{hasToken ? 'Generate Google Sheet Now' : 'Sign in with Google above to export'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. GOOGLE DOCS TAB */}
          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <FileText className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Generate Google Docs Study Guides</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Create clean, printable revision guides with core definitions, formulas, and examiner traps directly in your Google Docs library.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Revision Subject:</label>
                  <select
                    value={selectedDocSubject}
                    onChange={e => setSelectedDocSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Mathematics">Mathematics (Calculus, Quadratic, Indices)</option>
                    <option value="English Language">Use of English (Concord, Oral Stress, Lexis)</option>
                    <option value="Physics">Physics (Mechanics, Newton's Laws, Optics)</option>
                    <option value="Chemistry">Chemistry (Periodic Trends, Stoichiometry, Acids)</option>
                    <option value="Biology">Biology (Cell Biology, Genetics, Photosynthesis)</option>
                    <option value="Economics">Economics (Demand & Supply, Elasticity, Inflation)</option>
                    <option value="Government">Government (Constitutions, Separation of Powers)</option>
                  </select>
                </div>

                <button
                  onClick={triggerExportDocs}
                  disabled={!hasToken || isLoadingAction}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-950/30"
                >
                  {isLoadingAction ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  <span>{hasToken ? `Create ${selectedDocSubject} Google Doc` : 'Sign in with Google above to create'}</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. GOOGLE CLASSROOM TAB */}
          {activeTab === 'classroom' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Google Classroom Synchronization</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      View your school's active Google Classroom courses and coursework assignments directly inside StudyNaija.
                    </p>
                  </div>
                </div>
                {hasToken && (
                  <button
                    onClick={handleLoadClassroom}
                    disabled={isLoadingClassroom}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingClassroom ? 'animate-spin' : ''}`} />
                    <span>Sync</span>
                  </button>
                )}
              </div>

              {!hasToken ? (
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <GraduationCap className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Sign in with Google above to see your active Classroom courses.</p>
                </div>
              ) : isLoadingClassroom ? (
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  <span className="text-xs text-slate-400">Loading Google Classroom courses...</span>
                </div>
              ) : courses.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                  <FolderOpen className="w-8 h-8 text-amber-500/60 mx-auto" />
                  <p className="text-xs font-semibold text-slate-300">No active Google Classroom courses found.</p>
                  <p className="text-[11px] text-slate-500">
                    If your school or university uses Google Classroom, ensure you are signed into the correct school account.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Classroom Course:</label>
                    <select
                      value={selectedCourseId}
                      onChange={e => handleSelectCourse(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.section ? `(${c.section})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-slate-400">Active Coursework & Assignments:</h5>
                    {courseWorkList.length === 0 ? (
                      <p className="text-xs text-slate-500 p-3 bg-slate-950 rounded-xl">No pending assignments found in this course.</p>
                    ) : (
                      courseWorkList.map(w => (
                        <div key={w.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                          <div>
                            <div className="text-xs font-bold text-white">{w.title}</div>
                            {w.dueDate && (
                              <div className="text-[11px] text-amber-400 mt-0.5">
                                Due: {w.dueDate.day}/{w.dueDate.month}/{w.dueDate.year}
                              </div>
                            )}
                          </div>
                          {w.alternateLink && (
                            <a
                              href={w.alternateLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-amber-400 hover:underline flex items-center gap-1 shrink-0 font-medium"
                            >
                              <span>View Task</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. GOOGLE FORMS TAB */}
          {activeTab === 'forms' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <FileQuestion className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Generate Google Forms Practice Quizzes</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Automatically convert StudyNaija CBT past questions into a live Google Form quiz for yourself, study groups, or classroom tests.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>Includes 10 real JAMB UTME objective questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>Multiple-choice radio options (A, B, C, D)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>Shareable responder link generated immediately</span>
                  </div>
                </div>

                <button
                  onClick={triggerCreateForm}
                  disabled={!hasToken || isLoadingAction}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-950/30"
                >
                  {isLoadingAction ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileQuestion className="w-4 h-4" />
                  )}
                  <span>{hasToken ? 'Generate Google Form Quiz' : 'Sign in with Google above to create'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Secure 1P Google Workspace Authorization</span>
          </div>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>

      {/* Explicit User Confirmation Dialog for Destructive / Creation Operations */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h4 className="font-bold text-sm text-white">{confirmDialog.title}</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmDialog.description}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                  confirmDialog.onConfirm();
                }}
                className="py-2 px-4 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors cursor-pointer"
              >
                Confirm & Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
