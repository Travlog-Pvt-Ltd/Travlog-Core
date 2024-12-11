import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { getFirebaseStorage } from '../common/config/Firebase.js';
import Draft from './model.js';
import { User } from '../user/model.js';
import redis from '../redis/index.js';
import { updateUserInCache } from '../redis/utils.js';

async function createDraft(req, res) {
    const { title, content, tags, thumbnailUrl } = req.body;
    const thumbnailFile = req.file;
    try {
        let thumbnail;
        if (!thumbnailUrl && !thumbnailFile) thumbnail = null;
        else if (!thumbnailUrl) {
            const currentDate = new Date();
            const storage = getFirebaseStorage(
                process.env.FIREBASE_STORAGE_BUCKET,
                process.env.FIREBASE_API_KEY,
                process.env.FIREBASE_AUTH_DOMAIN,
                process.env.FIREBASE_APP_ID
            );
            const fileRef = ref(
                storage,
                `thumbnails/${thumbnailFile.originalname}::${currentDate}`
            );
            const uploadTask = await uploadBytesResumable(
                fileRef,
                thumbnailFile.buffer
            );
            thumbnail = await getDownloadURL(uploadTask.ref);
        } else thumbnail = thumbnailUrl;
        if (req.query.draftId && req.query.draftId != 'null') {
            const updatedDraft = await Draft.findByIdAndUpdate(
                req.query.draftId,
                { title, content, tags, thumbnail },
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
                thumbnail,
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
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getDrafts(req, res) {
    const limit = req.query.limit || 20;
    const skip = req.query.skip || 0;
    try {
        const foundDrafts = await Draft.find({ author: req.userId })
            .limit(limit)
            .skip(skip)
            .populate('tags.places', 'name')
            .populate('tags.activities', 'name');
        res.status(200).json(foundDrafts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getDraftDetail(req, res) {
    try {
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
                message:
                    'Permission denied! Only the author can view this draft.',
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
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export { createDraft, getDrafts, getDraftDetail };
