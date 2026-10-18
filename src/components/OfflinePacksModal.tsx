import React, { useState, useEffect } from 'react';
import { 
  WifiOff, 
  Download, 
  CheckCircle2, 
  Trash2, 
  X, 
  Zap, 
  HardDrive, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { OfflinePack, User } from '../types';
import { offlinePacksManager } from '../utils/offlinePacksManager';

interface OfflinePacksModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onStartOfflineDrill: (subjectId: string) => void;
}

export const OfflinePacksModal: React.FC<OfflinePacksModalProps> = ({
  isOpen,
  onClose,
  user,
  onStartOfflineDrill
}) => {
  const [packs, setPacks] = useState<OfflinePack[]>(() => offlinePacksManager.getPacks());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setPacks(offlinePacksManager.getPacks());
    };
    window.addEventListener('studynaija_offline_packs_updated', handleUpdate);
    return () => {
      window.removeEventListener('studynaija_offline_packs_updated', handleUpdate);
    };
  }, []);

  if (!isOpen) return null;

  const handleDownload = (packId: string) => {
    setDownloadingId(packId);
    setTimeout(() => {
      offlinePacksManager.downloadPack(packId);
      setDownloadingId(null);
    }, 600);
  };

  const handleDelete = (packId: string) => {
    offlinePacksManager.deletePack(packId);
  };

  const totalDownloadedSize = offlinePacksManager.getTotalDownloadedSizeKb();
  const downloadedCount = packs.filter(p => p.isDownloaded).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-950 text-white border border-cyan-500/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden my-8">
        
        {/* Futuristic Cyber Accents */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <WifiOff className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                  ZERO-DATA // LOW BANDWIDTH ENGINE
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight text-white mt-1">
                Offline Practice Packs
              </h2>
            </div>
          </div>

          {/* Description & Storage Meter */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-300">
                Download questions to your device so you can practice CBT drills even during power outages or when mobile data is exhausted.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <div className="text-xs font-mono">
                <span className="text-cyan-300 font-bold">{totalDownloadedSize} KB</span>
                <span className="text-slate-500"> / {downloadedCount} Packs Active</span>
              </div>
            </div>
          </div>

          {/* Packs List */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {packs.map(pack => (
              <div
                key={pack.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-['Outfit']">
                      {pack.subjectName}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {pack.questionCount} Questions
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ~{pack.sizeKb} KB
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {pack.title}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {pack.isDownloaded ? (
                    <>
                      <button
                        onClick={() => {
                          onClose();
                          onStartOfflineDrill(pack.subjectId);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_12px_rgba(16,185,129,0.4)] flex items-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Practice Offline</span>
                      </button>

                      <button
                        onClick={() => handleDelete(pack.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors cursor-pointer"
                        title="Remove pack to free storage"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleDownload(pack.id)}
                      disabled={downloadingId === pack.id}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-cyan-950 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {downloadingId === pack.id ? (
                        <>
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Pack</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Offline questions sync seamlessly with your overall account stats once reconnected.</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
