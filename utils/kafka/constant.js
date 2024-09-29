import {
    blogCommentNotificationConsumer,
    deleteCommentConsumer,
} from '../../controllers/comment/asyncService/consumer.js';
import { createNotificationsConsumer } from '../../controllers/common/consumer.js';
import {
    blogLDNotificationConsumer,
    updateBlogLDActivityConsumer,
    updateCommentLDActivityConsumer,
} from '../../controllers/like/asyncService/consumer.js';
import { tagsIndexConsumer } from '../../controllers/tags/asyncService/consumers.js';

export const kafkaTopics = [
    'tags-es-sync',
    'profile-es-sync',
    'mark-comment-delete',
    'update-blog-LD-activity',
    'update-comment-LD-activity',
    'process-comment-notification',
    'create-notification',
    'process-blog-LD-notification',
];

export const consumersList = [
    tagsIndexConsumer,
    deleteCommentConsumer,
    updateBlogLDActivityConsumer,
    updateCommentLDActivityConsumer,
    blogCommentNotificationConsumer,
    createNotificationsConsumer,
    blogLDNotificationConsumer,
];
