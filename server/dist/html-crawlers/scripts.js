var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { pipeEntries } from "../utils.js";
export const scripts = (page) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all scripts
    const scripts = yield getScripts(page);
    const data = yield pipeEntries([
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
});
const hasHubspotTracking = (scripts) => {
    const id = "hs-script-loader";
    const src = "js.hs-scripts.com";
    const approved = scripts.some((script) => script.id.includes(id) && script.src.includes(src));
    const object = {
        approved,
        elementContent: "",
        tagStart: "<script>",
        tagEnd: "",
        text: "Sidan innehåller HubSpot Tracking",
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
        elementContent: "",
        tagStart: "<script>",
        tagEnd: "",
        text: "Sidan innehåller Google Analytics Tracking",
        error: !approved ? "Vi hitta inget Google Analytics Tracking script på sidan." : "",
    };
    return object;
};
const hasGoogleTagManagerTracking = (scripts) => {
    const content = "https://www.googletagmanager.com/gtm.js";
    const approved = scripts.some((script) => script.content.includes(content));
    const object = {
        approved,
        elementContent: "",
        tagStart: "<script>",
        tagEnd: "",
        text: "Sidan innehåller Google Tag Manager",
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
