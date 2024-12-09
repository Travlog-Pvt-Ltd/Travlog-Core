import mongoose from 'mongoose';

const draftSchema = new mongoose.Schema(
    {
        title: {
            type: String,
        },
        content: {
            type: String,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        tags: {
            places: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Place',
                },
            ],
            activities: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Activity',
                },
            ],
        },
        system_tags: {
            type: [String],
            default: [],
        },
        attachments: {
            type: [String],
            default: [],
        },
        thumbnail: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const Draft = mongoose.model('Draft', draftSchema);

export default Draft;
