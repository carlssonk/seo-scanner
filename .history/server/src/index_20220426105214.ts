import { requestHandler } from "./requests.js";
import { seo } from "./html-crawlers/seo.js";
import { scripts } from "./html-crawlers/scripts.js";
import chromium from "chrome-aws-lambda";

const httpHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET",
};

export const handler = async (event) => {
  // const { url } = req.query;

  // console.log(data);
  // res.json({ data });

  let url = "";
  let responseCode = 200;
  // console.log("request: " + JSON.stringify(event));

  if (event.queryStringParameters && event.queryStringParameters.url) {
    url = event.queryStringParameters.url;
  }

  let data: any;
  try {
    data = await init(url);
  } catch (error) {
    return {
      statusCode: 500,
      headers: httpHeaders,
      body: JSON.stringify({ error: "ERROR" }),
    };
  }

  // The output from a Lambda proxy integration must be
  // in the following JSON object. The 'headers' property
  // is for custom response headers in addition to standard
  // ones. The 'body' property  must be a JSON string. For
  // base64-encoded payload, you must also set the 'isBase64Encoded'
  // property to 'true'.
  let response = {
    statusCode: responseCode,
    headers: httpHeaders,
    body: JSON.stringify({ data }),
  };
  console.log("response: " + JSON.stringify(response));
  return response;
};

const init = async (url: string): Promise<any> => {
  let URL = url;
  let browser = null;
  // Create browser, open page and go to url

  browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
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
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 0 });
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

// app.listen(PORT, () => console.log(`${PORT} LISTENING...`));
