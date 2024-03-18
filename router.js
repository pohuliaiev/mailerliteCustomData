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
const courseEs2Collection = dbCollection.courseEs2Collection
const crispEnCollection = dbCollection.crispEnCollection
const cartAbandCollection = dbCollection.cartAbandCollection
const c1SpainFupCollection = dbCollection.c1SpainFupCollection
const c1SpainNsCollection = dbCollection.c1SpainNsCollection
const pdfEnCollection = dbCollection.pdfEnCollection
const pdfEsCollection = dbCollection.pdfEsCollection
const onboardCollection = dbCollection.onboardCollection
const clickDataCollection = dbCollection.clickDataCollection

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

router.get("/course-es-2", mainController.showAutomation(courseEs2Collection, "/update-course-es-2", "Curso: Cómo Abrir Una Empresa En Estonia"))
router.post("/update-course-es-2", mainController.automationUpdate(courseEs2Collection, process.env.CRSES2))

router.get("/crisp-en-automation", mainController.showAutomation(crispEnCollection, "/update-crisp-en-automation", "Crisp ➡️ EN-Subscriber"))
router.post("/update-crisp-en-automation", mainController.automationUpdate(crispEnCollection, process.env.CRSPEN))

router.get("/cart-aband", mainController.showAutomation(cartAbandCollection, "/update-cart-aband", "Cart Abandonment"))
router.post("/update-cart-aband", mainController.automationUpdate(cartAbandCollection, process.env.CRTABND))

router.get("/c1-followup", mainController.showAutomation(c1SpainFupCollection, "/update-c1-followup", "C1 Spain Sales Funnel Follow-Up"))
router.post("/update-c1-followup", mainController.automationUpdate(c1SpainFupCollection, process.env.C1SPFLUP))

router.get("/c1-noshow", mainController.showAutomation(c1SpainNsCollection, "/update-c1-noshow", "C1 Spain Sales Funnel No-Show"))
router.post("/update-c1-noshow", mainController.automationUpdate(c1SpainNsCollection, process.env.C1SPFNS))

router.get("/pdf-en", mainController.showAutomation(pdfEnCollection, "/update-pdf-en", "PDF English"))
router.post("/update-pdf-en", mainController.automationUpdate(pdfEnCollection, process.env.PDFEN))

router.get("/pdf-es", mainController.showAutomation(pdfEsCollection, "/update-pdf-es", "PDF Spanish"))
router.post("/update-pdf-es", mainController.automationUpdate(pdfEsCollection, process.env.PDFES))

router.get("/mailerlite", mainController.showMailerlitePage("Mailerlite automations list"))

router.get("/crisp", mainController.crispPage("Crisp Data"))
router.post("/crisp-update", mainController.crispDataUpdate())

router.post("/add-comment", mainController.addComment(clickDataCollection))

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
