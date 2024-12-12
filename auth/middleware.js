import jwt from 'jsonwebtoken';
// import { initializeApp } from 'firebase/app';
// import admin from 'firebase-admin'

async function auth(req, res, next) {
    try {
        if (!req.headers.authorization)
            return res.status(403).json({ message: 'Unauthorized request!' });
        const token = req.headers.authorization.split(' ')[1];
        const designation = req.headers.authorization.split(' ')[0];
        let decodedData;
        if (designation != 'Bearer')
            return res.status(403).json({ message: 'Unauthorized request!' });
        else if (token) {
            decodedData = jwt.verify(token, process.env.USER_SECRET);
            req.userId = decodedData?.id;
            next();
        }
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
}

// const firebaseConfig = {
//   apiKey: process.env.FIREBASE_API_KEY,
//   authDomain: process.env.FIREBASE_AUTH_DOMAIN,
//   projectId: "travlog-418006",
//   storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: "407983636348",
//   appId: process.env.FIREBASE_APP_ID
// }

// const app = initializeApp(firebaseConfig);

// admin.initializeApp({
//     credential: admin.credential.applicationDefault(),
//     projectId: firebaseConfig.projectId,
// });

// const OAuth = async (req, res, next) => {
//     try {
//         const decodedToken = await admin.auth().verifyIdToken(req.body.OAuthtoken);
//         if(!decodedToken.uid) return res.status(401).json({message:"Invaild login!"})
//         next()
//     }
//     catch (error) {
//         res.status(500).json({ message: "Unauthorized Request!", error: error })
//     };
// }

export { auth };
