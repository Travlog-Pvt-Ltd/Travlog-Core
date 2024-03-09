import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routers/user/index.js";
import authRouter from "./routers/auth/index.js";
import blogRouter from "./routers/blog/index.js";
import draftRouter from "./routers/draft/index.js";

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


app.use("/user", userRouter)
app.use("/auth", authRouter)
app.use("/blog", blogRouter)
app.use("/draft", draftRouter)

app.listen(8080, () => {
    console.log("Server listening on port 8080!");
})