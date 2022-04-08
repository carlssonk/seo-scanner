import puppeteer from "puppeteer";
import { Entry, scriptsInterface } from "../interfaces.js";
import { pipeEntries } from "../utils/utils.js";

export const scripts = async (page) => {
  // Get all scripts
  const scripts: scriptsInterface[] = await getScripts(page);

  const data = await pipeEntries([
    hasHubspotTracking(scripts),
    hasGoogleAnalyticsTracking(scripts),
    hasGoogleTagManagerTracking(scripts),
  ]);

  return data;
  // Scan for HTML SCRIPTS
  // return [
  //   {
  //     approved: hasHubspotTracking(scripts),
  //     tag: "<script>",
  //     text: "Sidan innehåller HubSpot Tracking",
  //     error: "",
  //   },
  //   {
  //     approved: hasGoogleAnalyticsTracking(scripts),
  //     tag: "<script>",
  //     text: "Sidan innehåller Google Analytics Tracking",
  //     error: "",
  //   },
  //   {
  //     approved: hasGoogleTagManagerTracking(scripts),
  //     tag: "<script>",
  //     text: "Sidan innehåller Google Tag Manager Tracking",
  //     error: "",
  //   },
  // ];
};

const hasHubspotTracking = (scripts: scriptsInterface[]): Entry => {
  const id = "hs-script-loader";
  const src = "js.hs-scripts.com";
  const approved = scripts.some((script) => script.id.includes(id) && script.src.includes(src));
  const object: Entry = {
    approved,
    elementContent: "",
    tagStart: "<script>",
    tagEnd: "",
    text: "Sidan innehåller HubSpot Tracking",
    error: !approved ? "Vi hitta inget HubSpot Tracking script på sidan." : "",
  };
  return object;
};

const hasGoogleAnalyticsTracking = (scripts: scriptsInterface[]): Entry => {
  const regex = /gtag\(.*\)/;
  const src = "https://www.googletagmanager.com/gtag/js";
  const approved = scripts.some((script, i) => {
    if (scripts[i + 1]) {
      return script.src.includes(src) && regex.test(scripts[i + 1].content);
    }
  });
  const object: Entry = {
    approved,
    elementContent: "",
    tagStart: "<script>",
    tagEnd: "",
    text: "Sidan innehåller Google Analytics Tracking",
    error: !approved ? "Vi hitta inget Google Analytics Tracking script på sidan." : "",
  };
  return object;
};

const hasGoogleTagManagerTracking = (scripts: scriptsInterface[]): Entry => {
  const content = "https://www.googletagmanager.com/gtm.js";
  const approved = scripts.some((script) => script.content.includes(content));

  const object: Entry = {
    approved,
    elementContent: "",
    tagStart: "<script>",
    tagEnd: "",
    text: "Sidan innehåller Google Tag Manager",
    error: !approved ? "Vi hitta inget Google Tag Manager Tracking script på sidan." : "",
  };
  return object;
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
