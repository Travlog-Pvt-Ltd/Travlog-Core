import BaseConsumer from '../kafka/consumer.js';
import { registerConsumerList } from '../common/utils.js';
import { Blog } from './model.js';
import { processBlogTags } from './utils.js';

class ExtractTagsConsumer extends BaseConsumer {
    constructor() {
        super('extract-system-tags-group', 'extract-system-tags');
    }

    async start() {
        await this.setupConsumer(async (data) => {
            const blog = await Blog.findById(data._id)
                .select('title content tags')
                .populate([
                    { path: 'tags.places', select: 'name' },
                    { path: 'tags.activities', select: 'name' },
                ])
                .lean();
            await processBlogTags(blog);
        });
    }
}

const tagsConsumerList = [ExtractTagsConsumer];

registerConsumerList(tagsConsumerList);
