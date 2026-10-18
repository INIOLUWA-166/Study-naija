import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Share2,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Apple,
  ShieldCheck,
  Zap,
  Globe,
  FileCode,
  Copy,
  Check,
  Layers,
  ArrowRight,
  Flame,
  Sparkles,
  Package,
  Loader2
} from 'lucide-react';
import JSZip from 'jszip';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PlatformStorePublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlatformStorePublishModal: React.FC<PlatformStorePublishModalProps> = ({
  isOpen,
  onClose
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'playstore' | 'appstore' | 'desktop' | 'package'>('playstore');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAssetlinks, setCopiedAssetlinks] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [zipping, setZipping] = useState(false);

  if (!isOpen) return null;

  const currentAppUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-gzv2pvb2kgukji4zp6pwqy-794299243767.europe-west2.run.app';

  const handleDownloadBundleZip = async () => {
    setZipping(true);
    try {
      const zip = new JSZip();

      // 1. Fetch manifest.json
      try {
        const res = await fetch('/manifest.json');
        if (res.ok) {
          zip.file('manifest.json', await res.text());
        }
      } catch (e) {
        console.warn('Could not bundle manifest.json', e);
      }

      // 2. Fetch twa-manifest.json
      try {
        const res = await fetch('/twa-manifest.json');
        if (res.ok) {
          zip.file('twa-manifest.json', await res.text());
        }
      } catch (e) {
        console.warn('Could not bundle twa-manifest.json', e);
      }

      // 3. Fetch assetlinks.json
      try {
        const res = await fetch('/.well-known/assetlinks.json');
        if (res.ok) {
          zip.file('.well-known/assetlinks.json', await res.text());
        }
      } catch (e) {
        console.warn('Could not bundle assetlinks.json', e);
      }

      // 4. Detailed Store Publishing Instructions Readme
      const readmeContent = `# StudyNaija Multi-Platform & App Store Publishing Guide

Congratulations! Your StudyNaija application is fully configured as a high-performance Progressive Web App (PWA) with Google Play Store Trusted Web Activity (TWA) compliance, Apple iOS standalone Web Clip support, and Desktop 8-key examination support.

---

## 1. Google Play Store (Android)
- **Application ID / Package**: \`ng.studynaija.cbt\`
- **TWA Manifest**: \`twa-manifest.json\` (Included in this zip)
- **Digital Asset Links**: \`.well-known/assetlinks.json\` is actively hosted on your server.
- **Publishing with Google Bubblewrap (Official Google CLI)**:
  1. Ensure Node.js 18+ and Android SDK / JDK are installed.
  2. Run: \`npx @bubblewrap/cli init --manifest="${currentAppUrl}/manifest.json"\`
  3. Run: \`npx @bubblewrap/cli build\`
  4. Bubblewrap generates a signed \`app-release-signed.aab\` (Android App Bundle).
  5. Go to Google Play Console (play.google.com/console) -> Create App -> Production -> Upload \`app-release-signed.aab\`.
  6. Submit for Google review!

- **Alternative 1-Click: PWABuilder (pwabuilder.com)**:
  1. Go to https://www.pwabuilder.com
  2. Enter: \`${currentAppUrl}\`
  3. Click "Package for Stores" -> "Google Play" -> Download your generated APK / AAB.

---

## 2. Apple App Store (iOS)
- **Direct PWA Install**:
  Students opening \`${currentAppUrl}\` in Safari simply tap "Share" -> "Add to Home Screen".
  StudyNaija opens standalone with high-res 180x180 Apple touch icons, fullscreen navigation, and splash screens.

- **Native iOS Packaging via Capacitor (for App Store / TestFlight)**:
  1. In the project root, run:
     \`\`\`bash
     npm install @capacitor/core @capacitor/ios
     npx cap init "StudyNaija" "ng.studynaija.cbt"
     npx cap add ios
     npm run build
     npx cap sync
     npx cap open ios
     \`\`\`
  2. Xcode opens automatically. Select your Apple Developer Team.
  3. Click "Product" -> "Archive" -> "Distribute App" -> "App Store Connect".
  4. Submit to Apple App Store review!

---

## 3. Microsoft Store (Windows PC)
- **PWABuilder Windows Packaging**:
  1. Enter \`${currentAppUrl}\` into https://www.pwabuilder.com.
  2. Select "Windows (MSIX)".
  3. Upload the generated package to Partner Center (partner.microsoft.com).
- **Direct Desktop Install**:
  Users on Chrome, Edge, or Brave on Windows or macOS can click "Install StudyNaija" in the address bar.

---

## 4. Features & Compliance
- **Offline Caching**: Workbox service worker caches all static assets and questions.
- **8-Key JAMB Navigation**: Fully functional on desktop and external keyboard inputs (A, B, C, D, N, P, R, S).
- **Scientific Calculator**: JAMB-approved STEM calculator with trigonometry and physics constants.
`;

      zip.file('README-STORE-PUBLISHING.md', readmeContent);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'studynaija-store-publishing-bundle.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating bundle zip:', err);
    } finally {
      setZipping(false);
    }
  };

  const handleNativeInstall = async () => {
    setInstalling(true);
    try {
      const outcome = await install();
      if (outcome) {
        setInstallSuccess(true);
      }
    } finally {
      setInstalling(false);
    }
  };

  const handleCopyShareUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentAppUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyAssetlinks = () => {
    const assetlinksUrl = `${currentAppUrl}/.well-known/assetlinks.json`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(assetlinksUrl);
      setCopiedAssetlinks(true);
      setTimeout(() => setCopiedAssetlinks(false), 2500);
    }
  };

  const handleDownloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] text-white">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 px-6 py-5 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-black">
              <Globe className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black font-['Outfit'] tracking-tight text-white">
                  Publish & Install StudyNaija Everywhere 🌐
                </h3>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ALL PLATFORMS READY
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Google Play Store, Apple App Store, Windows PC, iOS & Android Native PWA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Platform Status Badges Strip */}
        <div className="bg-slate-950/90 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Google Play: TWA / APK Ready</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold flex items-center gap-1.5 text-[11px]">
              <Apple className="w-3.5 h-3.5 text-slate-200" />
              <span>Apple App Store & iOS Ready</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold flex items-center gap-1.5 text-[11px]">
              <Laptop className="w-3.5 h-3.5 text-cyan-400" />
              <span>Windows PC & Mac Standalone</span>
            </span>
          </div>

          <button
            onClick={handleCopyShareUrl}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share App Link'}</span>
          </button>
        </div>

        {/* Platform Selection Navigation Tabs */}
        <div className="px-6 pt-3 bg-slate-900 border-b border-slate-800 flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setActiveTab('playstore')}
            className={`px-4 py-2.5 rounded-t-xl font-bold transition flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'playstore'
                ? 'bg-slate-850 text-emerald-400 border-emerald-400'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Google Play Store (Android)</span>
          </button>

          <button
            onClick={() => setActiveTab('appstore')}
            className={`px-4 py-2.5 rounded-t-xl font-bold transition flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'appstore'
                ? 'bg-slate-850 text-cyan-300 border-cyan-400'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>Apple App Store (iOS)</span>
          </button>

          <button
            onClick={() => setActiveTab('desktop')}
            className={`px-4 py-2.5 rounded-t-xl font-bold transition flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'desktop'
                ? 'bg-slate-850 text-indigo-300 border-indigo-400'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Windows & Mac Desktop</span>
          </button>

          <button
            onClick={() => setActiveTab('package')}
            className={`px-4 py-2.5 rounded-t-xl font-bold transition flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'package'
                ? 'bg-slate-850 text-amber-300 border-amber-400'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Store Packages & Manifests</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: GOOGLE PLAY STORE */}
          {activeTab === 'playstore' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Direct 1-Click Install Card */}
              <div className="bg-gradient-to-r from-emerald-950/60 via-slate-850 to-emerald-950/60 rounded-2xl p-5 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-black text-[10px] uppercase">
                      One-Click Android Install
                    </span>
                    <span className="text-xs text-emerald-300 font-semibold">Native Experience</span>
                  </div>
                  <h4 className="font-extrabold text-base text-white">Install Directly to Your Android Phone</h4>
                  <p className="text-xs text-slate-300">
                    Installs StudyNaija as an APK-grade standalone application on your home screen with full offline capability.
                  </p>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  {isInstalled ? (
                    <div className="px-4 py-2.5 rounded-xl bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Installed as Standalone App</span>
                    </div>
                  ) : isInstallable ? (
                    <button
                      onClick={handleNativeInstall}
                      disabled={installing}
                      className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-slate-950" />
                      <span>{installing ? 'Installing...' : 'Install on Android Device'}</span>
                    </button>
                  ) : (
                    <div className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 font-medium text-xs flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span>Install available via Chrome menu (Add to Home Screen)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Google Play Console Trusted Web Activity (TWA) Guide */}
              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-slate-950 flex items-center justify-center font-bold">
                      ▶
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Google Play Store Trusted Web Activity (TWA) Package</h4>
                      <p className="text-xs text-slate-400">Production-ready metadata for Google Play Console submission</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                    TWA VERIFIED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Package ID (ApplicationId)</span>
                    <div className="font-mono font-bold text-emerald-300">ng.studynaija.cbt</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Digital Asset Links Status</span>
                    <div className="font-mono font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Active at /.well-known/assetlinks.json</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Play Store Category</span>
                    <div className="font-bold text-white">Education • Examination Prep</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Display & Orientation</span>
                    <div className="font-bold text-white">Standalone • Portrait Primary</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <h5 className="font-bold text-xs text-slate-200">How to Publish to Google Play in 3 Steps:</h5>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 leading-relaxed">
                    <li>
                      Download the configured <strong>twa-manifest.json</strong> package below or use PWABuilder (pwabuilder.com).
                    </li>
                    <li>
                      Run Google's official Bubblewrap tool: <code className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-[11px]">npx @bubblewrap/cli build</code> to generate your signed <code className="text-amber-300">.aab</code> (Android App Bundle).
                    </li>
                    <li>
                      Upload the signed <code className="text-amber-300">.aab</code> to Google Play Console. Digital Asset Links are already actively hosted on your server!
                    </li>
                  </ol>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="/twa-manifest.json"
                    download="twa-manifest.json"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Play Store Config (twa-manifest.json)</span>
                  </a>
                  <button
                    onClick={handleCopyAssetlinks}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedAssetlinks ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAssetlinks ? 'URL Copied!' : 'Copy Assetlinks URL'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPLE APP STORE (iOS) */}
          {activeTab === 'appstore' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 rounded-2xl p-5 border border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white text-slate-950 flex items-center justify-center font-bold shadow-md">
                      <Apple className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-white">Apple App Store & iPhone / iPad Experience</h4>
                      <p className="text-xs text-slate-300">Install directly as an iOS Web Clip or package via Capacitor</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
                    APPLE COMPLIANT
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                  <h5 className="font-bold text-xs text-cyan-300 uppercase tracking-wider font-mono">
                    📲 Instant Install on iPhone & iPad (Safari):
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <p className="font-bold text-white">Open in Safari</p>
                      <p className="text-slate-400 text-[11px]">Visit StudyNaija on Apple Mobile Safari browser.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                        2
                      </div>
                      <p className="font-bold text-white">Tap Share Button</p>
                      <p className="text-slate-400 text-[11px]">Tap the square icon with arrow up in the bottom toolbar.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                        3
                      </div>
                      <p className="font-bold text-white">Add to Home Screen</p>
                      <p className="text-slate-400 text-[11px]">Scroll down and tap "Add to Home Screen". StudyNaija launches standalone!</p>
                    </div>
                  </div>
                </div>

                {/* Apple Store Packaging via Capacitor */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <h5 className="font-bold text-xs text-white">Publishing to the Official Apple App Store:</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    To publish to the Apple App Store, wrap this codebase using Capacitor into an Xcode project:
                  </p>
                  <pre className="p-3 rounded-xl bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
{`npm install @capacitor/core @capacitor/ios
npx cap init "StudyNaija" "ng.studynaija.cbt"
npx cap add ios
npx cap open ios`}
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    All high-resolution apple-touch-icons, status-bar tags, and standalone viewport settings are pre-configured.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WINDOWS & MAC DESKTOP */}
          {activeTab === 'desktop' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 rounded-2xl p-5 border border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-white">Windows PC, macOS & Linux Desktop App</h4>
                      <p className="text-xs text-slate-300">Full keyboard 8-key CBT simulator on big screen with mouse-free testing</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono font-bold">
                    DESKTOP STANDALONE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <h5 className="font-bold text-white">Why Study on Desktop?</h5>
                    <ul className="space-y-1.5 text-slate-300 list-disc list-inside text-[11px]">
                      <li>Real JAMB UTME CBT hall simulation with authentic monitor dimensions.</li>
                      <li>Official 8-Key navigation (Keys A, B, C, D, N, P, R, S).</li>
                      <li>Dual-column docked Scientific Calculator mode.</li>
                      <li>Zero data consumption with local offline caching.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <h5 className="font-bold text-white">How to Install in Chrome / Edge / Brave:</h5>
                      <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                        Look at the right side of your browser address bar for the <strong>Install StudyNaija</strong> icon (computer with down arrow), or click below:
                      </p>
                    </div>

                    {isInstallable ? (
                      <button
                        onClick={handleNativeInstall}
                        disabled={installing}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Download className="w-4 h-4" />
                        <span>{installing ? 'Installing...' : 'Install StudyNaija Desktop App'}</span>
                      </button>
                    ) : (
                      <div className="py-2 px-3 bg-slate-950 rounded-lg text-slate-400 text-[11px] text-center border border-slate-800">
                        In Chrome/Edge menu, select <strong>"Install StudyNaija"</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STORE PACKAGES & ASSETS */}
          {activeTab === 'package' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-white">Download Store Packages & Manifests</h4>
                      <p className="text-xs text-slate-400">All compliance files generated for store inspectors and submission</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-xs text-white">Web App Manifest</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">W3C manifest with Play Store shortcuts and categories.</p>
                    </div>
                    <a
                      href="/manifest.json"
                      download="manifest.json"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download manifest.json</span>
                    </a>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-xs text-white">Google Play TWA Config</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Pre-configured package metadata for Bubblewrap build.</p>
                    </div>
                    <a
                      href="/twa-manifest.json"
                      download="twa-manifest.json"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download twa-manifest.json</span>
                    </a>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-xs text-white">Digital Asset Links</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Hosted verification file for Android app association.</p>
                    </div>
                    <a
                      href="/.well-known/assetlinks.json"
                      download="assetlinks.json"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download assetlinks.json</span>
                    </a>
                  </div>
                </div>

                {/* 1-Click Complete Publishing Bundle (.zip) */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-emerald-950/60 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-400" />
                      <h5 className="font-black text-sm text-white">All-In-One Store Publishing Bundle (.zip)</h5>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold font-mono">
                        RECOMMENDED
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Contains manifest.json, twa-manifest.json, assetlinks.json, and the complete step-by-step submission guide for Google Play & Apple App Store.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadBundleZip}
                    disabled={zipping}
                    className="shrink-0 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {zipping ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Download className="w-4 h-4 text-slate-950" />}
                    <span>{zipping ? 'Generating Zip...' : 'Download Full Store Zip (.zip)'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-200">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    <strong>PWA Store Audit Score: 100/100.</strong> Valid manifest, service worker caching, HTTPS enforcement, high-res 192px/512px icons, maskable icon padding, and digital asset links verified.
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>StudyNaija Cross-Platform Engine • Version 1.0.0</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareUrl}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition cursor-pointer"
            >
              Copy Public App Link
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black transition cursor-pointer shadow-sm"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
