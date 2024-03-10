const express = require("express")
const router = express.Router()
const mainController = require("./controllers/mainController")
const Login = require("./models/Login")

const getMailerliteCode = require("./googleMail")

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

router.get("/check-gmail-api", async (req, res) => {
  try {
    const result = await getMailerliteCode()
    res.json({ result })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
