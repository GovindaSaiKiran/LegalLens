const AIProvider = require('./AIProvider');
const groqService = require('../groqService');

class GroqProvider extends AIProvider {
  constructor() {
    super();
    this.groq = groqService;
  }

  async analyzeTerms(text, options = {}) {
    return await this.groq.analyzeTerms(text, options);
  }

  async analyzePrivacy(text, options = {}) {
    return await this.groq.analyzePrivacy(text, options);
  }

  async analyzeDocument(text, metadata = {}, options = {}) {
    return await this.groq.analyzeDocument(text, metadata, options);
  }

  async answerLegalRAG(question, jurisdiction, category, retrievedSources, options = {}) {
    return await this.groq.answerLegalRAG(question, jurisdiction, category, retrievedSources, options);
  }

  async chatWithDocument(documentText, question, conversationHistory = [], options = {}) {
    return await this.groq.chatWithDocument(documentText, question, conversationHistory, options);
  }

  async compareDocuments(docA, docB, options = {}) {
    return await this.groq.compareDocuments(docA, docB, options);
  }

  async explainGlossary(term, category, context) {
    return await this.groq.explainGlossaryTerm(term, category, context);
  }

  async generateActionPlan(documentText, analysis) {
    return await this.groq.generateActionPlan(documentText, analysis);
  }

  async generateLawyerQuestions(documentText, analysis) {
    return await this.groq.generateLawyerQuestions(documentText, analysis);
  }
}

module.exports = GroqProvider;
