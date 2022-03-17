import puppeteer from "puppeteer";

const init = async (url) => {
  // Create browser, open page and go to url
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  // Get all scripts
  const scripts = await getScripts(page);

  console.log(hasHubspotTracking(scripts));
  console.log(hasGoogleAnalyticsTracking(scripts));
  console.log(hasGoogleTagManagerTracking(scripts));

  console.log(await hasOneH1(page));
  console.log(await hasAltAttributes(page));
  console.log(await hasTitle(page));
  console.log(await hasMetaDescription(page));
  console.log(await hasMetaViewport(page));

  // Close browser
  await browser.close();
};

const hasHubspotTracking = (scripts) => {
  const id = "hs-script-loader";
  const src = "js.hs-scripts.com";
  return scripts.some(
    (script) => script.id.includes(id) && script.src.includes(src)
  );
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

    return [...images, ...areas, ...inputs].every((tag) =>
      tag.hasAttribute("alt")
    );
  });
};

const hasTitle = (page) => {
  return page.evaluate(() => document.querySelector("title") !== null);
};

const hasMetaDescription = (page) => {
  return page.evaluate(
    () => document.querySelector("meta[name=description]") !== null
  );
};

const hasMetaViewport = (page) => {
  return page.evaluate(
    () => document.querySelector("meta[name=viewport]") !== null
  );
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
