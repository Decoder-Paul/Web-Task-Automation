const puppeteer = require('puppeteer');
puppeteer.launch({
  headless: false
})
.then(async browser=>{
  try{
    const page = await browser.newPage();
    await page.goto("https://web.whatsapp.com/")
    await page.waitForNavigation()
    //await page.waitFor(3000)
    await page.waitForSelector("span[title='VISA_Notification']")
    console.log("Selector Found")
    page.click("span[title='VISA_Notification']")
    await page.waitForSelector("#main > footer > div._3ee1T._1LkpH.copyable-area > div._3uMse > div > div._3FRCZ.copyable-text.selectable-text")
    console.log("Input area found")
    const target = await page.$("#main > footer > div._3ee1T._1LkpH.copyable-area > div._3uMse > div > div._3FRCZ.copyable-text.selectable-text")
    //await page.keyboard.type("Hello Guys, I'm a cute bot developed by Subhankar");
    //await page.keyboard.press("Enter");
    await target.type("I'm here to notify you on the availability of Student Visa", {delay: 100});
    await page.keyboard.press("Enter");
    await page.waitFor(30000)
  }catch(e){
    throw console.error(e);
  }
  finally{
    browser.close()
  }
})