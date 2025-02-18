import { BaseSiteAbstractClass } from '../common/utils.js';
import { broker, KafkaConnectionError } from './index.js';

class BaseConsumer extends BaseSiteAbstractClass {
    constructor(groupId, topic) {
        super();
        this.kafkaClient = broker.getKafkaClient();
        this.topic = topic;
        this.groupId = groupId;
        this.consumer = this.kafkaClient.consumer({ groupId });
    }

    // Add name of all the abstract functions that the children should implement
    static abstractMethods = ['start'];

    async disconnect() {
        await this.consumer.disconnect();
    }

    async setupConsumer(messageHandler) {
        try {
            await this.consumer.connect();
            await this.consumer.subscribe({ topics: [this.topic] });

            await this.consumer.run({
                /*
                    TODO [Aryan | 2025-02-18]
                    - Use eachBatch for batch processing for faster processing and reduced overhead
                */
                eachMessage: async ({ message }) => {
                    const data = JSON.parse(message.value.toString());
                    await messageHandler(data);
                },
            });
        } catch (error) {
            throw new KafkaConnectionError(
                'Something went wrong: ',
                error.message
            );
        }
    }
}

export default BaseConsumer;
