const crypto = require('crypto');
const db = require('../config/database');
const { getAIProvider } = require('../services/ai');
const retriever = require('../services/rag/retriever');
const contextAssembly = require('../services/rag/contextAssembly');
const jurisdictionService = require('../services/legal/jurisdictionService');
const knowledgeBase = require('../services/rag/legalKnowledgeBase');

exports.ask = async (req, res, next) => {
  try {
    const { question, jurisdiction = 'india', state = 'Telangana', category } = req.body;

    if (!question || question.trim().length < 5) {
      return res.status(400).json({ error: 'Please enter a legal question to ask the knowledge assistant.' });
    }

    // 1. Detect category if not provided or set to 'other'
    const detectedCategory = (!category || category === 'other') 
      ? jurisdictionService.detectCategory(question) 
      : category;

    // 2. Retrieve verified legal sources
    const matchedSources = retriever.retrieve(question, jurisdiction, detectedCategory, 4);

    // 3. Assemble context
    const { sourceCitations } = contextAssembly.assemble(matchedSources);

    // 4. Generate grounded answer via AI Provider
    const ai = getAIProvider();
    const answerResult = await ai.answerLegalRAG(
      question,
      jurisdiction,
      detectedCategory,
      matchedSources,
      { state }
    );

    // 5. Store in database
    const analysisId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newAnalysis = {
      id: analysisId,
      user_id: req.user ? req.user.id : null,
      type: 'rag',
      title: question.length > 60 ? question.slice(0, 60) + '...' : question,
      source_type: 'rag_query',
      source_url: null,
      raw_text: question,
      structured_result: {
        ...answerResult,
        jurisdiction,
        state,
        detectedCategory,
        citations: sourceCitations
      },
      is_saved: 0,
      created_at: now,
      updated_at: now
    };

    db.createAnalysis(newAnalysis);

    res.json({
      id: analysisId,
      question,
      jurisdiction,
      state,
      category: detectedCategory,
      result: answerResult,
      citations: sourceCitations,
      created_at: now
    });
  } catch (err) {
    next(err);
  }
};

exports.getJurisdictions = (req, res) => {
  const jurisdictions = jurisdictionService.getAllJurisdictions();
  res.json({ jurisdictions });
};

exports.getSources = (req, res) => {
  const { category } = req.query;
  const sources = knowledgeBase.getSourcesByCategory(category);
  res.json({
    total: sources.length,
    sources
  });
};
