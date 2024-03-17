function countWorkingDays(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  let count = 0

  for (let current = new Date(start); current <= end; current.setDate(current.getDate() + 1)) {
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++
    }
  }

  return count
}

exports.getPreviousPeriod = function getPreviousPeriod(startDate, endDate) {
  const count = countWorkingDays(startDate, endDate)
  const start = new Date(startDate)

  let current = new Date(start)
  let previousStartDate = new Date(start)
  let previousEndDate = new Date(start)

  let workingDaysCount = 0

  while (workingDaysCount < count) {
    current.setDate(current.getDate() - 1)
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDaysCount++
      previousStartDate = new Date(current)
    }
  }

  current = new Date(endDate)
  previousEndDate = new Date(previousStartDate)

  while (workingDaysCount > 0) {
    current.setDate(current.getDate() - 1)
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDaysCount--
      previousEndDate = new Date(current)
    }
  }

  return [previousStartDate.toISOString(), previousEndDate.toISOString()]
}

exports.calculatePercentageDifference = function (oldValue, newValue) {
  return ((newValue - oldValue) / oldValue) * 100
}
