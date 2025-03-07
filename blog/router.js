import express from 'express';
import { auth } from '../auth/middleware.js';
import {
    createBlog,
    deleteBlog,
    getAllBlogs,
    getBlogDetail,
    getUserBlogs,
    getSearchedBlogs,
    getSimilarBlogs,
    editBlog,
} from './controller.js';
import { upload } from '../common/config/Multer.js';
import { getThumbnailUrl } from './middleware.js';
import { extractUserIdFromToken } from '../common/middleware.js';

const blogRouter = express.Router();

blogRouter.post(
    '/',
    auth,
    upload.single('thumbnailFile'),
    getThumbnailUrl,
    createBlog
);
blogRouter.get('/all', extractUserIdFromToken, getAllBlogs);
blogRouter.get('/', auth, getUserBlogs);
blogRouter.get('/:blogId', extractUserIdFromToken, getBlogDetail);
blogRouter.get('/similar/:blogId', extractUserIdFromToken, getSimilarBlogs);
blogRouter.get('/results/:tagId', auth, getSearchedBlogs);
blogRouter.delete('/:blogId', auth, deleteBlog);
blogRouter.patch(
    '/:blogId',
    auth,
    upload.single('thumbnailFile'),
    getThumbnailUrl,
    editBlog
);

export default blogRouter;
