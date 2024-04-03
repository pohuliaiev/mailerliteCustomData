const dotenv = require("dotenv")
dotenv.config()
const { MongoClient } = require("mongodb")
/* Define HTTPS options
const https = require("https")
const fs = require("fs")


const httpsOptions = {
  key: fs.readFileSync("./key.pem"), // Path to your private key
  cert: fs.readFileSync("./cert.pem"), // Path to your certificate
  passphrase: process.env.PASSPHRASESSL
}
*/
const client = new MongoClient(process.env.CONNECTIONSTRING)

async function start() {
  await client.connect()
  module.exports = client
  const app = require("./app")
  // https.createServer(httpsOptions, app).listen(process.env.PORTSSL)
  app.listen(process.env.PORT)
}

start()
