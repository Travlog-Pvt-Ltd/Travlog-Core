import express from 'express';
import { auth } from '../auth/middleware.js';
import { getUserDetails } from './controller.js';

const userRouter = express.Router();

userRouter.get('/', auth, getUserDetails);

export default userRouter;
