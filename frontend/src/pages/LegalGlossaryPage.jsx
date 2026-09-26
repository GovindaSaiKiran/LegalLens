import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Scale, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  Shuffle, 
  Bookmark, 
  BookmarkCheck, 
  Printer, 
  HelpCircle, 
  ArrowRight, 
  Grid, 
  List, 
  Table as TableIcon,
  Flame,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { legalGlossary, glossaryCategories, riskLevelMetadata } from '../data/legalGlossary';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { useLanguage } from '../context/LanguageContext';

export default function LegalGlossaryPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [selectedLetter, setSelectedLetter] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'grid' | 'table'
  const [copiedId, setCopiedId] = useState(null);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('legallens_glossary_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('legallens_glossary_bookmarks', JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.error(e);
    }
  }, [bookmarkedIds]);

  // Agent Glossary Search Event Listener
  useEffect(() => {
    const handleAgentSearch = (e) => {
      const { searchTerm: term } = e.detail || {};
      if (term) {
        setSearchTerm(term);
        setSelectedCategory('all');
        setSelectedRisk('all');
        setSelectedLetter('all');
      }
    };
    window.addEventListener('legallens-search-glossary', handleAgentSearch);
    return () => window.removeEventListener('legallens-search-glossary', handleAgentSearch);
  }, []);

  const toggleBookmark = (id) => {
    setBookmarkedIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Alphabet letters list present in glossary
  const alphabet = useMemo(() => {
    const letters = new Set(legalGlossary.map((item) => item.term[0].toUpperCase()));
    return Array.from(letters).sort();
  }, []);

  // Filtered terms computation
  const filteredTerms = useMemo(() => {
    return legalGlossary.filter((item) => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = !query ||
        item.term.toLowerCase().includes(query) ||
        item.simpleExplanation.toLowerCase().includes(query) ||
        item.everydayExample.toLowerCase().includes(query) ||
        (item.whyItMatters && item.whyItMatters.toLowerCase().includes(query)) ||
        (item.statuteRef && item.statuteRef.toLowerCase().includes(query)) ||
        (item.proTip && item.proTip.toLowerCase().includes(query));

      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesRisk = selectedRisk === 'all' || item.riskLevel === selectedRisk;
      const matchesLetter = selectedLetter === 'all' || item.term[0].toUpperCase() === selectedLetter;
      const matchesBookmark = !showOnlyBookmarks || bookmarkedIds.includes(item.id);

      return matchesSearch && matchesCategory && matchesRisk && matchesLetter && matchesBookmark;
    });
  }, [searchTerm, selectedCategory, selectedRisk, selectedLetter, showOnlyBookmarks, bookmarkedIds]);

  // Statistics
  const stats = useMemo(() => {
    const highRisk = legalGlossary.filter((i) => i.riskLevel === 'high').length;
    const protective = legalGlossary.filter((i) => i.riskLevel === 'protective').length;
    const categoriesCount = new Set(legalGlossary.map((i) => i.category)).size;
    return {
      total: legalGlossary.length,
      highRisk,
      protective,
      categoriesCount
    };
  }, []);

  const handleCopy = (item) => {
    const textToCopy = `📌 ${item.term} (${item.category})\n\n💡 In Plain Words:\n${item.simpleExplanation}\n\n📖 Everyday Scenario:\n"${item.everydayExample}"\n\n⚠️ Why It Matters:\n${item.whyItMatters}\n\n⚖️ Legal Reference:\n${item.statuteRef || 'General Statutory Law'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShuffleSpotlight = () => {
    setSpotlightIndex(Math.floor(Math.random() * legalGlossary.length));
  };

  const currentSpotlight = legalGlossary[spotlightIndex % legalGlossary.length];

  const handleAskAssistant = (term) => {
    navigate(`/legal-assistant?q=${encodeURIComponent(`Explain the legal term '${term.term}' in simple words, how it affects consumers in India, and what precautions I should take.`)}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#fcfaf2] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Hero Banner */}
        <div className="bg-neo-yellow rounded-3xl border-3 border-black shadow-neo-lg p-6 sm:p-10 relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg border-2 border-black bg-white font-black text-xs text-black uppercase tracking-wider flex items-center gap-1.5 shadow-neo-sm">
                <BookOpen className="w-4 h-4 stroke-[2.5]" />
                {t('glossary.badge', 'Plain-Language Legal Glossary')}
              </span>
              <span className="px-3 py-1 rounded-lg border-2 border-black bg-neo-green font-black text-xs text-black shadow-neo-sm">
                {t('glossary.groundedInLaw', '🇮🇳 Grounded in Indian Law')}
              </span>
            </div>

            <h1 className="font-black text-3xl sm:text-5xl text-black tracking-tight leading-tight">
              {t('glossary.title', 'Decode Intimidating Legal Jargon Into Plain English.')}
            </h1>

            <p className="text-base sm:text-lg text-black font-bold leading-relaxed">
              {t('glossary.subtitle', 'Every contract is filled with traps disguised as confusing vocabulary. Search everyday definitions, relatable real-world scenarios, and actionable pro-tips to protect your consumer rights.')}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-xl border-2 border-black bg-white hover:bg-neo-blueLight text-black font-black text-xs sm:text-sm shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-2 cursor-pointer no-print"
              >
                <Printer className="w-4 h-4 stroke-[2.5]" />
                <span>{t('terms.print', 'Print / PDF Cheat Sheet')}</span>
              </button>
              <button
                onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
                className={`px-4 py-2.5 rounded-xl border-2 border-black font-black text-xs sm:text-sm shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-2 cursor-pointer ${
                  showOnlyBookmarks ? 'bg-black text-white' : 'bg-white text-black hover:bg-neo-pinkLight'
                }`}
              >
                <Bookmark className="w-4 h-4 stroke-[2.5]" />
                <span>{t('glossary.bookmarksOnly', 'Saved Bookmarks')} ({bookmarkedIds.length})</span>
              </button>
            </div>
          </div>

          {/* Neo-brutalist decorative stamp */}
          <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col items-center justify-center w-48 h-48 rounded-full border-3 border-black bg-neo-pink shadow-neo rotate-6 p-4 text-center">
            <Scale className="w-10 h-10 stroke-[2.5] text-black mb-1" />
            <span className="font-black text-xs uppercase tracking-wider text-black text-center leading-tight">
              {t('glossary.noLawDegree', '100% Plain • No Law Degree Needed')}
            </span>
          </div>
        </div>

        {/* Quick Stats Metric Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border-2 border-black shadow-neo-sm p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-neo-yellow border-2 border-black shadow-neo-sm flex items-center justify-center font-black text-xl text-black">
              {stats.total}
            </div>
            <div>
              <span className="text-[11px] font-black uppercase text-black/70 block font-mono">
                {t('glossary.totalTerms', 'Total Terms')}
              </span>
              <span className="font-extrabold text-sm text-black">
                {t('glossary.plainMeaning', 'Plain Definitions')}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-black shadow-neo-sm p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-neo-coral border-2 border-black shadow-neo-sm flex items-center justify-center font-black text-xl text-black">
              {stats.highRisk}
            </div>
            <div>
              <span className="text-[11px] font-black uppercase text-black/70 block font-mono">
                {t('glossary.highRiskTraps', 'High-Risk Traps')}
              </span>
              <span className="font-extrabold text-sm text-black">
                {t('scorecard.requiresReview', 'Requires Review')}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-black shadow-neo-sm p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-neo-green border-2 border-black shadow-neo-sm flex items-center justify-center font-black text-xl text-black">
              {stats.protective}
            </div>
            <div>
              <span className="text-[11px] font-black uppercase text-black/70 block font-mono">
                {t('glossary.userSafeguards', 'User Safeguards')}
              </span>
              <span className="font-extrabold text-sm text-black">
                {t('terms.obligations', 'Protective Rights')}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-black shadow-neo-sm p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-neo-purple border-2 border-black shadow-neo-sm flex items-center justify-center font-black text-xl text-black">
              {stats.categoriesCount}
            </div>
            <div>
              <span className="text-[11px] font-black uppercase text-black/70 block font-mono">
                {t('glossary.categoriesDesc', 'Categories')}
              </span>
              <span className="font-extrabold text-sm text-black">
                {t('glossary.allCategories', 'All Categories')}
              </span>
            </div>
          </div>
        </div>

        {/* Term Spotlight Card ("Term of the Moment") */}
        <div className="bg-white rounded-3xl border-3 border-black shadow-neo-md p-6 sm:p-8 space-y-4 relative">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg border-2 border-black bg-neo-purple font-black text-xs text-black flex items-center gap-1.5 shadow-neo-sm">
                <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                {t('glossary.spotlight', 'Spotlight Term of the Day')}
              </span>
              <span className="text-xs font-black text-black font-mono">
                {t('glossary.category', 'Category:')} <span className="underline">{currentSpotlight.category}</span>
              </span>
            </div>

            <button
              onClick={handleShuffleSpotlight}
              className="px-3 py-1.5 rounded-xl border-2 border-black bg-neo-yellow hover:bg-neo-yellowHover text-black font-black text-xs shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{t('glossary.shuffle', 'Shuffle Spotlight')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 space-y-3">
              <h2 className="font-black text-2xl sm:text-3xl text-black tracking-tight">
                {currentSpotlight.term}
              </h2>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-1 rounded-lg border-2 ${riskLevelMetadata[currentSpotlight.riskLevel].badge} text-xs flex items-center gap-1.5`}>
                  <span>{riskLevelMetadata[currentSpotlight.riskLevel].icon}</span>
                  <span>{riskLevelMetadata[currentSpotlight.riskLevel].label}</span>
                </span>
                {currentSpotlight.statuteRef && (
                  <span className="px-2.5 py-1 rounded-lg border-2 border-black bg-white text-xs font-black">
                    ⚖️ {currentSpotlight.statuteRef}
                  </span>
                )}
              </div>
              <div className="pt-2">
                <button
                  onClick={() => handleAskAssistant(currentSpotlight)}
                  className="w-full py-2.5 px-4 rounded-xl border-2 border-black bg-black text-white hover:bg-neutral-800 font-black text-xs shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('glossary.askInAssistant', 'Ask in Legal Assistant')}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-3">
              <div className="p-4 rounded-2xl bg-neo-yellow/30 border-2 border-black space-y-1">
                <span className="text-xs font-black uppercase text-black font-mono">💡 {t('glossary.inPlainWords', 'In Plain Words:')}</span>
                <p className="text-black font-bold text-sm sm:text-base leading-relaxed">
                  {currentSpotlight.simpleExplanation}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neo-blueLight/60 border-2 border-black space-y-1">
                <span className="text-xs font-black uppercase text-black font-mono">📖 {t('glossary.everydayScenario', 'Everyday Scenario:')}</span>
                <p className="text-black font-semibold text-xs sm:text-sm italic leading-relaxed">
                  "{currentSpotlight.everydayExample}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Search & Interactive Filter Controls */}
        <div className="bg-white rounded-3xl border-3 border-black shadow-neo-md p-5 sm:p-6 space-y-4 sticky top-20 z-30">
          {/* Search bar & View switch */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:flex-1">
              <Search className="w-5 h-5 text-black absolute left-4 top-1/2 -translate-y-1/2 stroke-[2.5]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('glossary.searchPlaceholder', 'Search terms, Latin phrases, or definitions (e.g. indemnity, force majeure, arbitration)...')}
                className="w-full pl-12 pr-10 py-3 rounded-2xl border-2 border-black bg-[#fcfaf2] font-bold text-black text-sm sm:text-base placeholder:text-black/40 shadow-neo-sm focus:outline-none focus:shadow-neo transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-white border border-black font-black text-xs text-black hover:bg-neo-yellow cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* View mode toggle */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl border-2 border-black bg-white shadow-neo-sm">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-neo-yellow border-black shadow-neo-sm' : 'border-transparent text-black hover:bg-slate-100'
                }`}
                title={t('glossary.viewCards', 'Cards')}
              >
                <List className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-neo-yellow border-black shadow-neo-sm' : 'border-transparent text-black hover:bg-slate-100'
                }`}
                title={t('glossary.viewGrid', 'Grid')}
              >
                <Grid className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl border-2 transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-neo-yellow border-black shadow-neo-sm' : 'border-transparent text-black hover:bg-slate-100'
                }`}
                title={t('glossary.viewTable', 'Table')}
              >
                <TableIcon className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {glossaryCategories.map((cat) => {
              const count = cat === 'all' 
                ? legalGlossary.length 
                : legalGlossary.filter(i => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl border-2 border-black whitespace-nowrap font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-neo-yellow text-black shadow-neo-sm translate-x-[1px] translate-y-[1px]'
                      : 'bg-white text-black hover:bg-neo-yellowLight'
                  }`}
                >
                  <span>{cat === 'all' ? `✨ ${t('glossary.allCategories', 'All Categories')}` : cat}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-black text-white text-[10px] font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Risk Level Filter + A-Z Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-black/10">
            {/* Risk pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-black uppercase tracking-wider text-black font-mono mr-1">
                {t('glossary.riskRating', 'Risk Rating:')}
              </span>
              <button
                onClick={() => setSelectedRisk('all')}
                className={`px-2.5 py-1 rounded-lg border-2 border-black font-black transition-all cursor-pointer ${
                  selectedRisk === 'all' ? 'bg-black text-white shadow-neo-sm' : 'bg-white text-black hover:bg-slate-100'
                }`}
              >
                {t('glossary.allRisks', 'All Risk Levels')}
              </button>
              {Object.entries(riskLevelMetadata).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setSelectedRisk(key)}
                  className={`px-2.5 py-1 rounded-lg border-2 border-black font-black flex items-center gap-1 transition-all cursor-pointer ${
                    selectedRisk === key ? `${meta.badge} shadow-neo-sm` : 'bg-white text-black hover:bg-slate-100'
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                </button>
              ))}
            </div>

            {/* A-Z Alphabet Filter */}
            <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-black">
              <button
                onClick={() => setSelectedLetter('all')}
                className={`px-2 py-0.5 rounded-md border border-black transition-all cursor-pointer ${
                  selectedLetter === 'all' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neo-yellow'
                }`}
              >
                A-Z
              </button>
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`w-6 h-6 rounded-md border border-black transition-all flex items-center justify-center cursor-pointer ${
                    selectedLetter === letter ? 'bg-neo-yellow font-black shadow-neo-sm' : 'bg-white text-black hover:bg-neo-yellowLight'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Counter & Active Filters Tag */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-2">
            <span className="font-black text-black text-sm">
              {t('glossary.showing', 'Showing')} <span className="underline decoration-neo-yellow decoration-4">{filteredTerms.length}</span> {t('glossary.legalTerms', 'legal terms')}
            </span>
            {(selectedCategory !== 'all' || selectedRisk !== 'all' || selectedLetter !== 'all' || searchTerm || showOnlyBookmarks) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedRisk('all');
                  setSelectedLetter('all');
                  setShowOnlyBookmarks(false);
                }}
                className="text-xs font-black text-black underline hover:text-neo-coral cursor-pointer"
              >
                {t('glossary.resetFilters', '(Reset Filters)')}
              </button>
            )}
          </div>

          <span className="text-xs text-black/70 font-bold font-mono">
            Click any term's "Ask AI" button to ask specific questions.
          </span>
        </div>

        {/* MAIN CONTENT DISPLAY BY VIEW MODE */}
        {filteredTerms.length > 0 ? (
          viewMode === 'cards' ? (
            /* DETAILED CARDS VIEW */
            <div className="space-y-6">
              {filteredTerms.map((item) => {
                const isBookmarked = bookmarkedIds.includes(item.id);
                const riskMeta = riskLevelMetadata[item.riskLevel] || riskLevelMetadata.standard;

                return (
                  <div
                    key={item.id}
                    id={item.id}
                    className="bg-white rounded-3xl border-3 border-black shadow-neo p-6 sm:p-7 space-y-5 hover:shadow-neo-lg transition-all"
                  >
                    {/* Card Top Row */}
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-black/10 pb-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-black text-black text-xl sm:text-2xl tracking-tight">
                            {item.term}
                          </h3>
                          <span className="px-3 py-0.5 rounded-lg border-2 border-black bg-neo-blueLight text-black text-xs font-black uppercase">
                            {item.category}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-lg border-2 ${riskMeta.badge} text-xs flex items-center gap-1`}>
                            <span>{riskMeta.icon}</span>
                            <span>{riskMeta.label}</span>
                          </span>
                        </div>
                      </div>

                      {/* Top Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleBookmark(item.id)}
                          className={`p-2 rounded-xl border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer ${
                            isBookmarked ? 'bg-neo-yellow text-black' : 'bg-white text-black hover:bg-neo-yellowLight'
                          }`}
                          title={isBookmarked ? 'Remove bookmark' : 'Bookmark this term'}
                        >
                          {isBookmarked ? <BookmarkCheck className="w-4 h-4 stroke-[2.5]" /> : <Bookmark className="w-4 h-4 stroke-[2.5]" />}
                        </button>

                        <button
                          onClick={() => handleCopy(item)}
                          className="px-3 py-2 rounded-xl border-2 border-black bg-white hover:bg-neo-yellow text-black font-black text-xs shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Copy plain summary"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-4 h-4 stroke-[3] text-green-700" />
                              <span>{t('terms.copied', 'Copied')}!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 stroke-[2.5]" />
                              <span>{t('terms.copy', 'Copy')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Section 1: In Plain Words */}
                    <div className="p-4 rounded-2xl bg-neo-yellow/25 border-2 border-black space-y-1">
                      <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 font-mono">
                        💡 {t('glossary.inPlainWords', 'In Plain Everyday Language:')}
                      </span>
                      <p className="text-black font-bold text-base leading-relaxed">
                        {item.simpleExplanation}
                      </p>
                    </div>

                    {/* Section 2: Everyday Scenario */}
                    <div className="p-4 rounded-2xl bg-neo-blueLight/50 border-2 border-black space-y-1">
                      <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5 font-mono">
                        📖 {t('glossary.everydayScenario', 'Real-World Scenario / Story:')}
                      </span>
                      <p className="text-black font-medium text-sm sm:text-base italic leading-relaxed">
                        "{item.everydayExample}"
                      </p>
                    </div>

                    {/* Section 3: Why it Matters, Pro Tip & Red Flags Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {item.whyItMatters && (
                        <div className="p-4 rounded-2xl bg-neo-amberLight border-2 border-black text-xs space-y-1.5">
                          <span className="font-black text-black uppercase tracking-wider block font-mono">
                            ⚠️ {t('glossary.whyItMatters', 'Why This Matters:')}
                          </span>
                          <p className="text-black font-semibold leading-relaxed">
                            {item.whyItMatters}
                          </p>
                        </div>
                      )}

                      {item.proTip && (
                        <div className="p-4 rounded-2xl bg-neo-greenLight border-2 border-black text-xs space-y-1.5">
                          <span className="font-black text-black uppercase tracking-wider block font-mono">
                            🎯 {t('glossary.proTip', 'Practical Pro-Tip:')}
                          </span>
                          <p className="text-black font-semibold leading-relaxed">
                            {item.proTip}
                          </p>
                        </div>
                      )}

                      {item.redFlags && (
                        <div className="p-4 rounded-2xl bg-neo-coralLight border-2 border-black text-xs space-y-1.5">
                          <span className="font-black text-black uppercase tracking-wider block font-mono">
                            🚨 Red Flags To Watch:
                          </span>
                          <p className="text-black font-semibold leading-relaxed">
                            {item.redFlags}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Card Bottom Bar: Legal Statute & AI Assistant Button */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-black/10">
                      {item.statuteRef ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-black">
                          <Scale className="w-4 h-4 stroke-[2.5]" />
                          <span>{t('glossary.statuteRef', 'Statute:')} <span className="font-black underline">{item.statuteRef}</span></span>
                        </div>
                      ) : <div />}

                      <div className="flex flex-wrap items-center gap-2">
                        {item.relatedTerms && (
                          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-black mr-2">
                            <span>Related:</span>
                            {item.relatedTerms.map((rel, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSearchTerm(rel)}
                                className="px-2 py-0.5 rounded-md border border-black bg-white hover:bg-neo-yellow text-[11px] font-black cursor-pointer"
                              >
                                {rel}
                              </button>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => handleAskAssistant(item)}
                          className="px-4 py-2 rounded-xl border-2 border-black bg-black text-white hover:bg-neutral-800 font-black text-xs shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <HelpCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{t('glossary.askInAssistant', 'Ask LegalLens AI')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : viewMode === 'grid' ? (
            /* COMPACT GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTerms.map((item) => {
                const riskMeta = riskLevelMetadata[item.riskLevel] || riskLevelMetadata.standard;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border-3 border-black shadow-neo p-5 flex flex-col justify-between space-y-4 hover:shadow-neo-lg transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded-md border-2 ${riskMeta.badge} text-[10px]`}>
                          {riskMeta.icon} {riskMeta.label}
                        </span>
                        <span className="text-[10px] font-black uppercase text-black/60 font-mono">
                          {item.category}
                        </span>
                      </div>

                      <h3 className="font-black text-xl text-black leading-tight">
                        {item.term}
                      </h3>

                      <p className="text-xs font-bold text-black line-clamp-3 leading-relaxed">
                        {item.simpleExplanation}
                      </p>

                      <div className="p-2.5 rounded-xl bg-neo-blueLight/50 border border-black text-xs italic font-medium line-clamp-2">
                        "{item.everydayExample}"
                      </div>
                    </div>

                    <div className="pt-3 border-t-2 border-black/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleCopy(item)}
                        className="p-2 rounded-lg border-2 border-black bg-white hover:bg-neo-yellow text-black text-xs font-black shadow-neo-sm cursor-pointer"
                        title="Copy definition"
                      >
                        <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>

                      <button
                        onClick={() => handleAskAssistant(item)}
                        className="px-3 py-1.5 rounded-xl border-2 border-black bg-neo-yellow hover:bg-neo-yellowHover text-black font-black text-xs shadow-neo-sm flex items-center gap-1 cursor-pointer"
                      >
                        <span>{t('glossary.askInAssistant', 'Deep Dive')}</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE CHEAT SHEET VIEW */
            <div className="bg-white rounded-3xl border-3 border-black shadow-neo overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neo-yellow border-b-3 border-black">
                    <th className="p-4 font-black text-black uppercase tracking-wider font-mono">Term / Clause</th>
                    <th className="p-4 font-black text-black uppercase tracking-wider font-mono">Domain</th>
                    <th className="p-4 font-black text-black uppercase tracking-wider font-mono">Risk Level</th>
                    <th className="p-4 font-black text-black uppercase tracking-wider font-mono">{t('glossary.inPlainWords', 'Plain Language Meaning')}</th>
                    <th className="p-4 font-black text-black uppercase tracking-wider font-mono">{t('glossary.everydayScenario', 'Everyday Scenario')}</th>
                    <th className="p-4 font-black text-black uppercase tracking-wider font-mono">{t('glossary.statuteRef', 'Statutory Basis')}</th>
                    <th className="p-4 font-black text-black uppercase tracking-wider font-mono text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black/10 font-medium text-black">
                  {filteredTerms.map((item) => {
                    const riskMeta = riskLevelMetadata[item.riskLevel] || riskLevelMetadata.standard;
                    return (
                      <tr key={item.id} className="hover:bg-neo-yellow/10 transition-colors">
                        <td className="p-4 font-black text-sm text-black whitespace-nowrap">
                          {item.term}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md border border-black bg-neo-blueLight font-black text-[11px]">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md border ${riskMeta.badge} text-[10px]`}>
                            {riskMeta.icon} {riskMeta.label}
                          </span>
                        </td>
                        <td className="p-4 min-w-[240px] font-bold">
                          {item.simpleExplanation}
                        </td>
                        <td className="p-4 min-w-[220px] italic text-black/80">
                          "{item.everydayExample}"
                        </td>
                        <td className="p-4 whitespace-nowrap font-bold">
                          {item.statuteRef || 'General Law'}
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleAskAssistant(item)}
                            className="px-2.5 py-1 rounded-lg border-2 border-black bg-neo-yellow font-black text-[11px] shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                          >
                            Ask AI →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="bg-white rounded-3xl border-3 border-black shadow-neo p-12 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-black mx-auto stroke-[2.5]" />
            <h3 className="font-black text-black text-2xl">{t('glossary.noResults', 'No Legal Terms Match Your Filters')}</h3>
            <p className="text-sm font-bold text-black/70 max-w-md mx-auto">
              We couldn't find any terms matching "{searchTerm}". Try clearing active categories or searching for everyday words like "rent", "contract", "salary", or "fine".
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedRisk('all');
                setSelectedLetter('all');
                setShowOnlyBookmarks(false);
              }}
              className="px-6 py-3 rounded-2xl border-2 border-black bg-neo-yellow font-black text-sm text-black shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Bottom Educational Disclaimer */}
        <DisclaimerBanner />
      </div>
    </div>
  );
}
