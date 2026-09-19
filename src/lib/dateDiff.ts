export type PreciseDuration = {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

function addYears(date: Date, years: number) {
  const result = new Date(date)
  const month = result.getMonth()
  result.setDate(1)
  result.setFullYear(result.getFullYear() + years)
  result.setMonth(month)
  result.setDate(Math.min(date.getDate(), daysInMonth(result.getFullYear(), month)))
  return result
}

function addMonths(date: Date, months: number) {
  const result = new Date(date)
  const targetMonth = result.getMonth() + months
  result.setDate(1)
  result.setMonth(targetMonth)
  result.setDate(Math.min(date.getDate(), daysInMonth(result.getFullYear(), result.getMonth())))
  return result
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

export function getPreciseDuration(start: Date, now: Date): PreciseDuration {
  if (now.getTime() <= start.getTime()) {
    return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  let cursor = new Date(start)
  let years = 0
  let months = 0
  let days = 0

  while (addYears(cursor, 1) <= now) {
    cursor = addYears(cursor, 1)
    years += 1
  }
  while (addMonths(cursor, 1) <= now) {
    cursor = addMonths(cursor, 1)
    months += 1
  }

  const dayMilliseconds = 24 * 60 * 60 * 1000
  while (new Date(cursor.getTime() + dayMilliseconds) <= now) {
    cursor = new Date(cursor.getTime() + dayMilliseconds)
    days += 1
  }

  const remainingSeconds = Math.floor((now.getTime() - cursor.getTime()) / 1000)
  const hours = Math.floor(remainingSeconds / 3600)
  const minutes = Math.floor((remainingSeconds % 3600) / 60)
  const seconds = remainingSeconds % 60

  return { years, months, days, hours, minutes, seconds }
}
