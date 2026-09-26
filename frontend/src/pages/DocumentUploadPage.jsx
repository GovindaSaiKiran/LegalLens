import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  FileCheck, 
  Trash2, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  MessageSquare, 
  BookOpen, 
  Layers, 
  ExternalLink 
} from 'lucide-react';
import { uploadLegalDocument, deleteDocument, analyzeTermsDemo } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import LegalSummaryCard from '../components/LegalSummaryCard';
import WhatAmIAgreeingToCard from '../components/WhatAmIAgreeingToCard';
import ImportantClauseCard from '../components/ImportantClauseCard';
import ObligationCard from '../components/ObligationCard';
import DeadlineCard from '../components/DeadlineCard';
import RiskReviewCard from '../components/RiskReviewCard';
import LawyerQuestions from '../components/LawyerQuestions';
import ActionChecklist from '../components/ActionChecklist';
import DocumentViewer from '../components/DocumentViewer';
import LegalChat from '../components/LegalChat';
import DisclaimerBanner from '../components/DisclaimerBanner';
import DemoSelector from '../components/DemoSelector';
import DocumentScorecard from '../components/DocumentScorecard';
import AccessibilityToolbar from '../components/AccessibilityToolbar';
import QuickJumpNav from '../components/QuickJumpNav';

export default function DocumentUploadPage() {
  const { t } = useLanguage();
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'paste'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis' | 'chat' | 'viewer'
  const [selectedDemoId, setSelectedDemoId] = useState(null);

  // Accessibility States
  const [textSize, setTextSize] = useState('normal');
  const [isSimpleMode, setIsSimpleMode] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      if (uploadMode === 'file') {
        if (!file) {
          throw new Error('Please select a PDF, DOCX, or TXT document to upload.');
        }
        formData.append('document', file);
      } else {
        if (!pastedText.trim() || pastedText.trim().length < 50) {
          throw new Error('Please paste at least 50 characters of document text.');
        }
        formData.append('text', pastedText.trim());
        if (docTitle.trim()) {
          formData.append('title', docTitle.trim());
        }
      }

      const res = await uploadLegalDocument(formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to process document.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = async (demoId) => {
    setSelectedDemoId(demoId);
    setError(null);
    setLoading(true);

    try {
      const res = await analyzeTermsDemo(demoId);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load demo document.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!result?.id) return;
    if (window.confirm('Are you sure you want to permanently delete this document and its analysis?')) {
      try {
        await deleteDocument(result.id);
        setResult(null);
        setFile(null);
        setPastedText('');
      } catch (err) {
        console.error('Error deleting document:', err);
      }
    }
  };

  return (
    <div className={`space-y-8 pb-16 ${textSize === 'xlarge' ? 'text-lg' : textSize === 'large' ? 'text-base' : ''}`}>
      {/* Quick Jump Bar when analysis is present */}
      {result && activeTab === 'analysis' && <QuickJumpNav />}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-neo-yellow text-black border-2 border-black shadow-2xs">
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>{t('upload.badge', 'Grounded Document AI & OCR')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-black uppercase tracking-tight">
            {t('upload.title', 'Upload & Analyze Contract')}
          </h1>
          <p className="text-slate-800 font-semibold max-w-3xl leading-relaxed text-sm sm:text-base">
            {t('upload.subtitle', 'Upload any legal contract, tenancy agreement, employment offer, or policy (PDF, DOCX, TXT). Extract clauses, analyze obligations and deadlines, and interact with the document via strictly grounded Q&A.')}
          </p>
        </div>

        {/* Demo Selector */}
        <DemoSelector onSelect={handleSelectDemo} selectedId={selectedDemoId} />

        {/* Upload Box */}
        {!result && (
          <div className="bg-white rounded-2xl border-3 border-black shadow-neo-md p-6 sm:p-8 space-y-6">
            {/* Switcher */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#fcfaf2] border-2 border-black max-w-xs shadow-2xs">
              <button
                type="button"
                onClick={() => { setUploadMode('file'); setError(null); }}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  uploadMode === 'file' ? 'bg-black text-white border-2 border-black shadow-neo-sm' : 'text-black hover:bg-neo-yellow/30'
                }`}
              >
                {t('upload.fileTab', 'Upload File')}
              </button>
              <button
                type="button"
                onClick={() => { setUploadMode('paste'); setError(null); }}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  uploadMode === 'paste' ? 'bg-black text-white border-2 border-black shadow-neo-sm' : 'text-black hover:bg-neo-yellow/30'
                }`}
              >
                {t('upload.pasteTab', 'Paste Contract')}
              </button>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-neo-coral/20 border-2 border-black shadow-neo-sm text-black text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-black stroke-[2.5] mt-0.5" />
                <span className="font-bold">{error}</span>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              {uploadMode === 'file' ? (
                <div className="border-3 border-dashed border-black rounded-2xl p-8 sm:p-12 text-center hover:bg-neo-yellow/20 transition bg-[#fcfaf2] shadow-neo-sm">
                  <input
                    type="file"
                    id="document-file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="document-file" className="cursor-pointer space-y-3 block">
                    <div className="w-14 h-14 rounded-2xl bg-neo-yellow border-2 border-black text-black mx-auto flex items-center justify-center shadow-neo-sm">
                      <Upload className="w-7 h-7 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="font-black text-black text-base sm:text-lg block uppercase tracking-tight">
                        {file ? file.name : t('upload.dragDrop', 'Click to select or drag & drop document')}
                      </span>
                      <span className="text-xs text-slate-700 block mt-1 font-bold">
                        {t('upload.formats', 'Supported formats: PDF, DOCX, TXT (up to 25 MB)')}
                      </span>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder={t('upload.docTitlePlaceholder', 'Document Title (e.g. Residential Tenancy Agreement)')}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-black text-sm font-semibold bg-white text-black shadow-2xs"
                  />
                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={t('upload.pastePlaceholder', 'Paste the contract or legal agreement text here...')}
                    className="w-full p-4 rounded-xl border-2 border-black text-sm font-mono font-medium bg-white text-black shadow-2xs"
                  />
                </div>
              )}

              {/* Privacy Guarantee Note */}
              <div className="p-4 rounded-xl bg-neo-yellow/25 border-2 border-black text-xs text-black leading-relaxed font-semibold shadow-2xs">
                <strong className="font-black uppercase block mb-0.5">Privacy Assurance:</strong>
                {t('footer.privacy', 'Documents are processed strictly for generating this analysis. You retain full control and can permanently delete the document and analysis at any time using the delete button.')}
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading || (uploadMode === 'file' && !file) || (uploadMode === 'paste' && !pastedText.trim())}
                  className="px-7 py-3 rounded-xl bg-neo-yellow hover:bg-neo-yellow/90 disabled:bg-slate-200 border-2 border-black text-black font-black uppercase text-sm shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm transition flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>{t('upload.processingBtn', 'Processing & Analyzing...')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('upload.processBtn', 'Upload & Analyze')}</span>
                      <FileCheck className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Results View */}
        {result && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Action and Navigation Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border-3 border-black shadow-neo-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* View Mode Tabs */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition border-2 border-black cursor-pointer ${
                    activeTab === 'analysis' ? 'bg-black text-white shadow-neo-sm' : 'bg-white text-black hover:bg-neo-yellow/30 shadow-2xs'
                  }`}
                >
                  <BookOpen className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('upload.tabAnalysis', 'Full Analysis')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition border-2 border-black cursor-pointer ${
                    activeTab === 'chat' ? 'bg-black text-white shadow-neo-sm' : 'bg-white text-black hover:bg-neo-yellow/30 shadow-2xs'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('upload.tabChat', 'Ask This Document')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('viewer')}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition border-2 border-black cursor-pointer ${
                    activeTab === 'viewer' ? 'bg-black text-white shadow-neo-sm' : 'bg-white text-black hover:bg-neo-yellow/30 shadow-2xs'
                  }`}
                >
                  <Layers className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('upload.tabViewer', 'Clause Viewer')} ({result.sections?.length || 0})</span>
                </button>
              </div>

              {/* Privacy Deletion Button */}
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-black bg-white hover:bg-neo-coral text-xs font-black uppercase text-black shadow-2xs transition cursor-pointer self-start sm:self-auto"
                title="Permanently delete document and data"
              >
                <Trash2 className="w-4 h-4 stroke-[2.5]" />
                <span>{t('upload.deleteDoc', 'Delete Document')}</span>
              </button>
            </div>

            {/* Accessibility & Audio Toolbar */}
            {activeTab === 'analysis' && (
              <>
                <AccessibilityToolbar
                  summaryText={result.analysis.summary}
                  agreeingToItems={result.analysis.what_you_are_agreeing_to}
                  textSize={textSize}
                  onTextSizeChange={setTextSize}
                  isSimpleMode={isSimpleMode}
                  onToggleSimpleMode={() => setIsSimpleMode(!isSimpleMode)}
                />

                {/* Active ELI5 Notification Banner when Simple Mode is on */}
                {isSimpleMode && (
                  <div className="p-4 rounded-2xl border-3 border-black bg-neo-greenLight shadow-neo-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-neo-green border-2 border-black flex items-center justify-center font-black text-sm shrink-0">
                        ✨
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-black uppercase tracking-wider">
                          {t('terms.eli5Mode', 'Ultra-Simple (ELI5) Mode Active')}
                        </h4>
                        <p className="text-xs text-black font-semibold">
                          {t('terms.eli5Subtitle', 'Legal clauses, Latin terms, and technical phrasing are translated into plain everyday English.')}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSimpleMode(false)}
                      className="px-3 py-1.5 rounded-xl border-2 border-black bg-white hover:bg-slate-100 text-xs font-black cursor-pointer shadow-2xs self-start sm:self-auto"
                    >
                      {t('terms.returnStandard', 'Return to Standard Analysis')}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Tab 1: Structured Analysis */}
            {activeTab === 'analysis' && (
              <div className={`space-y-8 ${textSize === 'large' ? 'text-base sm:text-lg [&_p]:text-base [&_span]:text-base' : textSize === 'xlarge' ? 'text-lg sm:text-xl [&_p]:text-lg [&_span]:text-lg' : ''}`}>
                <DocumentScorecard
                  analysis={result.analysis}
                  title={result.title}
                />

                <div id="section-summary">
                  <LegalSummaryCard
                    title={result.title}
                    summary={result.analysis.summary}
                    analysis={result.analysis}
                    sourceType={result.source_type}
                    isSimpleMode={isSimpleMode}
                  />
                </div>

                <div id="section-agreeing-to">
                  <WhatAmIAgreeingToCard 
                    items={result.analysis.what_you_are_agreeing_to} 
                    isSimpleMode={isSimpleMode}
                  />
                </div>

                <div id="section-provisions">
                  <ImportantClauseCard points={result.analysis.important_points} />
                </div>

                <div id="section-obligations" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ObligationCard obligations={result.analysis.obligations} />
                  <DeadlineCard deadlines={result.analysis.deadlines} />
                </div>

                <RiskReviewCard areas={result.analysis.areas_to_review} />

                <div id="section-lawyer">
                  <LawyerQuestions questions={result.analysis.questions_for_lawyer} />
                </div>

                <div id="section-checklist">
                  <ActionChecklist
                    checklist={result.analysis.action_checklist}
                    documentsToPrepare={result.analysis.information_to_prepare}
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Grounded Document Chat */}
            {activeTab === 'chat' && (
              <div className="space-y-4">
                <LegalChat documentId={result.id} />
              </div>
            )}

            {/* Tab 3: Clause Viewer */}
            {activeTab === 'viewer' && (
              <DocumentViewer
                sections={result.sections}
                title={result.title}
              />
            )}

            <DisclaimerBanner />
          </div>
        )}
      </div>
    </div>
  );
}
