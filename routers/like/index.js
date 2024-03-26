import express from "express"
import auth from "../../middlewares/auth.js"
import { dislikeBlog, dislikeComment, likeBlog, likeComment } from "../../controllers/like/index.js"

const likeRouter = express.Router()

likeRouter.patch("/blog/like", auth, likeBlog)
likeRouter.patch("/blog/dislike", auth, dislikeBlog)
likeRouter.patch("/comment/like", auth, likeComment)
likeRouter.patch("/comment/dislike", auth, dislikeComment)

export default likeRouter