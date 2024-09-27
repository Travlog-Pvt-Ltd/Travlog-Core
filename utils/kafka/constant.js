import { deleteCommentConsumer } from '../../controllers/comment/asyncService/consumer.js';
import {
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
];

export const consumersList = [
    tagsIndexConsumer,
    deleteCommentConsumer,
    updateBlogLDActivityConsumer,
    updateCommentLDActivityConsumer,
];
