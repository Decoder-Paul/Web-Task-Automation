const puppeteer = require('puppeteer');
const rl = require("readline-sync")
const fs = require("fs");
var utils = require("./utils");
//const config = require('../config.json')
const notify = require('./notify')
const target_url = "https://visa.vfsglobal.com/ind/en/deu/login";
var visa_flag = false;
(async () => {
  var config = await utils.externalInjection("config.json");
  config=JSON.parse(config)
  // return config;
  // const config = await getData();
  let user = config.username
  let pass = config.password
  
  if(!(config.username) && !(config.password)){
    user = rl.question("Username: ").toString()
    pass = rl.question("password: ").toString()
    console.log("Please update your credentials into the config.json file to avoid filling it everytime")
    // ,{
    //   hideEchoBack: true
    // })
    fs.readFile('./config.json', (err, data) => {
      if(err) throw err;
      var config = JSON.parse(data);
      config.username = user;
      config.password = pass;
      fs.writeFile('config.json', JSON.stringify(config, null, 2), (err) => {
        if (err) throw err;
        console.log('Credential Saved Locally');
      });
    });
  }
  let ui_view = rl.question("Do you want to see the Live Action? (y/n) ").toLowerCase()=='n'? true : false
  let n = parseInt(rl.question("What is the no. of times the search will be performed ? "))
  
  const time = isNaN(n) || n==0 ? 2 : n
  let location = rl.question("Which location visa Appointment are you looking for (Kolkata/Delhi - type 'KOL'/'DEL') ? ").toUpperCase() == 'DEL'? "DEL" : 'kol'
  if(location=='KOL'){
    location = location.toLowerCase();
  }
  console.log("UI View: ", !ui_view)
  console.log("Location: ", location.toUpperCase())
  console.log("Iterations: ", time)
  puppeteer.launch({
    executablePath: config.chromePath,
    headless: ui_view,
    slowMo: 10,
    timeout: 40000,
    defaultViewport: null,
    args: ['--start-maximized',
    `--app=${target_url}`,
    "--disable-gpu",
    "--renderer",
    "--no-sandbox",
    "--no-service-autorun",
    "--no-experiments",
    "--no-default-browser-check",
    "--disable-webgl",
    "--disable-threaded-animation",
    "--disable-threaded-scrolling",
    "--disable-in-process-stack-traces",
    "--disable-histogram-customizer",
    "--disable-gl-extensions",
    "--disable-extensions",
    "--disable-composited-antialiasing",
    "--disable-canvas-aa",
    "--disable-3d-apis",
    "--disable-accelerated-2d-canvas",
    "--disable-accelerated-jpeg-decoding",
    "--disable-accelerated-mjpeg-decode",
    "--disable-app-list-dismiss-on-blur",
    "--disable-accelerated-video-decode",
    "--num-raster-threads=1",
    ]
  })
  .then(async browser => {
    try {
      var page = await browser.pages();
      if (page.length > 0) {
        page = page[0];
        page.setBypassCSP(true);
      
        page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36");
        await page.goto(target_url, {
          waitUntil: 'networkidle0'
        });
      }
      //email
      console.log(`User ID: ${user}`)
      await page.waitForSelector('.login > #login-form #Email')
      const email = await page.$('.login > #login-form #Email')
      await email.type(user)
      //Accepting cookies
      await page.waitForSelector('.default-device > .optanon-alert-box-wrapper > .optanon-alert-box-bottom-top > .optanon-alert-box-corner-close > .optanon-alert-box-close')
      await page.click('.default-device > .optanon-alert-box-wrapper > .optanon-alert-box-bottom-top > .optanon-alert-box-corner-close > .optanon-alert-box-close')
      //password
      await page.waitForSelector('#login-form #Password')
      const password = await page.$('#login-form #Password')
      await password.type(pass)
  
      const [response] = await Promise.all([
        page.waitForNavigation(),
        page.click('.login > #login-form #btnLogin')
      ]);
      console.log("Login Successful");
      // it will run 4 times at an interval of 15 seconds (times: -1 for infinite attempts)
      var duration = Math.round((time*70)/60*10)/10
      console.log(`Search Job duration: ${duration}`)
      notify.onDiscord("Searching Job started & will continue for next "+duration+" minutes")
      await submitOnPage({ page, interval: 60000, times: time });
    }
    catch (e) {
      console.log(e);
      notify.onDiscord("Some error occurred due to unresponsive server")
    }
    finally {
      if(!visa_flag)
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
    await page.waitFor(2000);
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
      if(location.toLowerCase()=='kol'){
        console.log(">Master visa found for Kolkata----->", types);
        notify.onDiscord("Master visa found for Kolkata in <a href='https://visa.vfsglobal.com/ind/en/deu'>VFS</a>") 
      }
      else if(location == 'DEL'){
        console.log(">Master visa found for Delhi----->", types);
        notify.onDiscord("Master visa found for Delhi")
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
      notify.onDiscord("Student Visa Found");
      await page.select('.vas-container > #applicationdetail-form #SubVisaCategoryOptions', options[0])
      visa_flag = true
      await page.waitFor(3000)
      await page.screenshot({ path: 'visa_found.png', fullPage: true });
      
      //Appointment Message checker
      var msg = await page.$eval("#applicationdetail-form > div:nth-child(6) > p.no-slots-msg", 
        elem => elem.classList.contains('hidden')
      )
      if(msg){
        console.log("Visa Appointment Available")
        notify.onDiscord("Visa Appointment Available")
      }else{
        console.log("Appointment NOT Available")
        notify.onDiscord("Appointment NOT Available")
      }
    }
    else {
      console.log(">Student Visa NOT Found")
      await page.screenshot({ path: 'visa_not_found.png', fullPage: true });
      //---->> Clicking on Logo --- redirecting to home page
      await page.waitForSelector('a[title="VFS Global logo"]')
      await page.click('a[title="VFS Global logo"]')
  
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
        notify.onDiscord("The search party is over \n Master Student Visa appointment not available at this time")
        return false;
      }
    }
  };  
})();

