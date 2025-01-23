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
        const result = await searchAllTags(['name']);
        return result.map((doc) => doc._source.name);
    } catch (error) {
        throw error;
    }
};

export const createAndStoreTagTrie = async () => {
    try {
        const names = await getAllTagsName();
        const tagsTrie = new Trie();
        tagsTrie.bulkInsert(names);
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
