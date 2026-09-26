import React, { useState } from 'react';
import { PlusCircle, MinusCircle, RefreshCw, AlertTriangle, ArrowRight, Layers, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ComparisonViewer({ comparison, titleA = 'Document A', titleB = 'Document B', className = '' }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('important');

  if (!comparison) return null;

  const { added = [], removed = [], modified = [], important_changes = [], comparison_summary } = comparison;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Banner */}
      <div className="bg-white rounded-2xl border-3 border-black p-6 sm:p-7 shadow-neo-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-black">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-neo-yellow border-2 border-black text-black shadow-neo-sm mb-3">
              <Layers className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t('compare.badge', 'Semantic Document Diffing')}</span>
            </div>
            <h3 className="text-2xl font-black text-black uppercase tracking-tight">
              {titleA} <span className="text-slate-400 font-bold lowercase">vs</span> {titleB}
            </h3>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2.5 text-xs flex-wrap">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neo-green text-black border-2 border-black font-black uppercase shadow-neo-sm">
              <PlusCircle className="w-4 h-4 stroke-[2.5]" /> +{added.length} {t('compare.addedClauses', 'Added')}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neo-coral text-black border-2 border-black font-black uppercase shadow-neo-sm">
              <MinusCircle className="w-4 h-4 stroke-[2.5]" /> -{removed.length} {t('compare.removedClauses', 'Removed')}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neo-amber text-black border-2 border-black font-black uppercase shadow-neo-sm">
              <RefreshCw className="w-4 h-4 stroke-[2.5]" /> {modified.length} {t('compare.modifiedClauses', 'Modified')}
            </span>
          </div>
        </div>

        {comparison_summary && (
          <p className="mt-4 text-sm sm:text-base text-black font-medium leading-relaxed">
            {comparison_summary}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 text-sm">
        <button
          onClick={() => setActiveTab('important')}
          className={`px-4 py-2.5 rounded-xl font-black uppercase text-xs transition flex items-center gap-2 border-2 border-black cursor-pointer ${
            activeTab === 'important'
              ? 'bg-black text-white shadow-neo-sm'
              : 'bg-white text-black hover:bg-neo-yellow/30 shadow-2xs'
          }`}
        >
          <span>{t('compare.summaryTitle', 'Important Changes')}</span>
          <span className={`text-xs px-2 py-0.5 rounded-md border border-black font-black ${
            activeTab === 'important' ? 'bg-neo-yellow text-black' : 'bg-slate-200 text-black'
          }`}>
            {important_changes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('modified')}
          className={`px-4 py-2.5 rounded-xl font-black uppercase text-xs transition flex items-center gap-2 border-2 border-black cursor-pointer ${
            activeTab === 'modified'
              ? 'bg-black text-white shadow-neo-sm'
              : 'bg-white text-black hover:bg-neo-yellow/30 shadow-2xs'
          }`}
        >
          <span>{t('compare.modifiedClauses', 'Modified Clauses')}</span>
          <span className={`text-xs px-2 py-0.5 rounded-md border border-black font-black ${
            activeTab === 'modified' ? 'bg-neo-yellow text-black' : 'bg-slate-200 text-black'
          }`}>
            {modified.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('added')}
          className={`px-4 py-2.5 rounded-xl font-black uppercase text-xs transition flex items-center gap-2 border-2 border-black cursor-pointer ${
            activeTab === 'added'
              ? 'bg-black text-white shadow-neo-sm'
              : 'bg-white text-black hover:bg-neo-yellow/30 shadow-2xs'
          }`}
        >
          <span>{t('compare.addedClauses', 'Added Clauses')}</span>
          <span className={`text-xs px-2 py-0.5 rounded-md border border-black font-black ${
            activeTab === 'added' ? 'bg-neo-yellow text-black' : 'bg-slate-200 text-black'
          }`}>
            {added.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('removed')}
          className={`px-4 py-2.5 rounded-xl font-black uppercase text-xs transition flex items-center gap-2 border-2 border-black cursor-pointer ${
            activeTab === 'removed'
              ? 'bg-black text-white shadow-neo-sm'
              : 'bg-white text-black hover:bg-neo-yellow/30 shadow-2xs'
          }`}
        >
          <span>{t('compare.removedClauses', 'Removed Clauses')}</span>
          <span className={`text-xs px-2 py-0.5 rounded-md border border-black font-black ${
            activeTab === 'removed' ? 'bg-neo-yellow text-black' : 'bg-slate-200 text-black'
          }`}>
            {removed.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Important Changes Plain-English */}
      {activeTab === 'important' && (
        <div className="space-y-3.5">
          {important_changes.length > 0 ? (
            important_changes.map((ch, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-xl border-2 border-black p-5 shadow-neo-sm flex items-start gap-4 transition hover:-translate-y-0.5"
              >
                <div className={`p-2.5 rounded-lg border-2 border-black shadow-2xs shrink-0 mt-0.5 text-black ${
                  ch.type === 'Added' ? 'bg-neo-green' :
                  ch.type === 'Removed' ? 'bg-neo-coral' :
                  'bg-neo-amber'
                }`}>
                  {ch.type === 'Added' ? <PlusCircle className="w-5 h-5 stroke-[2.5]" /> :
                   ch.type === 'Removed' ? <MinusCircle className="w-5 h-5 stroke-[2.5]" /> :
                   <RefreshCw className="w-5 h-5 stroke-[2.5]" />}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="font-black text-black text-base uppercase tracking-tight">{ch.clause}</h4>
                    <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded border-2 border-black shadow-2xs ${
                      ch.type === 'Added' ? 'bg-neo-green text-black' :
                      ch.type === 'Removed' ? 'bg-neo-coral text-black' :
                      'bg-neo-amber text-black'
                    }`}>
                      {ch.type === 'Added' ? t('compare.addedClauses', 'Added') : ch.type === 'Removed' ? t('compare.removedClauses', 'Removed') : t('compare.modified', 'Modified')}
                    </span>
                  </div>
                  <p className="text-sm text-black font-medium leading-relaxed">
                    {ch.summary}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border-2 border-black p-8 text-center text-slate-700 font-bold text-sm shadow-neo-sm">
              {t('compare.noShifts', 'No significant contractual shifts detected between these two versions.')}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Modified Clauses Side-by-Side */}
      {activeTab === 'modified' && (
        <div className="space-y-4">
          {modified.length > 0 ? (
            modified.map((mod, idx) => (
              <div key={idx} className="bg-white rounded-xl border-3 border-black overflow-hidden shadow-neo-md">
                <div className="p-4 bg-neo-yellow/30 border-b-2 border-black flex items-center justify-between">
                  <h4 className="font-black text-black text-sm uppercase tracking-tight">{mod.title}</h4>
                  <span className="text-xs text-black bg-neo-amber px-2.5 py-0.5 rounded font-black border-2 border-black uppercase shadow-2xs">
                    {t('compare.modified', 'Modified')}
                  </span>
                </div>

                {mod.changeSummary && (
                  <div className="px-5 py-3 bg-[#fff8e7] border-b-2 border-black text-xs sm:text-sm text-black font-bold">
                    {t('compare.shift', 'Shift:')} {mod.changeSummary}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y-2 md:divide-y-0 md:divide-x-2 divide-black text-xs font-mono">
                  {/* Document A (Original) */}
                  <div className="p-4 bg-[#fff0f0]">
                    <span className="text-xs font-sans font-black text-red-700 uppercase tracking-wider block mb-2">
                      {t('compare.original', 'Original')} ({titleA})
                    </span>
                    <p className="text-black font-semibold whitespace-pre-wrap leading-relaxed">
                      {mod.original}
                    </p>
                  </div>

                  {/* Document B (Revised) */}
                  <div className="p-4 bg-[#f0fff4]">
                    <span className="text-xs font-sans font-black text-emerald-800 uppercase tracking-wider block mb-2">
                      {t('compare.revised', 'Revised')} ({titleB})
                    </span>
                    <p className="text-black font-semibold whitespace-pre-wrap leading-relaxed">
                      {mod.revised}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border-2 border-black p-8 text-center text-slate-700 font-bold text-sm shadow-neo-sm">
              {t('compare.noModified', 'No existing clauses were modified between the documents.')}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Added Clauses */}
      {activeTab === 'added' && (
        <div className="space-y-3.5">
          {added.length > 0 ? (
            added.map((item, idx) => (
              <div key={idx} className="bg-[#f0fff4] rounded-xl border-2 border-black p-5 shadow-neo-sm">
                <div className="flex items-center gap-2 mb-3">
                  <PlusCircle className="w-5 h-5 text-emerald-800 stroke-[2.5] shrink-0" />
                  <h4 className="font-black text-black text-base uppercase tracking-tight">{item.title}</h4>
                  <span className="text-xs px-2.5 py-0.5 rounded border border-black bg-neo-green text-black font-black uppercase ml-auto">
                    {t('compare.onlyIn', 'Only in')} {titleB}
                  </span>
                </div>
                <p className="text-sm font-mono text-black bg-white p-4 rounded-lg border-2 border-black whitespace-pre-wrap leading-relaxed font-semibold">
                  {item.content}
                </p>
                {item.significance && (
                  <p className="mt-2.5 text-xs text-black font-bold italic">
                    {t('compare.note', 'Note:')} {item.significance}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border-2 border-black p-8 text-center text-slate-700 font-bold text-sm shadow-neo-sm">
              {t('compare.noAdded', 'No new clauses were added in Document B.')}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Removed Clauses */}
      {activeTab === 'removed' && (
        <div className="space-y-3.5">
          {removed.length > 0 ? (
            removed.map((item, idx) => (
              <div key={idx} className="bg-[#fff0f0] rounded-xl border-2 border-black p-5 shadow-neo-sm">
                <div className="flex items-center gap-2 mb-3">
                  <MinusCircle className="w-5 h-5 text-red-700 stroke-[2.5] shrink-0" />
                  <h4 className="font-black text-black text-base uppercase tracking-tight">{item.title}</h4>
                  <span className="text-xs px-2.5 py-0.5 rounded border border-black bg-neo-coral text-black font-black uppercase ml-auto">
                    {t('compare.removedIn', 'Removed in')} {titleB}
                  </span>
                </div>
                <p className="text-sm font-mono text-black bg-white p-4 rounded-lg border-2 border-black whitespace-pre-wrap leading-relaxed font-semibold">
                  {item.content}
                </p>
                {item.significance && (
                  <p className="mt-2.5 text-xs text-black font-bold italic">
                    {t('compare.note', 'Note:')} {item.significance}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border-2 border-black p-8 text-center text-slate-700 font-bold text-sm shadow-neo-sm">
              {t('compare.noRemoved', 'No clauses were removed in Document B.')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
