import express from "express"
import { login, register, sendOtp, verifyOtp } from "../../controllers/auth/index.js"

const authRouter = express.Router()

authRouter.post("/register", register)
authRouter.post("/login", login)
authRouter.post("/send-otp", sendOtp)
authRouter.post("/verify-otp", verifyOtp)


export default authRouter