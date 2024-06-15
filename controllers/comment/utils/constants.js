export const commentFields = {
    path: "comments",
    select: "-likes -replies -dislikes",
    options: { sort: { createdAt: -1 } },
    populate: {
        path: "userId",
        select: "_id name profileLogo"
    }
}

export const replyFields = {
    path: "replies",
    select: "-likes -replies -dislikes",
    options: { sort: { createdAt: -1 } },
    populate: {
        path: "userId",
        select: "_id name profileLogo"
    }
}