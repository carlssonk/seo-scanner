import puppeteer from "puppeteer";

interface Entry {
  approved: boolean;
  elementContent: string;
  tagStart: string;
  tagEnd: string;
  text: string;
  error: string | object;
}

export const seo = async (page) => {
  // Scan for HTML TAGS

  // const funcs = [await hasOneH1(page),]

  const pipe = async (funcs) => {
    let data = [];

    for (let i = 0; i < funcs.length; i++) {
      const { approved, elementContent, tagStart, tagEnd, text, error } = await funcs[i];
      data.push({ approved, elementContent, tagStart, tagEnd, text, error });
    }

    return data;
  };

  const data = await pipe([
    await hasTitle(page),
    await hasOneH1(page),
    await hasMetaDescription(page),
    await hasMetaViewport(page),
    await hasAltAttributes(page),
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
    elementContent: h1s[0],
    tagStart: "<h1>",
    tagEnd: "</h1>",
    text: "Sidan innehåller 1 $",
    error: !approved ? `Vi hitta ${h1s.length} h1 rubriker på sidan.` : "",
  };
  return object;
};

const hasAltAttributes = async (page: puppeteer.Page): Promise<Entry> => {
  const altTags = JSON.parse(
    await page.evaluate((): string => {
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

      function getSelector(elm) {
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
    })
  );

  const createError = async (text) => {
    let error = { text, elements: [] };

    for (let i = 0; i < altTags.length; i++) {
      if (altTags[i].approved) continue;
      const elementHandler = await page.$(altTags[i].selector);
      let screenshot: string | Buffer;
      try {
        screenshot = await elementHandler.screenshot({ encoding: "base64" });
      } catch {
        error.elements.push({
          element: altTags[i].outerHTML,
          screenshot: null,
        });
        continue;
      }

      error.elements.push({ element: altTags[i].outerHTML, screenshot });
    }

    return error;
  };

  const approved = altTags.every((tag) => tag.approved);
  const object: Entry = {
    approved,
    elementContent: "",
    tagStart: '[alt="..."]',
    tagEnd: "",
    text: "Det saknas inte $ attribut",
    error: !approved ? await createError("Det saknas $ attribut på följande element") : "",
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
    elementContent: title,
    tagStart: "<title>",
    tagEnd: "</title>",
    text: "Sidan innehåller en $",
    error: !approved ? "Sidan saknar en titel." : "",
  };
  return object;
};

const hasMetaDescription = async (page: puppeteer.Page): Promise<Entry> => {
  const description = await page.evaluate((): string => {
    const description: HTMLMetaElement = document.querySelector("meta[name=description]");
    return description ? description.content : "";
  });
  const approved = !!description;
  const object: Entry = {
    approved,
    elementContent: description,
    tagStart: '<meta name="$description$" content="',
    tagEnd: '">',
    text: "Sidan innehåller en $",
    error: !approved ? "Sidan saknar en beskrivning." : "",
  };
  return object;
};

const hasMetaViewport = async (page: puppeteer.Page): Promise<Entry> => {
  const viewport = await page.evaluate((): string => {
    const viewport: HTMLMetaElement = document.querySelector("meta[name=viewport]");
    return viewport ? viewport.content : "";
  });

  const approved = !!viewport;
  const object: Entry = {
    approved,
    elementContent: viewport,
    tagStart: '<meta name="$viewport$" content="',
    tagEnd: '">',
    text: "Sidan innehåller en $",
    error: !approved ? "Sidan saknar en viewport." : "",
  };
  return object;
};
