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
    likeCount: {
        type: Number,
        default: 0
    },
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserInstance"
    }],
    dislikeCount: {
        type: Number,
        default: 0
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    commentCount: {
        type: Number,
        default: 0
    },
    views: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserInstance"
    }],
    viewCount: {
        type: Number,
        default: 0
    },
    organicViews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserInstance"
    }],
    organicViewCount: {
        type: Number,
        default: 0
    },
    shares: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserInstance"
    }],
    shareCount: {
        type: Number,
        default: 0
    },
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
    isPrivate: {
        type: Boolean,
        default: false
    }
}, { timestamps: true }
)

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;