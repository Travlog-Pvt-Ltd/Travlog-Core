import getESClient from '../config/elasticSearch.js';

export const indexData = async (data, index) => {
    await getESClient().index({
        index: index,
        id: '6677428e14809e3a30519687',
        document: data,
    });
    return data;
};
