import cron from 'node-cron';
import { cleanDeletedComments } from './controllers/comment/utils/jobs.js';

cron.schedule('30 7 * * *', cleanDeletedComments);
