import express from 'express';
import { auth } from '../auth/middleware.js';
import { createDraft, getDraftDetail, getDrafts } from './controller.js';
import { upload } from '../common/config/Multer.js';
import { getThumbnailUrl } from '../blog/middleware.js';

const draftRouter = express.Router();

draftRouter.post(
    '/',
    auth,
    upload.single('thumbnailFile'),
    getThumbnailUrl,
    createDraft
);
draftRouter.get('/all', auth, getDrafts);
draftRouter.get('/:draftId', auth, getDraftDetail);

export default draftRouter;
