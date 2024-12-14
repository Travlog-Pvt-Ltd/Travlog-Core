import BaseProducer from '../kafka/producer.js';

class LikeProducer extends BaseProducer {
    async updateBlogLDActivityProducer(data) {
        await this.produceMessage(data, 'update-blog-LD-activity');
    }

    async updateCommentLDActivityProducer(data) {
        await this.produceMessage(data, 'update-comment-LD-activity');
    }

    async blogLDNotificationProducer(data) {
        await this.produceMessage(data, 'process-blog-LD-notification');
    }
}

export const likeProducer = new LikeProducer();

export default LikeProducer;
