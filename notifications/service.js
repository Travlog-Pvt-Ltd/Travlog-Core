import { Blog } from '../blog/model.js';
import Comment from '../comment/model.js';
import { notificationProducer } from './producer.js';

export class NotificationSendingService {
    constructor() {}

    async processLDOnBlog(data) {
        try {
            const blog = await Blog.findById(data.blogId);

            // Only sending notification to blog author
            // This can change based on product requirements

            const receivers = [blog.author];
            for (let i = 0; i < receivers.length; i++) {
                const payload = { ...data, userId: receivers[i] };
                await notificationProducer.createNotificationsProducer(payload);
            }
        } catch (error) {
            throw error;
        }
    }

    async processComment(data) {
        try {
            const receivers = [];
            // Only sending notification to the author
            // This can change based on product requirements

            if (data.type === 'comment') {
                const blog = await Blog.findById(data.blogId);
                receivers.push(blog.author);
            } else if (data.type === 'reply') {
                const comment = await Comment.findById(data.commentId);
                receivers.push(comment.userId);
            }
            for (let i = 0; i < receivers.length; i++) {
                const payload = { ...data, userId: receivers[i] };
                await notificationProducer.createNotificationsProducer(payload);
            }
        } catch (error) {
            throw error;
        }
    }
}
