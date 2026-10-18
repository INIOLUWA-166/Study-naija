import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Ban, 
  Clock, 
  Search, 
  RefreshCw, 
  Zap, 
  CheckCircle2, 
  X, 
  Copy, 
  Check, 
  Terminal, 
  Activity, 
  UserX, 
  UserCheck, 
  Filter,
  Eye,
  Lock,
  Cpu
} from 'lucide-react';
import { SecurityIncident, OffenseType, User } from '../types';
import { api } from '../services/api';

interface AdminSentinelViewProps {
  onRefreshData?: () => void;
  registeredUsers?: User[];
}

export const AdminSentinelView: React.FC<AdminSentinelViewProps> = ({
  onRefreshData,
  registeredUsers = []
}) => {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [stats, setStats] = useState<{
    totalThreatsBlocked: number;
    bannedAccountsCount: number;
    suspendedAccountsCount: number;
    activeProctoringScans: number;
    threatDistribution: Record<string, number>;
    engineVersion: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [selectedThreatType, setSelectedThreatType] = useState<string>('cbt_speed_hack');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'alert' | 'error'; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'major' | 'minor'>('all');
  const [offenseFilter, setOffenseFilter] = useState<string>('all');

  // Manual Sanction Modal State
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [manualAction, setManualAction] = useState<'ban' | 'suspend_24h' | 'suspend_7d'>('ban');
  const [manualReason, setManualReason] = useState('');
  const [actionProcessing, setActionProcessing] = useState(false);
  const [unbanConfirmTarget, setUnbanConfirmTarget] = useState<{ id: string; name: string } | null>(null);
  const [internalUsers, setInternalUsers] = useState<User[]>(registeredUsers);

  const effectiveUsers = internalUsers.length > 0 ? internalUsers : registeredUsers;

  const loadData = async () => {
    setLoading(true);
    try {
      const [incRes, statsRes, usersRes] = await Promise.all([
        api.getSecurityIncidents(),
        api.getSecurityStats(),
        api.getAdminUsers().catch(() => ({ success: false, users: [] }))
      ]);
      if (incRes && incRes.incidents) {
        setIncidents(incRes.incidents);
      }
      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (usersRes && usersRes.users && usersRes.users.length > 0) {
        setInternalUsers(usersRes.users);
      }
    } catch (err) {
      console.error('Failed to load Sentinel AI data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Polling telemetry every 15s
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Run Live Simulated Attack to demonstrate Sentinel AI response
  const handleSimulateThreat = async () => {
    setSimulating(true);
    setFeedback(null);
    try {
      const res = await api.simulateSecurityThreat(selectedThreatType);
      if (res && res.success) {
        setFeedback({
          type: 'alert',
          text: `🚨 Sentinel AI Intercepted Threat: [${res.incident.offenseType.toUpperCase()}] from ${res.incident.userName} — Sanction Executed: [${res.incident.actionTaken.toUpperCase()}]`
        });
        await loadData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Simulation failed to dispatch.' });
    } finally {
      setSimulating(false);
    }
  };

  // Lift Ban / Unban user
  const handleExecuteUnban = async (userId: string, studentName: string) => {
    try {
      const res = await api.unbanUserSecurity(userId);
      if (res && res.success) {
        setFeedback({ type: 'success', text: res.message || `Clean standing restored for ${studentName}` });
        setUnbanConfirmTarget(null);
        await loadData();
        if (onRefreshData) onRefreshData();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to lift ban.' });
    }
  };

  // Execute Manual Sanction from modal
  const handleExecuteManualSanction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId) {
      setFeedback({ type: 'error', text: 'Please select or specify a student account.' });
      return;
    }
    setActionProcessing(true);
    try {
      if (manualAction === 'ban') {
        const res = await api.banUserSecurity(targetUserId, manualReason || 'Permanent ban executed by Admin Sentinel.');
        if (res && res.success) {
          setFeedback({ type: 'success', text: res.message });
        }
      } else {
        const hours = manualAction === 'suspend_7d' ? 168 : 24;
        const res = await api.suspendUserSecurity(targetUserId, hours, manualReason || `Suspended for ${hours} hours.`);
        if (res && res.success) {
          setFeedback({ type: 'success', text: res.message });
        }
      }
      setManualModalOpen(false);
      setTargetUserId('');
      setManualReason('');
      await loadData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to execute sanction.' });
    } finally {
      setActionProcessing(false);
    }
  };

  // Filtered incidents list
  const filteredIncidents = incidents.filter(inc => {
    if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
    if (offenseFilter !== 'all' && inc.offenseType !== offenseFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = inc.userName?.toLowerCase().includes(q);
      const matchEmail = inc.userEmail?.toLowerCase().includes(q);
      const matchOffense = inc.offenseType.toLowerCase().includes(q);
      const matchDetails = inc.details.toLowerCase().includes(q);
      const matchIp = inc.ipAddress?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchOffense && !matchDetails && !matchIp) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Sentinel AI Hero HUD Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-2 border-emerald-500/60 p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-400/60 text-emerald-300 text-xs font-mono font-black flex items-center gap-2 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>SENTINEL AI v4.0 ACTIVE</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-indigo-950 border border-indigo-400/40 text-indigo-300 text-[11px] font-bold">
                Autonomous Anti-Cheat & Malpractice Shield
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black uppercase">
                0.04s Threat Interception
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight text-white">
              Admin Sentinel AI Security Command 🛡️
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Autonomous oversight engine inspecting client answer velocities, CBT DOM integrity, examination malpractice solicitation (&ldquo;runs/expo&rdquo;), and malicious database payloads. Cheaters and hackers are immediately isolated, banned, or suspended.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={() => setManualModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs tracking-wider shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer font-['Outfit']"
            >
              <UserX className="w-4 h-4" />
              <span>MANUALLY BAN / SUSPEND USER</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Security Stream</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Telemetry Radar Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Threats Intercepted</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats ? stats.totalThreatsBlocked : incidents.length}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>Autonomous AI Blocked 100%</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Permanent Bans</span>
            <Ban className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-red-600 font-mono">
            {stats ? stats.bannedAccountsCount : registeredUsers.filter(u => u.isBanned).length}
          </div>
          <div className="text-[10px] text-red-700 font-semibold">
            Critical Offenses & Hacking Payloads
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Active Suspensions</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {stats ? stats.suspendedAccountsCount : registeredUsers.filter(u => u.isSuspended).length}
          </div>
          <div className="text-[10px] text-amber-700 font-semibold">
            Speed-Hacks & Malpractice Strikes
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Proctoring Defense</span>
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600 font-mono">
            32 Nodes
          </div>
          <div className="text-[10px] text-indigo-700 font-semibold">
            Real-Time Integrity Surveillance
          </div>
        </div>
      </div>

      {/* Interactive Threat Simulator Hub (Admin Can Test Sentinel AI Live) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center font-bold">
              ⚡
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white font-['Outfit']">
                Test Sentinel AI Anomaly Detection Live
              </h3>
              <p className="text-[11px] text-slate-400">
                Simulate an automated hack or malpractice attempt to watch the Sentinel AI intercept, categorize, and ban the offender immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedThreatType}
            onChange={e => setSelectedThreatType(e.target.value)}
            className="w-full sm:flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="cbt_speed_hack">⚡ CBT Script Speed-Hack (40 Questions in 2.1s - Inhuman Bot Speed)</option>
            <option value="payload_injection">💉 SQL Injection Attack (&apos; UNION SELECT passwordHash FROM users --)</option>
            <option value="exam_malpractice_solicitation">🚫 Exam Malpractice Solicitation (Requesting Friday Morning JAMB Expo / Runs)</option>
            <option value="score_tampering">🚨 Score Tampering Payload (Tampered JSON: 400/400 with negative time)</option>
            <option value="payment_fraud">💳 Forged Bank Transfer Receipt & Repeated Fake Session ID</option>
          </select>

          <button
            onClick={handleSimulateThreat}
            disabled={simulating}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md hover:scale-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Zap className={`w-3.5 h-3.5 ${simulating ? 'animate-bounce' : ''}`} />
            <span>{simulating ? 'Simulating Threat...' : 'Simulate Threat & Test AI Response'}</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in ${
          feedback.type === 'alert'
            ? 'bg-red-950/90 text-red-200 border-2 border-red-500/70 shadow-lg'
            : feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="p-1 rounded hover:bg-black/10 cursor-pointer shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Incident Stream & Investigation Filter Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
              Live Threat Interception Feed ({filteredIncidents.length})
            </h3>
            <p className="text-xs text-slate-500">
              Real-time audit log of all hacking probes, bot speed-hacks, malpractice solicitations, and automated sanctions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
              Live Surveillance Mode
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search candidate name, email, IP, or offense..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-800"
            />
          </div>

          <div>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value as any)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-800 cursor-pointer"
            >
              <option value="all">All Severity Levels</option>
              <option value="critical">🔴 Critical Severity (Auto-Banned)</option>
              <option value="major">🟠 Major Severity (Suspended)</option>
              <option value="minor">🔵 Minor Severity (Warned / Strike)</option>
            </select>
          </div>

          <div>
            <select
              value={offenseFilter}
              onChange={e => setOffenseFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-slate-800 cursor-pointer"
            >
              <option value="all">All Offense Types</option>
              <option value="cbt_speed_hack">⚡ CBT Speed-Hack (Bot Velocity)</option>
              <option value="payload_injection">💉 Payload / SQL Injection</option>
              <option value="exam_malpractice_solicitation">🚫 Exam Malpractice / Expo Runs</option>
              <option value="score_tampering">🚨 Score & API Tampering</option>
              <option value="payment_fraud">💳 Payment Verification Fraud</option>
              <option value="proctoring_violation">👁️ Proctoring Window Blur Violation</option>
            </select>
          </div>
        </div>

        {/* Incidents Table / Cards */}
        {filteredIncidents.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-extrabold text-sm text-slate-900">Platform Security Perimeter Secure</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No security violations match your filter criteria. Admin Sentinel AI is actively scanning incoming exam sessions.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIncidents.map(inc => {
              const isBanned = inc.actionTaken === 'banned_permanently';
              const isSuspended = inc.actionTaken.startsWith('suspended');

              return (
                <div 
                  key={inc.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                    isBanned
                      ? 'bg-rose-50/60 border-rose-200'
                      : isSuspended
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-mono ${
                        inc.severity === 'critical'
                          ? 'bg-red-600 text-white shadow-xs'
                          : inc.severity === 'major'
                            ? 'bg-amber-500 text-white'
                            : 'bg-blue-600 text-white'
                      }`}>
                        {inc.severity}
                      </span>

                      <span className="font-bold text-xs text-slate-900 font-mono">
                        {inc.offenseType.replace(/_/g, ' ').toUpperCase()}
                      </span>

                      <span className="text-[11px] text-slate-400 font-mono">
                        • {new Date(inc.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-black font-mono tracking-wide ${
                        isBanned
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : isSuspended
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}>
                        {inc.actionTaken.replace(/_/g, ' ').toUpperCase()}
                      </span>

                      {inc.userId && (
                        <button
                          onClick={() => setUnbanConfirmTarget({ id: inc.userId!, name: inc.userName || 'Student' })}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-[11px] rounded-lg shadow-2xs transition cursor-pointer"
                        >
                          Lift Sanction / Unban
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 bg-white/70 p-3 rounded-xl border border-black/5">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Candidate / IP</span>
                      <strong className="text-slate-900">{inc.userName}</strong>
                      <div className="text-[11px] text-slate-500 font-mono truncate">{inc.userEmail}</div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Client IP / Origin</span>
                      <span className="font-mono text-slate-800">{inc.ipAddress || '127.0.0.1 (Local Verified)'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Detection Engine</span>
                      <span className="text-emerald-700 font-bold">{inc.detectedBy}</span>
                    </div>
                  </div>

                  {/* Summary & Evidence */}
                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-800 font-medium">
                      <strong>Sentinel Analysis:</strong> {inc.details}
                    </p>

                    <div className="p-2.5 bg-slate-950 rounded-xl text-emerald-400 font-mono text-[11px] flex items-center justify-between gap-3 overflow-x-auto">
                      <div className="truncate">
                        <span className="text-slate-500 mr-2">$ evidence:</span>
                        <span>{inc.evidence}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(inc.evidence, inc.id)}
                        className="p-1 text-slate-400 hover:text-white rounded transition cursor-pointer shrink-0"
                        title="Copy Evidence Snippet"
                      >
                        {copiedId === inc.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Sanction Modal */}
      {manualModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setManualModalOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                  Manual Sentinel Sanction Console
                </h3>
              </div>
              <button
                onClick={() => setManualModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteManualSanction} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Candidate / Student Account</label>
                {effectiveUsers.length > 0 ? (
                  <select
                    value={targetUserId}
                    onChange={e => setTargetUserId(e.target.value)}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-slate-800"
                  >
                    <option value="">-- Choose student from database --</option>
                    {effectiveUsers.filter(u => u.role !== 'admin').map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) {u.isBanned ? '[ALREADY BANNED]' : (u.isSuspended ? '[SUSPENDED]' : '')}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter Student User ID or Email..."
                    value={targetUserId}
                    onChange={e => setTargetUserId(e.target.value)}
                    required
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Disciplinary Action to Enforce</label>
                <select
                  value={manualAction}
                  onChange={e => setManualAction(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs outline-none font-bold"
                >
                  <option value="ban">🚫 Permanent Account Ban (Block completely from CBT & Arena)</option>
                  <option value="suspend_24h">⏳ 24-Hour Cooling Off Suspension (Minor strike)</option>
                  <option value="suspend_7d">⏳ 7-Day Temporary Suspension (Severe malpractice/tampering)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Violation Reason</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify violation (e.g. Solicitation of exam expo on WhatsApp group, multiple window blur proctoring alerts, or DOM tampering)..."
                  value={manualReason}
                  onChange={e => setManualReason(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionProcessing}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {actionProcessing ? 'Enforcing...' : 'Execute Sanction via Sentinel AI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unban Confirmation Dialog */}
      {unbanConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-slate-900">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black font-['Outfit']">Restore Clean Standing?</h3>
                <p className="text-xs text-slate-500">Lift sanctions for {unbanConfirmTarget.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action will immediately remove all active bans and cooling-off suspensions for <strong>{unbanConfirmTarget.name}</strong>, clear integrity strikes, and restore full CBT Exam & Arena access.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setUnbanConfirmTarget(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleExecuteUnban(unbanConfirmTarget.id, unbanConfirmTarget.name)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
              >
                Yes, Restore Clean Standing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
