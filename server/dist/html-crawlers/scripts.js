import { nanoid } from "nanoid";
import { pipeEntries } from "../utils/utils.js";
export const scripts = async (page) => {
    // Get all scripts
    const scripts = await getScripts(page);
    const data = await pipeEntries([
        hasHubspotTracking(scripts),
        hasGoogleAnalyticsTracking(scripts),
        hasGoogleTagManagerTracking(scripts),
    ]);
    return data;
};
const hasHubspotTracking = (scripts) => {
    const id = "hs-script-loader";
    const src = "js.hs-scripts.com";
    const approved = scripts.some((script) => script.id.includes(id) && script.src.includes(src));
    const object = {
        approved,
        outerHTML: "<script>",
        fallbackHTML: "",
        uid: nanoid(),
        text: approved ? "Sidan innehåller HubSpot Tracking" : "Sidan saknar HubSpot Tracking",
        error: !approved ? "Vi hitta inget HubSpot Tracking script på sidan." : "",
    };
    return object;
};
const hasGoogleAnalyticsTracking = (scripts) => {
    const regex = /gtag\(.*\)/;
    const src = "https://www.googletagmanager.com/gtag/js";
    const approved = scripts.some((script, i) => {
        if (scripts[i + 1]) {
            return script.src.includes(src) && regex.test(scripts[i + 1].content);
        }
    });
    const object = {
        approved,
        outerHTML: "<script>",
        fallbackHTML: "",
        uid: nanoid(),
        text: approved ? "Sidan innehåller Google Analytics Tracking" : "Sidan saknar Google Analytics Tracking",
        error: !approved ? "Vi hitta inget Google Analytics Tracking script på sidan." : "",
    };
    return object;
};
const hasGoogleTagManagerTracking = (scripts) => {
    const content = "https://www.googletagmanager.com/gtm.js";
    const approved = scripts.some((script) => script.content.includes(content));
    const object = {
        approved,
        outerHTML: "<script>",
        fallbackHTML: "",
        uid: nanoid(),
        text: approved ? "Sidan innehåller Google Tag Manager" : "Sidan saknar Google Tag Manager",
        error: !approved ? "Vi hitta inget Google Tag Manager Tracking script på sidan." : "",
    };
    return object;
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
