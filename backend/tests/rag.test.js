const LegalRetriever = require('../src/services/rag/retriever');

describe('Statutory Legal RAG Pipeline', () => {
  let retriever;

  beforeEach(() => {
    retriever = new LegalRetriever();
  });

  it('retrieves relevant statutory provisions for contract breach questions', () => {
    const query = 'What compensation is awarded for breach of contract?';
    const results = retriever.retrieve(query, 'india', null, 3);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    // Results should contain Indian Contract Act provisions
    const actTitles = results.map(r => r.act_title);
    expect(actTitles.some(t => t.includes('Contract'))).toBe(true);
  });

  it('retrieves data protection provisions for privacy inquiries', () => {
    const query = 'Can I withdraw consent for personal data processing?';
    const results = retriever.retrieve(query, 'india', null, 3);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    const hasDataAct = results.some(r => r.act_title.includes('Digital Personal Data') || r.summary.includes('data'));
    expect(hasDataAct).toBe(true);
  });

  it('returns empty array when query contains only stop words or symbols', () => {
    const results = retriever.retrieve('what where when does that', 'india');
    expect(results).toEqual([]);
  });

  it('respects the topK limit parameter', () => {
    const results = retriever.retrieve('contract termination and agreement rules', 'india', null, 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });
});
