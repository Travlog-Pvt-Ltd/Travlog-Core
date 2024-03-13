

const likeBlog = async(req,res) => {
    try {
        
    } catch (err) {
        res.status(401).json({message: err.message})
    }
}

export {likeBlog}