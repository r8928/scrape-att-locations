const { writer } = require('./writer');
const { msg } = require('./msg');
const { isObject, indexOf } = require('lodash');
const { fetch } = require('./fetch');

class AttAddressFromStores {
	async do() {
		const stores = await this.allStores();

		for (const store of stores) {
			msg.error(stores.length - indexOf(stores, store));
			await this.getAddressFromStore(store);
		}
	}

	/** @param {{id: string, name: string, href: string, done: number}} store*/
	async getAddressFromStore(store) {
		msg.step(store.href);
		const html = String(fetch(store.href));

		const startphone = html.indexOf('"Phone-link" href="tel:');
		let phone = html.substr(startphone, 35).slice(-12);

		const startadd = html.indexOf('{"dimension1":');
		const endadd = html.indexOf('"pageview"}');
		let add = html.substr(startadd, endadd - startadd + 11);

		try {
			add = JSON.parse(add);
		} catch (error) {
			msg.die('can parse address');
		}

		const start = html.indexOf('<meta itemprop="latitude" content="');
		const str = html.substr(start, 200).split(/[\s+"]/);

		store['latitude'] = str[5];
		store['longitude'] = str[11];
		store['cid'] = str[14];
		store['phone'] = phone;
		store['address'] = [
			add.dimension4,
			add.dimension3,
			add.dimension2,
			add.dimension5,
			add.dimension6,
		].join(', ');

		if (!String(store['cid']).includes('https://')) {
			msg.die(str);
		}

		writer.set('stores.json', store.href.replace(/\W+/g, ''), { ...store, done: 1 });
	}

	async allStores() {
		const file = writer.read('stores.json');
		if (isObject(file) && Object.values(file).length > 0) {
			const stores = Object.values(file).filter(s => s.done === 0);
			msg.substep(`existing remaining stores ${stores.length}`);
			return stores;
		}
		return [];
	}
}

module.exports = { AttAddressFromStores };
