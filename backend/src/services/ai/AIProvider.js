/**
 * Abstract AIProvider interface for LegalLens.
 * Allows switching between Gemini, OpenAI, Claude, or local mock without changing application logic.
 */
class AIProvider {
  /**
   * Analyze Terms & Conditions text.
   * @param {string} text - Raw terms text
   * @param {object} options - Additional context or user options
   * @returns {Promise<object>} Structured analysis JSON
   */
  async analyzeTerms(text, options = {}) {
    throw new Error('Method analyzeTerms must be implemented');
  }

  /**
   * Analyze generic legal documents (Contracts, Policies, Leases).
   * @param {string} text - Raw document text
   * @param {object} metadata - Document type, filename, etc.
   * @param {object} options
   * @returns {Promise<object>} Structured analysis JSON
   */
  async analyzeDocument(text, metadata = {}, options = {}) {
    throw new Error('Method analyzeDocument must be implemented');
  }

  /**
   * Legal Knowledge Assistant RAG answering.
   * @param {string} question - User question
   * @param {string} jurisdiction - Target jurisdiction (e.g. India)
   * @param {string} category - Legal category (e.g. Consumer, Employment, etc.)
   * @param {Array} retrievedSources - Relevant statutory sources retrieved from DB
   * @param {object} options
   * @returns {Promise<object>} Structured RAG answer JSON
   */
  async answerLegalRAG(question, jurisdiction, category, retrievedSources, options = {}) {
    throw new Error('Method answerLegalRAG must be implemented');
  }

  /**
   * Chat with a specific analyzed document.
   * Answers must be strictly grounded in the document text.
   * @param {string} documentText - Full text of the document
   * @param {string} question - User question
   * @param {Array} conversationHistory - Past messages
   * @param {object} options
   * @returns {Promise<object>} Grounded answer with citations or non-found notice
   */
  async chatWithDocument(documentText, question, conversationHistory = [], options = {}) {
    throw new Error('Method chatWithDocument must be implemented');
  }

  /**
   * Compare two legal documents.
   * @param {string} docA - Text of Document A
   * @param {string} docB - Text of Document B
   * @param {object} options
   * @returns {Promise<object>} Added, Removed, Modified, and Summary of shifts
   */
  async compareDocuments(docA, docB, options = {}) {
    throw new Error('Method compareDocuments must be implemented');
  }
}

module.exports = AIProvider;
