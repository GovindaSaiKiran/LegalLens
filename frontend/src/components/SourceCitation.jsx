import React from 'react';
import { Scale, ExternalLink, ShieldCheck, Landmark } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function SourceCitation({ sources = [], distinction = null, className = '' }) {
  const { t } = useLanguage();
  if (!sources || sources.length === 0) return null;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-100 shadow-2xs text-emerald-900">
          <Scale className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {t('assistant.verifiedSources', 'Verified Legal Sources & Authorities')}
          </h3>
          <p className="text-xs font-medium text-slate-600">{t('assistant.sourcesDesc', 'Authoritative statutory enactments retrieved for this answer')}</p>
        </div>
      </div>

      {/* Distinction Badge Card */}
      {distinction && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs text-xs">
          <div className="space-y-1.5 p-3 rounded-lg border border-emerald-200 bg-emerald-50/70">
            <span className="font-bold text-emerald-900 uppercase tracking-wider block">{t('assistant.sourceBackedFacts', 'Source-Backed Facts')}</span>
            <p className="text-slate-800 font-medium leading-relaxed">{distinction.source_backed_facts}</p>
          </div>
          <div className="space-y-1.5 p-3 rounded-lg border border-sky-200 bg-sky-50/70">
            <span className="font-bold text-sky-900 uppercase tracking-wider block">{t('assistant.aiExplanation', 'AI Plain Explanation')}</span>
            <p className="text-slate-800 font-medium leading-relaxed">{distinction.ai_explanation}</p>
          </div>
          <div className="space-y-1.5 p-3 rounded-lg border border-amber-200 bg-amber-50/70">
            <span className="font-bold text-amber-900 uppercase tracking-wider block">{t('assistant.legalUncertainty', 'Legal Considerations')}</span>
            <p className="text-slate-800 font-medium leading-relaxed">{distinction.uncertainty}</p>
          </div>
        </div>
      )}

      {/* Sources List */}
      <div className="space-y-3.5">
        {sources.map((src, idx) => (
          <div 
            key={idx}
            className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Landmark className="w-4 h-4 text-slate-900 stroke-[2.5] shrink-0" />
                <span className="font-bold text-slate-900 text-sm sm:text-base">{src.act}</span>
                {src.year && (
                  <span className="text-xs px-2 py-0.5 rounded border border-emerald-300 bg-emerald-100 text-emerald-900 font-bold">
                    {src.year}
                  </span>
                )}
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded border border-amber-300 bg-amber-100 text-amber-900 self-start sm:self-auto shadow-2xs">
                {src.section}
              </span>
            </div>

            {src.title && (
              <h4 className="text-sm font-bold text-slate-900 mb-2 tracking-tight">
                {src.title}
              </h4>
            )}

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {src.summary}
            </p>

            {src.authority && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span>Authority: {src.authority}</span>
                <span className="font-bold text-slate-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {t('footer.jurisdiction', 'Jurisdiction: India')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

