import Redis from 'redis'

const redis = Redis.createClient({
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
})
redis.connect().then(()=>{
    console.log("Connected to Redis!")
}).catch(error=>{
    console.error(error);
})

export default redis

export const updateUserInCache = async(user) => {
    await redis.setEx(`user_details#user:${user._id}`, 3600, JSON.stringify(user))
}