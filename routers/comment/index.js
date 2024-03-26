import express from "express"
import auth from "../../middlewares/auth.js"
import { commentOnBlog, replyOnComment } from "../../controllers/comment/index.js"

const commentRouter = express.Router()

commentRouter.patch("/blog/comment", auth, commentOnBlog)
commentRouter.patch("/comment/reply", auth, replyOnComment)

export default commentRouter