export const activityPopulateField = [
    {
        path: 'userId',
        select: 'name email',
    },
    {
        path: 'followEvent',
        populate: {
            path: 'userId',
            select: 'name',
        },
    },
    {
        path: 'unfollowEvent',
        populate: {
            path: 'userId',
            select: 'name',
        },
    },
    {
        path: 'readEvent',
        populate: {
            path: 'blogId',
            options: {
                virtuals: true,
            },
            select: 'title content thumbnail author',
            populate: {
                path: 'author',
                select: 'name',
            },
        },
    },
    {
        path: 'likeEvent',
        populate: [
            {
                path: 'blogId',
                options: {
                    virtuals: true,
                },
                select: 'title content thumbnail author',
                populate: {
                    path: 'author',
                    select: 'name',
                },
            },
            {
                path: 'commentId',
                select: 'userId content isReply likeCount dislikeCount',
                populate: {
                    path: 'userId',
                    select: 'name',
                },
            },
        ],
    },
    {
        path: 'dislikeEvent',
        populate: [
            {
                path: 'blogId',
                select: 'title content thumbnail author',
                populate: {
                    path: 'author',
                    select: 'name',
                },
            },
            {
                path: 'commentId',
                select: 'userId content isReply likeCount dislikeCount',
                populate: {
                    path: 'userId',
                    select: 'name',
                },
            },
        ],
    },
    {
        path: 'commentEvent',
        populate: [
            {
                path: 'blogId',
                select: 'title content thumbnail author',
                populate: {
                    path: 'author',
                    select: 'name',
                },
            },
            {
                path: 'commentId',
                select: 'userId content isReply likeCount dislikeCount',
                populate: {
                    path: 'userId',
                    select: 'name',
                },
            },
        ],
    },
];

export const activitySelectField =
    'userId followEvent unfollowEvent readEvent likeEvent dislikeEvent commentEvent';
