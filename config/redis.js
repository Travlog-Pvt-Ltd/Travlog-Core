import Redis from 'redis'

const redis = Redis.createClient()
await redis.connect()

export default redis

export const updateUserInCache = async(user) => {
    await redis.setEx(`user_details#user:${user._id}`, 3600, JSON.stringify(user))
}