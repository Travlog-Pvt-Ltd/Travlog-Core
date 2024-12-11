import { broker, KafkaConnectionError } from '../kafka/index.js';

export const createNotificationsProducer = async (data) => {
    try {
        const kafkaClient = broker.getKafkaClient();
        const producer = kafkaClient.producer();
        await producer.connect();

        await producer.send({
            topic: 'create-notification',
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
