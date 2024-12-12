import express from 'express';
import { auth } from '../auth/middleware.js';
import {
    commentOnBlog,
    deleteComment,
    getComments,
    replyOnComment,
    editComment,
} from './controller.js';
import {
    doesCommentExistAndIsAuthor,
    isCommentDeleted,
} from './permissions.js';

const commentRouter = express.Router();

commentRouter.get('/', getComments);
commentRouter.patch('/blog/comment', auth, commentOnBlog);
commentRouter.patch('/comment/reply', auth, isCommentDeleted, replyOnComment);
commentRouter.patch(
    '/comment/edit',
    auth,
    doesCommentExistAndIsAuthor,
    isCommentDeleted,
    editComment
);
commentRouter.delete(
    '/delete/:comment',
    auth,
    doesCommentExistAndIsAuthor,
    isCommentDeleted,
    deleteComment
);

export default commentRouter;
