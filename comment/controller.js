import { Blog } from '../blog/model.js';
import Comment from './model.js';
import getRedisClient from '../redis/index.js';
import { commentFields, replyFields, deletedContent } from './constants.js';
import { commentProducer } from './producer.js';
import { asyncControllerHandler } from '../common/middleware.js';

const getComments = asyncControllerHandler(async (req, res) => {
    const { id, type, limit = 10, skip = 0 } = req.query;
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
});

const commentOnBlog = asyncControllerHandler(async (req, res) => {
    const blog = req.body.blog;
    const content = req.body.content;
    const createdComment = await Comment.create({
        userId: req.userId,
        content: content,
        isReply: false,
        blog: blog,
    });
    const newComment = await Comment.findById(createdComment._id)
        .select('-likes -replies -dislikes')
        .populate('userId', '_id name profileLogo');
    await Blog.findByIdAndUpdate(blog, {
        $push: { comments: newComment._id },
        $inc: { commentCount: 1 },
    });
    await commentProducer.createCommentActivityProducer({
        blogId: blog,
        isComment: true,
        commentId: newComment._id,
        onComment: false,
        content,
        userId: req.userId,
    });
    await commentProducer.commentNotificationProducer({
        creatorId: req.userId,
        type: 'comment',
        blogId: blog,
        commentId: newComment._id,
    });
    res.status(201).json({ comment: newComment });
});

const replyOnComment = asyncControllerHandler(async (req, res) => {
    const { blog, commentId: comment, content } = req.body;
    const redis = await getRedisClient();
    const createdReply = await Comment.create({
        userId: req.userId,
        content: content,
        isReply: true,
        blog: blog,
        parent: comment,
    });
    const newReply = await Comment.findById(createdReply._id)
        .select('-likes -replies -dislikes')
        .populate('userId', '_id name profileLogo');
    const [_b, newBlog] = await Promise.all([
        Comment.findByIdAndUpdate(comment, {
            $push: { replies: newReply._id },
            $inc: { replyCount: 1 },
        }),
        Blog.findByIdAndUpdate(
            blog,
            { $inc: { commentCount: 1 } },
            { new: true }
        ),
    ]);
    await commentProducer.createCommentActivityProducer({
        blogId: blog,
        isComment: true,
        commentId: newReply._id,
        onComment: true,
        content,
        userId: req.userId,
    });
    /*
            TODO [Aryan | 2024-12-14]
            - How to find the parent comment in reply activity? Either add that in schema or join data during api call
        */
    await redis.setEx(
        `blog_data#user:${req.userId}#blog:${newBlog._id}`,
        3600,
        JSON.stringify(newBlog)
    );
    await commentProducer.commentNotificationProducer({
        creatorId: req.userId,
        type: 'reply',
        blogId: blog,
        commentId: comment,
        replyId: newReply._id,
    });
    res.status(201).json({ comment: newReply });
});

const deleteComment = asyncControllerHandler(async (req, res) => {
    const { comment } = req.params;
    const result = await Comment.findByIdAndUpdate(
        comment,
        { content: deletedContent, deleted: true },
        { new: true }
    )
        .select('-likes -replies -dislikes')
        .populate('userId', '_id name profileLogo');
    res.status(201).json({
        message: 'Comment deleted!',
        comment: result,
    });
});

const editComment = asyncControllerHandler(async (req, res) => {
    const { commentId, content } = req.body;
    const newComment = await Comment.findByIdAndUpdate(
        commentId,
        { $set: { content: content, edited: true } },
        { new: true }
    )
        .select('-likes -replies -dislikes')
        .populate('userId', '_id name profileLogo');
    await commentProducer.editedCommentActivityProducer({
        content: content,
        commentId,
        userId: req.userId,
    });
    res.status(201).json({ comment: newComment });
});

export {
    commentOnBlog,
    replyOnComment,
    getComments,
    deleteComment,
    editComment,
};
