import log from 'npmlog';
import { Client } from '@elastic/elasticsearch';

const getESClient = () => {
    const node = process.env.ELASTIC_HOST;
    const username = process.env.ELASTIC_USERNAME;
    const password = process.env.ELASTIC_PASSWORD;
    try {
        const client = new Client({
            node,
            auth: {
                username: username,
                password: password,
            },
        });
        return client;
    } catch (error) {
        log.error('Error connecting to elasticsearch...');
        log.error(error);
    }
};

export const indices = {
    searchIndex: 'search-tag',
    profileIndex: 'search-profile',
};

export default getESClient;
