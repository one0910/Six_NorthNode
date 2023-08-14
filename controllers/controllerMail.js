/* eslint-disable no-return-assign */
const modelMember = require('@/models/modelMember')
const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2

const controllerMail = {
  async sendOrderDetailMail (req) {
    const getMemberEmail = async () => {
      if (!req.body.email) {
        const member = await modelMember.findById({ _id: req.body.memberId })
        return member.email
      } else {
        return req.body.email
      }
    }
    const email = await getMemberEmail()
    const newSeatOrdered = (req.body.seatOrdered).map(seat => {
      const row = seat.charAt(0)
      const number = seat.substring(1)
      return `${row}排${number}號`
    })
    const quantityMessagg = (req.body.memberId) ? `爽影票會員優惠票 ${req.body.quantity} 張` : `爽影票一般票 ${req.body.quantity} 張`
    const htmlContent = `
    <div style="margin-left: 10px;">
    <h4>感謝您至爽影票購買本站電影票，您的訂票明細如下</h4>
    <table style="width: auto;border-collapse: collapse;font-family: Microsoft JhengHei, sans-serif;border: 1px solid #ddd;">
      <thead>
        <tr>
          <th colspan="2" style="text-align: center; background-color: #E7C673; height: 35px;">爽影票訂單明細</th>
        </tr>
      </thead>
      <tr>
        <td style="border: 1px solid #dddddd; padding:8px; width: 30%">訂票編號</td>
        <td style="border: 1px solid #dddddd; padding:8px; width: 55%">${req.body.orderId}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; padding:8px">電影</td>
        <td style="border: 1px solid #dddddd; padding:8px">${req.body.movie_name} (${req.body.movie_level})</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; padding:8px">電影場次</td>
        <td style="border: 1px solid #dddddd; padding:8px">${req.body.movie_date} ${req.body.movie_time}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; padding:8px">影廳</td>
        <td style="border: 1px solid #dddddd; padding:8px">${req.body.theater_size}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; padding:8px">座位</td>
        <td style="border: 1px solid #dddddd; padding:8px">
          ${newSeatOrdered.map(seat => seat).join('、')}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; padding:8px">票種張數</td>
        <td style="border: 1px solid #dddddd; padding:8px">${quantityMessagg}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; padding:8px">付款方式</td>
        <td style="border: 1px solid #dddddd; padding:8px">${req.body.payMethod}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #dddddd; padding:8px">費用總計</td>
        <td style="border: 1px solid #dddddd; padding:8px">${req.body.total}</td>
      </tr>
    </table>
    <p>如有任何訂票或購票問題，請至爽影票官網，聯繫客服</p>
  </div>
    `
    const oauth2Client = new OAuth2(
      process.env.GOOGLE_AUTH_CLIENTID,
      process.env.GOOGLE_AUTH_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    )
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_AUTH_REFRESH_TOKEN
    })
    const accessToken = oauth2Client.getAccessToken()
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'one0910@gmail.com',
        clientId: process.env.GOOGLE_AUTH_CLIENTID,
        clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_AUTH_REFRESH_TOKEN,
        accessToken
      }
    })
    const mailOptions = {
      from: '爽影票 <one0910@gmail.com>',
      to: email,
      subject: `爽影票購票成功通知 訂單編號[${req.body.orderId}]`,
      html: htmlContent
    }

    await transporter.sendMail(mailOptions)
    return '寄送成功'
  }
}

module.exports = controllerMail
