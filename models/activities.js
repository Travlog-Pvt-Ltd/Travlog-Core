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
    },
    { timestamps: true }
);

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
