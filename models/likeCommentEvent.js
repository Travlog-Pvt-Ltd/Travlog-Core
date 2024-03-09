import mongoose from "mongoose";

const likeCommentEventSchema = new mongoose.Schema({
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog"
    },
    isComment: Boolean,
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    },
    content: String,
    onComment: Boolean,
    isDislike: Boolean
}, { timestamps: true }
)

const LCEvent = mongoose.model("LCEvent", likeCommentEventSchema);

export default LCEvent;