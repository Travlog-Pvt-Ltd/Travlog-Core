import log from 'npmlog';
import { markRepliesForDeletion } from './utils.js';
import { NotificationSendingService } from '../notifications/service.js';
import CommentActivityService from './service.js';
import BaseConsumer from '../kafka/consumer.js';
import { registerConsumerList } from '../common/utils.js';

class CommentDeleteConsumer extends BaseConsumer {
    constructor() {
        super('comment-delete-group', 'mark-comment-delete');
    }

    async start() {
        await this.setupConsumer(async (comment) => {
            await markRepliesForDeletion(comment);
            log.info('Comments marked for deletion.');
        });
    }
}

class CreateCommentActivityConsumer extends BaseConsumer {
    constructor() {
        super('comment-activity-group', 'create-comment-activity');
    }

    async start() {
        const service = new CommentActivityService();
        await this.setupConsumer(async (data) => {
            await service.createCommentActivity(data);
        });
    }
}

class EditCommentActivityConsumer extends BaseConsumer {
    constructor() {
        super('edited-comment-activity-group', 'edited-comment-activity');
    }

    async start() {
        const service = new CommentActivityService();
        await this.setupConsumer(async (data) => {
            await service.editCommentActivity(data);
        });
    }
}

class CommentNotificationConsumer extends BaseConsumer {
    constructor() {
        super('comment-notification-group', 'process-comment-notification');
    }

    async start() {
        const service = new NotificationSendingService();
        await this.setupConsumer(async (data) => {
            try {
                await service.processComment(data);
                log.info(
                    `Processing notification for blog ${data.blogId}, comment ${data.commentId}, event ${data.event} and creator ${data.creatorId}`
                );
            } catch (error) {
                log.error(
                    `Failed to process notification for blog ${data.blogId}, comment ${data.commentId}, event ${data.event} and creator ${data.creatorId} `,
                    error.message
                );
            }
        });
    }
}

const commentConsumerList = [
    CommentDeleteConsumer,
    CreateCommentActivityConsumer,
    EditCommentActivityConsumer,
    CommentNotificationConsumer,
];

registerConsumerList(commentConsumerList);
