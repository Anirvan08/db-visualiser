const express = require('express');
const passport = require('passport');

const router = express.Router();

// Route 1: Initiate Google OAuth login
// When user visits this, they'll be redirected to Google
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] // Request access to profile and email
  })
);

// Route 2: Google OAuth callback
// Google redirects here after user authenticates
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login-error' // If auth fails, redirect here
  }),
  (req, res) => {
    // Successful authentication!
    // req.user is now available (set by Passport)
    console.log('Login successful for:', req.user.email);
    
    // Redirect to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?login=success`);
  }
);

// Route 3: Check current user (who is logged in?)
router.get('/me', (req, res) => {
  if (req.user) {
    // User is authenticated - send their info
    const { id, email, name, avatar_url, created_at } = req.user;
    res.json({ 
      user: { id, email, name, avatar_url, created_at },
      authenticated: true 
    });
  } else {
    // User is not authenticated
    res.status(401).json({ 
      authenticated: false,
      error: 'Not authenticated' 
    });
  }
});

// Route 4: Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session destruction failed' });
      }
      
      // Clear the session cookie
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

module.exports = router;