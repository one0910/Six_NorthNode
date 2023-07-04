const convertPlayDateFormat = (palyDate) => {
  const date = new Date(palyDate)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  // const day = date.toISOString().substring(8, 10)
  const day = date.getDate().toString().padStart(2, '0')
  // const weekday = ["(日)", "(一)", "(二)", "(三)", "(四)", "(五)", "(六)"][date.getDay()]
  const weekdays = {
    0: '(日)',
    1: '(一)',
    2: '(二)',
    3: '(三)',
    4: '(四)',
    5: '(五)',
    6: '(六)'
  }
  const weekday = weekdays[date.getDay()]
  const dateFormatted = `${year}/${month}/${day} ${weekday}`
  // const timeFormatted = date.toISOString().substring(11, 16)
  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, '0')
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
