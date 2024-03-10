const tableCollectionEn = require("../db").db().collection("tableEn")
const tableCollectionEs = require("../db").db().collection("tableEs")
const surveyCollectionEn = require("../db").db().collection("surveyEn")
const surveyCollectionEs = require("../db").db().collection("surveyEs")
const dateCollection = require("../db").db().collection("date")
const clickDataCollection = require("../db").db().collection("clickData")

const mailerliteImport = require("../mailerliteImport")
const Table = require("../models/Table")
const MailerliteModel = require("../models/Mailerlite")

const formattedCurrentDate = Table.formattedCurrentDate

const tableUpdateTemplate = Table.tableUpdateTemplate

const surveyUpdateTemplate = Table.surveyUpdateTemplate

function flashMessagesMiddleware(req, res, next) {
  res.locals.errorMessages = req.flash("error")
  res.locals.successMessages = req.flash("success")
  next()
}

exports.home = async function (req, res) {
  if (req.session.isAuthenticated) {
    try {
      const surveyLastUpdate = await dateCollection.find().toArray()
      const clickLastUpdate = await clickDataCollection.find().toArray()
      const surveyDate = surveyLastUpdate[0].date
      const clickDate = clickLastUpdate[0].date
      const url = req.url
      res.render("home", { surveyDate, clickDate, url })
    } catch (error) {
      console.error("Error fetching data:", error)
      res.status(500).send("Internal Server Error")
    }
  } else {
    // Retrieve flash messages and render the login page with messages
    const errorMessages = req.flash("error")
    res.render("login", { errorMessages })
  }
}

exports.survey = async function (req, res) {
  if (req.session.isAuthenticated) {
    try {
      // Fetch data from the collection
      const tableDataEn = await tableCollectionEn.find().toArray()
      const tableDataEs = await tableCollectionEs.find().toArray()
      const surveyDataEn = await surveyCollectionEn.find().toArray()
      const surveyDataEs = await surveyCollectionEs.find().toArray()
      const lastUpdate = await dateCollection.find().toArray()
      const url = req.url
      res.render("survey", { tableDataEn, tableDataEs, lastUpdate, surveyDataEn, surveyDataEs, url })
    } catch (error) {
      console.error("Error fetching data:", error)
      res.status(500).send("Internal Server Error")
    }
  } else {
    // Retrieve flash messages and render the login page with messages
    const errorMessages = req.flash("error")
    res.render("login", { errorMessages })
  }
}

exports.clicks = async function (req, res) {
  if (req.session.isAuthenticated) {
    try {
      // Fetch data from the collection
      const clicks = await clickDataCollection.find().toArray()
      const lastUpdate = await clickDataCollection.find().toArray()
      const url = req.url
      res.render("click-history", { clicks, lastUpdate, url })
    } catch (error) {
      console.error("Error fetching data:", error)
      res.status(500).send("Internal Server Error")
    }
  } else {
    // Retrieve flash messages and render the login page with messages
    const errorMessages = req.flash("error")
    res.render("login", { errorMessages })
  }
}

exports.tableUpdate = async function (req, res) {
  try {
    const result = await mailerliteImport()
    const currentDate = formattedCurrentDate()
    const lastUpdate = await dateCollection.find().toArray()

    // Assuming `tableUpdateTemplate` returns the updated data
    if (lastUpdate[0].date !== currentDate) {
      await tableUpdateTemplate(result.tableDataEs, currentDate, tableCollectionEs)
      await tableUpdateTemplate(result.tableDataEn, currentDate, tableCollectionEn)
      await surveyUpdateTemplate(result.progressDataEs, currentDate, surveyCollectionEs)
      await surveyUpdateTemplate(result.progressDataEn, currentDate, surveyCollectionEn)
    }

    // Send the updated data as JSON response
    res.json({
      success: true,
      tableDataEs: result.tableDataEs,
      tableDataEn: result.tableDataEn,
      progressEs: result.progressDataEs,
      progressEn: result.progressDataEn,
      lastUpdate: lastUpdate[0].date,
      currentDate
    })
  } catch (error) {
    console.error("Error updating data:", error)
    res.status(500).json({ success: false, error: "Internal Server Error" })
  }
}

exports.clickUpdate = async function (req, res) {
  try {
    const result = await MailerliteModel.returnAutomation()
    const currentDate = formattedCurrentDate()
    const lastUpdate = await clickDataCollection.find().toArray()

    // Assuming `tableUpdateTemplate` returns the updated data
    if (lastUpdate && lastUpdate[0].date !== currentDate) {
      MailerliteModel.updateAutomation()
    }

    // Send the updated data as JSON response
    res.json({
      success: true,
      date: currentDate,
      general: {
        opens_count: result.dataClicks.opens_count,
        open_rate: result.dataClicks.open_rate,
        click_rate: result.dataClicks.click_rate,
        click_to_open_rate: result.dataClicks.click_to_open_rate
      },
      emails: result.emails
    })
  } catch (error) {
    console.error("Error updating data:", error)
    res.status(500).json({ success: false, error: "Internal Server Error" })
  }
}
