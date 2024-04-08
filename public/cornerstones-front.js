const myModal = new bootstrap.Modal("#exampleModal", {
  keyboard: false
})

const dateModal = new bootstrap.Modal("#dateModal", {
  keyboard: false
})
const lastUpdate = document.getElementById("last-date").textContent.trim()
const lastDateInAweek = addDaysToDate(lastUpdate, 7)

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

function dateForGoogle(date) {
  const [day, month, year] = date.split(".")
  const newDay = day.padStart(2, "0")
  const newMonth = month.padStart(2, "0")
  return `${year}-${newMonth}-${newDay}`
}

const current = new Date(formattedCurrentDate().split(".").reverse().join("-"))
const inAweek = new Date(lastDateInAweek.split(".").reverse().join("-"))

function udpateCornerstones(url) {
  if (current >= inAweek) {
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
          cornerstonesUpdate.classList.add("disabled")

          function updateTable(obj, tableDiv) {
            const row = document.createElement("tr")
            const tdDate = document.createElement("td")
            tdDate.setAttribute("rowspan", "2")
            tdDate.classList.add("align-middle")
            const tdSite = document.createElement("td")
            tdSite.classList.add("align-middle")

            const row2 = document.createElement("tr")
            const tdSite2 = document.createElement("td")
            tdSite2.classList.add("align-middle")
            tdDate.textContent = formattedCurrentDate()
            tdSite.textContent = obj.cDataEn[0].site
            tdSite2.textContent = obj.empresaData[0].site

            row.appendChild(tdDate)
            row.appendChild(tdSite)
            const cEn = obj.cDataEn
            const cEs = obj.cDataEs
            const emp = obj.empresaData
            cEn.forEach(item => {
              const tdClicks = document.createElement("td")
              tdClicks.innerHTML = `<a href="${item.url}" target="_blank">${item.title}</a><br>clicks: <strong>${item.clicks}</strong>`
              row.appendChild(tdClicks)
            })
            cEs.forEach(item => {
              const tdClicks2 = document.createElement("td")
              tdClicks2.innerHTML = `<a href="${item.url}" target="_blank">${item.title}</a><br>clicks: <strong>${item.clicks}</strong>`
              row.appendChild(tdClicks2)
            })
            row2.appendChild(tdSite2)
            emp.forEach(item => {
              const tdClicks3 = document.createElement("td")
              tdClicks3.setAttribute("colspan", "2")
              tdClicks3.innerHTML = `<a href="${item.url}" target="_blank">${item.title}</a><br>clicks: <strong>${item.clicks}</strong>`
              row2.appendChild(tdClicks3)
            })
            tableDiv.insertBefore(row2, tableDiv.firstChild)
            tableDiv.insertBefore(row, tableDiv.firstChild)
          }
          const tDiv = document.getElementById("tableGeneral")
          updateTable(data, tDiv)
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
    document.getElementById("next-update").textContent = lastDateInAweek
    dateModal.show()
  }
}

const cornerstonesUpdate = document.getElementById("cornerstones-update")

if (cornerstonesUpdate) {
  cornerstonesUpdate.onclick = function () {
    const postUrl = cornerstonesUpdate.getAttribute("data-post")
    udpateCornerstones(postUrl)
  }
}
