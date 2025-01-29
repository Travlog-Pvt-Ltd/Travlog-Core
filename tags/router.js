import express from 'express';
import { auth } from '../auth/middleware.js';
import {
    getPlaceInfo,
    searchTags,
    createActivities,
    fetchTouristPlaces,
    addPlacesToDb,
} from './controller.js';

const tagRouter = express.Router();

tagRouter.get('/search', auth, searchTags);
tagRouter.get('/activities/generateActivities', auth, createActivities);
tagRouter.get('/place/info/:placeId', auth, getPlaceInfo);
tagRouter.post('/places/fetch', auth, fetchTouristPlaces);
tagRouter.post('/places/add', auth, addPlacesToDb);

export default tagRouter;
