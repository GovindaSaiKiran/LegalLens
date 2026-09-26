const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const config = require('../config');
const { getAIProvider } = require('../services/ai');
const textExtractor = require('../services/document/textExtractor');
const sectionSplitter = require('../services/document/sectionSplitter');

exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file && !req.body.text) {
      return res.status(400).json({ error: 'Please upload a PDF, DOCX, or TXT file, or provide document text.' });
    }

    let text = '';
    let docTitle = 'Uploaded Legal Document';
    let fileExt = 'txt';

    if (req.file) {
      docTitle = req.file.originalname;
      fileExt = path.extname(req.file.originalname).replace('.', '').toLowerCase();
      console.log(`[DocumentController] Processing uploaded file: ${req.file.originalname} (${fileExt})`);

      text = await textExtractor.extractText(req.file.buffer, req.file.originalname, req.file.mimetype);
    } else {
      text = req.body.text;
      docTitle = req.body.title || 'Pasted Legal Document';
    }

    if (!text || text.trim().length < 50) {
      return res.status(400).json({ error: 'The document appears to be empty or contains insufficient text for analysis.' });
    }

    const ai = getAIProvider();
    const structuredResult = await ai.analyzeDocument(text, {
      filename: docTitle,
      type: fileExt
    });

    const sections = sectionSplitter.splitIntoSections(text);

    const analysisId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newAnalysis = {
      id: analysisId,
      user_id: req.user ? req.user.id : null,
      type: 'document',
      title: docTitle,
      source_type: req.file ? 'file_upload' : 'pasted_text',
      source_url: null,
      raw_text: text,
      structured_result: {
        ...structuredResult,
        sections
      },
      is_saved: 0,
      created_at: now,
      updated_at: now
    };

    db.createAnalysis(newAnalysis);

    res.json({
      id: analysisId,
      title: docTitle,
      source_type: newAnalysis.source_type,
      analysis: structuredResult,
      sections,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      created_at: now
    });
  } catch (err) {
    next(err);
  }
};

exports.chatWithDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question } = req.body;

    if (!question || question.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide a question to ask this document.' });
    }

    const analysis = db.getAnalysisById(id);
    if (!analysis || !analysis.raw_text) {
      return res.status(404).json({ error: 'Analyzed document not found.' });
    }

    const history = db.getChatHistory(id);
    const ai = getAIProvider();

    // Answer strictly grounded in the document
    const answerResult = await ai.chatWithDocument(analysis.raw_text, question, history);

    // Save user question
    const userMsgId = crypto.randomUUID();
    const now = new Date().toISOString();
    db.addChatMessage({
      id: userMsgId,
      analysis_id: id,
      user_id: req.user ? req.user.id : null,
      role: 'user',
      content: question,
      citations: null,
      created_at: now
    });

    // Save assistant answer
    const botMsgId = crypto.randomUUID();
    db.addChatMessage({
      id: botMsgId,
      analysis_id: id,
      user_id: req.user ? req.user.id : null,
      role: 'assistant',
      content: answerResult.answer,
      citations: answerResult.citation ? [answerResult.citation] : [],
      created_at: new Date().toISOString()
    });

    res.json({
      id: botMsgId,
      question,
      answer: answerResult.answer,
      grounded: answerResult.grounded,
      clause_found: answerResult.clause_found,
      citation: answerResult.citation,
      disclaimer: answerResult.disclaimer || 'LegalLens provides general legal information and document analysis, not legal advice.'
    });
  } catch (err) {
    next(err);
  }
};

exports.getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const analysis = db.getAnalysisById(id);
    if (!analysis) {
      return res.status(404).json({ error: 'Document analysis not found.' });
    }

    res.json({
      id: analysis.id,
      title: analysis.title,
      type: analysis.type,
      source_type: analysis.source_type,
      source_url: analysis.source_url,
      raw_text: analysis.raw_text,
      analysis: analysis.structured_result,
      sections: analysis.structured_result.sections || [],
      is_saved: analysis.is_saved === 1,
      created_at: analysis.created_at
    });
  } catch (err) {
    next(err);
  }
};

exports.getChatHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const history = db.getChatHistory(id);
    res.json({ history });
  } catch (err) {
    next(err);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    db.deleteAnalysis(id, req.user ? req.user.id : null);
    res.json({
      message: 'Document and analysis permanently deleted.',
      id
    });
  } catch (err) {
    next(err);
  }
};
