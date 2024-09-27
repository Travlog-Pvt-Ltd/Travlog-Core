import log from 'npmlog';
import { broker, KafkaConnectionError } from '../../../utils/kafka';
import UserActivityService from '../../userActivity/service';

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
                    } catch (err) {
                        throw new KafkaConnectionError(
                            'Something went wrong, retry failed ',
                            err
                        );
                    }
                }
                log.info(
                    `UserActivity updated for userId: ${userId}, blogId: ${blogId}, type: ${type} # actions: ${create ? 'Create' : ''} ${clean ? 'Clean' : ''}`
                );
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
                    } catch (err) {
                        throw new KafkaConnectionError(
                            'Something went wrong, retry failed ',
                            err
                        );
                    }
                }
                log.info(
                    `UserActivity updated for userId: ${userId}, blogId: ${blogId}, commentId: ${commentId}, type: ${type} # actions: ${create ? 'Create' : ''} ${clean ? 'Clean' : ''}`
                );
            },
        });
    } catch (err) {
        throw new KafkaConnectionError('Something went wrong ', err);
    }
};
