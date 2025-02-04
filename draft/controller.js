import Draft from './model.js';
import { User } from '../user/model.js';
import getRedisClient from '../redis/index.js';
import { updateUserInCache } from '../redis/utils.js';
import { asyncControllerHandler } from '../common/middleware.js';

const createDraft = asyncControllerHandler(async (req, res) => {
    const { title, content, tags, thumbnailUrl } = req.body;
    const redis = await getRedisClient();
    if (req.query.draftId && req.query.draftId != 'null') {
        const updatedDraft = await Draft.findByIdAndUpdate(
            req.query.draftId,
            { title, content, tags, thumbnail: thumbnailUrl },
            { new: true }
        );
        await redis.setEx(
            `draft_data#draft:${req.query.draftId}#author:${req.userId}`,
            3600,
            JSON.stringify(updatedDraft)
        );
    } else {
        const savedDraft = await Draft.create({
            author: req.userId,
            title,
            content,
            tags,
            thumbnail: thumbnailUrl,
        });
        await redis.setEx(
            `draft_data#draft:${req.query.draftId}#author:${req.userId}`,
            3600,
            JSON.stringify(savedDraft)
        );
        const user = await User.findByIdAndUpdate(
            req.userId,
            { $push: { drafts: savedDraft } },
            { new: true }
        )
            .select(
                '-deviceId -token -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
            )
            .populate('followings', '_id userId');
        await updateUserInCache(user);
    }
    res.status(201).json({ message: 'Draft saved successfully!' });
});

const getDrafts = asyncControllerHandler(async (req, res) => {
    const limit = req.query.limit || 20;
    const skip = req.query.skip || 0;
    const foundDrafts = await Draft.find({ author: req.userId })
        .limit(limit)
        .skip(skip)
        .populate('tags.places', 'name')
        .populate('tags.activities', 'name');
    res.status(200).json(foundDrafts);
});

const getDraftDetail = asyncControllerHandler(async (req, res) => {
    const redis = getRedisClient();
    const cachedDraft = await redis.get(
        `draft_data#draft:${req.params.draftId}#author:${req.userId}`
    );
    if (cachedDraft) return res.status(200).json(JSON.parse(cachedDraft));
    const foundDraft = await Draft.findOne({
        _id: req.params.draftId,
        author: req.userId,
    });
    if (!foundDraft)
        return res.status(403).json({
            message: 'Permission denied! Only the author can view this draft.',
        });
    foundDraft
        .populate('tags.places', 'name')
        .populate('tags.activities', 'name');
    await redis.setEx(
        `draft_data#draft:${req.params.draftId}#author:${req.userId}`,
        3600,
        JSON.stringify(foundDraft)
    );
    res.status(200).json(foundDraft);
});

export { createDraft, getDrafts, getDraftDetail };
