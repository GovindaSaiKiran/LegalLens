import React, { useState } from 'react';
import { X, Copy, Check, FileText, Sparkles, BookOpen, Lightbulb } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LegalGlossaryModal from './LegalGlossaryModal';

export default function ClauseModal({ isOpen, onClose, clause }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showSimplified, setShowSimplified] = useState(true);
  const [glossaryTerm, setGlossaryTerm] = useState(null);

  if (!isOpen || !clause) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(clause.content || clause.originalClause || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate a friendly, ultra-accessible translation
  const getUltraSimpleExplanation = (cl) => {
    const raw = (cl.originalClause || cl.content || '').toLowerCase();
    const title = (cl.title || cl.clauseReference || '').toLowerCase();

    if (/renew|subscription|billing/i.test(title + raw)) {
      return "This clause means your payment card will be charged automatically every billing cycle. If you don't cancel at least 7 days before, they will charge you for the whole next month or year with no refund.";
    }
    if (/refund|non-refundable|fee/i.test(title + raw)) {
      return "This clause says: once you pay, you almost certainly cannot get your money back, even if you stop using the service tomorrow or are unhappy with it.";
    }
    if (/arbitration|dispute|court/i.test(title + raw)) {
      return "This clause takes away your right to go to a regular public court or join a class action lawsuit. Any disagreement must be handled by a private arbitrator in the company's chosen city.";
    }
    if (/data|telemetry|privacy|sharing/i.test(title + raw)) {
      return "This clause allows the company to collect your technical device data, IP address, and usage habits, and share anonymized portions with outside partners and advertising or analytics vendors.";
    }
    if (/terminate|suspend/i.test(title + raw)) {
      return "This clause allows the provider to shut down or pause your account without giving you much advance warning, and they can delete your stored files within 30 days.";
    }
    if (/liability|damages|cap/i.test(title + raw)) {
      return "This clause caps the maximum amount the company owes you if their service breaks down or deletes your files, usually to just what you paid them over recent months.";
    }
    if (/deposit/i.test(title + raw)) {
      return "This clause explains how much advance deposit you pay and when the owner must give it back to you after you move out and hand over the keys.";
    }
    if (/non-compete/i.test(title + raw)) {
      return "This clause tries to stop you from working for a competing business after you leave. Note: In India, post-employment non-compete clauses are generally considered void under Section 27 of the Contract Act.";
    }
    return cl.relevance || "This clause defines your responsibilities and the company's operating rules. Pay close attention to any dates, fees, or permissions granted.";
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div 
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-blue-700 font-mono">
                  {t('terms.structuredCardBreakdown', 'Clause Inspector')}
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{clause.title || clause.clauseReference}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-4">
            {/* Plain English Translation Card (Ultra-Accessible) */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5 font-mono">
                  <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {t('terms.explainPlain', 'What This Means in Plain Everyday Words:')}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                  {t('terms.bottomLine', 'Layman Breakdown')}
                </span>
              </div>
              <p className="text-slate-800 text-sm leading-relaxed font-medium">
                {getUltraSimpleExplanation(clause)}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {clause.category && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                  {clause.category}
                </span>
              )}
              {clause.tag && (
                <span className="text-xs px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 font-medium border border-amber-200">
                  {clause.tag}
                </span>
              )}
              <button
                type="button"
                onClick={() => setGlossaryTerm(clause.category || 'Arbitration')}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 text-blue-700 font-medium flex items-center gap-1 transition cursor-pointer"
              >
                <BookOpen className="w-3 h-3" />
                <span>{t('glossary.title', 'Look up term in Glossary')}</span>
              </button>
            </div>

            {/* Raw Clause */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
                {t('terms.groundedNotice', 'Exact Clause Excerpt from Agreement:')}
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-mono text-slate-800 leading-relaxed whitespace-pre-wrap select-all">
                {clause.originalClause || clause.content || "Exact clause text extracted from document."}
              </div>
            </div>

            {clause.relevance && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
                <span className="font-semibold text-slate-900">{t('glossary.whyItMatters', 'Why this matters:')} </span>
                {clause.relevance}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">LegalLens AI Clarity Layer</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t('terms.copied', 'Copied') : t('terms.copy', 'Copy Excerpt')}</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                {t('terms.saved', 'Done')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Glossary Modal if triggered */}
      {glossaryTerm && (
        <LegalGlossaryModal
          isOpen={!!glossaryTerm}
          onClose={() => setGlossaryTerm(null)}
          initialTerm={glossaryTerm}
        />
      )}
    </>
  );
}

