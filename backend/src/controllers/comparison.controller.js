const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const config = require('../config');
const textExtractor = require('../services/document/textExtractor');
const semanticComparer = require('../services/comparison/semanticComparer');

exports.compareDocuments = async (req, res, next) => {
  try {
    let docAText = req.body.textA || '';
    let docBText = req.body.textB || '';
    let titleA = req.body.titleA || 'Document A';
    let titleB = req.body.titleB || 'Document B';

    // Check if files were uploaded via multer
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
      return res.status(400).json({ error: 'Please provide both Document A and Document B with valid content for comparison.' });
    }

    console.log(`[ComparisonController] Comparing ${titleA} vs ${titleB}`);
    const comparisonResult = await semanticComparer.compare(docAText, docBText, { titleA, titleB });

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
      structured_result: {
        ...comparisonResult,
        titleA,
        titleB
      },
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
};

exports.compareDemo = async (req, res, next) => {
  try {
    const { type = 'terms' } = req.body;
    let fileAName, fileBName, titleA, titleB;

    if (type === 'employment') {
      fileAName = 'employment_agreement.txt';
      fileBName = 'employment_agreement_v2.txt';
      titleA = 'Original Employment Agreement (v1.0)';
      titleB = 'Revised Employment Counter-Offer (v2.0)';
    } else {
      fileAName = 'saas_terms_and_conditions.txt';
      fileBName = 'saas_terms_v2.txt';
      titleA = 'CloudScale Pro Terms v2.4 (Original)';
      titleB = 'CloudScale Pro Terms v3.0 (Revised)';
    }

    const pathA = path.join(config.demoDocumentsPath, fileAName);
    const pathB = path.join(config.demoDocumentsPath, fileBName);

    if (!fs.existsSync(pathA) || !fs.existsSync(pathB)) {
      return res.status(404).json({ error: 'Demo comparison files could not be located.' });
    }

    const docAText = fs.readFileSync(pathA, 'utf8');
    const docBText = fs.readFileSync(pathB, 'utf8');

    const comparisonResult = await semanticComparer.compare(docAText, docBText, { titleA, titleB });

    const analysisId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newAnalysis = {
      id: analysisId,
      user_id: req.user ? req.user.id : null,
      type: 'comparison',
      title: `${titleA} vs ${titleB}`,
      source_type: 'demo_comparison',
      source_url: null,
      raw_text: `=== DOC A (${titleA}) ===\n${docAText}\n\n=== DOC B (${titleB}) ===\n${docBText}`,
      structured_result: {
        ...comparisonResult,
        titleA,
        titleB
      },
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
};
