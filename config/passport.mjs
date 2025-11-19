import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

export default function passportConfig(passport) {
  // Only configure Google OAuth if credentials are provided
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
          // Your callback logic here
        }
      )
    );
  } else {
    console.log('Google OAuth disabled - no credentials provided');
  }
}