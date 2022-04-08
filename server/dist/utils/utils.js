export const pipeEntries = async (funcs) => {
    let data = [];
    for (let i = 0; i < funcs.length; i++) {
        const { approved, elementContent, tagStart, tagEnd, text, error } = await funcs[i];
        data.push({ approved, elementContent, tagStart, tagEnd, text, error });
    }
    return data;
};
