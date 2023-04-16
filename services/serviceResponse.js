const serviceResponse = {
  success (res, data) {
    res
      .send({
        status: true,
        data
      })
      .end()
  },
  error (httpStatus, errMessage, next) {
    // create a new error object
    const error = new Error(errMessage)
    // set the error status code
    error.statusCode = httpStatus
    // set a boolean flag to indicate the type of error
    error.isOperational = true
    // pass the error to the next() function
    if (next) next(error)
    return error
  }
}

module.exports = serviceResponse
