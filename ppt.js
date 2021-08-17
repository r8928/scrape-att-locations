const puppeteer = require('puppeteer');
const { msg } = require('./msg');

class ppt {
	/** @type {puppeteer.Page} */
	page;
	/** @type {puppeteer.Browser} */
	browser;

	get = async () => {
		const debug = true;

		if (debug) {
			this.browser = await puppeteer.launch({
				// headless: false,
				defaultViewport: null,
				args: ['--start-maximized'],
			});

			this.page = await this.browser.newPage();
			await this.page.setJavaScriptEnabled(false);
		} else {
			const browser = await puppeteer.launch({
				// headless: false,
				defaultViewport: null,
				args: ['--start-maximized'],
			});

			this.page = await this.browser.newPage();
			await this.page.setDefaultTimeout(120 * 1000);
			await this.page.setJavaScriptEnabled(false);
			await this.page.setViewport({
				width: 1366,
				height: 768,
			});
		}
	};

	/** @param {String} url */
	async goto(url, waitUntil = 'networkidle0') {
		try {
			msg.substep(`goto ${url}`);
			await this.page.goto(url, { waitUntil });
		} catch (error) {
			msg.die(`goto ${selector} error waitUntil ${waitUntil} `);
		}
	}

	/** @param {String} selector */
	async waitForSelector(selector, timeout = 5000) {
		try {
			msg.substep(`waitForSelector ${selector}`);
			await this.page.waitForSelector(selector, { timeout });
		} catch (error) {
			msg.error(`selector ${selector} not found timeout ${timeout} `);
			throw new Error(`selector ${selector} not found timeout ${timeout} `);
		}
	}
}

module.exports = { ppt };
