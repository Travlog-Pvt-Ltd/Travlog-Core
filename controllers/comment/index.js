import Blog from "../../models/blog.js";
import LCEvent from "../../models/likeCommentEvent.js";
import UserActivity from "../../models/userActivity.js";
import Comment from "../../models/comment.js";


const commentOnBlog = async (req, res) => {
    const blog = req.body.blogId
    const content = req.body.content
    try {
        const newComment = await Comment.create({ userId: req.userId, content: content, isReply: false, blog: blog })
        const foundBlog = await Blog.findById(blog)
        foundBlog.commentCount=foundBlog.commentCount+1
        foundBlog.comments.push(newComment._id)
        const newBlog = await foundBlog.save()
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

export { commentOnBlog }