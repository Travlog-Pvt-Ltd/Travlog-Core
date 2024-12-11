import mongoose from 'mongoose';

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

const PlaceInfo = mongoose.model('PlaceInfo', placeInfoSchema);

export default PlaceInfo;
