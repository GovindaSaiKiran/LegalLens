import React from 'react';
import { Sparkles, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DemoSelector({ onSelect, selectedId = null, className = '' }) {
  const { t } = useLanguage();

  const demos = [
    {
      id: 'saas-terms',
      title: 'CloudScale Pro Terms of Service',
      badge: 'SaaS Agreement',
      subtitle: 'Auto-renewal, arbitration, IP license'
    },
    {
      id: 'privacy-policy',
      title: 'PulseHealth App Privacy Policy',
      badge: 'Privacy / DPDP',
      subtitle: 'Biometrics, health telemetry, data rights'
    },
    {
      id: 'rental-agreement',
      title: 'Residential Tenancy Agreement',
      badge: 'Hyderabad Lease',
      subtitle: '5-month deposit, lock-in, quiet enjoyment'
    },
    {
      id: 'employment-agreement',
      title: 'Senior Software Engineer Contract',
      badge: 'Tech Employment',
      subtitle: '90-day notice, non-compete, IP assignment'
    }
  ];

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-300/80 shadow-2xs ${className}`}>
      <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase tracking-wider text-slate-900">
        <Sparkles className="w-4 h-4 stroke-[2.5]" />
        <span>{t('terms.quickPresets', 'Try with realistic sample legal documents (1-Click Demo):')}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {demos.map((d) => {
          const isSelected = selectedId === d.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelect(d.id)}
              className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'bg-black text-white border-black shadow-2xs translate-x-[1px] translate-y-[1px]'
                  : 'bg-white text-black border-slate-300 hover:border-slate-400 hover:bg-slate-50 shadow-2xs hover:-translate-y-0.5'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-black ${
                    isSelected ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-sky-100 text-slate-900 font-bold'
                  }`}>
                    {d.badge}
                  </span>
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-amber-300' : 'text-slate-500'}`}>Demo</span>
                </div>
                <h5 className={`text-xs font-black leading-snug uppercase tracking-tight ${isSelected ? 'text-white' : 'text-black'}`}>
                  {d.title}
                </h5>
              </div>
              <p className={`text-[11px] mt-2 line-clamp-1 font-semibold ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                {d.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

