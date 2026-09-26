/**
 * Centralized Groq AI Service for LegalLens
 * Powers all LLM features across the entire platform using ONE centralized GROQ_API_KEY.
 * Primary Model: llama-3.3-70b-versatile (with automatic fallback across active Groq models).
 */

const config = require('../config');

class GroqService {
  constructor() {
    this.apiKey = config.groqApiKey || process.env.GROQ_API_KEY;
    
    // Primary model: defaults to configured GROQ_MODEL or openai/gpt-oss-120b
    this.primaryModel = config.groqModel || process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

    // Validated list of currently active production Groq models (in priority order)
    this.validGroqModels = [
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'qwen/qwen3.8-27b'
    ];

    this.fallbackModels = this.validGroqModels.filter(m => m !== this.primaryModel);
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Helper to clean JSON string from LLM responses (stripping markdown fences if present).
   */
  _parseJSON(rawText) {
    if (!rawText) return null;
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      // Find first { and last }
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        return JSON.parse(cleaned.substring(start, end + 1));
      }
      throw e;
    }
  }

  /**
   * Core completion caller to Groq OpenAI-compatible API.
   * Cycles through active Groq models and automatically handles retries.
   */
  async _callGroq(messages, jsonMode = true, temperature = 0.1) {
    if (!this.isAvailable()) {
      const err = new Error('GROQ_API_KEY is not configured in environment.');
      err.code = 'AI_ANALYSIS_ERROR';
      err.statusCode = 500;
      throw err;
    }

    const modelsToTry = [this.primaryModel, ...this.fallbackModels];
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const payload = {
          model,
          messages,
          temperature
        };

        if (jsonMode) {
          payload.response_format = { type: 'json_object' };
        }

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errBody = await res.text();
          console.warn(`[GroqService] Model ${model} returned HTTP ${res.status}: ${errBody}`);
          lastError = new Error(`Groq API Error (${res.status}): ${errBody}`);
          // If model is missing, rate-limited, or overloaded, proceed to next candidate
          continue;
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error(`Groq model ${model} returned empty response content.`);
        }

        if (jsonMode) {
          return this._parseJSON(content);
        }
        return content;
      } catch (err) {
        console.warn(`[GroqService] Request failed with model ${model}:`, err.message);
        lastError = err;
      }
    }

    const aiErr = new Error(`All Groq model attempts failed: ${lastError?.message || 'Unknown Groq error'}`);
    aiErr.code = 'AI_ANALYSIS_ERROR';
    aiErr.statusCode = 502;
    throw aiErr;
  }

  // ==========================================
  // 1. TERMS & CONDITIONS ANALYSIS
  // ==========================================
  async analyzeTerms(text, options = {}) {
    const title = options.title || 'Terms & Conditions';
    const cleanText = (text || '').trim();

    if (!cleanText || cleanText.length < 50) {
      const err = new Error('Please provide at least 50 characters of legal or terms text to analyze.');
      err.code = 'VALIDATION_ERROR';
      err.statusCode = 400;
      throw err;
    }

    // Temporary Debugging (Requirement 5)
    console.log('[LegalLens] Input type: TEXT');
    console.log(`[LegalLens] Input length: ${cleanText.length}`);
    console.log(`[LegalLens] Input preview: "${cleanText.slice(0, 300).replace(/\s+/g, ' ')}..."`);

    const systemPrompt = `You are LegalLens, an AI legal awareness and document clarity engine.
Your task is to analyze ONLY the user-provided Terms & Conditions text objectively for everyday consumers.

CRITICAL MANDATES FOR ACCURACY & GROUNDING:
1. Ground every single finding strictly in the document text provided.
2. Identify information ACTUALLY present in that specific document, including:
   - Service / company name
   - User obligations
   - Fees and payment conditions (extract exact numbers/currency, e.g. ₹500, ₹50,000, $10, etc.)
   - Subscription and automatic renewal terms (extract exact frequency, e.g. monthly, annual, 12 months)
   - Cancellation terms and notice periods (extract exact notice windows, e.g. 7 days, 60 days)
   - Refunds and termination rules
   - Liability limitations, indemnification, arbitration, and governing law
   - Intellectual property, account restrictions, deadlines, and data/privacy references
3. If an item (such as fees, renewal, cancellation, or arbitration) is NOT mentioned or present in the document, DO NOT invent it. Explicitly state that it is not specified or leave the corresponding list empty.
4. "what_you_are_agreeing_to" MUST reflect the specific terms of THIS document (e.g., if a gym membership with ₹500/month and 7-day cancellation notice, list those exact terms; if cloud software with ₹50,000/year and 60-day notice, list those exact terms). NEVER use generic or placeholder bullet points.
5. You are NOT a lawyer and do NOT give legal advice. Maintain neutral, objective language: "Worth reviewing", "Important provision", "Potentially significant".

Output MUST be strict JSON matching this exact schema:
{
  "summary": "Clear 2-3 paragraph plain-English breakdown of what this specific document covers.",
  "what_you_are_agreeing_to": [
    "Specific thing you agree to in this document 1",
    "Specific thing you agree to in this document 2",
    "Specific thing you agree to in this document 3",
    "Specific thing you agree to in this document 4"
  ],
  "important_points": [
    {
      "category": "Billing & Renewal | Data & Privacy | Refunds & Cancellation | Dispute Resolution | Liability | Account Termination",
      "tag": "Important Provision | Potentially Significant | Worth Reviewing",
      "title": "Clear descriptive title",
      "finding": "Objective description of what the clause requires or imposes",
      "relevance": "Why this matters to an everyday user",
      "clauseReference": "Section heading or clause identifier from the document",
      "originalClause": "Verbatim quote or excerpt from the document"
    }
  ],
  "obligations": [
    {
      "party": "User | Provider",
      "obligation": "Clear description of obligation from document",
      "clause": "Section reference"
    }
  ],
  "deadlines": [
    {
      "event": "Notice, renewal, or cancellation window from document",
      "timing": "Exact time frame (e.g. 7 days notice, 60 days notice)",
      "consequence": "What happens if missed",
      "clause": "Section reference"
    }
  ],
  "areas_to_review": [
    {
      "area": "Specific clause area",
      "note": "Why caution is warranted based on the actual text"
    }
  ],
  "questions_for_lawyer": [
    "Precise question tailored to this document to ask a legal professional"
  ],
  "information_to_prepare": [
    "Specific document or record relevant to this agreement"
  ],
  "action_checklist": [
    { "task": "Concrete actionable task for the user based on this agreement", "done": false }
  ],
  "disclaimer": "LegalLens provides general legal information and document analysis, not legal advice. Laws vary by jurisdiction and circumstances. For important or disputed matters, consult a qualified legal professional."
}`;

    const userPrompt = `DOCUMENT TITLE: ${title}

USER-PROVIDED DOCUMENT TEXT:
"""
${cleanText.slice(0, 20000)}
"""

Analyze ONLY the user-provided document text above according to the system instructions. Return strict JSON.`;

    try {
      return await this._callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);
    } catch (err) {
      console.error('[GroqService] analyzeTerms Groq call failed:', err.message);
      const aiError = new Error(`AI Analysis Error: ${err.message || 'Groq API failed to analyze document.'}`);
      aiError.code = 'AI_ANALYSIS_ERROR';
      aiError.statusCode = 502;
      throw aiError;
    }
  }

  // ==========================================
  // 2. PRIVACY POLICY ANALYSIS
  // ==========================================
  async analyzePrivacy(text, options = {}) {
    const title = options.title || 'Privacy Policy';
    const cleanText = (text || '').trim();
    const systemPrompt = `You are LegalLens Privacy Policy Analyzer.
Analyze the provided Privacy Policy for consumer data risks, third-party sharing, tracking, and statutory rights (especially under India's Digital Personal Data Protection Act 2023).

LEGAL SAFETY RULES:
1. Provide neutral, objective analysis. Do not make definitive legal determinations.
2. Ground all points in the text.

Output MUST be strict JSON matching this schema:
{
  "summary": "Plain English summary of the privacy policy.",
  "data_collected": ["Personal data types collected..."],
  "third_party_sharing": ["Who data is shared with..."],
  "tracking_technologies": ["Cookies, SDKs, telemetry..."],
  "user_rights": ["Right to access, erasure, grievance officer details..."],
  "data_retention": "How long data is retained",
  "what_you_are_agreeing_to": ["Plain summary point 1", "..."],
  "important_points": [
    {
      "category": "Data & Privacy",
      "tag": "Important Provision | Potentially Significant | Worth Reviewing",
      "title": "Title",
      "finding": "What the policy states",
      "relevance": "Why it matters to user privacy",
      "clauseReference": "Section heading",
      "originalClause": "Verbatim quote"
    }
  ],
  "obligations": [{"party": "Company | User", "obligation": "...", "clause": "..."}],
  "deadlines": [],
  "areas_to_review": [{"area": "Data Sharing", "note": "..."}],
  "questions_for_lawyer": ["Question for privacy attorney..."],
  "information_to_prepare": ["Items to review..."],
  "action_checklist": [{"task": "Review app privacy settings", "done": false}],
  "disclaimer": "LegalLens provides general legal information and document analysis, not legal advice."
}`;

    const userPrompt = `Privacy Policy: ${title}\n\nText:\n${cleanText.slice(0, 18000)}`;

    try {
      return await this._callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);
    } catch (err) {
      console.error('[GroqService] analyzePrivacy Groq call failed:', err.message);
      const aiError = new Error(`AI Analysis Error: ${err.message || 'Groq API failed to analyze privacy policy.'}`);
      aiError.code = 'AI_ANALYSIS_ERROR';
      aiError.statusCode = 502;
      throw aiError;
    }
  }

  // ==========================================
  // 3. GENERIC LEGAL DOCUMENT ANALYSIS (Lease, Contract, Employment, NDA)
  // ==========================================
  async analyzeDocument(text, metadata = {}, options = {}) {
    const docType = metadata.type || 'Legal Contract';
    const filename = metadata.filename || 'uploaded_document';
    const cleanText = (text || '').trim();

    const systemPrompt = `You are LegalLens Contract Analysis Assistant.
Analyze the uploaded legal contract, agreement, rental lease, or employment document.

CRITICAL MANDATES:
1. Provide objective, balanced clarity. You are NOT acting as an attorney.
2. Identify obligations, lock-in periods, liability clauses, penalties, and termination provisions.
3. Highlight ambiguities or one-sided requirements using neutral phrasing.

Output MUST be strict JSON:
{
  "summary": "Plain English overview of the agreement and key commercial terms.",
  "what_you_are_agreeing_to": [
    "Core agreement bullet 1",
    "Core agreement bullet 2",
    "Core agreement bullet 3"
  ],
  "important_points": [
    {
      "category": "Obligations | Financial Terms | Termination & Lock-in | Dispute Resolution | Liability & Indemnity",
      "tag": "Important Provision | Potentially Significant | Worth Reviewing",
      "title": "Descriptive title",
      "finding": "Objective clause analysis",
      "relevance": "Real-world consequence for the user",
      "clauseReference": "Section reference",
      "originalClause": "Verbatim quote"
    }
  ],
  "obligations": [
    { "party": "Party A | Party B", "obligation": "...", "clause": "..." }
  ],
  "deadlines": [
    { "event": "...", "timing": "...", "consequence": "...", "clause": "..." }
  ],
  "areas_to_review": [
    { "area": "...", "note": "..." }
  ],
  "questions_for_lawyer": [
    "Precise question to ask a qualified advocate before signing"
  ],
  "information_to_prepare": [
    "Records or attachments to verify"
  ],
  "action_checklist": [
    { "task": "Concrete actionable step", "done": false }
  ],
  "disclaimer": "LegalLens provides general legal information and document analysis, not legal advice. Laws vary by jurisdiction and circumstances. For important or disputed matters, consult a qualified legal professional."
}`;

    const userPrompt = `Document Type: ${docType}\nFilename: ${filename}\n\nDocument Text:\n${cleanText.slice(0, 18000)}`;

    try {
      return await this._callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);
    } catch (err) {
      console.error('[GroqService] analyzeDocument Groq call failed:', err.message);
      const aiError = new Error(`AI Analysis Error: ${err.message || 'Groq API failed to analyze document.'}`);
      aiError.code = 'AI_ANALYSIS_ERROR';
      aiError.statusCode = 502;
      throw aiError;
    }
  }

  // ==========================================
  // 4. LEGAL KNOWLEDGE ASSISTANT (RAG)
  // ==========================================
  async answerLegalRAG(question, jurisdiction = 'India', category = 'General', retrievedSources = [], options = {}) {
    const systemPrompt = `You are LegalLens Legal Knowledge Assistant.
Answer the user's everyday legal awareness inquiry.

GROUNDING & SAFETY RULES:
1. Base your answer strictly on the provided verified statutory sources where applicable.
2. If the question asks about concepts outside the retrieved sources, provide general legal awareness clearly marked as general information and acknowledge limitations.
3. NEVER invent fake section numbers, court citations, or non-existent statutes.
4. Avoid guaranteeing legal outcomes or instructing the user what specific action they must take.
5. Clearly distinguish between source-backed statutory facts and general legal awareness.

Output MUST be strict JSON:
{
  "question": "${question.replace(/"/g, '\\"')}",
  "jurisdiction": "${jurisdiction}",
  "category": "${category}",
  "what_the_law_says": "Clear, accessible plain-language explanation of relevant statutory principles.",
  "what_may_be_relevant": "Specific statutory sections, rules, or standards that apply.",
  "possible_procedural_options": [
    "Step or procedural recourse 1 (e.g. sending a formal notice, filing on National Consumer Helpline)",
    "Step or procedural recourse 2"
  ],
  "information_to_prepare": [
    "Evidence or records to gather (e.g. rent receipts, payment invoices, WhatsApp chat exports)"
  ],
  "questions_to_ask_a_lawyer": [
    "Targeted question 1 to ask a legal advocate during a consultation",
    "Targeted question 2"
  ],
  "sources": [
    {
      "act": "Name of statute or regulation",
      "section": "Section number",
      "title": "Title of section",
      "summary": "Brief summary",
      "authority": "Legislative or regulatory authority"
    }
  ],
  "distinction": {
    "source_backed_facts": "Summary of points directly anchored in verified statutes",
    "ai_explanation": "Plain English context provided for clarity",
    "uncertainty": "Known variables or state-specific amendments to verify"
  },
  "disclaimer": "LegalLens provides general legal information and document analysis, not legal advice. Laws vary by jurisdiction and circumstances. For important or disputed matters, consult a qualified legal professional."
}`;

    const sourcesContext = retrievedSources && retrievedSources.length > 0 
      ? JSON.stringify(retrievedSources, null, 2)
      : 'No specific statutory chunks indexed for this exact query. Use verified Indian statutes (e.g., Consumer Protection Act 2019, Indian Contract Act 1872, Model Tenancy Act, DPDP Act 2023).';

    const userPrompt = `Jurisdiction: ${jurisdiction}\nCategory: ${category}\nQuestion: ${question}\n\nVerified Legal Sources:\n${sourcesContext}`;

    return await this._callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
  }

  // ==========================================
  // 5. DOCUMENT CHAT / GROUNDED Q&A
  // ==========================================
  async chatWithDocument(documentText, question, conversationHistory = [], options = {}) {
    const cleanDoc = (documentText || '').trim();
    const systemPrompt = `You are LegalLens Document Q&A Assistant.
Answer questions about the provided document.

CRITICAL ACCURACY MANDATES:
1. Your answer MUST be strictly grounded in the document text provided below.
2. If the answer is NOT present or cannot be determined from the document, you MUST explicitly state: "That information does not appear to be stated in the document."
3. Do NOT assume, fabricate, or invent terms, numbers, or provisions that are not in the document text.
4. Cite exact quotes or clause references whenever available.

Output MUST be strict JSON:
{
  "answer": "Accurate, grounded plain-language answer.",
  "grounded": true,
  "clause_found": true,
  "citation": "Exact quote or excerpt from the document, or null if not found",
  "disclaimer": "LegalLens provides general legal information and document analysis, not legal advice."
}`;

    const historyFormatted = conversationHistory.slice(-4).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    const userPrompt = `Document Excerpt:\n${cleanDoc.slice(0, 18000)}\n\nRecent History:\n${historyFormatted}\n\nQuestion: ${question}`;

    return await this._callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
  }

  // ==========================================
  // 6. SEMANTIC DOCUMENT COMPARISON
  // ==========================================
  async compareDocuments(docA, docB, options = {}) {
    const systemPrompt = `You are LegalLens Semantic Document Comparison Engine.
Compare Document A and Document B (e.g. an original contract and a counter-proposal).

Identify:
1. Added provisions (in Document B, absent in Document A)
2. Removed provisions (in Document A, absent in Document B)
3. Modified provisions (where wording, obligations, liability, or financial terms changed)
4. Overall plain-English summary of the legal balance shift.

Output MUST be strict JSON:
{
  "comparison_summary": "Comprehensive 2-paragraph plain English summary of what shifted between the two versions.",
  "added": [
    { "title": "...", "content": "Excerpt of new clause", "significance": "Why this addition matters" }
  ],
  "removed": [
    { "title": "...", "content": "Excerpt of deleted clause", "significance": "Why this deletion matters" }
  ],
  "modified": [
    { "title": "...", "original": "Version A text", "revised": "Version B text", "changeSummary": "Plain explanation of what shifted" }
  ],
  "important_changes": [
    { "clause": "Clause name", "summary": "Key change explanation", "type": "Added | Removed | Modified" }
  ],
  "disclaimer": "LegalLens provides general legal information and document analysis, not legal advice."
}`;

    const userPrompt = `DOCUMENT A (Baseline):\n${(docA || '').slice(0, 10000)}\n\n====================\nDOCUMENT B (Comparison):\n${(docB || '').slice(0, 10000)}`;

    return await this._callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
  }

  // ==========================================
  // 7. GLOSSARY EXPLANATION
  // ==========================================
  async explainGlossaryTerm(term, category = 'General', context = '') {
    const systemPrompt = `You are LegalLens Plain-Language Legal Glossary Engine.
Explain the requested legal term in simple, accessible layman words with everyday examples and practical advice under Indian law.

Output MUST be strict JSON:
{
  "term": "${term.replace(/"/g, '\\"')}",
  "category": "${category}",
  "simpleExplanation": "Crystal-clear 1-2 sentence plain-language definition.",
  "everydayExample": "Realistic relatable everyday scenario explaining how this happens in real life.",
  "whyItMatters": "The practical risk or right involved for consumers.",
  "proTip": "Actionable negotiation or safeguard tip.",
  "redFlags": "Common shady practices or traps related to this clause.",
  "statuteRef": "Relevant Indian statute or judicial principle if applicable."
}`;

    const userPrompt = `Legal Term: ${term}\nCategory: ${category}\nContext (if any): ${context}`;

    return await this._callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
  }

  // ==========================================
  // 8. ACTION PLAN GENERATION
  // ==========================================
  async generateActionPlan(documentText, analysis = {}) {
    const systemPrompt = `You are LegalLens Legal Action Checklist Generator.
Generate a structured, chronological step-by-step action plan for the user based on the document analysis.

Output MUST be strict JSON:
{
  "action_plan": [
    {
      "step": 1,
      "title": "Immediate Verification",
      "description": "Details of what to do first",
      "timeframe": "Within 24-48 hours",
      "priority": "High | Medium | Low"
    }
  ],
  "evidence_checklist": [
    "Specific document, screenshot, or record to archive"
  ],
  "disclaimer": "LegalLens provides general legal information and document analysis, not legal advice."
}`;

    const userPrompt = `Document Excerpt:\n${(documentText || '').slice(0, 12000)}\n\nExisting Analysis Summary:\n${analysis.summary || ''}`;

    return await this._callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
  }

  // ==========================================
  // 9. LAWYER QUESTIONS GENERATION
  // ==========================================
  async generateLawyerQuestions(documentText, analysis = {}) {
    const systemPrompt = `You are LegalLens Legal Consultation Prep Assistant.
Generate high-value, precise questions for a user to bring to a consultation with a qualified lawyer.

Output MUST be strict JSON:
{
  "lawyer_questions": [
    {
      "category": "Liability | Termination | Compliance | Cost",
      "question": "Exact question to ask",
      "context": "Why this question is important"
    }
  ],
  "disclaimer": "LegalLens provides general legal information and document analysis, not legal advice."
}`;

    const userPrompt = `Document Excerpt:\n${(documentText || '').slice(0, 12000)}\n\nExisting Analysis:\n${JSON.stringify(analysis.important_points || [])}`;

    return await this._callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
  }

}

const groqService = new GroqService();

module.exports = groqService;
