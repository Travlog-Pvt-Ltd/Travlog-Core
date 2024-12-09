import { broker, KafkaConnectionError } from '../utils/kafka/index.js';

export const deleteCommentProducer = async (comment) => {
    try {
        const kafkaClient = broker.getKafkaClient();
        const producer = kafkaClient.producer();
        await producer.connect();

        await producer.send({
            topic: 'mark-comment-delete',
            messages: [
                {
                    value: JSON.stringify(comment),
                },
            ],
        });
        await producer.disconnect();
    } catch (err) {
        throw new KafkaConnectionError('Something went wrong', err);
    }
};

export const commentNotificationProducer = async (data) => {
    try {
        const kafkaClient = broker.getKafkaClient();
        const producer = kafkaClient.producer();
        await producer.connect();

        await producer.send({
            topic: 'process-comment-notification',
            messages: [
                {
                    value: JSON.stringify(data),
                },
            ],
        });
        await producer.disconnect();
    } catch (err) {
        throw new KafkaConnectionError('Something went wrong', err);
    }
};
