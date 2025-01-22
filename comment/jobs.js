import log from 'npmlog';
import Comment from './model.js';
import { Blog } from '../blog/model.js';
import { timeTillCommentDeletion } from './constants.js';
import { UserActivity, LCEvent } from '../userActivity/model.js';

export const cleanDeletedComments = async () => {
    const deleteTimestamp = new Date();
    deleteTimestamp.setDate(
        deleteTimestamp.getDate() - timeTillCommentDeletion
    );
    try {
        log.info('Cleaning orphaned deleted comments...'); // Deleted comments with not replies

        const data = await Comment.aggregate([
            {
                $match: {
                    deleted: true,
                    updatedAt: { $lt: deleteTimestamp },
                },
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: '_id',
                    foreignField: 'parent',
                    as: 'replies',
                },
            },
            {
                $addFields: {
                    allRepliesDeleted: {
                        $cond: {
                            if: { $eq: [{ $size: '$replies' }, 0] }, // No replies at all
                            then: true,
                            else: {
                                $not: {
                                    $size: {
                                        $filter: {
                                            input: '$replies',
                                            as: 'reply',
                                            cond: {
                                                $eq: ['$$reply.deleted', false],
                                            }, // Checking if any reply is not deleted
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            {
                $match: {
                    allRepliesDeleted: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    parent: 1,
                    blog: 1,
                    isReply: 1,
                },
            },
        ]);

        const comments = [];
        data.forEach((el) => {
            comments.push(el._id);
        });
        await Comment.deleteMany({ _id: { $in: comments } });
        log.info('Cleaned orphaned deleted comments');

        log.info('Updating parent blogs...');
        let updatePromises = [];
        for (let i = 0; i < data.length; i++) {
            if (data.blog) {
                updatePromises.push(
                    Blog.findByIdAndUpdate(data.blog, {
                        $pull: { comments: data._id },
                        $inc: { commentCount: -1 },
                    })
                );
            }
        }
        await Promise.all(updatePromises);
        log.info('Updated parent blogs');

        log.info('Updating parent comments...');
        updatePromises = [];
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
