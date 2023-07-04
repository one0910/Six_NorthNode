const serviceResponse = {
  success (res, data) {
    res
      .send({
        status: true,
        data
        // newstartDate: data[0].newstartDate
      })
      .end()
  },
  error (httpStatus, errMessage, next) {
    const error = new Error(errMessage)
    error.statusCode = httpStatus
    error.isOperational = true
    if (next) next(error)
    return error
  }
}

module.exports = serviceResponse
