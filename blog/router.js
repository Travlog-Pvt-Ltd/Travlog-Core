import express from 'express';
import { auth } from '../auth/middleware.js';
import {
    createBlog,
    deleteBlog,
    getAllBlogs,
    getBlogDetail,
    getUserBlogs,
    getSearchedBlogs,
} from './controller.js';
import { upload } from '../common/config/Multer.js';

const blogRouter = express.Router();

blogRouter.post('/', auth, upload.single('thumbnailFile'), createBlog);
blogRouter.get('/all', getAllBlogs);
blogRouter.get('/', auth, getUserBlogs);
blogRouter.get('/:blogId', getBlogDetail);
blogRouter.get('/results/:tagId', auth, getSearchedBlogs);
blogRouter.delete('/:blogId', auth, deleteBlog);

export default blogRouter;
