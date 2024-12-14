import BaseProducer from '../kafka/producer.js';

class NotificationProducer extends BaseProducer {
    async createNotificationsProducer(data) {
        await this.produceMessage(data, 'create-notification');
    }
}

export const notificationProducer = new NotificationProducer();

export default NotificationProducer;
