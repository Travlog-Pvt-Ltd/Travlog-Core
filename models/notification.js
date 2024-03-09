import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    interactorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog"
    },
    type: String,
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }
}, { timestamps: true }
)

const LCEvent = mongoose.model("LCEvent", notificationSchema);

export default LCEvent;