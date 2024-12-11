import {
    blogCommentNotificationConsumer,
    deleteCommentConsumer,
} from '../comment/consumer.js';
import { createNotificationsConsumer } from '../notifications/consumer.js';
import {
    blogLDNotificationConsumer,
    updateBlogLDActivityConsumer,
    updateCommentLDActivityConsumer,
} from '../like/consumer.js';
import { tagsIndexConsumer } from '../tags/consumers.js';

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
