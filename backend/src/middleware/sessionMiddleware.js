const { getDatabase, generateId } = require('../config/database');

function sessionMiddleware(req, res, next) {
  const db = getDatabase();
  
  // If user is authenticated, they don't need session-id
  // Don't touch req.session (it's managed by express-session)
  if (req.user) {
    // User is authenticated - no guest session needed
    req.guestSession = null;
    return next();
  }
  
  // For guest users, require session-id header
  const sessionId = req.headers['session-id'];
  
  if (!sessionId) {
    return res.status(400).json({ 
      error: 'Session ID required. Please include session-id header, or sign in to use your account.' 
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
  
  // Attach guest session to request object (don't override req.session from express-session)
  req.guestSession = {
    id: sessionId,
    created_at: session.created_at,
    last_active_at: session.last_active_at
  };
  
  next();
}

module.exports = sessionMiddleware;

