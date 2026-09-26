import React from 'react';
import { Volume2, Play, Pause, Square, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * VoiceOutputButton
 * 
 * Provides Text-To-Speech controls (Play, Pause, Stop) using the backend Gemini Voice service.
 * Respects the user's selected language (e.g. Telugu text is read in Telugu speech).
 */
export default function VoiceOutputButton({
  text,
  className = '',
  buttonClass = '',
  showLabel = true,
  size = 'md'
}) {
  const { currentLanguage, audioState, playSpeech, pauseAudio, resumeAudio, stopAudio } = useLanguage();

  if (!text || typeof text !== 'string' || !text.trim()) {
    return null;
  }

  const isCurrentActive = audioState.activeText === text;
  const isPlaying = isCurrentActive && audioState.isPlaying;
  const isPaused = isCurrentActive && audioState.isPaused;
  const isLoading = isCurrentActive && audioState.isLoading;

  const handlePlayToggle = () => {
    if (isLoading) return;

    if (isPlaying) {
      pauseAudio();
    } else if (isPaused) {
      resumeAudio();
    } else {
      playSpeech(text, currentLanguage.code);
    }
  };

  const handleStop = (e) => {
    e.stopPropagation();
    stopAudio();
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Primary Listen / Play / Pause Button */}
      <button
        type="button"
        onClick={handlePlayToggle}
        disabled={isLoading}
        aria-label={
          isPlaying 
            ? 'Pause audio' 
            : isPaused 
            ? 'Resume audio' 
            : `Listen to response in ${currentLanguage.native}`
        }
        title={
          isPlaying 
            ? 'Pause audio' 
            : isPaused 
            ? 'Resume audio' 
            : `Listen to explanation (${currentLanguage.native})`
        }
        className={`px-2.5 py-1.5 rounded-xl border-2 border-black font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer select-none ${
          isPlaying
            ? 'bg-neo-blue text-white shadow-neo-sm animate-pulse'
            : isPaused
            ? 'bg-amber-300 text-black shadow-neo-sm'
            : isLoading
            ? 'bg-slate-200 text-slate-700 cursor-wait'
            : 'bg-white hover:bg-neo-yellow text-black shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px]'
        } ${buttonClass}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {showLabel && <span>Preparing voice...</span>}
          </>
        ) : isPlaying ? (
          <>
            <Pause className="w-3.5 h-3.5 fill-current stroke-[2]" />
            {showLabel && <span>Pause</span>}
          </>
        ) : isPaused ? (
          <>
            <Play className="w-3.5 h-3.5 fill-current stroke-[2]" />
            {showLabel && <span>Resume</span>}
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 stroke-[2.5]" />
            {showLabel && (
              <span>
                Listen <span className="font-normal opacity-75">({currentLanguage.native})</span>
              </span>
            )}
          </>
        )}
      </button>

      {/* Dedicated Stop Button if actively playing or paused */}
      {isCurrentActive && (isPlaying || isPaused) && (
        <button
          type="button"
          onClick={handleStop}
          aria-label="Stop audio"
          title="Stop playback"
          className="p-1.5 rounded-xl border-2 border-black bg-rose-500 hover:bg-rose-600 text-white shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer transition-all"
        >
          <Square className="w-3.5 h-3.5 fill-current stroke-[2]" />
        </button>
      )}
    </div>
  );
}
