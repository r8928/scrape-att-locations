const jsonfile = require('jsonfile');
const _ = require('lodash');
class writer {
	static read(fileName) {
		try {
			return jsonfile.readFileSync(fileName);
		} catch (error) {
			return null;
		}
	}

	static push(fileName, value) {
		let json = this.read(fileName) || [];

		json.push(value);

		json = _.uniq(json);

		jsonfile.writeFileSync(fileName, json);
	}

	static set(fileName, path, value) {
		let json = this.read(fileName) || {};

		_.set(json, path, value);

		jsonfile.writeFileSync(fileName, json);
	}

	static write(fileName, value) {
		jsonfile.writeFileSync(fileName, value);
	}
}

module.exports = { writer };
