import express from "express"
import auth from "../../middlewares/auth.js"
import { moreFromAuthor } from "../../controllers/creator/index.js"

const creatorRouter = express.Router()

creatorRouter.get("/more/:authorId", auth, moreFromAuthor)


export default creatorRouter