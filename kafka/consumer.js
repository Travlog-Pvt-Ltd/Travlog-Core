import { broker, KafkaConnectionError } from './index.js';

class BaseConsumer {
    constructor(topic, groupId) {
        this.kafkaClient = broker.getKafkaClient();
        this.topic = topic;
        this.groupId = groupId;
    }

    async setupConsumer(messageHandler) {
        try {
            const consumer = this.kafkaClient.consumer({
                groupId: this.groupId,
            });
            await consumer.connect();
            await consumer.subscribe({ topics: [this.topic] });

            await consumer.run({
                eachMessage: async ({ message }) => {
                    const data = JSON.parse(message.value.toString());
                    await messageHandler(data);
                },
            });
        } catch (error) {
            throw new KafkaConnectionError('Something went wrong', error);
        }
    }
}

export default BaseConsumer;
