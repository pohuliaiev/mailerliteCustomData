document.getElementById("loginForm").addEventListener("submit", function (event) {
  event.preventDefault()

  const formData = new FormData(this)
  const url = "/login"
  console.log("Form Data:", formData)
  axios
    .post(url, formData)
    .then(response => {
      // Handle the Axios response
      const data = response.data
      console.log(response)
      if (data.success) {
        console.log(data.message) // Log success message
        // Redirect to the desired page or update the UI as needed
      } else {
        console.error(data.message) // Log error message
        // Display error message on the page
        document.getElementById("errorMessage").textContent = data.message
        document.getElementById("errorMessage").classList.remove("d-none")
        setTimeout(() => {
          document.getElementById("errorMessage").classList.add("d-none")
          document.getElementById("errorMessage").textContent = ""
        }, 2000)
      }
    })
    .catch(error => {
      console.error("Axios error:", error)
    })
})
