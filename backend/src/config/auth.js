const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      try {

        // Try to find existing user (User methods are synchronous, no await needed)
        let user = User.findByProviderId('google', profile.id);

        if (!user) {
          // Create new user
          user = User.create({
            provider: 'google',
            provider_id: profile.id,
            email: profile.emails?.[0]?.value || null,
            name: profile.displayName,
            avatar_url: profile.photos?.[0]?.value || null,
          });
          console.log('✓ Created new user:', user.email);
        } else {
          // Update last login for existing user
          User.updateLastLogin(user.id);
          console.log('✓ User logged in:', user.email);
        }

        return done(null, user);
      } catch (error) {
        console.error('Error in Google authentication:', error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  try {
    // User.getById is synchronous, no await needed
    const user = User.getById(id);
    done(null, user);
  } catch (error) {
    console.error('Error in deserializing user:', error);
    done(error, null);
  }
});

module.exports = passport;
