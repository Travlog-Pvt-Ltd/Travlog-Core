import express from "express"
import auth from "../../middlewares/auth.js"
import { dislikeBlog, likeBlog } from "../../controllers/like/index.js"

const likeRouter = express.Router()

likeRouter.patch("/blog/like", auth, likeBlog)
likeRouter.patch("/blog/dislike", auth, dislikeBlog)

export default likeRouter