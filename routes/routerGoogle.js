const express = require('express')
const router = express.Router()
const serviceError = require('@/services/serviceError')
const serviceResponse = require('@/services/serviceResponse')
const passport = require('passport')
const config = require('@/utilities/config')
const serviceJWT = require('@/services/serviceJWT')
const { googleSession } = require('@/middlewares/middlewareSession')

router.use(googleSession)
router.use(passport.initialize())
router.use(passport.session())
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

// router.get('/login/success', serviceError.asyncError(async (req, res, next) => {
//   console.log('req_/login/success => ', req)
//   const data = { signinRes: null, token: '' }
//   data.signinRes = req.user
//   data.token = serviceJWT.generateJWT(req.user)
//   serviceResponse.success(res, data)
// }))

router.get('/login/success', serviceError.asyncError(async (req, res, next) => {
  // console.log('req.session_/login/success => ', req)
  // console.log('req.session_id/login/success => ', req.session.id)
  const data = { signinRes: null, token: '' }
  data.signinRes = req.user
  data.token = serviceJWT.generateJWT(req.user)
  serviceResponse.success(res, data)
}))

router.get('/logout',
  serviceError.asyncError(async (req, res, next) => {
    req.session.destroy(() => {
      res.clearCookie('google.sid')
      // res.redirect(config.FRONTEND_HOST)
    })
    // console.log(' req_logout=> ', req)
  })
)

module.exports = router
