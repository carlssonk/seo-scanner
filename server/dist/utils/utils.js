export const pipeEntries = async (funcs) => {
    let data = [];
    for (let i = 0; i < funcs.length; i++) {
        const { approved, outerHTML, text, error, fallbackHTML } = await funcs[i];
        const entry = {
            approved,
            outerHTML,
            fallbackHTML,
            text,
            error,
        };
        data.push(entry);
    }
    return data;
};
