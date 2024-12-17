import cron from 'node-cron';
import { cleanDeletedComments } from './comment/jobs.js';

cron.schedule('30 3 * * *', cleanDeletedComments);
