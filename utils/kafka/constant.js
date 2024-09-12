import { tagsIndexConsumer } from '@controllers/tags/asyncService/consumers.js';

export const kafkaTopics = ['tags-es-sync', 'profile-es-sync'];

export const consumersList = [tagsIndexConsumer];
