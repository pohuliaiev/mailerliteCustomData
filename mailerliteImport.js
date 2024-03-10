const puppeteer = require("puppeteer")
const dotenv = require("dotenv")
dotenv.config()
const getMailerliteCode = require("./googleMail")

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const mailerliteImport = async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--disable-setuid-sandbox"]
  })
  const page = await browser.newPage()
  const username = process.env.MLRTLOGIN
  const password = process.env.MLRTPSWD

  //getting bar values
  async function getBarValues(selectors, lang, title) {
    const surveyValues = []

    for (const progressBar of selectors) {
      const ariaValueNow = await page.evaluate(element => {
        return element.getAttribute("aria-valuenow")
      }, progressBar)

      const emoji = await page.evaluate(element => {
        const parentParent = element.parentElement.parentElement
        const firstChildText = parentParent ? parentParent.querySelector("div:first-child").textContent.trim() : null
        return firstChildText
      }, progressBar)

      surveyValues.push({
        emoji: emoji,
        value: ariaValueNow
      })
    }

    const values = {
      basic: {
        lang: lang,
        title: title
      },
      survey: surveyValues
    }
    return values // Return the array of survey values
  }

  // Navigate the page to a URL
  await page.goto("https://dashboard.mailerlite.com/login")
  // await page.screenshot({ path: "output/screenshot0.png" })
  const coockieButton = await page.$("#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll")
  if (coockieButton) await page.click("#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll")
  await page.waitForSelector("[type=submit]")
  await page.type("#email", username)
  await page.type("#password", password)
  await page.hover("#password")
  await page.keyboard.press("Enter")
  // console.log("before delay")
  await delay(2000)
  // console.log("after delay")
  // await page.screenshot({ path: "output/screenshot01.png" })
  //await page.click("[type=submit]")
  //await page.click("[type=submit]")
  const mainDiv = await page.$("div#main")
  if (!mainDiv) {
    await page.waitForSelector("#code", {
      visible: true
    })
    // await page.screenshot({ path: "output/screenshot.png" })
    // console.log("scr 1")
    const googleCode = async () => {
      try {
        const verificationCode = await getMailerliteCode()
        // console.log("Verification codes:", verificationCode)
        await page.type("#code", verificationCode)
      } catch (error) {
        console.error("Error:", error)
      }
    }
    await googleCode()

    // console.log("code entered")

    await page.hover("#code")
    await page.keyboard.press("Enter")
    // console.log("enter pressed")
  }
  await page.waitForSelector("main")
  // page.screenshot({ path: "output/screenshot2.png" })
  // console.log("scr 2")
  //spanish survey

  /*Getting values ES */
  await page.goto(process.env.MLRTSRVES)
  await page.waitForSelector("div[data-v-57b8c444]")
  //console.log("loaded")
  // page.screenshot({ path: "output/screenshot3.png" })
  const elementSelector = "div[data-v-57b8c444]"
  const elementsWithoutClasses = await page.$$(`${elementSelector}:not([class])`)

  let progressDataEs = []
  let tableFinalDataES = null

  for (const elementWithoutClasses of elementsWithoutClasses) {
    const h3Text = await page.evaluate(element => {
      const h3 = element.querySelector("h3")
      return h3 ? h3.textContent.trim() : null
    }, elementWithoutClasses)
    // Check if the element contains div[role="progressbar"]
    const progressBar = await elementWithoutClasses.$$('div[role="progressbar"]')

    // Check if the element contains a table
    const table = await elementWithoutClasses.$("table")
    if (progressBar.length !== 0) {
      const barValues = await getBarValues(progressBar, "es", h3Text)
      progressDataEs.push(barValues)
    }

    if (table) {
      const tableSelector = "table"
      const table = await page.$(tableSelector)
      const tableData = await page.evaluate(table => {
        const data = []
        const rows = Array.from(table.querySelectorAll("tr"))

        // Extract header (th) values
        const headers = Array.from(rows[0].querySelectorAll("th")).map(header => header.textContent.trim())

        // Extract data from rows
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i]
          const rowData = {}
          const columns = Array.from(row.querySelectorAll("td"))

          // Assign values to keys based on headers
          headers.forEach((header, index) => {
            rowData[header] = columns[index].textContent.trim()
          })
          rowData["language"] = "es"
          data.push(rowData)
        }

        return data
      }, table)
      tableFinalDataES = tableData
      // Log the resulting table data
    }
  }

  /*Getting values EN */
  await page.goto(process.env.MLRTSRVEN)
  await page.waitForSelector("div[data-v-57b8c444]")
  // console.log("loaded")
  // page.screenshot({ path: "output/screenshot3.png" })
  const elementSelectorEn = "div[data-v-57b8c444]"
  const elementsWithoutClassesEn = await page.$$(`${elementSelectorEn}:not([class])`)

  let progressDataEn = []
  let tableFinalDataEn = null

  for (const elementWithoutClasses of elementsWithoutClassesEn) {
    const h3Text = await page.evaluate(element => {
      const h3 = element.querySelector("h3")
      return h3 ? h3.textContent.trim() : null
    }, elementWithoutClasses)
    // Check if the element contains div[role="progressbar"]
    const progressBar = await elementWithoutClasses.$$('div[role="progressbar"]')

    // Check if the element contains a table
    const table = await elementWithoutClasses.$("table")
    if (progressBar.length !== 0) {
      const barValues = await getBarValues(progressBar, "en", h3Text)
      progressDataEn.push(barValues)
    }

    if (table) {
      const tableSelector = "table"
      const table = await page.$(tableSelector)
      const tableData = await page.evaluate(table => {
        const data = []
        const rows = Array.from(table.querySelectorAll("tr"))

        // Extract header (th) values
        const headers = Array.from(rows[0].querySelectorAll("th")).map(header => header.textContent.trim())

        // Extract data from rows
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i]
          const rowData = {}
          const columns = Array.from(row.querySelectorAll("td"))

          // Assign values to keys based on headers
          headers.forEach((header, index) => {
            rowData[header] = columns[index].textContent.trim()
          })
          rowData["language"] = "en"
          data.push(rowData)
        }

        return data
      }, table)
      tableFinalDataEn = tableData

      // Log the resulting table data
    }
  }

  await page.close()
  await browser.close()
  return {
    tableDataEs: tableFinalDataES,
    progressDataEs: progressDataEs,
    tableDataEn: tableFinalDataEn,
    progressDataEn: progressDataEn
  }
}

module.exports = mailerliteImport
