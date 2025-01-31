import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import log from 'npmlog';
import './common/logger.js';
import './notifications/index.js';
import './redis/index.js';
import './cron.config.js';
import { broker } from './kafka/index.js';
import { userRouter } from './user/index.js';
import { tagRouter } from './tags/index.js';
import { likeRouter } from './like/index.js';
import { authRouter } from './auth/index.js';
import { blogRouter } from './blog/index.js';
import { draftRouter } from './draft/index.js';
import { commentRouter } from './comment/index.js';
import { creatorRouter } from './creator/index.js';
import { bookmarkRouter } from './bookmark/index.js';
import { userActivityRouter } from './userActivity/index.js';

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
        optionsSuccessStatus: 204,
    })
);
app.options('*', cors());

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        log.info('Connected to MongoDB');
    })
    .catch((error) => {
        log.error('Error connecting to MongoDB:', error);
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
app.use('/user-activity', userActivityRouter);

app.listen(process.env.PORT, () => {
    log.info(`Server listening on port ${process.env.PORT}!`);
});

broker.startConsumers();
