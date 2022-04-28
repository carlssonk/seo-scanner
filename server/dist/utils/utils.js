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
