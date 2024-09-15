import { deleteCommentConsumer } from '../../controllers/comment/asyncService/consumer.js';
import { tagsIndexConsumer } from '../../controllers/tags/asyncService/consumers.js';

export const kafkaTopics = [
    'tags-es-sync',
    'profile-es-sync',
    'mark-comment-delete',
];

export const consumersList = [tagsIndexConsumer, deleteCommentConsumer];
