import Activity from '../../models/activities.js';
import Place from '../../models/place.js';

const searchTags = async (req, res) => {
    try {
        const keyword = req.query.search
            ? {
                  $and: [{ name: { $regex: req.query.search, $options: 'i' } }],
              }
            : {};
        const places = await Place.find(keyword).limit(5);
        const activities = await Activity.find(keyword).limit(5);
        const results = [...places, ...activities];
        res.status(200).json(results);
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
