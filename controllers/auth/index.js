import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import User from "../../models/user.js";
import nodemailer from 'nodemailer'
import OTPModel from "../../models/otp.js";


async function register(req, res){
    const {
        name,
        email,
        password,
        deviceId,
    } = req.body;
    try{
        const foundUser = await User.findOne({email:email});
        if(foundUser) return res.status(400).json({message: "User already exist!"})
        const foundOTP = await OTPModel.findOne({email})
        if(!foundOTP) return res.status(400).json({message: "Email not verified!"})
        else if(!foundOTP.validated) {
            await OTPModel.findByIdAndDelete(foundOTP._id)
            return res.status(400).json({message: "Email not verified!"})
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const savedUser = await User.create({
            name,
            email,
            password: hashedPassword,
            deviceId
        })
        const user = await User.findById(savedUser._id).select('-password -deviceId -followers -followings -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications')
        const token = jwt.sign({id: savedUser._id}, process.env.USER_SECRET, {expiresIn:"24hr"})
        await OTPModel.findByIdAndDelete(foundOTP._id)
        res.status(201).json({token: token, user: user})
    } catch(err){
        res.status(500).json({message: err.message})
    }
}

const sendOtp = async(req,res) => {
    const email = req.body.email
    const generatedOtp = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000
    try {
        const foundUser = await User.findOne({email:email})
        if(foundUser) return res.status(401).json({message: "User already exists! Please login to proceed."})
        let config={
            service: 'gmail',
            auth:{
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        }
        let transporter = nodemailer.createTransport(config)
        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: `OTP for email verification on Travlog is ${generatedOtp}`,
            text: `OTP for email verification on Travlog is ${generatedOtp}`
        })
        const found = await OTPModel.findOne({email:email})
        if(found){
            await OTPModel.findByIdAndUpdate(found._id, {$set: {otp: String(generatedOtp), validated: false}})
        }
        else{
            await OTPModel.create({
                email,
                otp: String(generatedOtp),
                validated: false
            })
        }
        res.status(201).json({message: "OTP sent!"})
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

const verifyOtp = async(req,res) => {
    const {email, otp} = req.body
    try {
        const found = await OTPModel.findOne({email:email})
        if(!found) res.status(401).json({message: "OTP not generated for this email. Please generate an otp first!"})
        if(otp==found.otp){
            const createdAt = new Date(found.updatedAt)
            const currentDate = new Date()
            const timeDifferenceMs = currentDate - createdAt
            const timeDifferenceMin = timeDifferenceMs / (1000 * 60)
            if(timeDifferenceMin<=60){
                found.validated=true
                await found.save()
                res.status(201).json({message: "OTP is valid!"})
            }
            else{
                await OTPModel.findByIdAndDelete(found._id)
                res.status(401).json({message: "OTP expired! Resend OTP to validate."})
            }
        }
        else{
            res.status(401).json({message: "Invalid OTP!"})
        }
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

async function login(req, res) {
    const { email, password } = req.body;
    try{
        const foundUser = await User.findOne({email:email}).select('-followers -followings -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications');
        if(!foundUser) return res.status(404).json({message: "User doesn't exist!"});
        const passwordMatched = await bcrypt.compare(password, foundUser.password);
        if(!passwordMatched) return res.status(400).json({message: "Invalid Password!"});
        const token = jwt.sign({id: foundUser._id}, process.env.USER_SECRET, {expiresIn:"24hr"});
        delete foundUser.password
        res.status(200).json({token: token, user: foundUser});
    } catch(err){
        res.status(500).json({message: err.message})
    }
}

async function loginWithGoogle(req,res){
    const {email, name, oAuthtoken, profileImage} = req.body
    try {
        const foundUser = await User.findOne({email:email})
        if(foundUser){
            const token = jwt.sign({id: foundUser._id}, process.env.USER_SECRET, {expiresIn:"24hr"})
            res.status(201).json({token:token, user:foundUser})
        }
        else{
            const password = Math.random().toString(36).slice(-12)
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt)
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                profileImage,
                profileLogo:profileImage
            })
            const savedUser = await newUser.save()
            const user = await User.findById(savedUser._id).select('-password -followers -followings -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications');
            const token = jwt.sign({id: user._id}, process.env.USER_SECRET, {expiresIn:"24hr"})
            res.status(201).json({token: token, user: user});
        }
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

export { register, login, sendOtp, verifyOtp, loginWithGoogle }