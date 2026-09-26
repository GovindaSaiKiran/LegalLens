import React, { useState } from 'react';
import { HelpCircle, Copy, Check, MessageSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LawyerQuestions({ questions = [], className = '' }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!questions || questions.length === 0) return null;

  const handleCopyAll = () => {
    const text = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(`Questions for Legal Consultation:\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl border border-purple-800/40 bg-neo-purple shadow-2xs text-black">
            <MessageSquare className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xl font-black text-black uppercase tracking-tight">{t('terms.lawyerQuestions', 'Questions for a Lawyer')}</h3>
            <p className="text-xs font-semibold text-slate-700">{t('terms.lawyerSubtitle', 'Targeted questions you can ask during a legal consultation')}</p>
          </div>
        </div>

        <button
          onClick={handleCopyAll}
          className="self-start sm:self-center inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-900 bg-neo-yellow text-xs font-black uppercase text-black shadow-2xs hover:translate-x-[1px] hover:translate-y-[1px] transition cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-800 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
          <span>{copied ? t('terms.copied', 'Copied') : t('terms.copy', 'Copy')}</span>
        </button>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div 
            key={idx}
            className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 shadow-2xs flex items-start gap-3.5 transition hover:-translate-y-0.5"
          >
            <span className="w-6 h-6 rounded-md bg-neo-purple border border-purple-800/40 text-black flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-2xs">
              {idx + 1}
            </span>
            <p className="text-sm sm:text-base text-slate-900 font-semibold leading-relaxed">
              {q}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
