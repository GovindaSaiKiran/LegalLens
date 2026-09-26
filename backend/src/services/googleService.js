/**
 * Centralized Google API Service for LegalLens
 * Powers document/image text extraction and OCR using the single centralized GOOGLE_API_KEY.
 */

const config = require('../config');

class GoogleService {
  constructor() {
    this.apiKey = config.googleApiKey;
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Extract text from an image or scanned document page using Google Cloud Vision API.
   * @param {Buffer} buffer - Raw file/image buffer
   * @returns {Promise<string>} Extracted OCR text
   */
  async ocrDocument(buffer, mimeType = 'image/jpeg') {
    if (!this.isAvailable()) {
      console.warn('[GoogleService] Google API key not configured.');
      return '';
    }

    const base64Data = buffer.toString('base64');

    // 1. Try Google Cloud Vision API endpoint
    try {
      const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`;
      const payload = {
        requests: [
          {
            image: { content: base64Data },
            features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
          }
        ]
      };

      const res = await fetch(visionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const fullText = data.responses?.[0]?.fullTextAnnotation?.text;
        if (fullText && fullText.trim().length > 0) {
          console.log(`[GoogleService] Successfully extracted ${fullText.length} characters via Cloud Vision.`);
          return fullText;
        }
      }
    } catch (err) {
      console.warn('[GoogleService] Vision API call failed, trying multimodal endpoint:', err.message);
    }

    // 2. Fallback to Google Generative Language OCR endpoint
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
      const geminiPayload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: 'Extract and transcribe all readable text from this document image exactly as written. Return ONLY the extracted text.'
              },
              {
                inlineData: {
                  mimeType: mimeType.startsWith('image/') ? mimeType : 'image/jpeg',
                  data: base64Data
                }
              }
            ]
          }
        ]
      };

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload)
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const extracted = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (extracted && extracted.trim().length > 0) {
          console.log(`[GoogleService] Successfully extracted ${extracted.length} characters via Google Multimodal OCR.`);
          return extracted;
        }
      }
    } catch (fallbackErr) {
      console.warn('[GoogleService] Fallback OCR extraction failed:', fallbackErr.message);
    }

    return '';
  }
}

const googleService = new GoogleService();

module.exports = googleService;
