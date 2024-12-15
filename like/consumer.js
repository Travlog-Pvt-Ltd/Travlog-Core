import log from 'npmlog';
import LikeDislikeActivityService from './service.js';
import { NotificationSendingService } from '../notifications/service.js';
import { registerConsumerList } from '../common/utils.js';
import BaseConsumer from '../kafka/consumer.js';

class BlogLDActivityConsumer extends BaseConsumer {
    constructor() {
        super('blog-like-activity-group', 'update-blog-LD-activity');
    }

    async start() {
        await this.setupConsumer(async (data) => {
            const service = new LikeDislikeActivityService();
            const { blogId, userId, type, create, clean } = data;
            try {
                await service.updateBlogLDActivity(
                    blogId,
                    userId,
                    type,
                    create,
                    clean
                );
                log.info(
                    `UserActivity updated for userId: ${userId}, blogId: ${blogId}, type: ${type} # actions: ${create ? 'Create' : ''} ${clean ? 'Clean' : ''}`
                );
            } catch (error) {
                log.error(error.message);
                log.info('Retrying after 5 seconds...');
                await new Promise((res) => setTimeout(res, 5000));
                try {
                    await service.updateBlogLDActivity(
                        blogId,
                        userId,
                        type,
                        create,
                        clean
                    );
                    log.info(
                        `UserActivity updated for userId: ${userId}, blogId: ${blogId}, type: ${type} # actions: ${create ? 'Create' : ''} ${clean ? 'Clean' : ''}`
                    );
                } catch (err) {
                    log.error('Something went wrong, retry failed ', err);
                }
            }
        });
    }
}

class CommentLDActivityConsumer extends BaseConsumer {
    constructor() {
        super('comment-like-activity-group', 'update-comment-LD-activity');
    }

    async start() {
        await this.setupConsumer(async (data) => {
            const service = new LikeDislikeActivityService();
            const { blogId, commentId, userId, type, create, clean } = data;
            try {
                await service.updateCommentLDActivity(
                    blogId,
                    commentId,
                    userId,
                    type,
                    create,
                    clean
                );
                log.info(
                    `UserActivity updated for userId: ${userId}, blogId: ${blogId}, commentId: ${commentId}, type: ${type} # actions: ${create ? 'Create' : ''} ${clean ? 'Clean' : ''}`
                );
            } catch (error) {
                log.error(error.message);
                log.info('Retrying after 5 seconds...');
                await new Promise((res) => setTimeout(res, 5000));
                try {
                    await service.updateCommentLDActivity(
                        blogId,
                        commentId,
                        userId,
                        type,
                        create,
                        clean
                    );
                    log.info(
                        `UserActivity updated for userId: ${userId}, blogId: ${blogId}, commentId: ${commentId}, type: ${type} # actions: ${create ? 'Create' : ''} ${clean ? 'Clean' : ''}`
                    );
                } catch (err) {
                    log.error('Something went wrong, retry failed ', err);
                }
            }
        });
    }
}

class BlogLDNotificationConsumer extends BaseConsumer {
    constructor() {
        super('blog-LD-notification-group', 'process-blog-LD-notification');
    }

    async start() {
        await this.setupConsumer(async (data) => {
            const service = new NotificationSendingService();
            try {
                await service.processLDOnBlog(data);
                log.info(
                    `Processing notification for blog ${data.blogId}, event ${data.event} and creator ${data.creatorId}`
                );
            } catch (error) {
                log.error(
                    `Failed to process notification for blog ${data.blogId}, event ${data.event} and creator ${data.creatorId} `,
                    error.message
                );
            }
        });
    }
}

const likeConsumerList = [
    BlogLDActivityConsumer,
    CommentLDActivityConsumer,
    BlogLDNotificationConsumer,
];

registerConsumerList(likeConsumerList);
