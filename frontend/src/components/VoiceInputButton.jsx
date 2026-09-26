import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { transcribeAudio } from '../services/api';

/**
 * VoiceInputButton
 * 
 * Records audio using standard browser MediaRecorder, sends to backend Gemini Voice Service
 * (/api/voice/transcribe), and returns the recognized text via onTranscript callback.
 * 
 * States: 'idle' | 'listening' | 'processing' | 'complete' | 'error'
 */
export default function VoiceInputButton({
  onTranscript,
  className = '',
  buttonClass = '',
  size = 'md',
  placeholder = 'Ask your legal question...'
}) {
  const { currentLanguage } = useLanguage();
  const [state, setState] = useState('idle'); // 'idle' | 'listening' | 'processing' | 'complete' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  // Clean up recording if unmounted
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  const stopRecordingCleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // Ignore
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    setErrorMessage('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setState('error');
      setErrorMessage('Microphone access is not supported by your browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Determine supported mimeType
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = '';
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        await handleAudioProcess(audioBlob);
      };

      recorder.start(250); // Slice chunks every 250ms
      setState('listening');
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(sec => {
          if (sec >= 45) { // Auto-stop after 45s maximum to avoid huge files
            stopRecording();
            return sec;
          }
          return sec + 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Microphone access error:', err);
      setState('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone permission is required for voice input.');
      } else {
        setErrorMessage('Unable to access microphone. Please check permissions.');
      }
      setTimeout(() => setState('idle'), 4000);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      setState('processing');
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping mediaRecorder:', e);
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleAudioProcess = async (audioBlob) => {
    if (!audioBlob || audioBlob.size === 0) {
      setState('error');
      setErrorMessage('No audio recorded. Please speak clearly.');
      setTimeout(() => setState('idle'), 3000);
      return;
    }

    try {
      setState('processing');

      // Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result.split(',')[1];
          const mimeType = audioBlob.type || 'audio/webm';

          const res = await transcribeAudio({
            audioBase64: base64Data,
            mimeType: mimeType.split(';')[0], // Extract clean mime type
            language: currentLanguage.code,
            locale: currentLanguage.locale
          });

          const transcript = res.data?.transcript || '';
          if (transcript.trim()) {
            setState('complete');
            if (onTranscript) {
              onTranscript(transcript.trim());
            }
            setTimeout(() => setState('idle'), 2000);
          } else {
            setState('error');
            setErrorMessage('No speech detected. Please speak clearly and try again.');
            setTimeout(() => setState('idle'), 3500);
          }
        } catch (apiErr) {
          console.error('STT API Error:', apiErr);
          setState('error');
          setErrorMessage('Voice recognition failed. Please try again.');
          setTimeout(() => setState('idle'), 3500);
        }
      };
      reader.onerror = () => {
        setState('error');
        setErrorMessage('Audio processing error. Please try again.');
        setTimeout(() => setState('idle'), 3000);
      };
    } catch (err) {
      console.error('Audio processing failure:', err);
      setState('error');
      setErrorMessage('Voice recognition failed. Please try again.');
      setTimeout(() => setState('idle'), 3500);
    }
  };

  const handleToggle = () => {
    if (state === 'idle' || state === 'error' || state === 'complete') {
      startRecording();
    } else if (state === 'listening') {
      stopRecording();
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Listening status badge with timer */}
      {state === 'listening' && (
        <div className="absolute right-full mr-2.5 flex items-center gap-1.5 px-2.5 py-1 bg-rose-500 text-white rounded-xl text-xs font-bold shadow-neo-sm animate-pulse whitespace-nowrap z-20">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>Listening... ({recordingSeconds}s)</span>
          <span className="text-[10px] opacity-80 pl-1 font-mono">[{currentLanguage.native}]</span>
        </div>
      )}

      {/* Processing status badge */}
      {state === 'processing' && (
        <div className="absolute right-full mr-2.5 flex items-center gap-1.5 px-2.5 py-1 bg-amber-400 text-black rounded-xl text-xs font-bold shadow-neo-sm whitespace-nowrap z-20">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Recognizing speech...</span>
        </div>
      )}

      {/* Complete status badge */}
      {state === 'complete' && (
        <div className="absolute right-full mr-2.5 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-neo-sm whitespace-nowrap z-20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Speech recognized!</span>
        </div>
      )}

      {/* Error popover */}
      {state === 'error' && errorMessage && (
        <div className="absolute right-0 bottom-full mb-2 w-64 p-2 bg-rose-100 border-2 border-rose-500 text-rose-900 rounded-xl text-xs font-bold shadow-neo-sm z-30 flex items-start gap-1.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Microphone Action Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={state === 'processing'}
        aria-label={state === 'listening' ? 'Stop voice input' : 'Start voice input'}
        title={
          state === 'listening' 
            ? 'Stop recording (speaks in ' + currentLanguage.native + ')'
            : 'Speak question in ' + currentLanguage.native + ' (' + currentLanguage.english + ')'
        }
        className={`p-2 rounded-xl border-2 border-black transition-all flex items-center justify-center cursor-pointer select-none ${
          state === 'listening'
            ? 'bg-rose-500 text-white shadow-neo animate-bounce'
            : state === 'processing'
            ? 'bg-amber-300 text-black cursor-wait opacity-80'
            : state === 'complete'
            ? 'bg-emerald-400 text-black shadow-neo-sm'
            : 'bg-white hover:bg-neo-yellow text-black shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px]'
        } ${buttonClass}`}
      >
        {state === 'listening' ? (
          <Square className="w-4 h-4 fill-white stroke-[2]" />
        ) : state === 'processing' ? (
          <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
        ) : (
          <Mic className="w-4 h-4 stroke-[2.5]" />
        )}
      </button>
    </div>
  );
}
