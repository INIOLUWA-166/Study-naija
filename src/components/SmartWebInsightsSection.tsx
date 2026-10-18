import React, { useState } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Search, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { SmartWebInsights } from '../types';

interface SmartWebInsightsSectionProps {
  insights?: SmartWebInsights;
  groundingSources?: { title: string; url: string; snippet?: string }[];
  topic?: string;
  defaultExpanded?: boolean;
}

export const SmartWebInsightsSection: React.FC<SmartWebInsightsSectionProps> = ({
  insights,
  groundingSources,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Merge grounding sources and academic websites only (No YouTube breakdown, No TikTok)
  const allGoogleSources = [
    ...(groundingSources || []),
    ...(insights?.googleSources || [])
  ];

  const smartPortals = insights?.smartWebsites || [];
  const totalSources = allGoogleSources.length + smartPortals.length;

  if (totalSources === 0) return null;

  return (
    <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-xs">
      {/* Sleek Grounding Toggle */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-left cursor-pointer group text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <div className="w-4 h-4 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
            <Search className="w-2.5 h-2.5" />
          </div>
          <span className="font-bold text-[11px] group-hover:underline">
            Verified Syllabus & Grounded Sources ({totalSources})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5 font-medium cursor-pointer"
        >
          <span>{isExpanded ? 'Hide' : 'View'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expanded References List */}
      {isExpanded && (
        <div className="mt-2 rounded-xl bg-slate-50/90 border border-slate-200 p-2.5 space-y-2 animate-in fade-in duration-150">
          <div className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold pb-1 border-b border-slate-200/60">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Curriculum-verified references retrieved for deep accuracy:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {allGoogleSources.map((src, idx) => (
              <a
                key={`src-${idx}`}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-200 transition-all flex items-start justify-between gap-2 group shadow-2xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[11px] text-slate-800 group-hover:text-emerald-800 line-clamp-1">
                    {src.title}
                  </div>
                  {src.snippet && (
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {src.snippet}
                    </p>
                  )}
                  <span className="text-[9px] text-emerald-700 font-mono flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    Verified Citation
                  </span>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-0.5" />
              </a>
            ))}

            {smartPortals.map((portal, idx) => (
              <a
                key={`portal-${idx}`}
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-200 transition-all flex items-start justify-between gap-2 group shadow-2xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[11px] text-slate-800 group-hover:text-emerald-800 truncate">
                      {portal.name}
                    </span>
                    {portal.badge && (
                      <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 text-[9px] font-bold shrink-0">
                        {portal.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {portal.description}
                  </p>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-0.5" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
