
const Movie = require('../models/modelMovie')
const serviceResponse = require('@/services/serviceResponse.js')
const httpCode = require('@/utilities/httpCode')
const convertFormat = require('@/utilities/convertFormat')

const controllerMovie = {
  async createMovie (
    name,
    imgs,
    level,
    desc,
    time,
    actors,
    videos,
    status,
    releaseData,
    createTime
  ) {
    const newMovie = await Movie.create({
      name,
      imgs,
      level,
      desc,
      time,
      actors,
      videos,
      status,
      releaseData,
      createTime
    })
    return newMovie
  },

  async getMovies (isRelease, id) {
    const today = new Date().setHours(0, 0, 0, 0)
    const selectedFields = 'imgs name id releaseData'
    if (!id && isRelease === 'true') {
      const result = await Movie.find({ releaseData: { $lt: today } })
        .select(selectedFields)
        .sort({ releaseData: 1 })
      return result
    } else if (id && isRelease === 'true') {
      const movieScreens = await Movie.findById(id)
        .populate({
          path: 'screens',
          select: 'palyDate theater'
        })

      const movieScreensObject = movieScreens.toObject()
      // 整理原始資料
      const organizedData = movieScreensObject.screens.reduce((accumulator, currentValue) => {
        const convertedStartDate = convertFormat.convertPlayDateFormat(currentValue.palyDate)
        const date = convertedStartDate.date
        const time = convertedStartDate.time

        // 如果該日期已存在於累積的資料中
        if (accumulator[date]) {
          // 如果該放映廳已存在於該日期的累積資料中
          if (accumulator[date].screenType[currentValue.theater.theaterType]) {
            accumulator[date].screenType[currentValue.theater.theaterType].push({
              time,
              screenId: currentValue._id,
              price: currentValue.theater.price
            })
            // 針對時間做排序
            accumulator[date].screenType[currentValue.theater.theaterType].sort(
              (a, b) => {
                return a.time.localeCompare(b.time)
              }
            )
          } else {
            // 如果該放映廳未存在於該日期的累積資料中
            accumulator[date].screenType[currentValue.theater.theaterType] = [{
              time,
              screenId: currentValue._id,
              price: currentValue.theater.price
            }]
          }
        } else {
          // 如果該日期未存在於累積的資料中
          accumulator[date] = {
            date,
            screenType: {
              [currentValue.theater.theaterType]: [{
                time,
                screenId: currentValue._id,
                price: currentValue.theater.price
              }]
            }
          }
        }
        return accumulator
      }, {})

      movieScreensObject.screens = Object.values(organizedData)
      return movieScreensObject
    } else if (id && isRelease === 'false') {
      const movieScreens = await Movie.findById(id)
      const movieScreensObject = movieScreens.toObject()
      return movieScreensObject
    } else {
      const result = await Movie.find({ releaseData: { $gt: today } }).select(selectedFields)
      return result
    }
  },

  async getMovieCount () {
    try {
      const movieCount = await Movie.countDocuments()
      return movieCount
    } catch (error) {
      throw serviceResponse.error(httpCode.NOT_FOUND, '無法取得電影數量')
    }
  },

  async updateMovie (id, name, level, desc, releaseData) {
    const updatedMovie = await Movie.findByIdAndUpdate(
      id, {
        name,
        level,
        desc,
        releaseData
      }, { new: true, returnDocument: 'after' })

    return updatedMovie
  },
  async deleteOneMovie (id) {
    const movie = await Movie.findById(id)
    if (!movie) {
      return serviceResponse.error(httpCode.NOT_FOUND, '找不到電影')
    }
    const deleteMove = await Movie.findByIdAndDelete(id)
    return deleteMove
  }

}

module.exports = controllerMovie
