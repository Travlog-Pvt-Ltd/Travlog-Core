import mongoose from 'mongoose';
import { Blog } from '../blog/model.js';
import { User, Follower, UserInstance } from '../user/model.js';
import redis from '../redis/index.js';
import { updateUserInCache } from '../redis/utils.js';
import { notificationProducer } from '../notifications/producer.js';
import { creatorProducer } from './producer.js';

const moreFromAuthor = async (req, res) => {
    const author = req.params.authorId;
    try {
        const moreBlogs = await Blog.find({ author: author })
            .sort({ likes: -1 })
            .limit(3)
            .select(
                '_id title content author likeCount viewCount commentCount shareCount'
            )
            .populate('author', '_id name profileLogo followers');
        res.status(200).json(moreBlogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const follow = async (req, res) => {
    const creator = req.body.creatorId;
    const creatorObject = new mongoose.Types.ObjectId(creator);
    try {
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
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const unfollow = async (req, res) => {
    const creator = req.body.creatorId;
    const creatorObject = new mongoose.Types.ObjectId(creator);
    const userObject = new mongoose.Types.ObjectId(req.userId);
    try {
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
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getCreatorDetails = async (req, res) => {
    const id = req.query.id;
    try {
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
                if (cachedData)
                    return res.status(200).json(JSON.parse(cachedData));
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
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const subscribe = async (req, res) => {
    try {
        await Follower.findByIdAndUpdate(req.followerId, {
            $set: { notify: true },
        });
        res.status(201).json({ message: 'Subscribed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const unsubscribe = async (req, res) => {
    try {
        await Follower.findByIdAndUpdate(req.followerId, {
            $set: { notify: false },
        });
        res.status(201).json({ message: 'Unsubscribed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export {
    moreFromAuthor,
    follow,
    unfollow,
    getCreatorDetails,
    subscribe,
    unsubscribe,
};
