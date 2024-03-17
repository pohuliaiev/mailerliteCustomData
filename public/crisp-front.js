const myModal = new bootstrap.Modal("#exampleModal", {
  keyboard: false
})

const dateModal = new bootstrap.Modal("#dateModal", {
  keyboard: false
})

const updateButton = document.getElementById("update")

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
  } else if (value > 0) {
    element.classList.add("text-success")
    element.classList.remove("text-danger")
  }
}

flatpickr("#calendar", {
  mode: "range",
  dateFormat: "d.m.Y",
  maxDate: new Date(),
  onChange: function (selectedDates, dateStr, instance) {
    const firstSelectedDate = selectedDates[0].toISOString()
    const secondSelectedDate = selectedDates[1].toISOString()

    firstDate = firstSelectedDate
    secondDate = secondSelectedDate
    if (selectedDates.length === 2) {
      rangeSelected = true
    }
  }
})

function udpateCrisp(url) {
  loader.classList.remove("d-none")
  fadeOverlay.style.display = "block"
  const selectElement = document.getElementById("agents")
  const agent = selectElement.value
  const selectedIndex = selectElement.selectedIndex
  const selectedOption = selectElement.options[selectedIndex]
  const agentName = selectedOption.textContent
  if (rangeSelected && agent !== 0) {
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

          updateElementWithPercentage("total_conversations_prev", data.prevConversations)
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

if (updateButton) {
  updateButton.onclick = function () {
    udpateCrisp("/crisp-update")
  }
}
