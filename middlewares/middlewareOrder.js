const serviceResponse = require('@/services/serviceResponse')
const serviceError = require('@/services/serviceError')
const httpCode = require('@/utilities/httpCode')
const serviceJWT = require('@/services/serviceJWT')

/* 這裡做一個middleware 用來欄截確認前端是否有遺漏資料 (其實是練習用) */
const middlewareOlder = serviceError.asyncError(async (req, res, next) => {
  // 檢測req.body裡是否欄位有null、undefined、""值
  function findEmptyKeys (obj) {
    const emptyKeys = []
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, [key])) {
        const value = obj[key]
        console.log(' value=> ', value)
        if (value === null || value === undefined || value === '') {
          emptyKeys.push(key)
        }
      }
    }
    return emptyKeys.join('、')
  }
  const { email, phoneNumber, screenId, movieId, seatOrdered, quantity, total, status } = req.body

  if (status === 'quick') {
    /* 快速定單會多確認email及phoneNumber */
    if (!email || !phoneNumber || !screenId || !movieId || !seatOrdered || !quantity || !total) {
      throw serviceResponse.error(httpCode.NOT_ACCEPTABLE, `${findEmptyKeys(req.body)} 欄位不可為空`)
    }
  } else if (status === 'member') {
    if (!screenId || !movieId || !seatOrdered || !quantity || !total) {
      throw serviceResponse.error(httpCode.NOT_ACCEPTABLE, `${findEmptyKeys(req.body)} 欄位不可為空`)
    }
  }
  next()
})

module.exports = middlewareOlder
