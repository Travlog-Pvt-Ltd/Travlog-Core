import mongoose from 'mongoose';
import dotenv from 'dotenv';
import log from 'npmlog';
import app from './app.js';
import { userRouter } from './user/index.js';
import { tagRouter } from './tags/index.js';
import { likeRouter } from './like/index.js';
import { authRouter } from './auth/index.js';
import { blogRouter } from './blog/index.js';
import { draftRouter } from './draft/index.js';
import { commentRouter } from './comment/index.js';
import { creatorRouter } from './creator/index.js';
import { bookmarkRouter } from './bookmark/index.js';
import { broker } from './kafka/index.js';
import './notifications/index.js';
import './redis/index.js';
import './cron.config.js';

dotenv.config();

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

broker.startConsumers();
