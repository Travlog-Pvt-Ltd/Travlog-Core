import Blog from "../../models/blog.js"
import User from "../../models/user.js"

async function getAllBlogs(req,res){
    try {
        const blogs = await Blog.find().populate("author")
        res.status(200).json(blogs)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

async function getUserBlogs(req,res){
    try {
        const blogs = await Blog.find({author: req.userId})
        res.status(200).json(blogs)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

async function getBlogDetail(req,res){
    try {
        const blog = await Blog.findById(req.params.blogId).populate("author", "comments")
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

export {createBlog, getAllBlogs, getUserBlogs, getBlogDetail};