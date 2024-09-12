import getESClient from '@config/elasticSearch';
import log from 'npmlog';

export const createDataIndex = async (id, doc, index) => {
    try {
        const result = await getESClient().index({
            index: index,
            id: id.toString(),
            document: doc,
        });
        return result;
    } catch (error) {
        throw error;
    }
};

export const updateDataIndex = async (id, doc, index) => {
    try {
        const result = await getESClient().update({
            index: index,
            id: id.toString(),
            doc: doc,
        });
        return result;
    } catch (error) {
        throw error;
    }
};

export const deleteDataIndex = async (id, index) => {
    try {
        const result = await getESClient().delete({
            index: index,
            id: id.toString(),
        });
        return result;
    } catch (error) {
        throw error;
    }
};

export const bulkCreateDataIndex = async (docs, index) => {
    try {
        const operations = docs.flatMap((doc) => {
            const { _id, ...newDoc } = doc;
            return [{ index: { _index: index, _id: doc._id } }, newDoc];
        });
        log.info(`Started indexing ${docs.length} entries...`);
        const result = await getESClient().bulk({ refresh: true, operations });
        log.info(`Finished indexing ${docs.length} entries...`);
        return result;
    } catch (error) {
        throw error;
    }
};

export const searchByQuery = async (index, query, limit) => {
    try {
        const result = await getESClient().search({
            index: index,
            body: {
                query: query,
                size: limit,
            },
        });
        return result.hits.hits;
    } catch (error) {
        throw error;
    }
};
