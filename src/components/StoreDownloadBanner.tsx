import React from 'react';
import {
  Smartphone,
  Download,
  Apple,
  Laptop,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface StoreDownloadBannerProps {
  onOpenStoreModal: () => void;
}

export const StoreDownloadBanner: React.FC<StoreDownloadBannerProps> = ({
  onOpenStoreModal
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();

  return (
    <section id="store-publish-banner" className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 text-white shadow-xl relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl text-center lg:text-left">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/40 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>OFFICIAL STORE & APP DOWNLOAD CENTER</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
              Android • iOS • Windows • Mac
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white tracking-tight">
            Install StudyNaija on All Your Devices 📲
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Practice over 10,000 verified JAMB & WAEC past questions with zero data consumption. Install as an official standalone app on Google Play Store, iPhone & iPad, or Windows Desktop with full 8-key simulation!
          </p>

          {/* Platform Capability Checks */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-300 pt-1 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Google Play TWA Verified</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>iOS Safari Standalone</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Windows 8-Key Hall Mode</span>
            </span>
          </div>
        </div>

        {/* Action Buttons & Badges */}
        <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
          {/* Main Publish & Install Button */}
          <button
            onClick={onOpenStoreModal}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm transition-all shadow-xl shadow-emerald-500/25 hover:scale-102 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Smartphone className="w-5 h-5 text-slate-950" />
            <span>Open App Store & Install Portal</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          {/* Quick Platform Badges Row */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={onOpenStoreModal}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Google Play Store"
            >
              <span className="text-emerald-400 font-bold">▶</span>
              <span>Google Play</span>
            </button>

            <button
              onClick={onOpenStoreModal}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Apple App Store"
            >
              <Apple className="w-3.5 h-3.5" />
              <span>App Store</span>
            </button>

            <button
              onClick={onOpenStoreModal}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Windows & Mac Desktop"
            >
              <Laptop className="w-3.5 h-3.5 text-cyan-400" />
              <span>Desktop</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
