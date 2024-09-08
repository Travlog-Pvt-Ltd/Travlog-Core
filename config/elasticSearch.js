import { Client } from '@elastic/elasticsearch';

const getESClient = () => {
    const cloudId = process.env.ELASTIC_CLOUD_ID;
    const username = process.env.ELASTIC_USERNAME;
    const password = process.env.ELASTIC_PASSWORD;
    const client = new Client({
        cloud: {
            id: cloudId,
        },
        auth: {
            username: username,
            password: password,
        },
    });
    return client;
};

export const indices = {
    searchIndex: 'search-tag',
    profileIndex: 'search-profile',
};

export default getESClient;
