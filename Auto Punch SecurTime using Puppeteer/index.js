const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: false, slowMo: 30});
  const page = await browser.newPage();
  await page.goto('https://trianz.securtime.in/login');

  const username = await page.$x("//input[@type='email']");
  await username[0].type("103949");
  const pass = await page.$x("//input[@type='password']");
  await pass[0].type('Sp@trz20');
  
  const signIn = await page.$x("//button[@type='submit']");

	const [response] = await Promise.all([
		page.waitForNavigation(),
		signIn[0].click()
	]);
//	await page.goto('https://trianz.securtime.in/manual-punch/apply');
	await page.waitForSelector("#CNE2 .landing-icons");
	await page.click("#CNE2 .landing-icons");//click on Apply Manual Punch
	let dates = ['28','29'];
	//Punch In Date
	for(let i=0;i<dates.length; i++){
		let date = '2020-04-'+dates[i];
		console.log("date: "+date);

		await page.waitForSelector('.col-xs-12:nth-child(1) > .col-xs-12 .form-control');
		const punchDate = await page.$('.col-xs-12:nth-child(1) > .col-xs-12 .form-control');
		const html = await page.evaluate(elem => elem.removeAttribute('readonly'), punchDate)
		await punchDate.type(date);	
		//Punch in time
		const punchIn = await page.$('input[placeholder="Punch In Time"]');
		await page.evaluate(elem => elem.click(), punchIn);
		await page.waitForSelector('.bootstrap-timepicker-hour');
		await page.click('input.bootstrap-timepicker-hour')
		await page.keyboard.type('14');
		await page.click('input.bootstrap-timepicker-minute');
		await page.keyboard.type('00');
		//manual punch reason

		await page.type('#manualPunchReason', "Work from home");
		page.mouse.click(0,0);
		//Punch out time
		const punchOut = await page.$('input[placeholder="Punch Out Time"]');
		await page.evaluate(elem => elem.click(), punchOut);
		await page.waitForSelector('.bootstrap-timepicker-hour');
		await page.click('input.bootstrap-timepicker-hour');
		page.keyboard.type('23');
		await page.click('input.bootstrap-timepicker-minute');
		page.keyboard.type('00');
		
		 await page.screenshot({path: 'example.png'});

		//const [respns] = await Promise.all([
			//page.waitForNavigation({waitUntil: 'domcontentloaded'}),
		await	page.click('st-button > button')
		//]);
		await page.waitFor(3000);
		
		//console.log("response: "+respns);
		//await browser.waitForTarget(() => false);
	}
	await browser.close();
})();