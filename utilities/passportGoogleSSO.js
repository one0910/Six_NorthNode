const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const config = require('./config')
const modelMember = require('@/models/modelMember')

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_AUTH_CLIENTID,
  clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
  callbackURL: `${config.ROOT_HOST}/api/google/callback`,
  passReqToCallback: true
},
async (req, accessToken, refreshToken, profile, cb) => {
  console.log(' req_sessionStore_new GoogleStrateg=> ', req)
  const googleMemberData = await modelMember.findOne({ googleId: profile.id })
  if (googleMemberData) {
    return cb(null, googleMemberData)
  } else {
    const data = {
      googleId: profile.id,
      email: profile.emails[0].value,
      nickName: profile.displayName,
      profilePic: profile.photos[0].value
    }
    const newMember = await modelMember.create(data)
    return cb(null, newMember)
  }
}
))

passport.serializeUser((memberData, cb) => {
  // console.log(' serializeUser_memberData_doc=> ', memberData._doc)
  // process.nextTick(function () {
  //   return cb(null, memberData.googleId)
  // })
  cb(null, memberData.googleId)
})

passport.deserializeUser(async (id, cb) => {
  console.log('deserializeUser_id=> ', id)
  const memberData = await modelMember.findOne({ googleId: id }).catch(err => {
    cb(err, null)
  })
  if (memberData) cb(null, memberData)
})
