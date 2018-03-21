const fs = require('fs');
const co = require('co');
const {
	translate,
	detectLanguage,
	wordAlternatives,
	translateWithAlternatives
} = require('deepl-translator');
const commandLineArgs = require('command-line-args')
const commandLineUsage = require('command-line-usage')

const optionDefinitions = [
	{ name: 'verbose', alias: 'v', type: Boolean },
	{ name: 'help', alias: 'h', type: Boolean },
	{ name: 'lang', alias: 'l', type: String },
	{ name: 'input', alias: 'i', type: String },
	{ name: 'output', alias: 'o', type: String },
	{ name: 'shitf', alias: 's', type: String },
];

const sections = [
	{
		header: 'i18n-File-translator',
		content: 'Use deepl to translate a json i18 file to an other language'
	},
	{
		header: 'Options',
		optionList: [
			{
				name: 'help',
				description: 'Print this usage guide.'
			},
			{
				name: 'input',
				typeLabel: 'String',
				description: 'The input path of the process.'
			},
			{
				name: 'output',
				typeLabel: 'String',
				description: 'The output path of the process.'
			},
			{
				name: 'lang',
				typeLabel: 'String',
				description: 'The input to process.'
			},
			{
				name: 'shitf',
				typeLabel: 'String',
				description: 'The time you want to add between each translation (used because API rate limite of deepL is low)'
			},
		]
	}
]

const usage = commandLineUsage(sections)
const options = commandLineArgs(optionDefinitions);

function verify() {
	return !!options.lang && !!options.shift && !!options.input && !!options.output;
}

if (options.help) {
	console.log(usage);
	process.exit();
} else if (!verify()) {
	console.log(usage);
	process.exit();
}

try {
	const JSONInputData = JSON.parse(fs.readFileSync(options.input));
	const lang = options.lang.toUpperCase();
	function iterate(actualObject) {
		Object.entries(actualObject).forEach(([key, value]) => {
			if (typeof value === 'object') {
				iterate(value);
			} else {
				setTimeout(function () {
					co(function* () {
						const res = yield translate(value, lang);
						actualObject[key] = res.translation;
						fs.writeFileSync(options.output, JSON.stringify(JSONInputData));
					});
				}, Number(options.shift));
			}
		});
	}
	iterate(JSONInputData);
} catch (e) {
	console.log(usage);
	process.exit();
}