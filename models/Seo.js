const { google } = require("googleapis")
const dotenv = require("dotenv")
dotenv.config()
const axios = require("axios")

const REFRESH_TOKEN = process.env.REFRESH_TOKEN

// Create an OAuth2 client
const { web } = JSON.parse(process.env.GOOGLESECRET)
const { client_secret, client_id, redirect_uris } = web
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

// Set refresh token directly on the OAuth2 client
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN })

// Function to query search analytics data
async function getSearchAnalyticsData(siteUrl, startDate, endDate) {
  try {
    // Get a new access token using the refresh token
    const { token } = await oAuth2Client.getAccessToken()

    // Make requests to the Search Console API using the authenticated client
    const webmasters = google.webmasters({
      version: "v3",
      auth: oAuth2Client
    })

    // Query search analytics data
    const response = await webmasters.searchanalytics.query({
      siteUrl: `sc-domain:${siteUrl}`,
      requestBody: {
        startDate: startDate,
        endDate: endDate
      }
    })

    return response.data
  } catch (error) {
    console.error("Error querying search analytics data:", error)
    throw error
  }
}

// Function to get PageSpeed scores for a given URL
async function getPageSpeedScores(url) {
  try {
    const desktopResponse = await axios.get("https://www.googleapis.com/pagespeedonline/v5/runPagespeed", {
      params: {
        url: url,
        key: process.env.GOOGLEAPIKEY,
        strategy: "desktop"
      }
    })

    const mobileResponse = await axios.get("https://www.googleapis.com/pagespeedonline/v5/runPagespeed", {
      params: {
        url: url,
        key: process.env.GOOGLEAPIKEY,
        strategy: "mobile"
      }
    })

    const desktopScore = desktopResponse.data.lighthouseResult.categories.performance.score
    const mobileScore = mobileResponse.data.lighthouseResult.categories.performance.score
    console.log(desktopScore, mobileScore)
    return { desktopScore, mobileScore }
  } catch (error) {
    console.error("Error fetching PageSpeed scores:", error.response.data)
    throw error
  }
}

module.exports = { getSearchAnalyticsData, getPageSpeedScores }