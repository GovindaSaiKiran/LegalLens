import React from 'react';
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { simplifyLegalText } from '../utils/simplifier';
import { useLanguage } from '../context/LanguageContext';

export default function WhatAmIAgreeingToCard({ items = [], isSimpleMode = false, className = '' }) {
  const { t } = useLanguage();
  if (!items || items.length === 0) return null;

  return (
    <div className={`bg-neo-blueLight rounded-2xl border border-blue-200 shadow-sm p-6 sm:p-7 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-blue-200">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-neo-yellow border border-slate-900/50 shadow-2xs text-black flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-black">{t('terms.whatYouAreAgreeingTo', "What You're Agreeing To")}</h3>
            <p className="text-xs sm:text-sm text-slate-800 font-semibold mt-0.5">
              {isSimpleMode 
                ? t('terms.eli5AgreeingSubtitle', 'Ultra-simple breakdown of what happens when you sign or click "I Agree":') 
                : t('terms.agreeingSubtitle', 'By accepting or signing, the agreement explicitly states that:')}
            </p>
          </div>
        </div>

        {isSimpleMode && (
          <span className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-neo-green border border-emerald-800/60 text-black text-xs font-black shadow-2xs flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t('terms.eli5Badge', 'ELI5 Simplified')}</span>
          </span>
        )}
      </div>

      <ul className="space-y-3.5 mt-4">
        {items.map((item, idx) => {
          const displayText = isSimpleMode ? simplifyLegalText(item) : item;
          return (
            <li key={idx} className="flex items-start gap-3.5 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-6 h-6 rounded-lg bg-neo-green border border-emerald-700/60 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-black stroke-[3]" />
              </div>
              <span className="text-black text-sm sm:text-base leading-relaxed font-bold">
                {displayText}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 pt-3.5 border-t border-blue-200 flex items-center justify-between text-xs font-bold text-slate-700 font-mono">
        <span>✓ {t('terms.groundedNotice', 'Grounded in original text')}</span>
        <span>{isSimpleMode ? `✓ ${t('terms.eli5Badge', '5th-Grade Plain English')}` : `✓ ${t('terms.groundedNotice', 'Verified analysis')}`}</span>
      </div>
    </div>
  );
}
