import BaseProducer from '../kafka/producer.js';

class CommentProducer extends BaseProducer {
    async deleteCommentProducer(data) {
        await this.produceMessage(data, 'mark-comment-delete');
    }

    async createCommentActivityProducer(data) {
        await this.produceMessage(data, 'create-comment-activity');
    }

    async editedCommentActivityProducer(data) {
        await this.produceMessage(data, 'edited-comment-activity');
    }

    async commentNotificationProducer(data) {
        await this.produceMessage(data, 'process-comment-notification');
    }
}

export const commentProducer = new CommentProducer();

export default CommentProducer;
