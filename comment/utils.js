import Comment from './model.js';

export const markRepliesForDeletion = async (comment) => {
    await Comment.updateMany(
        { parent: comment._id },
        { toDelete: true, markedForDeletionAt: Date.now() }
    );
    const replies = comment.replies || [];
    for (let i = 0; i < replies.length; i++) {
        const reply = await Comment.findById(replies[i]);
        await markRepliesForDeletion(reply);
    }
};
