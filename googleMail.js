const { google } = require("googleapis")
const fs = require("fs")
const dotenv = require("dotenv")
dotenv.config()

const SCOPES = JSON.parse(process.env.SCOPES)
const TOKEN_PATH = process.env.TOKEN_PATH // Change to your desired path

// Create an OAuth2 client
const { web } = JSON.parse(process.env.GOOGLESECRET)
const { client_secret, client_id, redirect_uris } = web
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

// Load or refresh the access token
async function authorize() {
  try {
    const token = fs.readFileSync(TOKEN_PATH)
    oAuth2Client.setCredentials(JSON.parse(token))
  } catch (err) {
    await getAccessToken()
  }
}

// Get and store a new access token
async function getAccessToken() {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  })
  console.log("Authorize this app by visiting this URL:", authUrl)
  const code = "<Paste the code obtained after authorization>"
  const token = await oAuth2Client.getToken(code)
  oAuth2Client.setCredentials(token.tokens)
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token.tokens))
}

// Function to list messages in the inbox
async function listMessages() {
  const currentTime = new Date().getTime()
  const oneHourAgo = currentTime - 60 * 60 * 1000 // 1 hour in milliseconds
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client })
  const response = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["INBOX"],
    maxResults: 5,
    q: ` here is your verification code:`
  })
  const messages = response.data.messages
  const currentDateInMillis = new Date().getTime()
  if (messages) {
    let codeArr = []
    for (const message of messages) {
      const messageDetails = await gmail.users.messages.get({
        userId: "me",
        id: message.id
      })
      const text = atob(messageDetails.data.payload.parts[0].body.data)
      const codeRegex = /\b\d{6}\b/
      const match = text.match(codeRegex)
      const verificationCode = match ? match[0] : null

      if (verificationCode) {
        codeArr.push(verificationCode.toString())
      }

      // console.log("Verification code:", verificationCode)
      //console.log(messageDetails.data.payload.headers)
    }
    return codeArr[0]
    // console.log("Verification code:", codeArr[0])
  } else {
    console.log("No messages in the inbox.")
  }
}

// Main function
const getMailerliteCode = async function getMailerliteCode() {
  await authorize()
  return await listMessages()
}
getMailerliteCode()
module.exports = getMailerliteCode
