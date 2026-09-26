const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.AUTH_SECRET || process.env.JWT_SECRET || 'legallens-secret-local-dev-2026',
  jwtExpiresIn: '7d',
  
  // Centralized Groq AI Configuration (Legal AI reasoning / analysis)
  aiProvider: process.env.AI_PROVIDER || 'groq',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',

  // Gemini API key — Translation
  geminiTranslationApiKey: process.env.GEMINI_TRANSLATION_API_KEY || process.env.GEMINI_API_KEY || '',

  // Gemini API key — Voice functionality (STT and TTS)
  geminiVoiceApiKey: process.env.GEMINI_VOICE_API_KEY || process.env.GEMINI_API_KEY || '',

  // Centralized Google API Configuration
  googleApiKey: process.env.GOOGLE_API_KEY || '',

  // Firebase Configuration
  firebaseProjectId: process.env.VITE_FIREBASE_PROJECT_ID || 'legallens-8cbdf',

  // Paths
  legalSourcesPath: path.resolve(__dirname, '../../../data/legal-sources'),
  demoDocumentsPath: path.resolve(__dirname, '../../../data/demo-documents'),
  databasePath: path.resolve(__dirname, '../../legallens.sqlite'),
  uploadsPath: path.resolve(__dirname, '../../uploads')
};
