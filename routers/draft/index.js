import express from "express"
import auth from "../../middlewares/auth.js"
import { createDraft, getDrafts } from "../../controllers/draft/index.js"

const draftRouter = express.Router()

draftRouter.post("/", auth, createDraft)
draftRouter.get("/", auth, getDrafts)

export default draftRouter