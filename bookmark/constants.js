export const bookmarkField = {
    path: 'bookmarks',
    populate: {
        path: 'blogId',
        select: '_id title content author tags likeCount commentCount viewCount shareCount thumbnail createdAt updatedAt',
        options: { sort: { createdAt: -1 } },
        populate: [
            {
                path: 'author',
                select: '_id name profileLogo',
            },
            {
                path: 'tags.places',
                select: 'name',
            },
            {
                path: 'tags.activities',
                select: 'name',
            },
        ],
    },
};
