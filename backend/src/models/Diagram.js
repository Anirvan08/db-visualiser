const { getDatabase, generateId } = require('../config/database');

class Diagram {
  static save(projectId, metadata, nodes, edges) {
    const db = getDatabase();
    
    // Check if diagram already exists
    const existingDiagram = this.getByProjectId(projectId);
    
    if (existingDiagram) {
      // Update existing diagram
      const stmt = db.prepare(`
        UPDATE diagrams 
        SET metadata_json = ?, nodes_json = ?, edges_json = ?, updated_at = datetime('now')
        WHERE project_id = ?
      `);
      
      stmt.run(
        JSON.stringify(metadata),
        JSON.stringify(nodes),
        JSON.stringify(edges),
        projectId
      );
      
      return this.getByProjectId(projectId);
    } else {
      // Create new diagram
      const id = generateId();
      const stmt = db.prepare(`
        INSERT INTO diagrams (id, project_id, metadata_json, nodes_json, edges_json, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);
      
      stmt.run(
        id,
        projectId,
        JSON.stringify(metadata),
        JSON.stringify(nodes),
        JSON.stringify(edges)
      );
      
      return this.getByProjectId(projectId);
    }
  }
  
  static getByProjectId(projectId) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM diagrams WHERE project_id = ?');
    const result = stmt.get(projectId);
    
    if (!result) {
      return null;
    }
    
    // Parse JSON fields
    return {
      ...result,
      metadata: JSON.parse(result.metadata_json),
      nodes: JSON.parse(result.nodes_json),
      edges: JSON.parse(result.edges_json)
    };
  }
  
  static update(projectId, metadata, nodes, edges) {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE diagrams 
      SET metadata_json = ?, nodes_json = ?, edges_json = ?, updated_at = datetime('now')
      WHERE project_id = ?
    `);
    
    const result = stmt.run(
      JSON.stringify(metadata),
      JSON.stringify(nodes),
      JSON.stringify(edges),
      projectId
    );
    
    if (result.changes === 0) {
      return null;
    }
    
    return this.getByProjectId(projectId);
  }
  
  static deleteByProjectId(projectId) {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM diagrams WHERE project_id = ?');
    const result = stmt.run(projectId);
    return result.changes > 0;
  }
  
  static getAll() {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM diagrams ORDER BY updated_at DESC');
    return stmt.all();
  }
}

module.exports = Diagram;

