import Place from '../models/place.js';
import { customSearchTags } from './searchUtils.js';
import { parseEsTagData } from './utils.js';

const searchTags = async (req, res) => {
    try {
        let result = await customSearchTags(req.query.search);
        result = parseEsTagData(result);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
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
