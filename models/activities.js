import { tagsIndexProducer } from '../tags/producers.js';
import mongoose from 'mongoose';

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
        await tagsIndexProducer({ activities: [doc._id] });
        next();
    } catch (error) {
        throw error;
    }
});

activitySchema.post('updateOne', async function (doc, next) {
    try {
        const docId = this.getQuery()._id;
        await tagsIndexProducer({ activities: [docId] });
        next();
    } catch (error) {
        throw error;
    }
});

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
