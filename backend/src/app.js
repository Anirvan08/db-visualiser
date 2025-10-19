const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./config/database');
const { startCleanupSchedule } = require('./services/cleanupService');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const projectRoutes = require('./routes/projectRoutes');
const diagramRoutes = require('./routes/diagramRoutes');

const app = express();
const PORT = process.env.PORT || 80;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize database and cleanup schedule
initDatabase();
startCleanupSchedule();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files from React build in production
if (NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  console.log(`Serving static files from: ${frontendPath}`);
}

// Session middleware for all API routes
app.use('/api', sessionMiddleware);

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/projects', diagramRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    port: PORT
  });
});

// Serve React app for all non-API routes in production
if (NODE_ENV === 'production') {
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
});
