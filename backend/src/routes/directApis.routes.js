const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } });

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
// POST /api/url/analyze
// ==========================================
router.post('/url/analyze', optionalAuth, async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({
        error: 'Please provide a valid website or terms URL to analyze.',
        code: 'VALIDATION_ERROR'
      });
    }

    const trimmedUrl = url.trim();
    const extracted = await urlContentService.extractTermsFromUrl(trimmedUrl);
    const structuredResult = await groqService.analyzeTerms(extracted.text, {
      title: extracted.title || trimmedUrl,
      sourceUrl: trimmedUrl
    });
    const sections = sectionSplitter.splitIntoSections(extracted.text);

    const analysisId = crypto.randomUUID();
    const now = new Date().toISOString();

    const analysisRecord = {
      id: analysisId,
      user_id: req.user ? req.user.id : null,
      type: 'terms',
      title: extracted.title || 'URL Terms Analysis',
      source_type: 'url',
      source_url: url,
      raw_text: extracted.text,
      structured_result: { ...structuredResult, sections },
      is_saved: 0,
      created_at: now,
      updated_at: now
    };
    db.createAnalysis(analysisRecord);

    res.json({
      id: analysisId,
      title: analysisRecord.title,
      source_type: 'url',
      source_url: url,
      analysis: structuredResult,
      sections,
      created_at: now
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// POST /api/document/ask
// ==========================================
router.post('/document/ask', optionalAuth, async (req, res, next) => {
  try {
    const { documentId, documentText, question, conversationHistory = [] } = req.body;

    if (!question || question.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide a question to ask the document.' });
    }

    let textToQuery = documentText || '';
    if (!textToQuery && documentId) {
      const doc = db.getAnalysisById(documentId);
      if (doc && doc.raw_text) {
        textToQuery = doc.raw_text;
      }
    }

    if (!textToQuery || textToQuery.trim().length < 20) {
      return res.status(400).json({ error: 'Document text could not be located. Provide documentText or valid documentId.' });
    }

    const answer = await groqService.chatWithDocument(textToQuery, question, conversationHistory);

    // Save message to history if documentId exists
    if (documentId) {
      const userMsgId = crypto.randomUUID();
      const botMsgId = crypto.randomUUID();
      const now = new Date().toISOString();

      db.saveChatMessage({
        id: userMsgId,
        analysis_id: documentId,
        user_id: req.user ? req.user.id : null,
        role: 'user',
        content: question,
        citations: null,
        created_at: now
      });

      db.saveChatMessage({
        id: botMsgId,
        analysis_id: documentId,
        user_id: req.user ? req.user.id : null,
        role: 'assistant',
        content: answer.answer,
        citations: answer.citation ? JSON.stringify([answer.citation]) : null,
        created_at: now
      });
    }

    res.json(answer);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// POST /api/document/compare
// ==========================================
router.post('/document/compare', optionalAuth, upload.fields([
  { name: 'documentA', maxCount: 1 },
  { name: 'documentB', maxCount: 1 }
]), async (req, res, next) => {
  try {
    let docAText = req.body.docA || req.body.textA || '';
    let docBText = req.body.docB || req.body.textB || '';
    let titleA = req.body.titleA || 'Document A';
    let titleB = req.body.titleB || 'Document B';

    if (req.files) {
      if (req.files.documentA && req.files.documentA[0]) {
        const fileA = req.files.documentA[0];
        titleA = fileA.originalname;
        docAText = await textExtractor.extractText(fileA.buffer, fileA.originalname, fileA.mimetype);
      }
      if (req.files.documentB && req.files.documentB[0]) {
        const fileB = req.files.documentB[0];
        titleB = fileB.originalname;
        docBText = await textExtractor.extractText(fileB.buffer, fileB.originalname, fileB.mimetype);
      }
    }

    if (!docAText || docAText.trim().length < 30 || !docBText || docBText.trim().length < 30) {
      return res.status(400).json({ error: 'Please provide both Document A and Document B with sufficient text to compare.' });
    }

    const comparisonResult = await groqService.compareDocuments(docAText, docBText, { titleA, titleB });

    const analysisId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newAnalysis = {
      id: analysisId,
      user_id: req.user ? req.user.id : null,
      type: 'comparison',
      title: `${titleA} vs ${titleB}`,
      source_type: 'comparison',
      source_url: null,
      raw_text: `=== DOC A (${titleA}) ===\n${docAText}\n\n=== DOC B (${titleB}) ===\n${docBText}`,
      structured_result: { ...comparisonResult, titleA, titleB },
      is_saved: 0,
      created_at: now,
      updated_at: now
    };
    db.createAnalysis(newAnalysis);

    res.json({
      id: analysisId,
      titleA,
      titleB,
      comparison: comparisonResult,
      created_at: now
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// POST /api/glossary/explain
// ==========================================
router.post('/glossary/explain', async (req, res, next) => {
  try {
    const { term, category = 'General', context = '' } = req.body;
    if (!term || term.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide a legal term to explain.' });
    }

    const explanation = await groqService.explainGlossaryTerm(term, category, context);
    res.json(explanation);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// POST /api/action-plan
// ==========================================
router.post('/action-plan', optionalAuth, async (req, res, next) => {
  try {
    const { documentText, analysis = {} } = req.body;
    if (!documentText && !analysis.summary) {
      return res.status(400).json({ error: 'Please provide document text or analysis summary to generate an action plan.' });
    }

    const actionPlan = await groqService.generateActionPlan(documentText || analysis.summary || '', analysis);
    res.json(actionPlan);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// POST /api/lawyer-questions
// ==========================================
router.post('/lawyer-questions', optionalAuth, async (req, res, next) => {
  try {
    const { documentText, analysis = {} } = req.body;
    if (!documentText && (!analysis.important_points || analysis.important_points.length === 0)) {
      return res.status(400).json({ error: 'Please provide document text or analysis points to generate lawyer questions.' });
    }

    const lawyerQuestions = await groqService.generateLawyerQuestions(documentText || '', analysis);
    res.json(lawyerQuestions);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
