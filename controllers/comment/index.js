import Blog from "../../models/blog.js";
import LCEvent from "../../models/likeCommentEvent.js";
import UserActivity from "../../models/userActivity.js";
import Comment from "../../models/comment.js";


const commentOnBlog = async (req, res) => {
    const blog = req.body.blogId
    const content = req.body.content
    try {
        const newComment = await Comment.create({ userId: req.userId, content: content, isReply: false, blog: blog })
        const newBlog = await Blog.findByIdAndUpdate(blog, {$push: {comments: newComment._id}, $inc: { commentCount: 1 }}, {new:true})
        newBlog.populate("comments")
        const commentEvent = await LCEvent.create({
            blogId: blog,
            isComment: true,
            commentId: newComment._id,
            content: content,
            onComment: false,
            isDislike: null
        })
        const isUserActive = await UserActivity.findOne({ userId: req.userId })
        if (isUserActive) {
            await UserActivity.findByIdAndUpdate(isUserActive._id, { $push: { commentEvent: commentEvent._id } })
        }
        else {
            await UserActivity.create({ userId: req.userId, commentEvent: [commentEvent._id] })
        }
        res.status(201).json({ comments: newBlog.comments, commentCount: newBlog.commentCount })
    } catch (err) {
        res.status(401).json({ message: err.message })
    }
}

const replyOnComment = async (req, res) => {
    const {blog, comment, content} = req.body
    try {
        const newReply = await Comment.create({ userId: req.userId, content: content, isReply: true, blog: blog, parent: comment })
        const newComment = await Comment.findByIdAndUpdate(comment, {$push: {replies: newReply._id}, $inc: { replyCount: 1 }})
        await Blog.findByIdAndUpdate(blog, {$inc: { commentCount: 1 }})
        const commentEvent = await LCEvent.create({
            blogId: blog,
            isComment: true,
            commentId: newComment._id,
            content: content,
            onComment: true,
            isDislike: null
        })
        const isUserActive = await UserActivity.findOne({ userId: req.userId })
        if (isUserActive) {
            await UserActivity.findByIdAndUpdate(isUserActive._id, { $push: { commentEvent: commentEvent._id } })
        }
        else {
            await UserActivity.create({ userId: req.userId, commentEvent: [commentEvent._id] })
        }
        res.status(201).json(newComment)
    } catch (err) {
        res.status(401).json({ message: err.message })
    }
}

export { commentOnBlog, replyOnComment }