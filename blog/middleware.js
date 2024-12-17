import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { getFirebaseStorage } from '../common/config/Firebase.js';

export const getThumbnailUrl = async (req, res, next) => {
    try {
        const thumbnailFile = req.file;
        if (!req.body?.thumbnailUrl && thumbnailFile) {
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
            req.body.thumbnailUrl = await getDownloadURL(uploadTask.ref);
        }
        next();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
