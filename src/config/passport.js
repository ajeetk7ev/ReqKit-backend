import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserRepository } from '../repositories/user.repository.js';
import logger from '../utils/logger.js';

const configurePassport = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_PLACEHOLDER';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'GOOGLE_CLIENT_SECRET_PLACEHOLDER';
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || '/api/v1/auth/google/callback';

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          const googleId = profile.id;
          const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : '';
          const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || 'Google User';

          if (!email) {
            return done(new Error('No email found in Google profile'), null);
          }

          // Check if user exists by googleId or email
          let user = await UserRepository.findByGoogleId(googleId);
          if (!user) {
            user = await UserRepository.findByEmail(email);
            if (user) {
              // Link googleId to existing email account
              user.googleId = googleId;
              if (!user.avatar) user.avatar = avatar;
              await user.save();
            } else {
              // Create new user account via Google
              user = await UserRepository.create({
                name,
                email,
                googleId,
                avatar,
              });
            }
          }
          return done(null, user);
        } catch (error) {
          logger.error(`Passport Google Strategy Error: ${error.message}`);
          return done(error, null);
        }
      }
    )
  );
};

export default configurePassport;
