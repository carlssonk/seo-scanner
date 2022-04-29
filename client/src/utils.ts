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
