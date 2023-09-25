const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  DATABASE: process.env.DATABASE,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  PORT: process.env.PORT,
  HOST: process.env.NODE_ENV === 'development' ? 'localhost:3000' : 'coolmovie-server.koijinoblog.com',
  ROOT_HOST: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://coolmovie-server.koijinoblog.com',
  FRONTEND_HOST: process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://coolmovie-clinet.koijinoblog.com',
  COOKIE_SECURE: !`${(process.env.NODE_ENV === 'development')}`,
  COOKIE_SAMESITE: process.env.NODE_ENV === 'development' ? 'strict' : 'none',
  COOKIE_DOMAIN: process.env.NODE_ENV === 'development' ? 'localhost' : 'koijinoblog.com',
  JWT_SECRET: process.env.JWT_SECRET,
  FIRE_BASE: {
    TYPE: process.env.FIRE_BASE_TYPE,
    PROJECT_ID: process.env.FIRE_BASE_PROJECT_ID,
    PRIVATE_KEY_ID: process.env.FIRE_BASE_PRIVATE_KEY_ID,
    PRIVATE_KEY: process.env.FIRE_BASE_PRIVATE_KEY,
    CLIENT_EMAIL: process.env.FIRE_BASE_CLIENT_EMAIL,
    CLIENT_ID: process.env.FIRE_BASE_CLIENT_ID,
    AUTH_URI: process.env.FIRE_BASE_AUTH_URI,
    TOKEN_URI: process.env.FIRE_BASE_TOKEN_URI,
    AUTH_PROVIDER_X509_CERT_URL: process.env.FIRE_BASE_AUTH_PROVIDER_X509_CERT_URL,
    CLIENT_X509_CERT_URL: process.env.FIRE_BASE_CLIENT_X509_CERT_URL
  }
}
