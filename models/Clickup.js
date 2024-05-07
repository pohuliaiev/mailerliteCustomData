const dotenv = require("dotenv")
dotenv.config()
const axios = require("axios")

exports.createTask = async function (taskData) {
  try {
    const apiKey = process.env.CLICKUPKEY
    const listId = process.env.CLICKUPLIST

    const response = await axios.post(`https://api.clickup.com/api/v2/list/${listId}/task`, taskData, {
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json"
      }
    })

    return response.data
  } catch (error) {
    console.error("Error creating task in ClickUp:", error.message)
    throw error
  }
}
