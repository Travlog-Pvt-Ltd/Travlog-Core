import Draft from "../../models/draft.js"
import User from "../../models/user.js"

async function createDraft(req,res){
    const {
        title,
        content,
        tags,
        attachments,
    } = req.body
    try {
        const newDraft = new Draft({
            author: req.userId,
            title,
            content,
            tags,
            attachments
        })
        const savedDraft = await newDraft.save()
        await User.findByIdAndUpdate(req.userId, {$push:{drafts:savedDraft}})
        res.status(201).json("Draft saved successfully!")
    } catch (err) {
        res.status(401).json({message: err.message})
    }
}

async function getDrafts(req,res){
    const limit = req.query.limit || 20
    const skip = req.query.skip || 0
    try {
        const foundDrafts = await Draft.find({author: req.userId}).limit(limit).skip(skip)
        res.status(200).json(foundDrafts)
    } catch (err) {
        res.status(401).json({message: err.message})
    }
}

export {createDraft, getDrafts}