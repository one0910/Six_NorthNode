const Screens = require('../models/modelScreens')
const mongoose = require('mongoose')
const Movie = require('../models/modelMovie')
const Theater = require('../models/modelTheater')
const serviceResponse = require('@/services/serviceResponse.js')
const httpCode = require('@/utilities/httpCode')
const convertFormat = require('@/utilities/convertFormat')

const controllerScreens = {
  async getPlay () {
    const screens = await Screens.find({ availableSeats: { $gt: 0 } }).select('availableSeats')
      .populate({
        path: 'movie',
        select: 'name'
      })
      .populate({
        path: 'theater',
        select: 'theaterType price'
      })
    const result = []
    const movieReduceData = {}

    screens.forEach(screen => {
      const screenObject = screen.toObject()
      if (screenObject.movie && screenObject.theater) {
        const movieNameKey = `(${screenObject.theater.theaterType}) ${screenObject.movie.name}`
        if (movieReduceData[movieNameKey]) {
          movieReduceData[movieNameKey].push(screenObject._id)
        } else {
          movieReduceData[movieNameKey] = [screenObject._id]
        }
      }
    })

    for (const key in movieReduceData) {
      result.push({
        movie: key,
        screenId: movieReduceData[key]
      })
    }
    return result
  },

  async getPlayDates (screenId) {
    const screens = await Screens.find({ _id: screenId }).select('palyDate')

    const movieDateReduce = {}
    const result = []
    screens.forEach(screen => {
      const screenObject = screen.toObject()
      const convertedStartDate = convertFormat.convertPlayDateFormat(screenObject.palyDate)
      screenObject.palyDate = convertedStartDate
      // console.log(' convertedStartDate=> ', convertedStartDate.date)
      if (convertedStartDate.date) {
        if (movieDateReduce[convertedStartDate.date]) {
          movieDateReduce[convertedStartDate.date].push(screenObject._id)
        } else {
          movieDateReduce[convertedStartDate.date] = [screenObject._id]
        }
      }
      // console.log('movieDateReduce => ', movieDateReduce)
    })
    for (const key in movieDateReduce) {
      if (Object.hasOwnProperty.call(movieDateReduce, key)) {
        result.push({
          date: key,
          screenId: movieDateReduce[key]
        })
      }
    }
    return result
  },

  async getPlayTime (screenId) {
    const screens = await Screens.find({ _id: screenId }).select('palyDate movie')
      .populate({
        path: 'movie',
        select: 'name time level'
      })
    const movieTimeReduce = {}
    const result = []
    const date = null
    screens.forEach(screen => {
      const screenObject = screen.toObject()
      // console.log(' screenObject=> ', screenObject)
      const convertedStartDate = convertFormat.convertPlayDateFormat(screenObject.palyDate)
      screenObject.palyDate = convertedStartDate

      if (convertedStartDate.time) {
        if (movieTimeReduce[convertedStartDate.time]) {
          movieTimeReduce[convertedStartDate.time].push(screenObject._id)
        } else {
          const movieLevel = ['普', '護', '導', '限'][screenObject.movie.level]
          const movieLength = convertFormat.convertTimeFormat(screenObject.movie.time)
          movieTimeReduce[convertedStartDate.time] = {
            id: screenObject._id,
            date: convertedStartDate.date,
            movieId: screenObject.movie.id,
            movieLength,
            movieLevel,
            price: screenObject.theater.price
          }
        }
      }
    })
    for (const key in movieTimeReduce) {
      if (Object.hasOwnProperty.call(movieTimeReduce, key)) {
        result.push({
          date: movieTimeReduce[key].date,
          time: key,
          movieId: movieTimeReduce[key].movieId,
          movieLength: movieTimeReduce[key].movieLength,
          movieLevel: movieTimeReduce[key].movieLevel,
          screenId: movieTimeReduce[key].id,
          price: movieTimeReduce[key].price
        })
      }
    }
    // 將最後的結果針對時間做排序
    result.sort(
      (a, b) => {
        return a.time.localeCompare(b.time)
      }
    )
    return result
  },

  async getSeatStatus (screenId) {
    const screens = await Screens.find({ _id: screenId }).select('seatsStatus')
    return screens
  },

  async addScreen (req) {
    console.log(' req.body=> ', req.body)
    const availableSeats = req.body.seatsStatus.filter(seat => !seat.is_booked).length
    console.log('availableSeats => ', availableSeats)
    const screens = await Screens.create({
      movie: req.body.movie,
      theater: req.body.theater,
      seatsStatus: req.body.seatsStatus,
      availableSeats,
      palyDate: req.body.palyDate
    })
    return screens
  }

}

module.exports = controllerScreens
