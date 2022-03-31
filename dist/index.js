var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import puppeteer from "puppeteer";
import { Blob } from "node:buffer";
let URL = "";
let browser = null;
const init = (url) => __awaiter(void 0, void 0, void 0, function* () {
    URL = url;
    // Create browser, open page and go to url
    browser = yield puppeteer.launch();
    const page = yield browser.newPage();
    yield page.goto(URL);
    // // Get all scripts
    const scripts = yield getScripts(page);
    console.log(scripts);
    // // Scan for HTML SCRIPTS
    console.log(hasHubspotTracking(scripts));
    console.log(hasGoogleAnalyticsTracking(scripts));
    console.log(hasGoogleTagManagerTracking(scripts));
    // // Scan for HTML TAGS
    console.log(yield hasOneH1(page));
    console.log(yield hasAltAttributes(page));
    console.log(yield hasTitle(page));
    console.log(yield hasMetaDescription(page));
    console.log(yield hasMetaViewport(page));
    // Measure Performance
    // console.log(await getCodeCoverage(page));
    // console.info(await getCodeCoverage2(page));
    // console.info(await performanceEntries(page));
    // console.log("GO");
    // console.log(await measureRequests(page));
    // text: 'Bytes used: 4.5413221197348985%'
    // usedBytesKb: 63.7
    // totalBytesKb: 1403.5
    // unusedBytesKb: 1339.8
    // Close browser
    yield browser.close();
});
const measureRequests = (page) => __awaiter(void 0, void 0, void 0, function* () {
    const results = []; // collects all results
    let paused = false;
    let pausedRequests = [];
    const nextRequest = () => {
        // continue the next request or "unpause"
        if (pausedRequests.length === 0) {
            paused = false;
        }
        else {
            // continue first request in "queue"
            pausedRequests.shift()(); // calls the request.continue function
        }
    };
    yield page.setRequestInterception(true);
    page.on("request", (request) => {
        if (paused) {
            pausedRequests.push(() => request.continue());
        }
        else {
            paused = true; // pause, as we are processing a request now
            request.continue();
        }
    });
    page.on("requestfinished", (request) => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request.response();
        const responseHeaders = response.headers();
        let responseBody;
        if (request.redirectChain().length === 0) {
            // body can only be access for non-redirect responses
            responseBody = yield response.buffer();
        }
        const information = {
            url: request.url(),
            requestHeaders: request.headers(),
            requestPostData: request.postData(),
            responseHeaders: responseHeaders,
            responseSize: responseHeaders["content-length"],
            responseBody,
        };
        results.push(information);
        nextRequest(); // continue with next request
    }));
    page.on("requestfailed", (request) => {
        // handle failed request
        nextRequest();
    });
    yield page.goto(URL, { waitUntil: "networkidle0" });
    return results;
});
const performanceEntries = (page) => __awaiter(void 0, void 0, void 0, function* () {
    yield page.goto(URL);
    return JSON.parse(yield page.evaluate(() => JSON.stringify(performance.getEntries())));
});
const byteSize = (str) => new Blob([str]).size;
const getCodeCoverage = (page) => __awaiter(void 0, void 0, void 0, function* () {
    // Enable both JavaScript and CSS coverage
    yield Promise.all([
        page.coverage.startJSCoverage(),
        page.coverage.startCSSCoverage(),
    ]);
    yield page.goto(URL);
    // Disable both JavaScript and CSS coverage
    const [jsCoverage, cssCoverage] = yield Promise.all([
        page.coverage.stopJSCoverage(),
        page.coverage.stopCSSCoverage(),
    ]);
    let totalBytes = 0;
    let usedBytes = 0;
    const coverage = [...jsCoverage, ...cssCoverage];
    for (const entry of coverage) {
        console.log(entry.url);
        totalBytes += entry.text.length;
        console.log(byteSize(entry.text));
        for (const range of entry.ranges)
            usedBytes += range.end - range.start - 1;
    }
    return {
        text: `Bytes used: ${(usedBytes / totalBytes) * 100}%`,
        usedBytesKb: usedBytes / 1000,
        totalBytesKb: totalBytes / 1000,
        unusedBytesKb: (totalBytes - usedBytes) / 1000,
    };
});
const getCodeCoverage2 = (page) => __awaiter(void 0, void 0, void 0, function* () {
    // Gather coverage for JS and CSS files
    yield Promise.all([
        page.coverage.startJSCoverage(),
        page.coverage.startCSSCoverage(),
    ]);
    // Stops the coverage gathering
    const [jsCoverage, cssCoverage] = yield Promise.all([
        page.coverage.stopJSCoverage(),
        page.coverage.stopCSSCoverage(),
    ]);
    // Calculates # bytes being used based on the coverage
    const calculateUsedBytes = (type, coverage) => coverage.map(({ url, ranges, text }) => {
        let usedBytes = 0;
        ranges.forEach((range) => (usedBytes += range.end - range.start - 1));
        return {
            url,
            type,
            usedBytes,
            totalBytes: text.length,
            percentUsed: `${((usedBytes / text.length) * 100).toFixed(2)}%`,
        };
    });
    return [
        ...calculateUsedBytes("js", jsCoverage),
        ...calculateUsedBytes("css", cssCoverage),
    ];
});
const hasHubspotTracking = (scripts) => {
    const id = "hs-script-loader";
    const src = "js.hs-scripts.com";
    return scripts.some((script) => script.id.includes(id) && script.src.includes(src));
};
const hasGoogleAnalyticsTracking = (scripts) => {
    const regex = /gtag\(.*\)/;
    const src = "https://www.googletagmanager.com/gtag/js";
    return scripts.some((script, i) => {
        if (scripts[i + 1]) {
            return script.src.includes(src) && regex.test(scripts[i + 1].content);
        }
    });
};
const hasGoogleTagManagerTracking = (scripts) => {
    const content = "https://www.googletagmanager.com/gtm.js";
    return scripts.some((script) => script.content.includes(content));
};
const hasOneH1 = (page) => {
    return page.evaluate(() => {
        const h1s = document.querySelectorAll("h1");
        return h1s.length === 1;
    });
};
const hasAltAttributes = (page) => {
    return page.evaluate(() => {
        const images = document.querySelectorAll("image");
        const areas = document.querySelectorAll("area");
        const inputs = document.querySelectorAll("input[type=image]");
        return [...images, ...areas, ...inputs].every((tag) => tag.hasAttribute("alt"));
    });
};
const hasTitle = (page) => {
    return page.evaluate(() => document.querySelector("title") !== null);
};
const hasMetaDescription = (page) => {
    return page.evaluate(() => document.querySelector("meta[name=description]") !== null);
};
const hasMetaViewport = (page) => {
    return page.evaluate(() => document.querySelector("meta[name=viewport]") !== null);
};
const getScripts = (page) => {
    return page.evaluate(() => {
        const scripts = [...document.querySelectorAll("script")];
        return scripts.map((x) => ({
            id: x.getAttribute("id") || "",
            src: x.getAttribute("src") || "",
            content: x.innerHTML || "",
        }));
    });
};
init("https://ngine.webflow.io/");
// init("https://fontawesome.com/");
// init("https://emote-racer.herokuapp.com/");
