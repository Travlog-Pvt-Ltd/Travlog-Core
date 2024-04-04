import express from "express"
import auth from "../../middlewares/auth.js"
import { createDraft, getDraftDetail, getDrafts } from "../../controllers/draft/index.js"
import {upload} from "../../config/Multer.js"

const draftRouter = express.Router()

draftRouter.post("/", auth, upload.single("thumbnailFile"), createDraft)
draftRouter.get("/all", auth, getDrafts)
draftRouter.get("/:draftId", auth, getDraftDetail)

export default draftRouter