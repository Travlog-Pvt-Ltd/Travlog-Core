import log from 'npmlog';
import { broker, KafkaConnectionError } from '../kafka/index.js';
import UserActivityService from '../userActivity/service.js';
import { NotificationSendingService } from '../notifications/service.js';

export const updateBlogLDActivityConsumer = async () => {
    try {
        const service = new UserActivityService();
        const kafkaClient = broker.getKafkaClient();
        const consumer = kafkaClient.consumer({
            groupId: 'update-blog-activity-group',
        });
        await consumer.connect();
        await consumer.subscribe({ topics: ['update-blog-LD-activity'] });

        await consumer.run({
            eachMessage: async ({
                topic,
                partition,
                message,
                heartbeat,
                pause,
            }) => {
                const data = JSON.parse(message.value.toString());
                const { blogId, userId, type, create, clean } = data;
                try {
                    await service.updateBlogLDActivity(
                        blogId,
                        userId,
                        type,
                        create,
                        clean
                    );
                    log.info(
                        `UserActivity updated for userId: ${userId}, blogId: ${blogId}, type: ${type} # actions: ${create ? 'Create' : ''} ${clean ? 'Clean' : ''}`
                    );
                } catch (error) {
                    log.error(error.message);
                    log.info('Retrying after 5 seconds...');
                    await new Promise((res) => setTimeout(res, 5000));
                    try {
                        await service.updateBlogLDActivity(
                            blogId,
                            userId,
                            type,
                            create,
                            clean
                        );
                        log.info(
                            `UserActivity updated for userId: ${userId}, blogId: ${blogId}, type: ${type} # actions: ${create ? 'Create' : ''} ${clean ? 'Clean' : ''}`
                        );
                    } catch (err) {
                        log.error('Something went wrong, retry failed ', err);
                    }
                }
            },
        });
    } catch (err) {
        throw new KafkaConnectionError('Something went wrong', err);
    }
};

export const updateCommentLDActivityConsumer = async () => {
    try {
        const service = new UserActivityService();
        const kafkaClient = broker.getKafkaClient();
        const consumer = kafkaClient.consumer({
            groupId: 'update-comment-activity-group',
        });
        await consumer.connect();
        await consumer.subscribe({ topics: ['update-comment-LD-activity'] });

        await consumer.run({
            eachMessage: async ({
                topic,
                partition,
                message,
                heartbeat,
                pause,
            }) => {
                const data = JSON.parse(message.value.toString());
                const { blogId, commentId, userId, type, create, clean } = data;
                try {
                    await service.updateCommentLDActivity(
                        blogId,
                        commentId,
                        userId,
                        type,
                        create,
                        clean
                    );
                    log.info(
                        `UserActivity updated for userId: ${userId}, blogId: ${blogId}, commentId: ${commentId}, type: ${type} # actions: ${create ? 'Create' : ''} ${clean ? 'Clean' : ''}`
                    );
                } catch (error) {
                    log.error(error.message);
                    log.info('Retrying after 5 seconds...');
                    await new Promise((res) => setTimeout(res, 5000));
                    try {
                        await service.updateCommentLDActivity(
                            blogId,
                            commentId,
                            userId,
                            type,
                            create,
                            clean
                        );
                        log.info(
                            `UserActivity updated for userId: ${userId}, blogId: ${blogId}, commentId: ${commentId}, type: ${type} # actions: ${create ? 'Create' : ''} ${clean ? 'Clean' : ''}`
                        );
                    } catch (err) {
                        log.error('Something went wrong, retry failed ', err);
                    }
                }
            },
        });
    } catch (err) {
        throw new KafkaConnectionError('Something went wrong ', err);
    }
};

export const blogLDNotificationConsumer = async () => {
    try {
        const service = new NotificationSendingService();
        const kafkaClient = broker.getKafkaClient();
        const consumer = kafkaClient.consumer({
            groupId: 'blog-LD-notification-group',
        });
        await consumer.connect();
        await consumer.subscribe({ topics: ['process-blog-LD-notification'] });

        await consumer.run({
            eachMessage: async ({
                topic,
                partition,
                message,
                heartbeat,
                pause,
            }) => {
                const data = JSON.parse(message.value.toString());
                try {
                    await service.processLDOnBlog(data);
                    log.info(
                        `Processing notification for blog ${data.blogId}, event ${data.event} and creator ${data.creatorId}`
                    );
                } catch (error) {
                    log.error(
                        `Failed to process notification for blog ${data.blogId}, event ${data.event} and creator ${data.creatorId} `,
                        error.message
                    );
                }
            },
        });
    } catch (err) {
        throw new KafkaConnectionError('Something went wrong ', err);
    }
};
