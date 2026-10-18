import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Crown, 
  Swords, 
  Award, 
  Copy, 
  Check, 
  Share2, 
  ExternalLink, 
  AlertTriangle,
  QrCode,
  Sparkles,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { VerifiedArenaMatch } from '../types';

interface MatchVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  onNavigateToArena?: () => void;
}

export const MatchVerificationModal: React.FC<MatchVerificationModalProps> = ({
  isOpen,
  onClose,
  initialCode = '',
  onNavigateToArena
}) => {
  const [query, setQuery] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifiedArenaMatch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (initialCode && isOpen) {
      setQuery(initialCode);
      handleVerify(initialCode);
    } else if (isOpen && !query) {
      // Default to demo sample so user sees what it does immediately
      setQuery('SN-ARENA-CHAMP26');
      handleVerify('SN-ARENA-CHAMP26');
    }
  }, [initialCode, isOpen]);

  if (!isOpen) return null;

  const handleVerify = async (codeToVerify?: string) => {
    const target = (codeToVerify || query).trim();
    if (!target) {
      setError('Please enter a Match ID or Verification Code');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.verifyArenaMatch(target);
      if (data.success && data.match) {
        setResult(data.match);
      } else {
        setError('Match record could not be confirmed.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unverified match claim. No official StudyNaija duel was recorded under this code.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyShareLink = (match: VerifiedArenaMatch) => {
    const url = `${window.location.origin}?verifyMatch=${encodeURIComponent(match.verificationCode || match.matchId)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppShare = (match: VerifiedArenaMatch) => {
    const winnerName = match.winnerName || 'Winner';
    const opponentName = match.player1.isWinner ? match.player2.name : match.player1.name;
    const url = `${window.location.origin}?verifyMatch=${encodeURIComponent(match.verificationCode || match.matchId)}`;
    const text = `🇳🇬 *StudyNaija 1v1 Arena Verified Result Slip*\n` +
      `🏆 Certified Winner: *${winnerName}* (${match.winnerScore} pts)\n` +
      `👤 Opponent: *${opponentName}* (${match.loserScore} pts)\n` +
      `🔒 Verification Code: *${match.verificationCode}*\n` +
      `🛡️ Verification Status: *CERTIFIED GENUINE*\n\n` +
      `Check official proof on StudyNaija: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>StudyNaija Academic Arena Ledger • Anti-Cheat Verification</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] text-white">
            Verify 1v1 Duel & Match Results
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Wondering if someone messaging you that they won is telling the truth? Enter their <strong>Match ID</strong> or <strong>Verification Code</strong> below to check the official StudyNaija server records.
          </p>
        </div>

        {/* Search Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="space-y-2"
        >
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-3.5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. SN-ARENA-CHAMP26 or match_xxx"
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl pl-11 pr-28 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors uppercase font-mono"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          {/* Quick Demo Helpers */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
            <span>Quick test:</span>
            <button
              type="button"
              onClick={() => {
                setQuery('SN-ARENA-CHAMP26');
                handleVerify('SN-ARENA-CHAMP26');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono border border-slate-700 transition"
            >
              SN-ARENA-CHAMP26
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery('FAKE-CODE-999');
                handleVerify('FAKE-CODE-999');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 font-mono border border-slate-700 transition"
            >
              Test Fake Code
            </button>
          </div>
        </form>

        {/* VERIFICATION OUTCOME */}
        {loading && (
          <div className="p-8 text-center space-y-3 bg-slate-950/60 rounded-2xl border border-slate-800">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-300 font-medium">
              Consulting StudyNaija Academic Ledger & Anti-Cheat Database...
            </p>
          </div>
        )}

        {/* ERROR / UNVERIFIED FAKE CLAIM NOTICE */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-rose-950/40 border-2 border-rose-500/50 space-y-3 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                <XCircle className="w-6 h-6 text-rose-400" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider font-extrabold text-rose-400 block">
                  VERIFICATION FAILED: UNCONFIRMED RECORD
                </span>
                <h3 className="text-base font-black text-white">
                  No Official Match Found For Code &ldquo;{query}&rdquo;
                </h3>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  Anyone can send a text message or edit a screenshot claiming they won a duel, but <strong>only genuine StudyNaija matches</strong> are logged in our central database. This claim cannot be verified and is likely fabricated.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-rose-500/20 text-[11px] text-slate-300">
              💡 <strong>How to catch fake claims:</strong> Ask the person for their official 8-digit StudyNaija Verification Code (starts with <code>SN-ARENA-</code>) or direct verification link. Genuine matches always provide one immediately upon duel completion.
            </div>
          </div>
        )}

        {/* GENUINE VERIFIED RESULT CERTIFICATE */}
        {!loading && result && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-950 via-emerald-950/40 to-slate-950 border-2 border-emerald-500/80 shadow-2xl space-y-6 animate-fade-in relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute top-2 right-4 text-emerald-400/10 pointer-events-none select-none">
              <ShieldCheck className="w-48 h-48 -mr-10 -mt-10" />
            </div>

            {/* Certificate Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-emerald-500/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-black shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest font-black text-emerald-400 block">
                    OFFICIALLY CERTIFIED MATCH RECORD
                  </span>
                  <h3 className="text-lg font-black font-['Outfit'] text-white">
                    StudyNaija Academic Arena Ledger
                  </h3>
                </div>
              </div>

              <div className="text-right font-mono text-[11px] bg-slate-900/80 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Verification Hash</span>
                <span className="text-emerald-300 font-bold">{result.verificationHash}</span>
              </div>
            </div>

            {/* Winner vs Opponent Scoreboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Winner Card */}
              <div className="p-5 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500/80 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    <Trophy className="w-3.5 h-3.5 text-amber-300" />
                    <span>CERTIFIED WINNER</span>
                  </span>
                  <span className="font-mono text-xs font-black text-emerald-400">
                    {result.winnerScore} PTS
                  </span>
                </div>
                <div className="text-lg font-black text-white font-['Outfit'] truncate">
                  {result.winnerName || 'Winner'}
                </div>
                <p className="text-xs text-emerald-200">
                  {result.player1.isWinner ? result.player1.correctCount : result.player2.correctCount} of 10 questions answered correctly.
                </p>
                <div className="pt-2 text-[10px] text-amber-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Prize: {result.prizeClaimStatus}</span>
                </div>
              </div>

              {/* Opponent Card */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">
                    OPPONENT / RIVAL
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-300">
                    {result.loserScore} PTS
                  </span>
                </div>
                <div className="text-lg font-black text-slate-200 font-['Outfit'] truncate">
                  {result.player1.isWinner ? result.player2.name : result.player1.name}
                </div>
                <p className="text-xs text-slate-400">
                  {result.player1.isWinner ? result.player2.correctCount : result.player1.correctCount} of 10 questions answered correctly.
                </p>
                <div className="pt-2 text-[10px] text-slate-400">
                  Margin: {result.winnerScore - result.loserScore} points differential
                </div>
              </div>

            </div>

            {/* Match Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Match Code</span>
                <span className="font-mono font-bold text-emerald-300">{result.verificationCode}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Date Played</span>
                <span className="font-medium text-slate-200">
                  {new Date(result.playedAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                <span className="font-medium text-slate-200">{result.durationSeconds}s rapid clock</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Authenticity</span>
                <span className="text-emerald-400 font-bold">100% Genuine</span>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyCode(result.verificationCode)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer flex items-center gap-1.5"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyShareLink(result)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ExternalLink className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied' : 'Copy Share Link'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleWhatsAppShare(result)}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ml-auto"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Proof to WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom CTA to Play in Arena */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Ready to challenge students in real-time?</span>
          {onNavigateToArena && (
            <button
              onClick={() => {
                onClose();
                onNavigateToArena();
              }}
              className="text-emerald-400 hover:text-emerald-300 font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              <span>Enter 1v1 Arena</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
