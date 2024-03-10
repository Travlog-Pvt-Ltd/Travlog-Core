import mongoose from "mongoose";

const draftSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    content: {
        type: String,
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
    attachments: {
        type: [String],
        default: []
    }
}, { timestamps: true }
)

const Draft = mongoose.model("Draft", draftSchema);

export default Draft;