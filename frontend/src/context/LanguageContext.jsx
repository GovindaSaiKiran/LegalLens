import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { translateContent, transcribeAudio, synthesizeVoice } from '../services/api';
import { UI_STRINGS } from './translations';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', locale: 'en-IN', native: 'English', english: 'English' },
  { code: 'te', locale: 'te-IN', native: 'తెలుగు', english: 'Telugu' },
  { code: 'hi', locale: 'hi-IN', native: 'हिन्दी', english: 'Hindi' },
  { code: 'ta', locale: 'ta-IN', native: 'தமிழ்', english: 'Tamil' },
  { code: 'kn', locale: 'kn-IN', native: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'ml', locale: 'ml-IN', native: 'മലയാളം', english: 'Malayalam' },
  { code: 'mr', locale: 'mr-IN', native: 'मराठी', english: 'Marathi' },
  { code: 'bn', locale: 'bn-IN', native: 'বাংলা', english: 'Bengali' }
];

export { UI_STRINGS };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('legallens_language');
      if (saved) {
        const found = SUPPORTED_LANGUAGES.find(l => l.code === saved);
        if (found) return found;
      }
    } catch {
      // Ignore localStorage error
    }
    return SUPPORTED_LANGUAGES[0]; // English by default
  });

  // Client-side translation cache
  const translationCache = useRef(new Map());

  // Global Audio Player state
  const currentAudioRef = useRef(null);
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    activeText: ''
  });

  /**
   * Translate a UI string key with fallback to English or defaultText
   */
  const t = (key, defaultText = '') => {
    const langCode = currentLanguage.code;
    if (UI_STRINGS[langCode] && UI_STRINGS[langCode][key]) {
      return UI_STRINGS[langCode][key];
    }
    if (UI_STRINGS['en'] && UI_STRINGS['en'][key]) {
      return UI_STRINGS['en'][key];
    }
    return defaultText || key;
  };

  const selectLanguage = (langOrCode) => {
    let target = langOrCode;
    if (typeof langOrCode === 'string') {
      target = SUPPORTED_LANGUAGES.find(l => l.code === langOrCode) || SUPPORTED_LANGUAGES[0];
    }
    setCurrentLanguage(target);
    try {
      localStorage.setItem('legallens_language', target.code);
    } catch {
      // Ignore
    }
  };

  /**
   * Translate plain text into a target language (or currentLanguage).
   */
  const translateText = async (text, targetLangCode = currentLanguage.code) => {
    if (!text || !text.trim()) return text;
    if (targetLangCode === 'en') return text;

    const cacheKey = `txt_${targetLangCode}_${text}`;
    if (translationCache.current.has(cacheKey)) {
      return translationCache.current.get(cacheKey);
    }

    try {
      const res = await translateContent({
        text,
        targetLanguage: targetLangCode
      });
      const translated = res.data?.translatedText || text;
      translationCache.current.set(cacheKey, translated);
      return translated;
    } catch (err) {
      console.error('Translation error:', err);
      throw err;
    }
  };

  /**
   * Translate a full structured legal analysis object.
   */
  const translateAnalysis = async (analysis, targetLangCode = currentLanguage.code, analysisId = null) => {
    if (!analysis) return null;
    if (targetLangCode === 'en') return analysis;

    const cacheKey = `analysis_${targetLangCode}_${analysisId || analysis.id || 'current'}`;
    if (translationCache.current.has(cacheKey)) {
      return translationCache.current.get(cacheKey);
    }

    try {
      const res = await translateContent({
        analysis,
        targetLanguage: targetLangCode,
        analysisId: analysisId || analysis.id
      });
      const translated = res.data?.translatedAnalysis || analysis;
      translationCache.current.set(cacheKey, translated);
      return translated;
    } catch (err) {
      console.error('Analysis translation error:', err);
      throw err;
    }
  };

  /**
   * Stop any currently playing audio (Gemini Voice or Web Speech)
   */
  const stopAudio = () => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch (e) {
        console.warn('Error pausing HTML audio:', e);
      }
      currentAudioRef.current = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Error cancelling speech synthesis:', e);
      }
    }

    setAudioState({
      isPlaying: false,
      isPaused: false,
      isLoading: false,
      activeText: ''
    });
  };

  /**
   * Pause currently playing audio
   */
  const pauseAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      setAudioState(prev => ({ ...prev, isPaused: true, isPlaying: false }));
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setAudioState(prev => ({ ...prev, isPaused: true, isPlaying: false }));
    }
  };

  /**
   * Resume paused audio
   */
  const resumeAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.play();
      setAudioState(prev => ({ ...prev, isPaused: false, isPlaying: true }));
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setAudioState(prev => ({ ...prev, isPaused: false, isPlaying: true }));
    }
  };

  /**
   * Text-to-Speech: Synthesizes and plays audio for a given text.
   * Uses Gemini Voice Service (/api/voice/speak) first, and falls back to Web Speech.
   */
  const playSpeech = async (text, langCode = currentLanguage.code) => {
    if (!text || !text.trim()) return;

    // Toggle pause/resume if already speaking the exact same text
    if (audioState.activeText === text) {
      if (audioState.isPlaying) {
        pauseAudio();
        return;
      }
      if (audioState.isPaused) {
        resumeAudio();
        return;
      }
    }

    // Stop existing audio
    stopAudio();
    setAudioState({
      isPlaying: false,
      isPaused: false,
      isLoading: true,
      activeText: text
    });

    try {
      // 1. Try Gemini Voice TTS backend endpoint
      const res = await synthesizeVoice({
        text: text.slice(0, 800),
        language: langCode
      });

      if (res.data?.audioBase64) {
        const audioSrc = `data:${res.data.mimeType || 'audio/wav'};base64,${res.data.audioBase64}`;
        const audio = new Audio(audioSrc);
        currentAudioRef.current = audio;

        audio.onended = () => {
          stopAudio();
        };

        audio.onerror = (e) => {
          console.warn('Gemini audio playback error, falling back to Web Speech:', e);
          fallbackWebSpeech(text, langCode);
        };

        await audio.play();
        setAudioState({
          isPlaying: true,
          isPaused: false,
          isLoading: false,
          activeText: text
        });
        return;
      }
    } catch (err) {
      console.warn('Gemini Voice TTS service call error, falling back to Web Speech:', err.message);
    }

    // 2. Fallback to Web Speech API
    fallbackWebSpeech(text, langCode);
  };

  const fallbackWebSpeech = (text, langCode) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setAudioState({
        isPlaying: false,
        isPaused: false,
        isLoading: false,
        activeText: ''
      });
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langInfo = SUPPORTED_LANGUAGES.find(l => l.code === langCode) || SUPPORTED_LANGUAGES[0];
    utterance.lang = langInfo.locale || 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => {
      stopAudio();
    };

    utterance.onerror = () => {
      stopAudio();
    };

    window.speechSynthesis.speak(utterance);
    setAudioState({
      isPlaying: true,
      isPaused: false,
      isLoading: false,
      activeText: text
    });
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const value = {
    currentLanguage,
    selectLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    t,
    translateText,
    translateAnalysis,
    playSpeech,
    pauseAudio,
    resumeAudio,
    stopAudio,
    audioState
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
