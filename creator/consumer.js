import BaseConsumer from '../kafka/consumer.js';
import { registerConsumerList } from '../common/utils.js';
import CreatorActivityService from './service.js';

class CreateFollowActivityConsumer extends BaseConsumer {
    constructor() {
        super('follow-activity-group', 'create-follow-activity');
    }

    async start() {
        const service = new CreatorActivityService();
        await this.setupConsumer(async (data) => {
            await service.createFollowActivity(data);
        });
    }
}

const creatorConsumerList = [CreateFollowActivityConsumer];

registerConsumerList(creatorConsumerList);
