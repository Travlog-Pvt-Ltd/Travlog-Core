import log from 'npmlog';
import Comment from './model.js';
import { timeTillCommentDeletion } from './constants.js';
import LCEvent from '../common/models/likeCommentEvent.js';
import UserActivity from '../userActivity/model.js';

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
        const updatePromises = [];
        for (let i = 0; i < data.length; i++) {
            if (data.parent) {
                updatePromises.push(
                    Comment.findByIdAndUpdate(data.parent, {
                        $pull: { replies: data._id },
                        $inc: { replyCount: -1 },
                    })
                );
            }
        }
        await Promise.all(updatePromises);
        log.info('Updated parent comments');
        log.info('Started cleaning related user activities...');
        const events = await LCEvent.find({ commentId: { $in: comments } });
        await Promise.all([
            LCEvent.deleteMany({ commentId: { $in: comments } }),
            UserActivity.updateMany(
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
            ),
        ]);
        log.info('Successfully cleaned related user activities...');
    } catch (error) {
        log.error('Cleaning deleted comments failed! ', error.message);
    }
};
