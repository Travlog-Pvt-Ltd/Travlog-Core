import User from "../../models/user.js"


async function getUserDetails(req,res){
    try {
        const user = await User.findById(req.userId).select('-password')
        res.status(200).json(user)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
}

export {getUserDetails};