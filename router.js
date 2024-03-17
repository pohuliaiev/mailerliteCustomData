const dotenv = require("dotenv")
dotenv.config()
const express = require("express")
const router = express.Router()
const mainController = require("./controllers/mainController")
const Login = require("./models/Login")
const dbCollection = require("./controllers/dbCollections")

const generalMainEnCollection = dbCollection.generalMainEnCollection
const generalMainEsCollection = dbCollection.generalMainEsCollection
const courseEsCollection = dbCollection.courseEsCollection
const courseEnCollection = dbCollection.courseEnCollection
const cleaningBotCollection = dbCollection.cleaningBotCollection

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next, view) => {
  if (req.session.isAuthenticated) {
    // User is authenticated, set the view to 'dashboard'
    res.locals.view = "/"
  } else {
    // User is not authenticated, set the view to 'login'
    res.locals.view = "login"
  }
  next()
}

router.get("/", mainController.home)
router.get("/survey", mainController.survey)
router.get("/click-history", mainController.clicks)
router.post("/update-data", mainController.tableUpdate)
router.post("/update-clicks", mainController.clickUpdate)

router.get("/general-en", mainController.showAutomation(generalMainEnCollection, "/update-general-en", "Main automation English"))
router.post("/update-general-en", mainController.automationUpdate(generalMainEnCollection, process.env.GNRAUTEN))

router.get("/general-es", mainController.showAutomation(generalMainEsCollection, "/update-general-es", "Main automation Spanish"))
router.post("/update-general-es", mainController.automationUpdate(generalMainEsCollection, process.env.GNRAUTES))

router.get("/course-es", mainController.showAutomation(courseEsCollection, "/update-course-es", "Course: Gestionando tu empresa"))
router.post("/update-course-es", mainController.automationUpdate(courseEsCollection, process.env.CRSES))

router.get("/course-en", mainController.showAutomation(courseEnCollection, "/update-course-en", "Course: Running Your Estonian Company With Companio"))
router.post("/update-course-en", mainController.automationUpdate(courseEnCollection, process.env.CRSEN))

router.get("/cleaning-bot", mainController.showAutomation(cleaningBotCollection, "/cleaning-bot-update", "Cleaning Bot"))
router.post("/cleaning-bot-update", mainController.automationUpdate(cleaningBotCollection, process.env.CLNBOT))

router.get("/crisp", mainController.crispPage("Crisp Data"))
router.post("/crisp-update", mainController.crispDataUpdate())

router.post("/login", (req, res) => {
  const { password } = req.body

  // Check if the password is correct
  if (password === process.env.PSWD) {
    req.session.isAuthenticated = true
    req.flash("success", "Login successful")
    res.redirect("/")
  } else {
    req.flash("error", "Incorrect password")
    res.redirect("/")
  }
})

module.exports = router
