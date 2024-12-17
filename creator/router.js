import express from 'express';
import { auth } from '../auth/middleware.js';
import {
    follow,
    getCreatorDetails,
    moreFromAuthor,
    unfollow,
    subscribe,
    unsubscribe,
} from './controller.js';
import { getFollowerId } from './middleware.js';

const creatorRouter = express.Router();

creatorRouter.get('/more/:authorId', moreFromAuthor);
creatorRouter.patch('/follow', auth, follow);
creatorRouter.patch('/unfollow', auth, unfollow);
creatorRouter.patch('/subscribe', auth, getFollowerId, subscribe);
creatorRouter.patch('/unsubscribe', auth, getFollowerId, unsubscribe);
creatorRouter.get('/creator-detail/:creatorId', getCreatorDetails);

export default creatorRouter;
