import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'navbar' | 'compact' | 'card';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ className = '', variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as standalone app, don't show prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'compact') {
      return (
        <button
          id="pwa-install-compact-btn"
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer ${className}`}
          title="Install StudyNaija for offline practice"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isInstalling ? 'Installing...' : 'Install App'}</span>
        </button>
      );
    }

    return (
      <button
        id="pwa-install-btn"
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:from-emerald-700 hover:to-teal-700 transition cursor-pointer ${className}`}
      >
        <Smartphone className="w-4 h-4" />
        <span>Install StudyNaija App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/80 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install on iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Install on iOS</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                Add StudyNaija to your home screen for full offline past questions and full-screen CBT practice:
              </p>
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700/50 text-xs text-slate-700 dark:text-slate-200">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <span>Tap the <strong>Share</strong> icon in the bottom Safari toolbar.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <span>Scroll down and choose <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <span>Tap <strong>Add</strong> in the top-right corner.</span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 py-2.5 text-xs font-bold text-white transition cursor-pointer"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback info button in drawer/card to guide user if browser has not yet fired prompt
  if (variant === 'card') {
    return (
      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 block">StudyNaija Mobile App</span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Practice past questions with zero data</span>
          </div>
        </div>
        <button
          onClick={() => alert("To install StudyNaija: Tap your browser's menu (⋮ or Share) and select 'Install app' or 'Add to Home screen'.")}
          className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[11px] font-semibold hover:bg-emerald-800 transition cursor-pointer"
        >
          Install
        </button>
      </div>
    );
  }

  return null;
};
