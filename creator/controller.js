import mongoose from 'mongoose';
import { Blog } from '../blog/model.js';
import { User, Follower, UserInstance } from '../user/model.js';
import getRedisClient from '../redis/index.js';
import { updateUserInCache } from '../redis/utils.js';
import { notificationProducer } from '../notifications/producer.js';
import { creatorProducer } from './producer.js';
import { asyncControllerHandler } from '../common/middleware.js';

const moreFromAuthor = asyncControllerHandler(async (req, res) => {
    const author = req.params.authorId;
    const moreBlogs = await Blog.find({ author: author })
        .sort({ likeCount: -1 })
        .limit(3)
        .select(
            '_id title content author likeCount viewCount commentCount shareCount'
        )
        .populate('author', '_id name profileLogo followers');
    res.status(200).json(moreBlogs);
});

const follow = asyncControllerHandler(async (req, res) => {
    const creator = req.body.creatorId;
    const creatorObject = new mongoose.Types.ObjectId(creator);
    const user = await User.findById(req.userId).populate({
        path: 'followings',
        match: { userId: creatorObject },
    });
    if (user.followings.length > 0)
        return res
            .status(400)
            .json({ message: 'Already following the creator' });
    const [following, follower] = await Promise.all([
        UserInstance.create({
            userId: creator,
        }),
        Follower.create({
            userId: req.userId,
            notify: false,
        }),
    ]);
    const [newUser, _] = await Promise.all([
        User.findByIdAndUpdate(
            req.userId,
            { $push: { followings: following } },
            { new: true }
        )
            .select(
                '-password -token -deviceId -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
            )
            .populate('followings', '_id userId'),
        User.findByIdAndUpdate(creator, {
            $push: { followers: follower },
        }),
    ]);
    await creatorProducer.createFollowActivityProducer({
        userId: req.userId,
        creatorId: creator,
        type: 'follow',
    });
    await notificationProducer.createNotificationsProducer({
        creatorId: req.userId,
        type: 'follow',
        userId: creator,
    });
    updateUserInCache(newUser);
    res.status(201).json(newUser);
});

const unfollow = asyncControllerHandler(async (req, res) => {
    const creator = req.body.creatorId;
    const creatorObject = new mongoose.Types.ObjectId(creator);
    const userObject = new mongoose.Types.ObjectId(req.userId);
    const found = await User.findById(req.userId).populate('followings');
    const foundCreator = await User.findById(creator).populate('followers');
    if (found.followings && found.followings.length === 0) {
        return res
            .status(400)
            .json({ message: 'Not following the creator yet' });
    }
    let toDelete = [];
    found.followings.forEach((following) => {
        if (following.userId.equals(creatorObject))
            toDelete.push(following._id);
    });
    await UserInstance.deleteMany({ _id: { $in: toDelete } });
    const newUser = await User.findByIdAndUpdate(
        req.userId,
        {
            $pull: {
                followings: { $in: toDelete },
            },
            $inc: {
                followingCount: -1 * toDelete.length,
            },
        },
        { new: true }
    )
        .select(
            '-password -token -deviceId -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
        )
        .populate('followings', '_id userId');
    toDelete = [];
    foundCreator.followers.forEach((follower) => {
        if (follower.userId.equals(userObject)) toDelete.push(follower._id);
    });
    await Promise.all([
        Follower.deleteMany({ _id: { $in: toDelete } }),
        User.findByIdAndUpdate(
            creator,
            {
                $pull: {
                    followers: { $in: toDelete },
                },
                $inc: {
                    followerCount: -1 * toDelete.length,
                },
            },
            { new: true }
        ),
    ]);
    creatorProducer.createFollowActivityProducer({
        userId: req.userId,
        creatorId: creator,
        type: 'unfollow',
    });
    await notificationProducer.createNotificationsProducer({
        creatorId: req.userId,
        type: 'follow',
        userId: creator,
    });
    updateUserInCache(newUser);
    res.status(201).json(newUser);
});

const getCreatorDetails = asyncControllerHandler(async (req, res) => {
    const id = req.query.id;
    const redis = await getRedisClient();
    if (!id) {
        const cachedData = await redis.get(
            `creator_data#creator:${req.params.creatorId}`
        );
        if (cachedData) return res.status(200).json(JSON.parse(cachedData));
        const creator = await User.findById(req.params.creatorId)
            .select(
                '-password -token -followings -visitors -bookmarks -itenaries -drafts -notifications'
            )
            .populate(
                'blogs',
                '_id title content tags thumbnail commentCount likeCount shareCount viewCount'
            );
        await redis.setEx(
            `creator_data#creator:${req.params.creatorId}`,
            3600,
            JSON.stringify(creator)
        );
        res.status(201).json(creator);
    } else {
        const creator = await User.findById(req.params.creatorId).populate(
            'visitors'
        );
        const userObject = new mongoose.Types.ObjectId(id);
        let check = false;
        creator.visitors.forEach((item) => {
            if (item.userId.equals(userObject)) check = true;
        });
        if (check) {
            const cachedData = await redis.get(
                `creator_data#user:${id}#creator:${req.params.creatorId}`
            );
            if (cachedData) return res.status(200).json(JSON.parse(cachedData));
            const creator = await User.findById(req.params.creatorId)
                .select(
                    '-password -token -followings -visitors -bookmarks -itenaries -drafts -notifications'
                )
                .populate(
                    'blogs',
                    '_id title content tags thumbnail commentCount likeCount shareCount viewCount'
                );
            await redis.setEx(
                `creator_data#user:${id}#creator:${req.params.creatorId}`,
                3600,
                JSON.stringify(creator)
            );
            res.status(201).json(creator);
        } else {
            const instance = await UserInstance.create({ userId: id });
            const creator = await User.findByIdAndUpdate(
                req.params.creatorId,
                {
                    $push: { visitors: instance },
                    $inc: { visitorCount: 1 },
                },
                { new: true }
            )
                .select(
                    '-password -token -followings -visitors -bookmarks -itenaries -drafts -notifications'
                )
                .populate(
                    'blogs',
                    '_id title content tags system_tags thumbnail commentCount likeCount shareCount viewCount'
                );
            await redis.setEx(
                `creator_data#user:${id}#creator:${req.params.creatorId}`,
                3600,
                JSON.stringify(creator)
            );
            res.status(201).json(creator);
        }
    }
    //     if (!id) return res.status(401).json({ message: "UserId required!" })
    //     const creator = await User.findById(req.params.creatorId).populate("visitors organicVisitors")
    //     if (id.split("-")[0]!='Organic') {
    //         const foundUser = await User.findById(id)
    //         const userObject = new mongoose.Types.ObjectId(id)
    //         let check = false
    //         creator.visitors.forEach(item => {
    //             if (item.userId.equals(userObject)) check = true
    //         })
    //         if (check) {
    //             const creator = await User.findById(req.params.creatorId).select("-password -token -followings -visitors -organicVisitors -bookmarks -itenaries -drafts -notifications").populate("blogs", "_id title content tags system_tags thumbnail commentCount likeCount shareCount viewCount")
    //             res.status(201).json(creator)
    //         }
    //         else {
    //             check = false
    //             const toDelete = []
    //             const newOrganicInstance = []
    //             creator.organicVisitors.forEach(item => {
    //                 if (item.userId == foundUser.deviceId) {
    //                     check = true
    //                     toDelete.push(item)
    //                 }
    //                 else{
    //                     newOrganicInstance.push(item)
    //                 }
    //             })
    //             if (check) {
    //                 toDelete.forEach(async (el) => {
    //                     await OrganicUserInstance.findByIdAndDelete(el._id)
    //                 })
    //                 const instance = await UserInstance.create({ userId: id })
    //                 const creator = await User.findByIdAndUpdate(req.params.creatorId, { $push: { visitors: instance }, $set: {organicVisitors: newOrganicInstance}, $inc: { visitorCount: 1, organicVisitorCount: -1 } }, { new: true }).select("-password -token -followings -visitors -organicVisitors -bookmarks -itenaries -drafts -notifications").populate("blogs", "_id title content tags system_tags thumbnail commentCount likeCount shareCount viewCount")
    //                 res.status(201).json(creator)
    //             }
    //             else {
    //                 const instance = await UserInstance.create({ userId: id })
    //                 const creator = await User.findByIdAndUpdate(req.params.creatorId, { $push: { visitors: instance }, $inc: { visitorCount: 1 } }, { new: true }).select("-password -token -followings -visitors -organicVisitors -bookmarks -itenaries -drafts -notifications").populate("blogs", "_id title content tags system_tags thumbnail commentCount likeCount shareCount viewCount")
    //                 res.status(201).json(creator)
    //             }
    //         }
    //     }
    //     else {
    //         let check = false
    //         creator.organicVisitors.forEach(item => {
    //             if (item.userId == id) check = true
    //         })
    //         if (check) {
    //             const creator = await User.findById(req.params.creatorId).select("-password -token -followings -visitors -organicVisitors -bookmarks -itenaries -drafts -notifications").populate("blogs", "_id title content tags system_tags thumbnail commentCount likeCount shareCount viewCount")
    //             res.status(201).json(creator)
    //         }
    //         else {
    //             const organicInstance = await OrganicUserInstance.create({ userId: id })
    //             const creator = await User.findByIdAndUpdate(req.params.creatorId, { $push: { organicVisitors: organicInstance }, $inc: { organicVisitorCount: 1 } }, { new: true }).select("-password -token -followings -visitors -organicVisitors -bookmarks -itenaries -drafts -notifications").populate("blogs", "_id title content tags system_tags thumbnail commentCount likeCount shareCount viewCount")
    //             res.status(201).json(creator)
    //         }
    //     }
});

const subscribe = asyncControllerHandler(async (req, res) => {
    await Follower.findByIdAndUpdate(req.followerId, {
        $set: { notify: true },
    });
    res.status(201).json({ message: 'Subscribed' });
});

const unsubscribe = asyncControllerHandler(async (req, res) => {
    await Follower.findByIdAndUpdate(req.followerId, {
        $set: { notify: false },
    });
    res.status(201).json({ message: 'Unsubscribed' });
});

export {
    moreFromAuthor,
    follow,
    unfollow,
    getCreatorDetails,
    subscribe,
    unsubscribe,
};
