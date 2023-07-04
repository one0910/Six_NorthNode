const express = require('express')
const router = express.Router()
const serviceError = require('@/services/serviceError')
const controllerScreens = require('@/controllers/controllerScreens')
const serviceResponse = require('@/services/serviceResponse')
const httpCode = require('@/utilities/httpCode')

router.get(
  '/moviePlay',
  serviceError.asyncError(async (req, res, next) => {
    /**
         * #swagger.tags = ['Screen']
         * #swagger.summary = '目前所有上映中可訂位的電影'
         * #swagger.description = '目前所有上映中可訂位的電影'
         * #swagger.responses[200] = {
            description: '回傳範例資料',
            schema: {
              "status": "自行填寫",
              "data":[
                {
                  "movie":"(廳位)電影名稱",
                  "screenId":['6459143a5941f29f5db5c201','6459153a5941f29f5db5c203']
                }
              ]
            }
          }
         */

    // const { movieId } = req.params
    const moviePlay = await controllerScreens.getPlay()
    serviceResponse.success(res, moviePlay)
  })
)

router.post(
  '/moviePlayDate',
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

    // const { movieId } = req.params
    const { screenId } = req.body
    const moviePlayDate = await controllerScreens.getPlayDates(screenId)
    serviceResponse.success(res, moviePlayDate)
  })
)

router.post(
  '/moviePlayTime',
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

    const { screenId } = req.body
    const moviePlayTime = await controllerScreens.getPlayTime(screenId)
    serviceResponse.success(res, moviePlayTime)
  })
)

router.post(
  '/moviePlaySeats',
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

    const { screenId } = req.body
    const moviePlayTime = await controllerScreens.getSeatStatus(screenId)
    serviceResponse.success(res, moviePlayTime)
  })
)

router.post(
  '/screenAdd',
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
    const screen = await controllerScreens.addScreen(req)
    serviceResponse.success(res, screen)
  })
)

module.exports = router
