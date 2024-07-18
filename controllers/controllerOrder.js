const Order = require('../models/modelOrder')
const Screens = require('../models/modelScreens')
const serviceResponse = require('@/services/serviceResponse.js')
const httpCode = require('@/utilities/httpCode')
const convertPlayDateFormat = require('@/utilities/convertPlayDateFormat')

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

  // 會員頁面 - 取得訂單資料
  async getMemberOrder (memberId) {
    const selectedFields = 'movieName movielevel moviePlayDate moviePlayTime theater_size quantity seatOrdered createTime price payMethod total'
    const Orders = await Order.find({ memberId }).select(selectedFields)
    return Orders
  },

  // 管理頁面 - 取得訂單所有資料
  async getOrderData ({ type, payload }) {
    if (type === 'memberId') {
      const selectedFields = 'movieName moviePlayDate moviePlayTime seatOrdered theater_size status userEmail'
      const Orders = await Order.findById({ _id: payload }).select(selectedFields)
      return Orders
    } else if (type === 'dataForChart') {
      const selectedFields = 'createTime quantity total'

      try {
        const Orders = await Order.find().select(selectedFields)
        const monthsTemplate = []
        for (let index = 1; index < 13; index++) {
          if (index >= 10) {
            monthsTemplate.push({
              Month: `${index}`,
              Box: 0,
              Total: 0
            })
          } else {
            monthsTemplate.push({
              Month: `0${index}`,
              Box: 0,
              Total: 0
            })
          }
        }

        const newOrders = Orders.reduce((acc, currentValue) => {
          const { year, month } = convertPlayDateFormat(currentValue.createTime)

          if (!acc[year]) {
            // 初始化當年的月份資料 ,因此的深拷貝月份的模板進來 , 下面2種方式都可以
            acc[year] = JSON.parse(JSON.stringify(monthsTemplate))
            // acc[year] = monthsTemplate.map(monthData => ({ ...monthData }));
          }

          const monthIndex = acc[year].findIndex(item => item.Month === month)
          if (monthIndex !== -1) {
            acc[year][monthIndex].Box += currentValue.quantity
            acc[year][monthIndex].Total += currentValue.total
          }
          return acc
        }, {})

        return newOrders
      } catch (error) {
        throw serviceResponse.error(httpCode.NOT_FOUND, '查不到訂單資料')
      }
    } else if (type === 'dataForManagement') {
      try {
        const Orders = await Order.find()
        return Orders
      } catch (error) {
        throw serviceResponse.error(httpCode.NOT_FOUND, `${error.name} : ${error.message}`)
      }
    }
  },

  // 管理頁面 - 取得訂單筆數
  async getOrderCount (daterange) {
    try {
      let orderCount
      switch (daterange) {
        case 'all': orderCount = await Order.countDocuments()
          break
        default: orderCount = await Order.countDocuments()
          break
      }
      return orderCount
    } catch (error) {
      throw serviceResponse.error(httpCode.NOT_FOUND, '無法取得訂單數量')
    }
  },

  // 管理頁面 - 更新訂單資料
  async updateOrder (id, updatData) {
    try {
      await Order.findByIdAndUpdate(
        id,
        updatData,
        { returnDocument: 'after', runValidators: true, new: true }
      )
      /* 由於前端使用了Redux的RTK-Query，它有個標籤設置的機制，可以自動來抓取getOrderData API資料
        所以這邊只要再更新成功後，直接回傳'更新成功'的字串就好了，
        所以就不用像以之前一樣，再回傳全部的ducument或是更新後的單一docuement
      */
      return '更新成功'
    } catch (error) {
      console.log(' error=> ', error.name, error.message)
      throw serviceResponse.error(httpCode.NOT_FOUND, `${error.name} : ${error.message}`)
    }
  },

  // 管理頁面 - 刪除訂單
  async deleteOrder (id, deleteData) {
    const { screenId, seatOrdered } = deleteData
    /* 將 ['A排4號、'B排2號']這樣的資料轉成['A4','B2'] */
    const seatIds = seatOrdered.map(seat => seat.replace(/排|號/g, ''))
    try {
      // 先更新其Screens document的座位
      const updateResult = await Screens.findByIdAndUpdate(
        screenId,
        {
          $set: {
            'seatsStatus.$[seat].is_booked': false
          }
        },
        {
          arrayFilters: [{ 'seat.seat_id': { $in: seatIds } }],
          new: true,
          runValidators: true
        }
      )
      // 再來從新取得Screens的可訂位的座位數量
      const availableSeats = updateResult.seatsStatus.filter(seat => !seat.is_booked).length

      // 再將其座位數量寫回sereen的docuemnt裡
      await Screens.findByIdAndUpdate(
        screenId,
        {
          $set: { availableSeats }
        },
        {
          new: true,
          runValidators: true
        }
      )

      // 上面將screen的座位更新後(更新其座位狀態及數量)，最後再將該Order刪除
      await Order.findByIdAndDelete(id)
      return '刪除成功'
    } catch (error) {
      console.log(' error=> ', error.name, error.message)
      throw serviceResponse.error(httpCode.NOT_FOUND, `${error.name} : ${error.message}`)
    }
  }
}

module.exports = controllerOrder
