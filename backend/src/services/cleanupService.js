const cron = require('node-cron');
const { getDatabase } = require('../config/database');

function deleteInactiveProjects() {
  const db = getDatabase();
  
  // Delete projects that haven't been accessed in 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const stmt = db.prepare(`
    DELETE FROM projects 
    WHERE last_accessed_at < ?
  `);
  
  const result = stmt.run(thirtyDaysAgo.toISOString());
  
  console.log(`Cleanup: Deleted ${result.changes} inactive projects`);
  return result.changes;
}

function deleteOrphanedSessions() {
  const db = getDatabase();
  
  // Delete sessions that have no associated projects
  const stmt = db.prepare(`
    DELETE FROM sessions 
    WHERE id NOT IN (SELECT DISTINCT session_id FROM projects)
  `);
  
  const result = stmt.run();
  
  console.log(`Cleanup: Deleted ${result.changes} orphaned sessions`);
  return result.changes;
}

function runCleanup() {
  console.log('Running scheduled cleanup...');
  try {
    const deletedProjects = deleteInactiveProjects();
    const deletedSessions = deleteOrphanedSessions();
    
    console.log(`Cleanup completed: ${deletedProjects} projects, ${deletedSessions} sessions deleted`);
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

function startCleanupSchedule() {
  // Run cleanup daily at 2 AM
  cron.schedule('0 2 * * *', runCleanup, {
    scheduled: true,
    timezone: "UTC"
  });
  
  console.log('Cleanup schedule started - will run daily at 2 AM UTC');
  
  // Run initial cleanup after 1 minute (for testing)
  setTimeout(runCleanup, 60000);
}

module.exports = {
  deleteInactiveProjects,
  deleteOrphanedSessions,
  runCleanup,
  startCleanupSchedule
};

