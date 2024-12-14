import log from 'npmlog';
import { broker, KafkaConnectionError } from '../kafka/index.js';
import { markRepliesForDeletion } from './utils.js';
import { NotificationSendingService } from '../notifications/service.js';
import { registerConsumer } from '../common/utils.js';
import CommentActivityService from './service.js';

registerConsumer(async () => {
    try {
        const kafkaClient = broker.getKafkaClient();
        const consumer = kafkaClient.consumer({
            groupId: 'comment-delete-group',
        });
        await consumer.connect();
        await consumer.subscribe({ topics: ['mark-comment-delete'] });

        await consumer.run({
            eachMessage: async ({ message }) => {
                const comment = JSON.parse(message.value.toString());
                await markRepliesForDeletion(comment);
                log.info('Comments marked for deletion.');
            },
        });
    } catch (err) {
        throw new KafkaConnectionError('Something went wrong', err);
    }
});

registerConsumer(async () => {
    try {
        const service = new CommentActivityService();
        const kafkaClient = broker.getKafkaClient();
        const consumer = kafkaClient.consumer({
            groupId: 'comment-activity-group',
        });
        await consumer.connect();
        await consumer.subscribe({ topics: ['create-comment-activity'] });

        await consumer.run({
            eachMessage: async ({ message }) => {
                const data = JSON.parse(message.value.toString());
                await service.createCommentActivity(data);
            },
        });
    } catch (err) {
        throw new KafkaConnectionError('Something went wrong', err);
    }
});

registerConsumer(async () => {
    try {
        const service = new CommentActivityService();
        const kafkaClient = broker.getKafkaClient();
        const consumer = kafkaClient.consumer({
            groupId: 'edited-comment-activity-group',
        });
        await consumer.connect();
        await consumer.subscribe({ topics: ['edited-comment-activity'] });

        await consumer.run({
            eachMessage: async ({ message }) => {
                const data = JSON.parse(message.value.toString());
                await service.editCommentActivity(data);
            },
        });
    } catch (err) {
        throw new KafkaConnectionError('Something went wrong', err);
    }
});

registerConsumer(async () => {
    try {
        const service = new NotificationSendingService();
        const kafkaClient = broker.getKafkaClient();
        const consumer = kafkaClient.consumer({
            groupId: 'comment-notification-group',
        });
        await consumer.connect();
        await consumer.subscribe({ topics: ['process-comment-notification'] });

        await consumer.run({
            eachMessage: async ({ message }) => {
                const data = JSON.parse(message.value.toString());
                try {
                    await service.processComment(data);
                    log.info(
                        `Processing notification for blog ${data.blogId}, comment ${data.commentId}, event ${data.event} and creator ${data.creatorId}`
                    );
                } catch (error) {
                    log.error(
                        `Failed to process notification for blog ${data.blogId}, comment ${data.commentId}, event ${data.event} and creator ${data.creatorId} `,
                        error.message
                    );
                }
            },
        });
    } catch (err) {
        throw new KafkaConnectionError('Something went wrong ', err);
    }
});
