const Order = require('../models/modelOrder')
const Screens = require('../models/modelScreens')
const serviceResponse = require('@/services/serviceResponse.js')
const httpCode = require('@/utilities/httpCode')

const controllerOrder = {
  async postOrder (req) {
    const newSeatOrdered = (req.body.seatOrdered).map(seat => {
      const row = seat.charAt(0)
      const number = seat.substring(1)
      return `${row}排${number}號`
    })

    const seatUpdates = req.body.seatOrdered.map(seatId => {
      return { 'seatsStatus.seat_id': seatId }
    })

    /* 先更新座位狀態及座位數量 */
    await Screens.findOneAndUpdate(
      /* 這裡先將對應的screen的document找出來，並將seat.seat_id的座位狀態設置為true */
      {
        _id: req.body.screenId,
        $or: seatUpdates
      },
      {
        $set: { 'seatsStatus.$[seat].is_booked': true }
        // $inc: { availableSeats: -req.body.seatOrdered.length }
      },
      {
        arrayFilters: [{ 'seat.seat_id': { $in: req.body.seatOrdered } }],
        new: true
      }
    ).then(async (newScreen) => {
      // 座位狀態確重新設置後，再將目可訂的座位數量更新
      const availableSeats = newScreen.seatsStatus.filter(seat => !seat.is_booked).length
      newScreen.availableSeats = availableSeats
      await newScreen.save()
      // await newScreen.updateOne(
      //   { _id: req.body.screenId },
      //   { $set: { availableSeats: 169 } }
      // )
    }).catch(_error => {
      // 若是從前端輸入的座位號碼並非screen裡的seatsStatus.seat_id，則判定輸入無所選座位
      if (_error.message === "Cannot read property 'seatsStatus' of null") {
        throw serviceResponse.error(httpCode.NOT_FOUND, '找不到所選座位，請再重新確認輸入的座位號碼')
      }
    })

    /* 更新完坐位狀態後，將資料寫進orederh的collecetion */
    const orders = await Order.create({
      userPhone: req.body.phoneNumber,
      userEmail: req.body.email,
      memberId: req.body.memberId,
      memberName: req.body.memberName,
      screenId: req.body.screenId,
      theater_size: req.body.theater_size,
      movieId: req.body.movieId,
      movieName: req.body.movie_name,
      movielevel: req.body.movie_level,
      moviePlayDate: req.body.movie_date,
      moviePlayTime: req.body.movie_time,
      seatOrdered: newSeatOrdered,
      price: req.body.price,
      quantity: req.body.quantity,
      total: req.body.total,
      payMethod: req.body.payMethod,
      status: req.body.status
    })
    const orderResponse = {}
    const ordersObject = orders.toObject()
    orderResponse.OrderId = ordersObject._id
    orderResponse.MovieName = `${ordersObject.movieName} (${ordersObject.theater_size})`
    orderResponse.MoviePlayDate = ordersObject.moviePlayDate
    orderResponse.MoviePlayTime = ordersObject.moviePlayTime
    orderResponse.OrderSeat = ordersObject.seatOrdered.map(item => `[${item}]`).join(' ')

    return orderResponse
  },

  async getMemberOrder (memberId) {
    const selectedFields = 'movieName movielevel moviePlayDate moviePlayTime theater_size quantity seatOrdered createTime price payMethod total'
    const Orders = await Order.find({ memberId }).select(selectedFields)
    return Orders
  },

  async getOrderData (orderId) {
    const selectedFields = 'movieName moviePlayDate moviePlayTime seatOrdered theater_size status userEmail'
    const Orders = await Order.findById({ _id: orderId }).select(selectedFields)
    return Orders
  },

  async getOrderCount () {
    try {
      const orderCount = await Order.countDocuments()
      return orderCount
    } catch (error) {
      throw serviceResponse.error(httpCode.NOT_FOUND, '無法取得訂單數量')
    }
  }
}

module.exports = controllerOrder
