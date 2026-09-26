const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const config = require('../config');
const { getAIProvider } = require('../services/ai');
const urlContentService = require('../services/urlContentService');
const sectionSplitter = require('../services/document/sectionSplitter');

exports.analyzeUrl = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({
        error: 'Please provide a valid Terms & Conditions URL.',
        code: 'VALIDATION_ERROR'
      });
    }

    const trimmedUrl = url.trim();
    // Retrieve and extract content using dedicated urlContentService
    const extracted = await urlContentService.extractTermsFromUrl(trimmedUrl);

    const ai = getAIProvider();
    const structuredResult = await ai.analyzeTerms(extracted.text, {
      title: extracted.title,
      sourceUrl: trimmedUrl
    });
    const sections = sectionSplitter.splitIntoSections(extracted.text);

    // Save to database
    const analysisId = crypto.randomUUID();
    const now = new Date().toISOString();
    const newAnalysis = {
      id: analysisId,
      user_id: req.user ? req.user.id : null,
      type: 'terms',
      title: extracted.title || 'Terms & Conditions Analysis',
      source_type: 'url',
      source_url: trimmedUrl,
      raw_text: extracted.text,
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
      title: newAnalysis.title,
      source_type: 'url',
      source_url: trimmedUrl,
      analysis: structuredResult,
      sections,
      created_at: now
    });
  } catch (err) {
    next(err);
  }
};

exports.analyzeText = async (req, res, next) => {
  try {
    const { text, title } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length < 50) {
      return res.status(400).json({
        error: 'Please provide at least 50 characters of legal or terms text to analyze.',
        code: 'VALIDATION_ERROR'
      });
    }

    const cleanText = text.trim();
    const docTitle = title && typeof title === 'string' && title.trim() ? title.trim() : 'Terms & Conditions Analysis';

    const ai = getAIProvider();
    const structuredResult = await ai.analyzeTerms(cleanText, { title: docTitle });
    const sections = sectionSplitter.splitIntoSections(cleanText);

    const analysisId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newAnalysis = {
      id: analysisId,
      user_id: req.user ? req.user.id : null,
      type: 'terms',
      title: docTitle,
      source_type: 'text',
      source_url: null,
      raw_text: cleanText,
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
      source_type: 'text',
      analysis: structuredResult,
      sections,
      created_at: now
    });
  } catch (err) {
    next(err);
  }
};

exports.analyzeDemo = async (req, res, next) => {
  try {
    const { id } = req.params;
    let fileName = 'saas_terms_and_conditions.txt';
    let docTitle = 'CloudScale Pro Terms of Service (Sample)';

    if (id === 'privacy-policy') {
      fileName = 'privacy_policy.txt';
      docTitle = 'PulseHealth Mobile App Privacy Policy (Sample)';
    } else if (id === 'rental-agreement') {
      fileName = 'residential_rental_agreement.txt';
      docTitle = 'Residential Tenancy Agreement (Sample)';
    } else if (id === 'employment-agreement') {
      fileName = 'employment_agreement.txt';
      docTitle = 'Senior Software Engineer Employment Agreement (Sample)';
    }

    const filePath = path.join(config.demoDocumentsPath, fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Demo document file not found.' });
    }

    const text = fs.readFileSync(filePath, 'utf8');
    const ai = getAIProvider();
    const structuredResult = await ai.analyzeTerms(text, { isDemo: true });
    const sections = sectionSplitter.splitIntoSections(text);

    const analysisId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newAnalysis = {
      id: analysisId,
      user_id: req.user ? req.user.id : null,
      type: 'terms',
      title: docTitle,
      source_type: 'demo',
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
      source_type: 'demo',
      analysis: structuredResult,
      sections,
      created_at: now
    });
  } catch (err) {
    next(err);
  }
};
