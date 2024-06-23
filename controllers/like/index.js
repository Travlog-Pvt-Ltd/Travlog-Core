import mongoose from 'mongoose';
import Blog from '../../models/blog.js';
import LCEvent from '../../models/likeCommentEvent.js';
import UserActivity from '../../models/userActivity.js';
import UserInstance from '../../models/userInstance.js';
import Comment from '../../models/comment.js';
import User from '../../models/user.js';
import redis, { updateUserInCache } from '../../config/redis.js';

const likeBlog = async (req, res) => {
    const blog = req.body.blogId;
    const userObject = new mongoose.Types.ObjectId(req.userId);
    const blogObject = new mongoose.Types.ObjectId(blog);
    try {
        const found = await Blog.findById(blog).populate('likes dislikes');
        let check = false;
        found.likes.map((like) => {
            if (like.userId.equals(userObject)) check = true;
        });
        if (check) {
            const user = await User.findByIdAndUpdate(
                req.userId,
                { $pull: { likes: blog } },
                { new: true }
            )
                .select(
                    '-password -token -deviceId -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
                )
                .populate('followings', '_id userId');
            const newLikes = [];
            const toDelete = [];
            found.likes.map((like) => {
                if (!like.userId.equals(userObject)) newLikes.push(like);
                else toDelete.push(like);
            });
            toDelete.forEach(async (el) => {
                await UserInstance.findByIdAndDelete(el._id);
            });
            const newBlog = await Blog.findByIdAndUpdate(
                blog,
                { $set: { likes: newLikes, likeCount: newLikes.length } },
                { new: true }
            )
                .select(
                    '_id title content author tags likeCount commentCount viewCount shareCount thumbnail createdAt updatedAt'
                )
                .populate('author', '_id name profileLogo profileImage')
                .populate('tags.places', 'name')
                .populate('tags.activities', 'name');
            const activity = await UserActivity.findOne({
                userId: req.userId,
            }).populate('likeEvent');
            const newEvents = [];
            const toDeleteEvents = [];
            activity.likeEvent.map((event) => {
                if (
                    !event.blogId.equals(blogObject) ||
                    event.isComment === true ||
                    event.onComment === true ||
                    event.isDislike === true
                )
                    newEvents.push(event);
                else toDeleteEvents.push(event);
            });
            toDeleteEvents.forEach(async (el) => {
                await LCEvent.findByIdAndDelete(el._id);
            });
            await UserActivity.findByIdAndUpdate(activity._id, {
                $set: { likeEvent: newEvents },
            });
            await updateUserInCache(user);
            await redis.setEx(
                `blog_data#user:${user._id}#blog:${newBlog._id}`,
                3600,
                JSON.stringify(newBlog)
            );
            res.status(201).json({ blog: newBlog, user: user });
        } else {
            check = false;
            found.dislikes.map((dislike) => {
                if (dislike.userId.equals(userObject)) check = true;
            });
            if (check) {
                await User.findByIdAndUpdate(req.userId, {
                    $pull: { dislikes: blog },
                });
                const newDislikes = [];
                const toDelete = [];
                found.dislikes.map((dislike) => {
                    if (!dislike.userId.equals(userObject))
                        newDislikes.push(dislike);
                    else toDelete.push(dislike);
                });
                toDelete.forEach(async (el) => {
                    await UserInstance.findByIdAndDelete(el._id);
                });
                await Blog.findByIdAndUpdate(blog, {
                    $set: {
                        dislikes: newDislikes,
                        dislikeCount: newDislikes.length,
                    },
                });
                const activity = await UserActivity.findOne({
                    userId: req.userId,
                }).populate('dislikeEvent');
                const newEvents = [];
                const toDeleteEvents = [];
                activity.dislikeEvent.map((event) => {
                    if (
                        !event.blogId.equals(blogObject) ||
                        event.isComment === true ||
                        event.onComment === true ||
                        event.isDislike === false
                    )
                        newEvents.push(event);
                    else toDeleteEvents.push(event);
                });
                toDeleteEvents.forEach(async (el) => {
                    await LCEvent.findByIdAndDelete(el._id);
                });
                await UserActivity.findByIdAndUpdate(activity._id, {
                    $set: { dislikeEvent: newEvents },
                });
            }
            const user = await User.findByIdAndUpdate(
                req.userId,
                { $push: { likes: blog } },
                { new: true }
            )
                .select(
                    '-password -deviceId -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
                )
                .populate('followings', '_id userId');
            const userInstance = await UserInstance.create({
                userId: req.userId,
            });
            const newBlog = await Blog.findByIdAndUpdate(
                blog,
                { $push: { likes: userInstance._id }, $inc: { likeCount: 1 } },
                { new: true }
            )
                .select(
                    '_id title content author tags likeCount commentCount viewCount shareCount thumbnail createdAt updatedAt'
                )
                .populate('author', '_id name profileLogo profileImage')
                .populate('tags.places', 'name')
                .populate('tags.activities', 'name');
            const likeEvent = await LCEvent.create({
                blogId: blog,
                isComment: false,
                commentId: null,
                content: null,
                onComment: false,
                isDislike: false,
            });
            const isUserActive = await UserActivity.findOne({
                userId: req.userId,
            });
            if (isUserActive) {
                await UserActivity.findByIdAndUpdate(isUserActive._id, {
                    $push: { likeEvent: likeEvent._id },
                });
            } else {
                await UserActivity.create({
                    userId: req.userId,
                    likeEvent: [likeEvent._id],
                });
            }
            await updateUserInCache(user);
            await redis.setEx(
                `blog_data#user:${user._id}#blog:${newBlog._id}`,
                3600,
                JSON.stringify(newBlog)
            );
            res.status(201).json({ blog: newBlog, user: user });
        }
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

const dislikeBlog = async (req, res) => {
    const blog = req.body.blogId;
    const userObject = new mongoose.Types.ObjectId(req.userId);
    const blogObject = new mongoose.Types.ObjectId(blog);
    try {
        const found = await Blog.findById(blog).populate('likes dislikes');
        let check = false;
        found.dislikes.map((dislike) => {
            if (dislike.userId.equals(userObject)) check = true;
        });
        if (check) {
            const user = await User.findByIdAndUpdate(
                req.userId,
                { $pull: { dislikes: blog } },
                { new: true }
            )
                .select(
                    '-password -deviceId -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
                )
                .populate('followings', '_id userId');
            const newDislikes = [];
            const toDelete = [];
            found.dislikes.map((dislike) => {
                if (!dislike.userId.equals(userObject))
                    newDislikes.push(dislike);
                else toDelete.push(dislike);
            });
            toDelete.forEach(async (el) => {
                await UserInstance.findByIdAndDelete(el._id);
            });
            const newBlog = await Blog.findByIdAndUpdate(
                blog,
                {
                    $set: {
                        dislikes: newDislikes,
                        dislikeCount: newDislikes.length,
                    },
                },
                { new: true }
            )
                .select(
                    '_id title content author tags likeCount commentCount viewCount shareCount thumbnail createdAt updatedAt'
                )
                .populate('author', '_id name profileLogo profileImage')
                .populate('tags.places', 'name')
                .populate('tags.activities', 'name');
            const activity = await UserActivity.findOne({
                userId: req.userId,
            }).populate('dislikeEvent');
            const newEvents = [];
            const toDeleteEvents = [];
            activity.dislikeEvent.map((event) => {
                if (
                    !event.blogId.equals(blogObject) ||
                    event.isComment === true ||
                    event.onComment === true ||
                    event.isDislike === false
                )
                    newEvents.push(event);
                else toDeleteEvents.push(event);
            });
            toDeleteEvents.forEach(async (el) => {
                await LCEvent.findByIdAndDelete(el._id);
            });
            await UserActivity.findByIdAndUpdate(activity._id, {
                $set: { dislikeEvent: newEvents },
            });
            await updateUserInCache(user);
            await redis.setEx(
                `blog_data#user:${user._id}#blog:${newBlog._id}`,
                3600,
                JSON.stringify(newBlog)
            );
            res.status(201).json({ blog: newBlog, user: user });
        } else {
            check = false;
            found.likes.map((like) => {
                if (like.userId.equals(userObject)) check = true;
            });
            if (check) {
                await User.findByIdAndUpdate(req.userId, {
                    $pull: { likes: blog },
                });
                const newLikes = [];
                const toDelete = [];
                found.likes.map((like) => {
                    if (!like.userId.equals(userObject)) newLikes.push(like);
                    else toDelete.push(like);
                });
                toDelete.forEach(async (el) => {
                    await UserInstance.findByIdAndDelete(el._id);
                });
                await Blog.findByIdAndUpdate(blog, {
                    $set: { likes: newLikes, likeCount: newLikes.length },
                });
                const activity = await UserActivity.findOne({
                    userId: req.userId,
                }).populate('likeEvent');
                const newEvents = [];
                const toDeleteEvents = [];
                activity.likeEvent.map((event) => {
                    if (
                        !event.blogId.equals(blogObject) ||
                        event.isComment === true ||
                        event.onComment === true ||
                        event.isDislike === true
                    )
                        newEvents.push(event);
                    else toDeleteEvents.push(event);
                });
                toDeleteEvents.forEach(async (el) => {
                    await LCEvent.findByIdAndDelete(el._id);
                });
                await UserActivity.findByIdAndUpdate(activity._id, {
                    $set: { likeEvent: newEvents },
                });
            }
            const user = await User.findByIdAndUpdate(
                req.userId,
                { $push: { dislikes: blog } },
                { new: true }
            )
                .select(
                    '-password -deviceId -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
                )
                .populate('followings', '_id userId');
            const userInstance = await UserInstance.create({
                userId: req.userId,
            });
            const newBlog = await Blog.findByIdAndUpdate(
                blog,
                {
                    $push: { dislikes: userInstance._id },
                    $inc: { dislikeCount: 1 },
                },
                { new: true }
            )
                .select(
                    '_id title content author tags likeCount commentCount viewCount shareCount thumbnail createdAt updatedAt'
                )
                .populate('author', '_id name profileLogo profileImage')
                .populate('tags.places', 'name')
                .populate('tags.activities', 'name');
            const dislikeEvent = await LCEvent.create({
                blogId: blog,
                isComment: false,
                commentId: null,
                content: null,
                onComment: false,
                isDislike: true,
            });
            const isUserActive = await UserActivity.findOne({
                userId: req.userId,
            });
            if (isUserActive)
                await UserActivity.findByIdAndUpdate(isUserActive._id, {
                    $push: { dislikeEvent: dislikeEvent._id },
                });
            else
                await UserActivity.create({
                    userId: req.userId,
                    dislikeEvent: [dislikeEvent._id],
                });
            await updateUserInCache(user);
            await redis.setEx(
                `blog_data#user:${user._id}#blog:${newBlog._id}`,
                3600,
                JSON.stringify(newBlog)
            );
            res.status(201).json({ blog: newBlog, user: user });
        }
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

const likeComment = async (req, res) => {
    const { comment, blog } = req.body;
    const userObject = new mongoose.Types.ObjectId(req.userId);
    const commentObject = new mongoose.Types.ObjectId(comment);
    const blogObject = new mongoose.Types.ObjectId(blog);
    try {
        const found = await Comment.findById(comment).populate('likes');
        let check = false;
        found.likes.map((like) => {
            if (like.userId.equals(userObject)) check = true;
        });
        if (check) {
            const newLikes = [];
            const toDelete = [];
            found.likes.map((like) => {
                if (!like.userId.equals(userObject)) newLikes.push(like);
                else toDelete.push(like);
            });
            toDelete.forEach(async (el) => {
                await UserInstance.findByIdAndDelete(el._id);
            });
            const newComment = await Comment.findByIdAndUpdate(
                comment,
                { $set: { likes: newLikes, likeCount: newLikes.length } },
                { new: true }
            );
            const activity = await UserActivity.findOne({
                userId: req.userId,
            }).populate('likeEvent');
            const newEvents = [];
            const toDeleteEvents = [];
            activity.likeEvent.map((event) => {
                if (
                    !event.blogId.equals(blogObject) ||
                    event.isComment === true ||
                    !event.commentId.equals(commentObject) ||
                    event.onComment === false ||
                    event.isDislike === true
                )
                    newEvents.push(event);
                else toDeleteEvents.push(event);
            });
            toDeleteEvents.forEach(async (el) => {
                await LCEvent.findByIdAndDelete(el._id);
            });
            await UserActivity.findByIdAndUpdate(activity._id, {
                $set: { likeEvent: newEvents },
            });
            res.status(201).json(newComment);
        } else {
            const userInstance = await UserInstance.create({
                userId: req.userId,
            });
            const newComment = await Comment.findByIdAndUpdate(
                comment,
                { $push: { likes: userInstance._id }, $inc: { likeCount: 1 } },
                { new: true }
            );
            const likeEvent = await LCEvent.create({
                blogId: blog,
                isComment: false,
                commentId: comment,
                content: null,
                onComment: true,
                isDislike: false,
            });
            const isUserActive = await UserActivity.findOne({
                userId: req.userId,
            });
            if (isUserActive) {
                await UserActivity.findByIdAndUpdate(isUserActive._id, {
                    $push: { likeEvent: likeEvent._id },
                });
            } else {
                await UserActivity.create({
                    userId: req.userId,
                    likeEvent: [likeEvent._id],
                });
            }
            res.status(201).json(newComment);
        }
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

const dislikeComment = async (req, res) => {
    const { comment, blog } = req.body;
    const userObject = new mongoose.Types.ObjectId(req.userId);
    const commentObject = new mongoose.Types.ObjectId(comment);
    const blogObject = new mongoose.Types.ObjectId(blog);
    try {
        const found = await Comment.findById(comment).populate('dislikes');
        let check = false;
        found.dislikes.map((dislike) => {
            if (dislike.userId.equals(userObject)) check = true;
        });
        if (check) {
            const newDislikes = [];
            const toDelete = [];
            found.dislikes.map((dislike) => {
                if (!dislike.userId.equals(userObject))
                    newDislikes.push(dislike);
                else toDelete.push(dislike);
            });
            toDelete.forEach(async (el) => {
                await UserInstance.findByIdAndDelete(el._id);
            });
            const newComment = await Comment.findByIdAndUpdate(
                comment,
                {
                    $set: {
                        dislikes: newDislikes,
                        dislikeCount: newDislikes.length,
                    },
                },
                { new: true }
            );
            const activity = await UserActivity.findOne({
                userId: req.userId,
            }).populate('dislikeEvent');
            const newEvents = [];
            const toDeleteEvents = [];
            activity.dislikeEvent.map((event) => {
                if (
                    !event.blogId.equals(blogObject) ||
                    event.isComment === true ||
                    !event.commentId.equals(commentObject) ||
                    event.onComment === false ||
                    event.isDislike === false
                )
                    newEvents.push(event);
                else toDeleteEvents.push(event);
            });
            toDeleteEvents.forEach(async (el) => {
                await LCEvent.findByIdAndDelete(el._id);
            });
            await UserActivity.findByIdAndUpdate(activity._id, {
                $set: { dislikeEvent: newEvents },
            });
            res.status(201).json(newComment);
        } else {
            const userInstance = await UserInstance.create({
                userId: req.userId,
            });
            const newComment = await Comment.findByIdAndUpdate(
                comment,
                {
                    $push: { dislikes: userInstance._id },
                    $inc: { dislikeCount: 1 },
                },
                { new: true }
            );
            const dislikeEvent = await LCEvent.create({
                blogId: blog,
                isComment: false,
                commentId: comment,
                content: null,
                onComment: true,
                isDislike: true,
            });
            const isUserActive = await UserActivity.findOne({
                userId: req.userId,
            });
            if (isUserActive) {
                await UserActivity.findByIdAndUpdate(isUserActive._id, {
                    $push: { dislikeEvent: dislikeEvent._id },
                });
            } else {
                await UserActivity.create({
                    userId: req.userId,
                    dislikeEvent: [dislikeEvent._id],
                });
            }
            res.status(201).json(newComment);
        }
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

export { likeBlog, dislikeBlog, likeComment, dislikeComment };
