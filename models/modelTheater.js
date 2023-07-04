const mongoose = require('mongoose')

const Theater = mongoose.model(
  'theater',
  new mongoose.Schema({
    theaterType: {
      type: String,
      enum: ['數位廳', '豪華廳'],
      required: [true, '廳位未填寫']
    },
    seats: {
      type: Array,
      default: []
    },
    price: {
      type: Number,
      required: [true, '價格未填寫'],
      default: 0
    },
    createTime: {
      type: Date,
      default: Date.now,
      select: false,
      required: true
    }
  }, {
    toJSON: {
      versionKey: false
    }
  })
)

module.exports = Theater
