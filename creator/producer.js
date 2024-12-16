import BaseProducer from '../kafka/producer.js';

class CreatorProducer extends BaseProducer {
    async createFollowActivityProducer(data) {
        await this.produceMessage(data, 'create-follow-activity');
    }
}

export const creatorProducer = new CreatorProducer();

export default CreatorProducer;
