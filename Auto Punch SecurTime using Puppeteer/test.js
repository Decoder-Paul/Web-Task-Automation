const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  
  await page.goto('https://trianz.securtime.in/welcome')
  
  await page.setViewport({ width: 1366, height: 657 })
  
  await page.waitForSelector('#sortable > #CNE2 > a > .box > .landing-icons')
  await page.click('#sortable > #CNE2 > a > .box > .landing-icons')
  
  await page.waitForSelector('.col-xs-12:nth-child(1) > .col-xs-12 > .ng-untouched > div > .form-control')
  await page.click('.col-xs-12:nth-child(1) > .col-xs-12 > .ng-untouched > div > .form-control')
  
  await page.waitForSelector('.datepicker-days > .table-condensed > tbody > tr > .old:nth-child(3)')
  await page.click('.datepicker-days > .table-condensed > tbody > tr > .old:nth-child(3)')
  
  await page.waitForSelector('.col-xs-12:nth-child(2) > .col-xs-12:nth-child(2) > .ng-untouched > div > .form-control')
  await page.click('.col-xs-12:nth-child(2) > .col-xs-12:nth-child(2) > .ng-untouched > div > .form-control')
  
  await page.waitForSelector('app-manual-punch-details > .col-xs-12 > .overflow-auto > .ng-untouched > .col-xs-12:nth-child(2)')
  await page.click('app-manual-punch-details > .col-xs-12 > .overflow-auto > .ng-untouched > .col-xs-12:nth-child(2)')
  
  await page.waitForSelector('.col-xs-12:nth-child(2) > .col-xs-12:nth-child(3) > .ng-untouched > div > .form-control')
  await page.click('.col-xs-12:nth-child(2) > .col-xs-12:nth-child(3) > .ng-untouched > div > .form-control')
  
  await page.waitForSelector('table > tbody > tr > td > .bootstrap-timepicker-hour')
  await page.click('table > tbody > tr > td > .bootstrap-timepicker-hour')
  
  await page.waitForSelector('.col-xs-12:nth-child(2) > .col-xs-12:nth-child(5) > .ng-untouched > div > .form-control')
  await page.click('.col-xs-12:nth-child(2) > .col-xs-12:nth-child(5) > .ng-untouched > div > .form-control')
  
  await page.waitForSelector('table > tbody > tr > td > .bootstrap-timepicker-hour')
  await page.click('table > tbody > tr > td > .bootstrap-timepicker-hour')
  
  await page.waitForSelector('#appContentContainer > .mobile-content-section > app-manual-punch-details > .col-xs-12 > .overflow-auto')
  await page.click('#appContentContainer > .mobile-content-section > app-manual-punch-details > .col-xs-12 > .overflow-auto')
  
  await browser.close()
})()