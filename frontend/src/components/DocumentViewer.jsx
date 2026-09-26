import React, { useState } from 'react';
import { Search, FileText, Hash, Copy, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DocumentViewer({ sections = [], rawText = '', title = '', className = '' }) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const displayTitle = title || t('viewer.title', 'Document Clause Viewer');

  const filteredSections = sections.filter(sec => 
    !searchTerm || 
    sec.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sec.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyClause = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className={`bg-white rounded-2xl border-3 border-black shadow-neo-md overflow-hidden flex flex-col ${className}`}>
      {/* Header & Search */}
      <div className="p-4 sm:p-5 border-b-2 border-black bg-neo-yellow/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-black stroke-[2.5]" />
          <h3 className="font-black text-black text-base uppercase tracking-tight">{displayTitle}</h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full border-2 border-black bg-white text-black font-mono font-black shadow-2xs">
            {sections.length} {t('terms.clausesCount', 'clauses')}
          </span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-black stroke-[2.5] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('viewer.searchPlaceholder', 'Search clause or keyword...')}
            className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-black bg-white text-xs sm:text-sm font-semibold focus:outline-none shadow-2xs text-black placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Sections List */}
      <div className="p-5 overflow-y-auto max-h-[600px] divide-y-2 divide-black/10 space-y-4">
        {filteredSections.length > 0 ? (
          filteredSections.map((sec, idx) => (
            <div key={idx} className="pt-4 first:pt-0 group">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded border-2 border-black bg-neo-yellow text-black shadow-2xs">
                    § {sec.index || idx + 1}
                  </span>
                  <h4 className="font-black text-black text-sm uppercase tracking-tight">{sec.title}</h4>
                </div>

                <button
                  onClick={() => handleCopyClause(sec.content, idx)}
                  className="px-2.5 py-1 rounded border border-black bg-white hover:bg-neo-yellow text-black text-xs font-bold inline-flex items-center gap-1 shadow-2xs transition cursor-pointer"
                  title={t('terms.copy', 'Copy clause')}
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-800 stroke-[3]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  <span className="text-[11px] font-black uppercase">{copiedIndex === idx ? t('terms.copied', 'Copied') : t('terms.copy', 'Copy')}</span>
                </button>
              </div>

              <p className="text-sm text-black font-mono font-medium leading-relaxed whitespace-pre-wrap p-4 rounded-xl border-2 border-black bg-slate-50 shadow-2xs">
                {sec.content}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-600 font-bold text-sm">
            {t('viewer.noMatches', 'No clauses match your search term')} "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
}
