import express from 'express';
import auth from '../auth/middlewares/auth.js';
import { getUserDetails } from './controller.js';

const userRouter = express.Router();

userRouter.get('/', auth, getUserDetails);

export default userRouter;
