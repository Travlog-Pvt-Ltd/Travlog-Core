import express from "express"
import auth from "../../middlewares/auth.js"
import { commentOnBlog, getComments, replyOnComment } from "../../controllers/comment/index.js"

const commentRouter = express.Router()

commentRouter.get("/", getComments)
commentRouter.patch("/blog/comment", auth, commentOnBlog)
commentRouter.patch("/comment/reply", auth, replyOnComment)

export default commentRouter