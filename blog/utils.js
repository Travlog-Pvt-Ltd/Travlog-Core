import log from 'npmlog';
import { parseDocument } from 'htmlparser2';
import natural from 'natural';
import { blogProducer } from './producer.js';
import { stopWordsToInclude } from './constants.js';
import { getTagsTrie } from '../tags/utils.js';

export const handleBlogUpdateSignal = async (docOrQuery, next) => {
    try {
        const blogId = docOrQuery._id || docOrQuery.getQuery()?._id;
        await blogProducer.extractTagsProducer({ _id: blogId });
        next();
    } catch (error) {
        next(error);
    }
};

const parseMarkupText = (node) => {
    if (!node) return '';
    if (node.type === 'text') {
        return node.data.trim();
    } else if (node.type === 'tag' && node.name === 'img') {
        return '';
    } else if (node.children) {
        return node.children.map(parseMarkupText).join(' ');
    }
    return '';
};

export const processBlogMarkupText = (markup) => {
    const doc = parseDocument(markup);
    return parseMarkupText(doc).replace(/\s+/g, ' ').trim();
};

export const cleanBlogContent = (text) => {
    const stopWords = natural.stopwords.filter(
        (el) => !stopWordsToInclude.includes(el)
    );
    // remove commas and prune stop words
    // combine remaining words with whitespace
    const seen = new Set();
    const cleanedText = text
        .toLowerCase()
        .replace(/[,.!:\-=/]/g, '')
        .split(/\s+/)
        .filter((word) => {
            if (stopWords.includes(word) || seen.has(word)) {
                return false;
            }
            seen.add(word);
            return true;
        });
    return cleanedText;
};

export const extractSystemTags = async (cleanedText) => {
    const tagsTrie = await getTagsTrie();
    // check the words in trie using sliding window approach to find multiword tags.
    const extractedTags = [];
    for (let i = 0; i < cleanedText.length; i++) {
        let phrase = '';
        let j = i;
        // Continue expanding the phrase as long as it starts with a valid prefix
        while (j < cleanedText.length) {
            phrase = phrase ? `${phrase} ${cleanedText[j]}` : cleanedText[j];
            if (!tagsTrie.startsWith(phrase)) {
                break;
            }
            const node = tagsTrie.search(phrase);
            if (node) {
                extractedTags.push(node._id);
            }
            j++;
        }
    }
    return extractedTags;
};

export const processBlogTags = async (blog) => {
    if (!blog._id) return;
    log.info(`Started processing blog with id: ${blog._id}`);
    const text = blog.title + ' ' + processBlogMarkupText(blog.content);
    const cleanedText = cleanBlogContent(text);
    const extractedTags = await extractSystemTags(cleanedText);
    // Get the objects from db and add in blog
    log.info(`Extracted tags for blog with id ${blog._id}`);
};
