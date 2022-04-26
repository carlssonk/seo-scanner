import puppeteer from "puppeteer";
import { requestHandler } from "./requests.js";
import express, { Request, Response } from "express";
import { seo } from "./html-crawlers/seo.js";
import { scripts } from "./html-crawlers/scripts.js";
// import { getSelector } from "./utils/utils.js";
const app = express();
const PORT = 8080;

// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

interface Query {
  url: string;
}

app.get("/api/audit", async (req: Request<{}, {}, {}, Query>, res: Response) => {
  const { url } = req.query;

  let data: any;
  try {
    data = await init(url);
  } catch (error) {
    return res.json({ data: { error: "ERROR" } });
  }

  console.log(data);
  res.json({ data });
});

interface browserInterface {
  [x: string]: any;
}

// type scriptsInterface = scriptObjectInterface[];

let URL: string = "";

let browser: browserInterface = null;

const init = async (url: string): Promise<any> => {
  URL = url;
  // Create browser, open page and go to url
  browser = await puppeteer.launch();
  const page = await browser.newPage();
  // await page.goto(URL);
  let result = [];

  // So we can use page.on("request")
  await page.setRequestInterception(true);
  // So we can use function inside page.evaluate
  // var functionToInject = function () {
  //   return window.navigator.appName;
  // };
  // await page.exposeFunction("getSelector", getSelector);
  // await page.addScriptTag({ path: "src/utils/getSelector.ts" });
  // await page.addScriptTag({ path: "dist/utils/getSelector.js" });

  const requestAccumilator = requestHandler();

  // Add listener
  page.on("request", (request: any) => requestAccumilator.onRequest(request));
  // Go to page
  // const start = clock(0);
  const tic = Date.now();
  let number = 0;
  // const interval = setInterval(() => number++, 100);
  await page.goto(URL, { waitUntil: "networkidle2" });
  const pageFullyLoaded = Date.now() - tic;
  // clearInterval(interval);
  // console.log(number);
  console.log("Seconds elapsed: " + pageFullyLoaded / 1000);
  // const metrics = await page.evaluate(() => JSON.stringify(window.performance));
  // const gitMetrics = await page.metrics();

  // const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

  // Get data from accumilator
  const requestDetails = requestAccumilator.details();

  const requestDetailsArray = Object.values(requestDetails).flat();
  const totalPageSize = requestDetailsArray.reduce((acc, cur) => {
    return acc + cur.transferSize;
  }, 0);

  // console.log(`Total Page Download Size - ${totalPageSize / 1000000}MB`);
  // console.log(`Total Page Requests - ${requestDetailsArray.length}`);

  // const javascriptSize = requestDetails["javascript"].reduce((acc, cur) => {
  //   return acc + cur.transferSize;
  // }, 0);
  // console.log(javascriptSize / 1000000);
  // console.log(requestDetails["javascript"].length);

  // console.log(requestDetails);

  // console.log(requestDetails.length);
  // console.log(result.length);
  // console.log(totalSize);
  // console.log("KB: ", totalSize / 1000);
  // console.log("MB: ", totalSize / 1000000);

  // text: 'Bytes used: 4.5413221197348985%'
  // usedBytesKb: 63.7
  // totalBytesKb: 1403.5
  // unusedBytesKb: 1339.8

  // SCRIPTS & SEO
  const seoDetails = await seo(page, requestDetails);
  const scriptDetails = await scripts(page);

  // console.log(seoDetails);
  // Close browser
  await browser.close();

  return {
    requestDetails,
    totalPageSize,
    totalPageRequests: requestAccumilator.totalRequests(),
    seoDetails,
    scriptDetails,
    pageFullyLoaded,
  };
};

// function clock(start: any) {
//   if (!start) return process.hrtime();
//   var end = process.hrtime(start);
//   return Math.round(end[0] * 1000 + end[1] / 1000000);
// }

app.listen(PORT, () => console.log(`${PORT} LISTENING...`));
