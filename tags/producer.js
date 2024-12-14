import BaseProducer from '../kafka/producer.js';

class TagsProducer extends BaseProducer {
    async tagsIndexProducer(data) {
        const payload = {
            places: data?.places || [],
            activities: data?.activities || [],
        };
        await this.produceMessage(payload, 'tags-es-sync');
    }
}

export const tagsProducer = new TagsProducer();

export default TagsProducer;
