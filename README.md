Collecting workspace information

# Web-Analytics-Tester

This bot tests various web analytics network calls and generates reports in JSON and CSV formats.

## Table of Contents

- Installation
- Usage
- Configuration
- Built With
- License

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/arsalve/Web-Analytics-Tester.git
    ```
2. Navigate to the project directory:
    ```sh
    cd Web-Analytics-Tester
    ```
3. Install the dependencies:
    ```sh
    npm install
    ```

## Usage

1. Update the 

extraParameter

 object in main.js with your desired configuration.
2. Add the URLs you want to test in the 

links

 array in main.js.
3. Run the test script:
    ```sh
    npm run test
    ```

## Configuration

The 

extraParameter

 object in main.js allows you to customize the behavior of the bot. Here are some of the key parameters:

- 

creds

: Authentication credentials.
- 

Screenshot

: Whether to take screenshots (

full

 for full page, `true` for before and after scroll).
- 

consent

: Whether to provide consent for requests.
- 

allDevice

: Whether to test on all devices.
- 

Click

: Selector for an element to click.
- 

scrollDepth

: Depth to scroll the page.
- 

analyticsCalls

: Array of objects specifying analytics calls to capture.
- 

dataLayer

: Name of the data layer object.
- 

FileOutput

: Whether to output results to files.

Example configuration:
```javascript
var extraParameter = {
    creds: {
        user: "readonly",
        pass: "secret"
    },
    Screenshot: "full",
    consent: true,
    allDevice: true,
    Click: false,
    scrollDepth: 100,
    analyticsCalls: [
        { includesText: "b/ss", outputKey: "AA Call", reqType: "All" },
        { includesText: "bat.", outputKey: "UET", reqType: "GET" },
        { includesText: "delivery", outputKey: "target", reqType: "GET" },
        { includesText: "collect", outputKey: "TealiumCollect", reqType: "POST" }
    ],
    dataLayer: "utag_data",
    FileOutput: true
};
```

## Built With

- [Puppeteer](https://github.com/puppeteer/puppeteer) - Headless Chrome Node.js API
- [puppeteer-extra](https://github.com/berstend/puppeteer-extra) - A modular plugin framework for puppeteer
- [puppeteer-extra-plugin-stealth](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth) - Plugin to make puppeteer undetectable
- [json2csv](https://github.com/zemirco/json2csv) - Convert JSON to CSV
- [chrome-har](https://github.com/sitespeedio/chrome-har) - Generate HAR files from Chrome DevTools Protocol

## License

This project is licensed under the Apache License 2.0 - see the 

LICENSE

 file for details.