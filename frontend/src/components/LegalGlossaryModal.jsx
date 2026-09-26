import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  Shuffle, 
  Layers,
  HelpCircle,
  ArrowRight,
  Bookmark,
  Scale
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { legalGlossary, glossaryCategories, riskLevelMetadata } from '../data/legalGlossary';
import { useLanguage } from '../context/LanguageContext';

export default function LegalGlossaryModal({ isOpen, onClose, initialTerm = '' }) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState(initialTerm || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'quiz'
  const [quizIndex, setQuizIndex] = useState(0);
  const [showQuizAnswer, setShowQuizAnswer] = useState(false);

  // Sync initialTerm when changed
  React.useEffect(() => {
    if (initialTerm) {
      setSearchTerm(initialTerm);
    }
  }, [initialTerm]);

  // Keyboard shortcut to close on Escape
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredTerms = useMemo(() => {
    return legalGlossary.filter(item => {
      const termLower = item.term.toLowerCase();
      const expLower = item.simpleExplanation.toLowerCase();
      const exLower = item.everydayExample.toLowerCase();
      const whyLower = (item.whyItMatters || '').toLowerCase();
      const refLower = (item.statuteRef || '').toLowerCase();
      const query = searchTerm.toLowerCase().trim();

      const matchesSearch = !query || 
        termLower.includes(query) ||
        expLower.includes(query) ||
        exLower.includes(query) ||
        whyLower.includes(query) ||
        refLower.includes(query);

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesRisk = selectedRisk === 'all' || item.riskLevel === selectedRisk;

      return matchesSearch && matchesCategory && matchesRisk;
    });
  }, [searchTerm, selectedCategory, selectedRisk]);

  if (!isOpen) return null;

  const handleCopy = (item) => {
    const textToCopy = `${item.term} (${item.category})\n\nPlain Meaning: ${item.simpleExplanation}\n\nExample: ${item.everydayExample}\n\nWhy It Matters: ${item.whyItMatters}\n\nLegal Reference: ${item.statuteRef || 'General Law'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRandomTerm = () => {
    const randomIndex = Math.floor(Math.random() * legalGlossary.length);
    const randomItem = legalGlossary[randomIndex];
    setSearchTerm(randomItem.term);
    setSelectedCategory('all');
    setSelectedRisk('all');
  };

  const handleSelectRelated = (termName) => {
    setSearchTerm(termName);
  };

  const currentQuizTerm = legalGlossary[quizIndex % legalGlossary.length];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#fcfaf2] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border-3 border-black shadow-neo-xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 py-4 border-b-3 border-black bg-neo-yellow flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-black shadow-neo-sm flex items-center justify-center text-black shrink-0">
              <BookOpen className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-black text-lg sm:text-xl tracking-tight flex items-center gap-1.5">
                  {t('glossary.badge', 'Plain-Language Legal Glossary')}
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-black text-white text-[10px] font-black uppercase tracking-wider">
                  {legalGlossary.length} {t('glossary.legalTerms', 'Terms')}
                </span>
              </div>
              <p className="text-xs text-black/80 font-bold">
                {t('glossary.subtitle', 'Jargon-free definitions, real-world examples, and statutory rights')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomTerm}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-xs font-black text-black cursor-pointer"
              title="Surprise me with a random legal term"
            >
              <Shuffle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t('glossary.shuffle', 'Random')}</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white hover:bg-neo-coral border-2 border-black shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-black flex items-center justify-center cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* View Mode Toggle Bar (Browse vs Flashcard Mode) */}
        <div className="px-5 py-2.5 bg-white border-b-2 border-black flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-3 py-1 rounded-lg text-xs font-black border-2 border-black transition-all ${
                activeTab === 'browse'
                  ? 'bg-black text-white shadow-neo-sm'
                  : 'bg-neo-gray text-black hover:bg-neo-yellow'
              }`}
            >
              📚 {t('glossary.viewCards', 'Browse All')} ({filteredTerms.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('quiz');
                setShowQuizAnswer(false);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-black border-2 border-black transition-all flex items-center gap-1.5 ${
                activeTab === 'quiz'
                  ? 'bg-neo-purple text-black shadow-neo-sm'
                  : 'bg-neo-purpleLight text-black hover:bg-neo-purple'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t('glossary.flashcardQuiz', 'Flashcard Quiz')}</span>
            </button>
          </div>

          <Link
            to="/glossary"
            onClick={onClose}
            className="text-xs font-black text-black flex items-center gap-1 hover:underline hover:text-neo-blue"
          >
            <span>{t('glossary.openDedicated', 'Open Dedicated Full Page')}</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>

        {activeTab === 'browse' ? (
          <>
            {/* Search & Category Filter Controls */}
            <div className="p-4 sm:p-5 bg-[#fcfaf2] border-b-2 border-black space-y-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-5 h-5 text-black absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('glossary.searchPlaceholder', 'Search terms, Latin phrases, or definitions...')}
                  className="w-full pl-11 pr-10 py-2.5 rounded-xl border-2 border-black bg-white text-sm font-bold text-black placeholder:text-slate-400 shadow-neo-sm focus:outline-none focus:shadow-neo transition-all"
                  autoFocus
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-200 text-black font-bold text-xs"
                  >
                    {t('dash.delete', 'Clear')}
                  </button>
                )}
              </div>

              {/* Category Pills Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
                {glossaryCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg border-2 border-black whitespace-nowrap font-black transition-all ${
                      selectedCategory === cat
                        ? 'bg-neo-yellow text-black shadow-neo-sm translate-x-[1px] translate-y-[1px]'
                        : 'bg-white text-black hover:bg-neo-yellowLight'
                    }`}
                  >
                    {cat === 'all' ? `✨ ${t('glossary.allCategories', 'All Categories')}` : cat}
                  </button>
                ))}
              </div>

              {/* Risk Level Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-black text-black uppercase tracking-wider font-mono">
                  {t('glossary.riskRating', 'Risk Rating')}:
                </span>
                <button
                  onClick={() => setSelectedRisk('all')}
                  className={`px-2.5 py-0.5 rounded-md border-2 border-black text-[11px] font-black transition-all ${
                    selectedRisk === 'all' ? 'bg-black text-white shadow-neo-sm' : 'bg-white text-black'
                  }`}
                >
                  {t('glossary.allRisks', 'All Types')}
                </button>
                {Object.entries(riskLevelMetadata).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedRisk(key)}
                    className={`px-2.5 py-0.5 rounded-md border-2 border-black text-[11px] font-black flex items-center gap-1 transition-all ${
                      selectedRisk === key 
                        ? `${meta.badge} shadow-neo-sm` 
                        : 'bg-white text-black hover:bg-slate-100'
                    }`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Terms List Scroll Container */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
              {filteredTerms.length > 0 ? (
                filteredTerms.map((item) => {
                  const riskMeta = riskLevelMetadata[item.riskLevel] || riskLevelMetadata.standard;
                  return (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-xl border-2 border-black shadow-neo-sm p-4 sm:p-5 space-y-3.5 hover:shadow-neo transition-all"
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b-2 border-black/10 pb-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-black text-black text-base sm:text-lg tracking-tight">
                              {item.term}
                            </h4>
                            <span className="px-2.5 py-0.5 rounded-md border-2 border-black bg-neo-blueLight text-black text-[11px] font-black uppercase">
                              {item.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md border-2 ${riskMeta.badge} text-[11px] flex items-center gap-1`}>
                              <span>{riskMeta.icon}</span>
                              <span>{riskMeta.label}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(item)}
                            className="p-1.5 rounded-lg border-2 border-black bg-white hover:bg-neo-yellow text-black shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all text-xs font-black flex items-center gap-1 cursor-pointer"
                            title="Copy plain explanation"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[3] text-green-600" />
                                <span className="text-[10px]">{t('glossary.copySuccess', 'Copied!')}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span className="text-[10px] hidden sm:inline">{t('glossary.copyPlain', 'Copy')}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Plain Language Meaning Box */}
                      <div className="p-3.5 rounded-xl bg-neo-yellow/20 border-2 border-black space-y-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-black flex items-center gap-1 font-mono">
                          💡 {t('glossary.inPlainWords', 'In Plain Words:')}
                        </span>
                        <p className="text-black text-sm font-bold leading-relaxed">
                          {item.simpleExplanation}
                        </p>
                      </div>

                      {/* Everyday Scenario Box */}
                      <div className="p-3.5 rounded-xl bg-neo-blueLight/50 border-2 border-black space-y-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-black flex items-center gap-1 font-mono">
                          📖 {t('glossary.everydayScenario', 'Everyday Scenario:')}
                        </span>
                        <p className="text-black text-xs sm:text-sm font-medium italic leading-relaxed">
                          "{item.everydayExample}"
                        </p>
                      </div>

                      {/* Why it Matters & Red Flag Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {item.whyItMatters && (
                          <div className="p-3 rounded-xl bg-neo-amberLight border-2 border-black text-xs space-y-1">
                            <span className="font-black text-black uppercase tracking-wider block font-mono">
                              ⚠️ {t('glossary.whyItMatters', 'Why It Matters:')}
                            </span>
                            <p className="text-black font-semibold leading-normal">
                              {item.whyItMatters}
                            </p>
                          </div>
                        )}

                        {item.proTip && (
                          <div className="p-3 rounded-xl bg-neo-greenLight border-2 border-black text-xs space-y-1">
                            <span className="font-black text-black uppercase tracking-wider block font-mono">
                              🎯 {t('glossary.proTip', 'Consumer Pro-Tip:')}
                            </span>
                            <p className="text-black font-semibold leading-normal">
                              {item.proTip}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Statutory Reference & Related Terms */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t-2 border-black/10 text-xs">
                        {item.statuteRef ? (
                          <div className="flex items-center gap-1.5 text-black font-bold">
                            <Scale className="w-3.5 h-3.5 stroke-[2.5] text-black" />
                            <span>{t('glossary.legalRef', 'Legal Ref')}: <span className="font-black underline">{item.statuteRef}</span></span>
                          </div>
                        ) : <div />}

                        {item.relatedTerms && item.relatedTerms.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-extrabold text-black">Related:</span>
                            {item.relatedTerms.map((relTerm, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSelectRelated(relTerm)}
                                className="px-2 py-0.5 rounded-md border-2 border-black bg-white hover:bg-neo-yellow text-[10px] font-black text-black shadow-neo-sm hover:shadow-none transition-all cursor-pointer"
                              >
                                {relTerm} →
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-black bg-white space-y-3">
                  <AlertTriangle className="w-10 h-10 text-black mx-auto stroke-[2.5]" />
                  <h4 className="font-black text-black text-lg">{t('glossary.noResults', 'No matching terms found.')}</h4>
                  <p className="text-xs text-black/70 max-w-sm mx-auto font-medium">
                    We couldn't find terms matching "{searchTerm}". Try clearing your filters or search for another keyword.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSelectedRisk('all');
                    }}
                    className="px-4 py-2 rounded-xl border-2 border-black bg-neo-yellow font-black text-xs shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                  >
                    {t('glossary.resetFilters', 'Reset Filters')}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Flashcard Quiz Mode */
          <div className="flex-1 p-5 overflow-y-auto flex flex-col items-center justify-center space-y-5 bg-[#fcfaf2]">
            <div className="max-w-xl w-full bg-white rounded-2xl border-3 border-black shadow-neo-lg p-6 space-y-4 text-center">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <span className="px-3 py-1 rounded-md border-2 border-black bg-neo-purpleLight font-black text-xs">
                  Card {(quizIndex % legalGlossary.length) + 1} of {legalGlossary.length}
                </span>
                <span className="text-xs font-black uppercase text-black font-mono">
                  {currentQuizTerm.category}
                </span>
              </div>

              <div className="py-4 space-y-2">
                <span className="text-xs font-black uppercase tracking-widest text-black/60 font-mono">
                  {t('glossary.subtitle', 'Can you explain this term?')}
                </span>
                <h3 className="font-black text-black text-2xl sm:text-3xl">
                  {currentQuizTerm.term}
                </h3>
              </div>

              {showQuizAnswer ? (
                <div className="space-y-4 text-left animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-4 rounded-xl bg-neo-yellow/30 border-2 border-black space-y-1">
                    <span className="text-xs font-black uppercase text-black font-mono">{t('glossary.inPlainWords', 'In Plain Words:')}</span>
                    <p className="text-sm font-bold text-black">{currentQuizTerm.simpleExplanation}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-neo-blueLight/50 border-2 border-black space-y-1">
                    <span className="text-xs font-black uppercase text-black font-mono">{t('glossary.everydayScenario', 'Everyday Scenario:')}</span>
                    <p className="text-xs sm:text-sm font-medium text-black italic">"{currentQuizTerm.everydayExample}"</p>
                  </div>

                  {currentQuizTerm.statuteRef && (
                    <p className="text-xs font-black text-black">
                      ⚖️ {t('glossary.legalRef', 'Legal Ref')}: <span className="underline">{currentQuizTerm.statuteRef}</span>
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowQuizAnswer(true)}
                  className="w-full py-3.5 rounded-xl border-2 border-black bg-neo-yellow font-black text-sm text-black shadow-neo hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer"
                >
                  👁️ {t('glossary.inPlainWords', 'Reveal Plain Meaning')}
                </button>
              )}

              <div className="flex items-center justify-between pt-4 border-t-2 border-black">
                <button
                  onClick={() => {
                    setQuizIndex((prev) => (prev - 1 + legalGlossary.length) % legalGlossary.length);
                    setShowQuizAnswer(false);
                  }}
                  className="px-4 py-2 rounded-xl border-2 border-black bg-white hover:bg-neo-gray font-black text-xs shadow-neo-sm cursor-pointer"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => {
                    setQuizIndex((prev) => (prev + 1) % legalGlossary.length);
                    setShowQuizAnswer(false);
                  }}
                  className="px-5 py-2 rounded-xl border-2 border-black bg-black text-white font-black text-xs shadow-neo-sm hover:bg-neutral-800 cursor-pointer"
                >
                  Next Term →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Bottom Footer */}
        <div className="px-5 py-3.5 border-t-3 border-black bg-white flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-black">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-neo-green border border-black"></span>
            <span>{t('glossary.showing', 'Showing')} {filteredTerms.length} / {legalGlossary.length} {t('glossary.legalTerms', 'terms')}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/glossary"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border-2 border-black bg-neo-yellow hover:bg-neo-yellowHover text-black font-black text-xs shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-1.5"
            >
              <span>{t('glossary.openDedicated', 'Explore Full Glossary Page')}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border-2 border-black bg-black text-white font-black text-xs shadow-neo-sm hover:bg-neutral-800 transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
