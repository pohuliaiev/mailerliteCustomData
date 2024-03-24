const myModal = new bootstrap.Modal("#exampleModal", {
  keyboard: false
})

const dateModal = new bootstrap.Modal("#dateModal", {
  keyboard: false
})

const commentModal = new bootstrap.Modal("#commentModal", {
  keyboard: false
})

const lastDateValue = document.getElementById("last-date").textContent.trim()

const loader = document.getElementById("preloader")
const fadeOverlay = document.getElementById("fadeOverlay")

const formattedCurrentDate = function () {
  const currentDate = new Date()

  const day = currentDate.getDate().toString().padStart(2, "0")
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0") // Months are zero-indexed
  const year = currentDate.getFullYear().toString()

  const formattedDate = `${day}.${month}.${year}`

  return formattedDate
}

// Function to create HTML elements dynamically
function createSurveyElement(title, surveyItems) {
  const col6 = document.createElement("div")
  col6.className = "col-6"

  const h4 = document.createElement("h4")
  h4.textContent = title

  const surveyFlex = document.createElement("div")
  surveyFlex.className = "survey-flex"

  surveyItems.forEach(item => {
    const surveyRow = document.createElement("div")
    surveyRow.className = "survey-row"

    const emojiDiv = document.createElement("div")
    emojiDiv.className = "emoji"
    emojiDiv.textContent = item.emoji

    const barDiv = document.createElement("div")
    barDiv.className = "bar"

    const progressBar = document.createElement("div")
    progressBar.className = "progress"
    progressBar.innerHTML = `
      <div class="progress-bar bg-success" role="progressbar" aria-label="Success example" style="width: ${item.value}%" aria-valuenow="${item.value}" aria-valuemin="0" aria-valuemax="100"></div>
    `
    const percentageDiv = document.createElement("div")
    percentageDiv.className = "percentage"
    percentageDiv.innerHTML = `${item.value}%`

    barDiv.appendChild(progressBar)
    surveyRow.appendChild(emojiDiv)
    surveyRow.appendChild(barDiv)
    surveyFlex.appendChild(surveyRow)
  })

  col6.appendChild(h4)
  col6.appendChild(surveyFlex)

  return col6
}
document.addEventListener("DOMContentLoaded", event => {})
function handleClick(e) {
  if (lastDateValue !== formattedCurrentDate()) {
    loader.classList.remove("d-none")
    fadeOverlay.style.display = "block"
    axios
      .post("/update-data")
      .then(response => {
        const data = response.data

        loader.classList.add("d-none")
        fadeOverlay.style.display = "none"
        // Handle the data received from the server

        if (data.success) {
          const progressRowEn = document.getElementById("progress-en")
          const progressRowEs = document.getElementById("progress-es")
          progressRowEs.innerHTML = ""
          progressRowEn.innerHTML = ""
          document.getElementById("tableEs").innerHTML = ""
          document.getElementById("tableEn").innerHTML = ""
          data.tableDataEs.forEach(item => {
            const row = document.createElement("tr")
            const tdText = document.createElement("td")
            const tdOtherData = document.createElement("td")

            tdText.textContent = item.Subscriber
            tdOtherData.textContent = item.Answer

            row.appendChild(tdText)
            row.appendChild(tdOtherData)
            document.getElementById("tableEs").appendChild(row)
          })

          data.tableDataEn.forEach(item => {
            const row = document.createElement("tr")
            const tdText = document.createElement("td")
            const tdOtherData = document.createElement("td")

            tdText.textContent = item.Subscriber
            tdOtherData.textContent = item.Answer

            row.appendChild(tdText)
            row.appendChild(tdOtherData)
            document.getElementById("tableEn").appendChild(row)
          })

          data.progressEn.forEach(item => {
            const col6Element = createSurveyElement(item.basic.title, item.survey)
            progressRowEn.appendChild(col6Element)
          })

          data.progressEs.forEach(item => {
            const col6Element = createSurveyElement(item.basic.title, item.survey)
            progressRowEs.appendChild(col6Element)
          })

          // Access data.tableDataEs and data.tableDataEn here
        } else {
          myModal.show()
          console.error("Server error:", data.error)
        }
      })
      .catch(error => {
        loader.classList.add("d-none")
        fadeOverlay.style.display = "none"
        myModal.show()
        console.error("Axios error:", error)
      })
  } else {
    dateModal.show()
  }
}

function udpateClicks(url) {
  if (lastDateValue !== formattedCurrentDate()) {
    loader.classList.remove("d-none")
    fadeOverlay.style.display = "block"
    axios
      .post(url)
      .then(response => {
        const data = response.data
        loader.classList.add("d-none")
        fadeOverlay.style.display = "none"
        // Handle the data received from the server

        if (data.success) {
          // console.log(data)
          const tGeneral = document.getElementById("tableGeneral")
          const tEn = document.getElementById("tableEn")
          const tEs = document.getElementById("tableEs")
          document.getElementById("last-date").textContent = data.date
          // Access data.tableDataEs and data.tableDataEn here
          function updateTable(obj, tableDiv, date) {
            const row = document.createElement("tr")
            const tdClickRate = document.createElement("td")
            const tdClickToOpenRate = document.createElement("td")
            const tdDate = document.createElement("td")
            const tdOpenCount = document.createElement("td")
            const tdTotal = document.createElement("td")
            tdDate.textContent = date
            tdTotal.textContent = obj.total
            tdClickRate.textContent = obj.click_rate
            tdClickToOpenRate.textContent = obj.click_to_open_rate
            tdOpenCount.textContent = `${obj.opens_count} (${obj.open_rate})`
            row.appendChild(tdDate)
            row.appendChild(tdTotal)
            row.appendChild(tdOpenCount)
            row.appendChild(tdClickRate)
            row.appendChild(tdClickToOpenRate)
            tableDiv.appendChild(row)
          }

          updateTable(data.general, tGeneral, data.date)

          for (const item of data.emails) {
            if (item.lang === "en") {
              updateTable(item, tEn, data.date)
            } else {
              updateTable(item, tEs, data.date)
            }
          }
        } else {
          loader.classList.add("d-none")
          fadeOverlay.style.display = "none"
          myModal.show()
          console.error("Server error:", data.error)
        }
      })
      .catch(error => {
        loader.classList.add("d-none")
        fadeOverlay.style.display = "none"
        myModal.show()
        console.error("Axios error:", error)
      })
  } else {
    dateModal.show()
  }
}

function udpateAutomations(url) {
  if (lastDateValue !== formattedCurrentDate()) {
    loader.classList.remove("d-none")
    fadeOverlay.style.display = "block"
    axios
      .post(url)
      .then(response => {
        const data = response.data
        loader.classList.add("d-none")
        fadeOverlay.style.display = "none"
        // Handle the data received from the server

        if (data.success) {
          console.log(data)

          const tGeneral = document.getElementById("tableGeneral")

          document.getElementById("last-date").textContent = data.date
          // Access data.tableDataEs and data.tableDataEn here
          function updateTable(obj, tableDiv, date) {
            const row = document.createElement("tr")
            const tdClickRate = document.createElement("td")
            const tdClickToOpenRate = document.createElement("td")
            const tdDate = document.createElement("td")
            const tdOpenCount = document.createElement("td")
            const tdTotal = document.createElement("td")
            const tdComment = document.createElement("td")
            tdDate.textContent = date
            tdTotal.textContent = obj.total
            tdClickRate.textContent = obj.click_rate
            tdClickToOpenRate.textContent = obj.click_to_open_rate
            tdOpenCount.textContent = `${obj.opens_count} (${obj.open_rate})`
            tdComment.textContent = ""
            row.appendChild(tdDate)
            row.appendChild(tdTotal)
            row.appendChild(tdOpenCount)
            row.appendChild(tdClickRate)
            row.appendChild(tdClickToOpenRate)
            row.appendChild(tdComment)
            tableDiv.insertBefore(row, tableDiv.firstChild)
          }

          updateTable(data.general, tGeneral, data.date)
        } else {
          loader.classList.add("d-none")
          fadeOverlay.style.display = "none"
          myModal.show()
          console.error("Server error:", data.error)
        }
      })
      .catch(error => {
        loader.classList.add("d-none")
        fadeOverlay.style.display = "none"
        myModal.show()
        console.error("Axios error:", error)
      })
  } else {
    dateModal.show()
  }
}

// Get the button element by its ID
const myButton = document.getElementById("click-me")
const clickUpdate = document.getElementById("update-clicks")
const automationUpdate = document.getElementById("update-general-en")

const automationsClass = document.getElementsByClassName("automation-update")
const automationUpdateButton = document.getElementsByClassName("automation-update")[0]

// Attach the onclick event handler to the button

if (myButton) {
  myButton.onclick = handleClick
}

if (clickUpdate) {
  clickUpdate.onclick = function () {
    udpateClicks("/update-clicks")
  }
}

if (automationUpdateButton) {
  automationUpdateButton.onclick = function () {
    const postUrl = automationUpdateButton.getAttribute("data-post")
    udpateAutomations(postUrl)
  }
}

//adding comment

function testFunction(e) {
  const parent = e.parentNode
  const id = parent.getAttribute("id")
  let modal = document.getElementById("commentModal")
  modal.setAttribute("data-item-id", id)

  commentModal.show()
}

function addComment() {
  const comment = document.getElementById("commentTextarea").value

  const itemId = document.getElementById("commentModal").getAttribute("data-item-id")
  axios
    .post("/add-comment", {
      itemId,
      comment
    })
    .then(response => {
      const data = response.data
      loader.classList.add("d-none")
      fadeOverlay.style.display = "none"
      // Handle the data received from the server

      if (data.success) {
        // console.log(data)
        document.getElementById(itemId).textContent = ""
        document.getElementById(itemId).textContent = comment
        commentModal.hide()
      } else {
        loader.classList.add("d-none")
        fadeOverlay.style.display = "none"
        commentModal.hide()
        myModal.show()
        console.error("Server error:", data.error)
      }
    })
    .catch(error => {
      loader.classList.add("d-none")
      fadeOverlay.style.display = "none"
      commentModal.hide()
      myModal.show()
      console.error("Axios error:", error)
    })
}
