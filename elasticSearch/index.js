import getESClient from '../elasticSearch/config.js';
import log from 'npmlog';

const scrollTime = '1m';
const maxPageSize = 10000;

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

export const scrollByQuery = async (index, query, fields = []) => {
    try {
        const result = [];
        const _source = fields.length > 0 ? fields : undefined;
        const client = getESClient();
        let response = await client.search({
            index: index,
            scroll: scrollTime,
            body: {
                query: query,
                size: maxPageSize,
                _source: _source,
            },
        });
        result.push(...response.hits.hits);
        while (response.hits.hits.length > 0) {
            response = await client.scroll({
                scroll_id: response._scroll_id,
                scroll: scrollTime,
            });
            result.push(...response.hits.hits);
        }
        await client.clearScroll({ scroll_id: response._scroll_id });
        return result;
    } catch (error) {
        throw error;
    }
};
