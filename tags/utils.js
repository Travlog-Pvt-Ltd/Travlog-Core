import log from 'npmlog';
import { Trie } from '../common/utils.js';
import { searchAllTags } from './searchUtils.js';
import redis from '../redis/index.js';

export const parseEsTagData = (data) => {
    const result = data.map((el) => {
        const { _source, _id, ..._ } = el;
        _source['_id'] = _id;
        return _source;
    });
    return result;
};

export const getAllTagsName = async () => {
    try {
        const result = await searchAllTags(['name', 'isPlace']);
        return result.map((doc) => [
            doc._source.name,
            doc._id,
            doc._source.isPlace,
        ]);
    } catch (error) {
        throw error;
    }
};

const generateNameVariations = (tag) => {
    const variations = [];
    variations.push(tag);
    const match = tag[0].match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
        variations.push([match[1].trim(), tag[1], tag[2]]);
        variations.push([match[2].trim(), tag[1], tag[2]]);
    }
    return variations;
};

export const createAndStoreTagTrie = async () => {
    try {
        const tags = await getAllTagsName();
        const tagsTrie = new Trie();
        // Handle names where another name is added in parantheses
        const variations = tags.flatMap((tag) => generateNameVariations(tag));
        tagsTrie.bulkInsert(variations);
        const serializedTrie = JSON.stringify(tagsTrie);
        await redis.setEx('tagsTrie', 84600, serializedTrie);
        return serializedTrie;
    } catch (error) {
        throw error;
    }
};

export const getTagsTrie = async () => {
    try {
        let serializedTrie = await redis.get('tagsTrie');
        if (!serializedTrie) {
            log.info('Tags trie not found in cache. Creating and storing it.');
            serializedTrie = await createAndStoreTagTrie();
        }
        const parsedTrie = JSON.parse(serializedTrie);
        const restoredTrie = new Trie();
        restoredTrie.root = parsedTrie.root;
        return restoredTrie;
    } catch (error) {
        log.error(error.message);
    }
};
