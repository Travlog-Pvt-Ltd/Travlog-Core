import log from 'npmlog';
import { parseDocument } from 'htmlparser2';
import natural from 'natural';
import { stopWordsToInclude } from './constants.js';
import { getTagsTrie } from '../tags/utils.js';
import { Blog } from './model.js';

export const getTagDifferences = (oldBlog, newBlog) => {
    const oldPlaces = new Set(oldBlog.tags.places.map(String));
    const newPlaces = new Set(newBlog.tags.places.map(String));
    const oldActivities = new Set(oldBlog.tags.activities.map(String));
    const newActivities = new Set(newBlog.tags.activities.map(String));

    const findDifferences = (oldSet, newSet) => {
        const added = [...newSet].filter((item) => !oldSet.has(item));
        const removed = [...oldSet].filter((item) => !newSet.has(item));
        return { added, removed };
    };

    const placesDifference = findDifferences(oldPlaces, newPlaces);
    const activitiesDifference = findDifferences(oldActivities, newActivities);
    return {
        places: placesDifference,
        activities: activitiesDifference,
    };
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
    let extractedTags = [];
    for (let i = 0; i < cleanedText.length; i++) {
        let phrase = '';
        let j = i;
        // Continue expanding the phrase as long as it starts with a valid prefix
        while (j < cleanedText.length) {
            phrase = phrase ? `${phrase} ${cleanedText[j]}` : cleanedText[j];
            if (tagsTrie.startsWith(phrase, 0).length == 0) {
                break;
            }
            const nodes = tagsTrie.search(phrase, 0);
            if (nodes.length > 0) {
                extractedTags = [...extractedTags, ...nodes];
            }
            j++;
        }
    }
    return extractedTags;
};

export const processBlogTags = async (blog) => {
    try {
        if (!blog._id) return;
        log.info(`Started processing blog with id: ${blog._id}`);
        const text = blog.title + ' ' + processBlogMarkupText(blog.content);
        const cleanedText = cleanBlogContent(text);
        const extractedTags = await extractSystemTags(cleanedText);
        // Get the objects from db and add in blog
        const places = [];
        const activities = [];
        extractedTags.forEach((tag) => {
            if (tag.isPlace === 1) {
                if (
                    !(
                        blog.tags.places
                            .map((id) => id.toString())
                            .includes(tag._id) ||
                        blog.system_tags.places
                            .map((id) => id.toString())
                            .includes(tag._id)
                    )
                )
                    places.push(tag._id);
            } else if (
                !(
                    blog.tags.activities
                        .map((id) => id.toString())
                        .includes(tag._id) ||
                    blog.system_tags.activities
                        .map((id) => id.toString())
                        .includes(tag._id)
                )
            )
                activities.push(tag._id);
        });
        await Blog.updateOne(
            { _id: blog._id },
            {
                $push: {
                    'system_tags.places': places,
                    'system_tags.activities': activities,
                },
            }
        );
        log.info(`Extracted tags for blog with id ${blog._id}`);
    } catch (error) {
        log.error('Something went wrong', error.message);
    }
};
