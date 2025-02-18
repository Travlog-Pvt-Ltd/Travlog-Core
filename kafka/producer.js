import { broker, KafkaConnectionError } from './index.js';

class BaseProducer {
    constructor() {
        this.kafkaClient = broker.getKafkaClient();
        this.producer = this.kafkaClient.producer();
        this.connected = false;
    }

    async connect() {
        if (!this.connected) {
            await this.producer.connect();
            this.connected = true;
        }
    }

    async disconnect() {
        if (this.connected) {
            await this.producer.disconnect();
            this.connected = false;
        }
    }

    async produceMessage(data, topic) {
        if (!topic) {
            throw new Error('Topic must be specified.');
        }
        try {
            await this.connect();
            await this.producer.send({
                topic: topic,
                messages: [
                    {
                        value: JSON.stringify(data),
                    },
                ],
            });
            /*
                TODO [Aryan | 2025-02-18]
                - Disconnect only on shutdown and keep reusing the connected producer
            */
            await this.disconnect();
        } catch (err) {
            throw new KafkaConnectionError(
                'Something went wrong: ',
                err.message
            );
        }
    }
}

export default BaseProducer;
