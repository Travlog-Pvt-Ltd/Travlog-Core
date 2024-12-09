export const getNotificationObjectFromData = (data) => {
    const fields = [
        'userId',
        'isRead',
        'creatorId',
        'notificationType',
        'blogId',
        'commentId',
        'replyId',
        'creationId',
    ];
    const requiredFields = ['userId', 'notificationType'];
    const result = {};
    for (let i = 0; i < fields.length; i++) {
        if (requiredFields.includes(fields[i]) && !data[fields[i]]) {
            return null;
        }
        if (fields[i] === 'isRead') {
            result[fields[i]] = data[fields[i]] ? true : false;
        } else if (data[fields[i]]) {
            result[fields[i]] = data[fields[i]];
        }
    }
    return result;
};
