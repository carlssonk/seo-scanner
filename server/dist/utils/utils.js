import chromium from "chrome-aws-lambda";
export const isDevelopment = process.env.NODE_ENV && process.env.NODE_ENV.trim() === "development";
export const pipeEntries = async (funcs) => {
    let data = [];
    for (let i = 0; i < funcs.length; i++) {
        const { approved, outerHTML, text, error, fallbackHTML, uid } = await funcs[i];
        const entry = {
            approved,
            outerHTML,
            fallbackHTML,
            text,
            error,
            uid,
        };
        data.push(entry);
    }
    return data;
};
export const createBrowser = async () => {
    const prodBrowser = async () => await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });
    const devBrowser = async () => {
        // Import puppeteer
        const { default: puppeteer } = await import("puppeteer");
        // Launch puppeteer
        return puppeteer.launch();
    };
    return isDevelopment ? devBrowser() : prodBrowser();
};
