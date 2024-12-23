import mongoose from 'mongoose';
import { UserActivity, LCEvent } from '../userActivity/model.js';
import { commentProducer } from './producer.js';

const commentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        content: String,
        isReply: Boolean,
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        },
        edited: {
            type: Boolean,
            default: false,
        },
        deleted: {
            type: Boolean,
            default: false,
        },
        toDelete: {
            type: Boolean,
            default: false,
        },
        markedForDeletionAt: Date,
        blog: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog',
        },
        replies: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comment',
            },
        ],
        replyCount: {
            type: Number,
            default: 0,
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
    },
    { timestamps: true }
);

commentSchema.post('findOneAndUpdate', async function (doc, next) {
    if (doc.deleted && doc.replies?.length) {
        await commentProducer.deleteCommentProducer(doc);
    }
    next();
});

commentSchema.pre('deleteOne', async function (next) {
    try {
        const commentId = this.getQuery()._id;
        const comment = await Comment.findById(commentId);
        await Comment.findByIdAndUpdate(comment?.parent, {
            $pull: { replies: commentId },
            $inc: { replyCount: -1 },
        });
        next();
    } catch (err) {
        throw err;
    }
});

commentSchema.post('deleteOne', async function (doc, next) {
    try {
        const commentId = this.getQuery()._id;
        const events = await LCEvent.find({ commentId });
        await LCEvent.deleteMany({ commentId });
        await UserActivity.updateMany(
            {
                $or: [
                    { likeEvent: { $in: events } },
                    { dislikeEvent: { $in: events } },
                    { commentEvent: { $in: events } },
                ],
            },
            {
                $pull: {
                    likeEvent: { $in: events },
                    dislikeEvent: { $in: events },
                    commentEvent: { $in: events },
                },
            }
        );
        next();
    } catch (err) {
        throw err;
    }
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
