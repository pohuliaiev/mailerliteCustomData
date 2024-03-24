const myModal = new bootstrap.Modal("#exampleModal", {
  keyboard: false
})

const dateModal = new bootstrap.Modal("#dateModal", {
  keyboard: false
})

const loader = document.getElementById("preloader")

const formattedCurrentDate = function () {
  const currentDate = new Date()

  const day = currentDate.getDate().toString().padStart(2, "0")
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0") // Months are zero-indexed
  const year = currentDate.getFullYear().toString()

  const formattedDate = `${day}.${month}.${year}`

  return formattedDate
}

const lastDateValue = document.getElementById("last-date").textContent.trim()

const automationUpdateButton = document.getElementsByClassName("automation-update")[0]

function udpateAutomations(url) {
  console.log(lastDateValue, formattedCurrentDate())
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
          automationUpdateButton.classList.add("disabled")
          const tGeneral = document.getElementById("tableGeneral")

          document.getElementById("last-date").textContent = data.date
          // Access data.tableDataEs and data.tableDataEn here
          function updateTable(obj, tableDiv, date) {
            const row = document.createElement("tr")
            const tdDate = document.createElement("td")
            const tdTrustpilot = document.createElement("td")
            const tdGoogle = document.createElement("td")
            const tdGlassdoor = document.createElement("td")
            const tdEresidence = document.createElement("td")
            const tdInforegister = document.createElement("td")
            const tdSsb = document.createElement("td")
            tdDate.textContent = date
            tdTrustpilot.innerHTML = `<strong>${obj.trustpilot.trustRanking}</strong> (${obj.trustpilot.trustNumber})`
            tdGoogle.innerHTML = `<strong>${obj.google.googleRanking}</strong> (${obj.google.googleNumber})`
            tdGlassdoor.textContent = ""
            tdEresidence.innerHTML = `<strong>${obj.eresidence.eresidenceRanking}</strong> (${obj.eresidence.eresidenceNumber})`
            tdInforegister.innerHTML = `<strong>${obj.inforegister}</strong>`
            tdSsb.innerHTML = `<strong>${obj.ssb}</strong>`
            row.appendChild(tdDate)
            row.appendChild(tdTrustpilot)
            row.appendChild(tdGoogle)
            row.appendChild(tdGlassdoor)
            row.appendChild(tdEresidence)
            row.appendChild(tdInforegister)
            row.appendChild(tdSsb)
            tableDiv.insertBefore(row, tableDiv.firstChild)
          }

          updateTable(data, tGeneral, data.date)
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

if (automationUpdateButton) {
  automationUpdateButton.addEventListener("click", function () {
    const postUrl = automationUpdateButton.getAttribute("data-post")
    udpateAutomations(postUrl)
  })
}
