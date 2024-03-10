const dateCollection = require("../db").db().collection("date")

exports.formattedCurrentDate = function () {
  const currentDate = new Date()

  const day = currentDate.getDate().toString().padStart(2, "0")
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0") // Months are zero-indexed
  const year = currentDate.getFullYear().toString()

  const formattedDate = `${day}.${month}.${year}`

  return formattedDate
}

exports.surveyUpdateTemplate = async function (res, currentDate, collection) {
  // Create a new survey document structure
  const newSurveyDocument = {
    date: currentDate,
    survey: []
  }
  for (const item of res) {
    // Check if the survey already exists in the 'collection'
    const existingSurvey = await collection.findOne({ date: currentDate, "survey.title": item.basic.title })

    if (!existingSurvey) {
      // If the survey does not exist, add it to the new survey document
      newSurveyDocument.survey.push({
        title: item.basic.title,
        items: item.survey
      })
    }
  }

  // Insert new survey items into the 'collection'
  if (newSurveyDocument.survey.length > 0) {
    // console.log("Survey does not exist. Inserting new document.")
    await collection.insertOne(newSurveyDocument)
  }
}

exports.tableUpdateTemplate = async function (res, currentDate, collection) {
  const lastUpdated = await dateCollection.findOne({ date: currentDate })
  if (!lastUpdated) {
    await dateCollection.findOneAndUpdate({ date: currentDate }, { $set: { date: currentDate } })
  }
  if (!lastUpdated || !lastUpdated.date !== currentDate) {
    res.forEach(async function (item) {
      const existingFeedback = await collection.findOne({ text: item.Answer })

      if (!existingFeedback) await collection.insertOne({ title: item.Subscriber, text: item.Answer })
    })
  }
}
