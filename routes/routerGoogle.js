const express = require('express')
const router = express.Router()
const serviceError = require('@/services/serviceError')
const serviceResponse = require('@/services/serviceResponse')
const passport = require('passport')
const config = require('@/utilities/config')
const serviceJWT = require('@/services/serviceJWT')
const modelMember = require('@/models/modelMember')

router.get('/login',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get('/callback',
  passport.authenticate('google', {
    session: true,
    failureMessage: 'Cannot login to Google, please try again later!',
    failureRedirect: `${config.FRONTEND_HOST}/googleLogin/error`,
    successRedirect: `${config.FRONTEND_HOST}/googleLogin/success`
  })
)

router.get('/login/success', serviceError.asyncError(async (req, res, next) => {
  console.log('req_/login/success => ', req)
  const memberData = await modelMember.findOne({ googleId: req.user })
  console.log(' memberData=> ', memberData)
  const data = { signinRes: null, token: '' }
  data.signinRes = memberData._doc
  data.token = serviceJWT.generateJWT(memberData._doc)
  serviceResponse.success(res, data)
}))

// router.get('/login/success', serviceError.asyncError(async (req, res, next) => {
//   console.log('req_/login/success => ', req)
//   const data = { signinRes: null, token: '' }
//   data.signinRes = req.user
//   data.token = serviceJWT.generateJWT(req.user)
//   serviceResponse.success(res, data)
// }))
module.exports = router
