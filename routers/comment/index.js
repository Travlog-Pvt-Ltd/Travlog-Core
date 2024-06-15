import express from 'express';
import auth from '../../middlewares/auth.js';
import {
    commentOnBlog,
    deleteComment,
    getComments,
    replyOnComment,
    editComment,
} from '../../controllers/comment/index.js';
import { doesCommentExistAndIsAuthor } from '../../controllers/comment/utils/permissions.js';

const commentRouter = express.Router();

commentRouter.get('/', getComments);
commentRouter.patch('/blog/comment', auth, commentOnBlog);
commentRouter.patch('/comment/reply', auth, replyOnComment);
commentRouter.patch(
    '/comment/edit',
    auth,
    doesCommentExistAndIsAuthor,
    editComment
);
commentRouter.delete(
    '/delete/:comment',
    auth,
    doesCommentExistAndIsAuthor,
    deleteComment
);

export default commentRouter;
