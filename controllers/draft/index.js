import Draft from "../../models/draft.js"
import User from "../../models/user.js"

async function createDraft(req,res){
    const {
        title,
        content,
        tags,
        attachments,
        thumbnail
    } = req.body
    try {
        if(req.query.draftId && req.query.draftId!="null"){
            await Draft.findByIdAndUpdate(req.query.draftId, req.body)
        }
        else{
            const savedDraft = await Draft.create({
                author: req.userId,
                title,
                content,
                tags,
                attachments,
                thumbnail
            })
            await User.findByIdAndUpdate(req.userId, {$push:{drafts:savedDraft}})
        }
        res.status(201).json({message: "Draft saved successfully!"})
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

async function getDraftDetail(req,res){
    try {
        const foundDraft = await Draft.findOne({_id: req.params.draftId, author: req.userId})
        if(!foundDraft) return res.status(401).json({message: "User is not authorized to view this draft!"})
        res.status(200).json(foundDraft)
    } catch (err) {
        res.status(401).json({message: err.message})
    }
}

export {createDraft, getDrafts, getDraftDetail}