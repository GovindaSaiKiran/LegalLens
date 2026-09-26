import React from 'react';
import { Scale, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#fcfaf2] border-t-3 border-black mt-20 pb-20 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-neo-yellow border-2 border-black text-black flex items-center justify-center shadow-neo-sm">
                <Scale className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-black text-2xl text-black uppercase tracking-tight">LegalLens</span>
            </div>
            <p className="text-sm text-slate-800 font-semibold max-w-md leading-relaxed">
              {t('footer.desc', 'Empowering individuals with AI-driven plain-language clarity on Terms & Conditions, contracts, policies, and statutory rights before they sign or agree.')}
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-black px-3 py-1 rounded-full bg-neo-green text-black border-2 border-black shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-black"></span>
              <span>{t('footer.jurisdiction', 'Jurisdiction: India (Extensible Statutory Engine)')}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-black">{t('footer.features', 'Platform Features')}</h4>
            <ul className="space-y-2 text-xs sm:text-sm font-bold text-slate-800">
              <li><Link to="/terms" className="hover:text-black hover:underline transition">{t('nav.terms', 'Terms & Conditions Analyzer')}</Link></li>
              <li><Link to="/legal-assistant" className="hover:text-black hover:underline transition">{t('nav.assistant', 'Legal Knowledge Assistant')}</Link></li>
              <li><Link to="/upload" className="hover:text-black hover:underline transition">{t('nav.upload', 'Document Upload & Analysis')}</Link></li>
              <li><Link to="/compare" className="hover:text-black hover:underline transition">{t('nav.compare', 'Document Comparison')}</Link></li>
              <li><Link to="/glossary" className="hover:text-black hover:underline transition">{t('nav.glossary', 'Legal Glossary')}</Link></li>
              <li><Link to="/dashboard" className="hover:text-black hover:underline transition">{t('nav.dashboard', 'Personal Dashboard')}</Link></li>
              <li>
                <button 
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-legallens-agent'))} 
                  className="hover:underline transition font-black text-[#7c3aed] flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🤖 {t('nav.copilot', 'AI Copilot')}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-black">{t('footer.safety', 'Safety & Architecture')}</h4>
            <ul className="space-y-2 text-xs text-slate-800 font-semibold leading-relaxed">
              <li>{t('footer.noAdvice', '✓ No definitive legal advice provided')}</li>
              <li>{t('footer.ragGrounded', '✓ Source-grounded RAG architecture')}</li>
              <li>{t('footer.plainBreakdown', '✓ Plain-English clause breakdowns')}</li>
              <li>{t('footer.privacy', '✓ Minimal data retention & privacy')}</li>
              <li>{t('footer.citations', '✓ Verified Indian statutory citations')}</li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Banner Box */}
        <div className="p-5 rounded-2xl bg-neo-yellow/30 border-3 border-black text-xs text-black leading-relaxed mb-8 shadow-neo-sm font-medium">
          <strong className="text-black font-black uppercase text-xs block mb-1">{t('footer.disclaimerTitle', 'Mandatory Legal Disclaimer:')}</strong>
          {t('footer.disclaimerText', 'LegalLens provides general legal information, automated document breakdown, and verified statutory awareness, not professional legal representation or binding advice. Laws, case precedents, and procedural outcomes vary by jurisdiction and unique circumstances. For important, binding, or disputed matters, always consult a qualified legal professional registered with the appropriate State Bar Council.')}
        </div>

        <div className="pt-6 border-t-2 border-black/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-600">
          <p>© {new Date().getFullYear()} LegalLens. {t('footer.builtFor', 'Built for Legal Awareness & Accessibility.')}</p>
          <p className="flex items-center gap-1.5 font-black text-black">
            <span className="w-2.5 h-2.5 rounded-full bg-neo-coral border border-black inline-block"></span>
            <span>Neo-Brutalist High-Accessibility Interface</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
