let DatabaseSync;
try {
  DatabaseSync = require('node:sqlite').DatabaseSync;
} catch (e) {
  DatabaseSync = null;
}

const fs = require('fs');
const path = require('path');
const config = require('./index');

let db = null;
let memoryStore = {
  users: new Map(),
  analyses: new Map(),
  chatMessages: []
};

if (DatabaseSync) {
  try {
    const dbDir = path.dirname(config.databasePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    if (!fs.existsSync(config.uploadsPath)) {
      fs.mkdirSync(config.uploadsPath, { recursive: true });
    }
    db = new DatabaseSync(config.databasePath);
  } catch (err) {
    console.warn('[Database] Failed to initialize SQLite, falling back to memory store:', err.message);
    db = null;
  }
}

// Initialize tables
function initializeDatabase() {
  if (db) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS analyses (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        source_type TEXT NOT NULL,
        source_url TEXT,
        raw_text TEXT,
        structured_result TEXT NOT NULL,
        is_saved INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        analysis_id TEXT NOT NULL,
        user_id TEXT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        citations TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (analysis_id) REFERENCES analyses (id) ON DELETE CASCADE
      );
    `);

    console.log('[Database] SQLite tables initialized successfully.');
  } else {
    console.log('[Database] In-memory database initialized successfully.');
  }
}

// Asynchronous Non-Blocking Execution Helper
// Offloads database I/O to event loop ticks via setImmediate,
// preventing Node.js event loop starvation under heavy concurrent load.
function asyncExecute(fn) {
  return new Promise((resolve, reject) => {
    setImmediate(() => {
      try {
        resolve(fn());
      } catch (err) {
        reject(err);
      }
    });
  });
}

// Safe query execution helpers with both synchronous and asynchronous non-blocking patterns
const dbClient = {
  db,
  initializeDatabase,
  asyncExecute,

  // Users - Non-blocking asynchronous & synchronous operations
  createUser: (user) => {
    if (db) {
      const stmt = db.prepare(`
        INSERT INTO users (id, name, email, password_hash, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(user.id, user.name, user.email, user.password_hash, user.created_at);
      return user;
    }
    memoryStore.users.set(user.id, { ...user });
    return user;
  },
  createUserAsync: async (user) => asyncExecute(() => dbClient.createUser(user)),

  findUserByEmail: (email) => {
    if (db) {
      const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
      return stmt.get(email);
    }
    for (const u of memoryStore.users.values()) {
      if (u.email === email) return { ...u };
    }
    return null;
  },
  findUserByEmailAsync: async (email) => asyncExecute(() => dbClient.findUserByEmail(email)),

  findUserById: (id) => {
    if (db) {
      const stmt = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?');
      return stmt.get(id);
    }
    const u = memoryStore.users.get(id);
    if (!u) return null;
    return { id: u.id, name: u.name, email: u.email, created_at: u.created_at };
  },
  findUserByIdAsync: async (id) => asyncExecute(() => dbClient.findUserById(id)),

  // Analyses
  createAnalysis: (analysis) => {
    if (db) {
      const stmt = db.prepare(`
        INSERT INTO analyses (
          id, user_id, type, title, source_type, source_url, raw_text,
          structured_result, is_saved, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        analysis.id,
        analysis.user_id || null,
        analysis.type,
        analysis.title,
        analysis.source_type,
        analysis.source_url || null,
        analysis.raw_text || null,
        typeof analysis.structured_result === 'string' 
          ? analysis.structured_result 
          : JSON.stringify(analysis.structured_result),
        analysis.is_saved ? 1 : 0,
        analysis.created_at,
        analysis.updated_at
      );
      return analysis;
    }
    memoryStore.analyses.set(analysis.id, {
      ...analysis,
      user_id: analysis.user_id || null,
      source_url: analysis.source_url || null,
      raw_text: analysis.raw_text || null,
      structured_result: typeof analysis.structured_result === 'string' ? JSON.parse(analysis.structured_result) : analysis.structured_result,
      is_saved: analysis.is_saved ? 1 : 0
    });
    return analysis;
  },

  getAnalysisById: (id) => {
    if (db) {
      const stmt = db.prepare('SELECT * FROM analyses WHERE id = ?');
      const row = stmt.get(id);
      if (!row) return null;
      return {
        ...row,
        structured_result: typeof row.structured_result === 'string' ? JSON.parse(row.structured_result) : row.structured_result
      };
    }
    const row = memoryStore.analyses.get(id);
    if (!row) return null;
    return { ...row };
  },

  getRecentAnalyses: (userId = null, limit = 20) => {
    if (db) {
      let stmt;
      if (userId) {
        stmt = db.prepare(`
          SELECT id, user_id, type, title, source_type, source_url, is_saved, created_at, updated_at
          FROM analyses 
          WHERE user_id = ? OR user_id IS NULL
          ORDER BY created_at DESC 
          LIMIT ?
        `);
        return stmt.all(userId, limit);
      } else {
        stmt = db.prepare(`
          SELECT id, user_id, type, title, source_type, source_url, is_saved, created_at, updated_at
          FROM analyses 
          ORDER BY created_at DESC 
          LIMIT ?
        `);
        return stmt.all(limit);
      }
    }
    const list = Array.from(memoryStore.analyses.values())
      .filter(a => !userId || a.user_id === userId || !a.user_id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
    return list;
  },

  getSavedReports: (userId = null) => {
    if (db) {
      let stmt;
      if (userId) {
        stmt = db.prepare(`
          SELECT id, user_id, type, title, source_type, source_url, is_saved, created_at, updated_at
          FROM analyses 
          WHERE (user_id = ? OR user_id IS NULL) AND is_saved = 1
          ORDER BY updated_at DESC
        `);
        return stmt.all(userId);
      } else {
        stmt = db.prepare(`
          SELECT id, user_id, type, title, source_type, source_url, is_saved, created_at, updated_at
          FROM analyses 
          WHERE is_saved = 1
          ORDER BY updated_at DESC
        `);
        return stmt.all();
      }
    }
    return Array.from(memoryStore.analyses.values())
      .filter(a => (!userId || a.user_id === userId || !a.user_id) && a.is_saved === 1)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  },

  toggleSaveReport: (id, userId = null) => {
    if (db) {
      const current = db.prepare('SELECT is_saved, user_id FROM analyses WHERE id = ?').get(id);
      if (!current) return null;
      const newStatus = current.is_saved ? 0 : 1;
      const now = new Date().toISOString();
      db.prepare('UPDATE analyses SET is_saved = ?, updated_at = ? WHERE id = ?').run(newStatus, now, id);
      return { is_saved: newStatus === 1 };
    }
    const current = memoryStore.analyses.get(id);
    if (!current) return null;
    current.is_saved = current.is_saved ? 0 : 1;
    current.updated_at = new Date().toISOString();
    return { is_saved: current.is_saved === 1 };
  },

  deleteAnalysis: (id, userId = null) => {
    if (db) {
      db.prepare('DELETE FROM chat_messages WHERE analysis_id = ?').run(id);
      const stmt = db.prepare('DELETE FROM analyses WHERE id = ?');
      stmt.run(id);
      return true;
    }
    memoryStore.chatMessages = memoryStore.chatMessages.filter(m => m.analysis_id !== id);
    memoryStore.analyses.delete(id);
    return true;
  },

  // Chat Messages for Document Q&A
  addChatMessage: (msg) => {
    if (db) {
      const stmt = db.prepare(`
        INSERT INTO chat_messages (id, analysis_id, user_id, role, content, citations, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        msg.id,
        msg.analysis_id,
        msg.user_id || null,
        msg.role,
        msg.content,
        msg.citations ? JSON.stringify(msg.citations) : null,
        msg.created_at
      );
      return msg;
    }
    memoryStore.chatMessages.push({
      ...msg,
      user_id: msg.user_id || null,
      citations: msg.citations || []
    });
    return msg;
  },

  getChatHistory: (analysisId) => {
    if (db) {
      const stmt = db.prepare(`
        SELECT * FROM chat_messages 
        WHERE analysis_id = ? 
        ORDER BY created_at ASC
      `);
      const rows = stmt.all(analysisId);
      return rows.map(r => ({
        ...r,
        citations: r.citations ? JSON.parse(r.citations) : []
      }));
    }
    return memoryStore.chatMessages
      .filter(m => m.analysis_id === analysisId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  },

  // Analyses - Non-blocking asynchronous & synchronous operations
  createAnalysisAsync: async (analysis) => asyncExecute(() => dbClient.createAnalysis(analysis)),
  getAnalysisByIdAsync: async (id) => asyncExecute(() => dbClient.getAnalysisById(id)),
  getRecentAnalysesAsync: async (userId = null, limit = 20) => asyncExecute(() => dbClient.getRecentAnalyses(userId, limit)),
  getSavedReportsAsync: async (userId = null) => asyncExecute(() => dbClient.getSavedReports(userId)),
  toggleSaveReportAsync: async (id, userId = null) => asyncExecute(() => dbClient.toggleSaveReport(id, userId)),
  deleteAnalysisAsync: async (id, userId = null) => asyncExecute(() => dbClient.deleteAnalysis(id, userId)),
  addChatMessageAsync: async (msg) => asyncExecute(() => dbClient.addChatMessage(msg)),
  getChatHistoryAsync: async (analysisId) => asyncExecute(() => dbClient.getChatHistory(analysisId))
};

module.exports = dbClient;
