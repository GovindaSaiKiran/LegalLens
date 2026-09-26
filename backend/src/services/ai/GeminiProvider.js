const AIProvider = require('./AIProvider');
const config = require('../../config');

class GeminiProvider extends AIProvider {
  constructor() {
    super();
    this.apiKey = config.aiApiKey;
    this.model = config.aiModel || 'gemini-2.5-flash';
  }

  async _callGemini(prompt, systemInstruction = '') {
    if (!this.apiKey) {
      throw new Error('[GeminiProvider] No API key configured.');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
    };

    if (systemInstruction) {
      payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('Empty response from Gemini API');

    return JSON.parse(rawText);
  }

  async analyzeTerms(text, options = {}) {
    const prompt = `Analyze this Terms & Conditions document:\n\n${text.slice(0, 20000)}`;
    return await this._callGemini(prompt, 'Analyze Terms & Conditions as structured JSON.');
  }

  async analyzeDocument(text, metadata = {}, options = {}) {
    const prompt = `Document Type: ${metadata.type || 'Legal Document'}\nFilename: ${metadata.filename || 'uploaded_document'}\n\n${text.slice(0, 20000)}`;
    return await this._callGemini(prompt, 'Analyze legal document as structured JSON.');
  }

  async answerLegalRAG(question, jurisdiction, category, retrievedSources, options = {}) {
    const sourcesContext = JSON.stringify(retrievedSources, null, 2);
    const prompt = `Jurisdiction: ${jurisdiction}\nCategory: ${category}\nQuestion: ${question}\n\nVerified Sources:\n${sourcesContext}`;
    return await this._callGemini(prompt, 'Answer legal query grounded in sources as structured JSON.');
  }

  async chatWithDocument(documentText, question, conversationHistory = [], options = {}) {
    const prompt = `Document Text Excerpt:\n${documentText.slice(0, 18000)}\n\nUser Question: ${question}`;
    return await this._callGemini(prompt, 'Answer question about document strictly grounded in text as structured JSON.');
  }

  async compareDocuments(docA, docB, options = {}) {
    const prompt = `Document A:\n${docA.slice(0, 10000)}\n\n---\nDocument B:\n${docB.slice(0, 10000)}`;
    return await this._callGemini(prompt, 'Compare two documents as structured JSON.');
  }
}

module.exports = GeminiProvider;
