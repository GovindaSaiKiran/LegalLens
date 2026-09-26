const { getAIProvider } = require('../ai');
const sectionSplitter = require('../document/sectionSplitter');

class SemanticComparer {
  async compare(docAText, docBText, metadata = {}) {
    const ai = getAIProvider();

    // Split both documents into logical sections for granular inspection
    const sectionsA = sectionSplitter.splitIntoSections(docAText);
    const sectionsB = sectionSplitter.splitIntoSections(docBText);

    // Call AI provider for comparison
    const comparisonResult = await ai.compareDocuments(docAText, docBText, {
      titleA: metadata.titleA || 'Document A',
      titleB: metadata.titleB || 'Document B'
    });

    return {
      ...comparisonResult,
      sectionsA,
      sectionsB,
      stats: {
        docA_wordCount: docAText.split(/\s+/).filter(Boolean).length,
        docB_wordCount: docBText.split(/\s+/).filter(Boolean).length,
        docA_sections: sectionsA.length,
        docB_sections: sectionsB.length
      }
    };
  }
}

module.exports = new SemanticComparer();
