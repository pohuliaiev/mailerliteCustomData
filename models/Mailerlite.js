const MailerLite = require("@mailerlite/mailerlite-nodejs").default
const dotenv = require("dotenv")
dotenv.config()

const Table = require("../models/Table")

const formattedCurrentDate = Table.formattedCurrentDate

const mailerlite = new MailerLite({
  api_key: process.env.MLRTAPI
})
const getAutomation = async function (id) {
  return new Promise((resolve, reject) => {
    let dataClicks = {}
    let emails = []

    mailerlite.automations
      .find(id)
      .then(response => {
        Object.assign(dataClicks, { opens_count: response.data.data.stats.opens_count, open_rate: response.data.data.stats.open_rate.string, click_rate: response.data.data.stats.click_rate.string, click_to_open_rate: response.data.data.stats.click_to_open_rate.string, total: response.data.data.stats.sent })

        response.data.data.steps.forEach(step => {
          if (step.type === "email") {
            emails.push({
              lang: step.language_id === 8 ? "es" : "en",
              opens_count: step.email.stats.unique_opens_count,
              open_rate: step.email.stats.open_rate.string,
              click_rate: step.email.stats.click_rate.string,
              click_to_open_rate: step.email.stats.click_to_open_rate.string
            })
          }
        })

        // Resolve the promise with the data
        resolve({ dataClicks, emails })
      })
      .catch(error => {
        // Reject the promise with the error
        reject(error.response ? error.response.data : error)
      })
  })
}

exports.returnAutomation = async function (id) {
  try {
    const { dataClicks, emails } = await getAutomation(id) // Replace 'yourId' with the actual ID

    return { dataClicks, emails }
  } catch (error) {
    console.error("Error:", error)
    throw error // Propagate the error if needed
  }
}

exports.updateAutomation = async function (collection, id) {
  const automations = await this.returnAutomation(id)
  const existingDate = await collection.findOne({ date: formattedCurrentDate() })

  if (!existingDate)
    await collection.insertOne({
      date: formattedCurrentDate(),
      general: {
        opens_count: automations.dataClicks.opens_count,
        open_rate: automations.dataClicks.open_rate,
        click_rate: automations.dataClicks.click_rate,
        click_to_open_rate: automations.dataClicks.click_to_open_rate,
        total: automations.dataClicks.total
      },
      emails: automations.emails
    })
}
