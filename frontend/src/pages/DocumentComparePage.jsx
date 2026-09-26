import React, { useState } from 'react';
import { 
  GitCompare, 
  Upload, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  Layers, 
  RefreshCw, 
  Printer, 
  BookOpen, 
  ThumbsUp, 
  CheckCircle2 
} from 'lucide-react';
import { compareDocuments, compareDemoDocuments } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import ComparisonViewer from '../components/ComparisonViewer';
import DisclaimerBanner from '../components/DisclaimerBanner';
import LegalGlossaryModal from '../components/LegalGlossaryModal';

export default function DocumentComparePage() {
  const { t } = useLanguage();
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [titleA, setTitleA] = useState('');
  const [titleB, setTitleB] = useState('');
  const [mode, setMode] = useState('text'); // 'text' | 'file'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  const handleCompare = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      if (mode === 'file') {
        if (!fileA || !fileB) {
          throw new Error('Please select both Document A and Document B to compare.');
        }
        formData.append('documentA', fileA);
        formData.append('documentB', fileB);
      } else {
        if (!textA.trim() || !textB.trim()) {
          throw new Error('Please enter text for both Document A and Document B.');
        }
        formData.append('textA', textA);
        formData.append('textB', textB);
        formData.append('titleA', titleA.trim() || 'Document A');
        formData.append('titleB', titleB.trim() || 'Document B');
      }

      const res = await compareDocuments(formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to compare documents.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCompare = async (type = 'terms') => {
    setError(null);
    setLoading(true);
    try {
      const res = await compareDemoDocuments(type);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load demo comparison.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-neo-yellow text-black border-2 border-black shadow-2xs">
          <GitCompare className="w-4 h-4 stroke-[2.5]" />
          <span>{t('compare.badge', 'Semantic Document Diffing')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-black uppercase tracking-tight">
          {t('compare.title', 'Compare Legal Documents')}
        </h1>
        <p className="text-slate-800 font-semibold max-w-3xl leading-relaxed text-sm sm:text-base">
          {t('compare.subtitle', 'Upload or paste two legal agreements to see what was added, removed, or modified. LegalLens performs semantic comparison beyond simple character diffs, explaining shifts in risk and obligations in plain language.')}
        </p>
      </div>

      {/* 1-Click Demo Comparison Bar */}
      <div className="p-5 rounded-2xl bg-neo-yellow/25 border-3 border-black shadow-neo-sm">
        <div className="flex items-center gap-2 mb-3 text-xs font-black uppercase tracking-wider text-black">
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
          <span>{t('compare.tryDemo', 'Try 1-Click Demo Comparisons:')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            onClick={() => handleDemoCompare('terms')}
            className="p-4 rounded-xl border-2 border-black bg-white hover:bg-neo-yellow text-left transition flex items-center justify-between shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
          >
            <div>
              <span className="text-xs sm:text-sm font-black text-black block uppercase tracking-tight">
                {t('compare.sampleTerms', 'CloudScale SaaS Terms: v2.4 vs v3.0')}
              </span>
              <span className="text-xs text-slate-700 font-semibold">Notice window, refunds, and arbitration changes</span>
            </div>
            <ArrowRight className="w-5 h-5 text-black stroke-[3] shrink-0 ml-2" />
          </button>

          <button
            type="button"
            onClick={() => handleDemoCompare('employment')}
            className="p-4 rounded-xl border-2 border-black bg-white hover:bg-neo-yellow text-left transition flex items-center justify-between shadow-neo-sm hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
          >
            <div>
              <span className="text-xs sm:text-sm font-black text-black block uppercase tracking-tight">
                {t('compare.sampleLease', 'Employment Agreement: Offer v1 vs Counter v2')}
              </span>
              <span className="text-xs text-slate-700 font-semibold">Notice period (90d → 30d), non-compete removed</span>
            </div>
            <ArrowRight className="w-5 h-5 text-black stroke-[3] shrink-0 ml-2" />
          </button>
        </div>
      </div>

      {/* Comparison Inputs Form */}
      {!result && (
        <div className="bg-white rounded-2xl border-3 border-black shadow-neo-md p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#fcfaf2] border-2 border-black max-w-xs shadow-2xs">
              <button
                type="button"
                onClick={() => { setMode('text'); setError(null); }}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  mode === 'text' ? 'bg-black text-white border-2 border-black shadow-neo-sm' : 'text-black hover:bg-neo-yellow/30'
                }`}
              >
                {t('compare.textMode', 'Paste Text')}
              </button>
              <button
                type="button"
                onClick={() => { setMode('file'); setError(null); }}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  mode === 'file' ? 'bg-black text-white border-2 border-black shadow-neo-sm' : 'text-black hover:bg-neo-yellow/30'
                }`}
              >
                {t('compare.fileMode', 'Upload Files')}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setGlossaryOpen(true)}
              className="text-xs font-black uppercase tracking-wider text-black hover:underline flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <BookOpen className="w-4 h-4 stroke-[2.5]" />
              <span>{t('nav.glossary', 'Legal Glossary')}</span>
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-neo-coral/20 border-2 border-black shadow-neo-sm text-black text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-black stroke-[2.5] mt-0.5" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <form onSubmit={handleCompare} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document A */}
              <div className="space-y-3 p-5 rounded-2xl bg-[#fff5f5] border-2 border-black shadow-neo-sm">
                <span className="text-xs font-black text-red-700 uppercase tracking-wider block">
                  {t('compare.docA', 'Document A (Baseline / Original)')}
                </span>

                {mode === 'file' ? (
                  <div className="p-6 rounded-xl border-2 border-dashed border-black bg-white text-center shadow-2xs">
                    <input
                      type="file"
                      id="docA-file"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => e.target.files && setFileA(e.target.files[0])}
                      className="hidden"
                    />
                    <label htmlFor="docA-file" className="cursor-pointer block text-xs font-bold text-black">
                      {fileA ? fileA.name : 'Select Document A (PDF, DOCX, TXT)'}
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      value={titleA}
                      onChange={(e) => setTitleA(e.target.value)}
                      placeholder={t('compare.docATitle', 'Title: e.g. Contract v1.0')}
                      className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border-2 border-black bg-white text-black shadow-2xs"
                    />
                    <textarea
                      rows={8}
                      value={textA}
                      onChange={(e) => setTextA(e.target.value)}
                      placeholder={t('compare.pasteDocA', 'Paste Document A clauses or full text...')}
                      className="w-full p-3.5 text-xs font-mono font-medium rounded-xl border-2 border-black bg-white text-black shadow-2xs"
                    />
                  </div>
                )}
              </div>

              {/* Document B */}
              <div className="space-y-3 p-5 rounded-2xl bg-[#f0fff4] border-2 border-black shadow-neo-sm">
                <span className="text-xs font-black text-emerald-800 uppercase tracking-wider block">
                  {t('compare.docB', 'Document B (Revised / Counter-Proposal)')}
                </span>

                {mode === 'file' ? (
                  <div className="p-6 rounded-xl border-2 border-dashed border-black bg-white text-center shadow-2xs">
                    <input
                      type="file"
                      id="docB-file"
                      accept=".pdf,.docx,.txt"
                      onChange={(e) => e.target.files && setFileB(e.target.files[0])}
                      className="hidden"
                    />
                    <label htmlFor="docB-file" className="cursor-pointer block text-xs font-bold text-black">
                      {fileB ? fileB.name : 'Select Document B (PDF, DOCX, TXT)'}
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      value={titleB}
                      onChange={(e) => setTitleB(e.target.value)}
                      placeholder={t('compare.docBTitle', 'Title: e.g. Contract v2.0')}
                      className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border-2 border-black bg-white text-black shadow-2xs"
                    />
                    <textarea
                      rows={8}
                      value={textB}
                      onChange={(e) => setTextB(e.target.value)}
                      placeholder={t('compare.pasteDocB', 'Paste Document B clauses or full text...')}
                      className="w-full p-3.5 text-xs font-mono font-medium rounded-xl border-2 border-black bg-white text-black shadow-2xs"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <span className="text-xs text-slate-800 font-bold">
                {t('compare.subtitle', 'Identifies substantive semantic changes and plain-language shifts')}
              </span>

              <button
                type="submit"
                disabled={loading}
                className="px-7 py-3 rounded-xl bg-neo-yellow hover:bg-neo-yellow/90 disabled:bg-slate-200 border-2 border-black text-black font-black uppercase text-sm shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>{t('compare.runningBtn', 'Comparing Documents...')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('compare.runBtn', 'Run Semantic Comparison')}</span>
                    <GitCompare className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Comparison Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border-3 border-black shadow-neo-sm gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-black">
              {t('compare.summaryTitle', 'Comparison')}: {result.titleA} vs {result.titleB}
            </span>
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-black bg-white hover:bg-neo-yellow text-xs font-black uppercase text-black shadow-2xs transition cursor-pointer"
              >
                <Printer className="w-4 h-4 stroke-[2.5]" />
                <span>{t('terms.print', 'Print / PDF')}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-black bg-neo-yellow text-xs font-black uppercase text-black shadow-2xs hover:translate-x-[1px] hover:translate-y-[1px] transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                <span>{t('compare.resetBtn', 'Compare Another Pair')}</span>
              </button>
            </div>
          </div>

          <ComparisonViewer
            comparison={result.comparison}
            titleA={result.titleA}
            titleB={result.titleB}
          />

          <DisclaimerBanner />
        </div>
      )}

      <LegalGlossaryModal
        isOpen={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
      />
    </div>
  );
}
