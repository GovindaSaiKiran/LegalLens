import React from 'react';
import { Volume2, Pause, Play, Square, Printer, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AccessibilityToolbar({
  summaryText = '',
  agreeingToItems = [],
  textSize = 'normal',
  onTextSizeChange,
  isSimpleMode = false,
  onToggleSimpleMode,
  className = ''
}) {
  const { t, currentLanguage, audioState, playSpeech, pauseAudio, resumeAudio, stopAudio } = useLanguage();

  const textToRead = [
    summaryText,
    agreeingToItems && agreeingToItems.length > 0 ? agreeingToItems.slice(0, 5).join('. ') : ''
  ].filter(Boolean).join('. ');

  const isCurrentActive = audioState.activeText === textToRead;
  const isPlaying = isCurrentActive && audioState.isPlaying;
  const isPaused = isCurrentActive && audioState.isPaused;
  const isLoading = isCurrentActive && audioState.isLoading;

  const handleSpeak = () => {
    if (isLoading) return;
    if (isPlaying) {
      pauseAudio();
    } else if (isPaused) {
      resumeAudio();
    } else {
      playSpeech(textToRead, currentLanguage.code);
    }
  };

  const handleStopSpeech = () => {
    stopAudio();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-2xs p-3.5 sm:px-5 sm:py-3 flex flex-wrap items-center justify-between gap-3 ${className}`}>
      {/* Group 1: Audio Reader (Gemini Voice Text-to-Speech) & ELI5 */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSpeak}
            disabled={isLoading || !textToRead}
            className={`px-3.5 py-2 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-neo-blue border-blue-700 text-white shadow-2xs animate-pulse'
                : isPaused
                ? 'bg-amber-300 border-amber-600 text-black shadow-2xs'
                : isLoading
                ? 'bg-slate-200 border-slate-300 text-slate-700 cursor-wait'
                : 'bg-neo-yellow hover:bg-neo-yellowHover border-slate-900 text-black shadow-2xs'
            }`}
            title={`Listen to summary in ${currentLanguage.native} (${currentLanguage.english})`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>{t('terms.preparingVoice', 'Preparing Audio...')}</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="w-4 h-4 stroke-[3]" />
                <span>{t('terms.pauseAudio', 'Pause Audio')}</span>
              </>
            ) : isPaused ? (
              <>
                <Play className="w-4 h-4 stroke-[3]" />
                <span>{t('terms.resumeAudio', 'Resume Audio')}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 stroke-[3]" />
                <span>{t('terms.listenSummary', 'Listen to Summary')} ({currentLanguage.native})</span>
              </>
            )}
          </button>

          {(isPlaying || isPaused) && (
            <button
              type="button"
              onClick={handleStopSpeech}
              className="p-2 rounded-xl border border-rose-600 bg-rose-500 hover:bg-rose-600 text-white shadow-2xs cursor-pointer transition-all"
              title={t('terms.stopAudio', 'Stop audio')}
              aria-label="Stop audio"
            >
              <Square className="w-3.5 h-3.5 stroke-[3] fill-white" />
            </button>
          )}
        </div>

        {/* Simplicity Mode Toggle (Plain English vs Detailed) */}
        {onToggleSimpleMode && (
          <button
            type="button"
            onClick={onToggleSimpleMode}
            className={`px-3.5 py-2 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              isSimpleMode
                ? 'bg-neo-green border-emerald-700 text-black shadow-2xs'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-black shadow-2xs'
            }`}
            title="Toggle between standard analysis and ultra-simple everyday words"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>{isSimpleMode ? `✨ ${t('terms.eli5Badge', 'ELI5')}: ON` : t('terms.simplifyFurther', 'Simplify Further')}</span>
          </button>
        )}
      </div>

      {/* Group 2: Font Size Adjuster & Print */}
      <div className="flex items-center gap-2.5">
        {/* Text Zoom */}
        {onTextSizeChange && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-300 shadow-2xs text-xs">
            <span className="text-[10px] text-slate-700 font-bold uppercase tracking-wider px-1.5">
              {t('agent.size', 'Size:')}
            </span>
            <button
              type="button"
              onClick={() => onTextSizeChange('normal')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                textSize === 'normal' ? 'bg-black text-white' : 'text-slate-800 hover:bg-white'
              }`}
            >
              A
            </button>
            <button
              type="button"
              onClick={() => onTextSizeChange('large')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                textSize === 'large' ? 'bg-black text-white' : 'text-slate-800 hover:bg-white'
              }`}
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => onTextSizeChange('xlarge')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                textSize === 'xlarge' ? 'bg-black text-white' : 'text-slate-800 hover:bg-white'
              }`}
            >
              A++
            </button>
          </div>
        )}

        {/* Clean Print / PDF button */}
        <button
          type="button"
          onClick={handlePrint}
          className="neo-btn-sm bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl text-black font-bold flex items-center gap-1.5 cursor-pointer border border-slate-300 shadow-2xs"
          title="Print or Save as PDF"
        >
          <Printer className="w-4 h-4 stroke-[2.5]" />
          <span>{t('terms.print', 'Print / PDF')}</span>
        </button>
      </div>
    </div>
  );
}
