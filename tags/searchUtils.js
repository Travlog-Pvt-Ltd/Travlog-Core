import { indices } from '../elasticSearch/config.js';
import {
    bulkCreateDataIndex,
    createDataIndex,
    deleteDataIndex,
    scrollByQuery,
    searchByQuery,
    updateDataIndex,
} from '../elasticSearch/index.js';
import { Activity, Place } from './model.js';

const tagESIndex = indices.searchIndex;

export const tagDocSchema = {
    placeId: {
        type: 'string',
        path: 'placeId',
    },
    name: {
        type: 'string',
        path: 'name',
    },
    isPlace: {
        type: 'boolean',
        path: 'isPlace',
    },
    types: {
        type: 'string',
        path: 'types',
    },
    country: {
        type: 'string',
        path: 'country',
    },
    pincode: {
        type: 'string',
        path: 'pincode',
    },
    formattedAddress: {
        type: 'string',
        path: 'formattedAddress',
    },
    location: {
        type: 'string',
        path: 'location',
    },
    searchCount: {
        type: 'number',
        path: 'searchCount',
    },
    blogCount: {
        type: 'number',
        path: 'blogCount',
    },
    updatedAt: {
        type: 'date',
        path: 'updatedAt',
    },
};

export const getValueFromFields = (obj, data) => {
    const keys = obj.path.split('.');
    let value = data;
    for (let i = 0; i < keys.length; i++) {
        if (data[`${keys[i]}`]) {
            value = value[`${keys[i]}`];
        } else return null;
    }
    return value;
};

export const createJsonDoc = (data, bulk = false, fields = []) => {
    // This util cleans the data to make sure the data is in required format and filler data is removed
    const jsonDoc = {};
    for (const [key, obj] of Object.entries(tagDocSchema)) {
        // If update is called with certain fields, only consider those fields
        if (fields.length > 0 && !fields.includes(key)) {
            continue;
        }
        const value = getValueFromFields(obj, data);
        if (obj.type === 'boolean') {
            jsonDoc[`${key}`] = value ? 1 : 0;
        } else if (value) jsonDoc[`${key}`] = value;
    }
    if (bulk) {
        jsonDoc['_id'] = data._id;
    }
    return jsonDoc;
};

export const createTagIndex = async (data) => {
    const doc = createJsonDoc(data);
    const index = tagESIndex;
    return await createDataIndex(data._id, doc, index);
};

export const bulkCreateTagIndex = async (dataset) => {
    const docs = [];
    if (!dataset || dataset.length === 0) {
        const places = await Place.find();
        const activities = await Activity.find();
        dataset = [...places, ...activities];
    }
    for (let i = 0; i < dataset.length; i++) {
        const doc = createJsonDoc(dataset[i], true);
        docs.push(doc);
    }
    const index = tagESIndex;
    return await bulkCreateDataIndex(docs, index);
};

export const updateTagIndex = async (data, fields = []) => {
    const doc = createJsonDoc(data, false, fields);
    const index = tagESIndex;
    return await updateDataIndex(data._id, doc, index);
};

export const deleteTagIndex = async (id) => {
    return await deleteDataIndex(id, tagESIndex);
};

export const searchTagsQuery = (queryText) => {
    /*
        TODO [Aryan | 2024-09-28]
        - Add logic to break tie of relevancy score with searchCount
    */
    return {
        bool: {
            should: [
                {
                    bool: {
                        should: [
                            {
                                match_phrase_prefix: {
                                    name: {
                                        query: queryText,
                                        max_expansions: 20,
                                    },
                                },
                            },
                            {
                                match: {
                                    name: {
                                        query: queryText,
                                        fuzziness: 'AUTO',
                                    },
                                },
                            },
                        ],
                    },
                },
                {
                    bool: {
                        should: [
                            {
                                match_phrase_prefix: {
                                    formattedAddress: {
                                        query: queryText,
                                        max_expansions: 20,
                                    },
                                },
                            },
                            {
                                match: {
                                    formattedAddress: {
                                        query: queryText,
                                        fuzziness: 'AUTO',
                                    },
                                },
                            },
                        ],
                    },
                },
                {
                    bool: {
                        should: [
                            {
                                match_phrase_prefix: {
                                    types: {
                                        query: queryText,
                                        max_expansions: 20,
                                    },
                                },
                            },
                            {
                                match: {
                                    types: {
                                        query: queryText,
                                        fuzziness: 'AUTO',
                                    },
                                },
                            },
                        ],
                    },
                },
            ],
        },
    };
};

export const customSearchTags = async (queryText) => {
    try {
        const query = searchTagsQuery(queryText);
        return await searchByQuery(tagESIndex, query, 10);
    } catch (error) {
        throw error;
    }
};

export const searchAllTags = async (fields = []) => {
    try {
        const query = { match_all: {} };
        const result = await scrollByQuery(tagESIndex, query, fields);
        return result;
    } catch (error) {
        throw error;
    }
};
