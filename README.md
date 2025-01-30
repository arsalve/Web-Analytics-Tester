# Web-Analytics-Tester

This bot tests various web analytics network calls and generates reports in JSON and CSV formats.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Built With](#built-with)
- [License](#license)

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

1. Start the Express server:
    ```sh
    node index.js
    ```
2. Open your browser and navigate to `http://localhost:3000`.
3. Fill out the form with the required parameters and click "Run Test".
4. The results will be displayed on the page and saved in the [Result](http://_vscodecontentref_/0) directory.

## Configuration

The [extraParameter](http://_vscodecontentref_/1) object in [main.js](http://_vscodecontentref_/2) allows you to customize the behavior of the bot. Here are some of the key parameters:

- [links](http://_vscodecontentref_/3): Array of URLs to test.
- [Authentication](http://_vscodecontentref_/4): Boolean indicating whether to use authentication.
- [creds](http://_vscodecontentref_/5): Object containing [user](http://_vscodecontentref_/6) and [pass](http://_vscodecontentref_/7) for authentication.
- [Screenshot](http://_vscodecontentref_/8): String indicating the type of screenshot (`full`, `true`, `false`).
- [consent](http://_vscodecontentref_/9): Boolean indicating whether to provide consent for requests.
- [allDevice](http://_vscodecontentref_/10): Boolean indicating whether to test on all devices.
- [Click](http://_vscodecontentref_/11): Selector for an element to click.
- [scrollDepth](http://_vscodecontentref_/12): Depth to scroll the page.
- [analyticsCalls](http://_vscodecontentref_/13): Array of objects specifying analytics calls to capture.
- [dataLayer](http://_vscodecontentref_/14): Name of the data layer object.
- [FileOutput](http://_vscodecontentref_/15): Boolean indicating whether to output results to files.

Example configuration:
```javascript
var extraParameter = {
    links: ["https://ecommerce.tealiumdemo.com/"],
    Authentication: true,
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