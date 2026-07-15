const { getDatabase, generateId } = require('../config/database');

class Project {
  // Create project for user (if authenticated) or session (if guest)
  static create(userId, sessionId, name, databaseType) {
    const db = getDatabase();
    const id = generateId();
    
    const stmt = db.prepare(`
      INSERT INTO projects (id, user_id, session_id, name, database_type, created_at, updated_at, last_accessed_at) 
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))
    `);
    
    stmt.run(id, userId || null, sessionId || null, name, databaseType);
    
    return this.getById(id, userId, sessionId);
  }

  // Legacy method for backward compatibility
  static createForSession(sessionId, name, databaseType) {
    return this.create(null, sessionId, name, databaseType);
  }
  
  // Get all projects for user (if authenticated) or session (if guest)
  static getAll(userId, sessionId) {
    const db = getDatabase();
    
    if (userId) {
      // Authenticated user - get projects by user_id
      const stmt = db.prepare(`
        SELECT * FROM projects 
        WHERE user_id = ? 
        ORDER BY last_accessed_at DESC
      `);
      return stmt.all(userId);
    } else if (sessionId) {
      // Guest user - get projects by session_id
      const stmt = db.prepare(`
        SELECT * FROM projects 
        WHERE session_id = ? 
        ORDER BY last_accessed_at DESC
      `);
      
      const projects = stmt.all(sessionId);
      
      // Filter out any projects that don't match (safety check)
      return projects.filter(p => p.session_id === sessionId);
    }
    
    return [];
  }

  // Legacy method for backward compatibility
  static getAllBySession(sessionId) {
    return this.getAll(null, sessionId);
  }
  
  // Get project by ID - check both user_id and session_id
  static getById(projectId, userId, sessionId) {
    const db = getDatabase();
    
    if (userId) {
      // Check if project belongs to user
      const stmt = db.prepare(`
        SELECT * FROM projects 
        WHERE id = ? AND user_id = ?
      `);
      const project = stmt.get(projectId, userId);
      if (project) return project;
    }
    
    if (sessionId) {
      // Check if project belongs to session
      const stmt = db.prepare(`
        SELECT * FROM projects 
        WHERE id = ? AND session_id = ?
      `);
      const project = stmt.get(projectId, sessionId);
      if (project) return project;
    }
    
    return null;
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
  
  static update(projectId, userId, sessionId, updates) {
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
    
    // Build WHERE clause based on user_id or session_id
    let whereClause;
    if (userId) {
      whereClause = 'WHERE id = ? AND user_id = ?';
      values.push(projectId, userId);
    } else if (sessionId) {
      whereClause = 'WHERE id = ? AND session_id = ?';
      values.push(projectId, sessionId);
    } else {
      return null;
    }
    
    const stmt = db.prepare(`
      UPDATE projects 
      SET ${updateFields.join(', ')} 
      ${whereClause}
    `);
    
    const result = stmt.run(...values);
    
    if (result.changes === 0) {
      return null; // Project not found or not owned
    }
    
    return this.getById(projectId, userId, sessionId);
  }
  
  static deleteById(projectId, userId, sessionId) {
    const db = getDatabase();
    
    if (userId) {
      const stmt = db.prepare(`
        DELETE FROM projects 
        WHERE id = ? AND user_id = ?
      `);
      const result = stmt.run(projectId, userId);
      return result.changes > 0;
    } else if (sessionId) {
      const stmt = db.prepare(`
        DELETE FROM projects 
        WHERE id = ? AND session_id = ?
      `);
      const result = stmt.run(projectId, sessionId);
      return result.changes > 0;
    }
    
    return false;
  }
  
}

module.exports = Project;

