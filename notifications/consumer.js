import log from 'npmlog';
import { getNotificationObjectFromData } from './utils.js';
import { Notification, UserNotification } from './model.js';
import { emitNotificationUpdate } from './sockets.js';
import { registerConsumerList } from '../common/utils.js';
import BaseConsumer from '../kafka/consumer.js';

class CreateNotificationConsumer extends BaseConsumer {
    constructor() {
        super('create-notification-group', 'create-notification');
    }

    async start() {
        await this.setupConsumer(async (data) => {
            try {
                const notificationObj = getNotificationObjectFromData(data);
                if (notificationObj) {
                    await Notification.create(notificationObj);
                    const newCount = await UserNotification.findOneAndUpdate(
                        { userId: notificationObj.userId },
                        { $inc: { totalCount: 1, unreadCount: 1 } },
                        { new: true }
                    );
                    emitNotificationUpdate(newCount);
                    log.info(
                        `Created new notification of type ${notificationObj.type} and sent message to userId ${notificationObj.userId}`
                    );
                }
            } catch (error) {
                log.error('Failed to create new notification! ', error.message);
            }
        });
    }
}

const notificationConsumerList = [CreateNotificationConsumer];

registerConsumerList(notificationConsumerList);
