import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';

export default function LanguageSelector({ className = '', compact = false }) {
  const { currentLanguage, selectLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Trigger Button: Primary label is the NATIVE SCRIPT */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
        className={`px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-black font-black text-xs uppercase shadow-2xs hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-2 cursor-pointer ${
          isOpen ? 'bg-slate-100' : ''
        }`}
        title="Select display language"
      >
        <Globe className="w-3.5 h-3.5 stroke-[2.5] text-slate-700 shrink-0" />
        {/* NATIVE SCRIPT IS PRIMARY (Section 3 & 4) */}
        <span className="font-extrabold text-sm tracking-normal normal-case font-sans">
          {currentLanguage.native}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 stroke-[2.5] transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-lg z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-2 border-b-2 border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono">
              Select Language / భాషను ఎంచుకోండి
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1 py-1 custom-scrollbar">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLanguage.code === lang.code;
              return (
                <button
                  key={lang.code}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    selectLanguage(lang);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neo-yellow border-black shadow-2xs font-black'
                      : 'border-transparent hover:bg-slate-50 hover:border-black/20'
                  }`}
                >
                  <div className="flex flex-col">
                    {/* Native Script as the Primary Prominent Label */}
                    <span className="text-base font-extrabold text-black leading-tight">
                      {lang.native}
                    </span>
                    {/* Secondary English descriptor for reference */}
                    <span className="text-[11px] font-semibold text-slate-600 font-mono">
                      {lang.english}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t-2 border-slate-100 bg-[#fbf9f1] rounded-xl text-[10px] font-medium text-slate-600 leading-snug">
            💡 AI translations preserve exact numbers, monetary fees, and legal obligations.
          </div>
        </div>
      )}
    </div>
  );
}
