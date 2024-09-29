import mongoose from 'mongoose';

const itinerarySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

export default Itinerary;
