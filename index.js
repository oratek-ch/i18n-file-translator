const fs = require('fs');
const util = require('util');

const _ = require('lodash');
const commandLineArgs = require('command-line-args')
const ProgressBar = require('progress');

const {
	translate,
} = require('deepl-client');

const delay = 100;

const optionDefinitions = [
	{ name: 'verbose', alias: 'v', type: Boolean },
	{ name: 'help', alias: 'h', type: Boolean },
	{ name: 'lang', alias: 'l', type: String },
	{ name: 'source_lang', alias: 's', type: String },
	{ name: 'input', alias: 'i', type: String },
	{ name: 'output', alias: 'o', type: String },
	{ name: 'key', alias: 'k', type: String },
	{ name: 'engine', alias: 'e', type: String },
];

const options = commandLineArgs(optionDefinitions);

let data;
let moc;
let lang;

if (!options.input) {
	throw new Error('input is not set');
} else {
	data = fs.readFileSync(options.input);
	moc = JSON.parse(data);
}

if (!options.lang) {
	throw new Error('Lang is not set');
} else {
	lang = options.lang.toUpperCase();
}

if (!options.source_lang) {
	options.source_lang = 'EN';
}

if (!options.output) {
	throw new Error('ouput is not set');
}

if (!options.key) {
	throw new Error('API key is not set');
}

if (!options.engine) {
	throw new Error('Please specify an engine (google or deepl)');
} else {
	if (!['google', 'deepl'].includes(options.engine)) {
		options.engine = 'google';
	}
}

// Google API
const googleOptions = {};
const googleTranslate = require('google-translate')(options.key, googleOptions);

let numberOfCall = 0;
let numOfCallResolved = 0;
let bar;

translateObj = (params, outputLang, callback) => {
	_.forIn(params, (value, key) => {
		if (_.isObject(value)) {
			translateObj(value, outputLang, callback);
		} else {
			numberOfCall++; // count for number of call
			setTimeout(() => {
				if (options.engine == 'deepl') {
					const config = {
						auth_key: options.key,
						text: value,
						source_lang: options.source_lang,
						target_lang: outputLang,
					}
					translate(config)
						.then(res => {
							if (!bar) {
								bar = new ProgressBar('translating [:bar] :percent :etas', {
									complete: '=',
									incomplete: ' ',
									width: 50,
									total: numberOfCall
								});
								bar.tick();
							} else {
								bar.tick();
							}
							numOfCallResolved++; // count for number of callback
							params[key] = res.translations[0].text;
							if (numberOfCall === numOfCallResolved) {
								callback(null, moc); // once all callback arrived means that process ended
							}
						})
						.catch((e) => {
							callback(e, null);
						})
				} else { // This is for google API. Should be refactored
					const translate = util.promisify(googleTranslate.translate);
					translate(value, options.source_lang.toLowerCase(), outputLang.toLowerCase())
						.then(res => {
							if (!bar) {
								bar = new ProgressBar('translating [:bar] :percent :etas', {
									complete: '=',
									incomplete: ' ',
									width: 50,
									total: numberOfCall
								});
								bar.tick();
							} else {
								bar.tick();
							}
							numOfCallResolved++; // count for number of callback
							params[key] = res.translatedText;
							if (numberOfCall === numOfCallResolved) {
								callback(null, moc); // once all callback arrived means that process ended
							}
						})
						.catch((e) => {
							callback(e, null);
						})
				}
			}, numberOfCall * delay) // avoid the api call limit
		}
	});
};

translateObj(moc, lang, (err, result) => {
	if (err) {
		console.error(err);
	} else {
		console.log(`Translation file available at ${options.output}`);
		fs.writeFileSync(options.output, JSON.stringify(result, null, 4));
	}
});
