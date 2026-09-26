import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Scale, 
  FileSearch, 
  HelpCircle, 
  Upload, 
  GitCompare, 
  LayoutDashboard, 
  User, 
  LogOut, 
  Menu, 
  X,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LegalGlossaryModal from './LegalGlossaryModal';
import LanguageSelector from './LanguageSelector';

const SHORT_NAV_LABELS = {
  terms: { en: 'Terms', te: 'నిబంధనలు', hi: 'शर्तें', ta: 'விதிமுறைகள்', kn: 'ನಿಯಮಗಳು', ml: 'നിബന്ധനകൾ', mr: 'अटी', bn: 'শর্তাবলী' },
  assistant: { en: 'Assistant', te: 'సహాయకుడు', hi: 'सहायक', ta: 'உதவியாளர்', kn: 'ಸಹಾಯಕ', ml: 'സഹായി', mr: 'सहाय्यक', bn: 'সহকারী' },
  upload: { en: 'Upload', te: 'అప్‌లోడ్', hi: 'अपलोड', ta: 'பதிவேற்றம்', kn: 'ಅಪ್‌ಲೋಡ್', ml: 'അപ്‌ലോഡ്', mr: 'अपलोड', bn: 'আপলোড' },
  compare: { en: 'Compare', te: 'పోలిక', hi: 'तुलना', ta: 'ஒப்பீடு', kn: 'ಹೋಲಿಕೆ', ml: 'താരതമ്യം', mr: 'तुलना', bn: 'তুলনা' },
  glossary: { en: 'Glossary', te: 'నిఘంటువు', hi: 'शब्दावली', ta: 'அகராதி', kn: 'ನಿಘಂಟು', ml: 'നിഘണ്ടു', mr: 'शब्दावली', bn: 'শব্দকোষ' },
  dashboard: { en: 'Dashboard', te: 'డ్యాష్‌బోర్డ్', hi: 'डैशबोर्ड', ta: 'டாஷ்போர்டு', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', ml: 'ഡാഷ്‌బోർഡ്', mr: 'डॅशबोर्ड', bn: 'ড্যাশবোর্ড' }
};

export default function Navbar() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  const langCode = currentLanguage?.code || 'en';

  const navLinks = [
    { 
      to: '/terms', 
      label: SHORT_NAV_LABELS.terms[langCode] || t('nav.terms', 'Terms Analyzer'),
      fullLabel: t('nav.terms', 'Terms Analyzer'),
      icon: FileSearch 
    },
    { 
      to: '/legal-assistant', 
      label: SHORT_NAV_LABELS.assistant[langCode] || t('nav.assistant', 'Legal Assistant'),
      fullLabel: t('nav.assistant', 'Legal Assistant'),
      icon: HelpCircle 
    },
    { 
      to: '/upload', 
      label: SHORT_NAV_LABELS.upload[langCode] || t('nav.upload', 'Upload & OCR'),
      fullLabel: t('nav.upload', 'Upload & OCR'),
      icon: Upload 
    },
    { 
      to: '/compare', 
      label: SHORT_NAV_LABELS.compare[langCode] || t('nav.compare', 'Compare'),
      fullLabel: t('nav.compare', 'Compare Documents'),
      icon: GitCompare 
    },
    { 
      to: '/glossary', 
      label: SHORT_NAV_LABELS.glossary[langCode] || t('nav.glossary', 'Glossary'),
      fullLabel: t('nav.glossary', 'Legal Glossary'),
      icon: BookOpen 
    },
    { 
      to: '/dashboard', 
      label: SHORT_NAV_LABELS.dashboard[langCode] || t('nav.dashboard', 'Dashboard'),
      fullLabel: t('nav.dashboard', 'Dashboard'),
      icon: LayoutDashboard 
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 lg:gap-4 min-w-0 w-full">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400 border border-amber-500 shadow-2xs text-slate-900 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Scale className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
              LegalLens
              <span className="w-2 h-2 rounded-full bg-sky-500 inline-block"></span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono mt-0.5">
              GenAI Legal Clarity
            </span>
          </div>
        </Link>

        {/* Desktop Navigation - Concise Multilingual Labels with Zero Overflow */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                title={link.fullLabel}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-amber-300 border border-amber-400 text-slate-950 font-bold shadow-2xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Multilingual Language Selector & User Profile / Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
          {/* Multilingual Native Language Selector */}
          <LanguageSelector />

          {/* User Auth or CTA */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 shadow-2xs transition"
                >
                  <User className="w-3.5 h-3.5 stroke-[2]" />
                  <span className="max-w-[90px] truncate">{user?.name || 'Account'}</span>
                </Link>
                <button
                  onClick={logout}
                  title={t('nav.logOut', 'Log Out')}
                  className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 shadow-2xs rounded-xl transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 stroke-[2]" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition whitespace-nowrap"
                >
                  {t('nav.signIn', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 border border-amber-500 text-slate-900 font-bold text-xs shadow-2xs transition whitespace-nowrap"
                >
                  {t('nav.getStarted', 'Get Started')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle for viewports under lg */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 cursor-pointer shadow-2xs"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-md animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-1 gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    active ? 'bg-amber-300 border-amber-400 text-slate-950 font-bold shadow-2xs' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                  <span>{link.fullLabel}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200">
            {isAuthenticated ? (
              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-medium text-slate-600 font-mono truncate">{user?.email}</span>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="text-xs font-bold text-rose-600 hover:underline inline-flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> {t('nav.logOut', 'Log Out')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-center text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xs"
                >
                  {t('nav.signIn', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-center text-xs font-bold rounded-xl border border-amber-500 bg-amber-400 text-slate-900 shadow-2xs"
                >
                  {t('nav.getStarted', 'Get Started')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plain Legal Glossary Modal */}
      <LegalGlossaryModal
        isOpen={glossaryOpen}
        onClose={() => setGlossaryOpen(false)}
      />
    </header>
  );
}
