import { nanoid } from "nanoid";

export const ERROR_COLOR = "rgb(255, 100, 100)";
export const SUCCESS_COLOR = "#6ce88f";
export const WARNING_COLOR = "orange";

export const formatTotalSize = (number: number) => {
  const kb = number / 1000;
  const mb = kb / 1000;

  return kb < 1000 ? `${Math.round(kb)}KB` : `${mb.toFixed(2)}MB`;
};

export const ENDPOINT_URL = () => {
  return window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === ""
    ? "/api/audit"
    : "https://c8osaob8p9.execute-api.eu-north-1.amazonaws.com/default/webScanner";
};

export const modalTextSEO =
  "Sökmotoroptimering är processen att påverka synligheten för en webbplats på sökmotorernas resultatsidor. Målet med SEO är att öka antalet besökare på en sajt genom att få högre placeringar i de organiska (dvs obetalda) sökresultaten på olika sökmotorer, som Google, Bing eller Yahoo. Det finns både interna och externa faktorer som påverkar en webbsidas placering på sökresultatsidan. Nedan finns några av de viktigaste interna faktorerna som sökmotorer använder för att påverka rankningen av en webbsida.";
export const modalTextSCRIPT =
  "Ett script är en bit kod som kan bäddas in i html på en webbplats. Den används för att samla in data om webbplatsens trafik. Skriptet kan användas för att generera rapporter om webbplatstrafik, sidvisningar och besökarnas beteende. Det hjälper också till att identifiera vilka sökord som leder trafik till en webbplats.";

export const separateElement = (string: string) => {
  const splitTagFromContent = string.split(/(<[^]+?>)/g);
  splitTagFromContent.pop(), splitTagFromContent.shift(); // remove start and end bcus they are empty

  const tagStart = splitTagFromContent[0];
  const tagContent = splitTagFromContent[1];
  const tagEnd = splitTagFromContent[2];

  let formatStartTagArray = [{ html: tagStart, type: "tag", uid: nanoid() }];
  try {
    let placesToInsertSpace: any[] = [];
    const REG = new RegExp(`(?<= )([^ ]*)(?==")|(?<==")(.*?)(?=")|(=?")`, "g");
    const startTagArray = tagStart.split(REG).filter((x) => x);
    formatStartTagArray = startTagArray.map((str, idx, self) => {
      if (idx === 0) return { html: str, type: "tag", uid: nanoid() };
      if (str === '"' || str === '="' || str === ">") return { html: str, type: "extra", uid: nanoid() };
      if (str === " ") return { html: str, type: "space", uid: nanoid() };
      if (self[idx - 1] === " ") return { html: str, type: "attribute", uid: nanoid() };
      if (idx === 1 && self[idx - 1].includes(" ")) {
        placesToInsertSpace.push(idx);
        return { html: str, type: "attribute", uid: nanoid() };
      }
      if (self[idx - 1] === '="') return { html: str, type: "value", uid: nanoid() };

      return { html: str, type: "", uid: nanoid() };
    });

    placesToInsertSpace.forEach((idx) =>
      (formatStartTagArray as any).splice(idx, 0, { html: " ", type: "space", uid: nanoid() })
    );
  } catch {
    const splitStartTag = tagStart.split(/(\s+)/g);
    formatStartTagArray = splitStartTag.map((item) => {
      return { html: item, type: item === " " ? "space" : "tag", uid: nanoid() };
    });
  }

  return [
    ...formatStartTagArray,
    { html: tagContent, type: "content", uid: nanoid() },
    { html: tagEnd, type: "tag", uid: nanoid() },
  ];
};
