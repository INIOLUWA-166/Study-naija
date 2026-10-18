import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  BarChart3, 
  Users, 
  BookOpen, 
  FileQuestion, 
  Sparkles, 
  CheckCircle2, 
  X,
  DollarSign,
  AlertTriangle,
  Landmark,
  Copy,
  Check,
  Smartphone,
  CreditCard,
  Clock,
  RefreshCw,
  XCircle,
  Search,
  ShieldAlert,
  Eye,
  Gift,
  Bell,
  Phone,
  Send,
  Mail,
  ExternalLink,
  MessageSquare,
  Trophy,
  CheckCheck
} from 'lucide-react';
import { User, Subject, Question, Article, AdminStats, PaymentRecord, MonthlyWinnerRecord, AdminNotification } from '../types';
import { api } from '../services/api';
import { AdminChampionsAiBattle } from './AdminChampionsAiBattle';
import { AdminChampionsCutscene } from './AdminChampionsCutscene';
import { AdminSentinelView } from './AdminSentinelView';
import { tournamentManager } from '../utils/tournamentManager';

interface AdminViewProps {
  user: User | null;
  subjects: Subject[];
  onOpenAuth: () => void;
  onRefreshData: () => void;
  onNavigate?: (view: string) => void;
  onUserUpgraded?: (user: User) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  user,
  subjects,
  onOpenAuth,
  onRefreshData,
  onNavigate,
  onUserUpgraded
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'sentinel' | 'payments' | 'winners' | 'notifications' | 'banking' | 'questions' | 'subjects' | 'articles' | 'champions-ai'>('stats');
  const [showCutscene, setShowCutscene] = useState<boolean>(true);
  const [isAdminFullscreenIntroOpen, setIsAdminFullscreenIntroOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [paymentsQueue, setPaymentsQueue] = useState<PaymentRecord[]>([]);
  const [paymentsFilter, setPaymentsFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'trolls'>('all');
  const [processingPaymentRef, setProcessingPaymentRef] = useState<string | null>(null);
  
  // Monthly Winners & Airtime Disbursement States
  const [monthlyWinners, setMonthlyWinners] = useState<MonthlyWinnerRecord[]>([]);
  const [currentSeason, setCurrentSeason] = useState<any>(null);
  const [loadingWinners, setLoadingWinners] = useState(false);
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);
  const [fulfillNotes, setFulfillNotes] = useState<string>('');
  const [editingWinnerId, setEditingWinnerId] = useState<string | null>(null);
  const [editPhone, setEditPhone] = useState<string>('');
  const [editNetwork, setEditNetwork] = useState<string>('MTN');
  const [winnerVerifyInput, setWinnerVerifyInput] = useState<string>('');

  // Admin Notifications & Email Log States (luvkidjaja@gmail.com)
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);

  const [paymentConfig, setPaymentConfig] = useState({
    bankName: 'OPay (PayCom)',
    accountNumber: '9166059676',
    accountName: 'INIOLUWA JESULEJE MICHAEL',
    instructions: ''
  });
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [copiedBankField, setCopiedBankField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [previewReceiptModal, setPreviewReceiptModal] = useState<{
    url: string;
    title: string;
    sender: string;
    amount: number;
    sessionId?: string;
  } | null>(null);

  // Modal / Form States
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionForm, setQuestionForm] = useState({
    subjectId: 'english',
    topic: '',
    examType: 'JAMB',
    year: 2027,
    question: '',
    options: { A: '', B: '', C: '', D: '' },
    correctOption: 'A' as 'A' | 'B' | 'C' | 'D',
    explanation: '',
    difficulty: 'Medium'
  });

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    description: '',
    topics: ''
  });

  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [articleForm, setArticleForm] = useState({
    title: '',
    category: 'JAMB',
    excerpt: '',
    content: '',
    author: 'StudyNaija Editorial Board',
    readTime: '5 min read',
    tags: 'JAMB, CBT, Revision'
  });

  // Load Admin Data
  const loadData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'admin') {
        const statsData = await api.getAdminStats();
        setStats(statsData);
      }
      const qData = await api.getQuestions({ limit: 100 });
      setQuestions(qData.questions);
      const artData = await api.getArticles();
      setArticles(artData);
      try {
        const pConf = await api.getPaymentConfig();
        if (pConf) setPaymentConfig(pConf);
      } catch (pErr) {
        console.warn('Could not fetch payment config:', pErr);
      }
      try {
        const payData = await api.getAdminPayments();
        if (payData?.payments) {
          setPaymentsQueue(payData.payments);
        }
      } catch (payErr) {
        console.warn('Could not fetch payments queue:', payErr);
      }
      try {
        const winData = await api.getAdminMonthlyWinners();
        if (winData?.winners) {
          setMonthlyWinners(winData.winners);
          if (winData.currentSeason) setCurrentSeason(winData.currentSeason);
        }
      } catch (wErr) {
        console.warn('Could not fetch monthly winners:', wErr);
      }
      try {
        const notifData = await api.getAdminNotifications();
        if (notifData?.notifications) {
          setAdminNotifications(notifData.notifications);
          setUnreadNotifsCount(notifData.unreadCount || 0);
        }
      } catch (nErr) {
        console.warn('Could not fetch admin notifications:', nErr);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (reference: string) => {
    setProcessingPaymentRef(reference);
    try {
      const res = await api.approveAdminPayment(reference);
      setFeedback(res.message || 'Payment approved! Student account has been activated.');
      // Refresh payments list and platform stats
      const payData = await api.getAdminPayments();
      if (payData?.payments) setPaymentsQueue(payData.payments);
      if (user?.role === 'admin') {
        const statsData = await api.getAdminStats();
        setStats(statsData);
      }
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to approve payment');
    } finally {
      setProcessingPaymentRef(null);
    }
  };

  const handleRejectPayment = async (reference: string) => {
    const reason = prompt(
      'Enter reason for rejecting this transfer submission (will be shown to student):',
      'Transfer not received in OPay account (9166059676)'
    );
    if (!reason) return;

    setProcessingPaymentRef(reference);
    try {
      const res = await api.rejectAdminPayment(reference, reason);
      setFeedback(res.message || 'Payment marked as rejected');
      const payData = await api.getAdminPayments();
      if (payData?.payments) setPaymentsQueue(payData.payments);
    } catch (err: any) {
      alert(err.message || 'Failed to reject payment');
    } finally {
      setProcessingPaymentRef(null);
    }
  };

  const handleBanTroll = async (reference: string, studentName: string) => {
    const reason = prompt(
      `🚨 BAN TROLL CONFIRMATION:\n\nAre you sure you want to flag and ban ${studentName}?\n\nThis will reject the payment and SUSPEND their account from submitting further payment verifications.\n\nEnter ban reason:`,
      'Submitted fraudulent payment confirmation without sending funds to OPay (9166059676)'
    );
    if (!reason) return;

    setProcessingPaymentRef(reference);
    try {
      const res = await api.banTrollPayment(reference, reason);
      setFeedback(res.message || 'Student flagged as troll and banned from payment submissions.');
      const payData = await api.getAdminPayments();
      if (payData?.payments) setPaymentsQueue(payData.payments);
    } catch (err: any) {
      alert(err.message || 'Failed to ban troll');
    } finally {
      setProcessingPaymentRef(null);
    }
  };

  const handleUnbanTroll = async (reference: string, studentName: string) => {
    if (!confirm(`Unban ${studentName} and allow them to submit payments again?`)) return;

    setProcessingPaymentRef(reference);
    try {
      const res = await api.unbanTrollPayment(reference);
      setFeedback(res.message || 'Student has been unbanned.');
      const payData = await api.getAdminPayments();
      if (payData?.payments) setPaymentsQueue(payData.payments);
    } catch (err: any) {
      alert(err.message || 'Failed to unban user');
    } finally {
      setProcessingPaymentRef(null);
    }
  };

  const handleSavePaymentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPayment(true);
    try {
      const res = await api.updatePaymentConfig(paymentConfig);
      setPaymentConfig(res.config);
      setIsEditingPayment(false);
      setFeedback('Receiving payment account details updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save payment configuration');
    } finally {
      setSavingPayment(false);
    }
  };

  const copyBankToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBankField(field);
    setTimeout(() => setCopiedBankField(null), 2000);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle Question Submit (Add or Edit)
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuestionId) {
        await api.updateQuestion(editingQuestionId, questionForm);
        setFeedback('Question updated successfully!');
      } else {
        await api.createQuestion(questionForm);
        setFeedback('New question published successfully!');
      }
      setIsQuestionModalOpen(false);
      setEditingQuestionId(null);
      loadData();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save question');
    }
  };

  // Handle Delete Question
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.deleteQuestion(id);
      setFeedback('Question deleted successfully.');
      loadData();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete question');
    }
  };

  // Handle Subject Submit
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const topicList = subjectForm.topics.split(',').map(t => t.trim()).filter(Boolean);
      await api.createSubject({
        name: subjectForm.name,
        code: subjectForm.code || subjectForm.name.substring(0, 3).toUpperCase(),
        description: subjectForm.description,
        topics: topicList
      });
      setFeedback('Subject and topics saved successfully!');
      setIsSubjectModalOpen(false);
      loadData();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to save subject');
    }
  };

  // Handle Article Submit
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createArticle(articleForm);
      setFeedback('Study tip article published successfully!');
      setIsArticleModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to publish article');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    try {
      await api.deleteArticle(id);
      setFeedback('Article deleted.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete article');
    }
  };

  const handleFulfillAirtime = async (id: string) => {
    setFulfillingId(id);
    try {
      const res = await api.fulfillAdminMonthlyWinner(id, fulfillNotes);
      setFeedback(res.message || 'Airtime marked as sent/fulfilled!');
      const winData = await api.getAdminMonthlyWinners();
      setMonthlyWinners(winData.winners || []);
      setFulfillNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to update airtime status');
    } finally {
      setFulfillingId(null);
    }
  };

  const handleSaveWinnerPhone = async (id: string) => {
    if (!editPhone || editPhone.trim().length < 8) {
      alert('Please enter a valid mobile phone number (e.g. 08012345678)');
      return;
    }
    try {
      await api.updateAdminMonthlyWinnerPhone(id, editPhone.trim(), editNetwork);
      setEditingWinnerId(null);
      setFeedback('Winner phone updated successfully!');
      const winData = await api.getAdminMonthlyWinners();
      setMonthlyWinners(winData.winners || []);
    } catch (err: any) {
      alert(err.message || 'Failed to update phone');
    }
  };

  const handleRefreshSnapshot = async () => {
    setLoadingWinners(true);
    try {
      const res = await api.refreshAdminMonthlyWinners();
      setMonthlyWinners(res.winners || []);
      setFeedback('Monthly winners snapshot refreshed from current leaderboard!');
    } catch (err: any) {
      alert(err.message || 'Failed to refresh snapshot');
    } finally {
      setLoadingWinners(false);
    }
  };

  const handleTestEmail = async () => {
    setTestEmailStatus('Sending test email alert to luvkidjaja@gmail.com...');
    try {
      const res = await api.testAdminEmailNotification();
      setTestEmailStatus(`✅ ${res.message}`);
      const notifData = await api.getAdminNotifications();
      setAdminNotifications(notifData.notifications || []);
      setUnreadNotifsCount(notifData.unreadCount || 0);
    } catch (err: any) {
      setTestEmailStatus(`❌ ${err.message}`);
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await api.markAllAdminNotificationsRead();
      setAdminNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotifsCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    try {
      await api.markAdminNotificationRead(id);
      setAdminNotifications(prev => prev.map(n => n.id === id ? ({ ...n, read: true }) : n));
      setUnreadNotifsCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  // If user is not admin, show restricted access notice
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-lg text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">
          Restricted Administrator Portal
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          This portal is strictly restricted to authorized StudyNaija site administrators. If you are the platform owner, please sign in with your administrator account.
        </p>

        <button
          onClick={onOpenAuth}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
        >
          Sign In with Admin Account
        </button>
      </div>
    );
  }

  return (
    <div id="admin-system-container" className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Site Owner Operations & CBT Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-['Outfit']">
            StudyNaija Administrator Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Logged in as {user.name} ({user.email})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setShowCutscene(true);
              setActiveTab('champions-ai');
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-md hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer font-['Outfit']"
          >
            <Trophy className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>🏆 Launch Champions Intro & AI Battle</span>
          </button>

          <button
            onClick={() => setIsAdminFullscreenIntroOpen(true)}
            className="px-3.5 py-2 bg-cyan-950/90 hover:bg-cyan-900 text-cyan-300 border border-cyan-400/50 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Preview the exact UEFA Champions League Intro that qualified students receive"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>🎬 Preview UEFA Intro</span>
          </button>

          <button
            onClick={() => {
              setEditingQuestionId(null);
              setQuestionForm({
                subjectId: 'english',
                topic: '',
                examType: 'JAMB',
                year: 2027,
                question: '',
                options: { A: '', B: '', C: '', D: '' },
                correctOption: 'A',
                explanation: '',
                difficulty: 'Medium'
              });
              setIsQuestionModalOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>

          <button
            onClick={() => setIsSubjectModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject/Topic</span>
          </button>

          <button
            onClick={() => setIsArticleModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Article</span>
          </button>
        </div>
      </div>

      {/* Featured Champions League Admin Quick Action Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-500/50 p-4 sm:p-5 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shrink-0 animate-bounce">
            🏆
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider font-['Outfit']">
                Admin Exclusive Simulator
              </span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                100% Win Guarantee
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white font-['Outfit']">
              UEFA Champions League Arena & AI Battle
            </h3>
            <p className="text-xs text-slate-300">
              Experience the grand UEFA Champions League Starball intro, stadium anthem, and battle AI through Group Stages, Knockouts, and Grande Finale with 100% Admin victory.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => {
              setShowCutscene(true);
              setActiveTab('champions-ai');
            }}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs tracking-wider shadow-lg hover:scale-105 transition-all flex items-center gap-2 shrink-0 cursor-pointer font-['Outfit']"
          >
            <Trophy className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>PLAY INTRO & BATTLE NOW</span>
          </button>

          <button
            onClick={() => setIsAdminFullscreenIntroOpen(true)}
            className="px-4 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-400/40 font-bold text-xs tracking-wider transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>FULLSCREEN INTRO</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {feedback}
          </span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'stats', label: 'Platform Statistics', icon: BarChart3 },
          { 
            id: 'sentinel', 
            label: '🛡️ Sentinel AI (Anti-Cheat & Hacker Bans)', 
            icon: ShieldAlert 
          },
          { 
            id: 'champions-ai', 
            label: '🏆 Play Champions (AI Battle • 100% Win)', 
            icon: Trophy 
          },
          { 
            id: 'winners', 
            label: `🏆 Monthly Winners & Airtime (${monthlyWinners.filter(w => w.status === 'ready_to_send').length})`, 
            icon: Gift,
            pendingBadge: monthlyWinners.filter(w => w.status === 'ready_to_send').length
          },
          { 
            id: 'notifications', 
            label: `🔔 Email Alerts (${adminNotifications.filter(n => !n.read).length})`, 
            icon: Bell,
            pendingBadge: adminNotifications.filter(n => !n.read).length
          },
          { 
            id: 'payments', 
            label: `Payment Approvals (${paymentsQueue.filter(p => p.status === 'pending').length})`, 
            icon: CreditCard,
            pendingBadge: paymentsQueue.filter(p => p.status === 'pending').length
          },
          { id: 'banking', label: 'OPay & Banking Setup', icon: Landmark },
          { id: 'questions', label: `Questions Bank (${questions.length})`, icon: FileQuestion },
          { id: 'subjects', label: `Subjects & Topics (${subjects.length})`, icon: BookOpen },
          { id: 'articles', label: `Study Tips & Articles (${articles.length})`, icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'champions-ai') {
                  setShowCutscene(true);
                }
                setActiveTab(tab.id as any);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 relative ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {Boolean(tab.pendingBadge && tab.pendingBadge > 0) && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                  isActive ? 'bg-amber-400 text-slate-950' : 'bg-amber-500 text-white animate-pulse'
                }`}>
                  {tab.pendingBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: SYSTEM STATISTICS */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase">Registered Students</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-['Outfit']">
                {stats.totalUsers.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">+42 today</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase">Exams Taken</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 font-['Outfit']">
                {stats.totalExamsTaken.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-500">JAMB & WAEC CBT</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase">Paid Subscribers</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 font-['Outfit']">
                {stats.activeSubscriptions.toLocaleString()}
              </div>
              <span className="text-[11px] text-amber-700 font-semibold">₦5k - ₦20k plans</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-400 uppercase">Monthly Recurring Revenue</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-['Outfit']">
                ₦{(stats.monthlyRevenue / 1000000).toFixed(2)}M
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">Verified on server</span>
            </div>
          </div>

          {/* Recent Registrations Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Recent Student Registrations</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2.5">Student Name</th>
                    <th className="py-2.5">Email</th>
                    <th className="py-2.5">Current Plan</th>
                    <th className="py-2.5">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {stats.recentUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-slate-900">{u.name}</td>
                      <td className="py-2.5 text-slate-500 font-mono text-[11px]">{u.email}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.plan === 'premium'
                            ? 'bg-amber-100 text-amber-800'
                            : u.plan === 'medium'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400 text-[11px]">
                        {new Date(u.joined).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SENTINEL AI ANTI-CHEAT & SECURITY COMMAND */}
      {activeTab === 'sentinel' && (
        <AdminSentinelView onRefreshData={onRefreshData} />
      )}

      {/* TAB: MONTHLY WINNERS & AIRTIME DISBURSEMENT */}
      {activeTab === 'winners' && (
        <div className="space-y-6">
          
          {/* Season Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-amber-500/30">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xl">🏆</span>
                <h2 className="text-xl sm:text-2xl font-black font-['Outfit']">
                  Monthly Winners & Airtime Disbursement
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-mono font-bold">
                  {currentSeason?.seasonTitle || 'Active Monthly Season'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Refreshes on the <strong>1st of every month</strong>. The Top 5 students win airtime/data rewards. When winners input their phone numbers, you are notified via email (<strong>luvkidjaja@gmail.com</strong>) and can disburse airtime here.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handleRefreshSnapshot}
                disabled={loadingWinners}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingWinners ? 'animate-spin' : ''}`} />
                <span>Refresh Snapshot</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Season Period</div>
              <div className="text-base sm:text-lg font-black text-slate-900 mt-1 font-['Outfit'] truncate">
                {currentSeason?.currentMonthName || 'Monthly'} {currentSeason?.currentYear || '2027'}
              </div>
              <span className="text-[10px] text-slate-500">Refreshes 1st of month</span>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-xs bg-amber-50/30">
              <div className="text-[11px] font-bold text-amber-700 uppercase">Ready to Send Airtime</div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 font-['Outfit']">
                {monthlyWinners.filter(w => w.status === 'ready_to_send').length}
              </div>
              <span className="text-[10px] text-amber-800 font-semibold">Phone numbers submitted</span>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Awaiting Phone</div>
              <div className="text-2xl sm:text-3xl font-black text-slate-700 mt-1 font-['Outfit']">
                {monthlyWinners.filter(w => w.status === 'pending_phone').length}
              </div>
              <span className="text-[10px] text-slate-500">Students yet to enter phone</span>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-xs bg-emerald-50/30">
              <div className="text-[11px] font-bold text-emerald-700 uppercase">Airtime Disbursed</div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 font-['Outfit']">
                {monthlyWinners.filter(w => w.status === 'fulfilled').length}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold">Completed rewards</span>
            </div>
          </div>

          {/* ANTI-FRAUD VERIFICATION CHECKER TOOL */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 rounded-3xl p-5 sm:p-6 border border-emerald-500/30 text-white shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm sm:text-base text-white font-['Outfit']">
                  Anti-Fraud Winner Verification Tool
                </h3>
              </div>
              <span className="text-[11px] text-emerald-300 font-semibold">
                Instant identity check before sending airtime
              </span>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Did someone message you on WhatsApp or SMS claiming to have won? Type their <strong>phone number</strong>, <strong>email</strong>, or their unique <strong>Verification Code</strong> (e.g. <code>WIN-...</code>) below to verify if they are a real winner or an impostor!
            </p>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={winnerVerifyInput}
                onChange={(e) => setWinnerVerifyInput(e.target.value)}
                placeholder="Paste phone number (e.g. 080...), student email, or Verification Code (e.g. WIN-2026...)..."
                className="w-full pl-10 pr-24 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {winnerVerifyInput && (
                <button
                  onClick={() => setWinnerVerifyInput('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Verification Result Feedback */}
            {winnerVerifyInput.trim().length >= 3 && (() => {
              const query = winnerVerifyInput.trim().toLowerCase();
              const match = monthlyWinners.find(w => 
                (w.verificationCode && w.verificationCode.toLowerCase().includes(query)) ||
                (w.phoneNumber && w.phoneNumber.includes(query)) ||
                (w.studentEmail && w.studentEmail.toLowerCase().includes(query)) ||
                (w.studentName && w.studentName.toLowerCase().includes(query))
              );

              if (match) {
                return (
                  <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs space-y-1 animate-fadeIn">
                    <div className="font-extrabold text-emerald-300 flex items-center gap-1.5 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>✅ VERIFIED LEGITIMATE WINNER!</span>
                    </div>
                    <div className="text-xs text-white">
                      <strong>{match.studentName}</strong> ({match.studentEmail}) • <strong>Rank #{match.rank}</strong> • Prize: <strong className="text-amber-300">{match.prizeAmount}</strong>
                    </div>
                    <div className="text-[11px] text-emerald-300 font-mono">
                      Phone: <strong>{match.phoneNumber || 'Not yet submitted'}</strong> ({match.network || 'Unknown'}) • Code: <strong>{match.verificationCode}</strong> • Status: <strong>{match.status}</strong>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs space-y-1 animate-fadeIn">
                    <div className="font-extrabold text-rose-300 flex items-center gap-1.5 text-sm">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>❌ NOT FOUND / FRAUD ALERT!</span>
                    </div>
                    <p className="text-xs text-rose-200/90">
                      No winner matches &quot;{winnerVerifyInput}&quot;. This person did <strong>NOT</strong> place in the Top 5 or has not won this month. <strong>Do NOT send airtime or cash.</strong>
                    </p>
                  </div>
                );
              }
            })()}
          </div>

          {/* Winners Cards / Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Current Top 5 Winners Snapshot
                </h3>
                <p className="text-xs text-slate-500">
                  Verify the phone number and network below, recharge their line via bank app or USSD, and click &quot;Mark as Airtime Sent&quot;.
                </p>
              </div>
              <span className="text-xs text-slate-400">5 Official Prize Slots</span>
            </div>

            {monthlyWinners.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Gift className="w-8 h-8 mx-auto opacity-40 text-amber-500" />
                <p className="text-xs">No monthly winners snapshot yet.</p>
                <button
                  onClick={handleRefreshSnapshot}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
                >
                  Generate First Snapshot
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {monthlyWinners.slice(0, 5).map((winner) => {
                  const isReady = winner.status === 'ready_to_send';
                  const isFulfilled = winner.status === 'fulfilled';
                  const isEditing = editingWinnerId === winner.id;
                  const rankIcons = ['🥇', '🥈', '🥉', '🎖️', '🎖️'];

                  return (
                    <div
                      key={winner.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isFulfilled
                          ? 'bg-slate-50 border-slate-200'
                          : isReady
                          ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        
                        {/* Winner Identity & Prize */}
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-xs shrink-0 ${
                            winner.rank === 1
                              ? 'bg-amber-500 text-slate-950 border border-amber-300'
                              : winner.rank === 2
                              ? 'bg-slate-200 text-slate-800 border border-slate-300'
                              : winner.rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            <span>{rankIcons[winner.rank - 1] || '🎖️'}</span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 font-['Outfit']">
                                {winner.studentName}
                              </h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                Rank #{winner.rank}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {winner.studentEmail}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-black text-amber-700">
                                Prize: {winner.prizeAmount}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-600">
                                Best UTME Score: <strong>{winner.score}/400</strong>
                              </span>
                              <span className="text-slate-400">•</span>
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] font-bold text-slate-500">Verification Code:</span>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-950 font-mono font-black text-[11px] border border-emerald-300">
                                  {winner.verificationCode || `WIN-${winner.rank}`}
                                </span>
                                {winner.verificationCode && (
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(winner.verificationCode || '');
                                      setFeedback(`Copied verification code ${winner.verificationCode} to clipboard!`);
                                    }}
                                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                    title="Copy Verification Code"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Phone and Network section */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                              <span className="text-slate-500 flex items-center gap-1 font-semibold">
                                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                                Phone:
                              </span>

                              {winner.phoneNumber ? (
                                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                  <strong className="font-mono text-slate-900 font-bold">
                                    {winner.phoneNumber}
                                  </strong>
                                  <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] font-bold text-slate-600 uppercase">
                                    {winner.network || 'MTN'}
                                  </span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(winner.phoneNumber);
                                      setFeedback(`Copied ${winner.phoneNumber} to clipboard!`);
                                    }}
                                    className="text-slate-400 hover:text-slate-700 ml-1 cursor-pointer"
                                    title="Copy Phone Number"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <a
                                    href={`https://wa.me/234${winner.phoneNumber.replace(/^0/, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-600 hover:text-emerald-800 ml-1 cursor-pointer"
                                    title="Message via WhatsApp"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-xs">
                                  Student has not entered phone number yet
                                </span>
                              )}

                              <button
                                onClick={() => {
                                  setEditingWinnerId(isEditing ? null : winner.id);
                                  setEditPhone(winner.phoneNumber || '');
                                  setEditNetwork(winner.network || 'MTN');
                                }}
                                className="text-[11px] text-amber-700 hover:text-amber-800 underline font-semibold ml-1 cursor-pointer"
                              >
                                {isEditing ? 'Cancel Edit' : winner.phoneNumber ? 'Change' : 'Enter Phone Manually'}
                              </button>
                            </div>

                            {winner.notes && (
                              <p className="text-[11px] text-slate-500 bg-white/80 p-2 rounded-lg border border-slate-200 mt-1">
                                Note: {winner.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status Badge & Actions */}
                        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 border-slate-200/80 pt-3 lg:pt-0">
                          <div>
                            {isFulfilled ? (
                              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Airtime Recharged</span>
                              </span>
                            ) : isReady ? (
                              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                                <Smartphone className="w-3.5 h-3.5 text-amber-700" />
                                <span>Ready to Disburse Airtime</span>
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Awaiting Phone Number</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {!isFulfilled ? (
                              <button
                                onClick={() => handleFulfillAirtime(winner.id)}
                                disabled={fulfillingId === winner.id}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{fulfillingId === winner.id ? 'Updating...' : 'Mark as Airtime Sent'}</span>
                              </button>
                            ) : (
                              <div className="text-[11px] text-slate-400 text-right">
                                Fulfilled on {winner.fulfilledAt ? new Date(winner.fulfilledAt).toLocaleDateString() : 'Active'}
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Inline Phone Edit Form */}
                      {isEditing && (
                        <div className="mt-4 pt-4 border-t border-slate-200/80 bg-white p-4 rounded-xl space-y-3">
                          <div className="text-xs font-bold text-slate-800">
                            Enter or Update {winner.studentName}’s Phone Number (Received via WhatsApp/Email):
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                            <div className="sm:col-span-6">
                              <input
                                type="tel"
                                placeholder="08012345678"
                                value={editPhone}
                                onChange={(e) => setEditPhone(e.target.value)}
                                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                              />
                            </div>
                            <div className="sm:col-span-4">
                              <select
                                value={editNetwork}
                                onChange={(e) => setEditNetwork(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                              >
                                <option value="MTN">MTN Nigeria</option>
                                <option value="Airtel">Airtel Nigeria</option>
                                <option value="Glo">Glo</option>
                                <option value="9mobile">9mobile</option>
                                <option value="OPay">OPay</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2 flex items-center gap-1">
                              <button
                                onClick={() => handleSaveWinnerPhone(winner.id)}
                                className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: ADMIN EMAIL ALERTS & ACTIVITY LOG */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl sm:text-2xl font-black font-['Outfit']">
                  Admin Email Notifications & Alert Feed
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                All platform updates (Winner phone claims, payment proofs, monthly champion snapshots) dispatch alerts directly to your personal email: <strong className="text-amber-300 font-mono">luvkidjaja@gmail.com</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={handleTestEmail}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Test Alert to luvkidjaja@gmail.com</span>
              </button>

              {unreadNotifsCount > 0 && (
                <button
                  onClick={handleMarkAllNotifsRead}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Mark All as Read</span>
                </button>
              )}
            </div>
          </div>

          {testEmailStatus && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between">
              <span>{testEmailStatus}</span>
              <button onClick={() => setTestEmailStatus(null)} className="text-amber-700 hover:text-amber-950">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Notifications Log */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  Notification Dispatch Records ({adminNotifications.length})
                </h3>
                {unreadNotifsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                    {unreadNotifsCount} New
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-mono">Receiver: luvkidjaja@gmail.com</span>
            </div>

            {adminNotifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                <p className="text-xs">No notifications recorded yet. Click &quot;Test Alert&quot; above to verify!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {adminNotifications.map((notif) => {
                  const badgeMap: Record<string, { label: string; color: string; icon: string }> = {
                    prize_claim: { label: 'Winner Phone Claim', color: 'bg-amber-100 text-amber-900 border-amber-300', icon: '🎁' },
                    monthly_winners: { label: 'Monthly Winners', color: 'bg-purple-100 text-purple-900 border-purple-300', icon: '🏆' },
                    payment_pending: { label: 'Payment Proof', color: 'bg-cyan-100 text-cyan-900 border-cyan-300', icon: '💳' },
                    system: { label: 'System Alert', color: 'bg-slate-100 text-slate-800 border-slate-300', icon: '⚙️' }
                  };
                  const badge = badgeMap[notif.type] || badgeMap.system;

                  return (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        notif.read ? 'bg-slate-50/70 border-slate-200' : 'bg-amber-50/20 border-amber-300 shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{badge.icon}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${badge.color}`}>
                            {badge.label}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                            {notif.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(notif.timestamp).toLocaleString()}</span>
                          {!notif.read && (
                            <button
                              onClick={() => handleMarkNotifRead(notif.id)}
                              className="text-amber-700 hover:text-amber-900 font-bold underline ml-2 cursor-pointer"
                            >
                              Mark Read
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-2 whitespace-pre-line leading-relaxed pl-7">
                        {notif.message}
                      </p>

                      {notif.metadata && (
                        <div className="mt-2 pl-7">
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-[11px] text-slate-700 overflow-x-auto">
                            {Object.entries(notif.metadata).map(([k, v]) => (
                              <div key={k} className="flex gap-2">
                                <span className="text-slate-400">{k}:</span>
                                <strong>{String(v)}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-2 pl-7 flex items-center gap-2 text-[10px] text-slate-400">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>Dispatched to target email: <strong className="text-slate-600 font-mono">{notif.emailSentTo}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: QUESTIONS MANAGEMENT (Add, Edit, Delete) */}
      {activeTab === 'questions' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Exam Question Management
              </h3>
              <p className="text-xs text-slate-500">
                Add, edit, or delete past questions across English, Math, Sciences, and Arts.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingQuestionId(null);
                setQuestionForm({
                  subjectId: 'english',
                  topic: '',
                  examType: 'JAMB',
                  year: 2027,
                  question: '',
                  options: { A: '', B: '', C: '', D: '' },
                  correctOption: 'A',
                  explanation: '',
                  difficulty: 'Medium'
                });
                setIsQuestionModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Question</span>
            </button>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px]">
                      {q.subjectName}
                    </span>
                    <span className="text-slate-500 text-[11px]">• {q.topic}</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                      [{q.examType} {q.year}]
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingQuestionId(q.id);
                        setQuestionForm({
                          subjectId: q.subjectId,
                          topic: q.topic,
                          examType: q.examType,
                          year: q.year || 2027,
                          question: q.question,
                          options: { ...q.options },
                          correctOption: q.correctOption,
                          explanation: q.explanation,
                          difficulty: q.difficulty || 'Medium'
                        });
                        setIsQuestionModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-200"
                      title="Edit question"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50"
                      title="Delete question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  {q.question}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  {(['A', 'B', 'C', 'D'] as const).map(opt => (
                    <div
                      key={opt}
                      className={`p-2 rounded-lg border ${
                        q.correctOption === opt
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <span className="font-mono mr-1">({opt})</span>
                      {q.options[opt]}
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-100">
                  <span className="font-bold text-emerald-800">Teacher's Explanation: </span>
                  {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUBJECTS & TOPICS */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Subjects & Topics Directory</h3>
              <p className="text-xs text-slate-500">Add new subjects or append syllabus topics.</p>
            </div>
            <button
              onClick={() => setIsSubjectModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map(sub => (
              <div key={sub.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{sub.name} ({sub.code})</span>
                  <span className="text-xs text-slate-400">{sub.topics.length} topics</span>
                </div>
                <p className="text-xs text-slate-600">{sub.description}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {sub.topics.map((t, tIdx) => (
                    <span key={tIdx} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ARTICLES MANAGEMENT */}
      {activeTab === 'articles' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Study Tips & Articles</h3>
              <p className="text-xs text-slate-500">Publish guidelines, marking schemes, and revision tricks.</p>
            </div>
            <button
              onClick={() => setIsArticleModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Publish New Guide</span>
            </button>
          </div>

          <div className="space-y-3">
            {articles.map(art => (
              <div key={art.id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                    {art.category}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">{art.title}</h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">By {art.author} • {art.readTime}</div>
                </div>

                <button
                  onClick={() => handleDeleteArticle(art.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  title="Delete article"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: CHAMPIONS LEAGUE AI BATTLE (ADMIN 100% WIN EXCLUSIVE) */}
      {activeTab === 'champions-ai' && (
        <div className="space-y-6">
          {showCutscene ? (
            <AdminChampionsCutscene
              onComplete={() => setShowCutscene(false)}
              adminName={user?.name || 'Administrator'}
              onOpenFullscreenModal={() => setIsAdminFullscreenIntroOpen(true)}
            />
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black uppercase font-mono">
                      Site Owner Godmode
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-bold">
                      Guaranteed Victory Mode
                    </span>
                  </div>
                  <h3 className="font-black text-lg text-slate-900 font-['Outfit'] mt-1">
                    🏆 Champions League AI Battle Arena
                  </h3>
                  <p className="text-xs text-slate-500">
                    Play the tournament matches against AI opponents (Round of 32, 16, Quarters, Semis, and 4-Subject Final). Admin is scripted to win every game!
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowCutscene(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    <span>🎬 Replay Intro Cutscene</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAdminFullscreenIntroOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-xs font-bold border border-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Open Fullscreen UEFA Champions Intro Modal"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                    <span>📺 Fullscreen Intro Modal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      tournamentManager.resetTournament(user);
                      fetch('/api/tournament/reset', { method: 'POST' }).catch(() => {});
                      setFeedback('Champions League has been reset to upcoming state! Nobody has won yet. Countdown is live.');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reset Tournament (Nobody Has Won)</span>
                  </button>
                </div>
              </div>

              <AdminChampionsAiBattle
                user={user}
                onNavigate={onNavigate}
                onUserUpgraded={onUserUpgraded}
              />
            </>
          )}
        </div>
      )}

      {/* TAB: PAYMENT APPROVALS QUEUE (OPTION A) */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Option A • Direct OPay Verification Queue</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
                  Payment Approvals Queue
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Check your phone's OPay app ({paymentConfig.accountNumber} - {paymentConfig.accountName}) for incoming credit alerts, then click Approve to activate student subscriptions.
                </p>
              </div>

              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Queue</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Pending Review</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-2xl font-black text-amber-950 font-['Outfit']">
                    {paymentsQueue.filter(p => p.status === 'pending').length}
                  </span>
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-[10px] text-amber-700 mt-1">Requires your approval</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Approved & Active</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-2xl font-black text-emerald-950 font-['Outfit']">
                    {paymentsQueue.filter(p => p.status === 'approved').length}
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-[10px] text-emerald-700 mt-1">Activated students</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Total Submissions</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-2xl font-black text-slate-900 font-['Outfit']">
                    {paymentsQueue.length}
                  </span>
                  <CreditCard className="w-5 h-5 text-slate-500" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">All recorded attempts</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950 text-white border border-emerald-800">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Verified Revenue</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xl sm:text-2xl font-black text-emerald-300 font-['Outfit']">
                    ₦{paymentsQueue
                      .filter(p => p.status === 'approved')
                      .reduce((sum, p) => sum + p.amount, 0)
                      .toLocaleString()}
                  </span>
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-[10px] text-emerald-200/70 mt-1">Credited to OPay</p>
              </div>
            </div>

            {/* Verification Instruction Banner */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <Smartphone className="w-4 h-4" />
                <span>How to verify student payments (Option A):</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] font-bold text-emerald-400 block mb-1">Step 1: Check Phone</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Open your <strong>OPay App</strong> ({paymentConfig.accountNumber}). Look for the incoming transfer matching the student's name and amount.
                  </p>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] font-bold text-emerald-400 block mb-1">Step 2: Match Details</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Check the <strong>Sender Name</strong> and <strong>Bank</strong> below. If the money has hit your balance, proceed to approve.
                  </p>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] font-bold text-emerald-400 block mb-1">Step 3: One-Click Activate</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Click <strong>"Approve & Activate"</strong>. The student's account is instantly upgraded for 30 days without needing any bank API keys!
                  </p>
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'All Submissions', count: paymentsQueue.length },
                  { id: 'pending', label: 'Pending', count: paymentsQueue.filter(p => p.status === 'pending').length },
                  { id: 'approved', label: 'Approved', count: paymentsQueue.filter(p => p.status === 'approved').length },
                  { id: 'rejected', label: 'Rejected', count: paymentsQueue.filter(p => p.status === 'rejected' && !p.isTrollFlagged).length },
                  { id: 'trolls', label: 'Flagged Trolls 🚫', count: paymentsQueue.filter(p => !!p.isTrollFlagged).length }
                ].map(flt => (
                  <button
                    key={flt.id}
                    type="button"
                    onClick={() => setPaymentsFilter(flt.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentsFilter === flt.id
                        ? flt.id === 'trolls'
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-900 text-white'
                        : flt.id === 'trolls' && flt.count > 0
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {flt.label} ({flt.count})
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-400">
                Showing {paymentsQueue.filter(p => paymentsFilter === 'all' ? true : paymentsFilter === 'trolls' ? !!p.isTrollFlagged : p.status === paymentsFilter).length} payments
              </span>
            </div>

            {/* Payments List */}
            <div className="space-y-3 pt-2">
              {paymentsQueue
                .filter(p => paymentsFilter === 'all' ? true : paymentsFilter === 'trolls' ? !!p.isTrollFlagged : p.status === paymentsFilter)
                .length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h3 className="font-bold text-slate-700 text-sm">No payment records found</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {paymentsFilter === 'pending'
                        ? 'Awesome! All student payment submissions have been reviewed.'
                        : paymentsFilter === 'trolls'
                        ? 'No users currently flagged as trolls.'
                        : 'No transactions recorded under this filter yet.'}
                    </p>
                  </div>
                ) : (
                  paymentsQueue
                    .filter(p => paymentsFilter === 'all' ? true : paymentsFilter === 'trolls' ? !!p.isTrollFlagged : p.status === paymentsFilter)
                    .map(payment => {
                      const isProcessing = processingPaymentRef === payment.reference;
                      const isPending = payment.status === 'pending';
                      const isApproved = payment.status === 'approved';
                      const isRejected = payment.status === 'rejected';
                      const isTroll = !!payment.isTrollFlagged;

                      return (
                        <div
                          key={payment.reference || payment.id}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                            isTroll
                              ? 'bg-red-50/50 border-red-300 ring-1 ring-red-500/30'
                              : isPending
                              ? 'bg-amber-50/40 border-amber-200 ring-1 ring-amber-500/20 shadow-xs'
                              : isApproved
                              ? 'bg-white border-emerald-200 hover:border-emerald-300'
                              : 'bg-slate-50 border-slate-200 opacity-75'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Student & Plan info */}
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-slate-900 text-sm sm:text-base font-['Outfit']">
                                  {payment.userName}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  {payment.planName} • ₦{payment.amount.toLocaleString()}
                                </span>
                                {isTroll && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white flex items-center gap-1 shadow-xs">
                                    <ShieldAlert className="w-3 h-3 text-white" />
                                    <span>FLAGGED TROLL (ACCOUNT SUSPENDED)</span>
                                  </span>
                                )}
                                {!isTroll && isPending && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Awaiting OPay Check</span>
                                  </span>
                                )}
                                {!isTroll && isApproved && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                    <span>Approved & Active</span>
                                  </span>
                                )}
                                {!isTroll && isRejected && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 flex items-center gap-1">
                                    <XCircle className="w-3 h-3 text-red-500" />
                                    <span>Rejected</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                                {payment.userEmail && <span>Email: <strong className="text-slate-700">{payment.userEmail}</strong></span>}
                                {payment.userPhone && <span>Phone: <strong className="text-slate-700">{payment.userPhone}</strong></span>}
                                <span>Ref: <strong className="font-mono text-slate-700">{payment.reference}</strong></span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-slate-100/80 text-[11px] text-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-2 mt-2">
                                <div>
                                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Sender Name</span>
                                  <strong className="text-slate-900 truncate block">{payment.senderAccountName || payment.userName}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Sender Bank</span>
                                  <strong className="text-slate-900 truncate block">{payment.senderBank || 'Bank Transfer'}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase text-slate-400 font-bold block">NIP Session / Tx ID</span>
                                  <div className="flex items-center gap-1">
                                    <strong className="text-slate-900 font-mono text-[10px] truncate max-w-[120px]" title={payment.bankSessionId || 'N/A'}>
                                      {payment.bankSessionId || 'Not provided'}
                                    </strong>
                                    {payment.bankSessionId && (
                                      <button
                                        type="button"
                                        onClick={() => copyBankToClipboard(payment.bankSessionId!, 'sess-' + payment.reference)}
                                        className="text-[9px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 cursor-pointer font-bold"
                                        title="Copy Session ID for OPay Statement lookup"
                                      >
                                        {copiedBankField === 'sess-' + payment.reference ? 'Copied' : 'Copy'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Submitted At</span>
                                  <span className="text-slate-600">
                                    {new Date(payment.submittedAt || payment.createdAt).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              {/* Proof of Payment / Receipt Screenshot Button */}
                              {payment.receiptScreenshotUrl && (
                                <div className="pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewReceiptModal({
                                      url: payment.receiptScreenshotUrl!,
                                      title: `Transfer Receipt: ${payment.userName} (${payment.planName})`,
                                      sender: payment.senderAccountName || payment.userName,
                                      amount: payment.amount,
                                      sessionId: payment.bankSessionId
                                    })}
                                    className="inline-flex items-center gap-2 p-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                  >
                                    <img
                                      src={payment.receiptScreenshotUrl}
                                      alt="Receipt thumb"
                                      className="w-6 h-6 object-cover rounded border border-blue-300"
                                    />
                                    <span>View Uploaded Transfer Receipt 🧾</span>
                                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                                  </button>
                                </div>
                              )}

                              {payment.aiAuditNotes && (
                                <p className="text-[11px] text-slate-500 italic mt-1 bg-white/70 p-2 rounded-lg border border-slate-100">
                                  {payment.aiAuditNotes}
                                </p>
                              )}

                              {isApproved && payment.approvedAt && (
                                <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>
                                    Approved by {payment.approvedBy || 'Inioluwa'} on {new Date(payment.approvedAt).toLocaleString()}
                                  </span>
                                </p>
                              )}

                              {isRejected && payment.rejectionReason && (
                                <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                                  <XCircle className="w-3 h-3 text-red-500" />
                                  <span>Reason: {payment.rejectionReason}</span>
                                </p>
                              )}
                            </div>

                            {/* Actions Column */}
                            <div className="flex items-center gap-2 shrink-0 self-end lg:self-center flex-wrap">
                              {isTroll ? (
                                <button
                                  type="button"
                                  onClick={() => handleUnbanTroll(payment.reference, payment.userName)}
                                  disabled={isProcessing}
                                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                                  <span>Unban Student</span>
                                </button>
                              ) : isPending ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectPayment(payment.reference)}
                                    disabled={isProcessing}
                                    className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleBanTroll(payment.reference, payment.userName)}
                                    disabled={isProcessing}
                                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                    title="Flag user as troll and suspend account"
                                  >
                                    <ShieldAlert className="w-3.5 h-3.5" />
                                    <span>Ban Troll 🚫</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleApprovePayment(payment.reference)}
                                    disabled={isProcessing}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                  >
                                    {isProcessing ? (
                                      <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    )}
                                    <span>Approve & Activate</span>
                                  </button>
                                </>
                              ) : null}

                              {!isTroll && isRejected && (
                                <button
                                  type="button"
                                  onClick={() => handleBanTroll(payment.reference, payment.userName)}
                                  disabled={isProcessing}
                                  className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 font-bold flex items-center gap-1 cursor-pointer"
                                  title="Flag user as troll and suspend account"
                                >
                                  <ShieldAlert className="w-3 h-3" />
                                  <span>Ban as Troll 🚫</span>
                                </button>
                              )}

                              {isApproved && (
                                <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Account Active</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: OPAY & BANKING SETUP */}
      {activeTab === 'banking' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Active & Receiving Funds</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-['Outfit']">
                  OPay Receiving Bank Account
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  All student subscriptions from OPay, PalmPay, Kuda, and commercial banks are paid directly into this account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingPayment(!isEditingPayment)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingPayment ? 'Cancel Editing' : 'Edit Account Details'}</span>
              </button>
            </div>

            {/* Current Active Account Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950 to-slate-900 text-white shadow-lg space-y-4 border border-emerald-800/40">
              <div className="flex items-center justify-between border-b border-emerald-800/50 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-300">OPay Digital Services (PayCom)</span>
                </div>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-semibold border border-emerald-500/30">
                  Verified Settlement Account
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-900/40 p-3.5 rounded-xl border border-emerald-700/40">
                  <span className="text-[11px] text-emerald-300 uppercase font-semibold block">OPay Account Number</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-widest">
                      {paymentConfig.accountNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyBankToClipboard(paymentConfig.accountNumber, 'acct')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copy Account Number"
                    >
                      {copiedBankField === 'acct' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-emerald-900/40 p-3.5 rounded-xl border border-emerald-700/40">
                  <span className="text-[11px] text-emerald-300 uppercase font-semibold block">Account Beneficiary Name</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm sm:text-base font-black text-emerald-300 tracking-wide">
                      {paymentConfig.accountName}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyBankToClipboard(paymentConfig.accountName, 'name')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copy Beneficiary Name"
                    >
                      {copiedBankField === 'name' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs text-emerald-200/80 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero API Key Required: Students send funds directly from OPay, PalmPay, or bank apps to this account, and our automated AI reconciliation verifies transactions in seconds.</span>
              </div>
            </div>

            {/* Edit Form (if toggled) */}
            {isEditingPayment && (
              <form onSubmit={handleSavePaymentConfig} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-slate-600" />
                  <span>Update Receiving Bank Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bank Name / Gateway</label>
                    <input
                      type="text"
                      required
                      value={paymentConfig.bankName}
                      onChange={e => setPaymentConfig({ ...paymentConfig, bankName: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                      placeholder="e.g. OPay (PayCom)"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">OPay Account Number</label>
                    <input
                      type="text"
                      required
                      value={paymentConfig.accountNumber}
                      onChange={e => setPaymentConfig({ ...paymentConfig, accountNumber: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-sm bg-white"
                      placeholder="e.g. 9166059676"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Account Beneficiary Name (Full Name)</label>
                    <input
                      type="text"
                      required
                      value={paymentConfig.accountName}
                      onChange={e => setPaymentConfig({ ...paymentConfig, accountName: e.target.value })}
                      className="w-full p-2.5 border border-slate-300 rounded-xl font-bold bg-white"
                      placeholder="e.g. INIOLUWA JESULEJE MICHAEL"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingPayment(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingPayment}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs"
                  >
                    {savingPayment ? 'Saving...' : 'Save & Apply to Checkout'}
                  </button>
                </div>
              </form>
            )}

            {/* Educational / Explanatory Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-2">
                  1
                </div>
                <h4 className="font-bold text-xs text-slate-900">Student Selects Plan</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Student clicks Subscribe on Basic, Medium, or Premium and sees your <strong>OPay account (9166059676)</strong> with 1-click copy.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm mb-2">
                  2
                </div>
                <h4 className="font-bold text-xs text-slate-900">Direct Bank Transfer</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  They transfer from their OPay app, PalmPay, Kuda, GTBank, Zenith, Access, etc. You receive instant credit in your OPay app.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm mb-2">
                  3
                </div>
                <h4 className="font-bold text-xs text-slate-900">AI Instant Verification</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  The student clicks "Confirm Payment with AI". The AI confirms the credit against your account name and immediately unlocks their subscription!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUESTION MODAL (Add / Edit) */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingQuestionId ? 'Edit Question' : 'Add New Exam Question'}
              </h3>
              <button onClick={() => setIsQuestionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={questionForm.subjectId}
                    onChange={e => setQuestionForm({ ...questionForm, subjectId: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exam</label>
                  <select
                    value={questionForm.examType}
                    onChange={e => setQuestionForm({ ...questionForm, examType: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="JAMB">JAMB</option>
                    <option value="WAEC">WAEC</option>
                    <option value="ALL">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={questionForm.year}
                    onChange={e => setQuestionForm({ ...questionForm, year: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calculus or Lexis & Structure"
                  value={questionForm.topic}
                  onChange={e => setQuestionForm({ ...questionForm, topic: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Text</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter the full question stem..."
                  value={questionForm.question}
                  onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Options A-D */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">Options (A, B, C, D)</label>
                {(['A', 'B', 'C', 'D'] as const).map(opt => (
                  <div key={opt} className="flex items-center gap-2">
                    <span className="w-6 font-bold text-slate-500">{opt}.</span>
                    <input
                      type="text"
                      required
                      placeholder={`Option ${opt} text`}
                      value={questionForm.options[opt]}
                      onChange={e => setQuestionForm({
                        ...questionForm,
                        options: { ...questionForm.options, [opt]: e.target.value }
                      })}
                      className="flex-1 p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correct Answer</label>
                  <select
                    value={questionForm.correctOption}
                    onChange={e => setQuestionForm({ ...questionForm, correctOption: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={questionForm.difficulty}
                    onChange={e => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teacher's Explanation & Solution</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why the answer is correct..."
                  value={questionForm.explanation}
                  onChange={e => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-sm"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBJECT MODAL */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Add Subject / Topics</h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Further Mathematics or Literature in English"
                  value={subjectForm.name}
                  onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Code</label>
                <input
                  type="text"
                  placeholder="e.g. LIT or FMTH"
                  value={subjectForm.code}
                  onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short syllabus summary..."
                  value={subjectForm.description}
                  onChange={e => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Topics (Comma-separated)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Prose & Poetry, Dramatic Techniques, Shakespearean Tragedy"
                  value={subjectForm.topics}
                  onChange={e => setSubjectForm({ ...subjectForm, topics: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-sm"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ARTICLE MODAL */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Publish Study Tip Article</h3>
              <button onClick={() => setIsArticleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How to Tackle WAEC Practical Physics"
                  value={articleForm.title}
                  onChange={e => setArticleForm({ ...articleForm, title: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={articleForm.category}
                    onChange={e => setArticleForm({ ...articleForm, category: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="JAMB">JAMB</option>
                    <option value="WAEC">WAEC</option>
                    <option value="Time Management">Time Management</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Read Time</label>
                  <input
                    type="text"
                    value={articleForm.readTime}
                    onChange={e => setArticleForm({ ...articleForm, readTime: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Summary / Excerpt</label>
                <input
                  type="text"
                  placeholder="Brief synopsis..."
                  value={articleForm.excerpt}
                  onChange={e => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Article Content (Markdown)</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Write the article content..."
                  value={articleForm.content}
                  onChange={e => setArticleForm({ ...articleForm, content: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-sm"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Receipt Full-Screen Inspection Modal */}
      {previewReceiptModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewReceiptModal(null);
          }}
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl border border-slate-200 text-slate-800 animate-in fade-in zoom-in-95 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{previewReceiptModal.title}</h3>
                <span className="text-[11px] text-slate-500">
                  Sender: <strong>{previewReceiptModal.sender}</strong> • Amount: <strong>₦{previewReceiptModal.amount.toLocaleString()}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewReceiptModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewReceiptModal.sessionId && (
              <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs font-mono flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-emerald-800 font-sans font-bold block">NIP Session / Transaction ID</span>
                  <strong className="text-emerald-950">{previewReceiptModal.sessionId}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => copyBankToClipboard(previewReceiptModal.sessionId!, 'modal-sess')}
                  className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-1 rounded border border-emerald-300 font-sans font-bold cursor-pointer hover:bg-emerald-200"
                >
                  {copiedBankField === 'modal-sess' ? 'Copied!' : 'Copy ID'}
                </button>
              </div>
            )}

            <div className="max-h-[60vh] overflow-auto rounded-xl border border-slate-200 bg-slate-900/5 flex items-center justify-center p-2">
              <img
                src={previewReceiptModal.url}
                alt="Transfer Receipt Screenshot"
                className="max-w-full h-auto object-contain rounded-lg shadow-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">Verify this receipt against your OPay statement before approving</span>
              <button
                type="button"
                onClick={() => setPreviewReceiptModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
