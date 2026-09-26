import React from 'react';
import { UserCheck, Building, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ObligationCard({ obligations = [], className = '' }) {
  const { t } = useLanguage();
  if (!obligations || obligations.length === 0) return null;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl border border-purple-800/40 bg-neo-purple shadow-2xs text-black">
          <UserCheck className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h3 className="text-xl font-black text-black uppercase tracking-tight">{t('terms.obligations', 'Contractual Obligations')}</h3>
          <p className="text-xs font-semibold text-slate-700">{t('terms.obligationsSubtitle', 'Key affirmative responsibilities allocated to each party')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {obligations.map((ob, idx) => {
          const isUser = /user|tenant|employee|buyer/i.test(ob.party);
          return (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between transition hover:-translate-y-0.5 ${
                isUser 
                  ? 'bg-neo-blueLight' 
                  : 'bg-neo-amberLight'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-md border ${
                    isUser ? 'bg-neo-blue text-black border-blue-600/40' : 'bg-neo-amber text-black border-amber-600/40'
                  }`}>
                    {ob.party || 'Party'}
                  </span>
                  {ob.clause && (
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-slate-300 bg-white text-slate-800">
                      {ob.clause}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-900 font-medium leading-relaxed">
                  {ob.obligation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
