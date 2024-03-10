const dotenv = require("dotenv")
dotenv.config()
exports.authenticateUser = (req, res, next) => {
  const { password } = req.body // Assuming the password is sent in the request body

  // Check if the password is correct (replace 'yourPassword' with the actual password)
  if (password === process.env.PSWD) {
    req.session.isAuthenticated = true
    next() // Proceed to the next middleware or route handler
  } else {
    req.flash("error", "Incorrect password")
    next() // Continue to the next middleware or route handler
  }
}
