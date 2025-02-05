import { broker, KafkaConnectionError } from './index.js';

class BaseProducer {
    constructor() {
        this.kafkaClient = broker.getKafkaClient();
        this.producer = this.kafkaClient.producer();
    }

    async produceMessage(data, topic) {
        if (!topic) {
            throw new Error('Topic must be specified.');
        }
        try {
            await this.producer.connect();
            await this.producer.send({
                topic: topic,
                messages: [
                    {
                        value: JSON.stringify(data),
                    },
                ],
            });
            await this.producer.disconnect();
        } catch (err) {
            throw new KafkaConnectionError(
                'Something went wrong: ',
                err.message
            );
        }
    }
}

export default BaseProducer;
