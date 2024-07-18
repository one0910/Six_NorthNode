const express = require('express')
const router = express.Router()
const serviceError = require('@/services/serviceError')
const controllerOrder = require('@/controllers/controllerOrder')
const controllerEcpayCheck = require('@/controllers/controllerEcpayCheck')
const controllerMail = require('@/controllers/controllerMail')
const serviceResponse = require('@/services/serviceResponse')
const help = require('@/utilities/help')

const httpCode = require('@/utilities/httpCode')
const middlewareOrder = require('@/middlewares/middlewareOrder')
const middlewareAuth = require('@/middlewares/middlewareAuth')
const config = require('@/utilities/config')
const { ecpaySession } = require('@/middlewares/middlewareSession')

router.use(ecpaySession)
router.post(
  '/',
  middlewareOrder,
  serviceError.asyncError(async (req, res, next) => {
    /**
         * #swagger.tags = ['Screen']
         * #swagger.summary = '所選擇電影可上映的日期'
         * #swagger.description = '傳入screenId，來得到該電影的可訂票日期'
         * #swagger.parameters['obj'] = {
            in: 'body',
            'schema': {
                "screenId": ["6459143a5941f29f5db5c201"],
            }
        }
        * #swagger.responses[200] = {
          description: '回傳範例資料',
          schema: {
            "status": "自行填寫",
            "data":[
              {
                "date":"5/20",
                "screenId":['6459143a5941f29f5db5c201','6459153a5941f29f5db5c203']
              }
            ]
          }
        }
         */
    const order = await controllerOrder.postOrder(req)
    serviceResponse.success(res, order)
  })
)

router.post(
  '/ecpayCheckout',
  serviceError.asyncError(async (req, res, next) => {
    /**
         * #swagger.tags = ['Screen']
         * #swagger.summary = '所選擇電影可上映的日期'
         * #swagger.description = '傳入screenId，來得到該電影的可訂票日期'
         * #swagger.parameters['obj'] = {
            in: 'body',
            'schema': {
                "screenId": ["6459143a5941f29f5db5c201"],
            }
        }
        * #swagger.responses[200] = {
          description: '回傳範例資料',
          schema: {
            "status": "自行填寫",
            "data":[
              {
                "date":"5/20",
                "screenId":['6459143a5941f29f5db5c201','6459153a5941f29f5db5c203']
              }
            ]
          }
        }
         */

    const ecpayHtmlFrom = await controllerEcpayCheck.check(req)
    serviceResponse.success(res, ecpayHtmlFrom)
  })
)
router.post(
  '/ecpayCheckout/return',
  serviceError.asyncError(async (req, res, next) => {
    res.json('1|OK')
    // serviceResponse.success(res, order)
  })
)

router.post(
  '/ecpayCheckout/checkComplete',
  serviceError.asyncError(async (req, res, next) => {
    console.log('req_checkComplete => ', req)
    console.log('req.session_checkComplete => ', req.session)
    console.log('req.session.sessionID_checkComplete => ', req.session.id)
    // setInterval(function () {
    //   console.log('check_complete_session_sessionID=>', req.session.id)
    // }, 1000)
    if (req.session.orderData) {
      req.session.orderData.payMethod = `綠界科技-${req.body.PaymentType}`
      req.body = { ...req.body, ...req.session.orderData }
      const order = await controllerOrder.postOrder(req)
      req.body.orderId = order.OrderId
      await controllerMail.sendOrderDetailMail(req)
      res.redirect(`${config.FRONTEND_HOST}/checkcomplete/${order.OrderId}`)
    } else {
      res.redirect(`${config.FRONTEND_HOST}/checkfail/`)
    }
  })
)

router.get(
  '/getMemberOrder',
  serviceError.asyncError(async (req, res, next) => {
    /**
         * #swagger.tags = ['Screen']
         * #swagger.summary = '所選擇電影可上映的日期'
         * #swagger.description = '傳入screenId，來得到該電影的可訂票日期'
         * #swagger.parameters['obj'] = {
            in: 'body',
            'schema': {
                "screenId": ["6459143a5941f29f5db5c201"],
            }
        }
        * #swagger.responses[200] = {
          description: '回傳範例資料',
          schema: {
            "status": "自行填寫",
            "data":[
              {
                "date":"5/20",
                "screenId":['6459143a5941f29f5db5c201','6459153a5941f29f5db5c203']
              }
            ]
          }
        }
         */
    const memberId = req.query.memberId
    const order = await controllerOrder.getMemberOrder(memberId)
    serviceResponse.success(res, order)
  })
)

router.get(
  '/getOrderData',
  serviceError.asyncError(async (req, res, next) => {
    /**
         * #swagger.tags = ['Screen']
         * #swagger.summary = '所選擇電影可上映的日期'
         * #swagger.description = '傳入screenId，來得到該電影的可訂票日期'
         * #swagger.parameters['obj'] = {
            in: 'body',
            'schema': {
                "screenId": ["6459143a5941f29f5db5c201"],
            }
        }
        * #swagger.responses[200] = {
          description: '回傳範例資料',
          schema: {
            "status": "自行填寫",
            "data":[
              {
                "date":"5/20",
                "screenId":['6459143a5941f29f5db5c201','6459153a5941f29f5db5c203']
              }
            ]
          }
        }
         */
    const orderId = req.query.orderId
    const order = await controllerOrder.getOrderData({ type: 'memberId', payload: orderId })
    serviceResponse.success(res, order)
  })
)

/* 取得所有定單資料 */
router.get(
  '/getOrderData/:parameter/:daterange',
  middlewareAuth.loginAuth,
  serviceError.asyncError(async (req, res, next) => {
    /**
         * #swagger.tags = ['Screen']
         * #swagger.summary = '所選擇電影可上映的日期'
         * #swagger.description = '傳入screenId，來得到該電影的可訂票日期'
         * #swagger.parameters['obj'] = {
            in: 'body',
            'schema': {
                "screenId": ["6459143a5941f29f5db5c201"],
            }
        }
        * #swagger.responses[200] = {
          description: '回傳範例資料',
          schema: {
            "status": "自行填寫",
            "data":[
              {
                "date":"5/20",
                "screenId":['6459143a5941f29f5db5c201','6459153a5941f29f5db5c203']
              }
            ]
          }
        }
         */

    help.checkAdminAccount(req.role)
    const { parameter, daterange } = req.params
    if (parameter === 'count') {
      // daterange這個參數則代表它要的範圍
      const orderCount = await controllerOrder.getOrderCount(daterange)
      serviceResponse.success(res, { count: orderCount })
    } else {
      const orderData = await controllerOrder.getOrderData({ type: parameter, payload: daterange })
      serviceResponse.success(res, { [parameter]: orderData })
    }
  })
)

// 管理頁面 - 修改訂單資料
router.patch('/updateOrder/:id',
  middlewareAuth.loginAuth,
  serviceError.asyncError(async (req, res, next) => {
  /**
   * #swagger.tags = ['User']
   * #swagger.security = [{ 'apiKeyAuth': [] }]
   * #swagger.summary = '修改會員資料'
   * #swagger.description = '修改會員資料'
   * * #swagger.parameters['body'] = {
      in: 'body',
      type: 'object',
      required: 'true',
      description: '修改會員資料用',
      schema:{
              "nickName": '使用者暱稱',
              "phoneNumber": '0912345678',
              "birthday":'Sat Apr 29 2023 16:20:13 GMT+0800 (台北標準時間)或2020-01-01',
              "profilePic":'上傳圖片回傳的URL'
          }
    }
    * #swagger.responses[200] = {
      description: '修改會員資料',
      schema: {
        "status": true,
        "data": {
          "_id": "644cce67945042a407ed1c21",
          "email": "z2@gmail.com",
          "nickName": "使用者暱稱",
          "profilePic": "上傳圖片回傳的URL",
          "createdAt": "2023-04-29T07:59:35.033Z",
          "updatedAt": "2023-04-29T08:14:38.516Z",
          "__v": 0,
          "birthday": "2023-04-29T08:14:30.000Z",
          "phoneNumber": "0912345678"
        },
      }
    }
   */

    help.checkAdminAccount(req.role)
    const { id } = req.params
    const result = await controllerOrder.updateOrder(id, req.body)
    serviceResponse.success(res, result)
  }))

// 管理頁面 - 刪除會員資料
router.delete('/deleteOrder/:id',
  middlewareAuth.loginAuth,
  serviceError.asyncError(async (req, res, next) => {
    help.checkAdminAccount(req.role)
    const { id } = req.params
    const result = await controllerOrder.deleteOrder(id, req.body)
    serviceResponse.success(res, result)
  }))

module.exports = router
