import log from 'npmlog';
import { broker, KafkaConnectionError } from '../kafka/index.js';
import { getNotificationObjectFromData } from './utils.js';
import { Notification, UserNotification } from './model.js';
import { emitNotificationUpdate } from './sockets.js';

export const createNotificationsConsumer = async () => {
    try {
        const kafkaClient = broker.getKafkaClient();
        const consumer = kafkaClient.consumer({
            groupId: 'create-notification-group',
        });
        await consumer.connect();
        await consumer.subscribe({ topics: ['create-notification'] });

        await consumer.run({
            eachMessage: async ({
                topic,
                partition,
                message,
                heartbeat,
                pause,
            }) => {
                try {
                    const data = JSON.parse(message.value.toString());
                    const notificationObj = getNotificationObjectFromData(data);
                    if (notificationObj) {
                        await Notification.create(notificationObj);
                        const newCount =
                            await UserNotification.findOneAndUpdate(
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
                    log.error(
                        'Failed to create new notification! ',
                        error.message
                    );
                }
            },
        });
    } catch (err) {
        throw new KafkaConnectionError('Something went wrong', err);
    }
};
