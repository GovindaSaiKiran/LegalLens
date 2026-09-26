const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB

const groqService = require('../services/groqService');
const urlContentService = require('../services/urlContentService');
const textExtractor = require('../services/document/textExtractor');
const sectionSplitter = require('../services/document/sectionSplitter');
const db = require('../config/database');
const { optionalAuth, requireAuth } = require('../middleware/auth');
const retriever = require('../services/rag/retriever');
const contextAssembly = require('../services/rag/contextAssembly');
const jurisdictionService = require('../services/legal/jurisdictionService');

// ==========================================
// 1. POST /api/analyze/terms
// ==========================================
router.post('/terms', optionalAuth, async (req, res, next) => {
  try {
    let { text, url, title } = req.body;
    let sourceUrl = null;
    let sourceType = 'text';

    if (url && (!text || text.trim().length < 50)) {
      const trimmedUrl = url.trim();
      const extracted = await urlContentService.extractTermsFromUrl(trimmedUrl);
      text = extracted.text;
      title = title || extracted.title || 'Terms & Conditions Analysis';
      sourceUrl = trimmedUrl;
      sourceType = 'url';
    }

    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        error: 'Please provide at least 50 characters of terms text or a valid terms URL.',
        code: 'VALIDATION_ERROR'
      });
    }

    const docTitle = title || 'Terms & Conditions Analysis';
    const structuredResult = await groqService.analyzeTerms(text, { title: docTitle, sourceUrl });
    const sections = sectionSplitter.splitIntoSections(text);

    const analysisId = crypto.randomUUID();
    const now = new Date().toISOString();

    const analysisRecord = {
      id: analysisId,
      user_id: req.user ? req.user.id : null,
      type: 'terms',
      title: docTitle,
      source_type: sourceType,
      source_url: sourceUrl,
      raw_text: text,
      structured_result: { ...structuredResult, sections },
      is_saved: 0,
      created_at: now,
      updated_at: now
    };
    db.createAnalysis(analysisRecord);

    res.json({
      id: analysisId,
      title: docTitle,
      source_type: sourceType,
      source_url: sourceUrl,
      analysis: structuredResult,
      sections,
      created_at: now
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 2. POST /api/analyze/privacy
// ==========================================
router.post('/privacy', optionalAuth, async (req, res, next) => {
  try {
    let { text, url, title } = req.body;
    let sourceUrl = null;
    let sourceType = 'text';

    if (url && (!text || text.trim().length < 50)) {
      const trimmedUrl = url.trim();
      const extracted = await urlContentService.extractTermsFromUrl(trimmedUrl);
      text = extracted.text;
      title = title || extracted.title || 'Privacy Policy Analysis';
      sourceUrl = trimmedUrl;
      sourceType = 'url';
    }

    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        error: 'Please provide privacy policy text or a valid URL.',
        code: 'VALIDATION_ERROR'
      });
    }

    const docTitle = title || 'Privacy Policy Analysis';
    const structuredResult = await groqService.analyzePrivacy(text, { title: docTitle, sourceUrl });
    const sections = sectionSplitter.splitIntoSections(text);

    const analysisId = crypto.randomUUID();
    const now = new Date().toISOString();

    const analysisRecord = {
      id: analysisId,
      user_id: req.user ? req.user.id : null,
      type: 'privacy',
      title: docTitle,
      source_type: sourceType,
      source_url: sourceUrl,
      raw_text: text,
      structured_result: { ...structuredResult, sections },
      is_saved: 0,
      created_at: now,
      updated_at: now
    };
    db.createAnalysis(analysisRecord);

    res.json({
      id: analysisId,
      title: docTitle,
      source_type: sourceType,
      source_url: sourceUrl,
      analysis: structuredResult,
      sections,
      created_at: now
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 3. POST /api/analyze/document
// ==========================================
router.post('/document', optionalAuth, upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]), async (req, res, next) => {
  try {
    let text = req.body.text || '';
    let docTitle = req.body.title || 'Uploaded Legal Document';
    let fileExt = 'txt';

    const uploadedFile = (req.files && (req.files.document?.[0] || req.files.file?.[0])) || req.file;

    if (uploadedFile) {
      docTitle = uploadedFile.originalname;
      text = await textExtractor.extractText(uploadedFile.buffer, uploadedFile.originalname, uploadedFile.mimetype);
      fileExt = uploadedFile.originalname.split('.').pop().toLowerCase();
    }

    if (!text || text.trim().length < 30) {
      return res.status(400).json({ error: 'Please upload a PDF/DOCX/TXT file or provide document text to analyze.' });
    }

    const structuredResult = await groqService.analyzeDocument(text, { filename: docTitle, type: fileExt });
    const sections = sectionSplitter.splitIntoSections(text);

    const analysisId = crypto.randomUUID();
    const now = new Date().toISOString();

    const analysisRecord = {
      id: analysisId,
      user_id: req.user ? req.user.id : null,
      type: 'document',
      title: docTitle,
      source_type: req.file ? 'file_upload' : 'pasted_text',
      source_url: null,
      raw_text: text,
      structured_result: { ...structuredResult, sections },
      is_saved: 0,
      created_at: now,
      updated_at: now
    };
    db.createAnalysis(analysisRecord);

    res.json({
      id: analysisId,
      title: docTitle,
      source_type: analysisRecord.source_type,
      analysis: structuredResult,
      sections,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      created_at: now
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
