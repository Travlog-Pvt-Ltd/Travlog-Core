import mongoose from 'mongoose';
import LCEvent from '../../models/likeCommentEvent.js';
import UserActivity from '../../models/userActivity.js';

class UserActivityService {
    constructor() {
        return;
    }

    async cleanLDActivity(activityId, type, toDeleteEvents) {
        try {
            if (type === 'like') {
                await Promise.all([
                    LCEvent.deleteMany({ _id: { $in: toDeleteEvents } }),
                    UserActivity.findByIdAndUpdate(activityId, {
                        $pull: { likeEvent: { $in: toDeleteEvents } },
                    }),
                ]);
            } else if (type === 'dislike') {
                await Promise.all([
                    LCEvent.deleteMany({ _id: { $in: toDeleteEvents } }),
                    UserActivity.findByIdAndUpdate(activityId, {
                        $pull: { disLikeEvent: { $in: toDeleteEvents } },
                    }),
                ]);
            } else {
                throw new Error(
                    'Invalid type! Accepted values are like and dislike!'
                );
            }
        } catch (error) {
            throw error;
        }
    }

    async createLDActivity(data, type) {
        const { blogId, commentId, userId, onComment, isDislike } = data;
        const [newEvent, userActivityCount] = await Promise.all([
            LCEvent.create({
                blogId,
                isComment: false,
                commentId,
                content: null,
                onComment,
                isDislike,
            }),
            UserActivity.countDocuments({
                userId: userId,
            }),
        ]);
        if (type === 'like') {
            if (userActivityCount > 0) {
                await UserActivity.findOneAndUpdate(
                    { userId: userId },
                    {
                        $push: { likeEvent: newEvent._id },
                    }
                );
            } else {
                await UserActivity.create({
                    userId: userId,
                    likeEvent: [newEvent._id],
                });
            }
        } else if (type === 'dislike') {
            if (userActivityCount > 0)
                await UserActivity.findOneAndUpdate(
                    { userId: userId },
                    {
                        $push: { dislikeEvent: newEvent._id },
                    }
                );
            else
                await UserActivity.create({
                    userId: userId,
                    dislikeEvent: [newEvent._id],
                });
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
        if (!activityField) return;
        let activity = {};

        if (clean) {
            activity = await UserActivity.findOne({
                userId: userId,
            }).populate(activityField);
        }

        const filteredEvents = [];

        if (type === 'like') {
            if (clean) {
                activity.likeEvent.forEach((event) => {
                    if (
                        event.blogId.equals(blogObject) &&
                        event.isComment === false &&
                        event.onComment === false &&
                        event.isDislike === false
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
                    isDislike: false,
                };
                await this.createLDActivity(data, type);
            }
        } else if (type === 'dislike') {
            if (clean) {
                activity.dislikeEvent.forEach((event) => {
                    if (
                        event.blogId.equals(blogObject) &&
                        event.isComment === false &&
                        event.onComment === false &&
                        event.isDislike === true
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
                    isDislike: true,
                };
                await this.createLDActivity(data, type);
            }
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
        if (!activityField) return;
        let activity = {};

        if (clean) {
            activity = await UserActivity.findOne({
                userId: userId,
            }).populate(activityField);
        }

        const filteredEvents = [];

        if (type === 'like') {
            if (clean) {
                activity.likeEvent.forEach((event) => {
                    if (
                        event.blogId.equals(blogObject) &&
                        event.isComment === false &&
                        event.commentId.equals(commentObject) &&
                        event.onComment === true &&
                        event.isDislike === false
                    )
                        filteredEvents.push(event._id);
                });
                await this.cleanLDActivity(activity._id, type, filteredEvents);
            }

            if (create) {
                const data = {
                    blogId,
                    commentId: commentId,
                    userId,
                    onComment: true,
                    isDislike: false,
                };
                await this.createLDActivity(data, type);
            }
        } else if (type === 'dislike') {
            if (clean) {
                activity.dislikeEvent.forEach((event) => {
                    if (
                        event.blogId.equals(blogObject) &&
                        event.isComment === false &&
                        event.commentId.equals(commentObject) &&
                        event.onComment === true &&
                        event.isDislike === true
                    )
                        filteredEvents.push(event._id);
                });
                await this.cleanLDActivity(activity._id, type, filteredEvents);
            }

            if (create) {
                const data = {
                    blogId,
                    commentId: commentId,
                    userId,
                    onComment: true,
                    isDislike: true,
                };
                await this.createLDActivity(data, type);
            }
        }
    }
}

export default UserActivityService;
