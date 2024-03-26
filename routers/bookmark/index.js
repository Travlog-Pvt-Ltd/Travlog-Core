import express from "express"
import auth from "../../middlewares/auth.js"
import { addBookmark, getBookmarks, removeBookmark } from "../../controllers/bookmark/index.js"

const bookmarkRouter = express.Router()

bookmarkRouter.post("/", auth, addBookmark)
bookmarkRouter.get("/", auth, getBookmarks)
bookmarkRouter.delete("/", auth, removeBookmark)


export default bookmarkRouter