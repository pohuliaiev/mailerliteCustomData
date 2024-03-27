const { google } = require("googleapis")
const dotenv = require("dotenv")
dotenv.config()
const axios = require("axios")
const WPAPI = require("wpapi")

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

//getting slug from urls
function extractSlugFromUrl(url) {
  const parts = url.split("/")

  const lastPart = parts[parts.length - 2]

  return lastPart
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
    const filteredRows = response.data.rows.filter(row => !row.keys.includes(`https://${siteUrl}/`)).filter(row => !row.keys.includes(`https://${siteUrl}/es/`))
    const sorted = filteredRows.sort((a, b) => b.clicks - a.clicks)
    const topPages = sorted.slice(0, 5)

    return topPages
  } catch (error) {
    console.error("Error querying search analytics data:", error)
    throw error
  }
}
// Function to get post title by slug
async function getPostTitleBySlug(url, slug) {
  const wp = new WPAPI({ endpoint: `https://${url}/wp-json` })
  let currentPage = 1

  try {
    let articleSearched = null

    while (!articleSearched) {
      const response = await wp.posts().page(currentPage)

      articleSearched = response.find(item => item.slug === slug)

      if (articleSearched || !response._paging || !response._paging.links || !response._paging.links.next) {
        break
      }

      currentPage++
    }

    return articleSearched ? articleSearched.title.rendered : null
  } catch (error) {
    console.error("Error fetching post title:", error)
    throw error
  }
}

//getting title from Crisp helpdesk article
async function getHelpDeskArticles(lang, url) {
  const id = process.env.CRISPID
  const key = process.env.CRISPKEY
  const websiteId = process.env.CRISPWBST

  const token = Buffer.from(`${id}:${key}`, "utf-8").toString("base64")
  const headers = {
    Authorization: `Basic ${token}`,
    "X-Crisp-Tier": "plugin"
  }
  try {
    let hepldeskArtTitle = ""
    let currentPage = 0
    let continueLoop = true
    while (continueLoop) {
      const apiUrl = `https://api.crisp.chat/v1/website/${websiteId}/helpdesk/locale/${lang}/articles/${currentPage}?filter_visibility_visible=1`
      const response = await axios.get(apiUrl, { headers })
      const resData = response.data.data
      const articleSearched = resData.find(item => item.url === url)
      if (resData.length === 0 || articleSearched) {
        hepldeskArtTitle = articleSearched.title
        continueLoop = false
        break
      }
      currentPage++
    }
    return hepldeskArtTitle
  } catch (error) {
    console.error("Error getting helpdesk articles:", error)
    throw error // Throw the error to be caught by the caller
  }
}

async function getTopPagesWithTitles(siteUrl, startDate, endDate) {
  let pagesArr = []
  try {
    const pages = await getTopPages(siteUrl, startDate, endDate)
    const promises = pages.map(async item => {
      const url = item.keys[0]
      const slug = extractSlugFromUrl(url)
      let title = await getPostTitleBySlug(siteUrl, slug)
      if (url.includes("one.companio.co")) {
        title = await getPostTitleBySlug("one.companio.co/es", slug)
      } else if (url.includes("help.companio.co")) {
        const langIndex = url.indexOf("help.companio.co/") + "help.companio.co/".length
        const lang = url.substring(langIndex, langIndex + 2)
        title = await getHelpDeskArticles(lang, url)
      }
      return {
        url,
        title,
        clicks: item.clicks
      }
    })

    pagesArr = await Promise.all(promises)

    console.log(pagesArr)

    // return pagesArr
  } catch (error) {
    console.error("Error fetching post title:", error.message)
    throw error
  }
}

module.exports = { returnSeoValues, getTopPagesWithTitles }
