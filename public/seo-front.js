const myModal = new bootstrap.Modal("#exampleModal", {
  keyboard: false
})

const dateModal = new bootstrap.Modal("#dateModal", {
  keyboard: false
})
const lastDateCompanio = document.getElementById("last-date-companio-table").textContent.trim()
const lastDateCompanioInAweek = addDaysToDate(lastDateCompanio, 7)

const lastDateOne = document.getElementById("last-date-table-one").textContent.trim()
const lastDateOneInAweek = addDaysToDate(lastDateOne, 7)

const lastDateEmpresa = document.getElementById("last-date-table-empresa").textContent.trim()
const lastDateEmpresaInAweek = addDaysToDate(lastDateEmpresa, 7)

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
function formatDate(date) {
  const day = date.getDate().toString().padStart(2, "0")
  const month = (date.getMonth() + 1).toString().padStart(2, "0") // Months are zero-based
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}
function addDaysToDate(dateString, days) {
  const [day, month, year] = dateString.split(".")
  const date = new Date(`${year}-${month}-${day}`)
  date.setDate(date.getDate() + days)
  return formatDate(date)
}
const tCompanio = document.getElementById("companio-table")
const tOne = document.getElementById("table-one")
const tEs = document.getElementById("table-empresa")
function udpateSeoData(url, div, button) {
  const dateDiv = `last-date-${div}`
  const lastUpdate = document.getElementById(dateDiv).textContent.trim()
  const datePlusWeek = addDaysToDate(lastUpdate, 7)
  if (datePlusWeek === formattedCurrentDate()) {
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

          document.getElementById(dateDiv).textContent = data.date
          button.classList.add("disabled")

          function updateTable(obj, tableDiv, date) {
            const row = document.createElement("tr")
            const tdDate = document.createElement("td")
            const tdClicks = document.createElement("td")
            const tdImpressions = document.createElement("td")

            const tdCtr = document.createElement("td")
            const tdPosition = document.createElement("td")
            const tdMobile = document.createElement("td")
            const tdDesktop = document.createElement("td")
            const tdHealth = document.createElement("td")
            const tdVes = document.createElement("td")
            if (tableDiv === "companio-table" || tableDiv === "table-one") {
              const tdVen = document.createElement("td")
              tdVen.textContent = ""
            }

            if (tableDiv === "companio-table") {
              const tdVuk = document.createElement("td")
              tdVuk.textContent = ""
            }

            tdDate.textContent = date
            tdClicks.textContent = obj.clicks
            tdImpressions.textContent = obj.impressions
            tdCtr.textContent = `${(parseFloat(obj.ctr) * 100).toFixed(2)}%`
            tdPosition.textContent = parseFloat(obj.position).toFixed()
            tdMobile.textContent = obj.mobile
            tdDesktop.textContent = obj.desktop
            tdHealth.textContent = ""
            tdVes.textContent = ""

            row.appendChild(tdDate)
            row.appendChild(tdClicks)
            row.appendChild(tdImpressions)
            row.appendChild(tdCtr)
            row.appendChild(tdPosition)
            row.appendChild(tdMobile)
            row.appendChild(tdDesktop)
            row.appendChild(tdHealth)
            row.appendChild(tdVes)
            if (tableDiv === "companio-table" || tableDiv === "table-one") {
              row.appendChild(tdVen)
            }
            if (tableDiv === "companio-table") {
              row.appendChild(tdVuk)
            }

            tableDiv.insertBefore(row, tableDiv.firstChild)
          }
          const tDiv = document.getElementById(div)
          updateTable(data.data, tDiv, data.date)
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
    document.getElementById("next-update").textContent = datePlusWeek
    dateModal.show()
  }
}

// Get the button element by its ID
const companioUpdate = document.getElementById("update-companio")
const oneUpdate = document.getElementById("update-one")
const empresaUpdate = document.getElementById("update-tuempresa")

// Attach the onclick event handler to the button

if (oneUpdate) {
  oneUpdate.onclick = function () {
    const postUrl = oneUpdate.getAttribute("data-post")
    const div = oneUpdate.getAttribute("data-table")
    udpateSeoData(postUrl, div, oneUpdate)
  }
}

if (companioUpdate) {
  companioUpdate.onclick = function () {
    const postUrl = companioUpdate.getAttribute("data-post")
    const div = companioUpdate.getAttribute("data-table")
    udpateSeoData(postUrl, div, companioUpdate)
  }
}

if (empresaUpdate) {
  empresaUpdate.onclick = function () {
    const postUrl = empresaUpdate.getAttribute("data-post")
    const div = empresaUpdate.getAttribute("data-table")
    udpateSeoData(postUrl, div, empresaUpdate)
  }
}
