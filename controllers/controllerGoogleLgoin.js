const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const modelMember = require('@/models/modelMember')

passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_AUTH_CLIENTID,
    clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/api/member/google/callback'
  },
  async function (accessToken, refreshToken, profile, cb) {
    try {
      const user = await modelMember.findOrCreate(
        {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value
        }
      )
      return cb(null, user)
    } catch (err) {
      return cb(err)
    }
  }
  ))
