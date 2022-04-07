var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const scripts = (page) => __awaiter(void 0, void 0, void 0, function* () {
    // Get all scripts
    const scripts = yield getScripts(page);
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
