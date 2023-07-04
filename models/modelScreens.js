
const mongoose = require('mongoose')

const screensSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Types.ObjectId,
    ref: 'movie',
    required: true
  },
  theater: {
    type: mongoose.Types.ObjectId,
    ref: 'theater',
    required: true
  },
  seatsStatus: {
    type: [],
    required: true
  },
  availableSeats: {
    type: Number,
    required: true
  },
  palyDate: {
    type: Date,
    required: true
  },
  createTime: {
    type: Date,
    default: Date.now
  }
},
{
  versionKey: false,
  toJSON: {
    versionKey: false
  }
})

// screensSchema.virtual('movie', {
//   ref: 'movie',
//   foreignField: 'screen',
//   localField: '_id'
// })
screensSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'theater',
    select: 'theaterType price'
  })
  next()
})

const Screens = mongoose.model('screens', screensSchema)

module.exports = Screens
