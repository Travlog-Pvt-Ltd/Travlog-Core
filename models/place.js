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

const Place = mongoose.model('Place', placeSchema);

export default Place;
