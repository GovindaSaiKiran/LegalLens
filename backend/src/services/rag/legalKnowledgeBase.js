const fs = require('fs');
const path = require('path');
const config = require('../../config');

class LegalKnowledgeBase {
  constructor() {
    this.sources = [];
    this.isLoaded = false;
  }

  loadSources() {
    if (this.isLoaded) return this.sources;

    const baseDir = config.legalSourcesPath;
    console.log(`[LegalKnowledgeBase] Loading legal sources from: ${baseDir}`);

    const loadDirRecursive = (dir) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          loadDirRecursive(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const parsed = JSON.parse(content);
            if (parsed.sources && Array.isArray(parsed.sources)) {
              parsed.sources.forEach(src => {
                this.sources.push({
                  jurisdiction: parsed.jurisdiction || 'india',
                  category: parsed.category || 'general',
                  act_title: parsed.act_title,
                  authority: parsed.authority,
                  enacted_year: parsed.enacted_year,
                  section: src.section,
                  title: src.title,
                  summary: src.summary,
                  keywords: src.keywords || []
                });
              });
            }
          } catch (err) {
            console.error(`[LegalKnowledgeBase] Error parsing source file ${fullPath}:`, err.message);
          }
        }
      }
    };

    loadDirRecursive(baseDir);
    this.isLoaded = true;
    console.log(`[LegalKnowledgeBase] Loaded ${this.sources.length} statutory provisions.`);
    return this.sources;
  }

  getAllSources() {
    if (!this.isLoaded) {
      this.loadSources();
    }
    return this.sources;
  }

  getSourcesByCategory(category) {
    const all = this.getAllSources();
    if (!category || category === 'all' || category === 'other') return all;
    return all.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }
}

module.exports = new LegalKnowledgeBase();
