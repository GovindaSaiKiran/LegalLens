const app = require('./app');
const config = require('./config');
const db = require('./config/database');
const knowledgeBase = require('./services/rag/legalKnowledgeBase');

async function startServer() {
  try {
    // 1. Initialize SQLite Database Tables
    db.initializeDatabase();

    // 2. Pre-load Legal Knowledge Sources for RAG
    knowledgeBase.loadSources();

    // 3. Start Express HTTP Server
    app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`  LegalLens API Server Running on port ${config.port}`);
      console.log(`  Jurisdiction: India (Extensible)`);
      console.log(`  AI Engine: Groq (${config.groqModel || 'openai/gpt-oss-120b'})`);
      console.log(`  OCR Engine: Google Cloud API`);
      console.log(`  Legal Safety Layer: ACTIVE`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Fatal: Failed to start LegalLens server:', err);
    process.exit(1);
  }
}

startServer();
