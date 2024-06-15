import Comment from "../../../models/comment.js"

const doesCommentExistAndIsAuthor = async(req, res, next) => {
    try {
        const { comment } = req.params
        const found = await Comment.findById(comment)
        if (!found) return res.status(404).json({ message: "No comment found!" })
        if (found.userId != req.userId) return res.status(401).json({ message: "Permission Denied! Only authors can delete a comment." })
        next()
    } catch (error) {
        res.status(500).json({ message: err.message })
    }
}

export { doesCommentExistAndIsAuthor }