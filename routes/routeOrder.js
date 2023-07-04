const express = require('express')
const router = express.Router()
const serviceError = require('@/services/serviceError')
const controllerOrder = require('@/controllers/controllerOrder')
const serviceResponse = require('@/services/serviceResponse')
const httpCode = require('@/utilities/httpCode')
const middlewareOrder = require('@/middlewares/middlewareOrder')

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

module.exports = router
