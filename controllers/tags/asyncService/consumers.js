import Place from '@models/place.js';
import { bulkCreateTagIndex } from '../searchUtils.js';
import { broker, KafkaConnectionError } from '@utils/kafka/index.js';
import Activity from '@models/activities.js';

export const tagsIndexConsumer = async () => {
    try {
        const kafkaClient = broker.getKafkaClient();
        const consumer = kafkaClient.consumer({ groupId: 'tags-es-group' });
        await consumer.connect();
        await consumer.subscribe({ topics: ['tags-es-sync'] });

        await consumer.run({
            eachMessage: async ({
                topic,
                partition,
                message,
                heartbeat,
                pause,
            }) => {
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
};
