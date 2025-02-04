import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../user/model.js';
import nodemailer from 'nodemailer';
import { OTPModel } from './model.js';
import getRedisClient from '../redis/index.js';
import { updateUserInCache } from '../redis/utils.js';
import { asyncControllerHandler } from '../common/middleware.js';

const register = asyncControllerHandler(async (req, res) => {
    const { name, email, password, deviceId } = req.body;
    const foundUser = await User.findOne({ email: email });
    if (foundUser)
        return res.status(400).json({ message: 'User already exist!' });
    const foundOTP = await OTPModel.findOne({ email });
    if (!foundOTP)
        return res.status(400).json({ message: 'Email not verified!' });
    else if (!foundOTP.validated) {
        await OTPModel.findByIdAndDelete(foundOTP._id);
        return res.status(400).json({ message: 'Email not verified!' });
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const savedUser = await User.create({
        name,
        email,
        password: hashedPassword,
        deviceId,
    });
    const user = await User.findById(savedUser._id)
        .select(
            '-password -token -deviceId -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
        )
        .populate('followings', '_id userId');
    const accessToken = jwt.sign(
        { id: savedUser._id },
        process.env.USER_SECRET,
        { expiresIn: '1d' }
    );
    const refreshToken = jwt.sign(
        { id: savedUser._id },
        process.env.REFRESH_SECRET,
        { expiresIn: '3d' }
    );
    await User.findByIdAndUpdate(savedUser._id, {
        $set: { token: refreshToken },
    });
    await OTPModel.findByIdAndDelete(foundOTP._id);
    updateUserInCache(user);
    res.status(201).json({
        token: accessToken,
        refreshToken: refreshToken,
        user: user,
    });
});

const sendOtp = asyncControllerHandler(async (req, res) => {
    const email = req.body.email;
    const generatedOtp =
        Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    const foundUser = await User.findOne({ email: email });
    if (foundUser)
        return res.status(401).json({
            message: 'User already exists! Please login to proceed.',
        });
    let config = {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    };
    let transporter = nodemailer.createTransport(config);
    const info = await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: `OTP for email verification on Travlog is ${generatedOtp}`,
        text: `OTP for email verification on Travlog is ${generatedOtp}`,
    });
    const found = await OTPModel.findOne({ email: email });
    if (found) {
        await OTPModel.findByIdAndUpdate(found._id, {
            $set: { otp: String(generatedOtp), validated: false },
        });
    } else {
        await OTPModel.create({
            email,
            otp: String(generatedOtp),
            validated: false,
        });
    }
    res.status(201).json({ message: 'OTP sent!' });
});

const verifyOtp = asyncControllerHandler(async (req, res) => {
    const { email, otp } = req.body;
    const found = await OTPModel.findOne({ email: email });
    if (!found)
        res.status(401).json({
            message:
                'OTP not generated for this email. Please generate an otp first!',
        });
    if (otp == found.otp) {
        const createdAt = new Date(found.updatedAt);
        const currentDate = new Date();
        const timeDifferenceMs = currentDate - createdAt;
        const timeDifferenceMin = timeDifferenceMs / (1000 * 60);
        if (timeDifferenceMin <= 60) {
            found.validated = true;
            await found.save();
            res.status(201).json({ message: 'OTP is valid!' });
        } else {
            await OTPModel.findByIdAndDelete(found._id);
            res.status(401).json({
                message: 'OTP expired! Resend OTP to validate.',
            });
        }
    } else {
        res.status(401).json({ message: 'Invalid OTP!' });
    }
});

const login = asyncControllerHandler(async (req, res) => {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email: email })
        .select(
            '-deviceId -token -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
        )
        .populate('followings', '_id userId');
    if (!foundUser)
        return res.status(404).json({ message: "User doesn't exist!" });
    const passwordMatched = await bcrypt.compare(password, foundUser.password);
    if (!passwordMatched)
        return res.status(400).json({ message: 'Invalid Password!' });
    const token = jwt.sign({ id: foundUser._id }, process.env.USER_SECRET, {
        expiresIn: '1d',
    });
    const refreshToken = jwt.sign(
        { id: foundUser._id },
        process.env.REFRESH_SECRET,
        { expiresIn: '3d' }
    );
    await User.findByIdAndUpdate(foundUser._id, {
        $set: { token: refreshToken },
    });
    delete foundUser.password;
    updateUserInCache(foundUser);
    res.status(200).json({
        token: token,
        refreshToken: refreshToken,
        user: foundUser,
    });
});

const loginWithGoogle = asyncControllerHandler(async (req, res) => {
    const { email, name, oAuthtoken, profileImage } = req.body;
    const foundUser = await User.findOne({ email: email });
    if (foundUser) {
        const accessToken = jwt.sign(
            { id: foundUser._id },
            process.env.USER_SECRET,
            { expiresIn: '1d' }
        );
        const refreshToken = jwt.sign(
            { id: foundUser._id },
            process.env.REFRESH_SECRET,
            { expiresIn: '3d' }
        );
        const user = await User.findByIdAndUpdate(
            foundUser._id,
            { $set: { token: refreshToken } },
            { new: true }
        )
            .select(
                '-password -token -deviceId -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
            )
            .populate('followings', '_id userId');
        updateUserInCache(user);
        res.status(201).json({
            token: accessToken,
            refreshToken: refreshToken,
            user,
        });
    } else {
        const password = Math.random().toString(36).slice(-12);
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            profileImage,
            profileLogo: profileImage,
        });
        const savedUser = await newUser.save();
        const user = await User.findById(savedUser._id)
            .select(
                '-password -token -deviceId -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
            )
            .populate('followings', '_id userId');
        const accessToken = jwt.sign(
            { id: user._id },
            process.env.USER_SECRET,
            { expiresIn: '1d' }
        );
        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_SECRET,
            { expiresIn: '3d' }
        );
        await User.findByIdAndUpdate(user._id, {
            $set: { token: refreshToken },
        });
        updateUserInCache(user);
        res.status(201).json({
            token: accessToken,
            refreshToken: refreshToken,
            user,
        });
    }
});

const refresh = asyncControllerHandler(async (req, res) => {
    if (req.body.token) {
        const refreshToken = req.body.token;
        jwt.verify(
            refreshToken,
            process.env.REFRESH_SECRET,
            async (err, decoded) => {
                if (err) {
                    return res
                        .status(401)
                        .json({ message: 'Invalid refresh token!' });
                } else {
                    const id = decoded?.id;
                    const user = await User.findById(id)
                        .select(
                            '-password -deviceId -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
                        )
                        .populate('followings', '_id userId');
                    if (user.token != refreshToken)
                        return res.status(401).json({
                            message: "Refresh token doesn't match!",
                        });
                    const accessToken = jwt.sign(
                        { id: user._id },
                        process.env.USER_SECRET,
                        { expiresIn: '1d' }
                    );
                    const newRefreshToken = jwt.sign(
                        { id: user._id },
                        process.env.REFRESH_SECRET,
                        { expiresIn: '3d' }
                    );
                    await User.findByIdAndUpdate(user._id, {
                        $set: { token: newRefreshToken },
                    });
                    delete user.token;
                    updateUserInCache(user);
                    return res.status(201).json({
                        token: accessToken,
                        refreshToken: newRefreshToken,
                        user,
                    });
                }
            }
        );
    } else {
        return res.status(401).json({
            message: 'No refresh token! Please login to continue.',
        });
    }
});

const logout = asyncControllerHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.body.userId, {
        $set: { token: null },
    });
    const redis = await getRedisClient();
    redis.del(`user_details#user:${req.body.userId}`);
    res.status(201).json({ message: 'Success' });
});

export {
    register,
    login,
    sendOtp,
    verifyOtp,
    loginWithGoogle,
    refresh,
    logout,
};
