import express from "express"
import auth from "../../middlewares/auth.js"
import { likeBlog } from "../../controllers/like/index.js"

const likeRouter = express.Router()

likeRouter.post("/blog/like", auth, likeBlog)


export default likeRouter