const express = require('express');
const router = express.Router();
const geminiTranslationService = require('../services/geminiTranslationService');

/**
 * GET /api/translate/languages
 * Returns list of supported languages with native names and codes.
 */
router.get('/languages', (req, res) => {
  res.json({
    languages: geminiTranslationService.getSupportedLanguages()
  });
});

/**
 * POST /api/translate
 * Translates either plain text or a full structured legal analysis object.
 * Request body:
 * {
 *   text?: string,
 *   analysis?: object,
 *   targetLanguage: string (e.g. 'te', 'hi', 'ta', 'kn', 'ml', 'mr', 'bn', 'en'),
 *   analysisId?: string
 * }
 */
router.post('/', async (req, res, next) => {
  try {
    const { text, analysis, targetLanguage = 'en', analysisId } = req.body;

    if (!targetLanguage) {
      return res.status(400).json({
        error: 'Please specify a target language (e.g., "te", "hi", "ta", "en").',
        code: 'VALIDATION_ERROR'
      });
    }

    // If a full structured analysis object is provided:
    if (analysis && typeof analysis === 'object') {
      const result = await geminiTranslationService.translateAnalysis(analysis, targetLanguage, analysisId);
      return res.json(result);
    }

    // If plain text is provided:
    if (text && typeof text === 'string') {
      const result = await geminiTranslationService.translateText(text, targetLanguage);
      return res.json(result);
    }

    return res.status(400).json({
      error: 'Please provide either "text" or "analysis" to translate.',
      code: 'VALIDATION_ERROR'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
