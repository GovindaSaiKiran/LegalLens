import React, { useState, useEffect } from 'react';
import { ArrowUp, Layers, CheckCircle2, AlertTriangle, Calendar, MessageSquare, CheckSquare } from 'lucide-react';

export default function QuickJumpNav({ className = '' }) {
  const [activeSection, setActiveSection] = useState('section-summary');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const sections = [
    { id: 'section-summary', label: 'Summary', icon: Layers },
    { id: 'section-agreeing-to', label: 'What You Agree To', icon: CheckCircle2 },
    { id: 'section-provisions', label: 'Key Clauses', icon: AlertTriangle },
    { id: 'section-obligations', label: 'Obligations & Dates', icon: Calendar },
    { id: 'section-lawyer', label: 'Lawyer Questions', icon: MessageSquare },
    { id: 'section-checklist', label: 'Checklist', icon: CheckSquare }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      const scrollPos = window.scrollY + 200;
      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Sticky Table of Contents Header Bar */}
      <div className={`sticky top-18 z-30 bg-neo-bg border-b-3 border-black shadow-neo-sm py-2.5 px-4 sm:px-6 transition-all ${className}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-black text-black uppercase tracking-wider shrink-0 hidden md:inline font-mono">
            QUICK JUMP:
          </span>

          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-bold flex items-center gap-1.5 transition-all cursor-pointer border-2 border-black ${
                    isActive
                      ? 'bg-neo-yellow text-black shadow-neo-sm translate-x-[-1px] translate-y-[-1px]'
                      : 'bg-white text-black hover:bg-slate-100 shadow-2xs'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="text-xs font-black text-black hover:bg-neo-yellow border-2 border-black px-2.5 py-1 rounded-xl shadow-neo-sm shrink-0 hidden sm:flex items-center gap-1 ml-auto cursor-pointer transition-all"
          >
            <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
            <span>TOP</span>
          </button>
        </div>
      </div>

      {/* Floating Back to Top button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-neo-yellow text-black border-3 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all flex items-center justify-center cursor-pointer font-black"
          title="Scroll back to top"
        >
          <ArrowUp className="w-6 h-6 stroke-[3]" />
        </button>
      )}
    </>
  );
}
