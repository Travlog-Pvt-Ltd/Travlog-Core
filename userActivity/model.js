import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        followEvent: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'UserInstance',
            },
        ],
        unfollowEvent: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'UserInstance',
            },
        ],
        readEvent: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'BlogInstance',
            },
        ],
        likeEvent: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'LCEvent',
            },
        ],
        dislikeEvent: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'LCEvent',
            },
        ],
        commentEvent: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'LCEvent',
            },
        ],
        placeSearches: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Place',
            },
        ],
        activitySearches: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Activity',
            },
        ],
    },
    { timestamps: true }
);

const likeCommentEventSchema = new mongoose.Schema(
    {
        blogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog',
        },
        isComment: Boolean,
        commentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        },
        content: String,
        onComment: Boolean,
        isDislike: Boolean,
    },
    { timestamps: true }
);

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

const LCEvent = mongoose.model('LCEvent', likeCommentEventSchema);

export { UserActivity, LCEvent };
