const serviceResponse = require('@/services/serviceResponse')
const httpCode = require('@/utilities/httpCode')

const help = {
  checkAdminAccount: (role) => {
    console.log('role => ', role)
    if (role !== 'admin') {
      throw serviceResponse.error(httpCode.UNAUTHORIZED, '非管理者帳號，無權限進入此頁')
    }
  }
}

module.exports = help
