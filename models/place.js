import { tagsIndexProducer } from '../controllers/tags/asyncService/producers.js';
import mongoose from 'mongoose';

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

const Place = mongoose.model('Place', placeSchema);

export default Place;
