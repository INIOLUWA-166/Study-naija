import React from 'react';
import { ExternalLink, Sparkles, X } from 'lucide-react';
import { SPONSORED_ADS } from '../mockData';
import { User } from '../types';

interface AdBannerProps {
  placement: 'homepage' | 'in-feed' | 'article';
  user: User | null;
}

export const AdBanner: React.FC<AdBannerProps> = ({ placement, user }) => {
  // If user has paid subscription (medium or premium), they enjoy 100% ad-free experience!
  if (user && (user.premiumPlan === 'medium' || user.premiumPlan === 'premium')) {
    return null;
  }

  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  const ad = placement === 'homepage' 
    ? SPONSORED_ADS[0] 
    : placement === 'in-feed' 
      ? SPONSORED_ADS[1] 
      : SPONSORED_ADS[2];

  if (placement === 'homepage') {
    return (
      <aside 
        id="ad-banner-homepage" 
        aria-label="Sponsored educational announcement"
        className="w-full my-8 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl p-5 border border-emerald-500/20 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                Sponsored • {ad.badge}
              </span>
              <span className="text-xs text-slate-400">{ad.sponsor}</span>
            </div>
            <h4 className="font-bold text-base sm:text-lg text-white">{ad.title}</h4>
            <p className="text-sm text-slate-300">{ad.subtitle}</p>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => alert(`Redirecting to sponsored educational portal: ${ad.title}`)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>{ad.ctaText}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              title="Dismiss ad"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  if (placement === 'article') {
    return (
      <aside 
        id="ad-banner-article"
        aria-label="Sponsored educational announcement"
        className="my-6 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 text-slate-800"
      >
        <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-1">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            StudyNaija Partner Highlight
          </span>
          <button onClick={() => setDismissed(true)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <h5 className="font-bold text-sm text-slate-900">{ad.title}</h5>
        <p className="text-xs text-slate-600 mt-0.5">{ad.subtitle}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Verified educational resource</span>
          <button
            onClick={() => alert(`Opening resource: ${ad.title}`)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
          >
            {ad.ctaText} →
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside 
      id="ad-banner-infeed"
      aria-label="Sponsored educational announcement"
      className="my-6 p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
    >
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Sponsored Notice</div>
        <p className="font-semibold text-sm text-slate-900">{ad.title}</p>
        <p className="text-xs text-slate-500">{ad.subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => alert(`Opening: ${ad.title}`)}
          className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md transition-colors"
        >
          {ad.ctaText}
        </button>
        <button onClick={() => setDismissed(true)} className="text-slate-400 hover:text-slate-600 p-1">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
