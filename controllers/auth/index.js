import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import User from "../../models/user.js";


async function register(req, res){
    const {
        name,
        email,
        password,
    } = req.body;
    try{
        const foundUser = await User.findOne({email:email});
        if(foundUser) return res.status(400).json({message: "User already exist!"});
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        })
        const savedUser = await newUser.save();
        const token = jwt.sign({id: savedUser._id}, process.env.USER_SECRET, {expiresIn:"24hr"})
        res.status(201).json({token: token, user: savedUser});
    } catch(err){
        res.status(500).json({message: err.message})
    }
}

async function login(req, res) {
    const { email, password } = req.body;
    try{
        const foundUser = await User.findOne({email:email});
        if(!foundUser) return res.status(404).json({message: "User doesn't exist!"});
        const passwordMatched = await bcrypt.compare(password, foundUser.password);
        if(!passwordMatched) return res.status(400).json({message: "Invalid Password!"});
        const token = jwt.sign({id: foundUser._id}, process.env.USER_SECRET, {expiresIn:"24hr"});
        res.status(200).json({token: token, user: foundUser});
    } catch(err){
        res.status(500).json({message: err.message})
    }
}

export { register, login };