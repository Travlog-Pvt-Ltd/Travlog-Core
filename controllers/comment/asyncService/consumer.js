import log from 'npmlog';
import { broker, KafkaConnectionError } from '../../../utils/kafka/index.js';
import { markRepliesForDeletion } from '../utils.js';

export const deleteCommentConsumer = async () => {
    try {
        const kafkaClient = broker.getKafkaClient();
        const consumer = kafkaClient.consumer({
            groupId: 'comment-delete-group',
        });
        await consumer.connect();
        await consumer.subscribe({ topics: ['mark-comment-delete'] });

        await consumer.run({
            eachMessage: async ({
                topic,
                partition,
                message,
                heartbeat,
                pause,
            }) => {
                const comment = JSON.parse(message.value.toString());
                await markRepliesForDeletion(comment);
                log.info('Comments marked for deletion.');
            },
        });
    } catch (err) {
        throw new KafkaConnectionError('Something went wrong', err);
    }
};
