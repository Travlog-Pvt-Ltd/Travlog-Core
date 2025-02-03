import getRedisClient from './index.js';

export const updateUserInCache = async (user) => {
    const redis = await getRedisClient();
    await redis.setEx(
        `user_details#user:${user._id}`,
        3600,
        JSON.stringify(user)
    );
};

export const deleteKeysByPatternWithScan = async (pattern) => {
    try {
        const redis = await getRedisClient();
        let cursor = '0';
        let keys = [];
        do {
            const reply = await redis.scan(cursor, {
                MATCH: pattern,
                COUNT: 100,
            });
            cursor = reply[0];
            keys = reply[1];

            if (keys.length > 0) {
                await redis.del(keys);
            }
        } while (cursor !== '0');
    } catch (error) {
        throw error;
    }
};
