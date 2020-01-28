# Translate easily using deepL

Translating text as never been so easy.

```shell
npm install @oratek/i18n-file-translator

git clone https://github.com/oratekch/i18n-file-translator
```

## Usage

```shell
# as simple as that
npm install

node index.js -i "path/to/myfile.json" -o 'path/to/destfile.json' -l 'EN' -e 'google' -k 'API_KEY'
```

+ `-i` JSON input file
+ `-o` JSON output file
+ `-l` Destination lang
+ `-e` Translation engine (google or deepl)
+ `-k` API Key (please sea respective documentation for each engine to retrieve the API KEY)

DeepL should detect the input lang by himself :-)


## Troubleshooting

You may reach the api rate limit if your are translating large file, when you see the `code 429` you should wait a bit before tranlating again (you api may be blacklisted).

## Contribution

Contributions are welcome, fork the project play with it and make a pull request
