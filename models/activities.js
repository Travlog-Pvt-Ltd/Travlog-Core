import mongoose from 'mongoose';
import { updateTagIndex } from '../controllers/tags/searchUtils.js';

const activitySchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        types: [
            {
                type: String,
            },
        ],
        searchCount: {
            type: Number,
            default: 0,
        },
        blogCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

activitySchema.post('save', async function (doc, next) {
    try {
        await updateTagIndex(doc);
        next();
    } catch (error) {
        throw error;
    }
});

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
