import mongoose from 'mongoose';
import UserActivity from '../../models/userActivity.js';
import Blog from '../../models/blog.js';
import BlogInstance from '../../models/blogInstance.js';
import LCEvent from '../../models/likeCommentEvent.js';
import User from '../../models/user.js';
import OrganicUserInstance from '../../models/organicUserInstance.js';
import UserInstance from '../../models/userInstance.js';
import Draft from '../../models/draft.js';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { getFirebaseStorage } from '../../config/Firebase.js';
import redis, {
    deleteKeysByPatternWithScan,
    updateUserInCache,
} from '../../config/redis.js';
import { authorFieldsForBlog, blogFieldsToSelect } from './utils/constants.js';
import Place from '../../models/place.js';
import Activity from '../../models/activities.js';
import { tagsIndexProducer } from '../../controllers/tags/asyncService/producers.js';

async function getAllBlogs(req, res) {
    const limit = req.query.limit || 20;
    const skip = req.query.skip || 0;
    try {
        const blogs = await Blog.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .select(blogFieldsToSelect)
            .populate('author', authorFieldsForBlog)
            .populate('tags.places', 'name')
            .populate('tags.activities', 'name');
        res.status(200).json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getUserBlogs(req, res) {
    const limit = req.query.limit || 20;
    const skip = req.query.skip || 0;
    try {
        const cachedBlogs = await redis.get(
            `user_blogs:${req.userId}?limit:${limit}&skip:${skip}`
        );
        if (cachedBlogs) {
            return res.status(200).json(JSON.parse(cachedBlogs));
        }
        const blogs = await Blog.find({ author: req.userId })
            .limit(limit)
            .skip(skip)
            .select(blogFieldsToSelect)
            .populate('author', authorFieldsForBlog)
            .populate('tags.places', 'name')
            .populate('tags.activities', 'name');
        redis.setEx(
            `user_blogs:${req.userId}?limit:${limit}&skip:${skip}`,
            3600,
            JSON.stringify(blogs)
        );
        res.status(200).json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getBlogDetail(req, res) {
    const id = req.query.id;
    try {
        if (!id) {
            const blog = await Blog.findById(req.params.blogId)
                .select(
                    '-system_tags -likes -shares -dislikes -views -comments -bookmarks'
                )
                .populate('author', authorFieldsForBlog)
                .populate('tags.places', 'name')
                .populate('tags.activities', 'name');
            res.status(200).json(blog);
        } else {
            const blog = await Blog.findById(req.params.blogId).populate(
                'views'
            );
            const userObject = new mongoose.Types.ObjectId(id);
            let check = false;
            blog.views.forEach((item) => {
                if (item.userId.equals(userObject)) check = true;
            });
            if (check) {
                const blog = await Blog.findById(req.params.blogId)
                    .select(
                        '-system_tags -likes -shares -dislikes -views -comments -bookmarks'
                    )
                    .populate('author', authorFieldsForBlog)
                    .populate('tags.places', 'name')
                    .populate('tags.activities', 'name');
                res.status(200).json(blog);
            } else {
                const instance = await UserInstance.create({ userId: id });
                const blog = await Blog.findByIdAndUpdate(
                    req.params.blogId,
                    { $push: { views: instance._id }, $inc: { viewCount: 1 } },
                    { new: true }
                )
                    .select(
                        '-system_tags -likes -shares -dislikes -views -comments -bookmarks'
                    )
                    .populate('author', authorFieldsForBlog)
                    .populate('tags.places', 'name')
                    .populate('tags.activities', 'name');
                res.status(201).json(blog);
            }
        }

        // if (!id) return res.status(401).json({ message: "UserId required!" })
        // const blog = await Blog.findById(req.params.blogId).populate("views organicViews")
        // if (id.split("-")[0] != 'Organic') {
        //     const foundUser = await User.findById(id)
        //     const userObject = new mongoose.Types.ObjectId(id)
        //     let check = false
        //     blog.views.forEach(item => {
        //         if (item.userId.equals(userObject)) check = true
        //     })
        //     if (check) {
        //         const blog = await Blog.findById(req.params.blogId).select("-system_tags -likes -shares -dislikes -views -organicViews -comments -bookmarks").populate("author", "_id name profileLogo followers")
        //         res.status(200).json(blog)
        //     }
        //     else {
        //         check = false
        //         const toDelete = []
        //         const newOrganicInstance = []
        //         blog.organicViews.forEach(item => {
        //             if (item.userId == foundUser.deviceId) {
        //                 check = true
        //                 toDelete.push(item)
        //             }
        //             else {
        //                 newOrganicInstance.push(item)
        //             }
        //         })
        //         if (check) {
        //             toDelete.forEach(async (el) => {
        //                 await OrganicUserInstance.findByIdAndDelete(el._id)
        //             })
        //             const instance = await UserInstance.create({ userId: id })
        //             const blog = await Blog.findByIdAndUpdate(req.params.blogId, { $push: { views: instance }, $set: { organicViews: newOrganicInstance }, $inc: { viewCount: 1, organicViewCount: -1 } }, { new: true }).select("-system_tags -likes -shares -dislikes -views -organicViews -comments -bookmarks").populate("author", "_id name profileLogo followers")
        //             res.status(201).json(blog)
        //         }
        //         else {
        //             const instance = await UserInstance.create({ userId: id })
        //             const blog = await Blog.findByIdAndUpdate(req.params.blogId, { $push: { views: instance._id }, $inc: { viewCount: 1 } }, { new: true }).select("-system_tags -likes -shares -dislikes -views -organicViews -comments -bookmarks").populate("author", "_id name profileLogo followers")
        //             res.status(201).json(blog)
        //         }
        //     }
        // }
        // else {
        //     let check = false
        //     blog.organicViews.forEach(item => {
        //         if (item.userId == id) check = true
        //     })
        //     if (check) {
        //         const blog = await Blog.findById(req.params.blogId).select("-system_tags -likes -shares -dislikes -views -organicViews -comments -bookmarks").populate("author", "_id name profileLogo followers")
        //         res.status(200).json(blog)
        //     }
        //     else {
        //         const organicInstance = await OrganicUserInstance.create({ userId: id })
        //         const blog = await Blog.findByIdAndUpdate(req.params.blogId, { $push: { organicViews: organicInstance }, $inc: { organicViewCount: 1 } }, { new: true }).select("-system_tags -likes -shares -dislikes -views -organicViews -comments -bookmarks").populate("author", "_id name profileLogo followers")
        //         res.status(201).json(blog)
        //     }
        // }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function createBlog(req, res) {
    const { title, content, tags, thumbnailUrl } = req.body;
    const thumbnailFile = req.file;
    try {
        let thumbnail;
        if (!thumbnailUrl) {
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
        const newBlog = new Blog({
            author: req.userId,
            title,
            content,
            tags,
            thumbnail,
        });
        const savedBlog = await newBlog.save();
        let user;
        if (req.query.draftId && req.query.draftId != 'null') {
            user = await User.findByIdAndUpdate(
                req.userId,
                {
                    $push: { blogs: savedBlog },
                    $pull: { drafts: req.query.draftId },
                },
                { new: true }
            )
                .select(
                    '-deviceId -token -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
                )
                .populate('followings', '_id userId');
            await Draft.findByIdAndDelete(req.query.draftId);
        } else {
            user = await User.findByIdAndUpdate(
                req.userId,
                { $push: { blogs: savedBlog } },
                { new: true }
            )
                .select(
                    '-deviceId -token -followers -visitors -organicVisitors -blogs -bookmarks -drafts -itenaries -notifications'
                )
                .populate('followings', '_id userId');
        }
        await Promise.all([
            updateUserInCache(user),
            Place.updateMany(
                { _id: { $in: tags.places } },
                { $inc: { blogCount: 1 } }
            ),
            Activity.updateMany(
                { _id: { $in: tags.activities } },
                { $inc: { blogCount: 1 } }
            ),
            deleteKeysByPatternWithScan(`user_blogs:${req.userId}`),
        ]);
        await tagsIndexProducer({
            places: tags.places,
            activities: tags.activities,
        });
        res.status(201).json({ messsage: 'Blog created successfully!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function deleteBlog(req, res) {
    try {
        const tags = await Blog.findById(req.params.blogId).tags;
        const blogInstances = await BlogInstance.find({
            blogId: req.params.blogId,
        });
        const lceEvents = await LCEvent.find({ blogId: req.params.blogId });
        await Promise.all([
            Place.updateMany(
                { _id: { $in: tags.places } },
                { $inc: { blogCount: -1 } }
            ),
            Activity.updateMany(
                { _id: { $in: tags.activities } },
                { $inc: { blogCount: -1 } }
            ),
            Blog.findByIdAndDelete(req.params.blogId),
            User.findByIdAndUpdate(req.userId, {
                $pull: { blogs: req.params.blogId },
            }),
            BlogInstance.deleteMany({ blogId: req.params.blogId }),
            UserActivity.updateOne(
                { userId: req.userId },
                {
                    $pull: {
                        readEvent: { $in: blogInstances },
                    },
                    likeEvent: { $in: lceEvents },
                    dislikeEvent: { $in: lceEvents },
                    commentEvent: { $in: lceEvents },
                }
            ),
            LCEvent.deleteMany({ blogId: req.params.blogId }),
            deleteKeysByPatternWithScan(`user_blogs:${req.userId}`),
        ]);
        await tagsIndexProducer({
            places: tags.places,
            activities: tags.activities,
        });
        res.status(204).json('Successfully deleted blog!');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const getSearchedBlogs = async (req, res) => {
    const tagId = req.params.tagId;
    const isPlace = req.query.isPlace || false;
    const limit = req.query.limit || 10;
    const skip = req.query.skip || 0;
    try {
        if (isPlace) {
            await Promise.all([
                UserActivity.findOneAndUpdate(
                    { userId: req.userId },
                    { $addToSet: { placeSearches: tagId } }
                ),
                Place.updateOne({ _id: tagId }, { $inc: { searchCount: 1 } }),
            ]);
            const result = await Blog.find({ 'tags.places': tagId })
                .sort({ likeCount: -1 })
                .limit(limit)
                .skip(skip)
                .select(blogFieldsToSelect)
                .populate('author', authorFieldsForBlog)
                .populate('tags.places', 'name')
                .populate('tags.activities', 'name');
            res.status(200).json(result);
        } else {
            await Promise.all([
                UserActivity.findOneAndUpdate(
                    { userId: req.userId },
                    { $addToSet: { activitySearches: tagId } }
                ),
                Activity.updateOne(
                    { _id: tagId },
                    { $inc: { searchCount: 1 } }
                ),
            ]);
            const result = await Blog.find({ 'tags.activities': tagId })
                .sort({ likeCount: -1 })
                .limit(limit)
                .skip(skip)
                .select(blogFieldsToSelect)
                .populate('author', authorFieldsForBlog)
                .populate('tags.places', 'name')
                .populate('tags.activities', 'name');
            res.status(200).json(result);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export {
    createBlog,
    getAllBlogs,
    getUserBlogs,
    getBlogDetail,
    deleteBlog,
    getSearchedBlogs,
};
