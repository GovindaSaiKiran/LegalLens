const knowledgeBase = require('./legalKnowledgeBase');

class LegalRetriever {
  /**
   * Search relevant statutory provisions for a question.
   * @param {string} query - User's legal question
   * @param {string} jurisdiction - Jurisdiction (default 'india')
   * @param {string} category - Specific category or 'all'
   * @param {number} topK - Number of results to return
   */
  retrieve(query, jurisdiction = 'india', category = null, topK = 4) {
    const allSources = knowledgeBase.getAllSources();
    if (!allSources || allSources.length === 0) return [];

    const cleanQuery = query.toLowerCase();
    const queryTokens = cleanQuery
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2 && !['what', 'how', 'when', 'does', 'that', 'this', 'with', 'from', 'have', 'been', 'there', 'their', 'about', 'which', 'where'].includes(t));

    if (queryTokens.length === 0) return [];

    const scored = allSources.map(source => {
      let score = 0;
      const searchableText = `${source.act_title} ${source.section} ${source.title} ${source.summary} ${(source.keywords || []).join(' ')}`.toLowerCase();

      // Check category match
      const catMatch = category && category.toLowerCase() !== 'other' && source.category.toLowerCase() === category.toLowerCase();
      if (catMatch) {
        score += 3.0;
      }

      // Keyword matches
      queryTokens.forEach(token => {
        // Direct keyword list match is high value
        if (source.keywords && source.keywords.some(k => k.toLowerCase().includes(token))) {
          score += 4.0;
        }

        // Section or Title match
        if (source.title.toLowerCase().includes(token)) {
          score += 3.0;
        }
        if (source.section.toLowerCase().includes(token)) {
          score += 4.0;
        }

        // Summary match
        if (source.summary.toLowerCase().includes(token)) {
          score += 1.5;
        }
      });

      return {
        ...source,
        score
      };
    });

    // Filter by threshold to prevent irrelevant noise
    const minThreshold = 2.0;
    const candidates = scored
      .filter(s => s.score >= minThreshold)
      .sort((a, b) => b.score - a.score);

    return candidates.slice(0, topK);
  }
}

module.exports = new LegalRetriever();
