const express = require('express');
const router = express.Router();
const geminiVoiceService = require('../services/geminiVoiceService');

/**
 * POST /api/voice/transcribe
 * Speech-to-text transcription.
 * Body: { audio: string (base64), mimeType?: string, language?: string }
 */
router.post('/transcribe', async (req, res, next) => {
  try {
    const { audio, audioBase64, mimeType = 'audio/webm', language = 'en' } = req.body;
    const audioPayload = audio || audioBase64;

    if (!audioPayload) {
      return res.status(400).json({
        error: 'Please provide audio data for transcription.',
        code: 'VALIDATION_ERROR'
      });
    }

    const result = await geminiVoiceService.transcribeAudio(audioPayload, mimeType, language);
    res.json({
      transcript: result.text || '',
      text: result.text || '',
      language: result.language || language
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/voice/speak
 * Text-to-speech audio synthesis.
 * Body: { text: string, language?: string, voiceName?: string }
 */
router.post('/speak', async (req, res, next) => {
  try {
    const { text, language = 'en', voiceName = 'Puck' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        error: 'Please provide text to convert to speech.',
        code: 'VALIDATION_ERROR'
      });
    }

    const result = await geminiVoiceService.synthesizeSpeech(text, language, voiceName);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
