import puppeteer from "puppeteer-core";
import { Entry, Error } from "../interfaces.js";
import { pipeEntries } from "../utils/utils.js";

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

const avoidLargeFileSize = async (page: puppeteer.Page, requestDetails: any[]): Promise<Entry> => {
  const MAX_FILE_SIZE = 300 * 1000;

  const error: Error = {
    auditType: "SIZE",
    text: "",
    helpText:
      "Stora nätverksnyttolaster kostar användarna riktiga pengar och är starkt korrelerade med långa laddningstider.",
    elements: [],
  };

  const requests = Object.entries(requestDetails);
  const formatRequests = requests.flatMap(([type, array]) => {
    return [...array.map((x) => ({ ...x, type }))];
  });

  for (let i = 0; i < formatRequests.length; i++) {
    if (formatRequests[i].transferSize > MAX_FILE_SIZE) {
      error.elements.push(formatRequests[i]);
    }
  }

  error.text = `Sidan har ${error.elements.length} filer som borde reduceras i storlek`;
  const approved = error.elements.length === 0;
  const object: Entry = {
    approved,
    outerHTML: "",
    fallbackHTML: "",
    // elementContent: "",
    // tagStart: "",
    // tagEnd: "",
    text: "Sidan undviker stora nätverksnyttolaster",
    error: !approved ? error : "",
  };
  return object;
};

const hasOneH1 = async (page: puppeteer.Page): Promise<Entry> => {
  const h1s = JSON.parse(
    await page.evaluate((): string => {
      const h1s = [...document.querySelectorAll("h1")];

      return JSON.stringify(
        h1s.map((x) => {
          return x.innerText;
        })
      );
    })
  );

  const approved = h1s.length === 1;
  const object: Entry = {
    approved,
    outerHTML: `<h1>${h1s[0] ?? ""}</h1>`,
    fallbackHTML: "",
    // elementContent: h1s[0],
    // tagStart: "<h1>",
    // tagEnd: "</h1>",
    text: "Sidan innehåller 1 H1",
    error: !approved ? `Vi hitta ${h1s.length} h1 rubriker på sidan.` : "",
  };
  return object;
};

const skippedHeadingLevel = async (page: puppeteer.Page): Promise<Entry> => {
  // "Import" getSelector function
  // await page.addScriptTag({ path: "dist/utils/getSelector.js" });

  const headings = JSON.parse(
    await page.evaluate(async (): Promise<string> => {
      function getSelector(elm: any) {
        if (elm.tagName === "BODY") return "BODY";
        const names = [];
        while (elm.parentElement && elm.tagName !== "BODY") {
          if (elm.id) {
            names.unshift("#" + elm.getAttribute("id")); // getAttribute, because `elm.id` could also return a child element with name "id"
            break; // Because ID should be unique, no more is needed. Remove the break, if you always want a full path.
          } else {
            let c = 1,
              e = elm;
            for (; e.previousElementSibling; e = e.previousElementSibling, c++);
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
    })
  );

  const createError: Error = {
    auditType: "HEADING",
    text: "",
    helpText: "Ordnade rubriker hjälper besökare att förstå sidstrukturen och förbättra sidnavigeringen",
    elements: [],
  };

  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level > headings[i - 1].level + 1) {
      const elementHandler = await page.$(headings[i].selector);
      let screenshot: string | void | Buffer = "";

      try {
        screenshot = await elementHandler.screenshot({ encoding: "base64" });
      } catch {}

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
  const object: Entry = {
    approved,
    outerHTML: "",
    fallbackHTML: "",
    // elementContent: "",
    // tagStart: "",
    // tagEnd: "",
    text: "Sidan använder rätt rubrikstruktur",
    error: !approved ? createError : "",
  };
  return object;
};

const hasAltAttributes = async (page: puppeteer.Page): Promise<Entry> => {
  // "Import" getSelector function
  // await page.addScriptTag({ path: "dist/utils/getSelector.js" });

  const altTags = JSON.parse(
    await page.evaluate((): string => {
      function getSelector(elm: any) {
        if (elm.tagName === "BODY") return "BODY";
        const names = [];
        while (elm.parentElement && elm.tagName !== "BODY") {
          if (elm.id) {
            names.unshift("#" + elm.getAttribute("id")); // getAttribute, because `elm.id` could also return a child element with name "id"
            break; // Because ID should be unique, no more is needed. Remove the break, if you always want a full path.
          } else {
            let c = 1,
              e = elm;
            for (; e.previousElementSibling; e = e.previousElementSibling, c++);
            names.unshift(elm.tagName + ":nth-child(" + c + ")");
          }
          elm = elm.parentElement;
        }

        return names.join(">");
      }
      const images = document.querySelectorAll("img");
      const areas = document.querySelectorAll("area");
      const inputs = document.querySelectorAll("input[type=image]");

      return JSON.stringify(
        [...images, ...areas, ...inputs].map((tag) => {
          return {
            selector: getSelector(tag),
            outerHTML: tag.outerHTML,
            approved: tag.hasAttribute("alt"),
          };
        })
      );
    })
  );

  const createError = async (): Promise<Error> => {
    let error = { auditType: "ALT", text: "", helpText: "", elements: [] };

    for (let i = 0; i < altTags.length; i++) {
      if (altTags[i].approved) continue;
      const elementHandler = await page.$(altTags[i].selector);
      let screenshot: string | void | Buffer = "";
      try {
        screenshot = await elementHandler.screenshot({ encoding: "base64" });
      } catch {}

      error.elements.push({ outerHTML: altTags[i].outerHTML, screenshot });
    }

    error.text = `Sidan saknar alt attribut på ${error.elements.length} element`;
    return error;
  };
  // || '<meta name="viewport">'
  const approved = altTags.every((tag) => tag.approved);
  const object: Entry = {
    approved,
    outerHTML: '<img alt="...">',
    fallbackHTML: '[alt=""]',
    // elementContent: "",
    // tagStart: '[alt="..."]',
    // tagEnd: "",
    text: "Sidan saknar inga alt attribut",
    error: !approved ? await createError() : "",
  };
  return object;
};

const hasTitle = async (page: puppeteer.Page): Promise<Entry> => {
  const title = await page.evaluate((): string => {
    const title = document.querySelector("title");

    return title ? title.innerText : "";
  });
  const approved = !!title;
  const object: Entry = {
    approved,
    outerHTML: `<title>${title}</title>`,
    fallbackHTML: "",
    // elementContent: title,
    // tagStart: "<title>",
    // tagEnd: "</title>",
    text: "Sidan innehåller en titel",
    error: !approved ? "Sidan saknar en titel." : "",
  };
  return object;
};

const hasMetaDescription = async (page: puppeteer.Page): Promise<Entry> => {
  const description = await page.evaluate((): string => {
    const description: HTMLMetaElement = document.querySelector("meta[name=description]");
    return description ? description.outerHTML : "";
  });
  const approved = !!description;
  const object: Entry = {
    approved,
    outerHTML: description || '<meta name="description">',
    fallbackHTML: "",
    // elementContent: description,
    // tagStart: '<meta name="$description$" content="',
    // tagEnd: '">',
    text: "Sidan innehåller en beskrivning",
    error: !approved ? "Sidan saknar en beskrivning." : "",
  };
  return object;
};

const hasMetaViewport = async (page: puppeteer.Page): Promise<Entry> => {
  const viewport = await page.evaluate((): string => {
    const viewport: HTMLMetaElement = document.querySelector("meta[name=viewport]");
    return viewport ? viewport.outerHTML : "";
  });

  const approved = !!viewport;
  const object: Entry = {
    approved,
    outerHTML: '<meta name="viewport">',
    fallbackHTML: "",
    // elementContent: viewport,
    // tagStart: '<meta name="$viewport$" content="',
    // tagEnd: '">',
    text: "Sidan innehåller en viewport",
    error: !approved ? "Sidan saknar en viewport." : "",
  };
  return object;
};
