import Tag from "../../models/tags.js";


const searchTags = async(req,res) => {
    try {
        const keyword = req.query.search
        ? {
            $and: [
                { name: { $regex: req.query.search, $options: "i" } },
            ]
        }
        : {};
        const tags = await Tag.find(keyword).limit(10)
        res.status(200).json(tags)
    } catch (err) {
        res.status(401).json({message: err.message})
    }
}

export {searchTags}