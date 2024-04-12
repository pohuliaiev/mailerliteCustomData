const dotenv = require("dotenv")
dotenv.config()
const tableCollectionEn = require("../db").db().collection("tableEn")
const tableCollectionEs = require("../db").db().collection("tableEs")
const surveyCollectionEn = require("../db").db().collection("surveyEn")
const surveyCollectionEs = require("../db").db().collection("surveyEs")
const dateCollection = require("../db").db().collection("date")
const clickDataCollection = require("../db").db().collection("clickData")
const reviewsCollection = require("../db").db().collection("reviews")
const seoCollection = require("../db").db().collection("seo")
const cornerstonesCollection = require("../db").db().collection("cornerstones")
const crispReportCollection = require("../db").db().collection("crispReports")

const mailerliteImport = require("../mailerliteImport")
const Table = require("../models/Table")
const MailerliteModel = require("../models/Mailerlite")
const CrispData = require("../models/Crisp")
const DateRange = require("../models/DateRange")
const Reviews = require("../models/Reviews")
const { ObjectId } = require("mongodb")
const { returnSeoValues, getTopPagesWithTitles } = require("../models/Seo")
const { WebClient } = require("@slack/web-api")
//const Test = require("../test")

const formattedCurrentDate = Table.formattedCurrentDate

const tableUpdateTemplate = Table.tableUpdateTemplate

const surveyUpdateTemplate = Table.surveyUpdateTemplate

function formatDate(dateString) {
  const [day, month, year] = dateString.split(".")
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}

const parseDate = dateStr => {
  const parts = dateStr.split(".")
  return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
}

function sortingCollectionByDate(collection) {
  collection.sort((a, b) => parseDate(b.date) - parseDate(a.date))
  return collection
}

function filterBySite(arr, site) {
  return arr.filter(obj => obj.site === site)
}

exports.home = async function (req, res) {
  if (req.session.isAuthenticated) {
    try {
      const surveyLastUpdate = await dateCollection.find().toArray()
      const clickLastUpdate = await clickDataCollection.find().toArray()
      const surveyDate = surveyLastUpdate[0].date
      const clickDate = clickLastUpdate[0].date
      const url = req.url

      //  Test.testUpdate()
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
      const lastUpdateSort = await surveyCollectionEn.find().sort({ date: -1 }).toArray()
      const lastUpdate = lastUpdateSort[0].date
      const url = req.url
      console.log(lastUpdate)
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

      clicks.sort((a, b) => parseDate(b.date) - parseDate(a.date))
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

exports.showAutomation = function (collection, postUrl, pageTitle) {
  return async function (req, res, next) {
    if (req.session.isAuthenticated) {
      try {
        // Fetch data from the collection

        const clicks = await collection.find().toArray()
        clicks.sort((a, b) => parseDate(b.date) - parseDate(a.date))
        const lastUpdate = clicks
        const url = req.url
        res.render("general", { clicks, lastUpdate, url, postUrl, pageTitle })
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
}

exports.showCrispAutomation = function (collection, postUrl, pageTitle) {
  return async function (req, res, next) {
    if (req.session.isAuthenticated) {
      try {
        // Fetch data from the collection

        const clicks = await collection.find().toArray()
        clicks.sort((a, b) => parseDate(b.date) - parseDate(a.date))
        const lastUpdate = clicks
        const url = req.url
        res.render("crisp-automation", { clicks, lastUpdate, url, postUrl, pageTitle })
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
}

exports.seoDisplay = function (collection, pageTitle) {
  return async function (req, res, next) {
    if (req.session.isAuthenticated) {
      try {
        // Fetch data from the collection

        const seo = await collection.find().toArray()
        const companio = filterBySite(seo, "companio.co")
        const one = filterBySite(seo, "one.companio.co")
        const tuempresa = filterBySite(seo, "tuempresaenestonia.com")
        companio.sort((a, b) => parseDate(b.date) - parseDate(a.date))
        one.sort((a, b) => parseDate(b.date) - parseDate(a.date))
        tuempresa.sort((a, b) => parseDate(b.date) - parseDate(a.date))

        const lastUpdateCompanio = companio[0].date
        const lastUpdateOne = one[0].date
        const lastUpdateTuempresa = tuempresa[0].date
        const url = req.url
        res.render("seo", { companio, one, url, tuempresa, pageTitle, lastUpdateCompanio, lastUpdateOne, lastUpdateTuempresa })
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
}

exports.rewievsDisplay = function (collection, postUrl, pageTitle) {
  return async function (req, res, next) {
    if (req.session.isAuthenticated) {
      try {
        // Fetch data from the collection

        const reviews = await collection.find().toArray()

        reviews.sort((a, b) => parseDate(b.date) - parseDate(a.date))

        const lastUpdate = reviews[0].date

        const url = req.url
        res.render("reviews", { reviews, pageTitle, url, postUrl, lastUpdate })
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
}

exports.apiController = function (collection) {
  return async function (req, res, next) {
    try {
      const data = await collection.find().toArray()
      res.json(sortingCollectionByDate(data))
    } catch (error) {
      console.error("Error fetching data:", error)
      res.status(500).send("Internal Server Error")
    }
  }
}

exports.testApiController = function () {
  return async function (req, res, next) {
    try {
      res.json({ test: "Hello zappier" })
    } catch (error) {
      console.error("Error fetching data:", error)
      res.status(500).send("Internal Server Error")
    }
  }
}

exports.crispAgentsApiController = function () {
  return async function (req, res, next) {
    try {
      const agents = await CrispData.agents()
      res.json({ agents })
    } catch (error) {
      console.error("Error fetching data:", error)
      res.status(500).send("Internal Server Error")
    }
  }
}

exports.apiDocs = function (pageTitle) {
  return async function (req, res, next) {
    if (req.session.isAuthenticated) {
      try {
        const url = req.url
        res.render("api", { url, pageTitle })
      } catch (error) {
        console.error("Error fetching data:", error)
        res.status(500).send("Internal Server Error")
      }
    } else {
      const errorMessages = req.flash("error")
      res.render("login", { errorMessages })
    }
  }
}

exports.config = function (pageTitle) {
  return async function (req, res, next) {
    try {
      const url = req.url
      res.render("config", { url, pageTitle })
    } catch (error) {
      console.error("Error fetching data:", error)
      res.status(500).send("Internal Server Error")
    }
  }
}

exports.showMailerlitePage = function (pageTitle) {
  return async function (req, res, next) {
    if (req.session.isAuthenticated) {
      try {
        // Fetch data from the collection

        const url = req.url
        res.render("mailerliteMain", { url, pageTitle })
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
}

exports.CornerStonesDisplay = function (pageTitle) {
  return async function (req, res) {
    if (req.session.isAuthenticated) {
      try {
        const cornerstonesTable = await cornerstonesCollection.find().toArray()
        cornerstonesTable.sort((a, b) => parseDate(b.date) - parseDate(a.date))
        const lastUpdated = cornerstonesTable[0].date
        const empresaData = cornerstonesTable.filter(item => item.sites.url === process.env.SITEURL4)
        const cData = cornerstonesTable.filter(item => item.sites.url === process.env.SITEURL1)
        const cDataEn = cData.filter(item => item.sites[1].articlesEn)
        const cDataEs = cData.filter(item => item.sites[1].articlesEs)
        cDataEn.sort((a, b) => b.clicks - a.clicks)
        cDataEs.sort((a, b) => b.clicks - a.clicks)
        empresaData.sort((a, b) => b.clicks - a.clicks)
        const url = req.url
        res.render("cornerstones", { url, pageTitle, lastUpdated, empresaData, cDataEn, cDataEs, cornerstonesTable })
      } catch (error) {
        console.error("Error updating data:", error)
        res.status(500).json({ success: false, error: "Internal Server Error" })
      }
    } else {
      const errorMessages = req.flash("error")
      res.render("login", { errorMessages })
    }
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
    const result = await MailerliteModel.returnAutomation(process.env.AUTID)
    const currentDate = formattedCurrentDate()
    const lastUpdate = await clickDataCollection.find().toArray()

    // Assuming `tableUpdateTemplate` returns the updated data
    if (lastUpdate && lastUpdate[0].date !== currentDate) {
      MailerliteModel.updateAutomation(clickDataCollection, process.env.AUTID)
    }

    // Send the updated data as JSON response
    res.json({
      success: true,
      date: currentDate,
      general: {
        opens_count: result.dataClicks.opens_count,
        open_rate: result.dataClicks.open_rate,
        click_rate: result.dataClicks.click_rate,
        click_to_open_rate: result.dataClicks.click_to_open_rate,
        total: result.dataClicks.total
      },
      emails: result.emails
    })
  } catch (error) {
    console.error("Error updating data:", error)
    res.status(500).json({ success: false, error: "Internal Server Error" })
  }
}

exports.automationUpdate = function (collection, id) {
  return async function (req, res) {
    try {
      const result = await MailerliteModel.returnAutomation(id)
      const currentDate = formattedCurrentDate()
      const lastUpdate = await collection.findOne({ date: currentDate })
      // Assuming `tableUpdateTemplate` returns the updated data
      if (!lastUpdate) {
        await MailerliteModel.updateAutomation(collection, id)
      }

      // Send the updated data as JSON response
      res.json({
        success: true,
        date: currentDate,
        general: {
          opens_count: result.dataClicks.opens_count,
          open_rate: result.dataClicks.open_rate,
          click_rate: result.dataClicks.click_rate,
          click_to_open_rate: result.dataClicks.click_to_open_rate,
          total: result.dataClicks.total
        },
        emails: result.emails
      })
    } catch (error) {
      console.error("Error updating data:", error)
      res.status(500).json({ success: false, error: "Internal Server Error" })
    }
  }
}

exports.reviewsUpdate = function () {
  return async function (req, res) {
    try {
      const allReviews = await Reviews.getReviews()

      const currentDate = formattedCurrentDate()
      const lastUpdate = await reviewsCollection.findOne({ date: currentDate })

      const obj = {
        date: currentDate,
        trustpilot: {
          trustRanking: allReviews.ratings.ratingTrustpilot,
          trustNumber: allReviews.ratings.reviewsTrustpilot
        },
        google: {
          googleRanking: allReviews.ratings.googleRating,
          googleNumber: allReviews.ratings.googleNumber
        },
        eresidence: {
          eresidenceRanking: allReviews.ratings.ratingEresidence,
          eresidenceNumber: allReviews.ratings.reviewsEresidence
        },
        inforegister: allReviews.ratings.ratingInforegister,
        ssb: allReviews.ratings.ratingStorybook
      }
      if (!lastUpdate) {
        await Reviews.updateReviews(obj)
      }

      // Send the updated data as JSON response
      res.json({
        success: true,
        date: currentDate,
        trustpilot: {
          trustRanking: allReviews.ratings.ratingTrustpilot,
          trustNumber: allReviews.ratings.reviewsTrustpilot
        },
        google: {
          googleRanking: allReviews.ratings.googleRating,
          googleNumber: allReviews.ratings.googleNumber
        },
        eresidence: {
          eresidenceRanking: allReviews.ratings.ratingEresidence,
          eresidenceNumber: allReviews.ratings.reviewsEresidence
        },
        inforegister: allReviews.ratings.ratingInforegister,
        ssb: allReviews.ratings.ratingStorybook
      })
    } catch (error) {
      console.error("Error updating data:", error)
      res.status(500).json({ success: false, error: "Internal Server Error" })
    }
  }
}

exports.SeoUpdate = function (url) {
  return async function (req, res) {
    try {
      const seoTable = await seoCollection.find({ site: url }).toArray()
      seoTable.sort((a, b) => parseDate(b.date) - parseDate(a.date))
      const startDateNonFormated = seoTable[0].date
      const endDateNonFormated = formattedCurrentDate()
      const startDate = formatDate(startDateNonFormated)
      const endDate = formatDate(endDateNonFormated)
      console.log(startDate, endDate)

      const data = await returnSeoValues(url, startDate, endDate)
      // Send the updated data as JSON response
      res.json({
        success: true,
        date: endDateNonFormated,
        data
      })

      await seoCollection.insertOne({ date: formattedCurrentDate(), site: url, clicks: data.clicks, impressions: data.impressions, ctr: data.ctr, position: data.position, mobile: data.mobile, desktop: data.desktop })
    } catch (error) {
      console.error("Error updating data:", error)
      res.status(500).json({ success: false, error: "Internal Server Error" })
    }
  }
}

exports.cornerStonesUpdate = function () {
  return async function (req, res) {
    try {
      const cornerstonesTable = await cornerstonesCollection.find().toArray()
      cornerstonesTable.sort((a, b) => parseDate(b.date) - parseDate(a.date))
      const startDate = formatDate(cornerstonesTable[0].date)
      const endDate = formatDate(formattedCurrentDate())
      const empresaData = await getTopPagesWithTitles(process.env.SITEURL4, startDate, endDate)
      empresaData.sort((a, b) => b.clicks - a.clicks)
      const cData = await getTopPagesWithTitles(process.env.SITEURL, startDate, endDate)
      const cDataEn = cData.filter(item => item.lang === "en")
      const cDataEs = cData.filter(item => item.lang === "es")
      cDataEn.sort((a, b) => b.clicks - a.clicks)
      cDataEs.sort((a, b) => b.clicks - a.clicks)
      await cornerstonesCollection.insertOne({
        date: formattedCurrentDate(),
        sites: [
          {
            url: process.env.SITEURL4,
            articles: empresaData
          },
          {
            url: process.env.SITEURL,
            articlesEn: cDataEn,
            articlesEs: cDataEs
          }
        ]
      })
      res.json({
        success: true,
        empresaData,
        cDataEn,
        cDataEs
      })
    } catch (error) {
      console.error("Error updating data:", error)
      res.status(500).json({ success: false, error: "Internal Server Error" })
    }
  }
}

exports.crispPage = function (pageTitle) {
  return async function (req, res, next) {
    if (req.session.isAuthenticated) {
      try {
        const url = req.url
        const agents = await CrispData.agents()
        res.render("crisp", { url, pageTitle, agents })
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
}

exports.slackRedirect = async function (req, res) {
  const web = new WebClient("")
  const { code } = req.query

  try {
    // Exchange authorization code for OAuth access token
    const response = await web.oauth.v2.access({
      client_id: process.env.SLACKCLIENT,
      client_secret: process.env.SLACKSECRET,
      code: code,
      redirect_uri: process.env.SLACKREDIRECT,
      scopes: "chat:write"
    })

    // Extract access token from response
    const accessToken = response.authed_user.access_token

    // Store the access token securely (e.g., in environment variables or a database)
    // For demonstration purposes, we'll log it here
    console.log("Access Token:", accessToken)

    // Respond with a message indicating that the authorization was successful
    res.send("Authorization successful! You can now close this window.")
  } catch (error) {
    console.error("Error exchanging authorization code for access token:", error)
    res.status(500).send("Error exchanging authorization code for access token.")
  }
}

exports.crispDataUpdate = function () {
  return async function (req, res) {
    try {
      const agentId = req.body.id
      const startDate = req.body.start_date
      const endDate = req.body.end_date
      const [conversations, ratings] = await Promise.all([CrispData.conversations(agentId, startDate, endDate), CrispData.ratings(agentId, startDate, endDate)])
      const [previousStartDate, previousEndDate] = DateRange.getPreviousPeriod(startDate, endDate)
      const prevConversations = await CrispData.conversations(agentId, previousStartDate, previousEndDate)
      const prevConversationsFixed = parseFloat(DateRange.calculatePercentageDifference(prevConversations.uniqueArray.length, conversations.uniqueArray.length).toFixed(2))
      const prevResolvedFixed = parseFloat(DateRange.calculatePercentageDifference(prevConversations.resolved, conversations.resolved).toFixed(2))
      const prevUnresolvedFixed = parseFloat(DateRange.calculatePercentageDifference(prevConversations.unresolved, conversations.unresolved).toFixed(2))
      const prevSameDayfixed = parseFloat(DateRange.calculatePercentageDifference(prevConversations.sameDay, conversations.sameDay).toFixed(2))
      const prevAnotherDayFixed = parseFloat(DateRange.calculatePercentageDifference(prevConversations.anotherDay, conversations.anotherDay).toFixed(2))
      const prevPendingFixed = parseFloat(DateRange.calculatePercentageDifference(prevConversations.pending, conversations.pending).toFixed(2))
      res.json({
        success: true,
        periodConversations: conversations.uniqueArray.length,
        conversations: conversations.uniqueArray,
        resolved: conversations.resolved,
        unresolved: conversations.unresolved,
        pending: conversations.pending,
        sameDay: conversations.sameDay,
        anotherDay: conversations.anotherDay,
        ratings,
        prevConversations: prevConversationsFixed,
        prevResolved: prevResolvedFixed,
        prevUnresolved: prevUnresolvedFixed,
        prevSameDay: prevSameDayfixed,
        prevAnotherDay: prevAnotherDayFixed,
        prevPending: prevPendingFixed
      })
    } catch (error) {
      console.error("Error updating data:", error)
      res.status(500).json({ success: false, error: "Internal Server Error" })
    }
  }
}

exports.addComment = function (collection) {
  return async function (req, res) {
    try {
      const id = req.body.itemId
      const objectId = new ObjectId(id)
      const comment = req.body.comment
      const collectionArr = await collection.find().toArray()

      // Check if the document exists
      const existingDoc = await collection.findOne({ _id: objectId })
      if (!existingDoc) {
        console.log("404")
      }

      // Update the document
      const updatedDoc = await collection.findOneAndUpdate({ _id: objectId }, { $set: { "general.comment": comment } }, { new: true })

      // Handle success
      console.log("Updated document:", updatedDoc)
      res.json({ success: true, updatedDoc })
    } catch (error) {
      console.error("Error updating data:", error)
      res.status(500).json({ success: false, error: "Internal Server Error" })
    }
  }
}

exports.addGlassdoor = function (collection) {
  return async function (req, res) {
    try {
      const id = req.body.itemId
      const objectId = new ObjectId(id)
      const ranking = req.body.ranking
      const number = req.body.number

      // Check if the document exists
      const existingDoc = await collection.findOne({ _id: objectId })
      if (!existingDoc) {
        console.log("404")
      }

      // Update the document
      const updatedDoc = await collection.findOneAndUpdate({ _id: objectId }, { $set: { "glassdoor.glassRanking": ranking, "glassdoor.glassNumber": number } }, { new: true })

      res.json({ success: true, updatedDoc })
    } catch (error) {
      console.error("Error updating data:", error)
      res.status(500).json({ success: false, error: "Internal Server Error" })
    }
  }
}

exports.addCrispReport = function () {
  return async function (req, res) {
    try {
      const id = req.body.id
      const agentName = req.body.agentName
      const total = req.body.total
      const notSolved = req.body.notSolved
      const solved = req.body.solved
      const sameDay = req.body.sameDay
      const anotherDay = req.body.anotherDay
      const pending = req.body.anotherDay
      const period = `${req.body.start_date}-${req.body.end_date}`
      const stars_5 = req.body.stars_5
      const stars_4 = req.body.stars_4
      const stars_3 = req.body.stars_3
      const stars_2 = req.body.stars_2
      const stars_1 = req.body.stars_1
      await crispReportCollection.insertOne({
        agentName,
        id,
        total,
        notSolved,
        solved,
        sameDay,
        anotherDay,
        pending,
        period,
        stars_5,
        stars_4,
        stars_3,
        stars_2,
        stars_1
      })
      res.json({ success: true })
    } catch (error) {
      console.error("Error updating data:", error)
      res.status(500).json({ success: false, error: "Internal Server Error" })
    }
  }
}

exports.crispReportDelete = function () {
  return async function (req, res) {
    try {
      const id = req.body.id
      const objectId = new ObjectId(id)
      const result = await crispReportCollection.deleteOne({ _id: objectId })

      if (result.deletedCount === 1) {
        res.json({ success: true, message: "Report deleted successfully" })
      } else {
        res.status(404).json({ success: false, error: "Report not found" })
      }
    } catch (error) {
      console.error("Error deleting report:", error)
      res.status(500).json({ success: false, error: "Internal Server Error" })
    }
  }
}

exports.crispReportsPage = function (pageTitle) {
  return async function (req, res) {
    if (req.session.isAuthenticated) {
      try {
        const agents = await CrispData.agents()
        const url = req.url
        res.render("reports", { url, pageTitle, agents })
      } catch (error) {
        console.error("Error updating data:", error)
        res.status(500).json({ success: false, error: "Internal Server Error" })
      }
    } else {
      const errorMessages = req.flash("error")
      res.render("login", { errorMessages })
    }
  }
}

exports.crispReportShow = function () {
  return async function (req, res) {
    if (req.session.isAuthenticated) {
      try {
        const id = req.body.id
        const name = req.body.name
        const reports = await crispReportCollection.find({ id }).toArray()

        res.json({ success: true, reports, name })
      } catch (error) {
        console.error("Error updating data:", error)
        res.status(500).json({ success: false, error: "Internal Server Error" })
      }
    } else {
      const errorMessages = req.flash("error")
      res.render("login", { errorMessages })
    }
  }
}
