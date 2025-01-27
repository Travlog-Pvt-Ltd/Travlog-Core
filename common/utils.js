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
    }

    bulkInsert(tags) {
        if (!Array.isArray(tags) || tags.length === 0) {
            throw new Error('Words should be a non-empty array.');
        }
        for (const tag of tags) {
            this.insert(tag);
        }
    }

    traverse(word) {
        let node = this.root;
        for (const char of word.toLowerCase()) {
            if (!node.children[char]) return null;
            node = node.children[char];
        }
        return node;
    }

    search(word) {
        const node = this.traverse(word);
        return node && node.isEnd ? node : null;
    }

    startsWith(prefix) {
        return this.traverse(prefix);
    }
}
