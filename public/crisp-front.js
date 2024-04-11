const myModal = new bootstrap.Modal("#exampleModal", {
  keyboard: false
})

const dateModal = new bootstrap.Modal("#dateModal", {
  keyboard: false
})

const updateButton = document.getElementById("update")
const saveButton = document.getElementById("save_report")
const getReportButton = document.getElementById("show_reports")

const deleteButtons = document.querySelectorAll(".delete-report")

const loader = document.getElementById("preloader")
const fadeOverlay = document.getElementById("fadeOverlay")

let firstDate
let secondDate
let rangeSelected = false

function updateElementWithPercentage(id, value) {
  const element = document.getElementById(id)
  const signedValue = value >= 0 ? "+" + value : value
  element.textContent = signedValue + "%"

  // Add class based on the sign of the value
  if (value < 0) {
    element.classList.add("text-danger")
    element.classList.remove("text-success")
    element.innerHTML += `<i class="bi bi-arrow-down-square-fill"></i>`
  } else if (value > 0) {
    element.classList.add("text-success")
    element.classList.remove("text-danger")
    element.innerHTML += `<i class="bi bi-arrow-up-square-fill"></i>`
  }
}

flatpickr("#calendar", {
  mode: "range",
  dateFormat: "d.m.Y",
  maxDate: new Date(),
  onChange: function (selectedDates, dateStr, instance) {
    const firstSelectedDate = new Date(selectedDates[0].getFullYear(), selectedDates[0].getMonth(), selectedDates[0].getDate(), 0, 0, 0)
    const secondSelectedDate = new Date(selectedDates[selectedDates.length - 1].getFullYear(), selectedDates[selectedDates.length - 1].getMonth(), selectedDates[selectedDates.length - 1].getDate(), 23, 59, 59)

    firstDate = firstSelectedDate.toISOString()
    secondDate = secondSelectedDate.toISOString()

    if (selectedDates.length === 2) {
      rangeSelected = true
    }
  }
})

function dateTostr(iso) {
  const date = new Date(iso)
  const day = date.getUTCDate()
  const month = date.getUTCMonth() + 1
  const year = date.getUTCFullYear()

  const formattedDay = day < 10 ? "0" + day : day
  const formattedMonth = month < 10 ? "0" + month : month

  const formattedDate = `${formattedDay}.${formattedMonth}.${year}`

  return formattedDate
}

function udpateCrisp(url) {
  loader.classList.remove("d-none")
  fadeOverlay.style.display = "block"
  const selectElement = document.getElementById("agents")
  let agent = ""
  if (agent !== 0) {
    agent = selectElement.value
  }
  const selectedIndex = selectElement.selectedIndex
  const selectedOption = selectElement.options[selectedIndex]
  const agentName = selectedOption.textContent
  if (rangeSelected) {
    const postData = {
      id: agent,
      start_date: firstDate,
      end_date: secondDate
    }
    axios
      .post(url, postData)
      .then(response => {
        const data = response.data
        loader.classList.add("d-none")
        fadeOverlay.style.display = "none"
        // Handle the data received from the server

        if (data.success) {
          console.log(data)
          document.getElementById("agent_name").textContent = agentName
          document.getElementById("total_conversations").textContent = data.periodConversations
          document.getElementById("not_solved").textContent = data.unresolved
          document.getElementById("solved").textContent = data.resolved
          document.getElementById("same_day").textContent = data.sameDay
          document.getElementById("another_day").textContent = data.anotherDay
          document.getElementById("pending").textContent = data.pending

          document.getElementById("5_stars").textContent = data.ratings.stars_5
          document.getElementById("4_stars").textContent = data.ratings.stars_4
          document.getElementById("3_stars").textContent = data.ratings.stars_3
          document.getElementById("2_stars").textContent = data.ratings.stars_2
          document.getElementById("1_stars").textContent = data.ratings.stars_1

          updateElementWithPercentage("total_conversations_prev", data.prevConversations)
          updateElementWithPercentage("not_solved_prev", data.prevUnresolved)
          updateElementWithPercentage("solved_prev", data.prevResolved)
          updateElementWithPercentage("same_day_prev", data.prevSameDay)
          updateElementWithPercentage("another_day_prev", data.prevAnotherDay)
          updateElementWithPercentage("pending_prev", data.prevPending)
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
    loader.classList.add("d-none")
    fadeOverlay.style.display = "none"
    dateModal.show()
  }
}

function saveCrispReport() {
  const selectElement = document.getElementById("agents")
  let agent = ""
  if (agent !== 0) {
    agent = selectElement.value
  }
  const selectedIndex = selectElement.selectedIndex
  const selectedOption = selectElement.options[selectedIndex]
  const agentName = selectedOption.textContent
  const total = document.getElementById("total_conversations").textContent
  const notSolved = document.getElementById("not_solved").textContent
  const solved = document.getElementById("solved").textContent
  const sameDay = document.getElementById("same_day").textContent
  const anotherDay = document.getElementById("another_day").textContent
  const pending = document.getElementById("pending").textContent
  const stars_5 = document.getElementById("5_stars").textContent
  const stars_4 = document.getElementById("4_stars").textContent
  const stars_3 = document.getElementById("3_stars").textContent
  const stars_2 = document.getElementById("2_stars").textContent
  const stars_1 = document.getElementById("1_stars").textContent
  const alertDiv = document.getElementById("flash")
  const data = {
    id: agent,
    agentName,
    total,
    notSolved,
    solved,
    sameDay,
    anotherDay,
    pending,
    start_date: dateTostr(firstDate),
    end_date: dateTostr(secondDate),
    stars_5,
    stars_4,
    stars_3,
    stars_2,
    stars_1
  }
  if (agent !== 0 && rangeSelected) {
    axios
      .post("/add-crisp-report", data)
      .then(response => {
        alertDiv.innerHTML = `
      <div class="alert alert-success alert-dismissible fade show" role="alert">
  Report for <strong>${agentName}</strong> was generated. You can check it <a href="/crisp/reports">here</a>.
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>
      `
      })
      .catch(error => {
        console.error("Error sending data:", error)
      })
  } else {
    alertDiv.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
  Please select agent name and date range to save a report.
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>
      `
  }
}

function showCrispReports() {
  const selectElement = document.getElementById("agents")
  const tableDiv = document.getElementById("tableGeneral")
  tableDiv.innerHTML = ""
  let agent = ""
  if (agent !== 0) {
    agent = selectElement.value
  }
  const selectedIndex = selectElement.selectedIndex
  const selectedOption = selectElement.options[selectedIndex]
  const agentName = selectedOption.textContent
  const postData = {
    id: agent,
    name: agentName
  }
  axios
    .post("/crisp-get-reports", postData)
    .then(response => {
      const data = response.data
      // Handle the data received from the server

      if (data.success) {
        document.getElementById("agent_name").textContent = agentName
        const reports = data.reports
        if (reports.length > 0) {
          reports.forEach(item => {
            const row = document.createElement("tr")
            row.id = item._id
            row.innerHTML = `
        <td>${item.period}</td>
        <td>${item.total}</td>
        <td>${item.notSolved}</td>
        <td>${item.solved}</td>
        <td>${item.sameDay}</td>
        <td>${item.anotherDay}</td>
        <td>${item.pending}</td>
        <td>${item.stars_5}</td>
        <td>${item.stars_4}</td>
        <td>${item.stars_3}</td>
        <td>${item.stars_2}</td>
        <td>${item.stars_1}</td>
        <td><button type="button" class="btn btn-danger delete-report" data-id="${item._id}">Delete report</button></td>
    `
            tableDiv.insertBefore(row, tableDiv.firstChild)
          })
        } else {
          const errorDiv = document.getElementById("flash")
          errorDiv.innerHTML = `
          <div class="alert alert-danger alert-dismissible fade show" role="alert">
      There're no reports for this agent!
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
          `
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
}

function deleteReport(reportId) {
  axios
    .post("/delete-crisp-report", { id: reportId })
    .then(function (response) {
      if (response.data.success) {
        document.getElementById(reportId).remove()
        console.log("report deleted")
      } else {
        alert("Failed to delete report: " + response.data.error)
      }
    })
    .catch(function (error) {
      console.error("Error deleting report:", error)
    })
}

if (updateButton) {
  updateButton.onclick = function () {
    udpateCrisp("/crisp-update")
  }
}

if (saveButton) {
  saveButton.onclick = function () {
    saveCrispReport()
  }
}
if (getReportButton) {
  getReportButton.onclick = function () {
    showCrispReports()
  }
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-report")) {
    const reportId = event.target.getAttribute("data-id")

    deleteReport(reportId)
  }
})
