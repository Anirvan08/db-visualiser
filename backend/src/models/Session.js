const { getDatabase, generateId } = require('../config/database');

class Session {
  static create() {
    const db = getDatabase();
    const id = generateId();
    
    const stmt = db.prepare(`
      INSERT INTO sessions (id, created_at, last_active_at) 
      VALUES (?, datetime('now'), datetime('now'))
    `);
    
    stmt.run(id);
    
    return this.getById(id);
  }
  
  static getById(id) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
    return stmt.get(id);
  }
  
  static updateLastActive(id) {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE sessions 
      SET last_active_at = datetime('now') 
      WHERE id = ?
    `);
    
    const result = stmt.run(id);
    return result.changes > 0;
  }
  
  static deleteById(id) {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
  
  static getAll() {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM sessions ORDER BY last_active_at DESC');
    return stmt.all();
  }
}

module.exports = Session;

