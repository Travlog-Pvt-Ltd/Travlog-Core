import mongoose from 'mongoose';
import { Blog } from '../blog/model.js';
import Comment from '../comment/model.js';
import { User, UserInstance } from '../user/model.js';
import getRedisClient from '../redis/index.js';
import { updateUserInCache } from '../redis/utils.js';
import { likeProducer } from './producer.js';
import { notificationProducer } from '../notifications/producer.js';
import { asyncControllerHandler } from '../common/middleware.js';

const likeBlog = asyncControllerHandler(async (req, res) => {
    const blog = req.body.blogId;
    const userObject = new mongoose.Types.ObjectId(req.userId);
    const redis = await getRedisClient();
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
            UserInstance.deleteMany({ _id: { $in: toDelete } }),
            Blog.findByIdAndUpdate(
                blog,
                {
                    $pull: { likes: { $in: toDelete } },
                    $inc: { likeCount: -1 * toDelete.length },
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
        await likeProducer.updateBlogLDActivityProducer({
            blogId: blog,
            userId: req.userId,
            type: 'like',
            create: false,
            clean: true,
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
        found.dislikes.forEach((dislike) => {
            if (dislike.userId.equals(userObject)) check = true;
        });
        if (check) {
            await User.findByIdAndUpdate(req.userId, {
                $pull: { dislikes: blog },
            });
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
            await likeProducer.updateBlogLDActivityProducer({
                blogId: blog,
                userId: req.userId,
                type: 'dislike',
                create: false,
                clean: true,
            });
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
        const newBlog = await Blog.findByIdAndUpdate(
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
            .populate('tags.activities', 'name');
        await likeProducer.updateBlogLDActivityProducer({
            blogId: blog,
            userId: req.userId,
            type: 'like',
            create: true,
            clean: false,
        });
        await likeProducer.blogLDNotificationProducer({
            creatorId: req.userId,
            notificationType: 'like',
            blogId: blog,
        });
        await updateUserInCache(user);
        await redis.setEx(
            `blog_data#user:${user._id}#blog:${newBlog._id}`,
            3600,
            JSON.stringify(newBlog)
        );
        res.status(201).json({ blog: newBlog, user: user });
    }
});

const dislikeBlog = asyncControllerHandler(async (req, res) => {
    const blog = req.body.blogId;
    const userObject = new mongoose.Types.ObjectId(req.userId);
    const redis = await getRedisClient();
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
            if (dislike.userId.equals(userObject)) toDelete.push(dislike._id);
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
        await likeProducer.updateBlogLDActivityProducer({
            blogId: blog,
            userId: req.userId,
            type: 'dislike',
            create: false,
            clean: true,
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
        found.likes.forEach((like) => {
            if (like.userId.equals(userObject)) check = true;
        });
        if (check) {
            await User.findByIdAndUpdate(req.userId, {
                $pull: { likes: blog },
            });
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
            await likeProducer.updateBlogLDActivityProducer({
                blogId: blog,
                userId: req.userId,
                type: 'like',
                create: false,
                clean: true,
            });
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
        await likeProducer.updateBlogLDActivityProducer({
            blogId: blog,
            userId: req.userId,
            type: 'dislike',
            create: true,
            clean: false,
        });
        await likeProducer.blogLDNotificationProducer({
            creatorId: req.userId,
            notificationType: 'dislike',
            blogId: blog,
        });
        await updateUserInCache(user);
        await redis.setEx(
            `blog_data#user:${user._id}#blog:${newBlog._id}`,
            3600,
            JSON.stringify(newBlog)
        );
        res.status(201).json({ blog: newBlog, user: user });
    }
});

const likeComment = asyncControllerHandler(async (req, res) => {
    const { commentId: comment, blog } = req.body;
    const userObject = new mongoose.Types.ObjectId(req.userId);
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
        await likeProducer.updateCommentLDActivityProducer({
            blogId: blog,
            commentId: comment,
            userId: req.userId,
            type: 'like',
            create: false,
            clean: true,
        });
        res.status(201).json(newComment);
    } else {
        /*
                TODO [Aryan | 2024-09-28]
                - Handle the case where user has liked comment before
            */
        const userInstance = await UserInstance.create({
            userId: req.userId,
        });
        const newComment = await Comment.findByIdAndUpdate(
            comment,
            {
                $push: { likes: userInstance._id },
                $inc: { likeCount: 1 },
            },
            { new: true }
        );
        await likeProducer.updateCommentLDActivityProducer({
            blogId: blog,
            commentId: comment,
            userId: req.userId,
            type: 'like',
            create: true,
            clean: false,
        });
        await notificationProducer.createNotificationsProducer({
            creatorId: req.userId,
            userId: newComment.userId,
            notificationType: 'like',
            commentId: comment,
            blogId: blog,
        });
        res.status(201).json(newComment);
    }
});

const dislikeComment = asyncControllerHandler(async (req, res) => {
    const { commentId: comment, blog } = req.body;
    const userObject = new mongoose.Types.ObjectId(req.userId);
    const found = await Comment.findById(comment).populate('dislikes');
    let check = false;
    found.dislikes.forEach((dislike) => {
        if (dislike.userId.equals(userObject)) check = true;
    });
    if (check) {
        const toDelete = [];
        found.dislikes.forEach((dislike) => {
            if (dislike.userId.equals(userObject)) toDelete.push(dislike._id);
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
        await likeProducer.updateCommentLDActivityProducer({
            blogId: blog,
            commentId: comment,
            userId: req.userId,
            type: 'dislike',
            create: false,
            clean: true,
        });
        res.status(201).json(newComment);
    } else {
        /*
                TODO [Aryan | 2024-09-28]
                - Handle the case where user has liked comment before
            */
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
        await likeProducer.updateCommentLDActivityProducer({
            blogId: blog,
            commentId: comment,
            userId: req.userId,
            type: 'dislike',
            create: true,
            clean: false,
        });
        await notificationProducer.createNotificationsProducer({
            creatorId: req.userId,
            userId: newComment.userId,
            notificationType: 'dislike',
            commentId: comment,
            blogId: blog,
        });
        res.status(201).json(newComment);
    }
});

export { likeBlog, dislikeBlog, likeComment, dislikeComment };
