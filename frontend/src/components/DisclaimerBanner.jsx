import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DisclaimerBanner({ className = '', compact = false }) {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className={`flex items-center gap-2.5 p-3 rounded-xl bg-amber-100 border border-amber-300 shadow-2xs text-xs font-bold text-black ${className}`}>
        <ShieldAlert className="w-4 h-4 text-amber-900 shrink-0 stroke-[2.5]" />
        <span className="leading-snug">
          <strong>{t('home.disclaimerNotice', 'LEGAL AWARENESS NOTICE:')} </strong>
          {t('footer.disclaimerText', 'LegalLens provides general information, not legal advice. For binding decisions, consult a qualified lawyer.')}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-5 rounded-2xl bg-amber-50 border border-amber-300/80 shadow-2xs flex items-start gap-4 ${className}`}>
      <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 shrink-0 mt-0.5 shadow-2xs border border-amber-500">
        <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
      </div>
      <div className="text-xs sm:text-sm text-slate-900 leading-relaxed min-w-0">
        <p className="font-extrabold text-slate-950 text-sm sm:text-base uppercase tracking-wider mb-1">
          {t('footer.disclaimerTitle', 'Mandatory Notice — General Legal Information Only')}
        </p>
        <p className="text-slate-700 font-medium leading-relaxed">
          {t('footer.disclaimerText', 'LegalLens provides automated document analysis and verified statutory awareness. It is not a law firm and does not provide formal legal representation or tell you what specific legal decisions to make. Laws vary by jurisdiction and factual circumstances. For important or disputed matters, consult a qualified legal professional.')}
        </p>
      </div>
    </div>
  );
}

