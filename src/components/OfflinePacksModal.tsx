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
  RefreshCw,
  ShieldCheck,
  Database
} from 'lucide-react';
import { OfflinePack, PersonalizedStudyPath, Question, User } from '../types';
import { offlinePacksManager } from '../utils/offlinePacksManager';
import { authStorage } from '../services/api';
import {
  CachedStudyPathRecord,
  ServiceWorkerCacheStatus,
  studyPathCacheManager
} from '../utils/studyPathCache';

interface OfflinePacksModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onStartOfflineDrill: (subjectId: string, customQuestions?: Question[]) => void;
  onStartOfflineStudyPath?: (studyPath: PersonalizedStudyPath) => void;
}

export const OfflinePacksModal: React.FC<OfflinePacksModalProps> = ({
  isOpen,
  onClose,
  user,
  onStartOfflineDrill,
  onStartOfflineStudyPath
}) => {
  const [packs, setPacks] = useState<OfflinePack[]>(() => offlinePacksManager.getPacks());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [cachedStudyPath, setCachedStudyPath] = useState<CachedStudyPathRecord | null>(null);
  const [swStatus, setSwStatus] = useState<ServiceWorkerCacheStatus | null>(null);
  const [isDownloadingPath, setIsDownloadingPath] = useState<boolean>(false);

  const refreshCacheState = async () => {
    setPacks(offlinePacksManager.getPacks());
    const [pathRecord, swStats] = await Promise.all([
      studyPathCacheManager.getCachedStudyPath(user),
      studyPathCacheManager.getServiceWorkerCacheStatus()
    ]);
    setCachedStudyPath(pathRecord);
    setSwStatus(swStats);
  };

  useEffect(() => {
    if (isOpen) {
      void refreshCacheState();
    }
    const handleUpdate = () => {
      void refreshCacheState();
    };
    window.addEventListener('studynaija_offline_packs_updated', handleUpdate);
    window.addEventListener('studynaija_study_path_cache_updated', handleUpdate);
    window.addEventListener('studynaija_sw_status', handleUpdate);
    return () => {
      window.removeEventListener('studynaija_offline_packs_updated', handleUpdate);
      window.removeEventListener('studynaija_study_path_cache_updated', handleUpdate);
      window.removeEventListener('studynaija_sw_status', handleUpdate);
    };
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleDownload = (packId: string) => {
    setDownloadingId(packId);
    setTimeout(() => {
      offlinePacksManager.downloadPack(packId);
      setDownloadingId(null);
      void refreshCacheState();
    }, 400);
  };

  const handleDelete = (packId: string) => {
    offlinePacksManager.deletePack(packId);
    void refreshCacheState();
  };

  const handleDownloadStudyPath = async () => {
    setIsDownloadingPath(true);
    try {
      const record = await studyPathCacheManager.downloadPersonalizedStudyPath(
        user,
        undefined,
        authStorage.getToken()
      );
      setCachedStudyPath(record);
      const swStats = await studyPathCacheManager.getServiceWorkerCacheStatus();
      setSwStatus(swStats);
    } finally {
      setIsDownloadingPath(false);
    }
  };

  const handleDeleteStudyPath = async () => {
    await studyPathCacheManager.removeCachedStudyPath(user);
    await refreshCacheState();
  };

  const handleLaunchStudyPath = () => {
    if (!cachedStudyPath?.studyPath) return;
    onClose();
    if (onStartOfflineStudyPath) {
      onStartOfflineStudyPath(cachedStudyPath.studyPath);
    } else {
      const firstSub = cachedStudyPath.studyPath.modules[0]?.subjectId || 'english';
      onStartOfflineDrill(firstSub, cachedStudyPath.studyPath.questions);
    }
  };

  const totalDownloadedSize = offlinePacksManager.getTotalDownloadedSizeKb() + (cachedStudyPath?.sizeKb || 0);
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
          aria-label="Close offline packs modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 space-y-5">
          
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <WifiOff className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                  SERVICE WORKER CACHE // OFFLINE STUDY ENGINE
                </span>
                {swStatus?.swRegistered && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    <span>SW Active</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight text-white mt-1">
                Offline Study Paths &amp; Packs
              </h2>
            </div>
          </div>

          {/* Storage Meter */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Download your personalized study path and subject question banks into the browser Service Worker cache for zero-data CBT practice.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <div className="text-xs font-mono">
                <span className="text-cyan-300 font-bold">{totalDownloadedSize} KB</span>
                <span className="text-slate-500"> / {downloadedCount + (cachedStudyPath ? 1 : 0)} Cached</span>
              </div>
            </div>
          </div>

          {/* Personalized Study Path Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-900 to-cyan-950/50 border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.12)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                    <Sparkles className="w-3 h-3" />
                    <span>Personalized Study Path</span>
                  </span>
                  {cachedStudyPath && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Cached Offline ({cachedStudyPath.sizeKb} KB)</span>
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-extrabold font-['Outfit'] text-white">
                  {cachedStudyPath?.studyPath.title || `${user?.targetExam || 'JAMB'} Personalized Study Path`}
                </h3>
                <p className="text-xs text-slate-300">
                  {cachedStudyPath
                    ? `${cachedStudyPath.studyPath.modules.length} tailored subject modules • ${cachedStudyPath.studyPath.totalTopics} topics • ${cachedStudyPath.studyPath.totalQuestions} cached CBT questions (Focus: ${cachedStudyPath.studyPath.weakestSubject})`
                    : `Tailored to your ${user?.educationLevel || 'secondary'} syllabus, scheduled planner topics, and priority weak subject (${user?.stats?.weakestSubject || 'Physics'}).`}
                </p>
              </div>
            </div>

            {cachedStudyPath ? (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-500/20">
                <span className="text-[11px] font-mono text-slate-400">
                  Last synced: {new Date(cachedStudyPath.cachedAt).toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLaunchStudyPath}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Practice Path Offline</span>
                  </button>
                  <button
                    onClick={handleDownloadStudyPath}
                    disabled={isDownloadingPath}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-950 text-cyan-300 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                    title="Re-sync personalized study path cache"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDownloadingPath ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={handleDeleteStudyPath}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors cursor-pointer"
                    title="Remove cached study path"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleDownloadStudyPath}
                disabled={isDownloadingPath}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs transition-all shadow-[0_0_18px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isDownloadingPath ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                    <span>Caching Personalized Study Path in Service Worker...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Personalized Study Path for Offline Access</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Subject Packs List */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
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
                          onStartOfflineDrill(pack.subjectId, offlinePacksManager.getOfflineQuestions(pack.subjectId));
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
                          <span>Caching...</span>
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
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Cached via Workbox Service Worker Storage for reliable offline study.</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer shrink-0"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
