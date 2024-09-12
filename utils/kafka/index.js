import { Kafka, logLevel } from 'kafkajs';
import { consumersList, kafkaTopics } from './constant.js';

export class KafkaConnectionError extends Error {
    constructor(message, err) {
        super(message);
        this.name = 'KafkaConnectionError';
        this.err = err;
    }
}

class KafkaBroker {
    constructor() {
        this.kafkaClient = new Kafka({
            clientId: 'travlog',
            brokers: ['127.0.0.1:9092'],
            logLevel: logLevel.ERROR,
        });
    }

    getKafkaClient() {
        return this.kafkaClient;
    }

    async validateOrCreateTopics(topics = [], create = false) {
        try {
            const admin = this.kafkaClient.admin();
            try {
                await admin.connect();
            } catch (error) {
                throw new KafkaConnectionError(
                    'Failed to connect to kafka client admin',
                    error
                );
            }

            if (!Array.isArray(topics) || topics.length == 0)
                topics = kafkaTopics;
            const topicList = await admin.listTopics();
            const newTopics = [];
            topics.forEach((el) => {
                if (!topicList.includes(el)) {
                    newTopics.push({ topic: el, numPartitions: 2 });
                }
            });

            if (create) {
                try {
                    await admin.createTopics({
                        topics: newTopics,
                    });
                } catch (error) {
                    throw new Error(
                        `Something went wrong! Unable to create topics in kafka: ${error.message}`
                    );
                }
            }
            await admin.disconnect();
        } catch (err) {
            throw new KafkaConnectionError('Something went wrong: ', err);
        }
    }

    startConsumers() {
        consumersList.forEach((consumer) => {
            consumer();
        });
    }
}

export const broker = new KafkaBroker();

export default KafkaBroker;
