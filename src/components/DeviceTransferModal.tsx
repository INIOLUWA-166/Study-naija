import React, { useState } from 'react';
import { Smartphone, Copy, Check, X, ShieldCheck, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface DeviceTransferModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceTransferModal: React.FC<DeviceTransferModalProps> = ({ user, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [syncCode, setSyncCode] = useState<string | null>(null);
  const [expiresInMinutes, setExpiresInMinutes] = useState<number>(30);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.createDeviceSyncCode();
      setSyncCode(res.code);
      setExpiresInMinutes(res.expiresInMinutes || 30);
    } catch (err: any) {
      setError(err.message || 'Failed to generate transfer code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDirectSyncUrl = () => {
    if (!syncCode) return '';
    const base = window.location.origin;
    return `${base}?syncCode=${syncCode}`;
  };

  const handleCopyCode = () => {
    if (!syncCode) return;
    navigator.clipboard.writeText(syncCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const url = getDirectSyncUrl();
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black font-['Outfit'] text-slate-900 leading-tight">
              Switch Phone / Device Sync
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly transfer your login credentials & progress to another phone
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!syncCode ? (
          <div className="space-y-4 py-2">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>How Device Sync Works:</span>
              </div>
              <ul className="space-y-1.5 pl-4 list-disc text-[11px] leading-relaxed">
                <li>Generate a temporary secure <strong>6-digit transfer code</strong> below.</li>
                <li>Open <strong>StudyNaija</strong> on your new phone.</li>
                <li>Click <strong>"New Phone"</strong> on the login screen and enter the code.</li>
                <li>Your subscription, saved exams, and login credentials will be remembered permanently on your new phone!</li>
              </ul>
            </div>

            <button
              onClick={handleGenerateCode}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Generate 6-Digit Transfer Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4 py-1">
            <div className="text-center bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-5 space-y-2">
              <div className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-800">
                Your 6-Digit Transfer Code
              </div>
              <div className="text-4xl font-black font-mono tracking-widest text-emerald-950 select-all py-1">
                {syncCode}
              </div>
              <p className="text-[11px] text-emerald-700">
                Valid for the next <strong>{expiresInMinutes} minutes</strong>
              </p>

              <div className="pt-2 flex gap-2 justify-center">
                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy 1-Click Link'}</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 text-center leading-relaxed">
              Open <strong>StudyNaija</strong> on your new device, choose <strong>"New Phone"</strong> on the sign-in screen, and type <strong>{syncCode}</strong>.
            </div>

            <button
              onClick={handleGenerateCode}
              disabled={loading}
              className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate Fresh Code</span>
            </button>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Signed in as: <strong>{user.email}</strong></span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
