const convertPlayDateFormat = (palyDate) => {
  const date = new Date(palyDate)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  // const day = date.getDate().toString().padStart(2, '0')
  const day = date.toISOString().substring(8, 10)
  const dateFormatted = `${month}/${day}`
  const timeFormatted = date.toISOString().substring(11, 16)

  return {
    year,
    date: dateFormatted,
    time: timeFormatted
  }
}
module.exports = convertPlayDateFormat
