import mongoose from 'mongoose';
import { User } from '../user/model.js';

export const getFollowerId = async (req, res, next) => {
    try {
        const userObject = new mongoose.Types.ObjectId(req.userId);
        const creator = await User.findById(req.body.creatorId)
            .select('followers')
            .populate('followers', 'userId')
            .lean();
        const followerId = creator.followers.find((f) =>
            f.userId.equals(userObject)
        )?._id;
        if (!followerId) {
            return res.status(400).json({
                message: 'You need to follow the creator',
            });
        }
        req.followerId = followerId;
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
