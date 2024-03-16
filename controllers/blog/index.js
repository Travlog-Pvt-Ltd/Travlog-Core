import Activity from "../../models/userActivity.js";
import Blog from "../../models/blog.js"
import BlogInstance from "../../models/blogInstance.js";
import LCEvent from "../../models/likeCommentEvent.js";
import User from "../../models/user.js"

async function getAllBlogs(req,res){
    const limit = req.query.limit || 20;
    const skip = req.query.skip || 0;
    try {
        const blogs = await Blog.find().limit(limit).skip(skip).populate("author", "_id name profileLogo")
        res.status(200).json(blogs)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

async function getUserBlogs(req,res){
    const limit = req.query.limit || 20
    const skip = req.query.skip || 0
    try {
        const blogs = await Blog.find({author: req.userId}).limit(limit).skip(skip).populate("author", "_id name profileLogo")
        res.status(200).json(blogs)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

async function getBlogDetail(req,res){
    try {
        const blog = await Blog.findById(req.params.blogId).populate("author", "_id name profileLogo followers").populate("comments")
        res.status(200).json(blog)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

async function createBlog(req,res){
    const {
        title,
        content,
        tags,
        attachments,
    } = req.body;
    try {
        const newBlog = new Blog({
            author: req.userId,
            title,
            content,
            tags,
            attachments
        })
        const savedBlog = await newBlog.save()
        const user = await User.findByIdAndUpdate(req.userId,{$push: {blogs: savedBlog}}, {new:true}).populate("blogs")
        res.status(201).json(user.blogs)
    } catch (err) {
        res.status(401).json({message: err.message})
    }
}

async function deleteBlog(req,res){
    try {
        await Blog.findByIdAndDelete(req.params.blogId)
        await User.findByIdAndUpdate(req.userId, {$pull: {blogs: req.params.blogId}})
        const blogInstances = await BlogInstance.find({blogId:req.params.blogId})
        await Activity.updateOne({userId:req.userId},{$pull:{readEvent: {$in: blogInstances}}})
        await BlogInstance.deleteMany({blogId:req.params.blogId})
        const lceEvents = await LCEvent.find({blogId:req.params.blogId})
        await Activity.updateOne({userId:req.userId}, {$pull: {likeEvent: {$in: lceEvents}}})
        await Activity.updateOne({userId:req.userId}, {$pull: {dislikeEvent: {$in: lceEvents}}})
        await Activity.updateOne({userId:req.userId}, {$pull: {commentEvent: {$in: lceEvents}}})
        await LCEvent.deleteMany({blogId:req.params.blogId})
        res.status(204).json("Successfully deleted blog!")
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

export {createBlog, getAllBlogs, getUserBlogs, getBlogDetail, deleteBlog};