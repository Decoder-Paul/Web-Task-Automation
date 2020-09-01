const puppeteer = require('puppeteer');
const rl = require("readline-sync");
const fs = require("fs");
const cred = require('./config.json')
const notify = require('./notify')

if(!(cred.username) && !(cred.password)){
  const user = rl.question("Username: ")
  const pass = rl.question("password:",{
    hideEchoBack: true
  })
  fs.readFile('config.json', (err, data)=>{
    if(err) throw err;
    var cred = JSON.parse(data);
    cred.username = user;
    cred.password = pass;
    fs.writeFile('config.json', JSON.stringify(cred, null, 2), (err) => {
      if (err) throw err;
      console.log('Credential Saved Locally');
    });
  });
}
const time = rl.question("What is the no. of times the search will be performed ? ")
const location = rl.question("Which location visa Appointment are you looking for (Kolkata- type 'kol'/Delhi - type 'DEL') ? ")

puppeteer.launch({
  product: "chrome",
  headless: true,
})
.then(async browser => {
  try {
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    await page.goto('https://visa.vfsglobal.com/ind/en/deu/login');
    //email
    await page.waitForSelector('.login > #login-form #Email')
    const email = await page.$('.login > #login-form #Email')
    await email.type(cred.username)
    //Accepting cookie
    // await page.waitForSelector('.default-device > .optanon-alert-box-wrapper > .optanon-alert-box-bottom-top > .optanon-alert-box-corner-close > .optanon-alert-box-close')
    // await page.click('.default-device > .optanon-alert-box-wrapper > .optanon-alert-box-bottom-top > .optanon-alert-box-corner-close > .optanon-alert-box-close')
    //password
    await page.waitForSelector('#login-form #Password')
    const pass = await page.$('#login-form #Password')
    await pass.type(cred.password)

    const [response] = await Promise.all([
      page.waitForNavigation(),
      page.click('.login > #login-form #btnLogin')
    ]);
    console.log("Login Successful");
    // it will run 4 times at an interval of 15 seconds (times: -1 for infinite attempts)
    var duration = (time*70)/60
    notify.discordify("Searching Job started & will continue for next "+duration+" minutes")
    await submitOnPage({ page, interval: 60000, times: time });
  }
  catch (e) {
    console.log(e);
    notify.discordify("Some error occurred due to unresponsive server")
  }
  finally {
    browser.close();
  }
});

const submitOnPage = async ({ page, interval, times }) => {
  //---------------------------Repeated Job----------------
  console.log("----Iteration No.---> " + times);
  //Book appointment text-content "Book now"
  await page.waitForSelector('.component-content > .col-xs-12 > .link > .field-link > .cta-link')
  const booking = (await page.$('.component-content > .col-xs-12 > .link > .field-link > .cta-link')).getProperty('textContent')

  const [response2] = await Promise.all([
    page.waitForNavigation(),
    page.click('.component-content > .col-xs-12 > .link > .field-link > .cta-link')
  ])
  // console.log(">Booking Clicked")//+booking.toString());
  //Visa Appication Center

  await page.waitForSelector('.col-md-10 #VisaApplicationCenterddl')
  await page.click('.col-md-10 #VisaApplicationCenterddl')
  await page.select('.col-md-10 #VisaApplicationCenterddl', location)

  //Visa Type
  await page.waitFor(1000);
  await page.waitForSelector('.vas-container > #applicationdetail-form #VisaTypeddl')
  await page.click('.vas-container > #applicationdetail-form #VisaTypeddl')

  //const types = await page.$$eval('#VisaTypeddl option', options=>options.map(option=> option.textContent))
  let types = await page.evaluate(() => {
    var arr = new Array();
    $('#VisaTypeddl option').each(function () {
      let item = $(this).text();
      if (item.includes("Student") || item.includes("Master")) {
        arr.push($(this).val());
      }
    });
    return arr;
  });
  if (types.length) {
    if(location=='kol'){
      console.log(">Master visa found for Kolkata----->", types);
      notify.discordify("Master visa found for Kolkata in <a href='https://visa.vfsglobal.com/ind/en/deu'>VFS</a>")
    }
    else if(location == 'DEL'){
      console.log(">Master visa found for Delhi----->", types);
      notify.discordify("Master visa found for Delhi")
    }
    await page.select('.vas-container > #applicationdetail-form #VisaTypeddl', types[0])
  }
  else {
    console.log(">Master Visa - Not Found");
    await page.select('.vas-container > #applicationdetail-form #VisaTypeddl', 'NV')
  }
  //Visa Subcategory
  await page.waitFor(1000)
  await page.waitForSelector('.vas-container > #applicationdetail-form #SubVisaCategoryOptions')
  await page.click('.vas-container > #applicationdetail-form #SubVisaCategoryOptions')
  await page.waitFor(1000)
  await page.waitForSelector('.vas-container > #applicationdetail-form #SubVisaCategoryOptions')
  await page.click('.vas-container > #applicationdetail-form #SubVisaCategoryOptions')

  //await page.select('.vas-container > #applicationdetail-form #SubVisaCategoryOptions', 'Master Student')
  await page.click('.vas-container > #applicationdetail-form #SubVisaCategoryOptions')
  await page.screenshot({ path: 'visa.png', fullPage: true });

  let options = await page.evaluate(() => {
    let studentOptions = new Array();
    $('#SubVisaCategoryOptions option').each(function () {
      let item = $(this).text();
      if (item.includes("Master") || item.includes("Student")) {
        studentOptions.push($(this).val());
      }
    });
    return studentOptions;
  });
  if (options.length) {
    console.log(">Student Visa Found ", options)
    notify.discordify("Student Visa Found");
    await page.select('.vas-container > #applicationdetail-form #SubVisaCategoryOptions', options[0])
  }
  else {
    console.log(">Student Visa NOT Found")

    //---->> Clicking on Logo --- redirecting to home page
    await page.waitForSelector('.component-content > .component > .component-content > a > img')
    await page.click('.component-content > .component > .component-content > a > img')

    await page.waitForNavigation();
    //---->> navigating to My account
    await page.waitForSelector('.row > .col-xs-12 > .row > .btn-group > .btn')
    await page.click('.row > .col-xs-12 > .row > .btn-group > .btn')

    await page.waitForNavigation();

    //--------------------------------
    if (times > 1 || times === -1) {
      // set an interval
      await page.waitFor(interval)
      // try again
      return submitOnPage({ page, interval, times: Math.max(times - 1, -1) });
    } else {
      console.log("The search party is over")
      notify.discordify("The search party is over \n Master Student Visa appointment not available at this time")
      return false;
    }
  }
};
