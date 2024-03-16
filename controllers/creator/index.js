import Blog from "../../models/blog.js"


const moreFromAuthor = async (req, res) => {
    const author = req.params.authorId
    try {
        const moreBlogs = await Blog.find({ author: author }).sort({ likes: -1 }).limit(3).populate("author","_id name profileLogo followers")
        res.status(200).json(moreBlogs)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export { moreFromAuthor }