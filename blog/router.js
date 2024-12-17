import express from 'express';
import { auth } from '../auth/middleware.js';
import {
    createBlog,
    deleteBlog,
    getAllBlogs,
    getBlogDetail,
    getUserBlogs,
    getSearchedBlogs,
    editBlog,
} from './controller.js';
import { upload } from '../common/config/Multer.js';
import { getThumbnailUrl } from './middleware.js';

const blogRouter = express.Router();

blogRouter.post(
    '/',
    auth,
    upload.single('thumbnailFile'),
    getThumbnailUrl,
    createBlog
);
blogRouter.get('/all', getAllBlogs);
blogRouter.get('/', auth, getUserBlogs);
blogRouter.get('/:blogId', getBlogDetail);
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
