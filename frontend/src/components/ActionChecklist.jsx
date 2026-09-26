import React, { useState } from 'react';
import { CheckSquare, Square, FolderCheck, Printer, Check, Copy } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ActionChecklist({ 
  checklist = [], 
  documentsToPrepare = [], 
  className = '' 
}) {
  const { t } = useLanguage();
  const [items, setItems] = useState(
    checklist.map((c, i) => ({ id: i, text: typeof c === 'string' ? c : c.task, done: c.done || false }))
  );
  const [copiedDocs, setCopiedDocs] = useState(false);

  const toggleItem = (id) => {
    setItems(items.map(it => it.id === id ? { ...it, done: !it.done } : it));
  };

  const handleCopyDocs = () => {
    const text = documentsToPrepare.map((d, i) => `• ${d}`).join('\n');
    navigator.clipboard.writeText(`Documents to Prepare Before Consulting a Lawyer:\n\n${text}`);
    setCopiedDocs(true);
    setTimeout(() => setCopiedDocs(false), 2000);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Action Checklist */}
      {items.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl border border-emerald-800/40 bg-neo-green shadow-2xs text-black">
              <CheckSquare className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-black uppercase tracking-tight">{t('terms.actionChecklist', 'Action Checklist')}</h3>
              <p className="text-xs font-semibold text-slate-700">{t('terms.actionChecklistSubtitle', 'Recommended steps to safeguard your interests')}</p>
            </div>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5 cursor-pointer transition select-none ${
                  item.done 
                    ? 'bg-slate-100 text-slate-400 line-through translate-x-1' 
                    : 'bg-white text-slate-900 hover:bg-slate-50 hover:-translate-y-0.5'
                }`}
              >
                {item.done ? (
                  <CheckSquare className="w-5 h-5 text-emerald-800 stroke-[3] shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-slate-600 stroke-[2.5] shrink-0" />
                )}
                <span className="text-sm sm:text-base font-bold leading-relaxed">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information to Prepare */}
      {documentsToPrepare.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl border border-blue-800/40 bg-neo-blue shadow-2xs text-white">
                <FolderCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-black uppercase tracking-tight">{t('terms.documentsToPrepare', 'Documents to Prepare')}</h3>
                <p className="text-xs font-semibold text-slate-700">{t('terms.documentsToPrepareSubtitle', 'Collect these records prior to meeting a legal professional')}</p>
              </div>
            </div>

            <button
              onClick={handleCopyDocs}
              className="self-start sm:self-center inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-900 bg-neo-yellow text-xs font-black uppercase text-black shadow-2xs hover:translate-x-[1px] hover:translate-y-[1px] transition cursor-pointer"
            >
              {copiedDocs ? <Check className="w-4 h-4 text-emerald-800 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
              <span>{copiedDocs ? t('terms.copied', 'Copied') : t('terms.copy', 'Copy')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {documentsToPrepare.map((doc, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 shadow-2xs flex items-start gap-3 text-sm sm:text-base text-slate-900 font-semibold"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-neo-blue border border-blue-600 mt-2 shrink-0" />
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
