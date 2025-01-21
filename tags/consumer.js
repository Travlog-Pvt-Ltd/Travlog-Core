import { Place, Activity } from './model.js';
import { bulkCreateTagIndex } from './searchUtils.js';
import { registerConsumerList } from '../common/utils.js';
import BaseConsumer from '../kafka/consumer.js';

class IndexTagsConsumer extends BaseConsumer {
    constructor() {
        super('tags-es-group', 'tags-es-sync');
    }

    async start() {
        await this.setupConsumer(async (data) => {
            const places = await Place.find({ _id: { $in: data.places } })
                .populate('parent', 'name')
                .populate('district', 'name')
                .populate('state', 'name');
            const activities = await Activity.find({
                _id: { $in: data.activities },
            });
            await bulkCreateTagIndex([...places, ...activities]);
        });
    }
}

const tagsConsumerList = [IndexTagsConsumer];

registerConsumerList(tagsConsumerList);
