const { getDatabase, generateId } = require('../config/database');

class Project {
  static createForSession(sessionId, name, databaseType) {
    const db = getDatabase();
    const id = generateId();
    
    const stmt = db.prepare(`
      INSERT INTO projects (id, session_id, name, database_type, created_at, updated_at, last_accessed_at) 
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))
    `);
    
    stmt.run(id, sessionId, name, databaseType);
    
    return this.getById(id, sessionId);
  }
  
  static getAllBySession(sessionId) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM projects 
      WHERE session_id = ? 
      ORDER BY last_accessed_at DESC
    `);
    return stmt.all(sessionId);
  }
  
  static getById(projectId, sessionId) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM projects 
      WHERE id = ? AND session_id = ?
    `);
    return stmt.get(projectId, sessionId);
  }
  
  static updateLastAccessed(projectId) {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE projects 
      SET last_accessed_at = datetime('now') 
      WHERE id = ?
    `);
    
    const result = stmt.run(projectId);
    return result.changes > 0;
  }
  
  static update(projectId, sessionId, updates) {
    const db = getDatabase();
    
    // Build dynamic update query
    const allowedFields = ['name', 'database_type'];
    const updateFields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    updateFields.push('updated_at = datetime(\'now\')');
    values.push(projectId, sessionId);
    
    const stmt = db.prepare(`
      UPDATE projects 
      SET ${updateFields.join(', ')} 
      WHERE id = ? AND session_id = ?
    `);
    
    const result = stmt.run(...values);
    
    if (result.changes === 0) {
      return null; // Project not found or not owned by session
    }
    
    return this.getById(projectId, sessionId);
  }
  
  static deleteById(projectId, sessionId) {
    const db = getDatabase();
    const stmt = db.prepare(`
      DELETE FROM projects 
      WHERE id = ? AND session_id = ?
    `);
    
    const result = stmt.run(projectId, sessionId);
    return result.changes > 0;
  }
  
  static getAll() {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM projects ORDER BY last_accessed_at DESC');
    return stmt.all();
  }
}

module.exports = Project;

