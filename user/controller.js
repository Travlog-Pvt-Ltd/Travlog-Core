import { asyncControllerHandler } from '../common/middleware.js';
import getRedisClient from '../redis/index.js';
import { updateUserInCache } from '../redis/utils.js';
import { User } from './model.js';

const getUserDetails = asyncControllerHandler(async (req, res) => {
    const redis = await getRedisClient();
    const cachedUser = await redis.get(`user_details#user:${req.userId}`);
    if (cachedUser) return res.status(200).json(JSON.parse(cachedUser));
    const user = await User.findById(req.userId)
        .select(
            '-deviceId -token -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
        )
        .populate('followings', '_id userId');
    await updateUserInCache(user);
    res.status(200).json(user);
});

export { getUserDetails };
