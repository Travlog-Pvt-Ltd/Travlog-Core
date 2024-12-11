import express from 'express';
import auth from '../auth/middlewares/auth.js';
import { createDraft, getDraftDetail, getDrafts } from './controller.js';
import { upload } from '../common/config/Multer.js';

const draftRouter = express.Router();

draftRouter.post('/', auth, upload.single('thumbnailFile'), createDraft);
draftRouter.get('/all', auth, getDrafts);
draftRouter.get('/:draftId', auth, getDraftDetail);

export default draftRouter;
