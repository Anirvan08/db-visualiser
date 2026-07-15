const { getDatabase, generateId } = require('../config/database');

function sessionMiddleware(req, res, next) {
  const db = getDatabase();
  
  // Extract session ID from headers
  const sessionId = req.headers['session-id'];
  
  if (!sessionId) {
    return res.status(400).json({ 
      error: 'Session ID required. Please include session-id header.' 
    });
  }
  
  // Validate session exists, create if new
  let session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);
  
  if (!session) {
    // Create new session
    const createSessionStmt = db.prepare(`
      INSERT INTO sessions (id, created_at, last_active_at) 
      VALUES (?, datetime('now'), datetime('now'))
    `);
    
    createSessionStmt.run(sessionId);
    
    session = {
      id: sessionId,
      created_at: new Date().toISOString(),
      last_active_at: new Date().toISOString()
    };
    
    console.log(`Created new session: ${sessionId}`);
  } else {
    // Update last active timestamp
    const updateStmt = db.prepare(`
      UPDATE sessions 
      SET last_active_at = datetime('now') 
      WHERE id = ?
    `);
    
    updateStmt.run(sessionId);
    
    // Update session object
    session.last_active_at = new Date().toISOString();
  }
  
  // Attach session to request object
  req.session = session;
  
  next();
}

module.exports = sessionMiddleware;

