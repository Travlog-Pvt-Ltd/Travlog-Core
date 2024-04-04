import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import { getFirebaseStorage } from "../../config/Firebase.js"
import Draft from "../../models/draft.js"
import User from "../../models/user.js"

async function createDraft(req, res) {
    const {
        title,
        content,
        tags,
        thumbnailUrl
    } = req.body
    const thumbnailFile = req.file
    try {
        let thumbnail
        if(!thumbnailUrl && !thumbnailFile) thumbnail=null
        else if (!thumbnailUrl) {
            const currentDate = new Date()
            const storage = getFirebaseStorage(process.env.FIREBASE_STORAGE_BUCKET, process.env.FIREBASE_API_KEY, process.env.FIREBASE_AUTH_DOMAIN, process.env.FIREBASE_APP_ID)
            const fileRef = ref(storage, `thumbnails/${thumbnailFile.originalname}---${currentDate}`)
            const uploadTask = await uploadBytesResumable(fileRef, thumbnailFile.buffer)
            thumbnail = await getDownloadURL(uploadTask.ref)
        }
        else thumbnail = thumbnailUrl
        if (req.query.draftId && req.query.draftId != "null") {
            await Draft.findByIdAndUpdate(req.query.draftId, { title, content, tags, thumbnail })
        }
        else {
            const savedDraft = await Draft.create({
                author: req.userId,
                title,
                content,
                tags,
                thumbnail
            })
            await User.findByIdAndUpdate(req.userId, { $push: { drafts: savedDraft } })
        }
        res.status(201).json({ message: "Draft saved successfully!" })
    } catch (err) {
        res.status(401).json({ message: err.message })
    }
}

async function getDrafts(req, res) {
    const limit = req.query.limit || 20
    const skip = req.query.skip || 0
    try {
        const foundDrafts = await Draft.find({ author: req.userId }).limit(limit).skip(skip)
        res.status(200).json(foundDrafts)
    } catch (err) {
        res.status(401).json({ message: err.message })
    }
}

async function getDraftDetail(req, res) {
    try {
        const foundDraft = await Draft.findOne({ _id: req.params.draftId, author: req.userId })
        if (!foundDraft) return res.status(401).json({ message: "User is not authorized to view this draft!" })
        res.status(200).json(foundDraft)
    } catch (err) {
        res.status(401).json({ message: err.message })
    }
}

export { createDraft, getDrafts, getDraftDetail }