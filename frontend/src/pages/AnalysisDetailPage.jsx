import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Bookmark, Trash2, Layers, BookOpen, MessageSquare } from 'lucide-react';
import { getDocumentDetails, toggleSaveReport, deleteDocument } from '../services/api';
import LegalSummaryCard from '../components/LegalSummaryCard';
import WhatAmIAgreeingToCard from '../components/WhatAmIAgreeingToCard';
import ImportantClauseCard from '../components/ImportantClauseCard';
import ObligationCard from '../components/ObligationCard';
import DeadlineCard from '../components/DeadlineCard';
import RiskReviewCard from '../components/RiskReviewCard';
import LawyerQuestions from '../components/LawyerQuestions';
import ActionChecklist from '../components/ActionChecklist';
import SourceCitation from '../components/SourceCitation';
import ComparisonViewer from '../components/ComparisonViewer';
import DocumentViewer from '../components/DocumentViewer';
import LegalChat from '../components/LegalChat';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { useLanguage } from '../context/LanguageContext';

export default function AnalysisDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('analysis'); // 'analysis' | 'chat' | 'viewer'

  useEffect(() => {
    loadDetails();
  }, [id]);

  const loadDetails = async () => {
    try {
      const res = await getDocumentDetails(id);
      setReport(res.data);
      setIsSaved(res.data.is_saved);
    } catch (err) {
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    try {
      const res = await toggleSaveReport(id);
      setIsSaved(res.data.is_saved);
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteDocument(id);
        navigate('/dashboard');
      } catch (err) {
        console.error('Error deleting report:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-black" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 min-w-0">
        <h2 className="text-3xl font-black text-black uppercase tracking-tight">{t('dash.noReports', 'Report Not Found')}</h2>
        <p className="text-slate-800 font-semibold text-sm">{t('dash.noReportsDesc', 'This analysis may have been deleted or the link is expired.')}</p>
        <Link to="/dashboard" className="inline-block px-5 py-2.5 rounded-xl bg-amber-400 border border-amber-500 text-slate-900 font-bold uppercase text-sm shadow-2xs transition">
          {t('dash.workspace', 'Return to Dashboard')}
        </Link>
      </div>
    );
  }

  const isComparison = report.type === 'comparison';
  const isRAG = report.type === 'rag';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 min-w-0 overflow-x-hidden">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold uppercase text-slate-900 shadow-2xs transition cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>{t('dash.workspace', 'Back to Dashboard')}</span>
        </Link>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleToggleSave}
            className={`px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold uppercase transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              isSaved ? 'bg-amber-300 text-black font-bold' : 'bg-white text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 stroke-[2.5] ${isSaved ? 'fill-black' : ''}`} />
            <span>{isSaved ? t('dash.unsave', 'Saved') : t('dash.save', 'Save')}</span>
          </button>

          <button
            onClick={handleDelete}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-bold uppercase transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-4 h-4 stroke-[2.5]" />
            <span>{t('dash.delete', 'Delete')}</span>
          </button>
        </div>
      </div>

      {/* Comparison View */}
      {isComparison && (
        <ComparisonViewer
          comparison={report.analysis}
          titleA={report.analysis.titleA || 'Document A'}
          titleB={report.analysis.titleB || 'Document B'}
        />
      )}

      {/* RAG View */}
      {isRAG && (
        <div className="space-y-6 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-2 min-w-0">
            <span className="text-xs text-slate-900 font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-100 border border-amber-300 inline-block shadow-2xs">
              {t('assistant.title', 'Question Answered')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight break-words">"{report.title}"</h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-3 min-w-0">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{t('assistant.whatLawSays', 'What the Law / Information Says')}</h3>
            <p className="text-slate-800 font-medium leading-relaxed text-sm sm:text-base">{report.analysis.what_the_law_says}</p>
          </div>

          {report.analysis.what_may_be_relevant && (
            <div className="bg-white rounded-2xl border-3 border-black p-6 sm:p-7 shadow-neo-md space-y-3">
              <h3 className="text-xl font-black text-black uppercase tracking-tight">{t('assistant.whatMayBeRelevant', 'What May Be Relevant')}</h3>
              <p className="text-black font-semibold leading-relaxed text-sm sm:text-base">{report.analysis.what_may_be_relevant}</p>
            </div>
          )}

          {report.analysis.possible_procedural_options?.length > 0 && (
            <div className="bg-white rounded-2xl border-3 border-black p-6 sm:p-7 shadow-neo-md space-y-4">
              <h3 className="text-xl font-black text-black uppercase tracking-tight">{t('assistant.possibleOptions', 'Possible Procedural Options')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {report.analysis.possible_procedural_options.map((opt, i) => (
                  <div key={i} className="p-4 rounded-xl bg-neo-blueLight border-2 border-black shadow-neo-sm text-sm font-bold text-black flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-neo-blue border-2 border-black text-black flex items-center justify-center font-black text-xs shrink-0">{i + 1}</span>
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <SourceCitation
            sources={report.analysis.sources}
            distinction={report.analysis.distinction}
          />

          <ActionChecklist
            checklist={[]}
            documentsToPrepare={report.analysis.information_to_prepare}
          />

          <LawyerQuestions questions={report.analysis.questions_to_ask_a_lawyer} />
        </div>
      )}

      {/* Standard Terms & Document View */}
      {!isComparison && !isRAG && (
        <div className="space-y-6">
          {/* Navigation Bar if sections are present */}
          {report.sections && report.sections.length > 0 && (
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#fcfaf2] border-2 border-black max-w-sm shadow-2xs">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'analysis' ? 'bg-black text-white border-2 border-black shadow-neo-sm' : 'text-black hover:bg-neo-yellow/30'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('upload.tabAnalysis', 'Summary')}</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'chat' ? 'bg-black text-white border-2 border-black shadow-neo-sm' : 'text-black hover:bg-neo-yellow/30'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('upload.tabChat', 'Chat')}</span>
              </button>
              <button
                onClick={() => setActiveTab('viewer')}
                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeTab === 'viewer' ? 'bg-black text-white border-2 border-black shadow-neo-sm' : 'text-black hover:bg-neo-yellow/30'
                }`}
              >
                <Layers className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('upload.tabViewer', 'Clauses')} ({report.sections.length})</span>
              </button>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-8">
              <LegalSummaryCard
                title={report.title}
                summary={report.analysis.summary}
                sourceType={report.source_type}
                sourceUrl={report.source_url}
                isSaved={isSaved}
                onToggleSave={handleToggleSave}
              />

              <WhatAmIAgreeingToCard items={report.analysis.what_you_are_agreeing_to} />
              <ImportantClauseCard points={report.analysis.important_points} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ObligationCard obligations={report.analysis.obligations} />
                <DeadlineCard deadlines={report.analysis.deadlines} />
              </div>

              <RiskReviewCard areas={report.analysis.areas_to_review} />
              <LawyerQuestions questions={report.analysis.questions_for_lawyer} />

              <ActionChecklist
                checklist={report.analysis.action_checklist}
                documentsToPrepare={report.analysis.information_to_prepare}
              />
            </div>
          )}

          {activeTab === 'chat' && (
            <LegalChat documentId={report.id} />
          )}

          {activeTab === 'viewer' && (
            <DocumentViewer sections={report.sections} title={report.title} />
          )}
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
}
