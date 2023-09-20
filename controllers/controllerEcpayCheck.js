const EcpayPayment = require('ecpay_aio_nodejs')
const { MERCHANTID, HASHKEY, HASHIV } = process.env
const config = require('@/utilities/config')
const options = {
  OperationMode: 'Test', // Test or Production
  MercProfile: {
    MerchantID: MERCHANTID,
    HashKey: HASHKEY,
    HashIV: HASHIV
  },
  IgnorePayment: [
    'ATM',
    'CVS',
    'BARCODE',
    'AndroidPay',
    'ApplePay'
  ],
  IsProjectContractor: false
}

const controllerEcpayCheck = {
  async check (req) {
    req.session.orderData = req.body
    console.log(' req=> ', req)
    console.log(' req.session.orderData => ', req.session.orderData)
    console.log(' req.session.sessionID => ', req.session.id)
    const MerchantTradeDate = new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    const MerchantTradeNo = `Shuang${new Date().getTime()}`
    // const MerchantTradeNo = `${req.body.screenId}${new Date().getTime()}`
    const baseParam = {
      MerchantTradeNo, // 請帶20碼uid, ex: f0a0d7e9fae1bb72bc93
      // MerchantTradeDate: '2023/09/01 15:45:30', // ex: 2017/02/13 15:45:30
      MerchantTradeDate, // ex: 2017/02/13 15:45:30
      TotalAmount: (req.body.total).toString(),
      TradeDesc: '爽影票綠界金流測試',
      ItemName: `爽影票電影 - ${req.body.movie_name} [${req.body.theater_size}]`,
      ReturnURL: `${config.ROOT_HOST}/api/order/ecpayCheckout/return`,
      OrderResultURL: `${config.ROOT_HOST}/api/order/ecpayCheckout/checkComplete`
      // ClientBackURL: 'http://localhost:3000/index.html'
    }
    const ecpayHtmlFrom = new EcpayPayment(options).payment_client.aio_check_out_all(baseParam)
    // setInterval(function () {
    //   console.log('check_req_session_sessionID=>', req.session.id)
    // }, 1000)
    return ecpayHtmlFrom
  }

}

module.exports = controllerEcpayCheck
