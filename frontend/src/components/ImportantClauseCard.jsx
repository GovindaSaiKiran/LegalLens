import React, { useState } from 'react';
import { Eye, Tag, AlertTriangle, Info, CheckCircle2, Lightbulb } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import ClauseModal from './ClauseModal';
import LegalGlossaryModal from './LegalGlossaryModal';

export default function ImportantClauseCard({ points = [], className = '' }) {
  const { t } = useLanguage();
  const [selectedClause, setSelectedClause] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [expandedPlainWords, setExpandedPlainWords] = useState({});
  const [glossaryTerm, setGlossaryTerm] = useState(null);

  if (!points || points.length === 0) return null;

  const categories = ['all', ...new Set(points.map(p => p.category).filter(Boolean))];

  const filteredPoints = filterCategory === 'all' 
    ? points 
    : points.filter(p => p.category === filterCategory);

  const getTagBadge = (tag) => {
    switch (tag) {
      case 'Potentially Significant':
        return {
          css: 'bg-neo-amber text-black border border-amber-600/50 shadow-2xs',
          icon: AlertTriangle
        };
      case 'Important Provision':
        return {
          css: 'bg-neo-blue text-white border border-blue-600/50 shadow-2xs',
          icon: Info
        };
      case 'Worth Reviewing':
      default:
        return {
          css: 'bg-neo-greenLight text-black border border-emerald-600/50 shadow-2xs',
          icon: CheckCircle2
        };
    }
  };

  const togglePlainWords = (index) => {
    setExpandedPlainWords(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getSimpleExplanation = (point) => {
    const text = (point.finding + ' ' + (point.relevance || '')).toLowerCase();
    if (/renew|subscription|billing/i.test(text)) {
      return "Card is automatically charged every cycle. You must cancel before the cutoff window to avoid paying for the next period.";
    }
    if (/refund|non-refundable/i.test(text)) {
      return "Once billed, payments are non-refundable. You generally won't get money back even if you stop using the service.";
    }
    if (/arbitration|dispute/i.test(text)) {
      return "Disputes are settled by a private arbitrator rather than a judge in court. Class actions are waived.";
    }
    if (/data|telemetry|sharing|tracking/i.test(text)) {
      return "Your app usage, IP address, and device data may be stored and shared with third-party vendors.";
    }
    if (/terminat|suspend/i.test(text)) {
      return "The company can suspend or close your account under stated conditions, and you have a limited time to save your files.";
    }
    return point.finding;
  };

  return (
    <div className={`space-y-5 ${className}`} id="section-provisions">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-2xl font-black text-black">{t('terms.importantPoints', 'Important Things to Know')}</h3>
            <span className="text-xs font-black px-3 py-1 rounded-xl bg-neo-yellow border border-slate-900/40 shadow-2xs text-black">
              {points.length} {t('terms.clausesCount', 'Clauses')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
            {t('terms.importantSubtitle', 'Key provisions identified in objective language.')}
          </p>
        </div>

        {/* Category filter pills */}
        {categories.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer border ${
                  filterCategory === cat
                    ? 'bg-black text-white border-black shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat === 'all' ? t('terms.allProvisions', 'All Provisions') : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPoints.map((point, index) => {
          const badge = getTagBadge(point.tag);
          const Icon = badge.icon;
          const isExpanded = !!expandedPlainWords[index];

          return (
            <div 
              key={index}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all"
            >
              <div>
                {/* Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 shadow-2xs font-mono">
                    {point.category || 'General'}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 ${badge.css}`}>
                    <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{point.tag || 'Important Provision'}</span>
                  </span>
                </div>

                <h4 className="font-black text-black text-lg mb-2 leading-snug">{point.title}</h4>

                <div className="space-y-2.5 text-sm">
                  <p className="text-slate-900 leading-relaxed font-medium">
                    <strong className="font-bold text-black">{t('terms.agreementStates', 'The agreement states:')} </strong>
                    {point.finding}
                  </p>

                  {point.relevance && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800">
                      <strong className="font-bold">{t('terms.mayAffectYou', 'This may affect you because:')} </strong>
                      {point.relevance}
                    </div>
                  )}

                  {/* Expandable Plain Words Box */}
                  {isExpanded && (
                    <div className="p-3.5 rounded-xl bg-neo-yellow/30 border border-amber-300 shadow-2xs text-xs sm:text-sm space-y-1 animate-in fade-in duration-150">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                        <Lightbulb className="w-4 h-4 text-black fill-neo-yellow" />
                        <span>{t('terms.inLaymanWords', 'In Everyday Layman Words:')}</span>
                      </div>
                      <p className="text-black font-semibold leading-relaxed">
                        {getSimpleExplanation(point)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => togglePlainWords(index)}
                  className="text-xs font-bold text-slate-800 hover:bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-slate-700" />
                  <span>{isExpanded ? t('terms.hidePlain', 'Hide Plain Words') : `💡 ${t('terms.explainPlain', 'Explain in Plain Words')}`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedClause(point)}
                  className="neo-btn-sm bg-neo-yellow hover:bg-neo-yellowHover text-black px-3 py-1.5 rounded-xl border border-slate-900"
                  title={t('terms.viewOriginalClause', 'View original clause quote')}
                >
                  <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{t('terms.viewOriginalClause', 'View Original Clause')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ClauseModal
        isOpen={!!selectedClause}
        onClose={() => setSelectedClause(null)}
        clause={selectedClause}
      />

      {glossaryTerm && (
        <LegalGlossaryModal
          isOpen={!!glossaryTerm}
          onClose={() => setGlossaryTerm(null)}
          initialTerm={glossaryTerm}
        />
      )}
    </div>
  );
}
