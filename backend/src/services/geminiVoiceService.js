const config = require('../config');

class GeminiVoiceService {
  constructor() {
    this.apiKey = config.geminiVoiceApiKey || process.env.GEMINI_VOICE_API_KEY;
    this.sttModel = 'gemini-2.5-flash';
    this.ttsModel = 'gemini-2.5-flash-preview-tts';
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Helper: Wrap raw 16-bit linear PCM audio in a valid 44-byte RIFF/WAV header
   */
  _pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const dataSize = pcmBuffer.length;
    const buffer = Buffer.alloc(44 + dataSize);

    // RIFF chunk descriptor
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);

    // "fmt " sub-chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // subchunk1size (16 for PCM)
    buffer.writeUInt16LE(1, 20);  // audioFormat (1 for PCM)
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);

    // "data" sub-chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
    pcmBuffer.copy(buffer, 44);

    return buffer;
  }

  /**
   * Speech-to-Text: Transcribes user-recorded audio using Gemini Voice Key.
   * @param {string} audioBase64 - Base64 encoded audio
   * @param {string} mimeType - e.g. 'audio/webm', 'audio/wav', 'audio/ogg'
   * @param {string} language - target locale or code (e.g. 'te', 'hi', 'en', 'en-IN')
   * @returns {Promise<{ text: string, language: string }>}
   */
  async transcribeAudio(audioBase64, mimeType = 'audio/webm', language = 'en') {
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      const err = new Error('No audio data provided for transcription.');
      err.code = 'VOICE_TRANSCRIPTION_ERROR';
      err.statusCode = 400;
      throw err;
    }

    if (!this.isAvailable()) {
      const err = new Error('GEMINI_VOICE_API_KEY is not configured on the server.');
      err.code = 'VOICE_CONFIG_ERROR';
      err.statusCode = 500;
      throw err;
    }

    // Clean data URL prefix if present (e.g. data:audio/webm;base64,...)
    let cleanBase64 = audioBase64;
    let actualMime = mimeType;
    if (audioBase64.includes('base64,')) {
      const parts = audioBase64.split('base64,');
      const headerPart = parts[0];
      cleanBase64 = parts[1];
      const match = headerPart.match(/data:([^;]+);/);
      if (match) actualMime = match[1];
    }

    // Normalize audio mime type for Gemini
    if (actualMime.includes('webm')) actualMime = 'audio/webm';
    else if (actualMime.includes('wav')) actualMime = 'audio/wav';
    else if (actualMime.includes('mp3') || actualMime.includes('mpeg')) actualMime = 'audio/mp3';
    else if (actualMime.includes('ogg')) actualMime = 'audio/ogg';

    const prompt = `You are a speech-to-text transcription engine for LegalLens.
Transcribe the user's spoken legal question verbatim in the language spoken.
RULES:
1. Return ONLY the transcription text.
2. Do not add conversational phrases, quotes, or timestamps.
3. If the audio is silence or unrecognizable background noise, return [NO_SPEECH].`;

    try {
      const candidateModels = [this.sttModel, 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.8-flash'];
      let data = null;
      let lastError = null;

      for (const model of candidateModels) {
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: prompt },
                    { inlineData: { mimeType: actualMime, data: cleanBase64 } }
                  ]
                }]
              })
            });

            if (res.status === 503 || res.status === 429) {
              const errBody = await res.text();
              console.warn(`[GeminiVoiceService] STT Model ${model} attempt ${attempt} returned HTTP ${res.status}, waiting...`);
              lastError = new Error(`HTTP ${res.status}: ${errBody}`);
              await new Promise(r => setTimeout(r, 600));
              continue;
            }

            if (res.status === 404) {
              const errBody = await res.text();
              console.warn(`[GeminiVoiceService] STT Model ${model} returned HTTP 404, falling back...`);
              lastError = new Error(`HTTP 404: ${errBody}`);
              break;
            }

            if (!res.ok) {
              const errBody = await res.text();
              console.error(`[GeminiVoiceService] STT HTTP ${res.status}:`, errBody);
              lastError = new Error(`HTTP ${res.status}: ${errBody}`);
              break;
            }

            data = await res.json();
            break;
          } catch (err) {
            lastError = err;
          }
        }
        if (data) break;
      }

      if (!data) {
        throw new Error(`All STT models unavailable: ${lastError?.message}`);
      }

      let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      if (text.includes('[NO_SPEECH]')) {
        text = '';
      }

      return {
        text,
        language
      };
    } catch (err) {
      if (err.code) throw err;
      const wrapErr = new Error(`Voice recognition failed. Please try speaking again: ${err.message}`);
      wrapErr.code = 'VOICE_TRANSCRIPTION_ERROR';
      wrapErr.statusCode = 502;
      throw wrapErr;
    }
  }

  /**
   * Text-to-Speech: Synthesize spoken audio for legal explanations using Gemini Voice Key.
   * @param {string} text - Legal text to speak
   * @param {string} language - Language code ('en', 'te', 'hi', etc.)
   * @param {string} voiceName - e.g. 'Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede'
   * @returns {Promise<{ audioBase64: string, mimeType: string, format: string }>}
   */
  async synthesizeSpeech(text, language = 'en', voiceName = 'Puck') {
    if (!text || typeof text !== 'string' || !text.trim()) {
      const err = new Error('No text provided for speech synthesis.');
      err.code = 'VOICE_GENERATION_ERROR';
      err.statusCode = 400;
      throw err;
    }

    if (!this.isAvailable()) {
      const err = new Error('GEMINI_VOICE_API_KEY is not configured on the server.');
      err.code = 'VOICE_CONFIG_ERROR';
      err.statusCode = 500;
      throw err;
    }

    // Limit text length to prevent giant audio files
    const cleanText = text.trim().slice(0, 1000);

    const prompt = `Please read the following text aloud clearly and naturally:
${cleanText}`;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.ttsModel}:generateContent?key=${this.apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voiceName || 'Puck'
                }
              }
            }
          }
        })
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error(`[GeminiVoiceService] TTS HTTP ${res.status}:`, errBody);
        const err = new Error(`Voice generation error (${res.status}): ${errBody}`);
        err.code = 'VOICE_GENERATION_ERROR';
        err.statusCode = 502;
        throw err;
      }

      const data = await res.json();
      const audioPart = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      if (!audioPart || !audioPart.data) {
        throw new Error('Gemini TTS returned no audio stream.');
      }

      // Convert PCM buffer to standard playable WAV buffer
      const pcmBuffer = Buffer.from(audioPart.data, 'base64');
      const wavBuffer = this._pcmToWav(pcmBuffer, 24000, 1, 16);

      return {
        audioBase64: wavBuffer.toString('base64'),
        mimeType: 'audio/wav',
        format: 'wav',
        language
      };
    } catch (err) {
      if (err.code) throw err;
      const wrapErr = new Error(`Voice synthesis failed: ${err.message}`);
      wrapErr.code = 'VOICE_GENERATION_ERROR';
      wrapErr.statusCode = 502;
      throw wrapErr;
    }
  }
}

const geminiVoiceService = new GeminiVoiceService();
module.exports = geminiVoiceService;
