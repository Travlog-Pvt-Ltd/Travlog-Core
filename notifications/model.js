import mongoose from 'mongoose';
import { UserActions } from './constant.js';

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        creatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        notificationType: {
            type: String,
            enum: UserActions,
            required: true,
        },
        blogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog',
        },
        commentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        },
        replyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment',
        },
        creationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Itinerary',
        },
    },
    { timestamps: true }
);

const userNotificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        totalCount: {
            type: Number,
            default: 0,
        },
        unreadCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);

const UserNotification = mongoose.model(
    'UserNotification',
    userNotificationSchema
);

export { Notification, UserNotification };
