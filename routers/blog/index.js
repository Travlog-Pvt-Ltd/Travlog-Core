import express from "express"
import auth from "../../middlewares/auth.js"
import { createBlog, deleteBlog, getAllBlogs, getBlogDetail, getUserBlogs } from "../../controllers/blog/index.js"
import { upload } from "../../config/Multer.js"

const blogRouter = express.Router()

blogRouter.post("/", auth, upload.single("thumbnailFile"), createBlog)
blogRouter.get("/all", getAllBlogs)
blogRouter.get("/", auth, getUserBlogs)
blogRouter.get("/:blogId", getBlogDetail)
blogRouter.delete("/:blogId", auth, deleteBlog)


export default blogRouter