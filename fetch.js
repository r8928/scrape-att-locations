var request = require('sync-request');

function fetch(url) {
	var res = request('GET', url);
	return res.getBody('utf8');
}

module.exports = { fetch };
