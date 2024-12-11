import express from 'express';
import auth from '../auth/middlewares/auth.js';
import {
    getPlaceInfo,
    searchTags,
    createActivities,
    createCities,
} from './controller.js';

const tagRouter = express.Router();

tagRouter.get('/search', auth, searchTags);
tagRouter.get('/cities/generateCities', auth, createCities);
tagRouter.get('/activities/generateActivities', auth, createActivities);
tagRouter.get('/place/info/:placeId', auth, getPlaceInfo);

export default tagRouter;
