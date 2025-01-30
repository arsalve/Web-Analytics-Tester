
# Web-Analytics-Tester

This bot tests various web analytics network calls and generates reports in JSON and CSV formats.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Form Instructions](#form-instructions)
- [How It Works](#how-it-works)
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
4. The results will be displayed on the page and saved in the 

Result

 directory.

## Configuration

The extraParameter object in main.js allows you to customize the behavior of the bot. Here are some of the key parameters:

- `links` : Array of URLs to test.
- `Authentication`: Boolean indicating whether to use authentication.
- `creds`: Object containing `user` and `pass` for authentication.
- `Screenshot`: String indicating the type of screenshot (`full`, `true`, `false`).
- `consent`: Boolean indicating whether to provide consent for requests.
- `allDevice`: Boolean indicating whether to test on all devices.
- `Click`: Selector for an element to click.
- `scrollDepth`: Depth to scroll the page.
- `analyticsCalls`: Array of objects specifying analytics calls to capture.
- `dataLayer`: Name of the data layer object.
- `FileOutput`: Boolean indicating whether to output results to files.

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
```

## Form Instructions

1. **Links (comma separated)**: Enter the URLs you want to test, separated by commas.
2. **Authentication**: Check this box if authentication is required.
3. **Creds User**: Enter the username for authentication.
4. **Creds Pass**: Enter the password for authentication.
5. **Screenshot**: Select the type of screenshot (`full`, `true`, `false`).
6. **Consent**: Check this box if consent is required for requests.
7. **All Device**: Check this box if you want to test on all devices.
8. **Click**: Enter the selector for an element to click (if any).
9. **Scroll Depth**: Enter the depth to scroll the page.
10. **Analytics Calls**: Add rows to specify analytics calls to capture. Each row should include:
    - **Includes Text**: Text to include in the request.
    - **Output Key**: Key to use in the output.
    - **Request Type**: Type of request (`All`, `GET`, `POST`).
11. **Data Layer**: Enter the name of the data layer object.
12. **File Output**: Check this box if you want to output results to files.

## How It Works

1. **Server Setup**: The Express server serves the HTML form and handles form submissions.
2. **Form Submission**: When the form is submitted, the server receives the links and extraParameter values.
3. **Main Function**: The main function in main.js is called with the provided links and extraParameter.
4. **Puppeteer**: Puppeteer is used to automate the browser and perform the tests on the specified links.
5. **Analytics Calls**: The specified analytics calls are captured and processed.
6. **Results**: The results are displayed on the page and saved in the 

Result

 directory in JSON and CSV formats.

## Built With

- [Puppeteer](https://github.com/puppeteer/puppeteer) - Headless Chrome Node.js API
- [puppeteer-extra](https://github.com/berstend/puppeteer-extra) - A modular plugin framework for puppeteer
- [puppeteer-extra-plugin-stealth](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth) - Plugin to make puppeteer undetectable
- [json2csv](https://github.com/zemirco/json2csv) - Convert JSON to CSV
- [chrome-har](https://github.com/sitespeedio/chrome-har) - Generate HAR files from Chrome DevTools Protocol
- [Express](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js

## License

GNU GENERAL PUBLIC LICENSE

### Attribution

When using this code, you must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

### Notices

You do not have to comply with the license for elements of the material in the public domain or where your use is permitted by an applicable exception or limitation.

No warranties are given. The license may not give you all of the permissions necessary for your intended use. For example, other rights such as publicity, privacy, or moral rights may limit how you use the material.
```

This README file provides a comprehensive guide on how to install, configure, and use the Web-Analytics-Tester project, including detailed instructions on how to fill out the HTML form and an explanation of how the tool works.
This README file provides a comprehensive guide on how to install, configure, and use the Web-Analytics-Tester project, including detailed instructions on how to fill out the HTML form and an explanation of how the tool works.
