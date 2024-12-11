import { Blog } from '../blog/model.js';
import { UserActivity, LCEvent } from '../userActivity/model.js';
import Comment from './model.js';
import redis from '../redis/index.js';
import { commentFields, replyFields, deletedContent } from './constants.js';
import { commentNotificationProducer } from './producer.js';

const getComments = async (req, res) => {
    const { id, type, limit = 10, skip = 0 } = req.query;
    try {
        if (type == 0) {
            const foundBlog = await Blog.findById(id).populate({
                ...commentFields,
                options: { ...commentFields.options, limit: limit, skip: skip },
            });
            res.status(201).json({
                comment: foundBlog.comments,
                skip: Number(skip + limit),
                limit: limit,
            });
        } else {
            const foundComment = await Comment.findById(id).populate({
                ...replyFields,
                options: { ...replyFields.options, limit: limit, skip: skip },
            });
            res.status(201).json({
                comment: foundComment.replies,
                skip: Number(skip + limit),
            });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const commentOnBlog = async (req, res) => {
    const blog = req.body.blog;
    const content = req.body.content;
    try {
        const newComment = await Comment.create({
            userId: req.userId,
            content: content,
            isReply: false,
            blog: blog,
        })
            .select('-likes -replies -dislikes')
            .populate('userId', '_id name profileLogo');
        const [_a, commentEvent, userActivityCount] = await Promise.all([
            Blog.findByIdAndUpdate(blog, {
                $push: { comments: newComment._id },
                $inc: { commentCount: 1 },
            }),
            LCEvent.create({
                blogId: blog,
                isComment: true,
                commentId: newComment._id,
                content: content,
                onComment: false,
                isDislike: null,
            }),
            UserActivity.countDocuments({ userId: req.userId }),
        ]);
        if (userActivityCount > 0) {
            await UserActivity.findOneAndUpdate(
                { userId: req.userId },
                {
                    $push: { commentEvent: commentEvent._id },
                }
            );
        } else {
            await UserActivity.create({
                userId: req.userId,
                commentEvent: [commentEvent._id],
            });
        }
        await commentNotificationProducer({
            creatorId: req.userId,
            type: 'comment',
            blogId: blog,
            commentId: newComment._id,
        });
        res.status(201).json({ comment: newComment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const replyOnComment = async (req, res) => {
    const { blog, comment, content } = req.body;
    try {
        const newReply = await Comment.create({
            userId: req.userId,
            content: content,
            isReply: true,
            blog: blog,
            parent: comment,
        })
            .select('-likes -replies -dislikes')
            .populate('userId', '_id name profileLogo');
        const [_b, newBlog, commentEvent, userActivityCount] =
            await Promise.all([
                Comment.findByIdAndUpdate(comment, {
                    $push: { replies: newReply._id },
                    $inc: { replyCount: 1 },
                }),
                Blog.findByIdAndUpdate(
                    blog,
                    { $inc: { commentCount: 1 } },
                    { new: true }
                ),
                LCEvent.create({
                    blogId: blog,
                    isComment: true,
                    commentId: newReply._id,
                    content: content,
                    onComment: true,
                    isDislike: null,
                }),
                UserActivity.countDocuments({ userId: req.userId }),
            ]);
        if (userActivityCount > 0) {
            await UserActivity.findOneAndUpdate(
                { userId: req.userId },
                {
                    $push: { commentEvent: commentEvent._id },
                }
            );
        } else {
            await UserActivity.create({
                userId: req.userId,
                commentEvent: [commentEvent._id],
            });
        }
        await redis.setEx(
            `blog_data#user:${req.userId}#blog:${newBlog._id}`,
            3600,
            JSON.stringify(newBlog)
        );
        await commentNotificationProducer({
            creatorId: req.userId,
            type: 'reply',
            blogId: blog,
            commentId: comment,
            replyId: newReply._id,
        });
        res.status(201).json({ comment: newReply });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { comment } = req.params;
        const result = await Comment.findByIdAndUpdate(
            comment,
            { content: deletedContent, deleted: true },
            { new: true }
        );
        res.status(201).json({
            message: 'Comment marked for deletion!',
            data: result,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const editComment = async (req, res) => {
    const { commentId, content } = req.body;
    try {
        const newComment = await Comment.findByIdAndUpdate(
            commentId,
            { $set: { content: content, edited: true } },
            { new: true }
        )
            .select('-likes -replies -dislikes')
            .populate('userId', '_id name profileLogo');
        res.status(201).json({ comment: newComment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export {
    commentOnBlog,
    replyOnComment,
    getComments,
    deleteComment,
    editComment,
};
