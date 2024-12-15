import mongoose from 'mongoose';
import { UserActivity, LCEvent } from '../userActivity/model.js';
import UserActivityService from '../userActivity/service.js';

class LikeDislikeActivityService extends UserActivityService {
    constructor() {
        super();
        this.message = 'Invalid type! Accepted values are like and dislike!';
    }

    async cleanLDActivity(activityId, type, toDeleteEvents) {
        try {
            if (type === 'like' || type === 'dislike') {
                const eventField =
                    type === 'like' ? 'likeEvent' : 'dislikeEvent';
                await Promise.all([
                    LCEvent.deleteMany({ _id: { $in: toDeleteEvents } }),
                    UserActivity.findByIdAndUpdate(activityId, {
                        $pull: { [eventField]: { $in: toDeleteEvents } },
                    }),
                ]);
            } else {
                this.invalidTypeError();
            }
        } catch (error) {
            throw error;
        }
    }

    async createLDActivity(data, type) {
        try {
            const { blogId, commentId, userId, onComment, isDislike } = data;
            const newEvent = await LCEvent.create({
                blogId,
                isComment: false,
                commentId,
                onComment,
                isDislike,
            });
            if (type === 'like' || type === 'dislike') {
                const eventField =
                    type === 'like' ? 'likeEvent' : 'dislikeEvent';
                await UserActivity.findOneAndUpdate(
                    { userId: userId },
                    {
                        $push: { [eventField]: newEvent._id },
                    },
                    { upsert: true }
                );
            } else {
                this.invalidTypeError();
            }
        } catch (error) {
            throw error;
        }
    }

    async updateBlogLDActivity(blogId, userId, type, create, clean) {
        const blogObject = new mongoose.Types.ObjectId(blogId);
        let activityField =
            type === 'like'
                ? 'likeEvent'
                : type === 'dislike'
                  ? 'dislikeEvent'
                  : '';

        const filteredEvents = [];

        if (activityField) {
            if (clean) {
                const activity = await UserActivity.findOne({
                    userId: userId,
                }).populate(activityField);
                activity[activityField].forEach((event) => {
                    if (
                        event.blogId.equals(blogObject) &&
                        event.isComment === false &&
                        event.onComment === false &&
                        event.isDislike === (type === 'dislike')
                    )
                        filteredEvents.push(event._id);
                });
                await this.cleanLDActivity(activity._id, type, filteredEvents);
            }
            if (create) {
                const data = {
                    blogId,
                    commentId: null,
                    userId,
                    onComment: false,
                    isDislike: type === 'dislike',
                };
                await this.createLDActivity(data, type);
            }
        } else {
            this.invalidTypeError();
        }
    }

    async updateCommentLDActivity(
        blogId,
        commentId,
        userId,
        type,
        create,
        clean
    ) {
        const commentObject = new mongoose.Types.ObjectId(commentId);
        const blogObject = new mongoose.Types.ObjectId(blogId);
        let activityField =
            type === 'like'
                ? 'likeEvent'
                : type === 'dislike'
                  ? 'dislikeEvent'
                  : '';

        const filteredEvents = [];

        if (activityField) {
            if (clean) {
                const activity = await UserActivity.findOne({
                    userId: userId,
                }).populate(activityField);
                activity[activityField].forEach((event) => {
                    if (
                        event.blogId.equals(blogObject) &&
                        event.isComment === false &&
                        event.commentId.equals(commentObject) &&
                        event.onComment === true &&
                        event.isDislike === (type === 'dislike')
                    )
                        filteredEvents.push(event._id);
                });
                await this.cleanLDActivity(activity._id, type, filteredEvents);
            }
            if (create) {
                const data = {
                    blogId,
                    commentId,
                    userId,
                    onComment: true,
                    isDislike: type === 'dislike',
                };
                await this.createLDActivity(data, type);
            }
        } else {
            this.invalidTypeError();
        }
    }
}

export default LikeDislikeActivityService;
