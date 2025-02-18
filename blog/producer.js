import BaseProducer from '../kafka/producer.js';

class BlogProducer extends BaseProducer {
    async extractTagsProducer(data) {
        /*
            TODO [Aryan | 2025-02-18]
            - Use compression here since the blog content can be large.
        */
        await this.produceMessage(data, 'extract-system-tags');
    }
}

export const blogProducer = new BlogProducer();

export default BlogProducer;
