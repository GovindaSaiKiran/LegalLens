import React from 'react';
import { Clock, ShieldAlert, AlertTriangle, Calendar, CheckCircle2, BookOpen, Sparkles, Bot, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function DocumentScorecard({ 
  analysis, 
  title = '', 
  className = '' 
}) {
  const { t } = useLanguage();
  if (!analysis) return null;

  const importantCount = analysis.important_points?.length || 0;
  const deadlineCount = analysis.deadlines?.length || 0;
  const obligationCount = analysis.obligations?.length || 0;
  const reviewCount = analysis.areas_to_review?.length || 0;

  // Compute a friendly clarity rating
  let clarityScore = 82;
  let clarityLabel = t('scorecard.standardTerms', 'Standard Commercial Terms');
  let clarityBg = "bg-sky-100 text-slate-900 border-sky-300";

  if (importantCount >= 5 || reviewCount >= 3) {
    clarityScore = 68;
    clarityLabel = t('scorecard.requiresReview', 'Requires Focused Review');
    clarityBg = "bg-amber-100 text-amber-900 border-amber-300";
  }

  // Reading time comparison
  const plainWords = (analysis.summary || '').split(/\s+/).length + (analysis.what_you_are_agreeing_to || []).join(' ').split(/\s+/).length;
  const plainMins = Math.max(1, Math.round(plainWords / 120));
  const fullContractMins = Math.max(15, plainMins * 8);

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 border border-amber-500 shadow-2xs text-slate-950 flex items-center justify-center font-black text-lg shrink-0">
            ⚡
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-xl leading-tight">
              {t('scorecard.title', 'Document At-A-Glance Scorecard')}
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {t('scorecard.subtitle', 'Instant breakdown of clarity, reading time saved, and critical obligations')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border shadow-2xs uppercase tracking-wider ${clarityBg}`}>
            {t('scorecard.score', 'Score')}: {clarityScore}/100 • {clarityLabel}
          </span>
        </div>
      </div>

      {/* 4 Metric Pillars */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {/* Metric 1: Reading Time Saved */}
        <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-900 font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4 stroke-[2.5] text-sky-700" />
            <span>{t('scorecard.readingTime', 'Reading Time')}</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            ~{plainMins} min
          </div>
          <p className="text-xs text-slate-600 font-medium">
            vs ~{fullContractMins} mins {t('scorecard.readingTimeDesc', 'raw text')}
          </p>
        </div>

        {/* Metric 2: Key Clauses to Review */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-900 font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 stroke-[2.5] text-amber-700" />
            <span>{t('terms.importantPoints', 'Key Clauses')}</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {importantCount} <span className="text-xs font-bold">{t('terms.clausesCount', 'clauses')}</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            {reviewCount} {t('scorecard.areasDesc', 'areas to review')}
          </p>
        </div>

        {/* Metric 3: Critical Deadlines */}
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-900 font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4 stroke-[2.5] text-purple-700" />
            <span>{t('terms.deadlines', 'Deadlines')}</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {deadlineCount} <span className="text-xs font-bold">{t('terms.deadlines', 'dates')}</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            {t('scorecard.datesDesc', 'Time-sensitive windows')}
          </p>
        </div>

        {/* Metric 4: Your Obligations */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-900 font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5] text-emerald-700" />
            <span>{t('terms.obligations', 'Obligations')}</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {obligationCount} <span className="text-xs font-bold">{t('terms.obligations', 'duties')}</span>
          </div>
          <p className="text-xs text-slate-600 font-medium">
            {t('scorecard.dutiesDesc', 'Affirmative duties')}
          </p>
        </div>
      </div>

      {/* Ask Copilot directly about this document */}
      <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/60 p-3.5 rounded-xl border border-purple-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#7c3aed] text-amber-300 border border-purple-900 flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
            <Bot className="w-4.5 h-4.5 stroke-[2.5]" />
          </div>
          <div>
            <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <span>{t('scorecard.questionsPrompt', "Have questions about this document's score or risks?")}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h5>
            <p className="text-[11px] text-slate-600 font-medium">
              {t('scorecard.copilotActive', 'The AI Copilot is active and can explain tricky clauses, suggest questions for lawyers, or clarify obligations.')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-legallens-agent', {
            detail: { prompt: `Can you explain the key risks, obligations, and clarity score (${clarityScore}/100) of ${title || 'this analyzed document'}?` }
          }))}
          className="shrink-0 px-3.5 py-2 rounded-xl border border-purple-900 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-black shadow-2xs hover:translate-x-[1px] hover:translate-y-[1px] transition flex items-center gap-1.5 cursor-pointer"
        >
          <span>{t('scorecard.askCopilot', 'Ask Copilot About This')}</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}

