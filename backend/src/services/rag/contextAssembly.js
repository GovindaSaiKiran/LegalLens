/**
 * Context Assembly for LegalLens RAG pipeline.
 * Formats retrieved statutory provisions into clean, structured context for the LLM.
 */
class ContextAssembly {
  assemble(sources) {
    if (!sources || sources.length === 0) {
      return {
        formattedText: "No authoritative sources found in the database.",
        sourceCitations: []
      };
    }

    const citations = sources.map((s, index) => ({
      id: index + 1,
      act: s.act_title,
      section: s.section,
      title: s.title,
      summary: s.summary,
      authority: s.authority,
      year: s.enacted_year
    }));

    const formattedText = citations.map(c => 
      `[Source ${c.id}] ${c.act} (${c.year}) - ${c.section}: ${c.title}\nAuthority: ${c.authority}\nSummary: ${c.summary}\n`
    ).join('\n---\n');

    return {
      formattedText,
      sourceCitations: citations
    };
  }
}

module.exports = new ContextAssembly();
