import express from "express"
import auth from "../../middlewares/auth.js"
import { getUserDetails } from "../../controllers/user/index.js"

const userRouter = express.Router()

userRouter.get("/", auth, getUserDetails)


export default userRouter