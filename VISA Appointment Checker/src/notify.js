const axios = require('axios')
const config = require('../config.json')

this.onDiscord = (message)=>{
  axios.post(config.discordWebhook, {
    content: message
  })
  .then((res) => {
    //console.log(`statusCode: ${res.status}`)
    //console.log(res)
  })
  .catch((error) => {
    console.error("Discord is not connected, Please update the webhook to get real time notification")
  })
}
// discordify("I'm here to help you find the visa appointment");