import jwt from "jsonwebtoken";

async function auth(req, res, next){
    try {
        const token = req.headers.authorization.split(" ")[1];
        const designation = req.headers.authorization.split(" ")[0];
        let decodedData;
        if(token && designation=="Bearer") {
            decodedData = jwt.verify(token, process.env.USER_SECRET);
            req.userId = decodedData?.id;
        }
        next();
    } catch (error) {
        res.status(401).json({message: error.message});
        console.log(error);
    }
}

export default auth;
