import express from 'express';
import { auth } from '../auth/middleware.js';
import { getPlaceInfo, searchTags, createActivities } from './controller.js';

const tagRouter = express.Router();

tagRouter.get('/search', auth, searchTags);
tagRouter.get('/activities/generateActivities', auth, createActivities);
tagRouter.get('/place/info/:placeId', auth, getPlaceInfo);

export default tagRouter;
