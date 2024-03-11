import express from "express"
import auth from "../../middlewares/auth.js"
import { searchTags } from "../../controllers/tags/index.js"
import { createCities } from "../../controllers/cities/index.js"
import { createActivities } from "../../controllers/activities/index.js"

const tagRouter = express.Router()

tagRouter.get("/search", auth, searchTags)
tagRouter.get("/cities/generateCities", auth, createCities)
tagRouter.get("/activities/generateActivities", auth, createActivities)


export default tagRouter