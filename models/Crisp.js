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
    let currentPage = 0
    while (continueLoop) {
      const apiUrl = `https://api.crisp.chat/v1/website/${websiteId}/conversations/${currentPage}/?filter_assigned=${agent}&filter_date_start=${first}&filter_date_end=${last}`
      const response = await axios.get(apiUrl, { headers })

      const resData = response.data.data

      if (resData.length === 0) {
        continueLoop = false
        break
      }

      resData.forEach(item => {
        allConversations.push(item)
      })

      currentPage++
    }
    function removeDuplicates(arr) {
      return arr.filter((item, index, self) => {
        return (
          index ===
          self.findIndex(
            obj => obj.created_at === item.created_at // assuming each object has an 'id' property
          )
        )
      })
    }
    const uniqueArray = removeDuplicates(allConversations)

    const resolved = uniqueArray.filter(obj => obj.state === "resolved")
    const unresolved = uniqueArray.filter(obj => obj.state === "unresolved")

    const resolvedSameDay = resolved.filter(obj => isSameDay(obj.created_at, obj.updated_at))
    const resolvedAnotherDay = resolved.length - resolvedSameDay.length

    return { uniqueArray, resolved: resolved.length, unresolved: unresolved.length, sameDay: resolvedSameDay.length, anotherDay: resolvedAnotherDay }
  } catch (error) {
    console.error("Error listing conversations:", error)
    throw error
  }
}

async function ratingsObj(agent, first, last) {
  let allRatings = []
  const tokenRatings = Buffer.from(`${process.env.CRISPUSERID}:${process.env.CRISPUSERKEY}`, "utf-8").toString("base64")
  const headersRatings = {
    Authorization: `Basic ${tokenRatings}`,
    "X-Crisp-Tier": "user"
  }
  let continueLoop = true
  const pageSize = 10
  try {
    let ratings = {
      stars_5: 0,
      stars_4: 0,
      stars_3: 0,
      stars_2: 0,
      stars_1: 0
    }

    for (let currentPage = 0; currentPage < pageSize && continueLoop; currentPage++) {
      const ratingsApiUrl = `https://api.crisp.chat/v1/website/${websiteId}/rating/sessions/list/${currentPage}?filter_date_start=${first}&filter_date_end=${last}`
      const response = await axios.get(ratingsApiUrl, { headers: headersRatings })
      const ratingsAllDataArr = response.data.data

      if (ratingsAllDataArr.length === 0) {
        continueLoop = false // Set the flag to false to break out of the loop
        break // Exit the loop
      }

      const operatorRatingsSession = ratingsAllDataArr.filter(obj => {
        if (obj.session && obj.session.assigned) {
          return obj.session.assigned.user_id === agent
        }
        return false
      })

      operatorRatingsSession.forEach(item => {
        allRatings.push(item)
      })
    }
    function removeDuplicates(arr) {
      return arr.filter((item, index, self) => {
        return (
          index ===
          self.findIndex(
            obj => obj.session.session_id === item.session.session_id // assuming each object has an 'id' property
          )
        )
      })
    }

    const operatorRatingsSessionWithoutDoubles = removeDuplicates(allRatings)

    operatorRatingsSessionWithoutDoubles.forEach(item => {
      switch (item.stars) {
        case 5:
          ratings.stars_5 += 1
          break
        case 4:
          ratings.stars_4 += 1
          break
        case 3:
          ratings.stars_3 += 1
          break
        case 2:
          ratings.stars_2 += 1
          break
        case 1:
          ratings.stars_1 += 1
          break
      }
    })
    return ratings
  } catch (error) {
    console.error("Error listing conversations:", error)
    throw error // Throw the error to be caught by the caller
  }
}

exports.agents = agentsArray
exports.conversations = conversationsArray
exports.ratings = ratingsObj
