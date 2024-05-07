require("dotenv").config()
const crypto = require("crypto")

function verifySignature(req) {
  const message = `v0:${req.headers["x-zm-request-timestamp"]}:${JSON.stringify(req.body)}`
  const hashForVerify = crypto.createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET_TOKEN).update(message).digest("hex")
  const signature = `v0=${hashForVerify}`

  return req.headers["x-zm-signature"] === signature
}

function handleUrlValidation(req) {
  if (req.body.event === "endpoint.url_validation") {
    const hashForValidate = crypto.createHmac("sha256", process.env.ZOOM_WEBHOOK_SECRET_TOKEN).update(req.body.payload.plainToken).digest("hex")

    return {
      message: {
        plainToken: req.body.payload.plainToken,
        encryptedToken: hashForValidate
      },
      status: 200
    }
  }
}

module.exports = {
  verifySignature,
  handleUrlValidation
}
