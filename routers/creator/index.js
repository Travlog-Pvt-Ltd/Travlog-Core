import express from "express"
import auth from "../../middlewares/auth.js"
import { follow, moreFromAuthor, unfollow } from "../../controllers/creator/index.js"

const creatorRouter = express.Router()

creatorRouter.get("/more/:authorId", auth, moreFromAuthor)
// creatorRouter.patch("/follow", auth, follow)
// creatorRouter.patch("/unfollow", auth, unfollow)


export default creatorRouter