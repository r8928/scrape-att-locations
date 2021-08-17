const { writer } = require('./writer');
const { ppt } = require('./ppt');
const { msg } = require('./msg');
const puppeteer = require('puppeteer');
const { isArray, isObject } = require('lodash');

class ATTScrape {
	/** @type {ppt} */
	ppt;

	async start() {
		this.ppt = await new ppt();
		await this.ppt.get();
		return this;
	}

	async do() {
		const states = await this.allStates();

		for (const state of states) {
			await this.getLocationsFromStates(state);
		}

		/** @type {{id: string, name: string, href: string, done: number}[]} */
		const multiStores = await this.getAllMultiStores();
		for (const multiStore of multiStores) {
			await this.getLocationsMultiStores(multiStore, 'a.Teaser-titleLink');
		}
	}

	/* MULTI-LOCATIONS */
	async getAllMultiStores() {
		const file = writer.read('multi-stores.json');
		if (isObject(file) && Object.values(file).length > 0) {
			const multiStores = Object.values(file).filter(s => s.done === 0);
			if (multiStores.length > 0) {
				msg.substep(`remaining multistores ${multiStores.length}`);

				return multiStores;
			}
		}
	}
	/** @param {{id: string, name: string, href: string, done: number}} multiStore*/
	async getLocationsMultiStores(multiStore, selector) {
		msg.step(multiStore.name);
		await this.ppt.goto(multiStore.href);
		const pptLocations = await this.getPptList(selector);
		if (pptLocations) {
			const locations = await this.getListJson(pptLocations);
			for (const l of Object.values(locations)) {
				if (l.href.match(/\d+$/)) {
					writer.set('stores.json', l.href.replace(/\W+/g, ''), { ...l });
				} else {
					writer.set('multi-misc-stores.json', l.href.replace(/\W+/g, ''), { ...l });
				}
			}
		}

		writer.set('multi-stores.json', multiStore.href.replace(/\W+/g, ''), { ...multiStore, done: 1 });
	}

	/* LOCATIONS */
	/** @param {{id: string, name: string, href: string, done: number}} state*/
	async getLocationsFromStates(state, selector) {
		msg.step(state.name);
		await this.ppt.goto(state.href);
		const pptLocations = await this.getPptList(selector);
		const locations = await this.getListJson(pptLocations);

		for (const l of Object.values(locations)) {
			if (l.href.match(/\d+$/)) {
				writer.set('stores.json', l.href.replace(/\W+/g, ''), { ...l });
			} else {
				writer.set('multi-stores.json', l.href.replace(/\W+/g, ''), { ...l });
			}
		}

		writer.set('states.json', state.name, { ...state, done: 1 });
	}

	/* STATES */
	async allStates() {
		const file = writer.read('states.json');
		if (isObject(file) && Object.values(file).length > 0) {
			const states = Object.values(file).filter(s => s.done === 0);
			msg.substep(`existing remaining states ${states.length}`);
			return states;
		}
		msg.step('openState');

		await this.ppt.goto('https://www.att.com/stores/us');

		const pptStates = await this.getPptList();
		const states = await this.getListJson(pptStates);

		writer.write('states.json', states);

		return Object.values(file);
	}

	/*  */
	async getPptList(selector = 'a.Directory-listLink') {
		try {
			await this.ppt.waitForSelector(selector);
		} catch (error) {
			msg.error(error);
			return null;
		}
		try {
			let list = await this.ppt.page.$$(selector);
			msg.substep('locations ' + list.length);
			return list;
		} catch (error) {
			msg.die('Nothing found');
		}
	}

	/**
	 * @param {puppeteer.ElementHandle<Element>[]} locations
	 * @return {[string:{ id: string; name: string; href: string; done: number; }]}
	 */
	async getListJson(locations) {
		const ls = {};
		for (const location of locations) {
			const name = await (await location.getProperty('textContent')).jsonValue();
			/** @type {String} */
			const href = await (await location.getProperty('href')).jsonValue();

			if (href.startsWith('https://www.att.com/stores') && !href.includes('#')) {
				const l = {
					name,
					href,
					id: href.replace(/\W+/g, ''),
					done: 0,
				};
				ls[l.id] = l;
			}
		}

		return ls;
	}
}

module.exports = { ATTScrape };
