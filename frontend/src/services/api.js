import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests and attach auth token if available (Firebase ID token or JWT)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('legallens_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Terms Analyzer API
export const analyzeTermsUrl = (url) => api.post('/terms/analyze-url', { url });
export const analyzeTermsText = (text, title) => api.post('/terms/analyze-text', { text, title });
export const analyzeTermsDemo = (id) => api.post(`/terms/demo/${id}`);
export const analyzePrivacyPolicy = (data) => api.post('/analyze/privacy', data);
export const analyzeUrlDirect = (url) => api.post('/url/analyze', { url });

// Legal Knowledge Assistant (RAG) API
export const askLegalQuestion = (data) => api.post('/legal/ask', data);
export const getJurisdictions = () => api.get('/legal/jurisdictions');
export const getVerifiedSources = (category) => api.get('/legal/sources', { params: { category } });

// Document Upload & Analysis API
export const uploadLegalDocument = (formData) => api.post('/document/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getDocumentDetails = (id) => api.get(`/document/${id}`);
export const chatWithDocument = (id, question) => api.post(`/document/chat/${id}`, { question });
export const askDocumentQuestion = (data) => api.post('/document/ask', data);
export const getDocumentChatHistory = (id) => api.get(`/document/${id}/chat-history`);
export const deleteDocument = (id) => api.delete(`/document/${id}`);

// Document Comparison API
export const compareDocuments = (formData) => api.post('/comparison/compare', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const compareDemoDocuments = (type) => api.post('/comparison/demo', { type });

// Legal Tools API (Glossary, Action Plan, Consultation Prep)
export const explainGlossaryTerm = (data) => api.post('/glossary/explain', data);
export const generateActionPlan = (data) => api.post('/action-plan', data);
export const generateLawyerQuestions = (data) => api.post('/lawyer-questions', data);

// Omnipresent LegalLens Copilot / Agent API
export const askAgent = (data) => api.post('/agent/chat', data);

// Dashboard API
export const getDashboardOverview = () => api.get('/dashboard/overview');
export const toggleSaveReport = (id) => api.post(`/dashboard/save/${id}`);
export const getDemoDocumentsList = () => api.get('/dashboard/demo-documents');

// Multilingual Translation API
export const getSupportedLanguages = () => api.get('/translate/languages');
export const translateContent = (data) => api.post('/translate', data);

// Voice STT & TTS API
export const transcribeAudio = (data) => api.post('/voice/transcribe', data);
export const synthesizeVoice = (data) => api.post('/voice/speak', data);

// Auth API
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);
export const googleAuthUser = (userData) => api.post('/auth/google', userData);
export const getCurrentUser = () => api.get('/auth/me');

export default api;
