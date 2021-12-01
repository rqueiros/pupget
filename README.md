# Pupget

Pupget is a Node library for scraping the Web based on a DSL definition.

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install pupget.

```bash
npm install pupget
```

## Usage

```javascript
const pupget = require("pupget");

// Load default DSL
const filename = require.resolve("pupget/pupget.json");
pupget.readFromFile(filename);

// Load DSL as string
pupget.readFrominnerJson("{...}");

// Scraping (if DSL created from scratch)
pupget.scrape();
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
