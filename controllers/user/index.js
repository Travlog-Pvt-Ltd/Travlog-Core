import redis, { updateUserInCache } from "../../config/redis.js"
import User from "../../models/user.js"


async function getUserDetails(req,res){
    try {
        const cachedUser = await redis.get(`user_details#user:${req.userId}`)
        if(cachedUser) return res.status(200).json(JSON.parse(cachedUser))
        const user = await User.findById(req.userId).select('-deviceId -token -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications').populate("followings", "_id userId")
        await updateUserInCache(user)
        res.status(200).json(user)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

export {getUserDetails};