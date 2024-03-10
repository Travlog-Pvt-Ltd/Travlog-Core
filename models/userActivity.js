import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    followEvent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserInstance"
    }],
    unfollowEvent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserInstance"
    }],
    readEvent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "BlogInstance"
    }],
    likeEvent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "LCEvent"
    }],
    dislikeEvent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "LCEvent"
    }],
    commentEvent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "LCEvent"
    }]
}, { timestamps: true }
)

const UserActivity = mongoose.model("UserActivity", activitySchema);

export default UserActivity;