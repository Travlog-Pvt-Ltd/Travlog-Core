import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        shortIntro: {
            type: String,
            default: '',
            maxlength: 40,
        },
        token: {
            type: String,
            default: null,
        },
        deviceId: {
            type: String,
            default: null,
        },
        Mob: {
            type: String,
            default: null,
        },
        city: {
            type: String,
            default: null,
        },
        state: {
            type: String,
            default: null,
        },
        country: {
            type: String,
            default: null,
        },
        pincode: {
            type: String,
            default: null,
        },
        gender: {
            type: String,
            default: null,
        },
        DOB: {
            type: Date,
            default: null,
        },
        age: {
            type: Number,
            default: null,
        },
        about: {
            type: String,
            default: null,
        },
        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Follower',
            },
        ],
        followerCount: {
            type: Number,
            default: 0,
        },
        followings: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'UserInstance',
            },
        ],
        followingCount: {
            type: Number,
            default: 0,
        },
        visitors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'UserInstance',
            },
        ],
        visitorCount: {
            type: Number,
            default: 0,
        },
        organicVisitors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'OrganicUserInstance',
            },
        ],
        organicVisitorCount: {
            type: Number,
            default: 0,
        },
        blogs: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Blog',
            },
        ],
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Blog',
            },
        ],
        dislikes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Blog',
            },
        ],
        blogCount: {
            type: Number,
            default: 0,
        },
        impressions: {
            type: Number,
            default: null,
        },
        profileImage: {
            type: String,
            default: null,
        },
        profileLogo: {
            type: String,
            default: null,
        },
        bookmarks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'BlogInstance',
            },
        ],
        itenaries: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Itenary',
            },
        ],
        drafts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Draft',
            },
        ],
        notifications: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Notification',
            },
        ],
    },
    { timestamps: true }
);

const followerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        notify: Boolean,
    },
    { timestamps: true }
);

const userInstanceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

const organicUserInstanceSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
        },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

const Follower = mongoose.model('Follower', followerSchema);

const UserInstance = mongoose.model('UserInstance', userInstanceSchema);

const OrganicUserInstance = mongoose.model(
    'OrganicUserInstance',
    organicUserInstanceSchema
);

export { User, Follower, UserInstance, OrganicUserInstance };
