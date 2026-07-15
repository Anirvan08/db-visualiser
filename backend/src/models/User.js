const { getDatabase, generateId } = require('../config/database');

class User {
  // Create a new user from OAuth provider
  static create({ email, name, provider, provider_id, avatar_url }) {
    const db = getDatabase();
    const id = generateId();
    
    const stmt = db.prepare(`
      INSERT INTO users (id, email, name, provider, provider_id, avatar_url, created_at, last_login_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    
    stmt.run(id, email, name, provider, provider_id, avatar_url || null);
    
    return this.getById(id);
  }
  
  // Get user by ID
  static getById(id) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }
  
  // Find user by OAuth provider ID (e.g., Google user ID)
  static findByProviderId(provider, provider_id) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE provider = ? AND provider_id = ?');
    return stmt.get(provider, provider_id);
  }
  
  // Update last login timestamp
  static updateLastLogin(id) {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE users SET last_login_at = datetime('now') WHERE id = ?
    `);
    stmt.run(id);
  }
  
  // Get user by email (optional, for future use)
  static findByEmail(email) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }
  
  // Get all users (optional, for admin purposes)
  static getAll() {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    return stmt.all();
  }
}

module.exports = User;

