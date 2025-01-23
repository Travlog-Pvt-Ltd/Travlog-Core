import log from 'npmlog';
import natural from 'natural';
import { blogProducer } from './producer.js';

export const handleBlogUpdateSignal = async (docOrQuery, next) => {
    try {
        const blogId = docOrQuery._id || docOrQuery.getQuery()?._id;
        await blogProducer.extractTagsProducer({ _id: blogId });
        next();
    } catch (error) {
        next(error);
    }
};

export const cleanBlogContent = (text) => {
    const stopWords = new Set(natural.stopwords);
    // remove commas and prune stop words
    // combine remaining words with whitespace
};

export const processBlogTags = async (blog) => {
    if (!blog._id) return;
    log.info(`Started processing blog with id: ${blog._id}`);
    const text = blog.title + ' ' + blog.content;
    cleanBlogContent(text);
    // check the words in trie using sliding window approach to find multiword tags.
};
