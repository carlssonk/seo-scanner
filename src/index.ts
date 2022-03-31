import puppeteer from "puppeteer";
import { Blob } from "node:buffer";

interface browserInterface {
  [x: string]: any;
}

interface scriptsInterface {
  id: string;
  src: string;
  content: string;
  // conten2: Promise<string>;
}

// type scriptsInterface = scriptObjectInterface[];

let URL: string = "";

let browser: browserInterface = null;

const init = async (url: string): Promise<void> => {
  URL = url;
  // Create browser, open page and go to url
  browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(URL);

  // // Get all scripts
  const scripts: scriptsInterface[] = await getScripts(page);

  // // Scan for HTML SCRIPTS
  console.log(hasHubspotTracking(scripts));
  console.log(hasGoogleAnalyticsTracking(scripts));
  console.log(hasGoogleTagManagerTracking(scripts));

  // // Scan for HTML TAGS
  console.log(await hasOneH1(page));
  console.log(await hasAltAttributes(page));
  console.log(await hasTitle(page));
  console.log(await hasMetaDescription(page));
  console.log(await hasMetaViewport(page));

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
  await browser.close();
};

const measureRequests = async (page) => {
  const results = []; // collects all results

  let paused = false;
  let pausedRequests = [];

  const nextRequest = () => {
    // continue the next request or "unpause"
    if (pausedRequests.length === 0) {
      paused = false;
    } else {
      // continue first request in "queue"
      pausedRequests.shift()(); // calls the request.continue function
    }
  };

  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (paused) {
      pausedRequests.push(() => request.continue());
    } else {
      paused = true; // pause, as we are processing a request now
      request.continue();
    }
  });

  page.on("requestfinished", async (request) => {
    const response = await request.response();

    const responseHeaders = response.headers();
    let responseBody;
    if (request.redirectChain().length === 0) {
      // body can only be access for non-redirect responses
      responseBody = await response.buffer();
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
  });
  page.on("requestfailed", (request) => {
    // handle failed request
    nextRequest();
  });

  await page.goto(URL, { waitUntil: "networkidle0" });
  return results;
};

const performanceEntries = async (page) => {
  await page.goto(URL);

  return JSON.parse(
    await page.evaluate(() => JSON.stringify(performance.getEntries()))
  );
};

const byteSize = (str) => new Blob([str]).size;

const getCodeCoverage = async (page) => {
  // Enable both JavaScript and CSS coverage
  await Promise.all([
    page.coverage.startJSCoverage(),
    page.coverage.startCSSCoverage(),
  ]);

  await page.goto(URL);

  // Disable both JavaScript and CSS coverage
  const [jsCoverage, cssCoverage] = await Promise.all([
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
    for (const range of entry.ranges) usedBytes += range.end - range.start - 1;
  }
  return {
    text: `Bytes used: ${(usedBytes / totalBytes) * 100}%`,
    usedBytesKb: usedBytes / 1000,
    totalBytesKb: totalBytes / 1000,
    unusedBytesKb: (totalBytes - usedBytes) / 1000,
  };
};

const getCodeCoverage2 = async (page) => {
  // Gather coverage for JS and CSS files
  await Promise.all([
    page.coverage.startJSCoverage(),
    page.coverage.startCSSCoverage(),
  ]);

  // Stops the coverage gathering
  const [jsCoverage, cssCoverage] = await Promise.all([
    page.coverage.stopJSCoverage(),
    page.coverage.stopCSSCoverage(),
  ]);

  // Calculates # bytes being used based on the coverage
  const calculateUsedBytes = (type, coverage) =>
    coverage.map(({ url, ranges, text }) => {
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
};

const hasHubspotTracking = (scripts: scriptsInterface[]): boolean => {
  const id = "hs-script-loader";
  const src = "js.hs-scripts.com";
  return scripts.some(
    (script) => script.id.includes(id) && script.src.includes(src)
  );
};

const hasGoogleAnalyticsTracking = (scripts: scriptsInterface[]): boolean => {
  const regex = /gtag\(.*\)/;
  const src = "https://www.googletagmanager.com/gtag/js";
  return scripts.some((script, i) => {
    if (scripts[i + 1]) {
      return script.src.includes(src) && regex.test(scripts[i + 1].content);
    }
  });
};

const hasGoogleTagManagerTracking = (scripts: scriptsInterface[]): boolean => {
  const content = "https://www.googletagmanager.com/gtm.js";
  return scripts.some((script) => script.content.includes(content));
};

const hasOneH1 = (page: puppeteer.Page): Promise<boolean> => {
  return page.evaluate((): boolean => {
    const h1s = document.querySelectorAll("h1");
    return h1s.length === 1;
  });
};

const hasAltAttributes = (page: puppeteer.Page): Promise<boolean> => {
  return page.evaluate((): boolean => {
    const images = document.querySelectorAll("image");
    const areas = document.querySelectorAll("area");
    const inputs = document.querySelectorAll("input[type=image]");

    return [...images, ...areas, ...inputs].every((tag) =>
      tag.hasAttribute("alt")
    );
  });
};

const hasTitle = (page: puppeteer.Page): Promise<boolean> => {
  return page.evaluate((): boolean => document.querySelector("title") !== null);
};

const hasMetaDescription = (page: puppeteer.Page): Promise<boolean> => {
  return page.evaluate(
    (): boolean => document.querySelector("meta[name=description]") !== null
  );
};

const hasMetaViewport = (page: puppeteer.Page): Promise<boolean> => {
  return page.evaluate(
    (): boolean => document.querySelector("meta[name=viewport]") !== null
  );
};

const getScripts = (page: puppeteer.Page): Promise<scriptsInterface[]> => {
  return page.evaluate((): scriptsInterface[] => {
    const scripts = [...document.querySelectorAll("script")];
    return scripts.map(
      (x): scriptsInterface => ({
        id: x.getAttribute("id") || "",
        src: x.getAttribute("src") || "",
        content: x.innerHTML || "",
      })
    );
  });
};

init("https://ngine.webflow.io/");
// init("https://fontawesome.com/");
// init("https://emote-racer.herokuapp.com/");
