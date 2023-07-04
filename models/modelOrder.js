const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
  {
    userPhone: {
      type: String,
      default: ''
    },
    userEmail: {
      type: String,
      default: ''
    },
    memberId: {
      type: mongoose.Schema.ObjectId,
      ref: 'member',
      default: ''
    },
    memberName: {
      type: String,
      default: ''
    },
    screenId: {
      type: mongoose.Schema.ObjectId,
      ref: 'screens',
      required: [true, '需傳入screenId']
    },
    theater_size: {
      type: String,
      required: [true, '需傳入theater_size(影龐大小)']
    },
    movieId: {
      type: mongoose.Schema.ObjectId,
      ref: 'movie',
      required: [true, '需傳入movieId']
    },
    movieName: {
      type: String,
      required: [true, '需傳入movieName']
    },
    movielevel: {
      type: String,
      required: [true, '需傳入movielevel']
    },
    moviePlayDate: {
      type: String,
      required: [true, '需傳入moviePlayDate(電影上映日期)']
    },
    moviePlayTime: {
      type: String,
      required: [true, '需傳入moviePlayTime(電影上映時間)']
    },
    seatOrdered: {
      type: Array,
      required: [true, '需傳入seatOrdered(已劃座位)']
    },
    price: {
      type: Number,
      required: [true, '需傳入price(票價)']
    },
    quantity: {
      type: Number,
      required: [true, '需傳入quantity(張數)']
    },
    total: {
      type: Number,
      required: [true, '需傳入total(總共花費)']
    },
    status: {
      type: String,
      required: [true, '需傳入status(使用者是否快速購票)']
    },
    createTime: {
      type: Date,
      default: Date.now,
      select: false,
      required: true
    }
  }, {
    versionKey: false,
    toJSON: {
      versionKey: false,
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
)

const Order = mongoose.model('orders', orderSchema)

module.exports = Order
