import React from 'react';
import { HelpCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function RiskReviewCard({ areas = [], className = '' }) {
  const { t } = useLanguage();
  if (!areas || areas.length === 0) return null;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl border border-rose-700/40 bg-neo-coral shadow-2xs text-black">
          <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h3 className="text-xl font-black text-black uppercase tracking-tight">{t('terms.areasToReview', 'Areas of Concern to Review')}</h3>
          <p className="text-xs font-semibold text-slate-700">{t('terms.areasSubtitle', 'Provisions worth examining closely before signing or accepting')}</p>
        </div>
      </div>

      <div className="space-y-3.5">
        {areas.map((item, idx) => (
          <div 
            key={idx}
            className="p-4 rounded-xl border border-rose-200 bg-[#fff5f5] shadow-2xs hover:-translate-y-0.5 transition"
          >
            <div className="flex items-start gap-3">
              <span className="w-3 h-3 rounded-full bg-neo-coral border border-rose-700 mt-1.5 shrink-0" />
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-extrabold text-black uppercase tracking-tight">{item.area}</h4>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                  {item.note}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
