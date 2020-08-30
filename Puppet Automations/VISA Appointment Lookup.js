const puppeteer = require('puppeteer');
const cred = require('./config.json');

(async () => {
try{
	const browser = await puppeteer.launch({ headless: false, slowMo: 30, defaultViewport: null});
	const page = await browser.newPage();
	await page.goto('https://visa.vfsglobal.com/ind/en/deu/login');
	
	// await page.setViewport({ width: 1566, height: 625 })
  //login
  await page.waitForSelector('.login > #login-form #Email')
  const email = await page.$('.login > #login-form #Email')
  await email.type(cred.username)
	//Removing cookie box
	await page.waitForSelector('.default-device > .optanon-alert-box-wrapper > .optanon-alert-box-bottom-top > .optanon-alert-box-corner-close > .optanon-alert-box-close')
  await page.click('.default-device > .optanon-alert-box-wrapper > .optanon-alert-box-bottom-top > .optanon-alert-box-corner-close > .optanon-alert-box-close')
  //password
	await page.waitForSelector('#login-form #Password')
  const pass = await page.$('#login-form #Password')
	await pass.type(cred.password)
	
	const [response] = await Promise.all([
		page.waitForNavigation(),
		page.click('.login > #login-form #btnLogin')
	])
	console.log("Login Successful")
	//login done
	//Book appointment text-content "Book now"
  await page.waitForSelector('.component-content > .col-xs-12 > .link > .field-link > .cta-link')
	const booking = (await page.$('.component-content > .col-xs-12 > .link > .field-link > .cta-link')).getProperty('textContent')
	
	const [response2] = await Promise.all([
		page.waitForNavigation(),
		page.click('.component-content > .col-xs-12 > .link > .field-link > .cta-link')
	])
	console.log("Booking text content is-------->"+booking.toString());
	//Visa Appication Center

	await page.waitForSelector('.col-md-10 #VisaApplicationCenterddl')
	await page.click('.col-md-10 #VisaApplicationCenterddl')
	await page.select('.col-md-10 #VisaApplicationCenterddl', 'kol')

	//Visa Type
	await page.waitFor(1000);
	await page.waitForSelector('.vas-container > #applicationdetail-form #VisaTypeddl')
  await page.click('.vas-container > #applicationdetail-form #VisaTypeddl')
	
	//const types = await page.$$eval('#VisaTypeddl option', options=>options.map(option=> option.textContent))
	let types = await page.evaluate(()=>{
		var arr = new Array();
		$('#VisaTypeddl option').each(function(){
			let item = $(this).text();
			if(item.includes("Student") || item.includes("Master")){
				arr.push($(this).val());
			}
		});
		return arr;
	});
	if(types.length){
		console.log("Master visa found for kolkata----->", types);
		await page.select('.vas-container > #applicationdetail-form #VisaTypeddl', types[0])
	}
	else{
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
	await page.screenshot({path: 'visa.png', fullPage: true});

	let options = await page.evaluate(()=>{
		let studentOptions = new Array();
		$('#SubVisaCategoryOptions option').each(function(){
			let item = $(this).text();
			if(item.includes("Master") || item.includes("Student")){
				studentOptions.push($(this).val());
			}
		});
		return studentOptions;
	});
	if(options.length){
		console.log("Student Visa Found -->",options)
		await page.select('.vas-container > #applicationdetail-form #SubVisaCategoryOptions', options[0])
	}
	else{
		console.log("Student Visa NOT Found")
	}
	await page.waitFor(1000);
	// let slot = await page.$$eval('.no-slots-msg', link => link.textContent).then(res =>!! res);
	// if(slot == 'No appointment slots are currently available.'){
	// 	console.log('No Slots currently available');
	// }

	const newTab = await browser.newPage();
	await newTab.goto('https://web.whatsapp.com',{
		waitUntil: 'networkidle0',
		timeout: 0
	});
	let grp = "Test Notification"
}
catch(e){
	throw console.error(e)
}
finally{
	await browser.close()
}
})();