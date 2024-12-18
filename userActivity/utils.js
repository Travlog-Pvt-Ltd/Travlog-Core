export const cleanContentField = (obj) => {
    if (Array.isArray(obj)) {
        obj.forEach(cleanContentField);
    } else if (obj !== null && typeof obj === 'object') {
        if ('content' in obj && 'shortContent' in obj) {
            delete obj.content;
        }
        for (const key in obj) {
            cleanContentField(obj[key]);
        }
    }
};

export const transformAndCleanContentField = (obj) => {
    obj = JSON.parse(JSON.stringify(obj));
    cleanContentField(obj);
    return obj;
};
