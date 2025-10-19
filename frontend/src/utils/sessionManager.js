// Generate a UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Get or create session ID from LocalStorage
export function getOrCreateSessionId() {
  const STORAGE_KEY = 'erd-session-id';
  
  // Try to get existing session ID
  let sessionId = localStorage.getItem(STORAGE_KEY);
  
  // If no session ID exists, create a new one
  if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem(STORAGE_KEY, sessionId);
    console.log('Created new session ID:', sessionId);
  }
  
  return sessionId;
}

// Get current session ID (returns null if not exists)
export function getSessionId() {
  const STORAGE_KEY = 'erd-session-id';
  return localStorage.getItem(STORAGE_KEY);
}

// Clear session ID (for testing or logout scenarios)
export function clearSessionId() {
  const STORAGE_KEY = 'erd-session-id';
  localStorage.removeItem(STORAGE_KEY);
}

// Check if session exists
export function hasSession() {
  return getSessionId() !== null;
}

