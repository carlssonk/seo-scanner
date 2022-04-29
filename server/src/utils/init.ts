import { createBrowser } from "./utils.js";
import { requestHandler } from "../requests.js";
import { seo } from "../html-crawlers/seo.js";
import { scripts } from "../html-crawlers/scripts.js";

export const init = async (url: string): Promise<any> => {
  const browser = await createBrowser();

  // Create browser, open page and go to url
  const page = await browser.newPage();

  // So we can use page.on("request")
  await page.setRequestInterception(true);
  const requestAccumilator = requestHandler();

  // Add listener
  page.on("request", (request: any) => requestAccumilator.onRequest(request));

  const tic = Date.now();
  await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });
  const pageFullyLoaded = Date.now() - tic;

  // Get data from accumilator
  const requestDetails = requestAccumilator.details();

  // Format requestDetails
  const requestDetailsArray = Object.values(requestDetails).flat();
  const totalPageSize = requestDetailsArray.reduce((acc, cur) => {
    return acc + cur.transferSize;
  }, 0);

  // SCRIPTS & SEO
  const seoDetails = await seo(page, requestDetails);
  const scriptDetails = await scripts(page);

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
