import { broker, KafkaConnectionError } from '../../../utils/kafka/index.js';

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
