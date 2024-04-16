const dotenv = require("dotenv")
dotenv.config()
const PublicGoogleSheetsParser = require("public-google-sheets-parser")
const spreadsheetId = process.env.BANKSHEETID
const parser = new PublicGoogleSheetsParser(spreadsheetId)

async function parseBanks() {
  try {
    const banksByCountry = {}
    const data = await parser.parse()

    data.forEach(item => {
      const name = item["EUROCAJARURAL_BCOEESMM081"]
      const countries = item["Countries "]

      if (name && countries) {
        const countryCodes = countries.split(" ")

        countryCodes.forEach(countryCode => {
          if (!banksByCountry[countryCode]) {
            banksByCountry[countryCode] = new Set()
          }
          // Add bank to individual country
          banksByCountry[countryCode].add(name)
        })
      }
    })

    // If 'ALL' or 'EEA' is present, add banks to all countries except 'ALL' and 'EEA'
    if (banksByCountry["ALL"] || banksByCountry["EEA"]) {
      Object.keys(banksByCountry).forEach(countryCode => {
        if (countryCode !== "ALL" && countryCode !== "EEA") {
          banksByCountry[countryCode] = new Set([...banksByCountry[countryCode], ...banksByCountry["ALL"], ...banksByCountry["EEA"]])
        }
      })
      delete banksByCountry["ALL"]
      delete banksByCountry["EEA"]
    }

    // Convert sets to arrays and sort banks alphabetically for each country
    Object.keys(banksByCountry).forEach(countryCode => {
      banksByCountry[countryCode] = [...banksByCountry[countryCode]].sort((a, b) => a.localeCompare(b))
    })
    console.log(banksByCountry)
    return banksByCountry
  } catch (error) {
    console.error("Error parsing banks:", error)
    throw new Error("Error parsing banks: " + error) // Append original error as string
  }
}

module.exports = { parseBanks }
