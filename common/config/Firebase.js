import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

export const getFirebaseStorage = (bucket, key, auth, appId) => {
    const firebaseConfig = {
        apiKey: key,
        authDomain: auth,
        projectId: 'travlog-418006',
        storageBucket: bucket,
        messagingSenderId: '407983636348',
        appId: appId,
    };
    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    return storage;
};
