const dotenv = require("dotenv")
dotenv.config()
const axios = require("axios")
const puppeteer = require("puppeteer-extra")
const dbCollection = require("../controllers/dbCollections")
const Table = require("./Table")

const reviewsCollection = dbCollection.reviewsCollection
const formattedCurrentDate = Table.formattedCurrentDate

const StealthPlugin = require("puppeteer-extra-plugin-stealth")
puppeteer.use(StealthPlugin())

const apiKey = process.env.GOOGLEAPIKEY
const placeId = process.env.PLACEID

const getAllReviews = async () => {
  try {
    const googlePlaceDetails = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&key=${apiKey}`)

    // Extract data from Google Place API response
    const placeDetails = googlePlaceDetails.data.result
    const placeRating = placeDetails.rating
    const userTotal = placeDetails.user_ratings_total

    // Extract data from other place details API response
    const otherSources = await getCompanyRatingsAndReviews()

    // Return an object containing ratings and reviews from both sources
    return {
      ratings: { googleRating: placeRating, googleNumber: userTotal, ratingTrustpilot: otherSources.ratingTrustpilot, reviewsTrustpilot: otherSources.reviewsTrustpilot, ratingEresidence: otherSources.ratingEresidence, reviewsEresidence: otherSources.reviewsEresidence, ratingInforegister: otherSources.ratingInforegister, ratingStorybook: otherSources.ratingStorybook }
    }
  } catch (error) {
    console.error("Error fetching place details:", error)
    throw error
  }
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function getCompanyRatingsAndReviews() {
  const browser = await puppeteer.launch({
    headless: "false",
    args: ["--no-sandbox", "--disable-gpu", "--disable-setuid-sandbox"]
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })

  try {
    await page.goto(process.env.TRUSTPILOT)
    await page.waitForSelector(".styles_text__W4hWi", { visible: true })
    const reviewP = await page.$eval(".styles_text__W4hWi", el => el.innerText)
    const reviewsTrustpilot = reviewP.match(/\d+(\.\d+)?/g)[0] // Reviews
    await page.waitForSelector(".styles_headline__HoyVg .typography_appearance-default__AAY17", { visible: true })
    const ratingTrustpilot = await page.$eval(".styles_headline__HoyVg .typography_appearance-default__AAY17", el => el.innerText)

    await page.goto(process.env.ERESMRKTPLC)
    await page.waitForSelector(".Sidebar_sidebar-rating-block__rating-score__5EpJi", { visible: true })
    const ratingEresidence = await page.$eval(".Sidebar_sidebar-rating-block__rating-score__5EpJi", el => el.innerText) // E-residence rating
    const reviewsEresidenceElement = await page.$eval(".Sidebar_sidebar-rating-block__rating-counts__FPv56 .Button_button--theme-public-web__NqWEf", el => el.innerText)
    const reviewsEresidence = reviewsEresidenceElement.match(/\d+(\.\d+)?/g)[0] // E-residence reviews quantity

    await page.goto(process.env.INFRGSTR)
    await page.waitForSelector(".bigscore", { visible: true })
    const ratingInforegister = await page.$eval(".bigscore", el => el.innerText) // Inforegister rating

    await page.goto(process.env.SSB)
    await page.waitForSelector(".reputation-score__total", { visible: true })
    const ratingStorybook = await page.$eval(".reputation-score__total", el => el.innerText)

    return {
      ratingStorybook,
      ratingInforegister,
      reviewsEresidence,
      ratingEresidence,
      ratingTrustpilot,
      reviewsTrustpilot
    }
  } catch (error) {
    console.error("Error123:", error)
    return {
      ratingStorybook: null,
      ratingInforegister: null,
      reviewsEresidence: null,
      ratingEresidence: null,
      ratingTrustpilot: null,
      reviewsTrustpilot: null
    }
  } finally {
    await browser.close()
  }
}

exports.updateReviews = async function (obj) {
  await reviewsCollection.insertOne(obj)
}

exports.getReviews = getAllReviews
