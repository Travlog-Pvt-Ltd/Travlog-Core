import mongoose from 'mongoose';
import Blog from '../../models/blog.js';
import BlogInstance from '../../models/blogInstance.js';
import User from '../../models/user.js';
import UserInstance from '../../models/userInstance.js';
import redis from '../../config/redis.js';
import { bookmarkField } from './utils/constants.js';
import {
    authorFieldsForBlog,
    blogFieldsToSelect,
} from '../blog/utils/constants.js';

const addBookmark = async (req, res) => {
    const { blog } = req.body;
    try {
        const newBlogInstance = await BlogInstance.create({
            blogId: blog,
        });
        const user = await User.findByIdAndUpdate(
            req.userId,
            { $push: { bookmarks: newBlogInstance._id } },
            { new: true }
        ).populate({
            ...bookmarkField,
            populate: {
                ...bookmarkField.populate,
                options: {
                    ...bookmarkField.populate.options,
                    limit: 10,
                    skip: 0,
                },
            },
        });
        const newUserInstance = await UserInstance.create({
            userId: req.userId,
        });
        const newBlog = await Blog.findByIdAndUpdate(
            blog,
            { $push: { bookmarks: newUserInstance._id } },
            { new: true }
        )
            .select(blogFieldsToSelect)
            .populate('author', authorFieldsForBlog);
        await redis.setEx(
            `bookmarks#user:${req.userId}#limit:$10#skip:$0`,
            3600,
            JSON.stringify(user.bookmarks)
        );
        res.status(201).json({ blog: newBlog });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getBookmarks = async (req, res) => {
    const { limit = 10, skip = 0 } = req.query;
    try {
        const cachedBookmarks = await redis.get(
            `bookmarks#user:${req.userId}#limit:${limit}#skip:${skip}`
        );
        if (cachedBookmarks) return res.status(200).json(cachedBookmarks);
        const user = await User.findById(req.userId).populate({
            ...bookmarkField,
            populate: {
                ...bookmarkField.populate,
                options: {
                    ...bookmarkField.populate.options,
                    limit: 10,
                    skip: 0,
                },
            },
        });
        await redis.setEx(
            `bookmarks#user:${req.userId}#limit:${limit}#skip:${skip}`,
            3600,
            JSON.stringify(user.bookmarks)
        );
        res.status(200).json(user.bookmarks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const removeBookmark = async (req, res) => {
    const { blog } = req.body;
    const userObject = new mongoose.Types.ObjectId(req.userId);
    const blogObject = new mongoose.Types.ObjectId(blog);
    try {
        const foundBlog = await Blog.findById(blog).populate('bookmarks');
        const newUserInstances = [];
        const toDeleteUserInstances = [];
        foundBlog.bookmarks.map((item) => {
            if (!item.userId.equals(userObject)) newUserInstances.push(item);
            else toDeleteUserInstances.push(item);
        });
        toDeleteUserInstances.forEach(async (el) => {
            await UserInstance.findByIdAndDelete(el._id);
        });
        await Blog.findByIdAndUpdate(blog, {
            $set: { bookmarks: newUserInstances },
        });
        const foundUser = await User.findById(req.userId).populate('bookmarks');
        const newBlogInstances = [];
        const toDeleteBlogInstances = [];
        foundUser.bookmarks.map((item) => {
            if (!item.blogId.equals(blogObject)) newBlogInstances.push(item);
            else toDeleteBlogInstances.push(item);
        });
        toDeleteBlogInstances.forEach(async (el) => {
            await BlogInstance.findByIdAndDelete(el._id);
        });
        const newUser = await User.findByIdAndUpdate(
            req.userId,
            { $set: { bookmarks: newBlogInstances } },
            { new: true }
        ).populate(bookmarkField);
        await redis.setEx(
            `bookmarks#user:${req.userId}`,
            3600,
            JSON.stringify(newUser.bookmarks)
        );
        res.status(201).json(newUser.bookmarks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export { addBookmark, getBookmarks, removeBookmark };
