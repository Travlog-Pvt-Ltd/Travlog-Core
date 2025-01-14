import mongoose from 'mongoose';

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
            index: true,
        },
        edited: {
            type: Boolean,
            default: false,
        },
        deleted: {
            type: Boolean,
            default: false,
        },
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

commentSchema.index({ parent: 1, _id: 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
