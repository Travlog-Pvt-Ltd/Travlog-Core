import express from 'express';
import { auth } from '../auth/middleware.js';
import {
    dislikeBlog,
    dislikeComment,
    likeBlog,
    likeComment,
} from './controller.js';
import { isCommentDeleted } from '../comment/permissions.js';

const likeRouter = express.Router();

likeRouter.patch('/blog/like', auth, likeBlog);
likeRouter.patch('/blog/dislike', auth, dislikeBlog);
likeRouter.patch('/comment/like', auth, isCommentDeleted, likeComment);
likeRouter.patch('/comment/dislike', auth, isCommentDeleted, dislikeComment);

export default likeRouter;
