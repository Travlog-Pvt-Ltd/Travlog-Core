import Redis from 'redis';
import log from 'npmlog';

const redis = Redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    },
});

redis
    .connect()
    .then(() => {
        log.info('Connected to Redis!');
    })
    .catch((error) => {
        log.error(error);
    });

export default redis;

export const updateUserInCache = async (user) => {
    await redis.setEx(
        `user_details#user:${user._id}`,
        3600,
        JSON.stringify(user)
    );
};

export const deleteKeysByPatternWithScan = async (pattern) => {
    try {
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
