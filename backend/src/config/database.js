const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const config = require('./index');

// Ensure directory exists
const dbDir = path.dirname(config.databasePath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Ensure uploads directory exists
if (!fs.existsSync(config.uploadsPath)) {
  fs.mkdirSync(config.uploadsPath, { recursive: true });
}

const db = new DatabaseSync(config.databasePath);

// Initialize tables
function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Analyses table
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

  // Chat messages for document Q&A and assistant
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
}

// Safe query execution helpers
const dbClient = {
  db,
  initializeDatabase,

  // Users
  createUser: (user) => {
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(user.id, user.name, user.email, user.password_hash, user.created_at);
    return user;
  },

  findUserByEmail: (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  findUserById: (id) => {
    const stmt = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?');
    return stmt.get(id);
  },

  // Analyses
  createAnalysis: (analysis) => {
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
  },

  getAnalysisById: (id) => {
    const stmt = db.prepare('SELECT * FROM analyses WHERE id = ?');
    const row = stmt.get(id);
    if (!row) return null;
    return {
      ...row,
      structured_result: JSON.parse(row.structured_result)
    };
  },

  getRecentAnalyses: (userId = null, limit = 20) => {
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
  },

  getSavedReports: (userId = null) => {
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
  },

  toggleSaveReport: (id, userId = null) => {
    const current = db.prepare('SELECT is_saved, user_id FROM analyses WHERE id = ?').get(id);
    if (!current) return null;
    const newStatus = current.is_saved ? 0 : 1;
    const now = new Date().toISOString();
    db.prepare('UPDATE analyses SET is_saved = ?, updated_at = ? WHERE id = ?').run(newStatus, now, id);
    return { is_saved: newStatus === 1 };
  },

  deleteAnalysis: (id, userId = null) => {
    // Also delete any child chat messages
    db.prepare('DELETE FROM chat_messages WHERE analysis_id = ?').run(id);
    const stmt = db.prepare('DELETE FROM analyses WHERE id = ?');
    stmt.run(id);
    return true;
  },

  // Chat Messages for Document Q&A
  addChatMessage: (msg) => {
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
  },

  getChatHistory: (analysisId) => {
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
};

module.exports = dbClient;
