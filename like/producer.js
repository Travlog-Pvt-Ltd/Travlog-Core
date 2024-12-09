import { broker, KafkaConnectionError } from '../utils/kafka/index.js';

export const updateBlogLDActivityProducer = async (data) => {
    try {
        const kafkaClient = broker.getKafkaClient();
        const producer = kafkaClient.producer();
        await producer.connect();

        await producer.send({
            topic: 'update-blog-LD-activity',
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

export const updateCommentLDActivityProducer = async (data) => {
    try {
        const kafkaClient = broker.getKafkaClient();
        const producer = kafkaClient.producer();
        await producer.connect();

        await producer.send({
            topic: 'update-comment-LD-activity',
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

export const blogLDNotificationProducer = async (data) => {
    try {
        const kafkaClient = broker.getKafkaClient();
        const producer = kafkaClient.producer();
        await producer.connect();

        await producer.send({
            topic: 'process-blog-LD-notification',
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
