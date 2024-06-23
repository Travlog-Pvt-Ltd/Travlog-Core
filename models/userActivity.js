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
                set: (placeSearches) => [...new Set(placeSearches)],
            },
        ],
        activitySearches: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Activity',
                set: (activitySearches) => [...new Set(activitySearches)],
            },
        ],
    },
    { timestamps: true }
);

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

export default UserActivity;
