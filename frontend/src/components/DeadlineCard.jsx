import React from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DeadlineCard({ deadlines = [], className = '' }) {
  const { t } = useLanguage();
  if (!deadlines || deadlines.length === 0) return null;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl border border-amber-700/40 bg-neo-amber shadow-2xs text-black">
          <Calendar className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h3 className="text-xl font-black text-black uppercase tracking-tight">{t('terms.deadlines', 'Deadlines & Time Windows')}</h3>
          <p className="text-xs font-semibold text-slate-700">{t('terms.deadlinesSubtitle', 'Time-sensitive milestones, notice periods, and renewal windows')}</p>
        </div>
      </div>

      <div className="space-y-3.5">
        {deadlines.map((dl, idx) => (
          <div 
            key={idx} 
            className="p-4 rounded-xl border border-amber-200 bg-[#fffdf0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition hover:-translate-y-0.5"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-black text-sm sm:text-base">{dl.event}</span>
                {dl.clause && (
                  <span className="text-[11px] px-2 py-0.5 rounded border border-slate-300 bg-white text-slate-800 font-mono font-bold">
                    {dl.clause}
                  </span>
                )}
              </div>
              {dl.consequence && (
                <p className="text-xs sm:text-sm text-slate-800 font-medium">
                  <span className="font-bold text-red-600">{t('terms.ifMissed', 'If missed:')} </span>
                  {dl.consequence}
                </p>
              )}
            </div>

            <div className="sm:self-center shrink-0">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1.5 rounded-lg bg-neo-yellow border border-amber-600/40 text-black shadow-2xs">
                <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                {dl.timing}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
