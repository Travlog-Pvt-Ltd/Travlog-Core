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
        found.likes.forEach((like) => {
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
            const toDelete = [];
            found.likes.forEach((like) => {
                if (like.userId.equals(userObject)) toDelete.push(like._id);
            });
            const [_a, newBlog] = await Promise.all([
                await UserInstance.deleteMany({ _id: { $in: toDelete } }),
                await Blog.findByIdAndUpdate(
                    blog,
                    { $pull: { likes: toDelete } },
                    { $inc: { likeCount: -1 * toDelete.length } },
                    { new: true }
                )
                    .select(
                        '_id title content author tags likeCount commentCount viewCount shareCount thumbnail createdAt updatedAt'
                    )
                    .populate('author', '_id name profileLogo profileImage')
                    .populate('tags.places', 'name')
                    .populate('tags.activities', 'name'),
            ]);
            const activity = await UserActivity.findOne({
                userId: req.userId,
            }).populate('likeEvent');
            const toDeleteEvents = [];
            activity.likeEvent.forEach((event) => {
                if (
                    event.blogId.equals(blogObject) &&
                    event.isComment === false &&
                    event.onComment === false &&
                    event.isDislike === false
                )
                    toDeleteEvents.push(event._id);
            });
            await Promise.all([
                LCEvent.deleteMany({ _id: { $in: toDeleteEvents } }),
                UserActivity.findByIdAndUpdate(activity._id, {
                    $pull: { likeEvent: { $in: toDeleteEvents } },
                }),
            ]);
            await updateUserInCache(user);
            await redis.setEx(
                `blog_data#user:${user._id}#blog:${newBlog._id}`,
                3600,
                JSON.stringify(newBlog)
            );
            res.status(201).json({ blog: newBlog, user: user });
        } else {
            check = false;
            found.dislikes.forEach((dislike) => {
                if (dislike.userId.equals(userObject)) check = true;
            });
            if (check) {
                await User.findByIdAndUpdate(req.userId, {
                    $pull: { dislikes: blog },
                });
                const newDislikes = [];
                const toDelete = [];
                found.dislikes.forEach((dislike) => {
                    if (dislike.userId.equals(userObject))
                        toDelete.push(dislike._id);
                });
                await Promise.all([
                    UserInstance.deleteMany({ _id: { $in: toDelete } }),
                    Blog.findByIdAndUpdate(blog, {
                        $pull: {
                            dislikes: { $in: toDelete },
                        },
                        $inc: {
                            dislikeCount: -1 * toDelete.length,
                        },
                    }),
                ]);
                const activity = await UserActivity.findOne({
                    userId: req.userId,
                }).populate('dislikeEvent');
                const toDeleteEvents = [];
                activity.dislikeEvent.forEach((event) => {
                    if (
                        event.blogId.equals(blogObject) &&
                        event.isComment === false &&
                        event.onComment === false &&
                        event.isDislike === true
                    )
                        toDeleteEvents.push(event._id);
                });
                await Promise.all([
                    LCEvent.deleteMany({ _id: { $in: toDeleteEvents } }),
                    UserActivity.findByIdAndUpdate(activity._id, {
                        $pull: { dislikeEvent: { $in: toDeleteEvents } },
                    }),
                ]);
            }
            const [user, userInstance] = await Promise.all([
                User.findByIdAndUpdate(
                    req.userId,
                    { $push: { likes: blog } },
                    { new: true }
                )
                    .select(
                        '-password -deviceId -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
                    )
                    .populate('followings', '_id userId'),
                UserInstance.create({
                    userId: req.userId,
                }),
            ]);
            const [newBlog, likeEvent, userActivityCount] = await Promise.all([
                Blog.findByIdAndUpdate(
                    blog,
                    {
                        $push: { likes: userInstance._id },
                        $inc: { likeCount: 1 },
                    },
                    { new: true }
                )
                    .select(
                        '_id title content author tags likeCount commentCount viewCount shareCount thumbnail createdAt updatedAt'
                    )
                    .populate('author', '_id name profileLogo profileImage')
                    .populate('tags.places', 'name')
                    .populate('tags.activities', 'name'),
                LCEvent.create({
                    blogId: blog,
                    isComment: false,
                    commentId: null,
                    content: null,
                    onComment: false,
                    isDislike: false,
                }),
                UserActivity.countDocuments({
                    userId: req.userId,
                }),
            ]);
            if (userActivityCount > 0) {
                await UserActivity.findByIdAndUpdate(
                    { userId: req.userId },
                    {
                        $push: { likeEvent: likeEvent._id },
                    }
                );
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
        found.dislikes.forEach((dislike) => {
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
            const toDelete = [];
            found.dislikes.forEach((dislike) => {
                if (dislike.userId.equals(userObject))
                    toDelete.push(dislike._id);
            });
            const [_a, newBlog] = await Promise.all([
                UserInstance.deleteMany({ _id: { $in: toDelete } }),
                Blog.findByIdAndUpdate(
                    blog,
                    {
                        $pull: { dislikes: { $in: toDelete } },
                        $inc: { dislikeCount: -1 * toDelete.length },
                    },
                    { new: true }
                )
                    .select(
                        '_id title content author tags likeCount commentCount viewCount shareCount thumbnail createdAt updatedAt'
                    )
                    .populate('author', '_id name profileLogo profileImage')
                    .populate('tags.places', 'name')
                    .populate('tags.activities', 'name'),
            ]);
            const activity = await UserActivity.findOne({
                userId: req.userId,
            }).populate('dislikeEvent');
            const toDeleteEvents = [];
            activity.dislikeEvent.forEach((event) => {
                if (
                    event.blogId.equals(blogObject) &&
                    event.isComment === false &&
                    event.onComment === false &&
                    event.isDislike === true
                )
                    toDeleteEvents.push(event._id);
            });
            await Promise.all([
                LCEvent.deleteMany({ _id: { $in: toDeleteEvents } }),
                UserActivity.findByIdAndUpdate(activity._id, {
                    $pull: { dislikeEvent: { $in: toDeleteEvents } },
                }),
            ]);
            await updateUserInCache(user);
            await redis.setEx(
                `blog_data#user:${user._id}#blog:${newBlog._id}`,
                3600,
                JSON.stringify(newBlog)
            );
            res.status(201).json({ blog: newBlog, user: user });
        } else {
            check = false;
            found.likes.forEach((like) => {
                if (like.userId.equals(userObject)) check = true;
            });
            if (check) {
                await User.findByIdAndUpdate(req.userId, {
                    $pull: { likes: blog },
                });
                const newLikes = [];
                const toDelete = [];
                found.likes.forEach((like) => {
                    if (like.userId.equals(userObject)) toDelete.push(like._id);
                });
                await Promise.all([
                    UserInstance.deleteMany({ _id: { $in: toDelete } }),
                    Blog.findByIdAndUpdate(blog, {
                        $pull: { likes: { $in: toDelete } },
                        $inc: { likeCount: -1 * toDelete.length },
                    }),
                ]);
                const activity = await UserActivity.findOne({
                    userId: req.userId,
                }).populate('likeEvent');
                const newEvents = [];
                const toDeleteEvents = [];
                activity.likeEvent.forEach((event) => {
                    if (
                        event.blogId.equals(blogObject) &&
                        event.isComment === false &&
                        event.onComment === false &&
                        event.isDislike === false
                    )
                        toDeleteEvents.push(event._id);
                });
                await Promise.all([
                    LCEvent.deleteMany({ _id: { $in: toDeleteEvents } }),
                    UserActivity.findByIdAndUpdate(activity._id, {
                        $pull: { likeEvent: { $in: toDeleteEvents } },
                    }),
                ]);
            }
            const [user, userInstance] = await Promise.all([
                User.findByIdAndUpdate(
                    req.userId,
                    { $push: { dislikes: blog } },
                    { new: true }
                )
                    .select(
                        '-password -deviceId -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
                    )
                    .populate('followings', '_id userId'),
                UserInstance.create({
                    userId: req.userId,
                }),
            ]);
            const [newBlog, dislikeEvent, userActivityCount] =
                await Promise.all([
                    Blog.findByIdAndUpdate(
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
                        .populate('tags.activities', 'name'),
                    LCEvent.create({
                        blogId: blog,
                        isComment: false,
                        commentId: null,
                        content: null,
                        onComment: false,
                        isDislike: true,
                    }),
                    UserActivity.countDocuments({ userId: req.userId }),
                ]);
            if (userActivityCount > 0)
                await UserActivity.findByIdAndUpdate(
                    { userId: req.userId },
                    {
                        $push: { dislikeEvent: dislikeEvent._id },
                    }
                );
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
        found.likes.forEach((like) => {
            if (like.userId.equals(userObject)) check = true;
        });
        if (check) {
            const toDelete = [];
            found.likes.forEach((like) => {
                if (like.userId.equals(userObject)) toDelete.push(like._id);
            });
            const [_a, newComment] = await Promise.all([
                UserInstance.deleteMany({ _id: { $in: toDelete } }),
                Comment.findByIdAndUpdate(
                    comment,
                    { $pull: { likes: { $in: toDelete } } },
                    { $inc: { likeCount: -1 * toDelete.length } },
                    { new: true }
                ),
            ]);
            const activity = await UserActivity.findOne({
                userId: req.userId,
            }).populate('likeEvent');
            const toDeleteEvents = [];
            activity.likeEvent.forEach((event) => {
                if (
                    event.blogId.equals(blogObject) &&
                    event.isComment === false &&
                    event.commentId.equals(commentObject) &&
                    event.onComment === true &&
                    event.isDislike === false
                )
                    toDeleteEvents.push(event._id);
            });
            await Promise.all([
                LCEvent.toDelete({ _id: { $in: toDeleteEvents } }),
                UserActivity.findByIdAndUpdate(activity._id, {
                    $pull: { likeEvent: { $in: toDeleteEvents } },
                }),
            ]);
            res.status(201).json(newComment);
        } else {
            const userInstance = await UserInstance.create({
                userId: req.userId,
            });
            const [newComment, likeEvent, userActivityCount] =
                await Promise.all([
                    Comment.findByIdAndUpdate(
                        comment,
                        {
                            $push: { likes: userInstance._id },
                            $inc: { likeCount: 1 },
                        },
                        { new: true }
                    ),
                    LCEvent.create({
                        blogId: blog,
                        isComment: false,
                        commentId: comment,
                        content: null,
                        onComment: true,
                        isDislike: false,
                    }),
                    UserActivity.countDocuments({ userId: req.userId }),
                ]);
            if (userActivityCount > 0) {
                await UserActivity.findByIdAndUpdate(
                    { userId: req.userId },
                    {
                        $push: { likeEvent: likeEvent._id },
                    }
                );
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
        found.dislikes.forEach((dislike) => {
            if (dislike.userId.equals(userObject)) check = true;
        });
        if (check) {
            const toDelete = [];
            found.dislikes.forEach((dislike) => {
                if (dislike.userId.equals(userObject))
                    toDelete.push(dislike._id);
            });
            const [_a, newComment] = await Promise.all([
                UserInstance.deleteMany({ _id: { $in: toDelete } }),
                Comment.findByIdAndUpdate(
                    comment,
                    {
                        $pull: { dislikes: { $in: toDelete } },
                        $inc: { dislikeCount: -1 * toDelete.length },
                    },
                    { new: true }
                ),
            ]);
            const activity = await UserActivity.findOne({
                userId: req.userId,
            }).populate('dislikeEvent');
            const toDeleteEvents = [];
            activity.dislikeEvent.forEach((event) => {
                if (
                    event.blogId.equals(blogObject) &&
                    event.isComment === false &&
                    event.commentId.equals(commentObject) &&
                    event.onComment === true &&
                    event.isDislike === true
                )
                    toDeleteEvents.push(event._id);
            });
            await Promise.all([
                LCEvent.deleteMany({ _id: { $in: toDeleteEvents } }),
                UserActivity.findByIdAndUpdate(activity._id, {
                    $pull: { dislikeEvent: { $in: toDeleteEvents } },
                }),
            ]);
            res.status(201).json(newComment);
        } else {
            const userInstance = await UserInstance.create({
                userId: req.userId,
            });
            const [newComment, dislikeEvent, userActivityCount] =
                await Promise.all([
                    Comment.findByIdAndUpdate(
                        comment,
                        {
                            $push: { dislikes: userInstance._id },
                            $inc: { dislikeCount: 1 },
                        },
                        { new: true }
                    ),
                    LCEvent.create({
                        blogId: blog,
                        isComment: false,
                        commentId: comment,
                        content: null,
                        onComment: true,
                        isDislike: true,
                    }),
                    UserActivity.countDocuments({
                        userId: req.userId,
                    }),
                ]);
            if (userActivityCount > 0) {
                await UserActivity.findByIdAndUpdate(
                    { userId: req.userId },
                    {
                        $push: { dislikeEvent: dislikeEvent._id },
                    }
                );
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
