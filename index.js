import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './routers/user/index.js';
import authRouter from './routers/auth/index.js';
import blogRouter from './routers/blog/index.js';
import draftRouter from './routers/draft/index.js';
import tagRouter from './routers/tags/index.js';
import likeRouter from './routers/like/index.js';
import commentRouter from './routers/comment/index.js';
import creatorRouter from './routers/creator/index.js';
import bookmarkRouter from './routers/bookmark/index.js';
import { broker } from './utils/kafka/index.js';

dotenv.config();
const app = express();
app.use(express.json());
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(
    cors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

mongoose
    .connect(process.env.MONGO_URL, { useNewUrlParser: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

app.use('/user', userRouter);
app.use('/creator', creatorRouter);
app.use('/auth', authRouter);
app.use('/blog', blogRouter);
app.use('/draft', draftRouter);
app.use('/tags', tagRouter);
app.use('/like', likeRouter);
app.use('/comment', commentRouter);
app.use('/bookmark', bookmarkRouter);

app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}!`);
});

broker.startConsumers();
