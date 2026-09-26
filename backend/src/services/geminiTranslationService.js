const config = require('../config');

const SUPPORTED_LANGUAGES = [
  { code: 'en', locale: 'en-IN', native: 'English', english: 'English' },
  { code: 'te', locale: 'te-IN', native: 'తెలుగు', english: 'Telugu' },
  { code: 'hi', locale: 'hi-IN', native: 'हिन्दी', english: 'Hindi' },
  { code: 'ta', locale: 'ta-IN', native: 'தமிழ்', english: 'Tamil' },
  { code: 'kn', locale: 'kn-IN', native: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'ml', locale: 'ml-IN', native: 'മലയാളം', english: 'Malayalam' },
  { code: 'mr', locale: 'mr-IN', native: 'मराठी', english: 'Marathi' },
  { code: 'bn', locale: 'bn-IN', native: 'বাংলা', english: 'Bengali' }
];

class GeminiTranslationService {
  constructor() {
    this.apiKey = config.geminiTranslationApiKey || process.env.GEMINI_TRANSLATION_API_KEY;
    this.model = 'gemini-2.5-flash';
    // In-memory cache: key = `${idOrHash}_${targetLanguage}`
    this.cache = new Map();
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  getLanguageInfo(code) {
    if (!code) return SUPPORTED_LANGUAGES[0];
    const normalized = code.toLowerCase().split('-')[0];
    return SUPPORTED_LANGUAGES.find(l => l.code === normalized) || SUPPORTED_LANGUAGES[0];
  }

  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Translate plain text to target language using Gemini Translation Key.
   */
  async translateText(text, targetLanguage = 'en') {
    if (!text || typeof text !== 'string' || !text.trim()) {
      return { translatedText: '' };
    }

    const lang = this.getLanguageInfo(targetLanguage);
    // English optimization (Requirement 10): return original without calling API
    if (lang.code === 'en') {
      return { translatedText: text, targetLanguage: 'en' };
    }

    if (!this.isAvailable()) {
      const err = new Error('GEMINI_TRANSLATION_API_KEY is not configured on the server.');
      err.code = 'TRANSLATION_CONFIG_ERROR';
      err.statusCode = 500;
      throw err;
    }

    // Check cache (Requirement 13)
    const cacheKey = `text_${text.slice(0, 100)}_${text.length}_${lang.code}`;
    if (this.cache.has(cacheKey)) {
      return { translatedText: this.cache.get(cacheKey), targetLanguage: lang.code, cached: true };
    }

    const prompt = `You are LegalLens Legal Translation Engine.
Translate the following legal explanation text accurately into ${lang.english} (${lang.native}).

LEGAL FIDELITY RULES:
1. Preserve all legal meaning, caveats, and terms of explanation exactly.
2. Keep all numbers, monetary values (e.g., ₹500, ₹50,000, $100), dates, percentages (e.g., 10%, 99.9%), deadlines (e.g., 7 days, 60 days, 12 months), company/brand names, URLs, and clause references IDENTICAL and unchanged.
3. Use natural, fluent phrasing in the native script of ${lang.native}.
4. Return ONLY the direct translation without preamble, commentary, or quotes.

TEXT TO TRANSLATE:
"""
${text}
"""`;

    try {
      const data = await this._callGeminiWithFallback({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1
        }
      });

      const translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;

      // Cache result
      this.cache.set(cacheKey, translated);

      return {
        translatedText: translated,
        targetLanguage: lang.code,
        languageName: lang.native
      };
    } catch (err) {
      if (err.code) throw err;
      const wrapErr = new Error(`Translation failed: ${err.message}`);
      wrapErr.code = 'TRANSLATION_API_ERROR';
      wrapErr.statusCode = 502;
      throw wrapErr;
    }
  }

  /**
   * Internal helper: Call Gemini API with automatic model fallback and retry for 503 / 429 demand spikes.
   */
  async _callGeminiWithFallback(body) {
    const candidateModels = [this.model, 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.8-flash'];
    let lastError = null;

    for (const model of candidateModels) {
      // Try each model with up to 2 attempts for transient 503 / 429 spikes
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });

          if (res.status === 503 || res.status === 429) {
            const errBody = await res.text();
            console.warn(`[GeminiTranslationService] Model ${model} attempt ${attempt} returned HTTP ${res.status} (High Demand), waiting briefly...`);
            lastError = new Error(`HTTP ${res.status}: ${errBody}`);
            // Wait 600ms before retrying on high-demand spikes
            await new Promise(r => setTimeout(r, 600));
            continue;
          }

          if (res.status === 404) {
            const errBody = await res.text();
            console.warn(`[GeminiTranslationService] Model ${model} returned HTTP 404, attempting fallback model...`);
            lastError = new Error(`HTTP 404: ${errBody}`);
            break; // Skip retry on 404, go to next candidate model
          }

          if (!res.ok) {
            const errBody = await res.text();
            console.error(`[GeminiTranslationService] Model ${model} HTTP ${res.status}:`, errBody);
            lastError = new Error(`HTTP ${res.status}: ${errBody}`);
            break;
          }

          return await res.json();
        } catch (err) {
          lastError = err;
        }
      }
    }

    const err = new Error(`Translation service temporarily unavailable across Gemini models: ${lastError?.message}`);
    err.code = 'TRANSLATION_API_ERROR';
    err.statusCode = 502;
    throw err;
  }

  /**
   * Translate an entire structured legal analysis object into target language.
   * Translates: summary, what_you_are_agreeing_to, important_points, obligations,
   * deadlines, areas_to_review, questions_for_lawyer, information_to_prepare, action_checklist.
   * Preserves: IDs, technical keys, numerical values, original clause references.
   */
  async translateAnalysis(analysis, targetLanguage = 'en', analysisId = null) {
    if (!analysis) {
      return { translatedAnalysis: null };
    }

    const lang = this.getLanguageInfo(targetLanguage);

    // English optimization (Requirement 10)
    if (lang.code === 'en') {
      return {
        translatedAnalysis: analysis,
        targetLanguage: 'en',
        languageName: 'English',
        isOriginal: true
      };
    }

    if (!this.isAvailable()) {
      const err = new Error('GEMINI_TRANSLATION_API_KEY is not configured on the server.');
      err.code = 'TRANSLATION_CONFIG_ERROR';
      err.statusCode = 500;
      throw err;
    }

    // Check cache (Requirement 13)
    const cacheKey = `analysis_${analysisId || analysis.id || 'current'}_${lang.code}`;
    if (this.cache.has(cacheKey)) {
      return {
        translatedAnalysis: this.cache.get(cacheKey),
        targetLanguage: lang.code,
        languageName: lang.native,
        cached: true
      };
    }

    // Extract only user-facing fields for translation
    const payloadToTranslate = {
      summary: analysis.summary || '',
      what_you_are_agreeing_to: analysis.what_you_are_agreeing_to || [],
      important_points: (analysis.important_points || []).map(p => ({
        category: p.category,
        tag: p.tag,
        title: p.title,
        finding: p.finding,
        relevance: p.relevance,
        clauseReference: p.clauseReference,
        originalClause: p.originalClause
      })),
      obligations: analysis.obligations || [],
      deadlines: analysis.deadlines || [],
      areas_to_review: analysis.areas_to_review || [],
      questions_for_lawyer: analysis.questions_for_lawyer || [],
      information_to_prepare: analysis.information_to_prepare || [],
      action_checklist: analysis.action_checklist || []
    };

    const systemPrompt = `You are LegalLens Legal Document Translation Engine.
Your task is to translate the JSON object containing user-facing legal explanations into ${lang.english} (${lang.native}).

STRICT FIDELITY RULES:
1. Translate all explanatory texts, titles, findings, and advice into fluent, natural ${lang.native} script.
2. DO NOT change JSON keys, categories, tags, or structure. Return matching JSON keys.
3. Keep all numbers, monetary amounts (e.g. ₹500, ₹50,000), dates, percentages, deadlines (e.g. 7 days, 60 days, 12 months), and company names EXACT and accurate.
4. Output MUST be valid JSON only with NO markdown fences.`;

    const userPrompt = `Translate this legal explanation JSON into ${lang.english} (${lang.native}):
${JSON.stringify(payloadToTranslate, null, 2)}`;

    try {
      const data = await this._callGeminiWithFallback({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      });

      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      let parsed = JSON.parse(rawText);

      // Merge translated fields back onto the original analysis so no metadata/technical fields are lost
      const translatedResult = {
        ...analysis,
        summary: parsed.summary || analysis.summary,
        what_you_are_agreeing_to: parsed.what_you_are_agreeing_to || analysis.what_you_are_agreeing_to,
        important_points: parsed.important_points || analysis.important_points,
        obligations: parsed.obligations || analysis.obligations,
        deadlines: parsed.deadlines || analysis.deadlines,
        areas_to_review: parsed.areas_to_review || analysis.areas_to_review,
        questions_for_lawyer: parsed.questions_for_lawyer || analysis.questions_for_lawyer,
        information_to_prepare: parsed.information_to_prepare || analysis.information_to_prepare,
        translatedDisclaimer: `Informational translation in ${lang.native} (${lang.english}); original terms remain authoritative.`,
        language: lang.code,
        languageName: lang.native
      };

      // Cache result
      this.cache.set(cacheKey, translatedResult);

      return {
        translatedAnalysis: translatedResult,
        targetLanguage: lang.code,
        languageName: lang.native
      };
    } catch (err) {
      if (err.code) throw err;
      const wrapErr = new Error(`Translation failed: ${err.message}`);
      wrapErr.code = 'TRANSLATION_API_ERROR';
      wrapErr.statusCode = 502;
      throw wrapErr;
    }
  }
}

const geminiTranslationService = new GeminiTranslationService();
module.exports = geminiTranslationService;
