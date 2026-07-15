// Load environment variables FIRST - before anything else
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const { initDatabase } = require('./config/database');
const { startCleanupSchedule } = require('./services/cleanupService');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const projectRoutes = require('./routes/projectRoutes');
const diagramRoutes = require('./routes/diagramRoutes');
const passport = require('./config/auth');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 80;
const NODE_ENV = process.env.NODE_ENV || 'development';


// Initialize database and cleanup schedule
initDatabase();
startCleanupSchedule();

// Middleware
app.use(cors(
  {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevents JavaScript access (security)
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from React build
// Try multiple possible paths for frontend/dist
const possiblePaths = [
  path.join(__dirname, '../../frontend/dist'),           // From backend/src when cd backend
  path.join(__dirname, '../../../frontend/dist'),        // Alternative path
  path.join(process.cwd(), 'frontend/dist'),             // From root
  path.join(process.cwd(), '../frontend/dist'),          // Alternative
];

let frontendPath = null;
for (const testPath of possiblePaths) {
  if (fs.existsSync(testPath) && fs.existsSync(path.join(testPath, 'index.html'))) {
    frontendPath = testPath;
    break;
  }
}

if (frontendPath) {
  app.use(express.static(frontendPath));
  console.log(`✓ Serving static files from: ${frontendPath}`);
} else {
  console.warn('⚠ Warning: frontend/dist directory not found. Tried paths:');
  possiblePaths.forEach(p => console.warn(`  - ${p} (exists: ${fs.existsSync(p)})`));
}

// API Routes
// Auth routes use Passport sessions (cookies), not the old session-id header
app.use('/api/auth', authRoutes);

// Project and diagram routes still use the old session-id header system
// (We'll migrate these to use user authentication later)
app.use('/api/projects', sessionMiddleware, projectRoutes);
app.use('/api/projects', sessionMiddleware, diagramRoutes);
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    port: PORT,
    frontendPath: frontendPath,
    cwd: process.cwd(),
    __dirname: __dirname
  });
});

// Serve React app for all non-API routes (catch-all for SPA routing)
// Use app.use() instead of app.get('/*') to avoid Express 5 route parsing issues
app.use((req, res) => {
  // Skip API routes - they should have been handled by routes above
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Try to serve index.html from frontend (for SPA routing)
  if (frontendPath) {
    const indexPath = path.join(frontendPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  
  // Fallback response
  res.status(404).json({ 
    error: 'Cannot GET /',
    message: 'Frontend files not found. Please ensure frontend/dist is included in deployment.',
    debug: {
      NODE_ENV,
      frontendPath,
      cwd: process.cwd(),
      __dirname: __dirname,
      triedPaths: possiblePaths
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
});
