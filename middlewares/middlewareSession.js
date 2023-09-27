const session = require('express-session')
const config = require('@/utilities/config')
const googleSession = session({
  name: 'google.sid',
  secret: 'googleSecretKey',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 10,
    domain: config.COOKIE_DOMAIN,
    sameSite: config.COOKIE_SAMESITE
  }
})

const ecpaySession = session({
  name: 'ecpay.sid',
  secret: 'ecpaySecretKey',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 10,
    domain: config.COOKIE_DOMAIN
  }
})

module.exports = { googleSession, ecpaySession }
