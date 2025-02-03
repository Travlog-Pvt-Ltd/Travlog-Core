import Redis from 'redis';
import log from 'npmlog';

let redisClient;

const getRedisClient = async () => {
    if (!redisClient) {
        redisClient = Redis.createClient({
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD,
            socket: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
            },
        });
        redisClient.on('error', (error) => {
            log.error('Redis error: ', error.message);
        });
        try {
            await redisClient.connect();
            log.info('Connected to Redis!');
        } catch (error) {
            redisClient = null;
            log.error('Redis connection error: ', error.message);
        }
    }
    return redisClient;
};

await getRedisClient();

export default getRedisClient;
