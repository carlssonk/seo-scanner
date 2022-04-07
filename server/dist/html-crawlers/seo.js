var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const seo = (page) => __awaiter(void 0, void 0, void 0, function* () {
    // Scan for HTML TAGS
    // const funcs = [await hasOneH1(page),]
    const pipe = (funcs) => __awaiter(void 0, void 0, void 0, function* () {
        let data = [];
        for (let i = 0; i < funcs.length; i++) {
            const { approved, elementContent, tagStart, tagEnd, text, error } = yield funcs[i];
            data.push({ approved, elementContent, tagStart, tagEnd, text, error });
        }
        return data;
    });
    const data = yield pipe([
        yield hasTitle(page),
        yield hasOneH1(page),
        yield hasMetaDescription(page),
        yield hasMetaViewport(page),
        yield hasAltAttributes(page),
    ]);
    console.log(data);
    return data;
    // return [
    //   // {
    //   //   approved: await hasOneH1(page),
    //   //   tag: "<h1>",
    //   //   text: "Sidan innehåller 1",
    //   //   error: "",
    //   // },
    //   // {
    //   //   approved: await hasAltAttributes(page),
    //   //   tag: '<img alt="...">',
    //   //   text: "Sidan innehåller ",
    //   //   error: "",
    //   // },
    //   {
    //     approved: await hasTitle(page),
    //     tag: "<title>",
    //     text: "Sidan innehåller",
    //     error: "",
    //   },
    //   {
    //     approved: await hasMetaDescription(page),
    //     tag: '<meta name="description">',
    //     text: "Sidan innehåller",
    //     error: "",
    //   },
    //   {
    //     approved: await hasMetaViewport(page),
    //     tag: '<meta name="viewport">',
    //     text: "Sidan innehåller",
    //     error: "",
    //   },
    // ];
});
const hasOneH1 = (page) => __awaiter(void 0, void 0, void 0, function* () {
    const h1s = JSON.parse(yield page.evaluate(() => {
        const h1s = [...document.querySelectorAll("h1")];
        return JSON.stringify(h1s.map((x) => {
            return x.innerText;
        }));
    }));
    const approved = h1s.length === 1;
    const object = {
        approved,
        elementContent: h1s[0],
        tagStart: "<h1>",
        tagEnd: "</h1>",
        text: "Sidan innehåller 1 $",
        error: !approved ? `Vi hitta ${h1s.length} h1 rubriker på sidan.` : "",
    };
    return object;
});
const hasAltAttributes = (page) => __awaiter(void 0, void 0, void 0, function* () {
    const altTags = JSON.parse(yield page.evaluate(() => {
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
    }));
    const createError = (text) => __awaiter(void 0, void 0, void 0, function* () {
        let error = { text, elements: [] };
        for (let i = 0; i < altTags.length; i++) {
            if (altTags[i].approved)
                continue;
            const elementHandler = yield page.$(altTags[i].selector);
            let screenshot;
            try {
                screenshot = yield elementHandler.screenshot({ encoding: "base64" });
            }
            catch (_a) {
                error.elements.push({
                    element: altTags[i].outerHTML,
                    screenshot: null,
                });
                continue;
            }
            error.elements.push({ element: altTags[i].outerHTML, screenshot });
        }
        return error;
    });
    const approved = altTags.every((tag) => tag.approved);
    const object = {
        approved,
        elementContent: "",
        tagStart: '[alt="..."]',
        tagEnd: "",
        text: "Det saknas inte $ attribut",
        error: !approved
            ? yield createError("Det saknas $ attribut på följande element")
            : "",
    };
    return object;
});
const hasTitle = (page) => __awaiter(void 0, void 0, void 0, function* () {
    const title = yield page.evaluate(() => {
        const title = document.querySelector("title");
        return title ? title.innerText : "";
    });
    const approved = !!title;
    const object = {
        approved,
        elementContent: title,
        tagStart: "<title>",
        tagEnd: "</title>",
        text: "Sidan innehåller en $",
        error: !approved ? "Sidan saknar en titel." : "",
    };
    return object;
});
const hasMetaDescription = (page) => __awaiter(void 0, void 0, void 0, function* () {
    const description = yield page.evaluate(() => {
        const description = document.querySelector("meta[name=description]");
        return description ? description.content : "";
    });
    const approved = !!description;
    const object = {
        approved,
        elementContent: description,
        tagStart: '<meta name="$description$" content="',
        tagEnd: '">',
        text: "Sidan innehåller en $",
        error: !approved ? "Sidan saknar en beskrivning." : "",
    };
    return object;
});
const hasMetaViewport = (page) => __awaiter(void 0, void 0, void 0, function* () {
    const viewport = yield page.evaluate(() => {
        const viewport = document.querySelector("meta[name=viewport]");
        return viewport ? viewport.content : "";
    });
    const approved = !!viewport;
    const object = {
        approved,
        elementContent: viewport,
        tagStart: '<meta name="$viewport$" content="',
        tagEnd: '">',
        text: "Sidan innehåller en $",
        error: !approved ? "Sidan saknar en viewport." : "",
    };
    return object;
});
