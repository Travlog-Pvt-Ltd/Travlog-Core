import express from 'express';
import { getUserActivity } from './controller.js';
import { auth } from '../auth/middleware.js';

const userActivityRouter = express.Router();

userActivityRouter.get('/', auth, getUserActivity);

export default userActivityRouter;
