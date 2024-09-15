import Blog from '../../models/blog.js';
import LCEvent from '../../models/likeCommentEvent.js';
import UserActivity from '../../models/userActivity.js';
import Comment from '../../models/comment.js';
import redis from '../../config/redis.js';
import {
    commentFields,
    replyFields,
    deletedContent,
} from './utils/constants.js';

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
        });
        await Blog.findByIdAndUpdate(blog, {
            $push: { comments: newComment._id },
            $inc: { commentCount: 1 },
        });
        const commentEvent = await LCEvent.create({
            blogId: blog,
            isComment: true,
            commentId: newComment._id,
            content: content,
            onComment: false,
            isDislike: null,
        });
        const isUserActive = await UserActivity.findOne({ userId: req.userId });
        if (isUserActive) {
            await UserActivity.findByIdAndUpdate(isUserActive._id, {
                $push: { commentEvent: commentEvent._id },
            });
        } else {
            await UserActivity.create({
                userId: req.userId,
                commentEvent: [commentEvent._id],
            });
        }
        const data = await Comment.findById(newComment._id)
            .select('-likes -replies -dislikes')
            .populate('userId', '_id name profileLogo');
        res.status(201).json({ comment: data });
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
        });
        await Comment.findByIdAndUpdate(comment, {
            $push: { replies: newReply._id },
            $inc: { replyCount: 1 },
        });
        const newBlog = await Blog.findByIdAndUpdate(
            blog,
            { $inc: { commentCount: 1 } },
            { new: true }
        );
        const commentEvent = await LCEvent.create({
            blogId: blog,
            isComment: true,
            commentId: newReply._id,
            content: content,
            onComment: true,
            isDislike: null,
        });
        const isUserActive = await UserActivity.findOne({ userId: req.userId });
        if (isUserActive) {
            await UserActivity.findByIdAndUpdate(isUserActive._id, {
                $push: { commentEvent: commentEvent._id },
            });
        } else {
            await UserActivity.create({
                userId: req.userId,
                commentEvent: [commentEvent._id],
            });
        }
        const data = await Comment.findById(newReply._id)
            .select('-likes -replies -dislikes')
            .populate('userId', '_id name profileLogo');
        await redis.setEx(
            `blog_data#user:${req.userId}#blog:${newBlog._id}`,
            3600,
            JSON.stringify(newBlog)
        );
        res.status(201).json({ comment: data });
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
