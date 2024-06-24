const jwt = require('jsonwebtoken')
const serviceResponse = require('@/services/serviceResponse')
const config = require('@/utilities/config')
const httpCode = require('@/utilities/httpCode')
const serviceJWT = {
  generateJWT: (user) => {
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_DAY
    })

    return token
  },

  // 驗證 token 正確性
  decode: async (token) => {
    try {
      const payload = await jwt.verify(token, config.JWT_SECRET)
      return payload
    } catch (err) {
      throw serviceResponse.error(httpCode.UNAUTHORIZED, 'token有誤，批配異常')
    }
  }
}
module.exports = serviceJWT
