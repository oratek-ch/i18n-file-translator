const fs = require('fs');
const _ = require('lodash');
const commandLineArgs = require('command-line-args')
const ProgressBar = require('progress');

const {
	translate,
	detectLanguage,
	wordAlternatives,
	translateWithAlternatives
} = require('deepl-translator');

const optionDefinitions = [
	{ name: 'verbose', alias: 'v', type: Boolean },
	{ name: 'help', alias: 'h', type: Boolean },
	{ name: 'lang', alias: 'l', type: String },
	{ name: 'input', alias: 'i', type: String },
	{ name: 'output', alias: 'o', type: String },
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

if (!options.output) {
	throw new Error('ouput is not set');
}

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
				translate(value, outputLang)
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
						params[key] = res.translation;
						if (numberOfCall === numOfCallResolved) {
							callback(null, moc); // once all callback arrived means that process ended
						}
					})
					.catch((e) => {
						callback(e, null);
					})
			}, numberOfCall * 2000) // avoid the api call limit
		}
	});
};

translateObj(moc, lang, (err, result) => {
	if (err) {
		console.error(err);
	} else {
		console.log(`Translation file available at ${options.output}`);
		fs.writeFileSync(options.output, JSON.stringify(result));
	}
});
