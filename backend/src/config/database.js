const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

let db;

function initDatabase() {
  // Create database file in the backend directory
  const dbPath = path.join(__dirname, '../../data/erd_visualizer.db');
  
  // Ensure data directory exists
  const fs = require('fs');
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create tables
  createTables();
  
  console.log('Database initialized successfully');
  return db;
}

function createTables() {
  // Users table (for OAuth authentication)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      provider TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(provider, provider_id)
    )
  `);
  
  // Sessions table (kept for backward compatibility during migration)
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Projects table - supports both session_id (legacy) and user_id (new)
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      user_id TEXT,
      name TEXT NOT NULL,
      database_type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Add user_id column if it doesn't exist (migration for existing databases)
  try {
    const tableInfo = db.prepare("PRAGMA table_info(projects)").all();
    const hasUserId = tableInfo.some(col => col.name === 'user_id');
    if (!hasUserId) {
      db.exec(`ALTER TABLE projects ADD COLUMN user_id TEXT`);
      console.log('✓ Added user_id column to projects table');
    }
  } catch (e) {
    // Table might not exist yet, that's okay
  }
  
  // Diagrams table
  db.exec(`
    CREATE TABLE IF NOT EXISTS diagrams (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      metadata_json TEXT NOT NULL,
      nodes_json TEXT NOT NULL,
      edges_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);
  
  // Create indexes for efficient queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);
    CREATE INDEX IF NOT EXISTS idx_projects_session_id ON projects(session_id);
    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_projects_last_accessed ON projects(last_accessed_at);
    CREATE INDEX IF NOT EXISTS idx_diagrams_project_id ON diagrams(project_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_last_active ON sessions(last_active_at);
  `);
}

function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

function generateId() {
  return uuidv4();
}

module.exports = {
  initDatabase,
  getDatabase,
  generateId
};

