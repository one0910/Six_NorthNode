const express = require('express')
const router = express.Router()
const serviceError = require('@/services/serviceError')
const controllerOrder = require('@/controllers/controllerOrder')
const controllerEcpayCheck = require('@/controllers/controllerEcpayCheck')
const controllerMail = require('@/controllers/controllerMail')
const serviceResponse = require('@/services/serviceResponse')
const httpCode = require('@/utilities/httpCode')
const middlewareOrder = require('@/middlewares/middlewareOrder')
const config = require('@/utilities/config')

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
    const order = await controllerOrder.getOrderData(orderId)
    serviceResponse.success(res, order)
  })
)

module.exports = router
