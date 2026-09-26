const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const googleService = require('../googleService');

class TextExtractor {
  /**
   * Extract text from buffer or file path based on mimetype/extension.
   * Uses pdfParse / mammoth, and falls back to centralized Google OCR when scanned or image-based.
   * @param {Buffer|string} source - Buffer or filePath
   * @param {string} originalName - Original filename
   * @param {string} mimeType - File mimetype
   * @returns {Promise<string>}
   */
  async extractText(source, originalName = '', mimeType = '') {
    let buffer;
    if (typeof source === 'string') {
      buffer = fs.readFileSync(source);
    } else {
      buffer = source;
    }

    const ext = originalName.split('.').pop().toLowerCase();

    // 1. PDF Documents
    if (ext === 'pdf' || mimeType === 'application/pdf') {
      try {
        const pdfData = await pdfParse(buffer);
        let extracted = (pdfData.text || '').trim();

        // If extracted text is suspiciously short (< 50 chars), it's likely a scanned PDF
        if (extracted.length < 50 && googleService.isAvailable()) {
          console.log('[TextExtractor] Scanned PDF detected, attempting OCR via Google Service...');
          const ocrText = await googleService.ocrDocument(buffer, 'application/pdf');
          if (ocrText && ocrText.trim().length > extracted.length) {
            extracted = ocrText;
          }
        }

        return extracted;
      } catch (err) {
        console.warn('[TextExtractor] PDF parse error, attempting OCR fallback:', err.message);
        if (googleService.isAvailable()) {
          return await googleService.ocrDocument(buffer, 'application/pdf');
        }
        throw new Error(`Failed to parse PDF document: ${err.message}`);
      }
    }

    // 2. DOCX Documents
    if (ext === 'docx' || mimeType.includes('wordprocessingml')) {
      try {
        const docxResult = await mammoth.extractRawText({ buffer });
        return (docxResult.value || '').trim();
      } catch (err) {
        console.error('[TextExtractor] Error extracting DOCX:', err.message);
        throw new Error(`Failed to parse DOCX document: ${err.message}`);
      }
    }

    // 3. Image OCR (PNG, JPG, JPEG, WEBP)
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext) || mimeType.startsWith('image/')) {
      console.log(`[TextExtractor] Image file detected (${ext}), running OCR via centralized Google Service...`);
      return await googleService.ocrDocument(buffer, mimeType || `image/${ext}`);
    }

    // 4. Plain Text / Markdown / TXT
    return buffer.toString('utf8').trim();
  }
}

module.exports = new TextExtractor();
