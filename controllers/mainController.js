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

const mailerliteImport = require("../mailerliteImport")
const Table = require("../models/Table")
const MailerliteModel = require("../models/Mailerlite")
const CrispData = require("../models/Crisp")
const DateRange = require("../models/DateRange")
const Reviews = require("../models/Reviews")
const { ObjectId } = require("mongodb")
const { returnSeoValues, getTopPagesWithTitles } = require("../models/Seo")
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

exports.apiDocs = function (pageTitle) {
  return async function (req, res, next) {
    try {
      const url = req.url
      res.render("api", { url, pageTitle })
    } catch (error) {
      console.error("Error fetching data:", error)
      res.status(500).send("Internal Server Error")
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

exports.CornerStonesUpdate = function (start, end, pageTitle) {
  return async function (req, res) {
    try {
      const cornerstonesTable = await cornerstonesCollection.find().toArray()
      const startDate = formatDate(start)
      const endDate = formatDate(end)
      const empresaData = await getTopPagesWithTitles(process.env.SITEURL4, startDate, endDate)
      empresaData.sort((a, b) => b.clicks - a.clicks)
      const cData = await getTopPagesWithTitles(process.env.SITEURL, startDate, endDate)
      const cDataEn = cData.filter(item => item.lang === "en")
      const cDataEs = cData.filter(item => item.lang === "es")
      cDataEn.sort((a, b) => b.clicks - a.clicks)
      cDataEs.sort((a, b) => b.clicks - a.clicks)
      const url = req.url

      /*
      cornerstonesTable.sort((a, b) => parseDate(b.date) - parseDate(a.date))
      const startDateNonFormated = seoTable[0].date
      const endDateNonFormated = formattedCurrentDate()
      
      console.log(startDate, endDate)

      const data = await returnSeoValues(url, startDate, endDate)
      // Send the updated data as JSON response
      res.json({
        success: true,
        date: endDateNonFormated,
        data
      })
*/
      await cornerstonesCollection.insertOne({
        date: end,
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
      res.render("config", { url, pageTitle })
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

      res.json({
        success: true,
        periodConversations: conversations.uniqueArray.length,
        conversations: conversations.uniqueArray,
        resolved: conversations.resolved,
        unresolved: conversations.unresolved,
        sameDay: conversations.sameDay,
        anotherDay: conversations.anotherDay,
        ratings,
        prevConversations: prevConversationsFixed,
        prevResolved: prevResolvedFixed,
        prevUnresolved: prevUnresolvedFixed,
        prevSameDay: prevSameDayfixed,
        prevAnotherDay: prevAnotherDayFixed
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
