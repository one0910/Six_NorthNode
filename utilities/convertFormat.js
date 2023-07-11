const moment = require('moment-timezone')

const convertPlayDateFormat = (playDate) => {
  // 使用 Moment.js 轉換日期到指定的時區
  const date = moment(playDate).tz('Asia/Taipei')

  const year = date.year()
  const month = (date.month() + 1).toString().padStart(2, '0')
  const day = date.date().toString().padStart(2, '0')

  const weekdays = {
    0: '(日)',
    1: '(一)',
    2: '(二)',
    3: '(三)',
    4: '(四)',
    5: '(五)',
    6: '(六)'
  }

  const weekday = weekdays[date.day()]
  const dateFormatted = `${year}/${month}/${day} ${weekday}`

  const hours = date.hours()
  const minutes = date.minutes().toString().padStart(2, '0')

  return {
    year,
    date: dateFormatted,
    time: `${hours}:${minutes}`
  }
}

const convertTimeFormat = (num) => {
  const hour = Math.floor(num / 60)
  const minute = num % 60
  return `${hour}時${minute.toString().padStart(2, '0')}分`
}

module.exports = { convertPlayDateFormat, convertTimeFormat }
