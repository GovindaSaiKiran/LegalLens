import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  FileText, 
  Upload, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Download,
  Bookmark,
  RefreshCw,
  Zap,
  Info,
  Languages
} from 'lucide-react';
import { analyzeTermsUrl, analyzeTermsText, analyzeTermsDemo, toggleSaveReport } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import VoiceInputButton from '../components/VoiceInputButton';
import VoiceOutputButton from '../components/VoiceOutputButton';
import LegalSummaryCard from '../components/LegalSummaryCard';
import WhatAmIAgreeingToCard from '../components/WhatAmIAgreeingToCard';
import ImportantClauseCard from '../components/ImportantClauseCard';
import ObligationCard from '../components/ObligationCard';
import DeadlineCard from '../components/DeadlineCard';
import RiskReviewCard from '../components/RiskReviewCard';
import LawyerQuestions from '../components/LawyerQuestions';
import ActionChecklist from '../components/ActionChecklist';
import DisclaimerBanner from '../components/DisclaimerBanner';
import DemoSelector from '../components/DemoSelector';
import DocumentScorecard from '../components/DocumentScorecard';
import AccessibilityToolbar from '../components/AccessibilityToolbar';
import QuickJumpNav from '../components/QuickJumpNav';

export default function TermsAnalyzerPage() {
  const { currentLanguage, translateAnalysis, t } = useLanguage();
  const [mode, setMode] = useState('url'); // 'url' | 'text'
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedDemoId, setSelectedDemoId] = useState(null);

  // Multilingual Translation States
  const [translationsMap, setTranslationsMap] = useState({});
  const [viewMode, setViewMode] = useState('translated'); // 'translated' | 'original'
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(null);

  // Accessibility States
  const [textSize, setTextSize] = useState('normal'); // 'normal' | 'large' | 'xlarge'
  const [isSimpleMode, setIsSimpleMode] = useState(false);

  // Popular web service presets for 1-click URL exploration
  const popularPresets = [
    { name: "CloudScale Pro (Demo)", url: "demo:saas-terms" },
    { name: "Netflix Terms", url: "https://help.netflix.com/legal/termsofuse" },
    { name: "Spotify Terms", url: "https://www.spotify.com/legal/end-user-agreement/" },
    { name: "WhatsApp Privacy", url: "https://www.whatsapp.com/legal/privacy-policy" },
    { name: "GitHub Terms", url: "https://docs.github.com/site-policy/github-terms/github-terms-of-service" }
  ];

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    setResult(null);
    setError(null);
    setLoading(true);

    try {
      let res;
      if (mode === 'url') {
        if (!urlInput || !urlInput.trim()) {
          throw new Error('Please enter a website Terms & Conditions URL.');
        }
        res = await analyzeTermsUrl(urlInput.trim());
      } else {
        if (!textInput || textInput.trim().length < 50) {
          throw new Error('Please paste at least 50 characters of legal terms.');
        }
        res = await analyzeTermsText(textInput.trim(), titleInput.trim());
      }

      setResult(res.data);
      setIsSaved(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to analyze terms.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = async (demoId) => {
    setSelectedDemoId(demoId);
    setResult(null);
    setError(null);
    setLoading(true);

    try {
      const res = await analyzeTermsDemo(demoId);
      setResult(res.data);
      setIsSaved(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to analyze demo document.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (preset) => {
    if (preset.url.startsWith('demo:')) {
      handleSelectDemo(preset.url.replace('demo:', ''));
    } else {
      setUrlInput(preset.url);
      setMode('url');
    }
  };

  const handleToggleSave = async () => {
    if (!result?.id) return;
    try {
      const res = await toggleSaveReport(result.id);
      setIsSaved(res.data.is_saved);
    } catch (err) {
      console.error('Error saving report:', err);
    }
  };

  const handleReset = () => {
    setResult(null);
    setUrlInput('');
    setTextInput('');
    setTitleInput('');
    setError(null);
    setSelectedDemoId(null);
    setTranslationError(null);
    setIsTranslating(false);
  };

  // Agent Automation Trigger Listener
  useEffect(() => {
    const handleAgentAction = (e) => {
      const { mode: m, url, text, title, demoId, enable } = e.detail || {};
      if (demoId) {
        handleSelectDemo(demoId);
      } else if (url || m === 'url') {
        setMode('url');
        if (url) {
          setUrlInput(url);
          setLoading(true);
          setError(null);
          analyzeTermsUrl(url)
            .then(res => setResult(res.data))
            .catch(err => setError(err.response?.data?.error || err.message))
            .finally(() => setLoading(false));
        }
      } else if (text || m === 'text') {
        setMode('text');
        if (text) {
          setTextInput(text);
          if (title) setTitleInput(title);
          setLoading(true);
          setError(null);
          analyzeTermsText(text, title || '')
            .then(res => setResult(res.data))
            .catch(err => setError(err.response?.data?.error || err.message))
            .finally(() => setLoading(false));
        }
      }
      if (enable !== undefined) {
        setIsSimpleMode(Boolean(enable));
      }
    };

    const handleToggleEli5 = (e) => {
      if (e.detail?.enable !== undefined) {
        setIsSimpleMode(Boolean(e.detail.enable));
      } else {
        setIsSimpleMode(prev => !prev);
      }
    };

    window.addEventListener('legallens-analyze-terms', handleAgentAction);
    window.addEventListener('legallens-toggle-eli5', handleToggleEli5);
    return () => {
      window.removeEventListener('legallens-analyze-terms', handleAgentAction);
      window.removeEventListener('legallens-toggle-eli5', handleToggleEli5);
    };
  }, []);

  // Section 5, 8, 9, 10, 11, 12, 13: Handle Translation & Cache
  useEffect(() => {
    if (!result?.analysis) {
      setIsTranslating(false);
      setTranslationError(null);
      return;
    }

    // Section 10: English Optimization — If user selects English, do NOT call Gemini translation.
    if (currentLanguage.code === 'en') {
      setIsTranslating(false);
      setTranslationError(null);
      setViewMode('original');
      return;
    }

    // Section 13: Translation cache key = analysisId + targetLanguage
    const cacheKey = `${result.id || 'curr'}_${currentLanguage.code}`;
    if (translationsMap[cacheKey]) {
      setIsTranslating(false);
      setTranslationError(null);
      setViewMode('translated');
      return;
    }

    // Perform translation non-blockingly (keeps existing analysis visible)
    let isCancelled = false;
    const performTranslation = async () => {
      setIsTranslating(true);
      setTranslationError(null);

      try {
        const translated = await translateAnalysis(
          result.analysis, 
          currentLanguage.code, 
          result.id || 'curr'
        );

        if (!isCancelled && translated) {
          setTranslationsMap(prev => ({
            ...prev,
            [cacheKey]: translated
          }));
          setViewMode('translated');
          setTranslationError(null);
        }
      } catch (err) {
        console.error('Translation failed:', err);
        if (!isCancelled) {
          setTranslationError('Translation temporarily unavailable. Your original analysis is still available.');
          setViewMode('original');
        }
      } finally {
        if (!isCancelled) {
          setIsTranslating(false);
        }
      }
    };

    performTranslation();

    return () => {
      isCancelled = true;
    };
  }, [result?.id, currentLanguage.code]);

  const handleRetryTranslation = () => {
    if (!result?.analysis || currentLanguage.code === 'en') return;
    const cacheKey = `${result.id || 'curr'}_${currentLanguage.code}`;
    setIsTranslating(true);
    setTranslationError(null);

    translateAnalysis(result.analysis, currentLanguage.code, result.id || 'curr')
      .then((translated) => {
        if (translated) {
          setTranslationsMap(prev => ({
            ...prev,
            [cacheKey]: translated
          }));
          setViewMode('translated');
          setTranslationError(null);
        }
      })
      .catch((err) => {
        console.error('Retry translation failed:', err);
        setTranslationError('Translation temporarily unavailable. Your original analysis is still available.');
        setViewMode('original');
      })
      .finally(() => {
        setIsTranslating(false);
      });
  };

  const currentCacheKey = `${result?.id || 'curr'}_${currentLanguage.code}`;
  const translatedData = translationsMap[currentCacheKey];
  const isTranslatedActive = viewMode === 'translated' && !!translatedData && currentLanguage.code !== 'en';
  const displayedAnalysis = isTranslatedActive ? translatedData : result?.analysis;

  return (
    <div className={`space-y-8 pb-16 ${textSize === 'xlarge' ? 'text-lg' : textSize === 'large' ? 'text-base' : ''}`}>
      {/* Sticky Quick-Jump Navigation when analysis is loaded */}
      {result && <QuickJumpNav />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-neo-yellow text-black border border-slate-900 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t('terms.badge', 'Terms & Conditions and Privacy Policy Analyzer')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-black uppercase tracking-tight">
            {t('terms.title', 'Analyze Terms & Conditions')}
          </h1>
          <p className="text-slate-800 font-semibold max-w-3xl leading-relaxed text-sm sm:text-base">
            {t('terms.subtitle', 'Understand before you click "I Agree". LegalLens uncovers auto-renewals, data sharing, cancellation constraints, and dispute resolution rules in plain, everyday language.')}
          </p>
        </div>

        {/* 1-Click Demo Selector Bar */}
        <DemoSelector onSelect={handleSelectDemo} selectedId={selectedDemoId} />

        {/* Input Box Card */}
        {!result && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            {/* Mode Switcher */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 border border-slate-200 max-w-md shadow-2xs">
              <button
                type="button"
                onClick={() => { setMode('url'); setError(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                  mode === 'url' ? 'bg-black text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <Globe className="w-4 h-4 stroke-[2.5]" />
                <span>{t('terms.publicUrl', 'Public Web URL')}</span>
              </button>
              <button
                type="button"
                onClick={() => { setMode('text'); setError(null); }}
                className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                  mode === 'text' ? 'bg-black text-white shadow-2xs' : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <FileText className="w-4 h-4 stroke-[2.5]" />
                <span>{t('terms.pasteText', 'Paste Terms Text')}</span>
              </button>
            </div>

            {/* Quick Prefill Pills */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-black stroke-[2.5]" />
                {t('terms.quickPresets', 'Quick Presets (Click to autofill):')}
              </span>
              <div className="flex flex-wrap gap-2.5">
                {popularPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-neo-yellow text-xs font-black uppercase text-black shadow-2xs hover:-translate-y-0.5 transition cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-black text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-700 stroke-[2.5]" />
                <div className="leading-relaxed">
                  <p className="font-black uppercase tracking-wider text-xs text-rose-900">Analysis Notice</p>
                  <p className="font-semibold text-sm whitespace-pre-line text-rose-800">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleAnalyze} className="space-y-4">
              {mode === 'url' ? (
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
                    {t('terms.urlLabel', 'Public Terms URL')}
                  </label>
                  <div className="relative">
                    <Globe className="w-5 h-5 text-slate-600 stroke-[2.5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder={t('terms.urlPlaceholder', 'https://example.com/terms-of-service')}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:border-slate-800 focus:outline-none text-sm font-semibold bg-white text-black placeholder:text-slate-500 shadow-2xs"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-2">
                    {t('terms.urlHelper', 'The system retrieves publicly accessible content where technically and legally appropriate.')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-800 mb-1.5">
                      {t('terms.titleLabel', 'Agreement Title (Optional)')}
                    </label>
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      placeholder={t('terms.titlePlaceholder', 'e.g. Acme Cloud Subscription Terms')}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-slate-800 text-sm font-semibold bg-white text-black shadow-2xs"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                        {t('terms.pasteLabel', 'Paste Legal Text')}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-600 font-mono">{t('terms.dictate', 'Dictate / Voice:')}</span>
                        <VoiceInputButton
                          onTranscript={(spokenText) => {
                            setTextInput(prev => prev ? `${prev}\n${spokenText}` : spokenText);
                          }}
                        />
                      </div>
                    </div>
                    <textarea
                      rows={8}
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={t('terms.pastePlaceholder', 'Paste the Terms of Service, User Agreement, or Privacy Policy here...')}
                      className="w-full p-4 rounded-xl border border-slate-300 focus:border-slate-800 text-sm font-mono font-medium focus:outline-none bg-white text-black shadow-2xs"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
                  {t('terms.structuredCardBreakdown', 'Structured plain-language card breakdown')}
                </span>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-7 py-3 rounded-xl bg-neo-yellow hover:bg-neo-yellowHover disabled:bg-slate-200 border border-slate-900 text-black font-black text-sm uppercase shadow-2xs hover:translate-x-[1px] hover:translate-y-[1px] transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>{t('terms.analyzingBtn', 'Extracting & Analyzing...')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('terms.analyzeBtn', 'Analyze Agreement')}</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Analysis Results */}
        {result && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Action & Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs gap-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                {t('terms.analysisGenerated', 'Analysis generated')}: {new Date(result.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Plain-language mode active
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-900 bg-neo-yellow text-xs font-black uppercase text-black shadow-2xs hover:translate-x-[1px] hover:translate-y-[1px] transition cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('terms.anotherAgreement', 'Analyze Another Agreement')}</span>
              </button>
            </div>

            {/* Multilingual Translation & Voice Controller Bar (Sections 3, 4, 9, 10, 11, 12, 13) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Language Selector + Original/Translated Switcher */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 stroke-[2.5] text-slate-700" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
                      {t('terms.language', 'Language:')}
                    </span>
                    <LanguageSelector />
                  </div>

                  {/* Section 9: Switch between Original & Translated */}
                  {currentLanguage.code !== 'en' && (
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-300 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setViewMode('original')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          viewMode === 'original'
                            ? 'bg-black text-white shadow-2xs'
                            : 'text-slate-700 hover:bg-white'
                        }`}
                      >
                        {t('terms.viewOriginal', 'Original (English)')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('translated')}
                        disabled={isTranslating && !translatedData}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                          viewMode === 'translated'
                            ? 'bg-neo-yellow text-black border border-slate-900 shadow-2xs'
                            : 'text-slate-700 hover:bg-white'
                        }`}
                      >
                        <span>{t('terms.viewTranslated', 'Translated')} ({currentLanguage.native})</span>
                        {viewMode === 'translated' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Section 19: Direct Audio Speaker Button for Analysis Summary */}
                <div className="flex items-center gap-2 self-start md:self-auto">
                  <VoiceOutputButton
                    text={displayedAnalysis?.summary}
                    buttonClass="bg-white hover:bg-neo-yellow"
                  />
                </div>
              </div>

              {/* Section 11: Non-blocking Translation Loading Indicator */}
              {isTranslating && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-800" />
                  <span>{t('terms.translating', 'Translating legal explanation to')} {currentLanguage.native}... {t('terms.originalRemains', '(Original analysis remains visible)')}</span>
                </div>
              )}

              {/* Section 12: Translation Error Handling */}
              {translationError && (
                <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{t('terms.translationUnavailable', 'Translation temporarily unavailable. Your original analysis is still available.')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRetryTranslation}
                    className="px-3 py-1 rounded-lg border border-rose-600 bg-white hover:bg-rose-100 text-rose-800 text-xs font-black cursor-pointer shadow-2xs"
                  >
                    {t('terms.retry', 'Retry Translation')}
                  </button>
                </div>
              )}
            </div>

            {/* Section 8: Informational Translation Notice Banner */}
            {isTranslatedActive && (
              <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/80 text-blue-950 shadow-2xs flex items-start gap-3 animate-in fade-in duration-150">
                <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5 stroke-[2.5]" />
                <div className="text-xs leading-relaxed">
                  <p className="font-black uppercase tracking-wider text-blue-900">
                    {t('terms.informationalTitle', 'Informational Translation')} — {currentLanguage.native} ({currentLanguage.english})
                  </p>
                  <p className="font-semibold text-slate-800">
                    {t('terms.informationalNotice', 'This is an informational translation to aid understanding, not a legally binding translated contract. All numbers, monetary figures (e.g. ₹, $), dates, percentages, and legal conditions have been strictly preserved. You can switch back to the original English text at any time.')}
                  </p>
                </div>
              </div>
            )}

            {/* Accessibility & Audio Toolbar */}
            <AccessibilityToolbar
              summaryText={displayedAnalysis?.summary}
              agreeingToItems={displayedAnalysis?.what_you_are_agreeing_to}
              textSize={textSize}
              onTextSizeChange={setTextSize}
              isSimpleMode={isSimpleMode}
              onToggleSimpleMode={() => setIsSimpleMode(!isSimpleMode)}
            />

            {/* Active ELI5 Notification Banner when Simple Mode is on */}
            {isSimpleMode && (
              <div className="p-4 rounded-2xl border border-emerald-300 bg-neo-greenLight shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-neo-green border border-emerald-800/60 flex items-center justify-center font-black text-sm shrink-0">
                    ✨
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-black uppercase tracking-wider">
                      {t('terms.eli5Mode', 'Ultra-Simple (ELI5) Mode Active')}
                    </h4>
                    <p className="text-xs text-black font-semibold">
                      {t('terms.eli5Subtitle', 'Legal jargon, complex Latin phrases, and dense clauses are now simplified into clear everyday English.')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSimpleMode(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-black cursor-pointer shadow-2xs self-start sm:self-auto"
                >
                  {t('terms.returnStandard', 'Return to Standard Analysis')}
                </button>
              </div>
            )}

            {/* Document Results Content Area with Dynamic Text Sizing */}
            <div className={`space-y-8 ${textSize === 'large' ? 'text-base sm:text-lg [&_p]:text-base [&_span]:text-base' : textSize === 'xlarge' ? 'text-lg sm:text-xl [&_p]:text-lg [&_span]:text-lg' : ''}`}>
              {/* Document Scorecard */}
              <DocumentScorecard
                analysis={displayedAnalysis}
                title={result.title}
              />

              {/* Section 1: Legal Summary Card */}
              <div id="section-summary">
                <LegalSummaryCard
                  title={result.title}
                  summary={displayedAnalysis?.summary}
                  analysis={displayedAnalysis}
                  sourceType={result.source_type}
                  sourceUrl={result.source_url}
                  isSaved={isSaved}
                  onToggleSave={handleToggleSave}
                  isSimpleMode={isSimpleMode}
                />
              </div>

              {/* Section 2: "What Am I Agreeing To?" Card */}
              <div id="section-agreeing-to">
                <WhatAmIAgreeingToCard 
                  items={displayedAnalysis?.what_you_are_agreeing_to} 
                  isSimpleMode={isSimpleMode}
                />
              </div>

              {/* Section 3: Important Things to Know Card */}
              <div id="section-provisions">
                <ImportantClauseCard points={displayedAnalysis?.important_points} />
              </div>

              {/* Section 4: Obligations & Deadlines Grid */}
              <div id="section-obligations" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ObligationCard obligations={displayedAnalysis?.obligations} />
                <DeadlineCard deadlines={displayedAnalysis?.deadlines} />
              </div>

              {/* Section 5: Potential Areas to Review */}
              <RiskReviewCard areas={displayedAnalysis?.areas_to_review} />

              {/* Section 6: Questions for a Lawyer */}
              <div id="section-lawyer">
                <LawyerQuestions questions={displayedAnalysis?.questions_for_lawyer} />
              </div>

              {/* Section 7: Action Checklist & Documents to Prepare */}
              <div id="section-checklist">
                <ActionChecklist
                  checklist={displayedAnalysis?.action_checklist}
                  documentsToPrepare={displayedAnalysis?.information_to_prepare}
                />
              </div>

              {/* Mandatory Disclaimer */}
              <DisclaimerBanner />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
