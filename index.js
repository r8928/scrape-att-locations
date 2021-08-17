const { AttAddressFromStores } = require('./AttAddressFromStores');
const { msg } = require('./msg');
const { writer } = require('./writer');

(async () => {
	// 	const att = await new ATTScrape().start();
	// 	await att.do();

	const stores = new AttAddressFromStores().do();
	// 	msg.die('done');
})();

function removeDuplicates(file = 'multi-stores.json') {
	const ns = {};

	let ls = writer.read(file);
	const l_done = ls.filter(s => s.done === 1);
	msg.error(`l_done.length ${l_done.length}`);
	const l_notdone = ls.filter(s => s.done === 0);
	msg.error(`l_notdone.length ${l_notdone.length}`);

	l_done.forEach(s => {
		ns[s.name] = s;
	});
	l_notdone.forEach(s => {
		if (!(s.name in ns)) {
			ns[s.name] = s;
		}
	});

	writer.write(file, Object.values(ns));
	msg.die(Object.keys(ns).length);
}
