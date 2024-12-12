import { KafkaConnectionError, broker } from '../kafka/index.js';

export const tagsIndexProducer = async (data) => {
    try {
        const kafkaClient = broker.getKafkaClient();
        const producer = kafkaClient.producer();
        await producer.connect();

        const payload = {
            places: data?.places || [],
            activities: data?.activities || [],
        };

        await producer.send({
            topic: 'tags-es-sync',
            messages: [
                {
                    value: JSON.stringify(payload),
                },
            ],
        });
        await producer.disconnect();
    } catch (err) {
        throw new KafkaConnectionError('Something went wrong', err);
    }
};
