import mongoose from "mongoose"
import Blog from "../../models/blog.js"
import Follower from "../../models/follower.js"
import User from "../../models/user.js"
import UserActivity from "../../models/userActivity.js"
import UserInstance from "../../models/userInstance.js"


const moreFromAuthor = async (req, res) => {
    const author = req.params.authorId
    try {
        const moreBlogs = await Blog.find({ author: author }).sort({ likes: -1 }).limit(3).populate("author", "_id name profileLogo followers")
        res.status(200).json(moreBlogs)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const follow = async (req, res) => {
    const creator = req.body.creatorId;
    const creatorObject = new mongoose.Types.ObjectId(creator)
    try {
        // Adding creator in user's following list
        const following = await UserInstance.create({
            userId:creator,
        })
        const newUser = await User.findByIdAndUpdate(req.userId, { $push: { followings: following } }, { new: true })

        // Adding user in creator's followers list
        const follower = await Follower.create({
            userId:req.userId,
            notify: false
        })
        await User.findByIdAndUpdate(creator, { $push: { followers: follower } })

        // Updating user activity by removing all the previous follow events with the creator and adding a new follow event.
        const activity = await UserActivity.findOne({ userId: req.userId }).populate("followEvent")
        const newEvents = []
        const toDeleteEvents = []
        activity.followEvent.map(event => {
            if (!event.userId.equals(creatorObject)) newEvents.push(event)
            else toDeleteEvents.push(event)
        })
        toDeleteEvents.forEach(async (el) => {
            await UserInstance.findByIdAndDelete(el._id)
        })
        const instance = await UserInstance.create({
            userId: creator
        })
        newEvents.push(instance)
        await UserActivity.findByIdAndUpdate(activity._id, { $set: { followEvent : newEvents }})
        res.status(201).json(newUser)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const unfollow = async (req, res) => {
    const creator = req.body.creatorId;
    const creatorObject = new mongoose.Types.ObjectId(creator)
    const userObject = new mongoose.Types.ObjectId(req.userId)
    try {
        // Removing creator from user's followings list
        const found = await User.findById(req.userId).populate("followings")
        const newFollowing = []
        let toDelete = []
        found.followings.map(following => {
            if (!following.userId.equals(creatorObject)) newFollowing.push(following)
            else toDelete.push(following)
        })
        console.log(toDelete)
        toDelete.forEach(async (el) => {
            await UserInstance.findByIdAndDelete(el._id)
        })
        const newUser = await User.findByIdAndUpdate(req.userId, { $set: { followings: newFollowing } }, { new: true })

        // Removing user from creator's followers list
        const foundCreator = await User.findById(creator).populate("followers")
        const newFollowers = []
        toDelete = []
        foundCreator.followers.map(follower => {
            if (!follower.userId.equals(userObject)) newFollowers.push(follower)
            else toDelete.push(follower)
        })
        console.log(toDelete)
        toDelete.forEach(async (el) => {
            await Follower.findByIdAndDelete(el._id)
        })
        await User.findByIdAndUpdate(creator, { $set: { followers: newFollowers } }, { new: true })

        // Updating user activity by removing all the previous unfollow events with the creator and adding a new unfollow event.
        const activity = await UserActivity.findOne({ userId: req.userId }).populate("unfollowEvent")
        const newEvents = []
        const toDeleteEvents = []
        activity.unfollowEvent.map(event => {
            if (!event.userId.equals(creatorObject)) newEvents.push(event)
            else toDeleteEvents.push(event)
        })
        toDeleteEvents.forEach(async (el) => {
            await UserInstance.findByIdAndDelete(el._id)
        })
        const instance = await UserInstance.create({
            userId: creator
        })
        newEvents.push(instance)
        await UserActivity.findByIdAndUpdate(activity._id, { $set: { unfollowEvent : newEvents }})
        res.status(201).json(newUser)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export { moreFromAuthor, follow, unfollow }