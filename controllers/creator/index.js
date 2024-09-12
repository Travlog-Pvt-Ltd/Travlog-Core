import mongoose from 'mongoose';
import Blog from '@models/blog.js';
import Follower from '@models/follower.js';
import User from '@models/user.js';
import UserActivity from '@models/userActivity.js';
import UserInstance from '@models/userInstance.js';
import OrganicUserInstance from '@models/organicUserInstance.js';
import redis, { updateUserInCache } from '@config/redis.js';

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
        const following = await UserInstance.create({
            userId: creator,
        });
        const newUser = await User.findByIdAndUpdate(
            req.userId,
            { $push: { followings: following } },
            { new: true }
        )
            .select(
                '-password -token -deviceId -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
            )
            .populate('followings', '_id userId');
        const follower = await Follower.create({
            userId: req.userId,
            notify: false,
        });
        await User.findByIdAndUpdate(creator, {
            $push: { followers: follower },
        });
        const activity = await UserActivity.findOne({
            userId: req.userId,
        }).populate('followEvent');
        const newEvents = [];
        const toDeleteEvents = [];
        activity.followEvent.map((event) => {
            if (!event.userId.equals(creatorObject)) newEvents.push(event);
            else toDeleteEvents.push(event);
        });
        toDeleteEvents.forEach(async (el) => {
            await UserInstance.findByIdAndDelete(el._id);
        });
        const instance = await UserInstance.create({
            userId: creator,
        });
        newEvents.push(instance);
        await UserActivity.findByIdAndUpdate(activity._id, {
            $set: { followEvent: newEvents },
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
        const newFollowing = [];
        let toDelete = [];
        found.followings.map((following) => {
            if (!following.userId.equals(creatorObject))
                newFollowing.push(following);
            else toDelete.push(following);
        });
        toDelete.forEach(async (el) => {
            await UserInstance.findByIdAndDelete(el._id);
        });
        const newUser = await User.findByIdAndUpdate(
            req.userId,
            {
                $set: {
                    followings: newFollowing,
                    followingCount: newFollowing.length,
                },
            },
            { new: true }
        )
            .select(
                '-password -token -deviceId -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
            )
            .populate('followings', '_id userId');
        const foundCreator = await User.findById(creator).populate('followers');
        const newFollowers = [];
        toDelete = [];
        foundCreator.followers.map((follower) => {
            if (!follower.userId.equals(userObject))
                newFollowers.push(follower);
            else toDelete.push(follower);
        });
        toDelete.forEach(async (el) => {
            await Follower.findByIdAndDelete(el._id);
        });
        await User.findByIdAndUpdate(
            creator,
            {
                $set: {
                    followers: newFollowers,
                    followerCount: newFollowers.length,
                },
            },
            { new: true }
        );
        const activity = await UserActivity.findOne({
            userId: req.userId,
        }).populate('unfollowEvent');
        const newEvents = [];
        const toDeleteEvents = [];
        activity.unfollowEvent.map((event) => {
            if (!event.userId.equals(creatorObject)) newEvents.push(event);
            else toDeleteEvents.push(event);
        });
        toDeleteEvents.forEach(async (el) => {
            await UserInstance.findByIdAndDelete(el._id);
        });
        const instance = await UserInstance.create({
            userId: creator,
        });
        newEvents.push(instance);
        await UserActivity.findByIdAndUpdate(activity._id, {
            $set: { unfollowEvent: newEvents },
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
            creator.visitors.map((item) => {
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
        //         creator.visitors.map(item => {
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
        //             creator.organicVisitors.map(item => {
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
        //         creator.organicVisitors.map(item => {
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

export { moreFromAuthor, follow, unfollow, getCreatorDetails };
