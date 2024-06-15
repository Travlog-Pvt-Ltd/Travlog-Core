import mongoose from "mongoose";
import UserActivity from "./userActivity.js";

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

likeCommentEventSchema.pre('remove', async function (next) {
    try {
        console.log("LCEvent deleted!");
    } catch (err) {
        throw err
    }
});

const LCEvent = mongoose.model("LCEvent", likeCommentEventSchema);

export default LCEvent;