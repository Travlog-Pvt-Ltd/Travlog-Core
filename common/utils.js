import { consumerRegistry } from '../kafka/registry.js';

export const registerConsumer = (consumerClass) => {
    const consumer = new consumerClass();
    consumerRegistry.register(consumer.start.bind(consumer));
};

export const registerConsumerList = (consumerClassList) => {
    consumerClassList.forEach((consumerClass) => {
        registerConsumer(consumerClass);
    });
};

export class BaseSiteAbstractClass {
    constructor() {
        if (new.target === BaseSiteAbstractClass) {
            throw new Error('Abstract class cannot be instantiated directly.');
        }

        const abstractMethods = this.constructor.abstractMethods || [];
        for (const method of abstractMethods) {
            if (typeof this[method] !== 'function') {
                throw new Error(
                    `Class '${this.constructor.name}' must implement abstract method '${method}'.`
                );
            }
        }
    }
}

export const calculateJsonObjectSize = (trie) => {
    const serializedTrie = JSON.stringify(trie);
    const sizeInBytes = Buffer.byteLength(serializedTrie, 'utf8');
    return sizeInBytes;
};

class TrieNode {
    constructor() {
        this.children = {};
        this.isEnd = false;
        this._id = '';
        this.isPlace = 0;
    }
}

export class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(tag) {
        let node = this.root;
        for (const char of tag[0].toLowerCase()) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isEnd = true;
        node._id = tag[1];
        node.isPlace = tag[2];
    }

    bulkInsert(tags) {
        if (!Array.isArray(tags) || tags.length === 0) {
            throw new Error('Words should be a non-empty array.');
        }
        for (const tag of tags) {
            this.insert(tag);
        }
    }

    traverse(word, maxMismatches) {
        if (maxMismatches === null) {
            const length = word.length;
            maxMismatches = length > 8 ? 2 : length > 4 ? 1 : 0;
        }
        const results = [];

        const dfs = (node, index, mismatches, currentWord) => {
            if (mismatches > maxMismatches) return;

            if (index === word.length) {
                results.push({
                    isEnd: node.isEnd,
                    _id: node._id,
                    isPlace: node.isPlace,
                });
                return;
            }

            const char = word[index];
            for (const key in node.children) {
                dfs(
                    node.children[key],
                    index + 1,
                    mismatches + (key !== char ? 1 : 0),
                    currentWord + key
                );
            }
        };

        dfs(this.root, 0, 0, '');
        return results;
    }

    search(word, maxMismatches = null) {
        const nodes = this.traverse(word, maxMismatches);
        return nodes.filter((node) => node.isEnd);
    }

    startsWith(prefix, maxMismatches = null) {
        return this.traverse(prefix, maxMismatches);
    }
}
