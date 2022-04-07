import puppeteer from "puppeteer";

interface scriptsInterface {
  id: string;
  src: string;
  content: string;
}

export const scripts = async (page) => {
  // Get all scripts
  const scripts: scriptsInterface[] = await getScripts(page);

  // Scan for HTML SCRIPTS
  return [
    {
      approved: hasHubspotTracking(scripts),
      tag: "<script>",
      text: "Sidan innehåller HubSpot Tracking",
      error: "",
    },
    {
      approved: hasGoogleAnalyticsTracking(scripts),
      tag: "<script>",
      text: "Sidan innehåller Google Analytics Tracking",
      error: "",
    },
    {
      approved: hasGoogleTagManagerTracking(scripts),
      tag: "<script>",
      text: "Sidan innehåller Google Tag Manager Tracking",
      error: "",
    },
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
