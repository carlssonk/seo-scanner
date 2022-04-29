import { pipeEntries } from "../utils/utils.js";
import { nanoid } from "nanoid";
export const seo = async (page, requestDetails) => {
    // Scan for HTML TAGS
    // const funcs = [await hasOneH1(page),]
    const data = await pipeEntries([
        hasTitle(page),
        hasOneH1(page),
        hasMetaDescription(page),
        hasMetaViewport(page),
        hasAltAttributes(page),
        skippedHeadingLevel(page),
        avoidLargeFileSize(page, requestDetails),
    ]);
    return data;
};
const avoidLargeFileSize = async (page, requestDetails) => {
    const MAX_FILE_SIZE = 300 * 1000;
    const error = {
        auditType: "SIZE",
        text: "",
        helpText: "Stora nätverksnyttolaster kostar användarna riktiga pengar och är starkt korrelerade med långa laddningstider.",
        elements: [],
    };
    const requests = Object.entries(requestDetails);
    const formatRequests = requests.flatMap(([type, array]) => {
        return [...array.map((x) => (Object.assign(Object.assign({}, x), { type })))];
    });
    for (let i = 0; i < formatRequests.length; i++) {
        if (formatRequests[i].transferSize > MAX_FILE_SIZE) {
            error.elements.push(formatRequests[i]);
        }
    }
    error.text = `Sidan har ${error.elements.length} filer som borde reduceras i storlek`;
    const approved = error.elements.length === 0;
    const object = {
        approved,
        outerHTML: "",
        fallbackHTML: "",
        uid: nanoid(),
        text: approved ? "Sidan undviker stora nätverksnyttolaster" : "Sidan har stora nätverksnyttolaster",
        error: !approved ? error : "",
    };
    return object;
};
const hasOneH1 = async (page) => {
    var _a;
    const h1s = JSON.parse(await page.evaluate(() => {
        const h1s = [...document.querySelectorAll("h1")];
        return JSON.stringify(h1s.map((x) => {
            return x.innerText;
        }));
    }));
    const approved = h1s.length === 1;
    const object = {
        approved,
        outerHTML: `<h1>${(_a = h1s[0]) !== null && _a !== void 0 ? _a : ""}</h1>`,
        fallbackHTML: "",
        uid: nanoid(),
        text: approved
            ? "Sidan innehåller 1 H1-element"
            : `Sidan innehåller ${h1s.length > 1 ? "fler än 1" : "inget"} H1-element`,
        error: !approved
            ? `H1-taggen är viktig för SEO, tillgänglighet och användbarhet, så helst bör du ha en på varje sida på din webbplats. En H1-tagg ska beskriva vad innehållet på den givna sidan handlar om.\n Vi hitta ${h1s.length} h1 rubriker på sidan.`
            : "",
    };
    return object;
};
const skippedHeadingLevel = async (page) => {
    // "Import" getSelector function
    // await page.addScriptTag({ path: "dist/utils/getSelector.js" });
    const headings = JSON.parse(await page.evaluate(async () => {
        function getSelector(elm) {
            if (elm.tagName === "BODY")
                return "BODY";
            const names = [];
            while (elm.parentElement && elm.tagName !== "BODY") {
                if (elm.id) {
                    names.unshift("#" + elm.getAttribute("id")); // getAttribute, because `elm.id` could also return a child element with name "id"
                    break; // Because ID should be unique, no more is needed. Remove the break, if you always want a full path.
                }
                else {
                    let c = 1, e = elm;
                    for (; e.previousElementSibling; e = e.previousElementSibling, c++)
                        ;
                    names.unshift(elm.tagName + ":nth-child(" + c + ")");
                }
                elm = elm.parentElement;
            }
            return names.join(">");
        }
        const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")];
        const promises = headings.map(async (heading) => {
            return {
                tagName: heading.tagName,
                level: parseInt(heading.tagName.slice(1)),
                selector: getSelector(heading),
                outerHTML: heading.outerHTML,
            };
        });
        const res = await Promise.all(promises);
        return JSON.stringify(res);
    }));
    const createError = {
        auditType: "HEADING",
        text: "",
        helpText: "Ordnade rubriker hjälper besökare att förstå sidstrukturen och förbättra sidnavigeringen",
        elements: [],
    };
    for (let i = 1; i < headings.length; i++) {
        if (headings[i].level > headings[i - 1].level + 1) {
            const elementHandler = await page.$(headings[i].selector);
            let screenshot = "";
            try {
                screenshot = await elementHandler.screenshot({ encoding: "base64" });
            }
            catch (_a) { }
            createError.elements.push({
                previous: headings[i - 1].tagName,
                current: headings[i].tagName,
                expected: `H${headings[i - 1].level + 1}`,
                outerHTML: headings[i].outerHTML,
                screenshot,
            });
        }
    }
    const errLength = createError.elements.length;
    createError.text = `Hoppade över rubriknivå på ${errLength} ställen`;
    const approved = errLength === 0;
    const object = {
        approved,
        outerHTML: "",
        fallbackHTML: "",
        uid: nanoid(),
        text: approved ? "Sidan använder rätt rubrikstruktur" : "Sidan har hoppat över rubriknivå",
        error: !approved ? createError : "",
    };
    return object;
};
const hasAltAttributes = async (page) => {
    // "Import" getSelector function
    // await page.addScriptTag({ path: "dist/utils/getSelector.js" });
    const altTags = JSON.parse(await page.evaluate(() => {
        function getSelector(elm) {
            if (elm.tagName === "BODY")
                return "BODY";
            const names = [];
            while (elm.parentElement && elm.tagName !== "BODY") {
                if (elm.id) {
                    names.unshift("#" + elm.getAttribute("id")); // getAttribute, because `elm.id` could also return a child element with name "id"
                    break; // Because ID should be unique, no more is needed. Remove the break, if you always want a full path.
                }
                else {
                    let c = 1, e = elm;
                    for (; e.previousElementSibling; e = e.previousElementSibling, c++)
                        ;
                    names.unshift(elm.tagName + ":nth-child(" + c + ")");
                }
                elm = elm.parentElement;
            }
            return names.join(">");
        }
        const images = document.querySelectorAll("img");
        const areas = document.querySelectorAll("area");
        const inputs = document.querySelectorAll("input[type=image]");
        return JSON.stringify([...images, ...areas, ...inputs].map((tag) => {
            return {
                selector: getSelector(tag),
                outerHTML: tag.outerHTML,
                approved: tag.hasAttribute("alt"),
            };
        }));
    }));
    const createError = async () => {
        let error = { auditType: "ALT", text: "", helpText: "", elements: [] };
        for (let i = 0; i < altTags.length; i++) {
            if (altTags[i].approved)
                continue;
            const elementHandler = await page.$(altTags[i].selector);
            let screenshot = "";
            try {
                screenshot = await elementHandler.screenshot({ encoding: "base64" });
            }
            catch (_a) { }
            error.elements.push({ outerHTML: altTags[i].outerHTML, screenshot });
        }
        error.text = `Alt-taggar ger sammanhang till vad en bild visar, information sökmotorsökrobotar och tillåter dem att indexera en bild korrekt.\n Sidan saknar alt attribut på ${error.elements.length} element`;
        return error;
    };
    const approved = altTags.every((tag) => tag.approved);
    const object = {
        approved,
        outerHTML: '<img alt="...">',
        fallbackHTML: '[alt=""]',
        uid: nanoid(),
        text: approved ? "Sidan saknar inga alt attribut" : "Sidan saknar alt attribut",
        error: !approved ? await createError() : "",
    };
    return object;
};
const hasTitle = async (page) => {
    const title = await page.evaluate(() => {
        const title = document.querySelector("title");
        return title ? title.innerText : "";
    });
    const approved = !!title;
    const object = {
        approved,
        outerHTML: `<title>${title}</title>`,
        fallbackHTML: "",
        uid: nanoid(),
        text: approved ? "Sidan innehåller en titel" : "Sidan saknar en titel",
        error: !approved
            ? "Titeltaggar är viktiga för SEO eftersom de ger användarna och sökmotorerna sammanhang på respektive sida. De är en av de viktigaste SEO-strategierna på sidan som hjälper till att ge sökmotorer en uppfattning om vad varje sida handlar om."
            : "",
    };
    return object;
};
const hasMetaDescription = async (page) => {
    const description = await page.evaluate(() => {
        const description = document.querySelector("meta[name=description]");
        return description ? description.outerHTML : "";
    });
    const approved = !!description;
    const object = {
        approved,
        outerHTML: description || '<meta name="description">',
        fallbackHTML: "",
        uid: nanoid(),
        text: approved ? "Sidan innehåller en beskrivning" : "Sidan saknar en beskrivning",
        error: !approved
            ? "Description-metataggen är en viktig del av din SEO-strategi eftersom det är en av de första sakerna som sökarna ser när de möter en av dina sidor"
            : "",
    };
    return object;
};
const hasMetaViewport = async (page) => {
    const viewport = await page.evaluate(() => {
        const viewport = document.querySelector("meta[name=viewport]");
        return viewport ? viewport.outerHTML : "";
    });
    const approved = !!viewport;
    const object = {
        approved,
        outerHTML: '<meta name="viewport">',
        fallbackHTML: "",
        uid: nanoid(),
        text: approved ? "Sidan innehåller en viewport" : "Sidan saknar en viewport",
        error: !approved
            ? "Viewport-metataggen låter dig konfigurera hur en sida ska skalas och visas på vilken enhet som helst. Viewport-metataggen har inget direkt med rankningar att göra utan har mycket att göra med användarupplevelsen."
            : "",
    };
    return object;
};
