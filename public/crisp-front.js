const myModal = new bootstrap.Modal("#exampleModal", {
  keyboard: false
})

const dateModal = new bootstrap.Modal("#dateModal", {
  keyboard: false
})

const updateButton = document.getElementById("update")
const saveButton = document.getElementById("save_report")

const loader = document.getElementById("preloader")
const fadeOverlay = document.getElementById("fadeOverlay")

let firstDate
let secondDate
let firstDateStr
let secondDateStr
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
    firstDateStr = selectedDates[0]
    secondDateStr = selectedDates[selectedDates.length - 1]
    const firstSelectedDate = new Date(selectedDates[0].getFullYear(), selectedDates[0].getMonth(), selectedDates[0].getDate(), 0, 0, 0)
    const secondSelectedDate = new Date(selectedDates[selectedDates.length - 1].getFullYear(), selectedDates[selectedDates.length - 1].getMonth(), selectedDates[selectedDates.length - 1].getDate(), 23, 59, 59)

    firstDate = firstSelectedDate.toISOString()
    secondDate = secondSelectedDate.toISOString()
    console.log(firstDate, secondDate)
    if (selectedDates.length === 2) {
      rangeSelected = true
    }
    //   console.log(firstSelectedDate, secondSelectedDate)
  }
})

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
  console.log({
    id: agent,
    agentName,
    total,
    notSolved,
    solved,
    sameDay,
    anotherDay,
    pending,
    start_date: firstDateStr,
    end_date: secondDateStr
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
