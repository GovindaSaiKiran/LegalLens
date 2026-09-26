import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileSearch, 
  HelpCircle, 
  Upload, 
  GitCompare, 
  ArrowRight, 
  ShieldCheck, 
  Scale, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Lock, 
  Sparkles,
  BookOpen,
  CheckSquare,
  LayoutDashboard,
  Languages
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function HomePage() {
  const { t } = useLanguage();

  const primaryActions = [
    {
      to: '/terms',
      title: t('nav.terms', 'Analyze Terms'),
      desc: t('home.heroDesc', 'Paste a website URL or terms text to uncover auto-renewals, data practices, and cancellation policies.'),
      icon: FileSearch,
      color: 'bg-neo-blue text-black',
      badge: 'URL & Text'
    },
    {
      to: '/legal-assistant',
      title: t('nav.assistant', 'Ask a Legal Question'),
      desc: t('assistant.subtitle', 'Ask everyday legal questions and get answers grounded in verified Indian statutes and regulations.'),
      icon: HelpCircle,
      color: 'bg-neo-purple text-black',
      badge: 'RAG Architecture'
    },
    {
      to: '/upload',
      title: t('nav.upload', 'Upload Document'),
      desc: t('upload.subtitle', 'Analyze rental leases, employment contracts, and policies (PDF, DOCX, TXT) with interactive Q&A.'),
      icon: Upload,
      color: 'bg-neo-green text-black',
      badge: 'Grounded Q&A'
    },
    {
      to: '/compare',
      title: t('nav.compare', 'Compare Documents'),
      desc: t('compare.subtitle', 'Compare two contract versions to identify added, removed, and modified clauses with plain summaries.'),
      icon: GitCompare,
      color: 'bg-neo-amber text-black',
      badge: 'Semantic Diff'
    },
    {
      to: '/glossary',
      title: t('nav.glossary', 'Plain Legal Glossary'),
      desc: t('glossary.subtitle', 'Decode 40+ intimidating contract terms into simple layman words with relatable examples and risk warnings.'),
      icon: BookOpen,
      color: 'bg-neo-pink text-black',
      badge: 'Jargon Buster'
    }
  ];

  const features = [
    {
      title: t('terms.badge', 'Terms & Conditions Analyzer'),
      description: t('terms.subtitle', 'Breaks down dense terms into a plain "What Am I Agreeing To?" card, with clause references and cancellation rules.'),
      icon: FileSearch
    },
    {
      title: t('glossary.title', 'Plain Legal Glossary'),
      description: t('glossary.subtitle', 'Searchable encyclopedia of 40+ legal concepts with everyday scenarios, statutory references, and practical pro-tips.'),
      icon: BookOpen
    },
    {
      title: t('assistant.badge', 'Legal Knowledge RAG Assistant'),
      description: t('assistant.subtitle', 'Retrieves relevant statutory provisions before synthesizing an objective, grounded answer.'),
      icon: Scale
    },
    {
      title: t('upload.badge', 'Document Analysis & Grounded Chat'),
      description: t('upload.subtitle', 'Ask specific questions to your uploaded contract with zero hallucinations.'),
      icon: BookOpen
    },
    {
      title: t('compare.badge', 'Semantic Document Comparison'),
      description: t('compare.subtitle', 'Detects substantive alterations in contract counter-offers beyond simple character diffs.'),
      icon: GitCompare
    },
    {
      title: t('terms.actionChecklist', 'Action Checklist & Timeline'),
      description: t('home.step3Desc', 'Generates a checklist of time-sensitive deadlines, notice periods, and exact records to gather before consulting a lawyer.'),
      icon: CheckSquare
    },
    {
      title: t('dash.title', 'Personal Workspace & Saved Reports'),
      description: t('dash.subtitle', 'Track and reopen your recent terms analyses, statutory queries, and contract reports anytime.'),
      icon: LayoutDashboard
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative pt-10 sm:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-neo-yellow text-black border-2 border-black shadow-2xs">
            <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
            <span>{t('home.heroBadge', 'GenAI Legal Awareness & Document Clarity')}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-black uppercase tracking-tight leading-[1.05]">
            {t('home.heroTitle1', 'Understand Before')} <br />
            <span className="bg-neo-yellow px-3 py-1 border-3 border-black inline-block shadow-neo-sm transform -rotate-1 mt-2">
              {t('home.heroTitle2', 'You Agree.')}
            </span>
          </h1>

          <p className="text-base sm:text-xl text-black font-semibold leading-relaxed max-w-2xl mx-auto">
            {t('home.heroDesc', 'LegalLens helps you understand Terms & Conditions, contracts, policies, and everyday legal questions using AI and verified legal information.')}
          </p>

          {/* Quick Jurisdiction Badge */}
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neo-green text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-black"></span>
              <span>{t('footer.jurisdiction', 'Jurisdiction: India (Consumer, Tenancy, DPDP, Employment, Contracts)')}</span>
            </span>
          </div>
        </div>

        {/* Primary Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mt-12">
          {primaryActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Link
                key={i}
                to={action.to}
                className="bg-white rounded-2xl border-3 border-black p-5 shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl border-2 border-black ${action.color} flex items-center justify-center shadow-neo-sm group-hover:rotate-3 transition`}>
                      <Icon className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-black bg-white text-black shadow-2xs">
                      {action.badge}
                    </span>
                  </div>
                  <h2 className="text-base font-black text-black uppercase tracking-tight mb-1.5 group-hover:underline">
                    {action.title}
                  </h2>
                  <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                    {action.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t-2 border-black/20 flex items-center justify-between text-xs font-black uppercase tracking-wider text-black group-hover:translate-x-1 transition">
                  <span>{t('dash.openReport', 'Open Tool')}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 2. Problem & Solution Section */}
      <section className="bg-[#fcfaf2] border-y-3 border-black py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Problem */}
          <div className="bg-[#fff5f5] rounded-2xl border-3 border-black p-8 shadow-neo-md flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-neo-coral text-black border-2 border-black shadow-2xs">
                <AlertCircle className="w-4 h-4 stroke-[2.5]" />
                <span>{t('terms.mainCatches', 'The Challenge')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight leading-snug">
                "Legal documents are long, technical, and hard to understand."
              </h2>
              <p className="text-sm sm:text-base text-slate-900 font-semibold leading-relaxed">
                Standard terms average over 15 pages of complex legal terminology. Critical terms—such as recurring charges, arbitration requirements, and data transfers—are often hidden in dense text, leading users to agree blindly.
              </p>
            </div>
            <ul className="space-y-3 mt-6 text-xs sm:text-sm font-bold text-black">
              <li className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-neo-coral border-2 border-black shrink-0"></span>
                <span>{t('terms.subtitle', 'Hidden automatic renewals and narrow cancellation notice windows')}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-neo-coral border-2 border-black shrink-0"></span>
                <span>Broad data sharing rights and third-party advertising usage</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-neo-coral border-2 border-black shrink-0"></span>
                <span>Waivers of court recourse through mandatory foreign arbitration</span>
              </li>
            </ul>
          </div>

          {/* Solution */}
          <div className="bg-[#f0fff4] rounded-2xl border-3 border-black p-8 shadow-neo-md flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-neo-green text-black border-2 border-black shadow-2xs">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>{t('home.trustedTitle', 'The LegalLens Solution')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight leading-snug">
                "LegalLens turns complex legal text into clear, actionable awareness."
              </h2>
              <p className="text-sm sm:text-base text-slate-900 font-semibold leading-relaxed">
                Our platform provides objective, plain-language translations of legal documents. Every point is cross-referenced with exact clauses, and legal questions are grounded in verified statutory sources without hallucinations.
              </p>
            </div>
            <ul className="space-y-3 mt-6 text-xs sm:text-sm font-bold text-black">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-800 stroke-[3] shrink-0" />
                <span>Instant plain-English <strong>"{t('terms.whatYouAreAgreeingTo', 'What Am I Agreeing To?')}"</strong> summary card</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-800 stroke-[3] shrink-0" />
                <span>{t('assistant.verifiedSources', 'Verified statutory citations (e.g. Consumer Protection Act, DPDP Act 2023)')}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-800 stroke-[3] shrink-0" />
                <span>{t('terms.lawyerQuestions', 'Preparation questions and evidence checklists for lawyer consultations')}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Platform Capabilities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-neo-yellow border-2 border-black text-black shadow-2xs">
            <span>{t('home.featuresTitle', 'Comprehensive Legal Awareness Tools')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight">
            {t('home.featuresTitle', 'Complete Legal Awareness Suite')}
          </h2>
          <p className="text-sm sm:text-base text-slate-800 font-semibold">
            {t('home.featuresSubtitle', 'A modular suite designed to demystify terms, verify statutory rights, and prepare you for informed decisions.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border-3 border-black p-6 shadow-neo hover:-translate-y-1 transition">
                <div className="w-12 h-12 rounded-xl bg-neo-yellow border-2 border-black text-black flex items-center justify-center mb-4 shadow-neo-sm">
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="font-black text-black text-lg uppercase tracking-tight mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-800 font-semibold leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Neo-Brutalist Legal Glossary Feature Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neo-yellow rounded-3xl border-3 border-black shadow-neo-lg p-8 sm:p-10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border-2 border-black bg-white text-xs font-black uppercase text-black shadow-neo-sm">
                <BookOpen className="w-4 h-4 stroke-[2.5]" />
                <span>{t('glossary.badge', 'Plain-Language Legal Glossary')}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight leading-tight">
                {t('glossary.title', "Don't Let Legal Jargon Trick You. Decode 40+ Contract Terms.")}
              </h2>

              <p className="text-sm sm:text-base text-black font-bold leading-relaxed">
                {t('glossary.subtitle', 'From Arbitration clauses and Automatic renewals to Non-competes and Quiet enjoyment, our plain-language glossary translates scary legal phrasing into everyday stories with statutory citations under Indian Law.')}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/glossary"
                  className="px-5 py-3 rounded-2xl border-2 border-black bg-black text-white hover:bg-neutral-800 font-black text-sm shadow-neo-sm hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-2"
                >
                  <span>{t('home.glossaryBtn', 'Explore Full Legal Glossary')}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Link>
                <div className="flex items-center gap-2 text-xs font-black text-black">
                  <span className="w-2.5 h-2.5 rounded-full bg-neo-green border border-black inline-block"></span>
                  <span>{t('glossary.spotlight', 'Flashcard Quiz Mode & Printable Cheat Sheets')}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-2xl border-3 border-black p-5 shadow-neo space-y-3">
              <span className="text-[11px] font-black uppercase text-black/60 block font-mono">
                {t('glossary.spotlight', 'Sample Jargon Translation')}
              </span>
              <h4 className="font-black text-black text-lg">Indemnity / Indemnification</h4>
              <div className="p-3 rounded-xl bg-neo-coralLight border-2 border-black text-xs space-y-1">
                <span className="font-black text-black uppercase font-mono">🚨 {t('glossary.inPlainWords', 'Plain English:')}</span>
                <p className="font-bold text-black">
                  "You promise to pay for someone else's financial loss or lawyer bills if something goes wrong."
                </p>
              </div>
              <div className="p-3 rounded-xl bg-neo-blueLight border-2 border-black text-xs space-y-1">
                <span className="font-black text-black uppercase font-mono">📖 {t('glossary.everydayScenario', 'Real Story:')}</span>
                <p className="font-semibold text-black italic">
                  "If you upload copyrighted art to a print store and the owner sues, YOU pay the store's lawsuit expenses."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Pipeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border-3 border-black p-8 sm:p-10 shadow-neo-md">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs uppercase tracking-wider font-black px-3 py-1 rounded-full bg-neo-blue text-black border-2 border-black shadow-2xs">
              {t('home.howItWorksTitle', 'Simple Workflow')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-tight pt-2">
              {t('home.howItWorksTitle', 'How LegalLens Works')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-[#fcfaf2] border-2 border-black shadow-neo-sm text-center space-y-3">
              <span className="w-10 h-10 rounded-xl bg-neo-yellow border-2 border-black text-black inline-flex items-center justify-center font-black text-base shadow-2xs">1</span>
              <h4 className="font-black text-black text-base uppercase tracking-tight">
                {t('home.step1Title', 'Upload / Enter URL')}
              </h4>
              <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                {t('home.step1Desc', 'Paste a public terms URL, paste legal text, or upload a contract (PDF, DOCX, TXT).')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-[#fcfaf2] border-2 border-black shadow-neo-sm text-center space-y-3">
              <span className="w-10 h-10 rounded-xl bg-neo-blue border-2 border-black text-black inline-flex items-center justify-center font-black text-base shadow-2xs">2</span>
              <h4 className="font-black text-black text-base uppercase tracking-tight">
                {t('home.step2Title', 'Analyze & Retrieve')}
              </h4>
              <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                {t('home.step2Desc', 'The AI parses clauses, maps obligations, and queries verified statutory legal provisions.')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-[#fcfaf2] border-2 border-black shadow-neo-sm text-center space-y-3">
              <span className="w-10 h-10 rounded-xl bg-neo-purple border-2 border-black text-black inline-flex items-center justify-center font-black text-base shadow-2xs">3</span>
              <h4 className="font-black text-black text-base uppercase tracking-tight">
                {t('home.step3Title', 'Understand')}
              </h4>
              <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                {t('home.step3Desc', 'Review plain summaries, original clause excerpts, deadlines, and risk scorecards.')}
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-[#fcfaf2] border-2 border-black shadow-neo-sm text-center space-y-3">
              <span className="w-10 h-10 rounded-xl bg-neo-green border-2 border-black text-black inline-flex items-center justify-center font-black text-base shadow-2xs">4</span>
              <h4 className="font-black text-black text-base uppercase tracking-tight">
                {t('terms.actionChecklist', 'Take Informed Steps')}
              </h4>
              <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                {t('terms.lawyerQuestions', 'Prepare evidence checklists and targeted questions before speaking with a qualified lawyer.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Disclaimer Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <DisclaimerBanner />
      </section>
    </div>
  );
}
