# MultiversX SDK for JavaScript and TypeScript

MultiversX SDK for JavaScript and TypeScript (written in TypeScript).

## Documentation

- [Cookbook](https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook/)

## Distribution

[npm](https://www.npmjs.com/package/@multiversx/sdk-core)

## Installation

`sdk-core` is delivered via **npm** and it can be installed as follows:

```
npm install @multiversx/sdk-core
```

## Development

Feel free to skip this section if you are not a contributor.

### Prerequisites

`browserify` is required to compile the browser-friendly versions of `sdk-core`. It can be installed as follows:

```
npm install --global browserify
```

### Building the library

In order to compile the library, run the following:

```
npm install
npm run compile
npm run compile-browser
```

### Running the tests

In order to run the tests **on NodeJS**, do as follows:

```
npm run tests-unit
npm run tests-localnet
npm run tests-devnet
npm run tests-testnet
```

Before running the tests **in the browser**, make sure you have the package `http-server` installed globally.

```
npm install --global http-server
```

In order to run the tests **in the browser**, do as follows:

```
make clean && npm run browser-tests
```

For the `localnet` tests, make sure you have a _local testnet_ up & running. In order to start a _local testnet_, follow [this](https://docs.multiversx.com/developers/setup-local-testnet/).

### Updating the documentation

API documentation is generated from the source code using [api-extractor](https://api-extractor.com).

Prerequisites:

```
npm install -g @microsoft/api-extractor

# https://github.com/microsoft/rushstack/issues/4586
npm install -g @microsoft/api-documenter@7.23.38
```

In order to (re)generate the documentation, run the following:

```
rm -rf ~/mx-sdk-js-core-docs
git clone -b gh-pages --single-branch https://github.com/multiversx/mx-sdk-js-core.git ~/mx-sdk-js-core-docs

npm run compile
npm run api:extract

MAJOR_VERSION=v$(node -p "require('./package.json').version.split('.')[0]")
DOCS_OUTPUT_FOLDER=~/mx-sdk-js-core-docs/${MAJOR_VERSION} npm run api:document
```

Then, commit the changes in ` ~/mx-sdk-js-core-docs` push them to GitHub.
