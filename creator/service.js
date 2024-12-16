import mongoose from 'mongoose';
import { UserInstance } from '../user/model.js';
import { UserActivity } from '../userActivity/model.js';
import UserActivityService from '../userActivity/service.js';

class CreatorActivityService extends UserActivityService {
    constructor() {
        super();
        this.message =
            'Invalid activity! Accepted values are follow and unfollow!';
    }

    async createFollowActivity(data) {
        try {
            const { userId, creatorId, type } = data;
            if (type === 'follow' || type === 'unfollow') {
                const activityField =
                    type === 'follow' ? 'followEvent' : 'unfollowEvent';
                const creatorObject = new mongoose.Types.ObjectId(creatorId);
                const activity = await UserActivity.findOne({
                    userId: userId,
                }).populate(activityField);
                const newInstance = await UserInstance.create({
                    userId: creatorId,
                });
                const toDeleteEvents = [];
                activity[activityField].forEach((event) => {
                    if (event.userId.equals(creatorObject))
                        toDeleteEvents.push(event._id);
                });
                await UserInstance.deleteMany({ _id: { $in: toDeleteEvents } });
                await UserActivity.findByIdAndUpdate(activity._id, {
                    $pull: { [activityField]: { $in: toDeleteEvents } },
                    $push: { [activityField]: newInstance },
                });
            } else {
                this.invalidTypeError();
            }
        } catch (error) {
            throw error;
        }
    }
}

export default CreatorActivityService;
