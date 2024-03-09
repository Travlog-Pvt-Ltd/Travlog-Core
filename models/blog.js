import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    tags: {
        type: [String],
        default: []
    },
    system_tags: {
        type: [String],
        default: []
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserInstance"
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserInstance"
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    views: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserInstance"
    }],
    shares: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserInstance"
    }],
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserInstance"
    }],
    attachments: {
        type: [String],
        default: []
    },
    thumbnail : {
        type: String,
        default: null
    },
    hasInfo: {
        type: Boolean,
        default: false
    },
    commentCount: {
        type: Number,
        default: 0
    },
    isPrivate: {
        type: Boolean,
        default: false
    }
}, { timestamps: true }
)

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;