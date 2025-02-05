import { BaseSiteAbstractClass } from '../common/utils.js';
import { broker, KafkaConnectionError } from './index.js';

class BaseConsumer extends BaseSiteAbstractClass {
    constructor(groupId, topic) {
        super();
        this.kafkaClient = broker.getKafkaClient();
        this.topic = topic;
        this.groupId = groupId;
    }

    // Add name of all the abstract functions that the children should implement
    static abstractMethods = ['start'];

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
            throw new KafkaConnectionError(
                'Something went wrong: ',
                error.message
            );
        }
    }
}

export default BaseConsumer;
