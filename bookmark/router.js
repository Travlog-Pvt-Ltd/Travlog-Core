import express from 'express';
import auth from '../auth/middlewares/auth.js';
import { addBookmark, getBookmarks, removeBookmark } from './controller.js';

const bookmarkRouter = express.Router();

bookmarkRouter.post('/', auth, addBookmark);
bookmarkRouter.get('/', auth, getBookmarks);
bookmarkRouter.delete('/', auth, removeBookmark);

export default bookmarkRouter;
