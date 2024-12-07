import mongoose from 'mongoose';
import Blog from '../../blog/model.js';
import BlogInstance from '../../models/blogInstance.js';
import User from '../../models/user.js';
import UserInstance from '../../models/userInstance.js';
import redis, { deleteKeysByPatternWithScan } from '../../config/redis.js';
import { bookmarkField } from './utils/constants.js';
import {
    authorFieldsForBlog,
    blogFieldsToSelect,
} from '../../blog/constants.js';

const addBookmark = async (req, res) => {
    const { blog } = req.body;
    try {
        const [newBlogInstance, newUserInstance] = await Promise.all([
            BlogInstance.create({
                blogId: blog,
            }),
            UserInstance.create({
                userId: req.userId,
            }),
        ]);
        await User.findByIdAndUpdate(req.userId, {
            $push: { bookmarks: newBlogInstance._id },
        });
        await deleteKeysByPatternWithScan(`bookmarks#user:${req.userId}`);
        const newBlog = await Blog.findByIdAndUpdate(
            blog,
            { $push: { bookmarks: newUserInstance._id } },
            { new: true }
        )
            .select(blogFieldsToSelect)
            .populate('author', authorFieldsForBlog)
            .populate('tags.places', 'name')
            .populate('tags.activities', 'name');
        res.status(201).json({ blog: newBlog });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getBookmarks = async (req, res) => {
    const { limit = 10, skip = 0 } = req.query;
    try {
        const cachedBookmarks = await redis.get(
            `bookmarks#user:${req.userId}?limit:${limit}&skip:${skip}`
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
            `bookmarks#user:${req.userId}?limit:${limit}&skip:${skip}`,
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
        const toDeleteUserInstances = [];
        foundBlog.bookmarks.forEach((item) => {
            if (item.userId.equals(userObject))
                toDeleteUserInstances.push(item._id);
        });
        const [_a, _b, foundUser] = await Promise.all([
            UserInstance.deleteMany({ _id: { $in: toDeleteUserInstances } }),
            Blog.findByIdAndUpdate(blog, {
                $pull: { bookmarks: { $in: toDeleteUserInstances } },
            }),
            User.findById(req.userId).populate('bookmarks'),
        ]);
        const toDeleteBlogInstances = [];
        foundUser.bookmarks.forEach((item) => {
            if (item.blogId.equals(blogObject))
                toDeleteBlogInstances.push(item._id);
        });
        const [_c, newUser] = await Promise.all([
            BlogInstance.deleteMany({ _id: { $in: toDeleteBlogInstances } }),
            User.findByIdAndUpdate(
                req.userId,
                { $pull: { bookmarks: { $in: toDeleteBlogInstances } } },
                { new: true }
            ).populate(bookmarkField),
        ]);
        await deleteKeysByPatternWithScan(`bookmarks#user:${req.userId}`);
        res.status(201).json(newUser.bookmarks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export { addBookmark, getBookmarks, removeBookmark };
