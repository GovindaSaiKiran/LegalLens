import React, { useState } from 'react';
import { BookOpen, Sparkles, Bookmark, Copy, Check, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { generateEli5Breakdown, simplifyLegalText } from '../utils/simplifier';
import { useLanguage } from '../context/LanguageContext';
import VoiceOutputButton from './VoiceOutputButton';

export default function LegalSummaryCard({ 
  title, 
  summary, 
  analysis = {},
  sourceType, 
  sourceUrl, 
  isSaved, 
  onToggleSave,
  isSimpleMode = false,
  className = '' 
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const eli5Data = generateEli5Breakdown({ summary, ...analysis });

  const handleCopy = () => {
    const textToCopy = isSimpleMode && eli5Data 
      ? `${title} (ELI5 Simplified Breakdown)\n\nBottom Line:\n${eli5Data.bottomLine}\n\nKey Rules:\n${eli5Data.simpleRules.join('\n')}\n\nWatch Out For:\n${eli5Data.simpleCatches.join('\n')}`
      : `${title}\n\nSummary:\n${summary}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 relative overflow-hidden transition-all ${className}`}>
      {/* Top accent banner */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border border-slate-900/40 shadow-2xs mb-3 transition-colors bg-neo-yellow text-black">
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isSimpleMode ? t('terms.eli5ActiveBanner', '✨ ELI5 Mode: 5th-Grade Everyday English') : t('terms.aiSynthesis', 'AI Plain-Language Synthesis')}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-black leading-snug">{title}</h2>
          {sourceUrl && (
            <p className="text-xs text-slate-700 font-mono mt-1.5 truncate max-w-md">
              {t('terms.source', 'Source')}: <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-bold">{sourceUrl}</a>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 self-start flex-wrap">
          {/* TTS Listen Button in selected native language */}
          <VoiceOutputButton 
            text={isSimpleMode && eli5Data ? (eli5Data.bottomLine || summary) : summary} 
          />

          <button
            onClick={handleCopy}
            title="Copy summary"
            className="neo-btn-sm bg-white hover:bg-slate-100 text-black px-3 py-2 rounded-xl cursor-pointer border border-slate-300"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
            <span>{copied ? t('terms.copied', 'Copied') : t('terms.copy', 'Copy')}</span>
          </button>

          {onToggleSave && (
            <button
              onClick={onToggleSave}
              className={`neo-btn-sm px-3.5 py-2 rounded-xl cursor-pointer border border-slate-300 ${
                isSaved 
                  ? 'bg-neo-yellow text-black' 
                  : 'bg-white hover:bg-neo-yellow text-black'
              }`}
            >
              <Bookmark className={`w-4 h-4 stroke-[2.5] ${isSaved ? 'fill-black' : ''}`} />
              <span>{isSaved ? t('terms.saved', 'Saved') : t('terms.saveReport', 'Save Report')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode 1: ELI5 ULTRA-SIMPLE VIEW */}
      {isSimpleMode ? (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* 1. Bottom Line Pill */}
          <div className="bg-neo-greenLight rounded-xl p-4.5 border border-emerald-300 shadow-2xs">
            <h3 className="text-xs font-black uppercase tracking-wider text-black mb-1.5 flex items-center gap-1.5 font-mono">
              <span className="text-sm">📌</span>
              {t('terms.bottomLine', 'The Bottom Line (In Everyday Words)')}
            </h3>
            <p className="text-black text-base sm:text-lg font-bold leading-snug">
              {eli5Data ? eli5Data.bottomLine : simplifyLegalText(summary)}
            </p>
          </div>

          {/* 2. Key Rules & Catches 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[3]" />
                {t('terms.whatYouMustFollow', 'What You Must Follow')}
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm font-semibold text-slate-800">
                {eli5Data && eli5Data.simpleRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-black font-black">👉</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-neo-yellow/20 rounded-xl p-4 border border-amber-300 shadow-2xs space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 font-mono">
                <AlertTriangle className="w-4 h-4 text-amber-700 stroke-[2.5]" />
                {t('terms.mainCatches', 'Main Catches to Watch Out For')}
              </h4>
              <ul className="space-y-1.5 text-xs sm:text-sm font-bold text-black">
                {eli5Data && eli5Data.simpleCatches.map((catchItem, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span>{catchItem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. Full Simplified Narrative */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 font-mono block mb-1">
              {t('terms.fullSimplifiedNarrative', 'Full Conversational Translation:')}
            </span>
            <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
              {eli5Data ? eli5Data.fullSimplifiedSummary : simplifyLegalText(summary)}
            </p>
          </div>
        </div>
      ) : (
        /* Mode 2: STANDARD EXECUTIVE OVERVIEW */
        <div className="bg-[#fcfaf2] rounded-xl p-5 border border-slate-200 shadow-2xs">
          <h3 className="text-xs font-black uppercase tracking-wider text-black mb-2 flex items-center gap-1.5 font-mono">
            <BookOpen className="w-4 h-4 stroke-[2.5]" />
            {t('terms.executiveOverview', 'Executive Overview')}
          </h3>
          <p className="text-slate-900 leading-relaxed sm:text-base text-sm font-medium">
            {summary}
          </p>
        </div>
      )}
    </div>
  );
}
