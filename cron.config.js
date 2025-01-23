import cron from 'node-cron';
import { cleanDeletedComments } from './comment/jobs.js';
import { createAndStoreTagTrie } from './tags/utils.js';

cron.schedule('30 3 * * *', cleanDeletedComments);
cron.schedule('30 3 * * *', createAndStoreTagTrie);
