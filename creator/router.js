import express from 'express';
import auth from '../auth/middlewares/auth.js';
import {
    follow,
    getCreatorDetails,
    moreFromAuthor,
    unfollow,
} from './controller.js';

const creatorRouter = express.Router();

creatorRouter.get('/more/:authorId', moreFromAuthor);
creatorRouter.patch('/follow', auth, follow);
creatorRouter.patch('/unfollow', auth, unfollow);
creatorRouter.get('/creator-detail/:creatorId', getCreatorDetails);

export default creatorRouter;
