import express from "express"
import auth from "../../middlewares/auth.js"
import { commentOnBlog } from "../../controllers/comment/index.js"

const commentRouter = express.Router()

commentRouter.post("/blog/comment", auth, commentOnBlog)

export default commentRouter