import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  HelpCircle, 
  Send, 
  Loader2, 
  Scale, 
  ShieldCheck, 
  MapPin, 
  Tag, 
  FileText, 
  FolderCheck, 
  MessageSquare, 
  AlertTriangle, 
  Sparkles, 
  Info,
  Volume2,
  VolumeX,
  Printer,
  ArrowRight,
  Compass,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { askLegalQuestion } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import VoiceInputButton from '../components/VoiceInputButton';
import VoiceOutputButton from '../components/VoiceOutputButton';
import LanguageSelector from '../components/LanguageSelector';
import SourceCitation from '../components/SourceCitation';
import LawyerQuestions from '../components/LawyerQuestions';
import ActionChecklist from '../components/ActionChecklist';
import DisclaimerBanner from '../components/DisclaimerBanner';
import LegalGlossaryModal from '../components/LegalGlossaryModal';

export default function LegalAssistantPage() {
  const { currentLanguage, translateText, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [question, setQuestion] = useState(searchParams.get('q') || '');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Telangana');
  const [category, setCategory] = useState('rental');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam) {
      setQuestion(qParam);
    }
  }, [searchParams]);

  // Agent Automation Trigger Listener
  useEffect(() => {
    const handleAgentAsk = (e) => {
      const { question: q, category: cat, state: st } = e.detail || {};
      if (q) {
        setQuestion(q);
        if (cat) setCategory(cat);
        if (st) setState(st);
        handleAsk(q, cat, st);
      }
    };
    window.addEventListener('legallens-ask-question', handleAgentAsk);
    return () => window.removeEventListener('legallens-ask-question', handleAgentAsk);
  }, []);

  // Multilingual Response Translation states
  const [translatedAnswer, setTranslatedAnswer] = useState(null);
  const [isTranslatingAnswer, setIsTranslatingAnswer] = useState(false);
  const [viewMode, setViewMode] = useState('translated');
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  useEffect(() => {
    if (!response?.result || currentLanguage.code === 'en') {
      setTranslatedAnswer(null);
      setIsTranslatingAnswer(false);
      setViewMode('original');
      return;
    }

    let isCancelled = false;
    const translateResp = async () => {
      setIsTranslatingAnswer(true);
      try {
        const [lawTr, relTr] = await Promise.all([
          translateText(response.result.what_the_law_says, currentLanguage.code),
          response.result.what_may_be_relevant 
            ? translateText(response.result.what_may_be_relevant, currentLanguage.code)
            : Promise.resolve('')
        ]);
        if (!isCancelled) {
          setTranslatedAnswer({
            what_the_law_says: lawTr,
            what_may_be_relevant: relTr
          });
          setViewMode('translated');
        }
      } catch (err) {
        console.error('Answer translation error:', err);
      } finally {
        if (!isCancelled) {
          setIsTranslatingAnswer(false);
        }
      }
    };

    translateResp();
    return () => { isCancelled = true; };
  }, [response, currentLanguage.code]);

  const sampleQuestions = [
    {
      q: "My landlord hasn't returned my security deposit after I vacated the flat. What can I do?",
      cat: "rental",
      state: "Telangana"
    },
    {
      q: "Can an e-commerce platform refuse to refund money for a damaged phone delivered to me?",
      cat: "consumer",
      state: "Delhi"
    },
    {
      q: "Is a 12-month post-employment non-compete clause legally binding in India?",
      cat: "employment",
      state: "Karnataka"
    },
    {
      q: "What rights do I have under the DPDP Act 2023 if an app leaks my personal data?",
      cat: "cyber",
      state: "Maharashtra"
    }
  ];

  const categories = [
    { id: 'rental', label: 'Rental / Housing', icon: '🏠', desc: 'Deposits, eviction notices, repairs' },
    { id: 'consumer', label: 'Consumer & E-Commerce', icon: '🛍️', desc: 'Refunds, defective goods, fake reviews' },
    { id: 'employment', label: 'Employment & Labor', icon: '💼', desc: 'Notice period, non-compete, gratuity' },
    { id: 'contracts', label: 'Contract & Commercial', icon: '📝', desc: 'Breach of contract, penalty clauses' },
    { id: 'cyber', label: 'Cyber & Data Protection', icon: '🔒', desc: 'DPDP compliance, data leaks, scams' },
    { id: 'family', label: 'Family & Succession', icon: '👨‍👩‍👧', desc: 'Maintenance, domestic rights' },
    { id: 'education', label: 'Education & Fees', icon: '🎓', desc: 'College admission refunds, student rights' },
    { id: 'other', label: 'Other / General', icon: '⚖️', desc: 'General statutory awareness' }
  ];

  const indianStates = [
    'Telangana',
    'Karnataka',
    'Maharashtra',
    'Delhi',
    'Tamil Nadu',
    'Uttar Pradesh',
    'West Bengal',
    'Gujarat',
    'Haryana',
    'Kerala'
  ];

  const handleAsk = async (questionText = null, cat = null, st = null) => {
    const q = (questionText || question).trim();
    if (!q) return;

    setError(null);
    setLoading(true);

    try {
      const res = await askLegalQuestion({
        question: q,
        jurisdiction: country.toLowerCase(),
        state: st || state,
        category: cat || category
      });
      setResponse(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to retrieve legal guidance.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample) => {
    setQuestion(sample.q);
    setCategory(sample.cat);
    setState(sample.state);
    handleAsk(sample.q, sample.cat, sample.state);
  };

  const handleSpeakAnswer = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!response?.result?.what_the_law_says) return;

    const text = `According to verified Indian legal sources: ${response.result.what_the_law_says}. Important relevant considerations: ${response.result.what_may_be_relevant || ''}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-neo-yellow text-slate-900 border border-slate-300 shadow-2xs">
          <Scale className="w-4 h-4 stroke-[2.5]" />
          <span>{t('assistant.badge', 'Modular RAG Legal Knowledge Assistant')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tight">
          {t('assistant.title', 'Ask a Legal Question')}
        </h1>
        <p className="text-slate-600 font-medium max-w-3xl leading-relaxed text-sm sm:text-base">
          {t('assistant.subtitle', 'Get plain-language answers grounded in verified Indian statutes. The system retrieves relevant enactments (such as the Consumer Protection Act, Transfer of Property Act, or DPDP Act) before synthesizing explanations.')}
        </p>
      </div>

      {/* Guided 3-Step Selection Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
        {/* Step Guide Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-5 border-b border-slate-200 text-xs">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold uppercase tracking-wider">
            <span className="w-6 h-6 rounded-md bg-neo-yellow border border-slate-300 text-slate-900 flex items-center justify-center text-xs font-bold shadow-2xs">1</span>
            <span>{t('assistant.step1', 'Select Location')}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-900 font-bold uppercase tracking-wider">
            <span className="w-6 h-6 rounded-md bg-neo-blue border border-slate-300 text-slate-900 flex items-center justify-center text-xs font-bold shadow-2xs">2</span>
            <span>{t('assistant.step2', 'Choose Legal Area')}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-900 font-bold uppercase tracking-wider">
            <span className="w-6 h-6 rounded-md bg-neo-green border border-slate-300 text-slate-900 flex items-center justify-center text-xs font-bold shadow-2xs">3</span>
            <span>{t('assistant.step3', 'Ask in Everyday Words')}</span>
          </div>
        </div>

        {/* Step 1 & 2 Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 stroke-[2.5]" />
              {t('assistant.country', 'Country')}
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-2xs"
            >
              <option value="India">India (Initial Target Jurisdiction)</option>
              <option value="USA" disabled>United States (Coming Soon)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 stroke-[2.5]" />
              {t('assistant.state', 'State / Region')}
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-2xs"
            >
              {indianStates.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 stroke-[2.5]" />
              {t('assistant.category', 'Legal Area')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 shadow-2xs"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 3: Question Input with Voice */}
        <div>
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              {t('assistant.questionLabel', 'What is your question or situation?')}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 font-mono hidden sm:inline">
                {t('terms.dictate', 'Voice Input')} ({currentLanguage.native}):
              </span>
              <VoiceInputButton
                onTranscript={(transcript) => {
                  setQuestion(prev => prev ? `${prev} ${transcript}` : transcript);
                }}
              />
            </div>
          </div>
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. My landlord has not returned my security deposit after I vacated the flat. What can I do?"
            className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm sm:text-base font-medium leading-relaxed bg-white text-slate-900 shadow-2xs"
            disabled={loading}
          />
        </div>

        {/* 1-Click Sample Question Pills */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">{t('assistant.sampleInquiries', 'Or click an everyday sample inquiry:')}</span>
          <div className="flex flex-wrap gap-2.5">
            {sampleQuestions.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => loadSample(sq)}
                className="text-xs px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-medium transition text-left shadow-2xs hover:-translate-y-0.5 cursor-pointer"
              >
                "{sq.q}"
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
          <button
            type="button"
            onClick={() => setGlossaryOpen(true)}
            className="text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-900 hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 stroke-[2.5]" />
            <span>{t('assistant.openGlossaryPrompt', 'Need term definitions? Open Legal Glossary')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleAsk()}
            disabled={!question.trim() || loading}
            className="px-7 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-slate-200 border border-amber-500 text-slate-900 font-bold uppercase text-sm shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>{t('assistant.retrieving', 'Retrieving & Grounding...')}</span>
              </>
            ) : (
              <>
                <span>{t('assistant.askBtn', 'Ask Legal Assistant')}</span>
                <Send className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* RAG Answer Display */}
      {response && response.result && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Question Summary Bar */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Question Analyzed</span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">"{response.question}"</h3>
            </div>

            <div className="flex items-center gap-2.5 text-xs self-start sm:self-auto flex-wrap">
              {/* Language Selector in Answer Bar */}
              <div className="flex items-center gap-1.5">
                <LanguageSelector />
              </div>

              {/* View Mode Toggle when non-English */}
              {currentLanguage.code !== 'en' && (
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-300 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('original')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'original' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    {t('terms.viewOriginal', 'Original (English)')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('translated')}
                    disabled={isTranslatingAnswer && !translatedAnswer}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'translated' ? 'bg-amber-400 text-slate-900 border border-amber-500' : 'text-slate-700 hover:bg-white'
                    }`}
                  >
                    {t('terms.viewTranslated', 'Translated')} ({currentLanguage.native})
                  </button>
                </div>
              )}

              {/* Text-to-Speech Output Button */}
              <VoiceOutputButton
                text={`${(viewMode === 'translated' && translatedAnswer?.what_the_law_says) ? translatedAnswer.what_the_law_says : response.result.what_the_law_says}. ${(viewMode === 'translated' && translatedAnswer?.what_may_be_relevant) ? translatedAnswer.what_may_be_relevant : (response.result.what_may_be_relevant || '')}`}
              />

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 font-bold uppercase flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('terms.print', 'Print / PDF')}</span>
              </button>
            </div>
          </div>

          {/* Translation Status Pill */}
          {isTranslatingAnswer && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-amber-800" />
              <span>{t('terms.translating', 'Translating legal explanation to')} {currentLanguage.native}... {t('terms.originalRemains', '(Original text remains visible)')}</span>
            </div>
          )}

          {/* Section 1: What the Law Says */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl border border-amber-300 bg-amber-100 shadow-2xs text-amber-900">
                  <Scale className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{t('assistant.whatLawSays', 'What the Law / Information Says')}</h3>
              </div>

              <VoiceOutputButton
                text={(viewMode === 'translated' && translatedAnswer?.what_the_law_says) ? translatedAnswer.what_the_law_says : response.result.what_the_law_says}
                showLabel={false}
              />
            </div>
            <p className="text-slate-800 leading-relaxed text-sm sm:text-base font-medium">
              {(viewMode === 'translated' && translatedAnswer?.what_the_law_says) ? translatedAnswer.what_the_law_says : response.result.what_the_law_says}
            </p>
          </div>

          {/* Section 2: What May Be Relevant */}
          {response.result.what_may_be_relevant && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl border border-sky-300 bg-sky-100 shadow-2xs text-sky-900">
                    <Info className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{t('assistant.whatMayBeRelevant', 'What May Be Relevant')}</h3>
                </div>

                <VoiceOutputButton
                  text={(viewMode === 'translated' && translatedAnswer?.what_may_be_relevant) ? translatedAnswer.what_may_be_relevant : response.result.what_may_be_relevant}
                  showLabel={false}
                />
              </div>
              <p className="text-slate-800 leading-relaxed text-sm sm:text-base font-medium">
                {(viewMode === 'translated' && translatedAnswer?.what_may_be_relevant) ? translatedAnswer.what_may_be_relevant : response.result.what_may_be_relevant}
              </p>
            </div>
          )}

          {/* Section 3: Possible Procedural Options */}
          {response.result.possible_procedural_options?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl border border-emerald-300 bg-emerald-100 shadow-2xs text-emerald-900">
                  <FileText className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{t('assistant.possibleOptions', 'Possible Procedural Options')}</h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    Common legal avenues under Indian procedural law (LegalLens does not give binding legal choices)
                  </p>
                </div>
              </div>

              {/* Step-by-Step Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
                {response.result.possible_procedural_options.map((opt, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-emerald-500 border border-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-2xs">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-800 leading-relaxed font-semibold">{opt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Verified Statutory Sources & Distinction */}
          <SourceCitation
            sources={response.result.sources}
            distinction={response.result.distinction}
          />

          {/* Section 5: Documents to Prepare */}
          <ActionChecklist
            checklist={[]}
            documentsToPrepare={response.result.information_to_prepare}
          />

          {/* Section 6: Questions for Lawyer */}
          <LawyerQuestions
            questions={response.result.questions_to_ask_a_lawyer}
          />

          <DisclaimerBanner />
        </div>
      )}

      {/* Glossary Modal */}
      <LegalGlossaryModal
        isOpen={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
      />
    </div>
  );
}
