import express from 'express';
import {
    login,
    loginWithGoogle,
    logout,
    refresh,
    register,
    sendOtp,
    verifyOtp,
} from './controller.js';
// import OAuth from "../middlewares/OAuth.js"

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/refresh', refresh);
authRouter.post('/send-otp', sendOtp);
authRouter.post('/verify-otp', verifyOtp);
authRouter.post('/login/google-login', loginWithGoogle);

export default authRouter;
