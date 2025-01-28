import cron from 'node-cron';
import { cleanDeletedComments } from './comment/jobs.js';
import { createAndStoreTagsTrie } from './tags/utils.js';

cron.schedule('30 3 * * *', cleanDeletedComments);
cron.schedule('30 3 * * *', createAndStoreTagsTrie);
