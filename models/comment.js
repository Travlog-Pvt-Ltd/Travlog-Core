import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: String,
    isReply: Boolean,
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog"
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserInstance"
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserInstance"
    }]
}, { timestamps: true }
)

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;