import mongoose from "mongoose"
import Blog from "../../models/blog.js"
import BlogInstance from "../../models/blogInstance.js"
import User from "../../models/user.js"
import UserInstance from "../../models/userInstance.js"


const addBookmark = async (req, res) => {
    const {blog} = req.body
    try {
        const newBlogInstance = await BlogInstance.create({
            blogId:blog
        })
        await User.findByIdAndUpdate(req.userId, {$push: {bookmarks: newBlogInstance._id}})
        const newUserInstance = await UserInstance.create({
            userId:req.userId
        })
        await Blog.findByIdAndUpdate(blog, {$push: {bookmarks: newUserInstance._id}})
        res.status(201).json({message: "Success"})
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const getBookmarks = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate({
            path: "bookmarks",
            populate: {
                path: "blogId",
                select: "_id title content author tags likeCount commentCount viewCount shareCount thumbnail createdAt updatedAt",
                populate: {
                    path: "author",
                    select: "_id name profileLogo"
                }
            }
        })
        res.status(201).json(user.bookmarks)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const removeBookmark = async (req, res) => {
    const {blog} = req.body
    const userObject = new mongoose.Types.ObjectId(req.userId)
    const blogObject = new mongoose.Types.ObjectId(blog)
    try {
        const foundBlog = await Blog.findById(blog).populate("bookmarks")
        const newUserInstances = []
        const toDeleteUserInstances = []
        foundBlog.bookmarks.map(item=>{
            if (!item.userId.equals(userObject)) newUserInstances.push(item)
            else toDeleteUserInstances.push(item)
        })
        toDeleteUserInstances.forEach(async (el) => {
            await UserInstance.findByIdAndDelete(el._id)
        })
        await Blog.findByIdAndUpdate(blog, {$set: {bookmarks: newUserInstances}})
        const foundUser = await User.findById(req.userId).populate("bookmarks")
        const newBlogInstances = []
        const toDeleteBlogInstances = []
        foundUser.bookmarks.map(item=>{
            if (!item.blogId.equals(blogObject)) newBlogInstances.push(item)
            else toDeleteBlogInstances.push(item)
        })
        toDeleteBlogInstances.forEach(async (el) => {
            await BlogInstance.findByIdAndDelete(el._id)
        })
        const newUser = await User.findByIdAndUpdate(req.userId, {$set: {bookmarks: newBlogInstances}}, {new:true}).populate({
            path: "bookmarks",
            populate: {
                path: "blogId",
                select: "_id title content author tags likeCount commentCount viewCount shareCount thumbnail createdAt updatedAt",
                populate: {
                    path: "author",
                    select: "_id name profileLogo"
                }
            }
        })
        res.status(201).json(newUser.bookmarks)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export { addBookmark, getBookmarks, removeBookmark }