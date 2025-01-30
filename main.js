const puppeteer = require("puppeteer-extra");
const pup = require("puppeteer");
const fs = require("fs");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const {
    Parser
} = require("json2csv");
const {
    harFromMessages
} = require("chrome-har");

puppeteer.use(StealthPlugin());

/**
 * Runs the Puppeteer process for the given link and device.
 * @param {string} link - The link to process.
 * @param {Array<string>} device - The device to emulate.
 * @param {Object} extraParameter - Additional parameters for processing.
 * @returns {Promise<void>}
 */
async function run(link, device, extraParameter, op) {
    var events = [];
    var observe = [
        "Page.loadEventFired", "Page.domContentEventFired", "Page.frameStartedLoading",
        "Page.frameAttached", "Network.requestWillBeSent", "Network.requestServedFromCache",
        "Network.dataReceived", "Network.responseReceived", "Network.resourceChangedPriority",
        "Network.loadingFinished", "Network.loadingFailed"
    ];

    console.log(`Started for ${device[0]} URL: ${link}`);
    var div = device[0];
    var finalOutput = {};
    var allRequests = [];
    var browser = await puppeteer.launch({
        headless: true
    });
    var page = await browser.newPage();

    if (div !== "Desktop") {
        await page.emulate(pup.KnownDevices[div]);
    } else {
        await page.emulate({
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            viewport: {
                width: 1920,
                height: 1080
            }
        });
    }

    if (extraParameter.Authentication) {
        await page.authenticate({
            username: extraParameter.creds.user,
            password: extraParameter.creds.pass
        });
    }

    var client = await page.target().createCDPSession();
    await client.send("Page.enable");
    await client.send("Network.enable");
    await page.setDefaultNavigationTimeout(80000);
    await page.setRequestInterception(true);

    page.on("request", (req) => {
        observe.forEach((method) => {
            client.on(method, (params) => {
                events.push({
                    method,
                    params
                });
            });
        });
        if (extraParameter.consent) {
            req.continue();
        } else {
            var headers = req.headers();
            headers["x-Forwarded-For"] = "8.8.8.8";
            req.continue({
                headers
            });
        }
    });

    await page.goto(link);

    if (extraParameter.Screenshot) {
        await waitForTimeout(5000);
        var screenshotPath = `Result_${extraParameter.Screenshot === "full" ? "Full" : "BeforeScroll"}_${link.split("/")[2]}_${device[0]}_${Date.now()}.jpg`;
        await page.screenshot({
            path: screenshotPath,
            type: "jpeg",
            fullPage: extraParameter.Screenshot === "full"
        });
        await waitForTimeout(1000);
    }

    if (extraParameter.scrollDepth) {
        await waitForTimeout(5000);
        await autoscroll(page, extraParameter);
        if (extraParameter.Screenshot === "true") {
            var screenshotPath = `Result_AfterScroll_${link.split("/")[2]}_${device[0]}_${Date.now()}.jpg`;
            await page.screenshot({
                path: screenshotPath,
                type: "jpeg"
            });
            await waitForTimeout(1000);
        }
    }

    if (extraParameter.Click && extraParameter.Click !== "false") {
        try {
            await waitForTimeout(5000);
            await page.waitForSelector(extraParameter.Click);
            await page.click(extraParameter.Click);
            await waitForTimeout(1000);
        } catch (error) {
            console.log("Button not found");
        }
    }

    if (extraParameter.FileOutput) {
        try {
            await waitForTimeout(4800);
            let DLeval = ``;
            var dataLayer = await page.evaluate((extraParameter) => {
                try {
                    return (typeof window[extraParameter.dataLayer] !== 'undefined') ? window[extraParameter.dataLayer] : 'Not Found';
                } catch (e) {
                    return 'Not Found';
                }
            }, extraParameter);
            var satellite = await page.evaluate(() => {
                try {
                    return (_satellite !== undefined) ? _satellite : 'Not Found';
                } catch (e) {
                    return 'Not Found';
                }
            });
            var har = harFromMessages(events);
            var entriesArr = har.log.entries;

            if (dataLayer === 'Not Found') {
                Object.assign(finalOutput, {
                    URL: link,
                    digitalData: dataLayer
                });
            }
            if (satellite != 'Not Found') {
                Object.assign(finalOutput, {
                    Launch: {
                        name: satellite.property.name,
                        buildInfo: satellite.buildInfo,
                        environment: satellite.environment.stage
                    }
                });
            }

            if (extraParameter.analyticsCalls) {
                extraParameter.analyticsCalls.forEach(call => {
                    processEntries(entriesArr, finalOutput, allRequests, call.includesText, call.outputKey, call.reqType);
                });

                entriesArr.forEach(entry => {
                    var entriesURL = entry.request.url;
                    if (!extraParameter.analyticsCalls.some(call => entriesURL.includes(call.includesText))) {
                        allRequests.push({
                            remaining: {
                                networkReq: entriesURL,
                                Parameters: entry.request.queryString
                            }
                        });
                    }

                });
               Object.assign(finalOutput,{OtherRequests:allRequests});
            }
        } catch (err) {
            console.error(err);
        }

        try {
            op.push(finalOutput);
            var Dir = "Result";
            fs.writeFileSync(`${Dir}/AACall_${link.split("/")[1]}_${device[0]}_${Date.now()}.json`, JSON.stringify(finalOutput));
        } catch (err) {
            console.error(err);
        }
    }

    await page.close();
    await browser.close();

    if (device.length - 1 === 0) {
        if (!extraParameter.allDevice) {
            console.log("Completed for all devices");
            return 1;
        } else {
            console.log(`Completed for ${device[0]}`);
            device.shift();
            return run(link, device, extraParameter);
        }
    }
}

/**
 * Flattens a nested object.
 * @param {Object} obj - The object to flatten.
 * @param {string} parent - The parent key.
 * @param {Object} res - The result object.
 * @returns {Object} - The flattened object.
 */
function flattenObject(obj, parent = '', res = {}) {
    for (let key in obj) {
        var propName = parent ? `${parent}.${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
            flattenObject(obj[key], propName, res);
        } else {
            res[propName] = obj[key];
        }
    }
    return res;
}

/**
 * Processes the entries array and updates the final output and all requests.
 * @param {Array} entriesArr - The array of entries.
 * @param {Object} finalOutput - The final output object.
 * @param {Array} allRequests - The array of all requests.
 * @param {string} includesText - The text to include.
 * @param {string} outputKey - The output key.
 */function processEntries(entriesArr, finalOutput, allRequests, includesText, outputKey, reqType) {
    entriesArr.forEach(entry => {
        var entriesURL = entry.request.url;
        if (entriesURL.includes(includesText)) {
            let parameters;
            switch (reqType) {
                case "GET":
                    parameters = { queryString: entry.request.queryString };
                    break;
                case "POST":
                    parameters = { POST: entry.request.postData?.text || entry.request.postData };
                    break;
                case "All":
                    parameters = { queryString: entry.request.queryString, Post: entry.request.postData };
                    break;
                default:
                    parameters = { queryString: entry.request.queryString, Post: entry.request.postData };
                    break;
            }

            if (!finalOutput[outputKey]) {
                finalOutput[outputKey] = [];
            }

            finalOutput[outputKey].push({
                networkReq: entriesURL,
                Parameters: parameters
            });
        }
    });
}
/**
 * Converts JSON data to CSV and writes it to a file.
 * @param {Array} jsonData - The JSON data to convert.
 */
function JsonToCsv(jsonData) {

    extractedData = jsonData.map((item) => {

        var result = {
            a: {},
            OneCollectorPV: {}
        };
        if (item.URL) result.URL = item.URL;
        if (item.digitalData?.page?.pageInfo) Object.assign(result, item.digitalData.page.pageInfo);
        if (item.digitalData?.ausTags) Object.assign(result.ava, item.digitalData.ausTags);
        if (item.Launch?.name) result.LaunchName = item.Launch.name;
        return flattenObject(result);
    });
    var json2csvParser = new Parser();
    var csv = json2csvParser.parse(extractedData);
    var Dir = "Result";
    fs.writeFile(`${Dir}/Full_Results_${Date.now()}.csv`, csv, (err) => {
        if (err) {
            console.error("Error writing CSV file", err);
        } else {
            console.log("CSV file successfully written");
        }
    });
}

/**
 * Waits for the specified amount of time.
 * @param {number} milliseconds - The number of milliseconds to wait.
 * @returns {Promise<void>}
 */
async function waitForTimeout(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Parses query parameters from a query string.
 * @param {string} querystring - The query string to parse.
 * @returns {Object} - The parsed query parameters.
 */
function parseParams(querystring) {
    var params = new URLSearchParams(querystring);
    var obj = {};
    for (var key of params.keys()) {
        obj[key] = params.getAll(key).length > 1 ? params.getAll(key) : params.get(key);
    }
    return obj;
}

/**
 * Automatically scrolls the page to the specified depth.
 * @param {Object} page - The Puppeteer page object.
 * @param {Object} extraParameter - Additional parameters for processing.
 * @returns {Promise<void>}
 */
async function autoscroll(page, extraParameter) {
    await page.evaluate(async (extraParameter) => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = extraParameter.scrollDepth;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    }, extraParameter);
}

/**
 * Initializes the Puppeteer process for the given link and extra parameters.
 * @param {string} link - The link to process.
 * @param {Object} extraParameter - Additional parameters for processing.
 * @returns {Promise<void>}
 */
async function Init(link, extraParameter, op) {
    var device = extraParameter.allDevice ? ["Desktop", "iPhone 2", "Pixel 2", "Pixel 2 XL", "iPhone 4", "iPhone 5", "iPhone 13 Pro", "iPhone 8 Plus", "iPad Pro 11", "iPad Mini", "iPad", "Galaxy Tab S4", "Galaxy Tab S5e landscape", "Galaxy S10", "Pixel 5"] : ["Desktop"];
    return run(link, device, extraParameter, op);
}

/**
 * Initializes the process for the given link and extra parameters.
 * @param {string} link - The link to process.
 * @param {Object} extraParameter - Additional parameters for processing.
 * @returns {Promise<boolean>}
 */
async function initProcess(link, extraParameter, op) {
    try {
        await Init(link, extraParameter, op);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

/**
 * Handles the completion of the process for all links.
 * @param {number} count - The current count of processed links.
 * @param {number} len - The total number of links.
 * @param {Object} extraParameter - Additional parameters for processing.
 * @param {Array} op - The output array.
 */
function handleCompletion(count, len, extraParameter, op) {
    if (count === len) {
        console.log("Finish");
        if (extraParameter.FileOutput) {
            var Dir = "Result";
            fs.writeFileSync(`${Dir}/Full_Results_${Date.now()}.json`, JSON.stringify(op));
            JsonToCsv(op);
        }
    } else {
        console.log(`Total Completed links count: ${count}`);
    }
}

/**
 * Starts the cold start process for the given links.
 * @param {Array<string>} links - The list of links to process.
 * @param {number} len - The total number of links.
 * @param {number} count - The current count of processed links.
 * @param {Object} extraParameter - Additional parameters for processing.
 * @param {Array} op - The output array.
 * @returns {Promise<void>}
 */
async function coldstart(links, len, count, extraParameter, op) {
    while (links.length > 0) {
        var link = links.shift();
        var success = await initProcess(link, extraParameter, op);
        if (success) {
            count++;
            handleCompletion(count, len, extraParameter, op);
        }
    }
}

/**
 * Main function to start the process with the given test links and extra parameters.
 * @param {Array<string>} Testlinks - The list of test links to process.
 * @param {Object} extraParameter - Additional parameters for processing.
 * @returns {Promise<void>}
 */
async function main(extraParameter) {
    var links = [...extraParameter.links];
    var len = links.length;
    var count = 0;
    var op = [];
    console.log(len);
    await coldstart(links, len, count, extraParameter, op);
}

// Sample extraParameter object
/*var extraParameter = {
    links = ["https://ecommerce.tealiumdemo.com/"],
    Authentication:true,
    creds: {
        user: "readonly",
        pass: "secret"
    },
    Screenshot: "full",// Full = full page screenshot , true = normal page screenshot, False = no screenshot
    consent: true,
    allDevice: true,
    Click: false,
    scrollDepth: 100,
    analyticsCalls: [{
            includesText: "b/ss",
            outputKey: "AA Call",
            reqType: "All"
        },
        {
            includesText: "bat.",
            outputKey: "UET",
            reqType: "GET"
        },
        {
            includesText: "delivery",
            outputKey: "target",
            reqType: "GET"
        },
        {
            includesText: "collect",
            outputKey: "TealiumCollect",
            reqType: "POST"
        },

    ],
    dataLayer: "utag_data",
    FileOutput: true
};

// Sample links array
 

// Start the main process
//main(extraParameter);*/

module.exports =  main;