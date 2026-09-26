class SectionSplitter {
  /**
   * Split raw legal text into structured logical sections/clauses.
   * @param {string} text
   * @returns {Array<{index: number, title: string, content: string, startChar: number}>}
   */
  splitIntoSections(text) {
    if (!text || typeof text !== 'string') return [];

    const lines = text.split('\n');
    const sections = [];
    let currentTitle = "Preamble / Introduction";
    let currentLines = [];
    let sectionIndex = 1;

    // Pattern for numbered clauses: "1.", "1.1", "Article 2", "Section 3", "CLAUSE 4", "WHEREAS"
    const headingPattern = /^(\s*(?:section|clause|article)?\s*\d+[\.\)]|\b[A-Z\s]{4,}:|\bWHEREAS\b|\bNOW THEREFORE\b)/i;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        currentLines.push('');
        return;
      }

      // Check if line looks like a clause header
      const isHeader = (headingPattern.test(trimmed) || /^[0-9]+\.\s+[A-Z]/.test(trimmed)) && trimmed.length < 90;

      if (isHeader && currentLines.join(' ').trim().length > 30) {
        sections.push({
          index: sectionIndex++,
          title: currentTitle,
          content: currentLines.join('\n').trim()
        });
        currentTitle = trimmed;
        currentLines = [];
      } else {
        currentLines.push(line);
      }
    });

    if (currentLines.join(' ').trim().length > 0) {
      sections.push({
        index: sectionIndex++,
        title: currentTitle,
        content: currentLines.join('\n').trim()
      });
    }

    return sections;
  }
}

module.exports = new SectionSplitter();
