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
        // elementContent: "",
        // tagStart: "",
        // tagEnd: "",
        text: "Sidan undviker stora nätverksnyttolaster",
        error: !approved ? error : "",
    };
    return object;
};
const hasOneH1 = async (page) => {
    const h1s = JSON.parse(await page.evaluate(() => {
        const h1s = [...document.querySelectorAll("h1")];
        return JSON.stringify(h1s.map((x) => {
            return x.innerHTML;
        }));
    }));
    const approved = h1s.length === 1;
    const object = {
        approved,
        outerHTML: `<h1>${h1s[0]}</h1>`,
        fallbackHTML: "",
        uid: nanoid(),
        // elementContent: h1s[0],
        // tagStart: "<h1>",
        // tagEnd: "</h1>",
        text: "Sidan innehåller 1 H1",
        error: !approved ? `Vi hitta ${h1s.length} h1 rubriker på sidan.` : "",
    };
    return object;
};
const skippedHeadingLevel = async (page) => {
    // "Import" getSelector function
    await page.addScriptTag({ path: "dist/utils/getSelector.js" });
    const headings = JSON.parse(await page.evaluate(async () => {
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
        // elementContent: "",
        // tagStart: "",
        // tagEnd: "",
        text: "Sidan använder rätt rubrikstruktur",
        error: !approved ? createError : "",
    };
    return object;
};
const hasAltAttributes = async (page) => {
    // "Import" getSelector function
    await page.addScriptTag({ path: "dist/utils/getSelector.js" });
    const altTags = JSON.parse(await page.evaluate(() => {
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
        error.text = `Sidan saknar alt attribut på ${error.elements.length} element`;
        return error;
    };
    // || '<meta name="viewport">'
    const approved = altTags.every((tag) => tag.approved);
    const object = {
        approved,
        outerHTML: '<img alt="...">',
        fallbackHTML: '[alt=""]',
        uid: nanoid(),
        // elementContent: "",
        // tagStart: '[alt="..."]',
        // tagEnd: "",
        text: "Sidan saknar inga alt attribut",
        error: !approved ? await createError() : "",
    };
    return object;
};
const hasTitle = async (page) => {
    const title = await page.evaluate(() => {
        const title = document.querySelector("title");
        return title ? title.innerHTML : "";
    });
    const approved = !!title;
    const object = {
        approved,
        outerHTML: `<title>${title}</title>`,
        fallbackHTML: "",
        uid: nanoid(),
        // elementContent: title,
        // tagStart: "<title>",
        // tagEnd: "</title>",
        text: "Sidan innehåller en titel",
        error: !approved ? "Sidan saknar en titel." : "",
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
        // elementContent: description,
        // tagStart: '<meta name="$description$" content="',
        // tagEnd: '">',
        text: "Sidan innehåller en beskrivning",
        error: !approved ? "Sidan saknar en beskrivning." : "",
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
        // elementContent: viewport,
        // tagStart: '<meta name="$viewport$" content="',
        // tagEnd: '">',
        text: "Sidan innehåller en viewport",
        error: !approved ? "Sidan saknar en viewport." : "",
    };
    return object;
};
