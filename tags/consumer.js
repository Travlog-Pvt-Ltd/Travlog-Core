import { Place, Activity } from './model.js';
import { bulkCreateTagIndex } from './searchUtils.js';
import { broker, KafkaConnectionError } from '../kafka/index.js';
import { registerConsumer } from '../common/utils.js';

registerConsumer(async () => {
    try {
        const kafkaClient = broker.getKafkaClient();
        const consumer = kafkaClient.consumer({ groupId: 'tags-es-group' });
        await consumer.connect();
        await consumer.subscribe({ topics: ['tags-es-sync'] });

        await consumer.run({
            eachMessage: async ({ message }) => {
                const data = JSON.parse(message.value.toString());
                const places = await Place.find({ _id: { $in: data.places } });
                const activities = await Activity.find({
                    _id: { $in: data.activities },
                });
                await bulkCreateTagIndex([...places, ...activities]);
            },
        });
    } catch (err) {
        throw new KafkaConnectionError('Something went wrong', err);
    }
});
