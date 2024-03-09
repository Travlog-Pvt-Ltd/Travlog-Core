import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import auth from "./middlewares/auth.js";
import { login, register } from "./controllers/auth/index.js";
import { createBlog, getAllBlogs, getBlogDetail, getUserBlogs } from "./controllers/blog/index.js";
import { getUserDetails } from "./controllers/user/index.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true })
    .then(() => {
        console.log('Connected to MongoDB');
    }).catch(error => {
        console.error('Error connecting to MongoDB:', error);
    });


app.post("/register", register);
app.post("/login", login);
app.post("/blog", auth, createBlog);
app.get("/blog/all", getAllBlogs);
app.get("/blog", auth, getUserBlogs);
app.get("/blog/:blogId", getBlogDetail);
app.get("/user", auth, getUserDetails);

app.listen(8080, () => {
    console.log("Sever listening on port 8080!");
})