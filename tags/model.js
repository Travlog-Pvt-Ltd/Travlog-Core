import { tagsIndexProducer } from './producer.js';
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

const placeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        },
        isPlace: {
            type: Boolean,
            default: true,
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Place',
        },
        district: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Place',
        },
        state: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Place',
        },
        country: {
            type: String,
        },
        pincode: {
            type: String,
        },
        hasInfo: {
            type: Boolean,
            default: false,
        },
        info: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PlaceInfo',
        },
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

placeSchema.post('save', async function (doc, next) {
    try {
        await tagsIndexProducer({ places: [doc._id] });
        next();
    } catch (error) {
        throw error;
    }
});

placeSchema.post('updateOne', async function (doc, next) {
    try {
        const docId = this.getQuery()._id;
        await tagsIndexProducer({ places: [docId] });
        next();
    } catch (error) {
        throw error;
    }
});

const placeInfoSchema = new mongoose.Schema(
    {
        place: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Place',
        },
        content: {
            type: String,
        },
        theme: {
            type: String,
        },
        attachments: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

const Activity = mongoose.model('Activity', activitySchema);

const Place = mongoose.model('Place', placeSchema);

const PlaceInfo = mongoose.model('PlaceInfo', placeInfoSchema);

export { Activity, Place, PlaceInfo };