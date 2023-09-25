require('module-alias/register') // alias 別名 @ 為根目錄
const express = require('express')
const path = require('path')
const logger = require('morgan')
const cors = require('cors')
const serviceDB = require('@/services/serviceDB') // 引入自訂的 serviceDB
const swaggerUi = require('swagger-ui-express') // 引入 swagger-ui-express
const swaggerFile = require('./swagger_output.json')
const config = require('@/utilities/config')
const session = require('express-session')

// 引入 swagger 的 json 檔案
const app = express() // 建立 express 的實體
serviceDB.connections() // 建立資料庫連線

// 這裡先將google登入的passport初始化
require('./utilities/passportGoogleSSO')
const passport = require('passport')
const middlewareError = require('@/middlewares/middlewareError')

// Load routes 請使用 ./ 引入不然 swagger 會找不到
const routeExample = require('./routes/routeExample') // 引入自訂的 routeExample
const routeUpload = require('./routes/routeUpload') // 引入自訂的 routeUpload
const routeMember = require('./routes/routeMember')
const routeAdmin = require('./routes/routeAdmin')
const routeMovie = require('./routes/routeMovie')
const routeGoogle = require('./routes/routerGoogle')
const routeScreen = require('./routes/routeScreen')
const routeOrder = require('./routes/routeOrder')
const routeMail = require('./routes/routeMail')

// Set up middleware
app.use(logger('dev')) // 設定 morgan 的 logger，可以在 server 端看到請求的細節
app.use(express.json()) // 設定 express 可以解析 json
app.use(express.urlencoded({ extended: false })) // 設定 express 可以解析 urlencoded
app.use(express.static(path.join(__dirname, 'public'))) // 設定 express 可以讀取 public 資料夾內的檔案

console.log('config.FRONTEND_HOST=> ', config.FRONTEND_HOST)
console.log('process.env=> ', process.env.NODE_ENV)

// 設定 cors
app.use(cors({
  origin: config.FRONTEND_HOST,
  methods: 'GET,POST,PUT,DELETE,PUT',
  credentials: true
}))

// 啟用session

app.use(
  session({
    secret: 'ellontest',
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: false,
      maxAge: 1000 * 60 * 10,
      domain: `${(process.env.NODE_ENV === 'development') ? 'localhost' : 'koijinoblog.com'}`,
      sameSite: `${(process.env.NODE_ENV === 'development') ? 'strict' : 'none'}`,
      secure: !`${(process.env.NODE_ENV === 'development')}`
    }
  }))

app.use(passport.initialize())
app.use(passport.session())

// Set up routes 請使用 /api/xxx
app.use('/api/example', routeExample)
app.use('/api/upload', routeUpload)
app.use('/api/admin', routeAdmin)
app.use('/api/member', routeMember)
app.use('/api/movie', routeMovie)
app.use('/api/screens', routeScreen)
app.use('/api/order', routeOrder)
app.use('/api/mail', routeMail)
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerFile)) // 設定 swagger 的路由
app.use('/api/google', routeGoogle)

// Set up error handling
app.use(middlewareError) // 設定錯誤處理

// 程式出現重大錯誤時
process.on('uncaughtException', (err) => {
  // 記錄錯誤下來，等到服務都處理完後，停掉該 process
  console.error('Uncaughted Exception！')
  console.error(err)
  process.exit(1)
})

// 未捕捉到的 catch
process.on('unhandledRejection', (err, promise) => {
  console.error('未捕捉到的 rejection：', promise, '原因：', err)
})

module.exports = app
