import Place from '@models/place.js';
import { customSearchTags } from './searchUtils.js';

const searchTags = async (req, res) => {
    try {
        const result = await customSearchTags(req.query.search);
        // Todo: Serialize this data into required format before sending as response
        res.status(200).json(result);
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

const getPlaceInfo = async (req, res) => {
    try {
        const place = await Place.findOne({
            _id: req.params.placeId,
            hasInfo: true,
        });
        if (!place) return res.status(404).json({ message: 'Info not found!' });
        place.populate('info');
        res.status(200).json({ place: place });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export { searchTags, getPlaceInfo };
