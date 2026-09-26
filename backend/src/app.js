const express = require('express');
const cors = require('cors');
const compression = require('compression');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const termsRoutes = require('./routes/terms.routes');
const legalRoutes = require('./routes/legal.routes');
const documentRoutes = require('./routes/document.routes');
const comparisonRoutes = require('./routes/comparison.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const analyzeRoutes = require('./routes/analyze.routes');
const directApis = require('./routes/directApis.routes');
const agentRoutes = require('./routes/agent.routes');
const translationRoutes = require('./routes/translation.routes');
const voiceRoutes = require('./routes/voice.routes');

const app = express();

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '⚖️ LegalLens GenAI API Server is Live & Active!',
    endpoints: {
      health: '/api/health',
      terms: '/api/terms',
      legalAssistant: '/api/legal',
      document: '/api/document',
      compare: '/api/comparison',
      dashboard: '/api/dashboard'
    },
    disclaimer: 'LegalLens provides general legal information and document clarity, not binding legal advice.'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'LegalLens API',
    version: '1.0.0',
    aiEngine: 'Groq GPT-OSS 120B (Legal AI)',
    translationEngine: 'Gemini 2.5 Flash (Translation)',
    voiceEngine: 'Gemini Voice STT/TTS',
    ocrEngine: 'Google API (Centralized)',
    authEngine: 'Firebase Auth & Local Sync',
    jurisdiction: 'India (Default)',
    disclaimer: 'LegalLens provides general legal information and document analysis, not legal advice.'
  });
});

// Mount Routes
app.use('/api/agent', agentRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api', directApis);
app.use('/api/translate', translationRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/terms', termsRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/comparison', comparisonRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
