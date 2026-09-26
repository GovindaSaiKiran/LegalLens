import React, { useState } from 'react';
import { 
  Puzzle, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  FolderDown, 
  Check, 
  Copy,
  Eye,
  AlertCircle
} from 'lucide-react';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { useLanguage } from '../context/LanguageContext';

export default function BrowserExtensionPage() {
  const { t } = useLanguage();
  const [agreed, setAgreed] = useState(false);
  const [showSimulatedPopup, setShowSimulatedPopup] = useState(false);
  const [copiedFolder, setCopiedFolder] = useState(false);

  const handleCopyFolder = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopiedFolder(true);
    setTimeout(() => setCopiedFolder(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-neo-yellow text-black border-2 border-black shadow-2xs">
          <Puzzle className="w-4 h-4 stroke-[2.5]" />
          <span>{t('ext.badge', 'Companion Chrome & Edge Extension')}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-black uppercase tracking-tight">
          {t('ext.title', 'Real-Time LegalLens Browser Extension')}
        </h1>
        <p className="text-slate-800 font-semibold max-w-3xl leading-relaxed text-sm sm:text-base">
          {t('ext.subtitle', 'Protect yourself as you browse. The LegalLens extension automatically detects Terms of Service and Privacy Policy checkboxes and pops up a plain-English risk summary before you click "I Agree".')}
        </p>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border-3 border-black shadow-neo space-y-3">
          <div className="w-10 h-10 rounded-xl bg-neo-blue border-2 border-black text-black flex items-center justify-center font-black text-base shadow-2xs">
            1
          </div>
          <h3 className="font-black text-black text-base uppercase tracking-tight">{t('ext.feature1Title', 'Instant Checkbox Detection')}</h3>
          <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
            {t('ext.feature1Desc', 'Scans registration pages for hidden consent checkboxes and terms links.')}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border-3 border-black shadow-neo space-y-3">
          <div className="w-10 h-10 rounded-xl bg-neo-purple border-2 border-black text-black flex items-center justify-center font-black text-base shadow-2xs">
            2
          </div>
          <h3 className="font-black text-black text-base uppercase tracking-tight">{t('ext.feature2Title', 'One-Click Plain Summary')}</h3>
          <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
            {t('ext.feature2Desc', 'Summarizes auto-renewals, cancellation traps, and data selling in seconds.')}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border-3 border-black shadow-neo space-y-3">
          <div className="w-10 h-10 rounded-xl bg-neo-green border-2 border-black text-black flex items-center justify-center font-black text-base shadow-2xs">
            3
          </div>
          <h3 className="font-black text-black text-base uppercase tracking-tight">{t('ext.feature3Title', 'Risk Score Meter')}</h3>
          <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
            {t('ext.feature3Desc', 'Color-coded rating shows whether the agreement is fair or heavily one-sided.')}
          </p>
        </div>
      </div>

      {/* Interactive Simulation Sandbox */}
      <div className="bg-[#fcfaf2] rounded-2xl border-3 border-black p-6 sm:p-8 space-y-6 shadow-neo-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-black gap-3">
          <div>
            <span className="text-xs uppercase font-black px-3 py-1 rounded-full bg-neo-blue text-black border-2 border-black shadow-2xs">
              {t('ext.liveSandbox', 'Live Sandbox')}
            </span>
            <h3 className="text-xl font-black text-black uppercase tracking-tight mt-2">{t('ext.livePreview', 'Live Extension Preview')}</h3>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-neo-green text-black border-2 border-black font-black uppercase shadow-2xs self-start sm:self-auto">
            {t('ext.simulatorActive', 'Simulator Active')}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-800 font-semibold">
          {t('ext.interactiveDesc', 'Hover over or interact with the mock checkout consent checkbox below to see how the LegalLens extension activates in the browser:')}
        </p>

        {/* Mock Webpage Checkout Box */}
        <div className="max-w-xl mx-auto p-6 sm:p-7 rounded-2xl border-3 border-black bg-white shadow-neo relative">
          <h4 className="font-black text-black text-sm uppercase tracking-tight mb-3">
            {t('ext.mockFormTitle', 'Example Web Sign-Up Form')}
          </h4>
          
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Full Name" 
              disabled 
              value="Alex Johnson" 
              className="w-full px-3.5 py-2 text-xs rounded-xl border-2 border-black bg-slate-100 font-bold text-black"
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              disabled 
              value="alex@example.com" 
              className="w-full px-3.5 py-2 text-xs rounded-xl border-2 border-black bg-slate-100 font-bold text-black"
            />
            
            {/* The Consent Element */}
            <div className="pt-2 flex items-start gap-2.5 relative">
              <input
                type="checkbox"
                id="agree-checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-black border-2 border-black rounded"
              />
              <label htmlFor="agree-checkbox" className="text-xs text-black font-semibold leading-normal">
                {t('ext.consentText', 'I have read and agree to the Terms & Conditions and Privacy Policy.')}
              </label>

              {/* Simulated LegalLens Badge Trigger */}
              <button
                type="button"
                onClick={() => setShowSimulatedPopup(!showSimulatedPopup)}
                className="absolute -top-4 -right-2 px-3 py-1.5 rounded-full bg-neo-yellow text-black border-2 border-black text-xs font-black uppercase shadow-neo-sm flex items-center gap-1.5 animate-bounce cursor-pointer hover:bg-neo-yellow/90"
              >
                <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t('ext.reviewBtn', 'LegalLens: Review')}</span>
              </button>
            </div>

            {/* Simulated Extension Overlay */}
            {showSimulatedPopup && (
              <div className="mt-4 p-5 rounded-2xl bg-[#fffdf0] border-3 border-black shadow-neo space-y-3.5 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-black stroke-[2.5]" />
                    <span className="font-black text-black text-xs uppercase tracking-tight">
                      {t('ext.beforeYouAgree', 'LegalLens: Before You Agree')}
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowSimulatedPopup(false)}
                    className="text-xs font-black px-2 py-0.5 rounded border border-black bg-white hover:bg-neo-coral text-black cursor-pointer shadow-2xs"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-xs font-semibold text-black">
                  <div className="flex items-start gap-2">
                    <span className="font-black uppercase tracking-wider shrink-0">• {t('ext.dataUsage', 'Data usage:')}</span>
                    <span>{t('ext.dataUsageDesc', 'Telemetry and usage metrics shared with third-party vendors.')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-black uppercase tracking-wider shrink-0">• {t('ext.autoRenewal', 'Auto-renewal:')}</span>
                    <span>{t('ext.autoRenewalDesc', 'Renews automatically unless cancelled 7 days in advance.')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-black uppercase tracking-wider shrink-0">• {t('ext.cancellation', 'Cancellation:')}</span>
                    <span>{t('ext.cancellationDesc', 'Payments strictly non-refundable once billed.')}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-black uppercase tracking-wider shrink-0">• {t('ext.disputeVenue', 'Dispute venue:')}</span>
                    <span>{t('ext.disputeVenueDesc', 'Individual binding arbitration in Hyderabad.')}</span>
                  </div>
                </div>

                <div className="pt-2 border-t-2 border-black/20 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-700">
                    {t('ext.userInControl', 'User remains in control')}
                  </span>
                  <a
                    href="/terms"
                    className="text-xs font-black uppercase text-black hover:underline flex items-center gap-1"
                  >
                    <span>{t('ext.openInFullApp', 'Open in Full LegalLens App')}</span>
                    <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                  </a>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled
              className="w-full py-3 rounded-xl bg-slate-200 border-2 border-black text-slate-500 font-black text-xs uppercase mt-3 cursor-not-allowed"
            >
              {t('ext.completeSignUp', 'Complete Sign-Up (Simulation)')}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions on Local Chrome Loading */}
      <div className="bg-white rounded-2xl border-3 border-black p-6 sm:p-8 shadow-neo-md space-y-4">
        <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">{t('ext.howItWorks', 'How to Load the Extension Prototype in Google Chrome')}</h3>
        <p className="text-sm text-slate-800 font-semibold leading-relaxed">
          The Chrome Manifest V3 extension is located inside the <code className="px-2 py-0.5 bg-neo-yellow/40 border border-black rounded text-black font-mono font-bold text-xs">extension/</code> directory of this repository. Follow these steps to test it in Chrome:
        </p>

        <ol className="space-y-3 text-sm text-black font-semibold list-decimal pl-5">
          <li>
            Open Google Chrome and navigate to <code className="px-2 py-0.5 bg-neo-yellow/40 border border-black rounded font-mono font-bold text-xs">chrome://extensions</code>.
          </li>
          <li>
            Toggle on the <strong>Developer mode</strong> switch in the top-right corner.
          </li>
          <li>
            Click the <strong>Load unpacked</strong> button on the top-left toolbar.
          </li>
          <li>
            Select the <code className="px-2 py-0.5 bg-neo-yellow/40 border border-black rounded font-mono font-bold text-xs">pw/extension</code> directory from this project workspace.
          </li>
          <li>
            The <strong>LegalLens Companion</strong> icon will appear in your Chrome toolbar, automatically detecting consent links and providing instant summaries!
          </li>
        </ol>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
