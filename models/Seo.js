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
    console.log(response.data)
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

    const desktopScore = desktopResponse.data.lighthouseResult.categories.performance.score * 100
    const mobileScore = mobileResponse.data.lighthouseResult.categories.performance.score * 100
    return { desktopScore, mobileScore }
  } catch (error) {
    console.error("Error fetching PageSpeed scores:", error.response.data)
    throw error
  }
}

async function returnSeoValues(url, start, end) {
  const searchData = await getSearchAnalyticsData(url, start, end)
  const speed = await getPageSpeedScores(`https://${url}`)
  const mobileSpeed = speed.mobileScore
  const desktopSpeed = speed.desktopScore
  return {
    site: url,
    mobile: mobileSpeed,
    desktop: desktopSpeed,
    clicks: searchData.rows[0].clicks,
    impressions: searchData.rows[0].impressions,
    ctr: searchData.rows[0].ctr,
    position: searchData.rows[0].position
  }
}

//cornerstone articles
async function getTopPages(siteUrl, startDate, endDate) {
  try {
    // Get a new access token using the refresh token
    const { token } = await oAuth2Client.getAccessToken()

    // Make requests to the Search Console API using the authenticated client
    const webmasters = google.webmasters({
      version: "v3",
      auth: oAuth2Client
    })

    // Query search analytics data with 'byPage' aggregation
    const response = await webmasters.searchanalytics.query({
      siteUrl: `sc-domain:${siteUrl}`,
      requestBody: {
        startDate: startDate,
        endDate: endDate,
        dimensions: ["page"], // Aggregate data by page
        aggregationType: "byPage" // Aggregate by individual page
      }
    })
    const filteredRows = response.data.rows.filter(row => !row.keys.includes(`https://${siteUrl}/`))
    const sorted = filteredRows.sort((a, b) => b.clicks - a.clicks)
    const topPages = sorted.slice(0, 5)

    return response.data
  } catch (error) {
    console.error("Error querying search analytics data:", error)
    throw error
  }
}

module.exports = returnSeoValues
