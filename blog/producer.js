import BaseProducer from '../kafka/producer.js';

class BlogProducer extends BaseProducer {
    async extractTagsProducer(data) {
        await this.produceMessage(data, 'extract-system-tags');
    }
}

export const blogProducer = new BlogProducer();

export default BlogProducer;
