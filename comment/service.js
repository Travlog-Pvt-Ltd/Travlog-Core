import { LCEvent, UserActivity } from '../userActivity/model.js';
import UserActivityService from '../userActivity/service.js';

class CommentActivityService extends UserActivityService {
    constructor() {
        super();
        this.message = '';
    }

    async createCommentActivity(data) {
        const {
            blogId,
            commentId,
            isComment = false,
            onComment = false,
            content,
            userId,
        } = data;
        const commentEvent = await LCEvent.create({
            blogId,
            isComment,
            commentId,
            onComment,
            content,
            isDislike: false,
        });

        await UserActivity.findOneAndUpdate(
            { userId: userId },
            {
                $push: { commentEvent: commentEvent._id },
            },
            { upsert: true }
        );
    }

    async editCommentActivity(data) {
        const { commentId, content, userId } = data;
        const event = await LCEvent.find({
            commentId,
            isComment: true,
        });
        event.edited = true;
        event.content = content;
        event.userId = userId;
        this.createCommentActivity(event);
    }
}

export default CommentActivityService;
