const dotenv = require("dotenv")
dotenv.config()
const Crisp = require("crisp-api")
const CrispClient = new Crisp()
const axios = require("axios")

const id = process.env.CRISPID
const key = process.env.CRISPKEY
const websiteId = process.env.CRISPWBST

const token = Buffer.from(`${id}:${key}`, "utf-8").toString("base64")
const headers = {
  Authorization: `Basic ${token}`,
  "X-Crisp-Tier": "plugin"
}

CrispClient.authenticateTier("plugin", id, key)

//operators

async function agentsArray() {
  try {
    let agents = []
    const agentsArray = await CrispClient.website.listWebsiteOperators(websiteId)
    const agentsOperator = agentsArray
      .filter(agent => agent.type === "operator")
      .filter(agent => agent.details.title === null)
      .filter(agent => agent.details.last_name !== "Pohuliaiev" && agent.details.last_name !== "Oliveira" && agent.details.last_name !== "Calvelo")

    agentsOperator.forEach(function (operator) {
      agents.push({
        id: operator.details.user_id,
        name: `${operator.details.first_name} ${operator.details.last_name}`
      })
    })
    return agents
  } catch (error) {
    console.error("Error listing conversations:", error)
    throw error // Throw the error to be caught by the caller
  }
}

async function conversationsArray(agent, first, last) {
  function isSameDay(timestamp1, timestamp2) {
    const date1 = new Date(timestamp1)
    const date2 = new Date(timestamp2)
    return date1.getDate() === date2.getDate() && date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear()
  }
  const pageSize = 1000
  let allConversations = []
  let continueLoop = true

  try {
    for (let currentPage = 0; currentPage < pageSize && continueLoop; currentPage++) {
      const apiUrl = `https://api.crisp.chat/v1/website/${websiteId}/conversations/${currentPage}/?filter_assigned=${agent}&filter_date_start=${first}&filter_date_end=${last}`
      await axios({
        method: "get",
        url: apiUrl,
        headers: headers
      })
        .then(response => {
          const resData = response.data.data

          if (resData.length === 0) {
            continueLoop = false // Set the flag to false to break out of the loop
            return
          }
          resData.forEach(item => {
            allConversations.push(item)
          })
        })
        .catch(error => {
          console.error(error)
        })
    }
    const resolved = allConversations.filter(obj => obj.state === "resolved")
    const unresolved = allConversations.filter(obj => obj.state === "unresolved")

    const resolvedSameDay = resolved.filter(obj => isSameDay(obj.created_at, obj.updated_at))
    const resolvedAnotherDay = resolved.length - resolvedSameDay.length

    return { allConversations, resolved: resolved.length, unresolved: unresolved.length, sameDay: resolvedSameDay.length, anotherDay: resolvedAnotherDay }
  } catch (error) {
    console.error("Error listing conversations:", error)
    throw error // Throw the error to be caught by the caller
  }
}

exports.agents = agentsArray()
exports.conversations = function (agent, first, last) {
  return conversationsArray(agent, first, last)
}
