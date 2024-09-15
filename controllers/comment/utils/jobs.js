import log from 'npmlog';
import Comment from '../../../models/comment.js';
import { timeTillCommentDeletion } from './constants.js';
import LCEvent from '../../../models/likeCommentEvent.js';
import UserActivity from '../../../models/userActivity.js';

export const cleanDeletedComments = async () => {
    const deleteTimestamp = new Date();
    deleteTimestamp.setDate(
        deleteTimestamp.getDate() - timeTillCommentDeletion
    );
    try {
        log.info('Cleaning deleted comments...');
        const data = await Comment.find({
            $or: [
                {
                    $and: [
                        { deleted: true },
                        { updatedAt: { $lt: deleteTimestamp } },
                    ],
                },
                {
                    $and: [
                        { toDelete: true },
                        { markedForDeletionAt: { $lt: deleteTimestamp } },
                    ],
                },
            ],
        }).select('_id parent');
        const comments = [];
        data.forEach((el) => {
            comments.push(el._id);
        });
        await Comment.deleteMany({
            $or: [
                {
                    $and: [
                        { deleted: true },
                        { updatedAt: { $lt: deleteTimestamp } },
                    ],
                },
                {
                    $and: [
                        { toDelete: true },
                        { markedForDeletionAt: { $lt: deleteTimestamp } },
                    ],
                },
            ],
        });
        log.info('Successfully cleaned deleted comments');
        log.info('Updating parent comments...');
        for (let i = 0; i < data.length; i++) {
            if (data.parent) {
                await Comment.findByIdAndUpdate(data.parent, {
                    $pull: { replies: data._id },
                    $inc: { replyCount: -1 },
                });
            }
        }
        log.info('Updated parent comments');
        log.info('Started cleaning related user activities...');
        const events = await LCEvent.find({ commentId: { $in: comments } });
        await LCEvent.deleteMany({ commentId: { $in: comments } });
        await UserActivity.updateMany(
            {
                $or: [
                    { likeEvent: { $in: events } },
                    { dislikeEvent: { $in: events } },
                    { commentEvent: { $in: events } },
                ],
            },
            {
                $pull: {
                    likeEvent: { $in: events },
                    dislikeEvent: { $in: events },
                    commentEvent: { $in: events },
                },
            }
        );
        log.info('Successfully cleaned related user activities...');
    } catch (error) {
        log.error('Cleaning deleted comments failed! ', error.message);
    }
};
