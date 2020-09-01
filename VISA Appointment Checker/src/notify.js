const axios = require('axios')

this.discordify = (message)=>{
  axios.post('https://discord.com/api/webhooks/750221392334553109/2-cf3YUcHghmJcVFZilyYfL3kjbnqN5_g5fgF-RPwKjovH-Vz4vJNFI32A1M7F8XOx7k', {
    content: message
  })
  .then((res) => {
    console.log(`statusCode: ${res.status}`)
    //console.log(res)
  })
  .catch((error) => {
    console.error(error)
  })
}
// discordify("I'm here to help you find the visa appointment");

