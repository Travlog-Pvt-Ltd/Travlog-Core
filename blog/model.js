import mongoose from 'mongoose';
import { handleBlogUpdateSignal } from './utils.js';

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        tags: {
            places: {
                type: [mongoose.Schema.Types.ObjectId],
                ref: 'Place',
                default: [],
            },
            activities: {
                type: [mongoose.Schema.Types.ObjectId],
                ref: 'Activity',
                default: [],
            },
        },
        system_tags: {
            places: {
                type: [mongoose.Schema.Types.ObjectId],
                ref: 'Place',
                default: [],
            },
            activities: {
                type: [mongoose.Schema.Types.ObjectId],
                ref: 'Activity',
                default: [],
            },
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'UserInstance',
            },
        ],
        likeCount: {
            type: Number,
            default: 0,
        },
        dislikes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'UserInstance',
            },
        ],
        dislikeCount: {
            type: Number,
            default: 0,
        },
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comment',
            },
        ],
        commentCount: {
            type: Number,
            default: 0,
        },
        views: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'UserInstance',
            },
        ],
        viewCount: {
            type: Number,
            default: 0,
        },
        organicViews: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'OrganicUserInstance',
            },
        ],
        organicViewCount: {
            type: Number,
            default: 0,
        },
        shares: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'UserInstance',
            },
        ],
        shareCount: {
            type: Number,
            default: 0,
        },
        bookmarks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'UserInstance',
            },
        ],
        attachments: {
            type: [String],
            default: [],
        },
        thumbnail: {
            type: String,
            default: null,
        },
        hasInfo: {
            type: Boolean,
            default: false,
        },
        isPrivate: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

blogSchema.virtual('shortContent').get(function () {
    return this.content ? this.content.substring(0, 500) : '';
});

blogSchema.set('toJSON', { virtuals: true });
blogSchema.set('toObject', { virtuals: true });

blogSchema.post('save', async function (doc, next) {
    await handleBlogUpdateSignal(doc, next);
});

blogSchema.post('updateOne', async function (doc, next) {
    await handleBlogUpdateSignal(this, next);
});

blogSchema.post('findOneAndUpdate', async function (doc, next) {
    await handleBlogUpdateSignal(doc, next);
});

const singleBlogSchema = new mongoose.Schema(
    {
        blogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog',
        },
    },
    { timestamps: true }
);

const Blog = mongoose.model('Blog', blogSchema);

const BlogInstance = mongoose.model('BlogInstance', singleBlogSchema);

export { Blog, BlogInstance };
