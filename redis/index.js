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
